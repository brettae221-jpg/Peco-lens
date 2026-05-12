import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Activity, 
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  Image as ImageIcon,
  Loader2,
  Trash2,
  ChevronDown,
  Upload
} from 'lucide-react';
import { createPMEntry } from '../services/pmService';

type ToolView = 'main' | 'belt-check' | 'add-pm';

const areas = [
    'Grasselli Trim Belt',
    'Grasselli Light Table',
    'Product Belt Main Line (includes product incline)',
    'Main Trim Line (includes trim incline)',
    'Light Table',
    'Light Table Metal Detector',
    'System 1',
    'System 2'
];

const system1Belts = [
    'Hopper Incline',
    '2nd Distribution',
    'MJ4 Loader Belt',
    'MJ5 Loader Belt',
    'MJ6 Loader Belt',
    'MJ4-S Belts',
    'MJ5-S Belts',
    'MJ6-S Belts',
    'Grasselli (4-6)',
    'Megajet (4-6)'
];

const system2Belts = [
    'Hopper Incline',
    'PAA Belt',
    '2nd Distribution Incline',
    'Distribution Take Away',
    '2 Distribution Belt',
    'MJ1 Loader Belt',
    'MJ2 Loader Belt',
    'MJ3 Loader Belt',
    'MJ1-S Belts',
    'MJ2-S Belts',
    'MJ3-S Belts',
    'Grasselli (1-3)',
    'Megajet (1-3)'
];

const Tools: React.FC = () => {
    const [view, setView] = useState<ToolView>('main');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Belt Check State
    const [selectedArea, setSelectedArea] = useState('');
    const [selectedBelt, setSelectedBelt] = useState('');
    const [selectedSubBelt, setSelectedSubBelt] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);

    // Add PM State
    const [pmSystem, setPmSystem] = useState('');
    const [pmIssue, setPmIssue] = useState('');
    const [pmDesc, setPmDesc] = useState('');
    const [pmImage, setPmImage] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetStates = () => {
        setSelectedArea('');
        setSelectedBelt('');
        setSelectedSubBelt('');
        setDescription('');
        setImage(null);
        setPmSystem('');
        setPmIssue('');
        setPmDesc('');
        setPmImage(null);
        setSuccess(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const res = ev.target?.result as string;
                if (view === 'belt-check') setImage(res);
                else setPmImage(res);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddPM = async () => {
        setIsSubmitting(true);
        try {
            if (view === 'belt-check') {
                const finalArea = selectedArea;
                const finalSubArea = selectedSubBelt || selectedBelt;
                await createPMEntry({
                    source: 'Belt Check',
                    area: finalArea,
                    subArea: finalSubArea,
                    description,
                    image: image || undefined
                });
            } else {
                await createPMEntry({
                    source: 'Manual Add',
                    area: pmSystem, // Using area as System here
                    subArea: pmIssue, // Using subArea as Issue shorthand
                    description: pmDesc,
                    image: pmImage || undefined
                });
            }
            setSuccess(true);
            setTimeout(() => {
                setView('main');
                resetStates();
            }, 2000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSystemBelts = () => {
        if (selectedArea === 'System 1') return system1Belts;
        if (selectedArea === 'System 2') return system2Belts;
        return [];
    };

    const getSubBelts = () => {
        const base = selectedArea === 'System 1' ? 4 : 1;
        if (selectedBelt.includes('Grasselli')) {
            return [
                `Grasselli Belt ${base}`,
                `Grasselli Belt ${base + 1}`,
                `Grasselli Belt ${base + 2}`
            ];
        }
        if (selectedBelt.includes('Megajet')) {
            return [
                `Megajet Belt ${base}`,
                `Megajet Belt ${base + 1}`,
                `Megajet Belt ${base + 2}`
            ];
        }
        return [];
    };

    if (view === 'belt-check') {
        return (
            <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
                <div className="flex items-center space-x-6 mb-10">
                    <button onClick={() => { setView('main'); resetStates(); }} className="p-3 bg-white/5 rounded-full text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Belt <span className="text-brand-red">Check</span></h2>
                </div>

                <div className="max-w-xl mx-auto w-full space-y-8">
                    {/* Area Select */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Area</label>
                        <div className="relative">
                            <select 
                                value={selectedArea}
                                onChange={(e) => { setSelectedArea(e.target.value); setSelectedBelt(''); setSelectedSubBelt(''); }}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold appearance-none outline-none focus:border-brand-red transition-all"
                            >
                                <option value="" className="bg-slate-900">Choose Area...</option>
                                {areas.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                        </div>
                    </div>

                    {/* System Belt Select */}
                    {(selectedArea === 'System 1' || selectedArea === 'System 2') && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select {selectedArea} Belt</label>
                            <div className="relative">
                                <select 
                                    value={selectedBelt}
                                    onChange={(e) => { setSelectedBelt(e.target.value); setSelectedSubBelt(''); }}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold appearance-none outline-none focus:border-brand-red transition-all"
                                >
                                    <option value="" className="bg-slate-900">Choose Belt...</option>
                                    {getSystemBelts().map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Sub Belt Select (Grasselli/Megajet) */}
                    {(selectedBelt.includes('Grasselli') || selectedBelt.includes('Megajet')) && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Specific Belt</label>
                            <div className="relative">
                                <select 
                                    value={selectedSubBelt}
                                    onChange={(e) => setSelectedSubBelt(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold appearance-none outline-none focus:border-brand-red transition-all"
                                >
                                    <option value="" className="bg-slate-900">Choose Sub-Belt...</option>
                                    {getSubBelts().map(b => <option key={b} value={b} className="bg-slate-900">{b}</option>)}
                                </select>
                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    {/* Description & Image (Generic for non-systems or after selection) */}
                    {(selectedArea && !selectedArea.includes('System')) || (selectedArea.includes('System') && selectedBelt) ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-4 border-t border-white/5">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description of Issue</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter details here..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold min-h-[120px] outline-none focus:border-brand-red transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Evidence Capture</label>
                                {image ? (
                                    <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                        <img src={image} className="w-full h-full object-cover" alt="Capture" />
                                        <button onClick={() => setImage(null)} className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl text-white">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center space-y-4 hover:bg-white/10 transition-all group"
                                    >
                                        <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                            <Upload className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload from Gallery</p>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </button>
                                )}
                            </div>

                            <button 
                                onClick={handleAddPM}
                                disabled={!description || isSubmitting || success}
                                className="w-full py-6 bg-brand-red rounded-2xl text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-brand-red/20 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center space-x-4"
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (success ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />)}
                                <span>{success ? 'PM LOGGED' : 'Add to This Week\'s PM List'}</span>
                            </button>
                        </motion.div>
                    ) : null}
                </div>
            </div>
        );
    }

    if (view === 'add-pm') {
        return (
            <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
                <div className="flex items-center space-x-6 mb-10">
                    <button onClick={() => { setView('main'); resetStates(); }} className="p-3 bg-white/5 rounded-full text-white">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Manual <span className="text-brand-red">Entry</span></h2>
                </div>

                <div className="max-w-xl mx-auto w-full space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">System</label>
                        <input 
                            value={pmSystem}
                            onChange={(e) => setPmSystem(e.target.value)}
                            placeholder="e.g. Grasselli"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-brand-red transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Issue that needs PMD</label>
                        <input 
                            value={pmIssue}
                            onChange={(e) => setPmIssue(e.target.value)}
                            placeholder="e.g. Broken Blade"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold outline-none focus:border-brand-red transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description of Issue</label>
                        <textarea 
                            value={pmDesc}
                            onChange={(e) => setPmDesc(e.target.value)}
                            placeholder="Detailed explanation..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white font-bold min-h-[120px] outline-none focus:border-brand-red transition-all"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Evidence Capture</label>
                        {pmImage ? (
                            <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                                <img src={pmImage} className="w-full h-full object-cover" alt="Capture" />
                                <button onClick={() => setPmImage(null)} className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl text-white">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-40 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center space-y-4 hover:bg-white/10 transition-all group"
                            >
                                <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Upload className="h-6 w-6 text-slate-400" />
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Upload from Gallery</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </button>
                        )}
                    </div>

                    <button 
                        onClick={handleAddPM}
                        disabled={!pmSystem || !pmIssue || !pmDesc || isSubmitting || success}
                        className="w-full py-6 bg-brand-red rounded-2xl text-white font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-brand-red/20 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center space-x-4"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (success ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />)}
                        <span>{success ? 'PM LOGGED' : 'Submit Manual Entry'}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12">
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase leading-tight">Systems <span className="text-brand-red">Tools</span></h2>
               <p className="text-slate-500 font-bold max-w-sm text-[10px] uppercase tracking-[0.3em]">Operational Precision Utilities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('belt-check')}
                    className="group relative bg-white/5 border border-white/5 p-12 rounded-[3.5rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                >
                    <div className="p-8 rounded-[2rem] bg-blue-600 mb-8 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                        <Activity className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Belt Check</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-[280px]">Diagnostic protocol for conveyor integrity and synchronization.</p>
                    <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                        <span>Initialize Protocol</span>
                        <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setView('add-pm')}
                    className="group relative bg-white/5 border border-white/5 p-12 rounded-[3.5rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                >
                    <div className="p-8 rounded-[2rem] bg-emerald-600 mb-8 shadow-xl shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                        <Plus className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Add PM</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-[280px]">Manual override to log items to the weekly Sunday maintenance queue.</p>
                    <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                        <span>Initialize Entry</span>
                        <ChevronRight className="ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                </motion.button>
            </div>
        </div>
    );
};

export default Tools;


