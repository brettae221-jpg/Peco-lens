import React, { useState, useEffect, useRef } from 'react';
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
  Filter,
  Image as ImageIcon,
  Camera,
  Loader2,
  CheckCircle2,
  XCircle,
  Smartphone,
  Info
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, updateDoc, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

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
    const [activeSubView, setActiveSubView] = useState<string>('Live Telemetry');
    const [machines, setMachines] = useState<MachineData[]>([]);
    const [uploading, setUploading] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [selectedWago, setSelectedWago] = useState<string | null>(null);
    const [wagoName, setWagoName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const menuItems = [
      { id: 'active', name: 'Active Units', icon: Activity, color: 'bg-emerald-600', submenus: ['Live Telemetry', 'Manual Control', 'Sync Status', 'Diagnostics'] },
      { id: 'history', name: 'History Records', icon: History, color: 'bg-blue-600', submenus: ['Fault Log', 'Runtime History', 'Part Replacement', 'Export CSV'] },
      { id: 'health', name: 'Health Matrix', icon: Map, color: 'bg-indigo-600', submenus: ['Facility View', 'Heat Map', 'Critical Nodes', 'Optimization'] },
    ];

    useEffect(() => {
        const q = query(collection(db, 'machines'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          if (snapshot.empty) {
            const initialMachines: MachineData[] = [1, 2, 3, 4, 5, 6].map(i => ({
              id: `L0${i}`,
              name: `Production Node 0${i}`,
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

    const handleWagoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setAnalysisStep(1);

        // Simulation
        setTimeout(() => {
            setAnalysisStep(2);
            setTimeout(() => {
                setAnalysisStep(3);
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setSelectedWago(ev.target?.result as string);
                    setAnalysisStep(4);
                };
                reader.readAsDataURL(file);
            }, 1000);
        }, 1500);
    };

    const finalizeNode = async () => {
        if (!wagoName) return;
        setUploading(true);
        setAnalysisStep(5);
        
        try {
            const newNode: MachineData = {
                id: `W${Math.floor(Math.random() * 999)}`,
                name: wagoName,
                status: 'Operational',
                health: 100,
                runtime: 0,
                sync: 'REAL'
            };
            await setDoc(doc(db, 'machines', newNode.id), newNode);
            
            // Log to feed
            await addDoc(collection(db, 'newsfeed'), {
                userName: 'Neural Admin',
                type: 'machine_added',
                textContent: `Provisioned new industrial node: ${wagoName}`,
                timestamp: serverTimestamp(),
                likes: []
            });

            setTimeout(() => {
                setUploading(false);
                setSelectedWago(null);
                setWagoName('');
                setAnalysisStep(0);
                setActiveSubView('Live Telemetry'); // Switch to list
            }, 1500);
        } catch (e) {
            console.error(e);
            setUploading(false);
        }
    };

    const renderLiveTelemetry = () => {
        if (analysisStep > 0) {
            return (
                <div className="flex flex-col items-center justify-center space-y-12 py-12">
                    {analysisStep < 4 ? (
                        <div className="flex flex-col items-center space-y-8 animate-pulse text-center">
                            <div className="h-32 w-32 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
                                <Loader2 className="h-16 w-16 text-brand-red animate-spin" />
                                <div className="absolute inset-0 bg-brand-red/10 blur-3xl rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-3xl font-black text-white uppercase tracking-tighter">
                                    {analysisStep === 1 ? 'Reading WAGO Protocols' : analysisStep === 2 ? 'Dechipering I/O Matrix' : 'Neural Verification'}
                                </h4>
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em]">Initializing encrypted handshake...</p>
                            </div>
                        </div>
                    ) : (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full max-w-xl bg-white/5 border border-white/5 p-10 rounded-[3rem] space-y-10"
                        >
                            <div className="flex items-center space-x-6">
                                <div className="h-24 w-24 bg-white/5 rounded-3xl overflow-hidden border border-white/10">
                                    <img src={selectedWago!} alt="WAGO" className="h-full w-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest block mb-2">Analysis Complete</span>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">Node Identified</h4>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest pl-2">Assign Station Alias</p>
                                <input 
                                  value={wagoName}
                                  onChange={e => setWagoName(e.target.value)}
                                  placeholder="e.g. Line 04 High Pressure"
                                  className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl text-white font-bold outline-none focus:border-emerald-500 transition-all uppercase tracking-widest"
                                />
                            </div>

                            <motion.button 
                              whileTap={{ scale: 0.98 }}
                              onClick={finalizeNode}
                              disabled={!wagoName || analysisStep === 5}
                              className="w-full py-8 bg-emerald-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center space-x-3"
                            >
                               {analysisStep === 5 ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                               <span>Integrate Node into Grid</span>
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            )
        }

        return (
            <div className="space-y-12">
                <div className="bg-white/5 border border-white/5 p-12 rounded-[3.5rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-brand-red/10 transition-colors" />
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center space-x-6">
                            <div className="h-20 w-20 bg-brand-red rounded-[2rem] flex items-center justify-center shadow-2xl shadow-brand-red/20 group-hover:scale-110 transition-transform">
                                <Camera className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Initiate AI Sync</h3>
                                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2 leading-relaxed">Capture WAGO HMI Interface for Neural Mapping</p>
                            </div>
                        </div>

                        <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5 backdrop-blur-sm">
                            <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                Point your terminal camera at the WAGO interface screen. Brett AI will automatically decipher the telemetry layout, synchronize machine states, and bridge the local I/O bridge with the PecoFoods cloud controller.
                            </p>
                        </div>

                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleWagoUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                        
                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-8 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl flex items-center justify-center space-x-4 hover:bg-slate-200 transition-all"
                        >
                            <Plus className="h-6 w-6" />
                            <span>Capture WAGO Interface</span>
                        </motion.button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h4 className="text-white font-black text-[10px] uppercase tracking-[0.3em]">Synched Assets</h4>
                        <span className="text-slate-600 font-black text-[8px] uppercase tracking-widest">{machines.length} Units Active</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                        {machines.map(m => (
                            <div key={m.id} className="p-8 bg-white/2 border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:bg-white/5 transition-all">
                                <div className="flex items-center space-x-6">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-white font-black text-sm ${m.status === 'Operational' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-brand-red/20 text-brand-red'}`}>
                                        {m.id}
                                    </div>
                                    <div>
                                        <p className="text-white font-black uppercase text-sm tracking-tight">{m.name}</p>
                                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mt-1">Health: {m.health}% • {m.runtime}H</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-white transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    if (view !== 'menu') {
      const activeItem = menuItems.find(i => i.id === view)!;
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setView('menu'); setActiveSubView('Live Telemetry'); }} className="p-3 bg-white/5 rounded-full text-white border border-white/5">
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{activeItem.name}</h2>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Industrial Asset Registry</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"><Search className="h-5 w-5" /></motion.button>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md px-8 py-4 flex space-x-4 overflow-x-auto hide-scrollbar border-b border-white/5 shrink-0">
            {activeItem.submenus.map(sub => (
              <button 
                key={sub} 
                onClick={() => setActiveSubView(sub)}
                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                    activeSubView === sub ? 'bg-white text-slate-950 border-white' : 'bg-white/5 text-slate-500 border-white/5 hover:text-white'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="flex-1 p-10 overflow-y-auto no-scrollbar pb-32">
             <div className="max-w-4xl mx-auto">
                {view === 'active' && activeSubView === 'Live Telemetry' ? renderLiveTelemetry() : (
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
                )}
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
