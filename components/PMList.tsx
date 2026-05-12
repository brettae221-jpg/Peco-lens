import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Box, 
  Thermometer, 
  Eye, 
  Cpu,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { PMItem } from '../types';

const PMList: React.FC = () => {
  const [items, setItems] = useState<PMItem[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Fixed'>('Pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'pm_items'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PMItem[];
      setItems(newItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (item: PMItem) => {
    try {
      const newStatus = item.status === 'Pending' ? 'Fixed' : 'Pending';
      await updateDoc(doc(db, 'pm_items', item.id), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Megajet': return <Cpu className="h-5 w-5" />;
      case 'Grasselli': return <Box className="h-5 w-5" />;
      case 'Thermal': return <Thermometer className="h-5 w-5" />;
      case 'Vision': return <Eye className="h-5 w-5" />;
      default: return <Wrench className="h-5 w-5" />;
    }
  };

  const filteredItems = items.filter(item => 
    filter === 'All' ? true : item.status === filter
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-24">
      <header className="mb-8 pt-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">PM <span className="text-brand-red">Registry</span></h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2">Sunday Maintenance Queue</p>
          </div>
          <div className="bg-white/5 p-1 rounded-2xl flex border border-white/5">
            {(['Pending', 'Fixed', 'All'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-brand-red text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scanning Registry...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white">All Clear</h3>
            <p className="text-sm text-slate-500 mt-2">Registry is purged. No pending faults detected.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white/5 backdrop-blur-xl border ${item.status === 'Fixed' ? 'border-emerald-500/20 opacity-60' : 'border-white/5'} rounded-[2rem] p-6 relative overflow-hidden group`}
            >
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  <div className={`p-4 rounded-2xl ${
                    item.status === 'Fixed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-red/10 text-brand-red'
                  }`}>
                    {getIcon(item.equipmentType)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.equipmentType}</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {new Date(item.timestamp?.seconds * 1000 || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">{item.partName}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.issueDescription}</p>
                    
                    {item.aiReasoning && (
                        <div className="mt-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest mb-1 flex items-center">
                                <Cpu className="h-3 w-3 mr-2" /> AI Technical Note
                            </p>
                            <p className="text-xs text-slate-300 italic">"{item.aiReasoning}"</p>
                        </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.severity === 'High' ? 'bg-red-500/20 text-red-500' : 
                    item.severity === 'Medium' ? 'bg-orange-500/20 text-orange-500' : 
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {item.severity} Priority
                  </span>
                  
                  <button
                    onClick={() => toggleStatus(item)}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                      item.status === 'Fixed' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-white/10 text-slate-400 hover:bg-brand-red hover:text-white'
                    }`}
                  >
                    {item.status === 'Fixed' ? <CheckCircle2 className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
                  </button>
                </div>
              </div>

              {item.modelUrl && (
                <div className="mt-6 flex justify-end">
                    <a 
                        href={item.modelUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                    >
                        <ExternalLink className="h-3 w-3" />
                        <span>View 3D Reconstruction</span>
                    </a>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PMList;
