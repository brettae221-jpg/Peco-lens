import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library, 
  Box, 
  Video, 
  Camera, 
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Download,
  Share2,
  Trash2,
  Maximize2,
  Search,
  Filter
} from 'lucide-react';

type GalleryView = 'menu' | 'assets' | 'models' | 'videos' | 'snaps';

const Gallery: React.FC = () => {
    const [view, setView] = useState<GalleryView>('menu');

    const menuItems = [
      { id: 'assets', name: 'Asset List', icon: Library, color: 'bg-blue-600', submenus: ['Floor Map', 'Diagrams', 'Schematics', 'Export PDF'] },
      { id: 'models', name: '3D Models', icon: Box, color: 'bg-indigo-600', submenus: ['MegaJet 3D', 'Grasselli 3D', 'Exploded View', 'Annotated'] },
      { id: 'videos', name: 'Videos', icon: Video, color: 'bg-brand-red', submenus: ['Live Feed', 'Recorded Faults', 'Training Clips', 'Archive'] },
      { id: 'snaps', name: 'Snaps', icon: Camera, color: 'bg-emerald-500', submenus: ['AR Captures', 'Thermal Snaps', 'Vision Scans', 'User Library'] },
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
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Visual Intelligence Repository</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 rounded-full text-white border border-white/5"><Search className="h-5 w-5" /></motion.button>
               <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 rounded-full text-white border border-white/5"><Filter className="h-5 w-5" /></motion.button>
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
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="aspect-square bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">DATASET_NX_{2000 + i}</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase mb-4 tracking-tighter">TIMESTAMP: 2024-05-12 : 12:44</p>
                        <div className="flex space-x-2">
                           <button className="flex-1 h-10 bg-white/10 rounded-xl text-white hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/5"><Maximize2 className="h-4 w-4" /></button>
                           <button className="flex-1 h-10 bg-white/10 rounded-xl text-white hover:bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/5"><Download className="h-4 w-4" /></button>
                        </div>
                    </div>
                    <div className="h-full w-full flex items-center justify-center bg-slate-900 group-hover:scale-110 transition-transform duration-700">
                        <activeItem.icon className="h-12 w-12 text-slate-800" />
                    </div>
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
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">Visual <span className="text-pink-500">Assets</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Multi-spectral Data Logging & Archive</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as GalleryView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">{item.name}</h3>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                            <span>Open Archive</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Gallery;
