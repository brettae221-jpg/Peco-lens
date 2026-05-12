import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  History, 
  Map, 
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Cpu,
  Zap,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, updateDoc, doc, setDoc } from 'firebase/firestore';

type MachinesView = 'menu' | 'active' | 'history' | 'health';

interface MachineData {
  id: string;
  name: string;
  status: 'Operational' | 'Maintenance' | 'Fault';
  health: number;
  runtime: number;
  sync: string;
}

const Machines: React.FC = () => {
    const [view, setView] = useState<MachinesView>('menu');
    const [machines, setMachines] = useState<MachineData[]>([]);

    const menuItems = [
      { id: 'active', name: 'Active Units', icon: Activity, color: 'bg-emerald-600', submenus: ['Live Telemetry', 'Manual Control', 'Sync Status', 'Diagnostics'] },
      { id: 'history', name: 'History', icon: History, color: 'bg-blue-600', submenus: ['Fault Log', 'Runtime History', 'Part Replacement', 'Export CSV'] },
      { id: 'health', name: 'Health Map', icon: Map, color: 'bg-indigo-600', submenus: ['Facility View', 'Heat Map', 'Critical Nodes', 'Optimization'] },
    ];

    useEffect(() => {
        const q = query(collection(db, 'machines'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            // Seed initial data if empty
            const initialMachines: MachineData[] = [1, 2, 3, 4, 5, 6].map(i => ({
              id: `L0${i}`,
              name: `Main Production Line 0${i}`,
              status: 'Operational',
              health: 99.4 - (i * 0.1),
              runtime: 442 + i,
              sync: 'REAL'
            }));
            initialMachines.forEach(m => {
               setDoc(doc(db, 'machines', m.id), m);
            });
          } else {
            const fetched: MachineData[] = [];
            snapshot.forEach(doc => fetched.push(doc.data() as MachineData));
            setMachines(fetched.sort((a, b) => a.id.localeCompare(b.id)));
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'machines');
        });

        return () => unsubscribe();
    }, []);

    const toggleStatus = async (machine: MachineData) => {
      const nextStatus = machine.status === 'Operational' ? 'Maintenance' : 'Operational';
      try {
        await updateDoc(doc(db, 'machines', machine.id), {
          status: nextStatus
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `machines/${machine.id}`);
      }
    };

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
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Industrial Asset Registry</p>
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
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {machines.map((machine, i) => (
                  <motion.div 
                    key={machine.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/2 border border-white/5 p-10 rounded-[3rem] group"
                  >
                    <div className="flex items-start justify-between mb-10">
                       <div className="flex items-center space-x-6">
                          <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center text-white font-black text-2xl shadow-2xl transition-all group-hover:scale-110 ${
                            machine.status === 'Operational' ? 'bg-emerald-600 shadow-emerald-500/20' : 'bg-brand-red shadow-brand-red/20'
                          }`}>
                             {machine.id}
                          </div>
                          <div>
                             <h4 className="text-2xl font-black text-white uppercase tracking-tight">{machine.name}</h4>
                             <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${
                               machine.status === 'Operational' ? 'text-emerald-500' : 'text-brand-red'
                             }`}>Status: {machine.status}</p>
                          </div>
                       </div>
                       <div className={`p-4 rounded-2xl border transition-colors ${
                         machine.status === 'Operational' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-brand-red/10 border-brand-red/20 text-brand-red'
                       }`}>
                          <ShieldCheck className="h-6 w-6" />
                       </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 mb-10">
                       <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                          <p className="text-[10px] font-black text-slate-600 uppercase mb-2">Health</p>
                          <p className="text-xl font-black text-emerald-500">{machine.health}%</p>
                       </div>
                       <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                          <p className="text-[10px] font-black text-slate-600 uppercase mb-2">Runtime</p>
                          <p className="text-xl font-black text-white">{machine.runtime}H</p>
                       </div>
                       <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5">
                          <p className="text-[10px] font-black text-slate-600 uppercase mb-2">Sync</p>
                          <p className="text-xl font-black text-blue-500">{machine.sync}</p>
                       </div>
                    </div>

                    <button 
                      onClick={() => toggleStatus(machine)}
                      className="w-full h-16 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl border border-white/5 transition-all flex items-center justify-center space-x-3"
                    >
                       <Zap className={`h-4 w-4 ${machine.status === 'Operational' ? 'text-yellow-500' : 'text-white'}`} />
                       <span>{machine.status === 'Operational' ? 'Initiate Maintenance' : 'Set to Operational'}</span>
                    </button>
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
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">System <span className="text-brand-red">Nodes</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Industrial Asset Monitoring & Telemetry</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as MachinesView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">{item.name}</h3>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                            <span>Examine Units</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Machines;
