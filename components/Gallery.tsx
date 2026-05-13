import React, { useState, useEffect } from 'react';
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
  Filter,
  Loader2,
  Cpu,
  Sparkles,
  Zap
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { User, GalleryAsset } from '../types';

interface GalleryProps {
    user: User;
}

const Gallery: React.FC<GalleryProps> = ({ user }) => {
    const [view, setView] = useState<'menu' | 'grid'>('menu');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [assets, setAssets] = useState<GalleryAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [building, setBuilding] = useState(false);

    useEffect(() => {
        if (!user.id) return;
        const q = query(collection(db, 'gallery_assets'), where('userId', '==', user.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as GalleryAsset[];
            setAssets(data);
            setLoading(false);
            
            // If no assets, trigger AI building logic
            if (data.length === 0 && !building) {
                buildInitialAssets();
            }
        });
        return () => unsubscribe();
    }, [user.id, building]);

    const buildInitialAssets = async () => {
        setBuilding(true);
        // Simulate Brett building assets
        const initialAssets: Omit<GalleryAsset, 'id'>[] = [
            { userId: user.id || 'unknown', title: 'Megajet Lane 1 High-Pressure Manifold', type: 'diagram', url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop', category: 'Diagrams', timestamp: serverTimestamp() },
            { userId: user.id || 'unknown', title: 'Grasselli NCL 4.2 Blade Configuration', type: 'model', url: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=2070&auto=format&fit=crop', category: '3D Models', timestamp: serverTimestamp() },
            { userId: user.id || 'unknown', title: 'Thermal Drift Pattern MJ-L4', type: 'scan', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop', category: 'Scans', timestamp: serverTimestamp() },
            { userId: user.id || 'unknown', title: 'Nozzle Alignment Delta Vector', type: 'diagram', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop', category: 'Diagrams', timestamp: serverTimestamp() },
            { userId: user.id || 'unknown', title: 'Cutter Arm Beta Fatigue Check', type: 'photo', url: 'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?q=80&w=1939&auto=format&fit=crop', category: 'Snaps', timestamp: serverTimestamp() },
        ];

        for (const asset of initialAssets) {
            try {
                await addDoc(collection(db, 'gallery_assets'), asset);
            } catch (error) {
                console.error("Error creating asset:", error);
            }
            await new Promise(r => setTimeout(r, 800)); // Stagger them
        }
        setBuilding(false);
    };

    const categories = [
      { id: 'Diagrams', name: 'Asset List', icon: Library, color: 'bg-blue-600' },
      { id: '3D Models', name: '3D Models', icon: Box, color: 'bg-indigo-600' },
      { id: 'Scans', name: 'Analysis Scans', icon: Zap, color: 'bg-brand-red' },
      { id: 'Snaps', name: 'Neural Snaps', icon: Camera, color: 'bg-emerald-500' },
    ];

    const filteredAssets = activeCategory 
        ? assets.filter(a => a.category === activeCategory)
        : assets;

    if (view === 'grid') {
        const cat = categories.find(c => c.id === activeCategory);
        return (
            <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
                <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
                    <div className="flex items-center space-x-6 text-white">
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full border border-white/5">
                            <ArrowLeft className="h-6 w-6" />
                        </motion.button>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{cat?.name || 'All Assets'}</h2>
                            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Neural Visual Archive Active</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto no-scrollbar pb-32">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {filteredAssets.map((asset, i) => (
                            <motion.div 
                                key={asset.id} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group relative aspect-square bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden"
                            >
                                <img src={asset.url} alt={asset.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <h4 className="text-xs font-black text-white uppercase tracking-tight mb-2 line-clamp-2">{asset.title}</h4>
                                    <div className="flex space-x-2">
                                        <button className="flex-1 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-white"><Maximize2 className="h-4 w-4" /></button>
                                        <button className="flex-1 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-center text-white"><Download className="h-4 w-4" /></button>
                                    </div>
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
            <div className="mb-12 flex justify-between items-start">
               <div>
                    <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">Visual <span className="text-brand-red">Assets</span></h2>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Multi-spectral Data Logging & Archive</p>
               </div>
               {building && (
                   <div className="flex items-center space-x-4 bg-brand-red/10 border border-brand-red/20 px-6 py-3 rounded-2xl">
                       <Loader2 className="h-5 w-5 text-brand-red animate-spin" />
                       <div className="flex flex-col">
                           <span className="text-[10px] font-black text-brand-red uppercase tracking-widest leading-none">Brett is building...</span>
                           <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Staging neural assets</span>
                       </div>
                   </div>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categories.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setActiveCategory(item.id);
                            setView('grid');
                        }}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex items-center space-x-8 text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{item.name}</h3>
                            <div className="flex items-center mt-3 text-slate-500">
                               <span className="text-[10px] font-black uppercase tracking-widest">{assets.filter(a => a.category === item.id).length} Neural Files</span>
                               <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="mt-12 bg-white/5 border border-white/5 p-10 rounded-[3rem]">
                <div className="flex items-center space-x-4 mb-6">
                    <Cpu className="h-6 w-6 text-brand-red" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Recent Intelligence Broadcasts</h3>
                </div>
                <div className="space-y-4">
                    {assets.slice(0, 3).map(asset => (
                        <div key={asset.id} className="flex items-center space-x-4 p-4 bg-black/20 rounded-2xl border border-white/5">
                            <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-brand-red" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">{asset.title}</h4>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Generated by Brett • {asset.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
