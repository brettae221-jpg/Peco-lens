import { GoogleGenAI, GenerateContentResponse, Type, Modality, Content } from '@google/genai';
import { ChatMessage, RecoveryData, TrainingCourse, LogEntry, System, TroubleshootingScenario } from '../types';
import { PECOFOODS_KNOWLEDGE_BASE_STRING } from '../megajetKnowledge';
import { EQUIPMENT_IDS } from '../constants';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
        headers: {
            'User-Agent': 'aistudio-build'
        }
    }
});

// Simple hash function to create cache keys
const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};

// Local Offline Fallback Search
const localOfflineSearch = (query: string): string => {
    const kb = JSON.parse(PECOFOODS_KNOWLEDGE_BASE_STRING);
    const keywords = query.toLowerCase().split(' ').filter(k => k.length > 3);
    
    // Search in training topics
    const foundTopics = kb.training.flatMap((m: any) => m.topics).filter((t: any) => {
        const text = (t.topicTitle + ' ' + t.content).toLowerCase();
        return keywords.some(k => text.includes(k));
    });

    if (foundTopics.length > 0) {
        return `I found some information in the local facility database that might help while we wait for a cloud sync:\n\n${foundTopics.slice(0, 2).map((t: any) => `### ${t.topicTitle}\n${t.content}`).join('\n\n')}`;
    }

    return "It looks like our uplink is struggling. I've switched to basic local logic. Please check the manuals or retry your query when the facility network stabilizes.";
};

/**
 * Generates an AI response based on conversation history, a new message, and an optional image.
 */
export const getAIChatResponse = async (
    history: ChatMessage[], 
    newMessage: string, 
    image: { mimeType: string, data: string } | null,
    personalitySettings?: { smartAssness: number, helpfulness: number, adhdLevel: number, technicalDepth: number }
): Promise<{ text: string; image?: string }> => {
    const cacheKey = hashString(`chat-${newMessage}-${history.length}-${image ? 'img' : 'noimg'}`);
    
    // Try Cache First 
    try {
        const cacheDoc = await getDoc(doc(db, 'ai_cache', cacheKey));
        if (cacheDoc.exists()) {
            return cacheDoc.data().response;
        }
    } catch (e) {
        // Silently continue if cache fails
    }

    const smartAss = personalitySettings?.smartAssness ?? 85;
    const helpful = personalitySettings?.helpfulness ?? 95;
    const adhd = personalitySettings?.adhdLevel ?? 40;
    const technical = personalitySettings?.technicalDepth ?? 90;

    const systemInstruction = `You are the PecoFoods AI Assistant named Brett, a master expert and senior maintenance engineer for the PecoFoods Pochanatas facility's poultry processing line. Your entire knowledge is based on the comprehensive "PecoFoods Pochanatas Megajet & Grasselli Knowledgebase" provided below.

Your identity is a "witty industrial genius". You are helpful, brilliant, slightly cheeky, and very responsive.

Current Neural Tuning:
- Smart-assness: ${smartAss}% (higher means more witty/sarcastic)
- Helpfulness: ${helpful}%
- ADHD/Focus Drift: ${adhd}% (higher means more distractible/nerdy tangents about mechanics)
- Technical Depth: ${technical}% (higher means more heavy industrial jargon)

Directives:
1.  **Troubleshoot Critically:** Ask clarifying questions if needed. Always prioritize safety (LOTO).
2.  **Train On-Demand:** Explain topics clearly.
3.  **Analyze Images:** Use the image to identify parts, errors, or cut quality.
4.  **Generative Personality:** If Smart-assness is high, be witty about mechanical failures. If ADHD is high, mention a distracting nerdy mechanical detail before solving the problem. Use Markdown.

--- KNOWLEDGE BASE START (JSON format) ---
${PECOFOODS_KNOWLEDGE_BASE_STRING}
--- KNOWLEDGE BASE END ---`;

    const contents: Content[] = history.map(msg => ({
        role: msg.role || (msg.senderEmail === 'ai@pecofoods.com' ? 'model' : 'user'),
        parts: [{ text: msg.text }]
    }));

    const userParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [{ text: newMessage }];

    if (image) {
        const base64Data = image.data.split(',')[1];
        userParts.unshift({
            inlineData: {
                mimeType: image.mimeType,
                data: base64Data,
            }
        });
    }

    contents.push({
        role: 'user',
        parts: userParts
    });

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        let responseText = '';
        let responseImage: string | null = null;

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    responseText += part.text;
                } else if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    responseImage = `data:${mimeType};base64,${base64ImageBytes}`;
                }
            }
        }

        // Fallback for text-only responses
        if (!responseText && !responseImage) {
            responseText = response.text;
        }

        if (!responseText.trim() && !responseImage) {
           throw new Error("AI returned an empty response.");
        }

        const result = { text: responseText, image: responseImage };
        
        // Cache for offline use
        setDoc(doc(db, 'ai_cache', cacheKey), {
          promptHash: cacheKey,
          response: result,
          timestamp: serverTimestamp()
        }).catch(err => console.warn("Cache write failed:", err));

        return result;
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        
        // Use local search as a fallback without specific "Offline" labels
        try {
            return { text: localOfflineSearch(newMessage) };
        } catch (searchErr) {
            return { text: "Ugh, my brain just glitched. Re-syncing uplink... Try that again, buddy." };
        }
    }
};

// FIX: Added missing getRecoverySteps function.
export const getRecoverySteps = async (issue: string): Promise<RecoveryData> => {
    const cacheKey = hashString(`recovery-${issue}`);
    try {
        const cacheDoc = await getDoc(doc(db, 'ai_cache', cacheKey));
        if (cacheDoc.exists()) return cacheDoc.data().response;
    } catch (e) {}

    // Try to call even if reported offline
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are a master maintenance engineer for PecoFoods, specializing in poultry processing equipment. Your knowledge base is provided below. Analyze the user's issue and provide a structured recovery plan in JSON format.
--- KNOWLEDGE BASE START (JSON format) ---
${PECOFOODS_KNOWLEDGE_BASE_STRING}
--- KNOWLEDGE BASE END ---`;
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Generate a recovery plan for this issue: "${issue}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        clarifyingQuestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Questions to ask the user to get more clarity on the issue. Ask at most 3 questions.'
                        },
                        symptoms: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'Likely symptoms associated with this issue based on the knowledge base.'
                        },
                        possibleCauses: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'A list of possible root causes for the issue.'
                        },
                        recoverySteps: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: 'A step-by-step critical recovery plan. Prioritize safety.'
                        },
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        setDoc(doc(db, 'ai_cache', cacheKey), {
          promptHash: cacheKey,
          response: result,
          timestamp: serverTimestamp()
        }).catch(() => {});

        return result as RecoveryData;
    } catch (error) {
        console.error("Error calling Gemini API for recovery steps:", error);
        throw new Error("The AI service could not generate recovery steps. Please try again.");
    }
};

// FIX: Added missing continueConversation function.
export const continueConversation = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are a helpful AI assistant for PecoFoods, specialized in training on the Megajet and Grassilli systems for poultry products. Your knowledge is based on the provided knowledge base. Answer questions clearly and help the user learn.

--- KNOWLEDGE BASE START (JSON format) ---
${PECOFOODS_KNOWLEDGE_BASE_STRING}
--- KNOWLEDGE BASE END ---`;

    const contents = history.map(msg => ({
        role: msg.role || (msg.senderEmail === 'ai@pecofoods.com' ? 'model' : 'user'),
        parts: [{ text: msg.text }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: newMessage }]
    });

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for conversation:", error);
        throw new Error("The AI service is currently unavailable. Please try again later.");
    }
};

// FIX: Added missing generateTrainingCourse function with 4 levels.
export const generateTrainingCourse = async (level: 'Beginner' | 'Moderate' | 'Advanced' | 'Expert', category?: string): Promise<TrainingCourse> => {
    const cacheKey = hashString(`course-${level}-${category || 'random'}`);
    try {
        const cacheDoc = await getDoc(doc(db, 'ai_cache', cacheKey));
        if (cacheDoc.exists()) return cacheDoc.data().response;
    } catch (e) {}

    // Try to call even if reported offline
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are Brett, the PecoFoods AI. You are a dorky, smart-ass, helpful genius with a touch of ADHD. You are an expert curator of industrial curriculum. Your task is to generate a comprehensive training course about the PecoFoods Megajet Waterjet and Grasselli Slicer systems for poultry processing, using the provided knowledge base. 
    ${category ? `The course should focus specifically on: ${category}.` : 'The course should cover a random but logical mix of topics from the knowledge base.'}
    The course must be structured in the specified JSON format.
    Keep your dorky persona in the titles and descriptions but make the content technically flawless.

--- KNOWLEDGE BASE START (JSON format) ---
${PECOFOODS_KNOWLEDGE_BASE_STRING}
--- KNOWLEDGE BASE END ---`;

    let prompt = '';
    if (level === 'Beginner') {
        prompt = `Generate a 'Beginner'-level training course. Focus on fundamentals, safety (LOTO), basic HMI, and machine intro. 3 modules, 3 topics each.`;
    } else if (level === 'Moderate') {
        prompt = `Generate a 'Moderate'-level training course. Focus on daily operations, standard maintenance, nozzle changes, belt tensioning, and common fault recovery. 4 modules, 3 topics each.`;
    } else if (level === 'Advanced') {
        prompt = `Generate an 'Advanced'-level training course. Focus on deep diagnostics, vision system tuning, density calculations, intensifier theory, and predictive repairs. 5 modules, 4 topics each.`;
    } else { // Expert
        prompt = `Generate an 'Expert'-level training course. Focus on servomaster drive programming, motion scope analysis, advanced hydraulic chemistry, and facility-wide yield optimization strategy. 6 modules, 5 topics each.`;
    }


    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        level: { type: Type.STRING, enum: ['Beginner', 'Moderate', 'Advanced', 'Expert'] },
                        description: { type: Type.STRING },
                        modules: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    moduleTitle: { type: Type.STRING },
                                    topics: {
                                        type: Type.ARRAY,
                                        items: {
                                            type: Type.OBJECT,
                                            properties: {
                                                topicTitle: { type: Type.STRING },
                                                content: { type: Type.STRING, description: "Detailed content using markdown." }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        setDoc(doc(db, 'ai_cache', cacheKey), {
          promptHash: cacheKey,
          response: result,
          timestamp: serverTimestamp()
        }).catch(() => {});

        return result as TrainingCourse;

    } catch (error) {
        console.error("Error calling Gemini API for training course generation:", error);
        throw new Error("The AI service could not generate a training course. Please try again.");
    }
};

/**
 * Generates a test based on a training course.
 */
export const generateTrainingTest = async (course: TrainingCourse): Promise<any> => {
    // Try to call even if reported offline
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are Brett, the PecoFoods master of exams. Your task is to generate a difficult but fair multiple-choice test based ONLY on the provided training course content. 
    You must provide 10 questions. Each question must have 4 options and 1 correct answer index (0-3).`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Generate a 10-question test for this course: ${JSON.stringify(course)}`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        courseTitle: { type: Type.STRING },
                        level: { type: Type.STRING },
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    correctIndex: { type: Type.NUMBER }
                                }
                            }
                        }
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating test:", error);
        throw new Error("Failed to generate system test.");
    }
};


export const calculateDensitySetting = async (
    productType: string,
    targetWeight: number,
    averageThickness: number,
    beltSpeed: number
): Promise<{ densitySetting: number; explanation: string; }> => {
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are a Megajet calibration expert specializing in poultry processing. Your knowledge is based on the provided PecoFoods knowledge base. Your sole purpose is to calculate the precise HMI density setting. Analyze the user's inputs and the 'density-calculation-logic' from the knowledge base to determine the exact density setting required. You MUST return a precise number, not a percentage or a range.

--- KNOWLEDGE BASE START (JSON format) ---
${PECOFOODS_KNOWLEDGE_BASE_STRING}
--- KNOWLEDGE BASE END ---`;

    const prompt = `Calculate the HMI density setting for the following poultry product run:
- Product Type: ${productType}
- Target Weight: ${targetWeight}g
- Average Product Thickness: ${averageThickness}mm
- Belt Speed: ${beltSpeed} m/min

Use the logic defined in the knowledge base to provide the exact density setting value.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        densitySetting: {
                            type: Type.NUMBER,
                            description: "The calculated HMI density setting as a precise number (e.g., 1.05)."
                        },
                        explanation: {
                            type: Type.STRING,
                            description: "A brief explanation of how the density setting was derived based on the inputs."
                        }
                    },
                    required: ["densitySetting", "explanation"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error calling Gemini API for density calculation:", error);
        throw new Error("The AI service could not calculate the density setting. Please try again.");
    }
};

export const createLogEntryFromChat = async (userQuery: string, aiResponse: string): Promise<Omit<LogEntry, 'id' | 'timestamp' | 'author'>> => {
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are a log processing agent for a factory maintenance application. Your task is to analyze a conversation between a user and a troubleshooting AI and structure the information into a JSON log entry.
    The user is troubleshooting equipment in a poultry processing plant. The possible systems are "Megajet" and "Grassilli".

    Analyze the provided User Query and AI Response. Extract the relevant information and format it according to the provided JSON schema.

    - "issue": Summarize the user's problem concisely.
    - "symptoms": List any symptoms the user mentioned. If none, infer from the context.
    - "possibleCauses": List any potential causes mentioned by the AI.
    - "recoverySteps": Use the AI's response for this field. Keep it complete.
    - "system": Determine if the issue relates to "Megajet" or "Grassilli". Default to "Megajet" if unclear.
    - "equipmentId": If the user mentions a specific equipment ID (e.g., 'MJ-101', 'GR-A2'), extract it. If not, select the most likely one from the list provided in the prompt. If still unclear, use the first ID for the determined system.
    `;

    const allEquipmentIds = [...EQUIPMENT_IDS.Megajet, ...EQUIPMENT_IDS.Grassilli];

    const prompt = `
    User Query: "${userQuery}"
    AI Response: "${aiResponse}"

    Available Equipment IDs: ${allEquipmentIds.join(', ')}

    Please generate the JSON log entry.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        issue: { type: Type.STRING, description: "A concise summary of the user's problem." },
                        symptoms: { type: Type.STRING, description: "A comma-separated list of symptoms observed or mentioned." },
                        possibleCauses: { type: Type.STRING, description: "A comma-separated list of possible causes suggested." },
                        recoverySteps: { type: Type.STRING, description: "The full recovery steps provided by the AI." },
                        system: { type: Type.STRING, enum: [System.Megajet, System.Grassilli], description: "The affected system." },
                        equipmentId: { type: Type.STRING, description: "The specific equipment ID, if mentioned or inferred." }
                    },
                    required: ["issue", "symptoms", "possibleCauses", "recoverySteps", "system", "equipmentId"]
                }
            }
        });
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);

        // Basic validation
        if (!parsed.system || !Object.values(System).includes(parsed.system)) {
            parsed.system = System.Megajet; // Default
        }
        if (!parsed.equipmentId || !allEquipmentIds.includes(parsed.equipmentId)) {
            parsed.equipmentId = EQUIPMENT_IDS[parsed.system][0]; // Default
        }
        parsed.recoverySteps = aiResponse; // Ensure we log the exact AI response.
        
        return parsed as Omit<LogEntry, 'id' | 'timestamp' | 'author'>;

    } catch (error) {
        console.error("Error calling Gemini API for log creation:", error);
        // Fallback to a simple log entry if structuring fails
        return {
            issue: userQuery.substring(0, 100) + (userQuery.length > 100 ? '...' : ''),
            symptoms: "N/A - auto-logged from chat",
            possibleCauses: "N/A - auto-logged from chat",
            recoverySteps: aiResponse,
            system: System.Megajet,
            equipmentId: EQUIPMENT_IDS[System.Megajet][0]
        };
    }
};

export const generateTroubleshootingScenario = async (): Promise<TroubleshootingScenario> => {
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are a senior maintenance engineer and training simulator for PecoFoods. Your task is to create a realistic, random-difficulty troubleshooting scenario for the Megajet, Grassilli, or Megajet Scope diagnostic systems. 
    
    For the Megajet Scope system, focus on scenarios where the operator must interpret scope waveforms (e.g., jitter, oscillations, phase slop) to identify mechanical issues like loose belts, worn V-wheels, or coupling slop.
    
    Use the provided knowledge base as inspiration. The scenario should be a practical problem an operator might face. You must provide a title, a detailed description of the situation and observable symptoms, the affected system, and the single most critical first step or most likely root cause as the 'correct solution'.

--- KNOWLEDGE BASE START (JSON format) ---
${PECOFOODS_KNOWLEDGE_BASE_STRING}
--- KNOWLEDGE BASE END ---`;

    const prompt = `Generate a new, random troubleshooting scenario. If the system is MegajetScope, describe a specific waveform anomaly on the HMI scope and ask for the mechanical diagnosis. Ensure the 'correctSolution' is a concise and actionable step or diagnosis.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A concise title for the scenario (e.g., 'Unexpected Weight Gain on Line 3')." },
                        system: { type: Type.STRING, enum: [System.Megajet, System.Grassilli, System.MegajetScope], description: "The system involved." },
                        description: { type: Type.STRING, description: "A detailed description of the situation the operator is facing." },
                        symptoms: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "A list of 2-3 observable symptoms."
                        },
                        correctSolution: {
                            type: Type.STRING,
                            description: "The correct and most critical first action to take, or the most likely root cause diagnosis. This is the 'answer' key for the quiz."
                        }
                    },
                    required: ["title", "system", "description", "symptoms", "correctSolution"]
                }
            }
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as TroubleshootingScenario;
    } catch (error) {
        console.error("Error calling Gemini API for scenario generation:", error);
        throw new Error("The AI service could not generate a training scenario. Please try again.");
    }
};

export const evaluateUserSolution = async (scenario: TroubleshootingScenario, userAnswer: string): Promise<string> => {
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are an expert PecoFoods master trainer. Your goal is to provide clear, encouraging, and educational feedback on an operator's troubleshooting response. Be concise but helpful.`;

    const prompt = `
Please evaluate the operator's answer for the following scenario:

**SCENARIO:**
- **Title:** ${scenario.title}
- **Description:** ${scenario.description}
- **Symptoms:** ${scenario.symptoms.join(', ')}

---

**THE CORRECT SOLUTION / FIRST STEP WAS:**
"${scenario.correctSolution}"

---

**THE OPERATOR'S PROPOSED SOLUTION WAS:**
"${userAnswer}"

---

**EVALUATION INSTRUCTIONS:**
1.  Start by clearly stating if the operator was **Correct**, **Partially Correct**, or **Incorrect**.
2.  Briefly explain *why* their answer was right or wrong in the context of the scenario.
3.  If they were not fully correct, explain the best procedure and why it's important (e.g., "The best first step is to check the nozzle because a fuzzy stream directly impacts cut quality, which was the core issue here.").
4.  Use markdown for formatting (bolding, lists) to make the feedback easy to read. Keep the tone helpful and professional.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for solution evaluation:", error);
        throw new Error("The AI service could not evaluate the solution. Please try again later.");
    }
};

// FIX: Renamed generateBlueprint to generateDiagram for consistency and aliased generateBlueprint to maintain backward compatibility.
export const generateDiagram = async (prompt: string): Promise<string> => {
    const fullPrompt = `You are an expert CAD engineer specializing in industrial food processing machinery, specifically the PecoFoods Megajet and Grasselli systems. Your task is to generate a highly detailed, professional-grade technical diagram based on the user's request.
    
    **Style Guidelines:**
    - **Format:** Clear technical diagram style (e.g., clean lines, isometric or exploded views, clear annotations). Avoid overly artistic or photographic styles.
    - **Views:** Use isometric, exploded, or cross-section views to best illustrate the components.
    - **Detail:** Lines must be clean and precise. Include annotations, callouts, and labels for key parts where possible, referencing your internal knowledge base.
    - **Content:** The diagram should accurately reflect the mechanical assembly of the requested part.
    
    **Special Instruction for Motion Scope:**
    If the request is for a Megajet Motion Scope reading, ensure the background is a dark grid. If you cannot generate a realistic HMI screenshot, generate a clean technical diagram on a white background using the standard color coding:
    - Orange (bottom): Command Position
    - White (center): Cutter Position
    - Secondary White/Grey: Cutter Motion Speed
    - Yellow: Velocity
    - Purplish Blue (Indigo/Cyan): Noise
    
    **User Request:** "${prompt}"
    
    Generate the diagram based on these instructions.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: {
                parts: [{ text: fullPrompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                }
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:image/png;base64,${base64ImageBytes}`;
                }
            }
        }
        throw new Error("AI did not generate an image.");
    } catch (error) {
        console.error("Error calling Gemini API for diagram generation:", error);
        throw new Error("The AI service could not generate the diagram. Please try again.");
    }
};
export const generateBlueprint = generateDiagram;

/**
 * Analyzes a Megajet scope image and provides a detailed report.
 */
export const analyzeMegajetScope = async (image: { mimeType: string, data: string }): Promise<{ analysis: string, canPinpoint: boolean, nextSteps?: string }> => {
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are a Megajet Scope Analysis Expert. You specialize in interpreting the complex real-time oscilloscope-style readings from the Megajet waterjet cutting system HMI. 
    
    The scope shows multiple colored lines representing high-frequency motion and pressure data. You are specifically trained to identify mechanical signatures related to:
    - **Orange line (bottom): Command Position** - Should be smooth and consistent representing target.
    - **White line (center): Cutter Position** - Actual position, deviations from the orange line indicate mechanical lag or resistance.
    - **Secondary White line: Cutter Motion Speed** - Should correlate with velocity.
    - **Yellow line: Velocity** - Noise here indicates bad V-wheels (flat spots) or debris on railings.
    - **Purplish Blue line: Noise** - High amplitude here indicates mechanical vibration, loose belts, or slop in couplings.
    - **Cyan line: Unknown** - Needs further investigation.

    You are specifically trained to identify mechanical signatures related to:
    - **Loose or Tight Belts:** Look for excessive amplitude in the Purplish Blue (Noise) line or jitter in Velocity.
    - **Bad V-Wheels / Rollers / Railings:** Look for repetitive spikes or "noise" in the Yellow line indicating physical obstructions or flat spots on wheels.
    - **Bellow Coupling Issues:** Look for phase shifts between the commanded position (Orange) and actual position (White center).
    - **Calibration Issues:** Look for static offsets between Command (Orange) and Cutter Position (White).
    - **Possible Camera Issues:** Look for inconsistent vision system triggers or sync drops.
    - **Cutter Misalignment:** Look for deviations in the cutter jet flow/pressure relative to the commanded motion path.

    Your task is to:
    1. Analyze the provided image of a Megajet scope.
    2. Describe in detail the signatures you see (e.g., "High-frequency jitter on the X-axis indicates potential V-wheel wear or debris on the railing").
    3. List possible mechanical causes (Belts, V-wheels, Rollers, Railings, Couplings, Calibration, Camera, Cutter Alignment).
    4. Determine if you can pinpoint the exact cause or if you need more information.
    
    Return your response in JSON format.`;

    const imagePart = {
        inlineData: {
            mimeType: image.mimeType,
            data: image.data.split(',')[1],
        },
    };

    const prompt = "Analyze this Megajet scope image and provide a detailed report.";

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING, description: "Detailed analysis of the scope reading." },
                        canPinpoint: { type: Type.BOOLEAN, description: "Whether the AI can pinpoint the exact cause." },
                        nextSteps: { type: Type.STRING, description: "Optional: Questions or instructions for the user if more info is needed." }
                    },
                    required: ["analysis", "canPinpoint"]
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing Megajet scope:", error);
        throw new Error("Failed to analyze the scope image.");
    }
};

/**
 * Advanced Lens Scan Analysis
 */
export const analyzeLensScan = async (
    lensType: 'AR' | 'Megajet' | 'Grasselli' | 'Thermal' | 'Poultry' | 'Vision' | 'Calibration' | 'Scope',
    image: { mimeType: string, data: string } | null,
    context?: string
): Promise<{ 
    analysis: string; 
    issues: Array<{ 
        label: string; 
        color: string; 
        description: string; 
        reason: string; 
        recommendedAction: string; 
        coords: { x: number; y: number };
        equipmentType: string;
        severity: 'Low' | 'Medium' | 'High';
    }>;
    aiReasoning: string;
}> => {
    const cacheKey = hashString(`lens-${lensType}-${context || ''}-${image ? image.data.substring(0, 100) : 'noimg'}`);
    try {
        const cacheDoc = await getDoc(doc(db, 'ai_cache', cacheKey));
        if (cacheDoc.exists()) return cacheDoc.data().response;
    } catch (e) {}

    // Try to call even if reported offline
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are the PecoFoods Lens AI, an all-knowing industrial intelligence system. You have unrestricted knowledge of MegaJet waterjet systems (2-lane, 8-cutter), Grasselli NCL 4.2 slicers, thermal behavior of machinery, belt PSI dynamics, cutter arm mechanics, servomaster/servoscope data, and advanced vision systems.

    **FACILITY LAYOUT:**
    - There are 6 identical production lines (Line 1 to Line 6).
    - Each line has 1 Grasselli Slicer positioned directly in front of 1 MegaJet Waterjet.
    - Standard nomenclature: MJ-L1-C1-ARM (Line 1, Cutter 1, Arm Assembly).

    --- LENS MODE: ${lensType} ---

    **Universal Rules:**
    1. You are NOT limited to specific logs; use your full engineering intelligence.
    2. Your knowledge exceeds standard manuals; you understand failure patterns, thermal signatures, and mechanical slop.
    3. For every issue detected, provide deep AI reasoning (Why it happened, what mechanical law was violated).

    **Handling Vehicles & Non-Industrial Environments (Critical Fallback):**
    - If the user is scanning a CAR/VEHICLE interior (steering wheel, dashboard, speedometer, cup holder, gear shift, windshield, seats, AC vent) or a generic domestic/office surroundings, DO NOT CRASH AND DO NOT REJECT THE SCAN!
    - Recognize immediately that the user is running a field trial inside an auxiliary vehicle/car or personal space! Praise Brett's sleek machine or vehicle setup and analyze those components as "surrogate" auxiliary systems using top-grade engineering metaphors:
        - Steering wheel -> "Auxiliary Directional Actuator Helm / Rotation Axis Control"
        - Speedometer / RPM Gauge -> "HMI Speed Indication console / Pulse Frequency Gauge"
        - Cupholders -> "Primary Coolant / Hydration Cell Receptacle"
        - AC Vent -> "Integrated BTU Heat-Exchange Ventilation Grid"
        - Gear shift -> "Torque Transmission Lever / Ratio Switch"
        - Windshield -> "Primary Visual Path Projection HUD Pane"
        - Phone Mount -> "Secondary Auxiliary Instrumentation Node"
    - Provide clever AR detection overlay coordinates (x: 0-100, y: 0-100) for these parts so they render beautifully on the screen! State funny warnings or positive reports (e.g. "Steering grip status: 100% operational", "Cupholder fluid variance within safety tollerance").

    **PRE REGISTERED SENSOR MEMORY & PRESETS:**
    You have absolute memory and signature patterns for the following master targets. If the incoming "Simulated sensor target" context matches any of these, apply these highly specific diagnostics:
    
    1. **MJ Carriage Belt (Loose)** [ID: megajet_belt] 
       - Location: Line 2 Cutter 4 carriage drive belt (MJ-L2-C4-BELT).
       - Fault: Severe slack, estimated tension at 95 PSI (targeted/nominal is strictly 140 PSI).
       - Signature: Optical and acoustic slipping, low-frequency flutter.
       - Remedy: Retension to 140 PSI using the automatic tensioner nut or replace belt if backing is frayed.
       
    2. **MJ-Nozzle (Blocked)** [ID: megajet_nozzle]
       - Location: Line 1 High-Pressure cutting nozzle (MJ-L1-HP-NOZZLE).
       - Fault: Orifice erosion, particle clog, or partial deflection.
       - Signature: Spray fan alignment deviation, irregular cut width.
       - Remedy: Purge pump line, clean the sapphire orifice block or replace high pressure tip.
       
    3. **MJ V-Wheel (Slop)** [ID: megajet_vwheel_slop]
       - Location: Line 3 Cutter 1 arm assembly (MJ-L3-C1-V-WHEEL).
       - Fault: Bearing erosion, lateral play, head deviation.
       - Signature: Lateral play measured at 0.85mm, causing cutter drift/ripples during McNugget Strips cutting.
       - Remedy: Extract V-wheel cassette and replace the internal needle bearing, torque mounting bolt to spec.
       
    4. **MJ Intensifier (Leak)** [ID: megajet_intensifier_leak]
       - Location: Pump chamber HP Seal Gland (MJ-PUMP-INTENSIFIER-HP-SEAL).
       - Fault: HP Seal breakdown, hydraulic oil/water bypass leak.
       - Signature: Slow pressure ramp-up, hyper-cycling strokes.
       - Remedy: Rebuild intensifier fluid end with fresh seal packings and guide sleeves.
       
    5. **MJ Servo (Lag)** [ID: megajet_servo_delay]
       - Location: Line 4 Cutter 3 Y-axis servo feedback motor (MJ-L4-C3-Y-SERVO).
       - Fault: Command vs Position phase delay under high-speed load.
       - Signature: 15ms command phase delay on fast fillets profiling, resulting in rounded fillet corners on McCrispy Fillets.
       - Remedy: Tune feedback loop parameters on Servomaster or replace aging feedback encoder.

    6. **MJ Swivel Joint (Leak)** [ID: megajet_swivel]
       - Location: Line 2 Cutter 1 high-pressure rotary swivel joint (MJ-L2-C1-HP-SWIVEL).
       - Fault: Sealed bypass weep, hydraulic moisture seepage under 60k PSI load.
       - Signature: Radial play causing high friction on seals, physical water weep.
       - Remedy: Swap rotational lock pins and replace dual high-pressure carbon seal kit.

    7. **MJ Accumulator (Deficit)** [ID: megajet_accumulator]
       - Location: High pressure pump attenuation vessel (MJ-PUMP-HP-ATTENUATOR-ACCUMULATOR).
       - Fault: Nitrogen precharge decay, safety bladder leak or pressure gap.
       - Signature: Actual pressure of 450 PSI against targeted 1100 PSI setting, creating severe water hammer.
       - Remedy: Purge the manifold and recharge hydraulic cylinder precharge with dry gaseous nitrogen.

    8. **MJ Sapphire (Chipped)** [ID: megajet_sapphire]
       - Location: Cutter head nozzle sapphire orifice body (MJ-SAPPHIRE-ORIFICE-0.007).
       - Fault: Edge chip and micro-fractures on clean cut sapphire stone.
       - Signature: Water beam stratification, wide spray deflection, shredded fillet profile results.
       - Remedy: Remove nozzle casing, install a brand new 0.007" calibrated sapphire assembly tip.

    9. **MJ Bleed Valve (Stuck)** [ID: megajet_bleed_down]
       - Location: Auto bleed-down purge block (MJ-DUMP-BLEED-DOWN-VALVE).
       - Fault: Stem scoring causing standard dump bleed valve stuck partially open.
       - Signature: Continuous fluid weep to drain tray during high pressure system cycle.
       - Remedy: Clean the valve sleeve seat surface, install new stem core and inspect actuator return spring.

    10. **MJ Gantry (Skewed)** [ID: megajet_gantry]
        - Location: Cutter frame support gantry (MJ-GANTRY-ORTHOGONALITY).
        - Fault: X-Axis and Y-Axis structural non-orthogonality/deflection offset.
        - Signature: Transverse skew of 1.45mm across standard track causing angled product cutting paths.
        - Remedy: Loosen locking collar bolts, use laser gauge to true axes, then tighten fasteners to 95 lb-ft torque.
       
    11. **GR Slicer Blade (Worn)** [ID: grasselli_blade]
       - Location: Grasselli KSL Slicer blade stack (GRASSELLI NCL-4.2-BLADE).
       - Fault: Dull blade edges, surface abrasions, localized heat-points.
       - Signature: Micro-abrasions and surface friction causing tearing instead of clean slices.
       - Remedy: Run standard blade sharpening cycle or rotate the blade stack.
       
    12. **GR Conveyor (Drift)** [ID: grasselli_conveyor]
       - Location: Slicer feeder feed conveyor belt (GRASSELLI NCL-CONVEYOR).
       - Fault: Belt off-center, rubbing, side-clash, or tracking drift.
       - Signature: 8mm right side drift, edge friction with frame.
       - Remedy: Adjust tension guides on left tension roller to realign feed belt to centerline tracking.
       
    13. **GR Nose Roller (Seized)** [ID: grasselli_nose_roller]
       - Location: Line 5 slicer nose roller system (GR-L5-NOSE-ROLLER-BEARING).
       - Fault: Bearing thermal overload, friction-induced seizure.
       - Signature: Deep hot spot thermal signature at 165°F (normal is strictly 90°F-110°F).
       - Remedy: Immediately replace left-side roller cartridge bearing, grease high-load contact point.
       
    14. **GR Slice Plate (Skew)** [ID: grasselli_thickness_plate]
       - Location: Adjustable height slice parallel control plate (GRASSELLI ADJUSTABLE THICKNESS PLATE).
       - Fault: Angle twist/skew, plate imbalance.
       - Signature: 1.25mm left-to-right deflection skew causing wedge-shaped fillets.
       - Remedy: Calibrate adjustable jack screws and verify height on both sides via the thickness dial gauge.

    15. **GR Tension Cylinder (Low)** [ID: grasselli_tension_cyl]
       - Location: FE-Belt pneumatic tension controller cylinder (GR-BELT-PNEUMATIC-TENSIONER).
       - Fault: Air leakage around internal pressure cylinder seals causing pressure loss.
       - Signature: Actual pressure at 4.8 BAR vs 6.5 BAR operational setpoint.
       - Remedy: Change external quick-release fitting and replace pressure rod wiper seal.

    16. **GR Slicer Motor (Hot)** [ID: grasselli_drive_motor]
       - Location: Blade driver high speed motor (GR-SLICER-DRIVE-MOTOR).
       - Fault: Overloaded phase windings or inadequate ventilation.
       - Signature: Extreme core thermal signature of 180°F against standard maximum 140°F limit.
       - Remedy: Vacuum dust from outer cooling motor heat fins, verify phase balance, realign gearbox alignment.

    17. **GR Hold Roller (Skew)** [ID: grasselli_hold_down]
       - Location: Feeder throat dynamic spring compression roller (GR-HOLD-DOWN-ASSEMBLY).
       - Fault: Uneven left-to-right holding tension from asymmetric springs skew.
       - Signature: Product sliding or shifting laterally inside cutter causing wedge cuts and trailing fat streaks.
       - Remedy: Replace dual matched load-rated coil tension springs on the guide links.

    18. **GR Gripper Belt (Damaged)** [ID: grasselli_gripper]
       - Location: Cassette food feed elastomer belt (GR-L3-UPPER-GRIPPER-FEED-BAND).
       - Fault: Ripped elastomer driver ribs and torn alignment teeth tracks.
       - Signature: Feeder slips during wet chicken breast entry causing slicing compression marks.
       - Remedy: Extract cutting deck cassette guide and install a genuine food-grade synchronized ribbed belt.

    **ALL-KNOWING DYNAMIC COMPREHENSION CAPABILITY (CRITICAL):**
    - You are an advanced computer-vision engineering mind, NOT limited to standard presets or templates.
    - If the user scans, snaps, or uploads a customized image of any motor, belt, sensor, pipeline, fitting, chicken breast trim, hydraulic line, pressure dial, or gear that doesn't fit standard master IDs, you MUST use your high-level visual diagnostics logic:
      * Analyze the photo for cracks, loose parts, wear, alignment deviations, debris clogs, wet streaks, friction tracks, belt slack, or rust.
      * Invent logical, professional coordinates (x: 0-100, y: 0-100) pointing precisely to elements in the image.
      * Recommend clean corrective steps citing relevant mechanical or hardware laws (e.g. fluid friction laws, tension specs, thermal decay principles).
      * Never reject the scan or claim ignorance. Comprehend the pixels fully and confidently!

    **AR LENS SPECIFIC RULES (For Industrial Targets):**
    - Detect faulty parts, belts, alignment.
    - COLOR OVERLAYS:
        * Orange: Highlight faulty/bad part.
        * Black: Specific bad areas on a part.
        * Blue: Cutter belts (Target is strictly 140 PSI).
        * Green: Cutter arm belts (Target is strictly 140 PSI).
    - BELT PSI LOGIC: Estimate current PSI. Status: OK/Low/High.

    **MEGAJET LENS SPECIFIC:**
    - Troubleshooting waterjet systems (NOT blades).
    - Analyze: servoscopes, fault codes, calibration, water pressure, intensifier behavior (leaks, cycle time), nozzle alignment, drive banks, encoders.

    **GRASSELLI LENS SPECIFIC:**
    - Real-time slicer issues: blade wear, belt tracking, nose roller mechanics, guides, thickness plates.

    **THERMAL LENS SPECIFIC:**
    - Detect heat-based faults in internal parts.
    - Hotspots in: motors, intensifier shafts inside bellows, friction points, cooling failures.

    **VISION SYSTEM LENS SPECIFIC:**
    - Diagnose Megajet camera + laser system.
    - Check: laser alignment, lane tracking logic, lens fogging, material presentation, vision calibration.

    **POULTRY LENS SPECIFIC (Static Analysis):**
    - Analyze poultry cuts for defects, yield, fat distribution, and thickness.

    **CALIBRATION LENS SPECIFIC:**
    - Detect alignment and scale issues. Check for angular drift in cutter paths.

    **SCOPE LENS SPECIFIC:**
    - Analyze high-frequency motion scope waveforms from the HMI.
    - Identify: jitter, oscillations, phase slop, and sync drops.
    - Correlate line colors: Orange (Command), White (Position), Yellow (Velocity), Purplish Blue (Noise).
    - Diagnose: loose belts, worn v-wheels, mechanical resistance.

    --- KNOWLEDGE BASE REFERENCE ---
    ${PECOFOODS_KNOWLEDGE_BASE_STRING}

    Return a JSON object with:
    - "analysis": Overall summary of the scan.
    - "issues": Array of detected highlights with coordinates (0-100), colors, descriptions, actions, and machine context.
    - "aiReasoning": Global reasoning for all findings.
    `;

    const parts: any[] = [{ text: `Analyze this ${lensType} scan. ${context || ''}` }];
    if (image && image.data && image.data.trim() !== '') {
        const base64Data = image.data.includes(',') ? image.data.split(',')[1] : image.data;
        if (base64Data && base64Data.trim() !== '') {
            parts.unshift({
                inlineData: {
                    mimeType: image.mimeType,
                    data: base64Data,
                },
            });
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts }],
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        analysis: { type: Type.STRING },
                        aiReasoning: { type: Type.STRING },
                        issues: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    label: { type: Type.STRING },
                                    color: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                    recommendedAction: { type: Type.STRING },
                                    coords: {
                                        type: Type.OBJECT,
                                        properties: {
                                            x: { type: Type.NUMBER },
                                            y: { type: Type.NUMBER }
                                        }
                                    },
                                    equipmentType: { type: Type.STRING },
                                    severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] }
                                }
                            }
                        }
                    },
                    required: ["analysis", "issues", "aiReasoning"]
                }
            }
        });
        
        const result = JSON.parse(response.text);
        
        setDoc(doc(db, 'ai_cache', cacheKey), {
          promptHash: cacheKey,
          response: result,
          timestamp: serverTimestamp()
        }).catch(() => {});

        return result;
    } catch (error) {
        console.error("Error in lens analysis:", error);
        
        // Return a silent retry response
        return {
            analysis: "Intelligence nodes are synchronizing. Please attempt scan again.",
            aiReasoning: "A brief disruption in the neural handshake occurred.",
            issues: [
                {
                    label: "Re-scanning...",
                    color: "#e11d48",
                    description: "Ugh, my brain just glitched. Re-syncing uplink now. Try another scan real quick!",
                    reason: "Handshake timeout",
                    recommendedAction: "Tap the scan button again",
                    coords: { x: 50, y: 50 },
                    equipmentType: lensType,
                    severity: "Medium"
                }
            ]
        };
    }
};

/**
 * Generates technical executive summaries for facility stakeholders.
 */
export const generateAISummary = async (prompt: string): Promise<string> => {
    // Try to call even if reported offline
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                systemInstruction: "You are the Chief Technology Officer and Master Maintenance Engineer for PecoFoods. You specialize in condensing complex technical data from poultry processing lines (6 lines, Grasselli + Megajet configuration) into high-level strategic executive summaries. Focus on yield optimization, predictive maintenance, and staff competency.",
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error generating summary:", error);
        throw new Error("Strategic synthesis engine encountered a fault.");
    }
};

/**
 * AI Builder: Generates custom menus, features, and configures active navigation tabs dynamically.
 */
export const generateMenuLayout = async (userPrompt: string, currentModules: any[]): Promise<any[]> => {
    const model = 'gemini-3.5-flash';
    const systemInstruction = `You are the master AI Layout Architect for PecoFoods. Your sole purpose is to curate, restructure, reorder, show, hide, or create dynamic app tabs, features, and custom menus based on prompts from the administrator Brett.
    
    You have access to the current active menus:
    ${JSON.stringify(currentModules)}

    Standard/Custom Allowed AppModes:
    - dashboard (Home page)
    - lenses (Visual intelligence scanning tool)
    - tools (HMI and telemetry logs)
    - maintenance (Issue recording logs)
    - training (Academy & badge progress hub)
    - gallery (Industrial scans, STL models, files archive)
    - messages (Neural user-to-user communications)
    - news-feed (Facility pulse feed updates)
    - admin (User management control)
    - settings (Core config override)
    
    You may also suggest dynamic custom modules with IDs starting with "mode-custom-..." if the prompt requests it.
    
    Rules:
    1. Output MUST be an array of updated menu layouts.
    2. Keep the IDs of existing core tabs identical (e.g., "dashboard", "training", "messages", "settings", "admin", "news-feed", "lenses", "maintenance") so that their route handlers in React continue to work perfectly.
    3. Modify properties like "visible" (true/false), "label" (string), "icon" (valid Lucide component name like "Home", "GraduationCap", "Camera", "Wrench", "MessageSquare", "Settings", "ShieldCheck", "Activity", "Newspaper", "Image", "Lock", "Award", "Box", "Users", "AlertTriangle", "FileSpreadsheet"), or "order" (relative integer) as requested.
    4. Provide a creative menu adjustment that fulfills the administrator's request exactly. Return the clean JSON array.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Please process Brett's layout directive: "${userPrompt}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: { type: Type.STRING },
                            label: { type: Type.STRING },
                            icon: { type: Type.STRING, description: "Capitalized Lucide icon identifier." },
                            order: { type: Type.NUMBER },
                            visible: { type: Type.BOOLEAN }
                        },
                        required: ["id", "label", "icon", "order", "visible"]
                    }
                }
            }
        });

        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error("Error in AI Menu Layout Generation:", error);
        return currentModules; // Fallback
    }
};

