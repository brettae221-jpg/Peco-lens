import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PMList from './PMList';
import { 
  ClipboardList, 
  Package, 
  Box, 
  ShoppingCart, 
  FileText, 
  Calendar, 
  GraduationCap,
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Activity,
  Search,
  CheckCircle2,
  Trash2,
  Download
} from 'lucide-react';

type MaintenanceView = 'menu' | 'pm_list' | 'part_list' | 'inventory' | 'order' | 'log' | 'sunday' | 'training';

const Maintenance: React.FC = () => {
    const [view, setView] = useState<MaintenanceView>('menu');

    const menuItems = [
      { id: 'pm_list', name: 'PM List', icon: ClipboardList, color: 'bg-orange-500', submenus: ['View Tasks', 'Open Task', 'Mark Complete', 'Reschedule'] },
      { id: 'part_list', name: 'Part List', icon: Package, color: 'bg-blue-500', submenus: ['Search Parts', 'View 3D Models', 'Compatibility', 'Export'] },
      { id: 'inventory', name: 'Inventory', icon: Box, color: 'bg-emerald-500', submenus: ['Current Stock', 'Low Stock Alert', 'Stock In', 'Stock Out'] },
      { id: 'order', name: 'Order Parts', icon: ShoppingCart, color: 'bg-brand-red', submenus: ['Create Order', 'Track Shipment', 'History', 'Budget View'] },
      { id: 'log', name: 'Maintenance Log', icon: FileText, color: 'bg-purple-600', submenus: ['Fault History', 'Repair Log', 'AI Analysis', 'Export'] },
      { id: 'sunday', name: 'Open Sunday List', icon: Calendar, color: 'bg-slate-700', submenus: ['Week 12 Plan', 'Assign Team', 'Status Map', 'Final Review'] },
      { id: 'training', name: 'Training', icon: GraduationCap, color: 'bg-indigo-600', submenus: ['Beginner Route', 'Advanced Route', 'Certification', 'Records'] },
    ];

    if (view === 'pm_list' || view === 'sunday') {
      return (
        <div className="h-full flex flex-col bg-slate-950">
          <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full text-white border border-white/5">
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{view === 'pm_list' ? 'Predictive Maintenance' : 'Sunday PM Registry'}</h2>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <PMList />
          </div>
        </div>
      );
    }

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
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Maintenance Hub Layer Active</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md px-8 py-4 flex space-x-4 overflow-x-auto hide-scrollbar border-b border-white/5 shrink-0">
            {activeItem.submenus.map(sub => (
              <button key={sub} className="flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-500 border border-white/5 hover:text-white transition-all">
                {sub}
              </button>
            ))}
          </div>

          <div className="flex-1 p-10 flex items-center justify-center">
             <div className="text-center">
                <div className={`p-10 rounded-[3rem] ${activeItem.color} mx-auto mb-8 shadow-2xl shadow-black/40`}>
                   <activeItem.icon className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">{activeItem.name} Interface</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                  Connecting to the secure facility maintenance network. Awaiting authorization for real-time data sync.
                </p>
                <div className="mt-12 w-64 h-2 bg-white/5 rounded-full mx-auto overflow-hidden">
                   <motion.div 
                    animate={{ x: [-256, 256] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className={`h-full w-1/4 ${activeItem.color}`}
                   />
                </div>
             </div>
          </div>
        </div>
      );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12">
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">Machine <span className="text-orange-500">Care</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Predictive Upkeep & Integrity Systems</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as MaintenanceView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex items-center space-x-8 text-left hover:bg-white/10 transition-all shadow-2xl"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{item.name}</h3>
                            <div className="flex items-center mt-3 text-slate-500">
                               <span className="text-[10px] font-black uppercase tracking-widest">{item.submenus.length} Operations</span>
                               <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Maintenance;
