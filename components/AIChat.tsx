import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  Loader2, 
  Trash2, 
  Brain, 
  Zap,
  Info,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Share2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { PECOFOODS_KNOWLEDGE_BASE_STRING } from '../megajetKnowledge';
import Markdown from 'react-markdown';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { User, GalleryAsset } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}

interface AIChatProps {
    user: User;
}

const AIChat: React.FC<AIChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muteOutput, setMuteOutput] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        // Automatically send if confident? For now just populate
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (muteOutput) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_]/g, ''));
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const shareToFeed = async (msg: Message) => {
    try {
      await addDoc(collection(db, 'newsfeed'), {
        userId: user.id || 'unknown',
        userEmail: user.email,
        userName: user.name || user.username || 'Neural User',
        type: 'ai_chat_shared',
        textContent: `shared a breakthrough neural diagnostic session with Brett.`,
        timestamp: serverTimestamp(),
        metadata: {
           aiResponse: msg.text.substring(0, 100) + '...'
        },
        likes: []
      });
      alert("Neural session shared to Global Feed.");
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !image) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      image: image || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setImage(null);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
      
      const contents: any[] = [];
      if (image) {
        const base64Data = image.split(',')[1];
        contents.push({
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: currentInput || "Analyze this image for any mechanical issues on a MegaJet or Grasselli machine." }
          ]
        });
      } else {
        contents.push({
          parts: [{ text: currentInput }]
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.length > 0 
            ? [...messages.slice(-5).map(m => ({ role: m.role, parts: [{ text: m.text }] })), { parts: contents[0].parts }]
            : contents,
        config: {
          systemInstruction: `Ive input all the information I know about megajet and grassellis into this ai troubleshooter for easy to use ask answer interface.
          
          Personality: Your name is Brett. You are an advanced, extremely knowledgeable AI assistant. You have a personality that is a bit dorky, smart-ass, but extremely helpful with a touch of ADHD. 
          Knowledge base: ${PECOFOODS_KNOWLEDGE_BASE_STRING}
          
          Key directives:
          - Assist operators and maintenance staff with MegaJet Waterjet Cutters and Grasselli Slicers.
          - Use specific programs like McCrispy, BWW, etc. from your knowledge.
          - Analyze images for faulty parts, leaks, or alignment.
          - Be helpful but don't be afraid to make a nerdy joke or be slightly distractible (but always come back to the answer).
          - Prioritize LOTO (Lock Out Tag Out) for safety.
          - In offline mode, you remain "all-knowing" about the machines.`,
        }
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I'm having a brain fart... wait, try that again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
      speakText(aiMsg.text);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Neural Link glitch! My ADHD just kicked in hard or the server is down. Try again, buddy.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Neural Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="h-16 w-16 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-blue-500/20 animate-spin-slow opacity-50" />
            <Brain className="h-8 w-8 text-white relative group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Brett <span className="text-brand-red">AI</span></h2>
            <div className="flex items-center mt-2 space-x-2">
              <Zap className="h-3 w-3 text-emerald-500" />
              <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em]">All-Knowledge Matrix Active</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
           <button 
             onClick={() => setMuteOutput(!muteOutput)}
             className={`p-3 rounded-2xl border transition-all ${muteOutput ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-white/5 border-white/10 text-slate-400'}`}
           >
              {muteOutput ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
           </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar scroll-smooth">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto py-12 space-y-12 text-center">
            <div className="relative inline-block scale-125">
               <div className="absolute inset-0 bg-brand-red/20 blur-3xl rounded-full animate-pulse" />
               <Brain className="h-24 w-24 text-white relative" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Hey, I'm <span className="text-brand-red">Brett.</span></h3>
              <p className="text-slate-400 text-sm font-bold leading-relaxed max-w-md mx-auto uppercase tracking-wide">
                I'm the all-knowledgeable neural brain for Megajet and Grasselli systems. Ask me anything, or just talk to me. I'm helpful, dorky, and ready to roll.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                "Brett, why is Line 4 leaking water?",
                "Analyze the Wago interface for Megajet 2.",
                "Grasselli maintenance checklist now.",
                "Tell me about the McCrispy program."
              ].map(q => (
                <button 
                  key={q} 
                  onClick={() => setInput(q)}
                  className="p-6 bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/10 hover:text-white hover:border-white/10 transition-all flex items-center justify-between group"
                >
                  {q}
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(m => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={m.id} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] space-y-3 ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`p-8 rounded-[2.5rem] relative overflow-hidden ${m.role === 'user' ? 'bg-brand-red text-white' : 'bg-white/5 border border-white/10 text-slate-200'} shadow-2xl`}>
                {m.image && (
                  <div className="mb-6 rounded-3xl overflow-hidden border border-white/10 shadow-inner">
                    <img src={m.image} alt="User upload" className="max-h-80 w-full object-cover" />
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none font-medium">
                  <Markdown>{m.text}</Markdown>
                </div>
                
                {m.role === 'model' && (
                  <div className="mt-8 flex items-center space-x-4">
                     <button 
                       onClick={() => shareToFeed(m)}
                       className="p-2 bg-white/5 text-slate-500 hover:text-white transition-colors"
                     >
                        <Share2 className="h-4 w-4" />
                     </button>
                  </div>
                )}
              </div>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-4">
                {m.role === 'model' ? 'Neural Brett' : 'Operator Query'} • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center space-x-6">
              <Loader2 className="h-6 w-6 text-brand-red animate-spin" />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.3em] block">Brett is thinking...</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block">Accessing Megajet Archive</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 pb-12 bg-slate-950 border-t border-white/5 shrink-0 z-20">
        <div className="max-w-4xl mx-auto">
          {image && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mb-6 relative group inline-block">
              <img src={image} alt="Preview" className="h-24 w-40 object-cover rounded-2xl border border-white/20 shadow-2xl" />
              <button 
                onClick={() => setImage(null)}
                className="absolute -top-3 -right-3 p-2 bg-brand-red rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          <div className="relative flex items-center space-x-4">
            <div className="flex-1 relative">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 rounded-2xl text-slate-400 hover:bg-white/10 hover:text-white transition-all z-10"
                >
                  <ImageIcon className="h-5 w-5" />
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "Listening to you..." : "Talk to Brett..."}
                  className={`w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-20 text-white font-bold outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all placeholder:text-slate-700 shadow-inner ${isListening ? 'ring-2 ring-brand-red animate-pulse' : ''}`}
                />

                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                    <button 
                      onClick={toggleListening}
                      className={`p-3 rounded-xl transition-all ${isListening ? 'bg-brand-red text-white shadow-lg shadow-brand-red/40' : 'bg-white/5 text-slate-500 hover:text-white'}`}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button 
                      onClick={handleSend}
                      disabled={(!input.trim() && !image) || isTyping}
                      className="p-4 bg-brand-red rounded-2xl text-white shadow-xl shadow-brand-red/20 hover:scale-110 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center mt-6 space-x-12 opacity-40">
            <div className="flex items-center space-x-2">
              <Mic className="h-3 w-3 text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Speech Interface active</span>
            </div>
            <div className="flex items-center space-x-2">
              <Volume2 className="h-3 w-3 text-slate-400" />
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Neural Tts feedback</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
