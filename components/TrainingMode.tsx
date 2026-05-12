import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  BookOpen, 
  Map, 
  ShieldCheck, 
  FileText, 
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Activity,
  Award,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { generateTrainingCourse } from '../services/geminiService';
import { TrainingCourse } from '../types';
import Markdown from 'react-markdown';

type TrainingView = 'menu' | 'beginner' | 'advanced' | 'cert' | 'records' | 'topic';

const TrainingMode: React.FC = () => {
    const [view, setView] = useState<TrainingView>('menu');
    const [course, setCourse] = useState<TrainingCourse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTopic, setActiveTopic] = useState<{ moduleTitle: string, topic: any } | null>(null);

    const views = [
      { id: 'beginner', name: 'Beginner Route', icon: BookOpen, color: 'bg-emerald-500', submenus: ['Safety Basics', 'Machine Overview', 'Daily Checks', 'Quiz Level 1'] },
      { id: 'advanced', name: 'Advanced Route', icon: Map, color: 'bg-indigo-600', submenus: ['Hydraulic Depth', 'Vision Sync', 'Encoder Tuning', 'Quiz Level 2'] },
      { id: 'cert', name: 'Certification', icon: Award, color: 'bg-brand-red', submenus: ['Current Status', 'Req Renewal', 'Exam Portal', 'Verified Badges'] },
      { id: 'records', name: 'Records', icon: FileText, color: 'bg-slate-700', submenus: ['My Transcripts', 'Team Progress', 'Audit Logs', 'Export'] },
    ];

    const loadCourse = async (level: 'Beginner' | 'Advanced') => {
      setLoading(true);
      setError(null);
      setView(level.toLowerCase() as TrainingView);
      try {
        const result = await generateTrainingCourse(level);
        setCourse(result);
      } catch (err: any) {
        setError(err.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (view === 'topic' && activeTopic) {
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md text-white">
             <div className="flex items-center space-x-6">
               <button onClick={() => setView(course?.level.toLowerCase() as TrainingView)} className="p-3 bg-white/5 rounded-full">
                 <ArrowLeft className="h-5 w-5" />
               </button>
               <div>
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{activeTopic.moduleTitle}</h3>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{activeTopic.topic.topicTitle}</h2>
               </div>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-12 no-scrollbar pb-32">
             <div className="max-w-3xl mx-auto prose prose-invert prose-slate">
                <Markdown>{activeTopic.topic.content}</Markdown>
             </div>
          </div>
        </div>
      );
    }

    if (view === 'beginner' || view === 'advanced') {
      const activeItem = views.find(v => v.id === view)!;
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0 text-white">
            <div className="flex items-center space-x-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full border border-white/5">
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{activeItem.name}</h2>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Neural Knowledge Transfer Active</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 no-scrollbar pb-32 text-white">
             {loading ? (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                   <Loader2 className="h-12 w-12 animate-spin mb-6" />
                   <p className="font-black uppercase tracking-widest text-xs">Generating Neural Pathways...</p>
                </div>
             ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                   <AlertCircle className="h-16 w-16 text-brand-red mb-6" />
                   <h3 className="text-2xl font-black uppercase mb-4">Transmission Error</h3>
                   <p className="text-slate-400 mb-8 max-w-md">{error}</p>
                   {!navigator.onLine && (
                     <div className="px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-500 font-black uppercase text-[10px] tracking-widest mb-6">
                        Offline Mode: Academy Server Unavailable
                     </div>
                   )}
                   <button onClick={() => setView('menu')} className="px-8 py-4 bg-white/5 border border-white/5 rounded-2xl font-black uppercase text-xs tracking-widest">Return to Academy</button>
                </div>
             ) : course ? (
                <div className="max-w-5xl mx-auto space-y-12">
                   <div className="bg-white/5 rounded-[3rem] p-12 border border-white/5">
                      <h3 className="text-5xl font-black tracking-tighter mb-4 text-white uppercase">{course.title}</h3>
                      <p className="text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">{course.description}</p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {course.modules.map((module, mIdx) => (
                         <div key={mIdx} className="space-y-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] sticky top-0 bg-slate-950/80 backdrop-blur py-4 z-10">{module.moduleTitle}</h4>
                            <div className="space-y-3">
                               {module.topics.map((topic, tIdx) => (
                                  <button 
                                    key={tIdx} 
                                    onClick={() => {
                                      setActiveTopic({ moduleTitle: module.moduleTitle, topic });
                                      setView('topic');
                                    }}
                                    className="w-full text-left p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group flex items-center justify-between"
                                  >
                                     <div className="flex items-center space-x-4">
                                        <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-white/10 group-hover:text-white transition-colors">
                                           {tIdx + 1}
                                        </div>
                                        <p className="text-sm font-black uppercase tracking-tight text-white">{topic.topicTitle}</p>
                                     </div>
                                     <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                  </button>
                               ))}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             ) : null}
          </div>
        </div>
      );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12">
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">System <span className="text-brand-red">Curriculum</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Knowledge Base Expansion Layers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {views.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (item.id === 'beginner') loadCourse('Beginner');
                          else if (item.id === 'advanced') loadCourse('Advanced');
                          else setView(item.id as TrainingView);
                        }}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">{item.name}</h3>
                        
                        <div className="space-y-2 mb-8">
                           {item.submenus.slice(0, 3).map(s => (
                             <div key={s} className="flex items-center text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                <div className="h-1 w-1 rounded-full bg-slate-700 mr-2" />
                                {s}
                             </div>
                           ))}
                        </div>

                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                            <span>Begin Route</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default TrainingMode;
