
import React, { useState } from 'react';
import { 
  Download, 
  Printer, 
  Sparkles, 
  FileSearch, 
  Shield, 
  Globe, 
  Database,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LogEntry, TrainingCourse, Blueprint } from '../types';
import { generateAISummary } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

interface ExportCenterProps {
  logs: LogEntry[];
  trainingCourses: TrainingCourse[];
  blueprints: Blueprint[];
}

export const ExportCenter: React.FC<ExportCenterProps> = ({ logs, trainingCourses, blueprints }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<'recovery' | 'training' | 'infrastructure'>('recovery');

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Generate a comprehensive technical executive summary for PecoFoods operators and maintenance teams.
      Topic: ${selectedTopic}
      Context: 
      Logs: ${JSON.stringify(logs)}
      Training: ${JSON.stringify(trainingCourses)}
      Blueprints: ${JSON.stringify(blueprints)}
      
      Format the response in clean, professional Markdown with headers, bullet points, and a "Strategic Recommendations" section.
      Focus on recent trends, critical failure points, and skill gaps identified.`;
      
      const result = await generateAISummary(prompt);
      setSummary(result);
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
      <div className="p-8 bg-slate-900/50 border-b border-white/5 flex items-center justify-between print:hidden">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-14 bg-brand-red rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-red/20 transform rotate-3">
            <Share2 className="text-white h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Knowledge Export Center</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Neural Intelligence Compilation</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-6 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            <Printer className="h-4 w-4" />
            <span>Print Package</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* AI Intelligence Panel */}
          <div className="bg-slate-900 rounded-[3rem] border border-white/10 overflow-hidden shadow-3xl print:hidden">
            <div className="p-10 border-b border-white/5 bg-gradient-to-br from-brand-red/10 to-transparent">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-brand-red">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Intelligence Engine</span>
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Automated Executive Summary</h3>
                  <p className="text-slate-500 text-sm font-medium max-w-xl">
                    Compile recent facility logs, training progress, and technical drawings into a refined executive document using Generative AI.
                  </p>
                </div>
                <div className="flex flex-col space-y-2 min-w-[200px]">
                  <select 
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value as any)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-white font-bold text-xs uppercase tracking-widest outline-none focus:border-brand-red transition-all"
                  >
                    <option value="recovery">Recovery Analysis</option>
                    <option value="training">Training Assessment</option>
                    <option value="infrastructure">System Infrastructure</option>
                  </select>
                  <button 
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="w-full h-14 bg-brand-red hover:bg-brand-red/90 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-brand-red/20 flex items-center justify-center space-x-3 transition-all"
                  >
                    {isGenerating ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Synthesize Findings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-10 bg-black/20 min-h-[400px]">
              <AnimatePresence mode="wait">
                {summary ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="prose prose-invert prose-brand max-w-none"
                  >
                    <MarkdownRenderer content={summary} />
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 py-20">
                    <FileSearch className="h-20 w-20 opacity-20" />
                    <p className="font-bold text-xs uppercase tracking-[0.3em]">No summary generated yet</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-50">Select a topic and begin synthesis</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Infrastructure Overview - Print Visible */}
          <div className="bg-white rounded-[3rem] p-12 text-slate-900 space-y-12 shadow-2xl hidden print:block">
            <div className="flex justify-between items-center border-b-4 border-slate-900 pb-8">
              <div className="space-y-1">
                <h1 className="text-5xl font-black uppercase tracking-tighter">PECO<span className="text-brand-red">FOODS</span></h1>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em]">Intelligence Export Package</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generated On</p>
                <p className="font-bold">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            {summary && (
              <div className="space-y-6">
                <h2 className="text-2xl font-black uppercase tracking-tight border-l-8 border-brand-red pl-6">Executive Summary</h2>
                <div className="prose prose-slate max-w-none">
                  <MarkdownRenderer content={summary} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <span className="text-2xl font-black">{logs.length}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Incident Logs</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="h-16 w-16 bg-brand-red rounded-2xl flex items-center justify-center text-white">
                  <span className="text-2xl font-black">{trainingCourses.length}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Courses</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center space-y-3 text-center">
                <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <span className="text-2xl font-black">{blueprints.length}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Blueprints</p>
              </div>
            </div>

            <div className="pt-20 text-center opacity-20 flex flex-col items-center">
               <Globe className="h-12 w-12 mb-4" />
               <p className="text-[8px] font-black uppercase tracking-[1em]">Secure Infrastructure Node / Peco Foods Inc</p>
            </div>
          </div>

          {/* Stats for Mobile/App View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
            <div className="bg-slate-900/50 border border-white/5 p-10 rounded-[3rem] space-y-6">
              <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center space-x-2">
                <Database className="h-5 w-5 text-brand-red" />
                <span>Node Statistics</span>
              </h4>
              <div className="space-y-4">
                {[
                  { label: 'Total Incident Record', count: logs.length, color: 'bg-brand-red' },
                  { label: 'Academy Modules', count: trainingCourses.length, color: 'bg-blue-500' },
                  { label: 'Technical Diagrams', count: blueprints.length, color: 'bg-emerald-500' }
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                    <div className="flex items-center space-x-3">
                       <span className="text-white font-black">{stat.count}</span>
                       <div className={`h-2 w-2 rounded-full ${stat.color} animate-pulse`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-red to-brand-red/60 p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl shadow-brand-red/20 group hover:scale-[1.02] transition-all duration-500 cursor-pointer">
              <div className="space-y-2">
                <Shield className="h-10 w-10 text-white/50 mb-4" />
                <h4 className="text-3xl font-black uppercase tracking-tighter leading-tight">Secure Network Protocol</h4>
                <p className="text-white/70 text-sm font-bold uppercase tracking-widest">End-to-End Encryption Active</p>
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 mt-8">
                Facility Poch-019-X
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExportCenter;
