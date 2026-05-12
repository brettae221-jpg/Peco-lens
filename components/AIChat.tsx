import React, { useState, useRef, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { PECOFOODS_KNOWLEDGE_BASE_STRING } from '../megajetKnowledge';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setInput('');
    setImage(null);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY });
      
      const contents: any[] = [];
      
      // We'll use a simplified chat history or just the current context
      // For a better experience, we could send some recent history
      
      if (image) {
        const base64Data = image.split(',')[1];
        contents.push({
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Data } },
            { text: input || "Analyze this image for any mechanical issues on a MegaJet or Grasselli machine." }
          ]
        });
      } else {
        contents.push({
          parts: [{ text: input }]
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.length > 0 
            ? [...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })), { parts: contents[0].parts }]
            : contents,
        config: {
          systemInstruction: `You are the PecoFoods Neural Troubleshooting AI. 
          Expert knowledge base: ${PECOFOODS_KNOWLEDGE_BASE_STRING}
          
          Your goal is to assist operators and maintenance staff with MegaJet Waterjet Cutters and Grasselli Slicers.
          Use the provided knowledge base for specific part numbers, troubleshooting steps, and programs like McCrispy, BWW, etc.
          If an image is provided, analyze it for leaks, debris, wear, or alignment issues.
          Be concise, professional, and prioritize safety (LOTO - Lock Out Tag Out).
          If you don't know something based on the knowledge base, advise escalating to maintenance.`,
        }
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text || "I'm sorry, I couldn't generate a response. Please check the system diagnostics.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Neural Link Warning: Communication timeout. Please verify system connectivity or check the Admin override panel.",
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
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="h-16 w-16 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center relative group">
            <Brain className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Neural <span className="text-brand-red">AI</span></h2>
            <div className="flex items-center mt-2 space-x-2">
              <Zap className="h-3 w-3 text-emerald-500" />
              <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em]">MegaJet & Grasselli Specialist Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar scroll-smooth">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto py-12 space-y-12 text-center">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-brand-red/20 blur-3xl rounded-full" />
               <Brain className="h-24 w-24 text-white relative animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Awaiting <span className="text-brand-red">Input</span></h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-md mx-auto">
                Upload a capture of the issue or describe the system anomaly. Specialized troubleshooting for all 6 MegaJet and Grasselli units.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                "How do I fix an A12 Actuator fault on Megajet 3?",
                "My McCrispy Fillets are underweight, help.",
                "Grasselli belt is slipping on Line 4.",
                "Identify this part in the image."
              ].map(q => (
                <button 
                  key={q} 
                  onClick={() => setInput(q)}
                  className="p-6 bg-white/5 border border-white/5 rounded-3xl text-xs font-bold text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/10 transition-all flex items-center justify-between group"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={m.id} 
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] space-y-3 ${m.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div className={`p-6 rounded-[2rem] ${m.role === 'user' ? 'bg-brand-red text-white' : 'bg-white/5 border border-white/10 text-slate-200'} shadow-2xl shadow-black/20`}>
                {m.image && (
                  <div className="mb-4 rounded-2xl overflow-hidden border border-white/10">
                    <img src={m.image} alt="User upload" className="max-h-64 w-full object-cover" />
                  </div>
                )}
                <div className="prose prose-invert prose-sm max-w-none">
                  <Markdown>{m.text}</Markdown>
                </div>
              </div>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest px-4">
                {m.role === 'model' ? 'Neural AI' : 'Operator Request'} • {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center space-x-4">
              <Loader2 className="h-5 w-5 text-brand-red animate-spin" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Synthesizing Response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 pb-12 bg-slate-950/80 backdrop-blur-3xl border-t border-white/5 shrink-0 z-20">
        <div className="max-w-4xl mx-auto">
          {image && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mb-4 relative group">
              <img src={image} alt="Preview" className="h-20 w-32 object-cover rounded-xl border border-white/20" />
              <button 
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 p-1.5 bg-brand-red rounded-full text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </motion.div>
          )}

          <div className="relative flex items-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute left-4 p-3 bg-white/5 rounded-2xl text-slate-400 hover:bg-white/10 hover:text-white transition-all"
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
              placeholder="Ask for MegaJet or Grasselli support..."
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-20 text-white font-bold outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all placeholder:text-slate-600 shadow-inner"
            />

            <button 
              onClick={handleSend}
              disabled={(!input.trim() && !image) || isTyping}
              className="absolute right-4 p-4 bg-brand-red rounded-2xl text-white shadow-xl shadow-brand-red/20 hover:scale-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center mt-6 space-x-6">
            <div className="flex items-center space-x-2">
              <Info className="h-3 w-3 text-slate-600" />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Image Analysis Enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <Brain className="h-3 w-3 text-slate-600" />
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Knowledge Context: Grounded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
