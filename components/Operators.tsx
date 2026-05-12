import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { PencilIcon } from './icons/PencilIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { Operator } from '../types';

interface OperatorsProps {
  onBack: () => void;
}

const Operators: React.FC<OperatorsProps> = ({ onBack }) => {
  const [operators, setOperators] = useState<Operator[]>(() => {
    const saved = localStorage.getItem('pecofoods-operators-data');
    if (saved) return JSON.parse(saved);
    
    return [
      {
        id: 'sam',
        name: 'Sam',
        megajet: 'Megajet 1',
        details: [
          'Struggles with weight on lane 2',
          'Possibly guesses his density (need to watch)',
          'Tends to overthink small issues, and underthink serious ones',
          'Struggles with correcting team members'
        ]
      },
      {
        id: 'jimmy',
        name: 'Jimmy',
        megajet: 'Megajet 3',
        details: [
          'Has trouble moving his delfix',
          'Does not seem motivated to further his learning',
          'Did see some improvement on Tuesday',
          'Not afraid to correct team members'
        ]
      },
      {
        id: 'mo',
        name: 'MO',
        megajet: 'Megajet 4',
        details: [
          'Tends to overdo her density causing a higher standard deviation',
          'Lacks confidence even when she knows what she should be doing',
          'Focuses too much on bathroom breaks',
          'She is good with her megajet but neglects her other duties as a machine operator'
        ]
      },
      {
        id: 'gerald',
        name: 'Gerald',
        megajet: 'Megajet 5 / Moved to Megajet 2 on Wednesday',
        details: [
          'Knows his machines better than the other operators',
          'Has a negative "they won\'t so I won\'t" attitude',
          'He is always the first to help leads',
          'Struggles with ego, easily controlled by it',
          'Does seem to take more breaks than the other operators',
          'Verbally talked to about breaks on Monday, April 13th'
        ]
      },
      {
        id: 'xander',
        name: 'Xander',
        megajet: 'New / Learning Basics',
        details: [
          'Xander is still new, still learning basics',
          'Xander does glove checks every 30 mins',
          'When he is not busy he is always helping and always wanting to learn',
          'He has really good potential',
          'Team member corrections might be an issue, will test after density/thickness training'
        ]
      }
    ];
  });

  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDetails, setEditDetails] = useState("");

  useEffect(() => {
    localStorage.setItem('pecofoods-operators-data', JSON.stringify(operators));
  }, [operators]);

  const handleSaveDetails = () => {
    if (!selectedOperator) return;
    const newDetails = editDetails.split('\n').filter(d => d.trim() !== "");
    const updated = operators.map(op => op.id === selectedOperator.id ? { ...op, details: newDetails } : op);
    setOperators(updated);
    setSelectedOperator({ ...selectedOperator, details: newDetails });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-12 px-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 glass rounded-2xl text-slate-600 hover:text-brand-red transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Operators</h2>
      </div>

      {/* Operator Cards */}
      <div className="space-y-4">
        {operators.map((op) => (
          <motion.div 
            key={op.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedOperator(op);
              setEditDetails(op.details.join('\n'));
            }}
            className="glass p-6 rounded-[2rem] border border-white/50 shadow-lg cursor-pointer group hover:border-brand-red/30 transition-all"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-800">{op.name}</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-red">{op.megajet}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-brand-red/10 transition-colors">
                <PencilIcon className="h-4 w-4 text-slate-400 group-hover:text-brand-red" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedOperator && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelectedOperator(null); setIsEditing(false); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="glass w-full max-w-lg p-8 rounded-t-[3rem] sm:rounded-[3rem] border border-white shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">{selectedOperator.name}</h3>
                  <p className="text-xs font-black uppercase tracking-widest text-brand-red">{selectedOperator.megajet}</p>
                </div>
                <button 
                  onClick={() => { setSelectedOperator(null); setIsEditing(false); }}
                  className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-brand-red"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <textarea 
                    value={editDetails}
                    onChange={(e) => setEditDetails(e.target.value)}
                    className="w-full h-64 p-6 bg-white/50 rounded-[2rem] border border-slate-200 focus:border-brand-red outline-none font-medium text-slate-700 leading-relaxed"
                    placeholder="Enter operator details (one per line)..."
                  />
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleSaveDetails}
                      className="flex-1 py-4 bg-brand-red text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-red/20"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {selectedOperator.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start space-x-3 p-4 bg-white/30 rounded-2xl border border-white/50">
                        <div className="w-1.5 h-1.5 bg-brand-red rounded-full mt-2 shrink-0"></div>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{detail}</p>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Performance Notes</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Operators;
