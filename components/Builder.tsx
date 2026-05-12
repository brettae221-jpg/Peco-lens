import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Layers, 
  BarChart3, 
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Zap,
  Layout,
  Play,
  Save,
  Trash2,
  RefreshCw,
  Search
} from 'lucide-react';

type BuilderView = 'menu' | 'training' | 'course' | 'analytics';

const Builder: React.FC = () => {
    const [view, setView] = useState<BuilderView>('menu');

    const menuItems = [
      { id: 'training', name: 'Training Builder', icon: Wrench, color: 'bg-yellow-600', submenus: ['New Module', 'Edit Scenario', 'Import Asset', 'Export SCORM'] },
      { id: 'course', name: 'Course Designer', icon: Layers, color: 'bg-orange-600', submenus: ['Curriculum', 'Certification', 'Quiz Logic', 'Prerequisites'] },
      { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'bg-blue-600', submenus: ['Pass Rates', 'Time on Task', 'Skill Matrix', 'User Reports'] },
    ];

    if (view !== 'menu') {
      const activeItem = menuItems.find(i => i.id === view)!;
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full text-white border border-white/5">
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{activeItem.name}</h2>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Instructional Intelligence Forge</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <motion.button whileTap={{ scale: 0.9 }} className="px-6 py-2.5 bg-yellow-500 rounded-full text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl shadow-yellow-500/20">
                  <Play className="h-4 w-4 mr-2" />
                  COMPILE
               </motion.button>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md px-8 py-4 flex space-x-4 overflow-x-auto hide-scrollbar border-b border-white/5 shrink-0">
            {activeItem.submenus.map(sub => (
              <button key={sub} className="flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-500 border border-white/5 hover:text-white transition-all">
                {sub}
              </button>
            ))}
          </div>

          <div className="flex-1 p-10 overflow-y-auto no-scrollbar pb-32">
             <div className="bg-white/5 border border-white/5 rounded-[3rem] p-12 border-l-4 border-l-yellow-500 mb-12">
                 <div className="flex items-center space-x-6 mb-10 text-white">
                    <Zap className="h-10 w-10 text-yellow-500" />
                    <div>
                        <h4 className="text-2xl font-black uppercase tracking-tight">AI ARCHITECT</h4>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Natural Language Logic Expansion</p>
                    </div>
                 </div>
                 
                 <div className="bg-black/40 rounded-[2rem] p-8 border border-white/5 mb-10">
                    <p className="text-slate-400 font-medium leading-relaxed italic">
                        "E.g.: Generate a 10-step module for Grasselli Blade Alignment using thermal data markers."
                    </p>
                 </div>

                 <div className="flex space-x-4">
                    <input 
                      type="text" 
                      placeholder="Input Directive..."
                      className="flex-1 h-20 bg-white/5 rounded-[2rem] border border-white/5 px-10 text-white font-black uppercase tracking-widest outline-none focus:border-yellow-500/50 transition-all"
                    />
                    <button className="h-20 px-12 bg-yellow-500 text-slate-950 font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-2xl">
                       GENERATE
                    </button>
                 </div>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(idx => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 bg-white/2 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all cursor-pointer group"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Layout className="h-6 w-6 text-slate-500" />
                    </div>
                    <h5 className="font-black text-white uppercase mb-2">MODULE_NX_0{idx}</h5>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Last Update: 2D AGO</p>
                  </motion.div>
                ))}
             </div>
          </div>
        </div>
      );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12">
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">System <span className="text-yellow-500">Forge</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Architectural Expansion & Content Design</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as BuilderView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">{item.name}</h3>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                            <span>Examine Core</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Builder;
