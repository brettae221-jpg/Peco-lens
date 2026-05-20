import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Layers, 
  Layout, 
  ArrowLeft, 
  ArrowRight,
  Plus, 
  Save, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  Home, 
  Camera, 
  MessageSquare, 
  Settings, 
  ShieldCheck, 
  Newspaper, 
  Image, 
  Activity, 
  FileText, 
  Users,
  Eye,
  EyeOff,
  ChevronDown,
  ArrowUp,
  Zap,
  GraduationCap
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { subscribeToModules, saveModules, updateModule } from '../services/moduleService';
import { generateMenuLayout } from '../services/geminiService';
import { ModuleConfig, AppMode } from '../types';

// Map of allowed high-status visual icons
const AVAILABLE_ICONS = [
  { name: 'Home', icon: Home, desc: 'Core Overview' },
  { name: 'Camera', icon: Camera, desc: 'AR Scan Module' },
  { name: 'Wrench', icon: Wrench, desc: 'Diagnostic Instruments' },
  { name: 'ClipboardList', icon: FileText, desc: 'Operations Logs' },
  { name: 'Zap', icon: Zap, desc: 'AI Troubleshooting' },
  { name: 'BookOpen', icon: LucideIcons.BookOpen, desc: 'Skill Academy' },
  { name: 'Image', icon: Image, desc: 'Asset Gallery' },
  { name: 'MessageSquare', icon: MessageSquare, desc: 'Peer to Peer Comms' },
  { name: 'Newspaper', icon: Newspaper, desc: 'Facility Pulse' },
  { name: 'ShieldCheck', icon: ShieldCheck, desc: 'Administrative Hub' },
  { name: 'Settings', icon: Settings, desc: 'Core Setup' },
  { name: 'Activity', icon: Activity, desc: 'Telemetry Scopes' },
  { name: 'Users', icon: Users, desc: 'Staff Matrix' }
];

const Builder: React.FC = () => {
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [promptText, setPromptText] = useState('');
    const [building, setBuilding] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [selectedIconIdx, setSelectedIconIdx] = useState<string>('Home');

    // Manual add item state
    const [customLabel, setCustomLabel] = useState('');
    const [customMode, setCustomMode] = useState('');
    const [showCustomForm, setShowCustomForm] = useState(false);

    // Subscribe to current database active layouts
    useEffect(() => {
        return subscribeToModules((mods) => {
            setModules(mods);
        });
    }, []);

    // Helper dynamically resolving React elements
    const resolveIcon = (name: string) => {
        const matching = AVAILABLE_ICONS.find(i => i.name === name);
        if (matching) return matching.icon;
        
        // Dynamic fallback straight from Lucide package
        const DynamicIcon = (LucideIcons as any)[name];
        return DynamicIcon || Wrench;
    };

    // AI layout engine trigger
    const handleAIBuildNavigation = async () => {
        if (!promptText.trim()) return;
        setBuilding(true);
        setStatusMessage('AI Architect: recalibrating neural interface layers...');
        
        try {
            const updatedLayout = await generateMenuLayout(promptText, modules);
            if (updatedLayout && Array.isArray(updatedLayout) && updatedLayout.length > 0) {
                // Save updated array to Firestore
                await saveModules(updatedLayout);
                setStatusMessage('System menu parameters updated & synced.');
                setPromptText('');
            } else {
                setStatusMessage('AI Warning: Handshake received but layout response was corrupt.');
            }
        } catch (err: any) {
            console.error(err);
            setStatusMessage('Failure: dynamic architecture compilation interrupted.');
        } finally {
            setBuilding(false);
            setTimeout(() => setStatusMessage(null), 5000);
        }
    };

    // Toggle menu visibility manually
    const handleToggleVisibility = async (mod: ModuleConfig) => {
        try {
            await updateModule(mod.id, { visible: !mod.visible });
        } catch (err) {
            console.error('Failed manual toggle', err);
        }
    };

    // Reorder navigation indexes
    const handleAdjustOrder = async (idx: number, direction: 'up' | 'down') => {
        const sorted = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        
        if (targetIdx < 0 || targetIdx >= sorted.length) return;
        
        // Swap orders
        const temp = sorted[idx].order;
        sorted[idx].order = sorted[targetIdx].order;
        sorted[targetIdx].order = temp;
        
        try {
            await saveModules(sorted);
        } catch (err) {
            console.error('Order sweep failure', err);
        }
    };

    // Update label manually
    const handleUpdateLabel = async (id: string, newLabel: string) => {
        try {
            await updateModule(id, { label: newLabel });
        } catch (err) {
            console.error(err);
        }
    };

    // Update icon manually
    const handleUpdateIcon = async (id: string, newIcon: string) => {
        try {
            await updateModule(id, { icon: newIcon });
        } catch (err) {
            console.error(err);
        }
    };

    // Manual Creation helper
    const handleCreateCustomModule = async () => {
        if (!customLabel || !customMode) return;
        
        const cleanId = customMode.toLowerCase().trim().replace(/\s+/g, '-');
        const formattedId = cleanId.startsWith('mode-') ? cleanId : `mode-custom-${cleanId}`;
        
        const newMod: ModuleConfig = {
            id: formattedId as AppMode,
            label: customLabel,
            icon: selectedIconIdx,
            order: modules.length,
            visible: true
        };

        try {
            await saveModules([...modules, newMod]);
            setCustomLabel('');
            setCustomMode('');
            setShowCustomForm(false);
            setStatusMessage(`Custom Module "${customLabel}" compiled into UI map.`);
            setTimeout(() => setStatusMessage(null), 3500);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveCustomModule = async (id: string) => {
        const filtered = modules.filter(m => m.id !== id);
        try {
            // Delete configuration
            await saveModules(filtered);
            setStatusMessage('Module trace cleared from neural registers.');
            setTimeout(() => setStatusMessage(null), 3000);
        } catch (e) {
            console.error(e);
        }
    };

    const sortedModules = [...modules].sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            
            {/* Header block */}
            <div className="mb-12 shrink-0">
                <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase">AI Navigation <span className="text-brand-red">Architect</span></h2>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Dynamically Curated System Interfaces</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* AI Controller Side */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-48 w-48 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center space-x-3 mb-6">
                            <Zap className="h-6 w-6 text-brand-red animate-pulse" />
                            <h3 className="text-lg font-black text-white uppercase tracking-tight">AI Restructurer</h3>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                            Synthesize navigation structures in real-time. Describe your layout directives naturally, such as toggling visible states, altering names, or adding brand new pathways.
                        </p>

                        <div className="space-y-4">
                            <textarea 
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                placeholder="E.g., 'Hide the dynamic scopes tab, but shift Comms/Messages to the front of the list as order 1...'"
                                className="w-full h-36 bg-slate-900 border border-white/5 rounded-2xl p-5 text-sm font-semibold text-white placeholder:text-slate-700 outline-none focus:border-brand-red/30 transition-all resize-none"
                            />
                            
                            <button
                                disabled={building || !promptText.trim()}
                                onClick={handleAIBuildNavigation}
                                className="w-full h-14 bg-brand-red rounded-2xl flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-650 transition-all disabled:opacity-30 disabled:pointer-events-none"
                            >
                                {building ? (
                                    <div className="flex items-center space-x-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        <span>Rebuilding Framework...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <span>Execute Directive</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                )}
                            </button>
                        </div>

                        {statusMessage && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 bg-white/5 border border-white/10 rounded-xl flex items-start space-x-3"
                            >
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-[10px] font-mono text-slate-400">{statusMessage}</span>
                            </motion.div>
                        )}
                    </div>

                    {/* Manual add form toggle container */}
                    <div className="bg-white/2 border border-white/5 p-8 rounded-[2.5rem]">
                        <button
                            onClick={() => setShowCustomForm(!showCustomForm)}
                            className="w-full h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {showCustomForm ? 'Cancel Manual Build' : 'Manually Add Menu Item'}
                        </button>

                        <AnimatePresence>
                            {showCustomForm && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-6 space-y-4"
                                >
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Display Label Name</label>
                                        <input 
                                            type="text" 
                                            value={customLabel}
                                            onChange={(e) => setCustomLabel(e.target.value)}
                                            placeholder="Calibration Metrics"
                                            className="w-full h-12 bg-slate-900 border border-white/5 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Custom AppMode ID</label>
                                        <input 
                                            type="text" 
                                            value={customMode}
                                            onChange={(e) => setCustomMode(e.target.value)}
                                            placeholder="calibration-metrics"
                                            className="w-full h-12 bg-slate-900 border border-white/5 rounded-xl px-4 text-xs font-bold text-white outline-none focus:border-white/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Assign Icon Badge</label>
                                        <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto pr-2 no-scrollbar border border-white/5 p-3 rounded-xl bg-slate-900">
                                            {AVAILABLE_ICONS.map((it) => {
                                                const Icon = it.icon;
                                                const isSel = selectedIconIdx === it.name;
                                                return (
                                                    <button
                                                        key={it.name}
                                                        type="button"
                                                        onClick={() => setSelectedIconIdx(it.name)}
                                                        className={`p-3 rounded-lg flex items-center justify-center border transition-all ${isSel ? 'bg-brand-red/20 border-brand-red text-white' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white'}`}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateCustomModule}
                                        disabled={!customLabel || !customMode}
                                        className="w-full h-14 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-colors disabled:opacity-20"
                                    >
                                        Deploy Module Node
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Dashboard Active Layout Grid */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between pl-3">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Menu Allocation</h3>
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Synchronized with Main Navigation</span>
                    </div>

                    <div className="space-y-3">
                        {sortedModules.map((item, index) => {
                            const IconComp = resolveIcon(item.icon);
                            const isStandardId = [
                                'dashboard', 'lenses', 'tools', 'maintenance', 'training', 'gallery',
                                'messages', 'news-feed', 'admin', 'settings', 'scope', 'density-calculator'
                            ].includes(item.id);

                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    className={`p-5 bg-white/5 border transition-all rounded-[1.8rem] flex flex-col md:flex-row md:items-center justify-between gap-4 ${item.visible ? 'border-white/5 hover:border-white/10' : 'border-white/1 opacity-30 bg-black/40'}`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-white/5 rounded-xl text-slate-400">
                                            <IconComp className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <input 
                                                    type="text" 
                                                    value={item.label}
                                                    onChange={(e) => handleUpdateLabel(item.id, e.target.value)}
                                                    className="bg-transparent border-none text-white font-black uppercase text-sm focus:outline-none focus:ring-1 focus:ring-brand-red rounded px-1.5 py-0.5"
                                                />
                                            </div>
                                            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1 pl-1.5">{item.id}</p>
                                        </div>
                                    </div>

                                    {/* Edit Utilities Container */}
                                    <div className="flex items-center justify-end space-x-4 ml-auto">
                                        {/* Icon Dropdown select form */}
                                        <select
                                            value={item.icon}
                                            onChange={(e) => handleUpdateIcon(item.id, e.target.value)}
                                            className="bg-slate-900 border border-white/5 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2 outline-none"
                                        >
                                            {AVAILABLE_ICONS.map(avail => (
                                                <option key={avail.name} value={avail.name}>{avail.name}</option>
                                            ))}
                                        </select>

                                        {/* Order up/down movers */}
                                        <div className="flex items-center space-x-1.5">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => handleAdjustOrder(index, 'up')}
                                                className="p-2.5 bg-slate-900 border border-white/5 text-slate-500 hover:text-white rounded-xl disabled:opacity-20"
                                            >
                                                <ArrowUp className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                disabled={index === sortedModules.length - 1}
                                                onClick={() => handleAdjustOrder(index, 'down')}
                                                className="p-2.5 bg-slate-900 border border-white/5 text-slate-500 hover:text-white rounded-xl disabled:opacity-20"
                                            >
                                                <ChevronDown className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        {/* Visiblity toggles */}
                                        <button
                                            onClick={() => handleToggleVisibility(item)}
                                            className={`p-2.5 rounded-xl border transition-all ${item.visible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-900 border-white/5 text-slate-500'}`}
                                            title={item.visible ? 'Visible in navigation' : 'Hidden in navigation'}
                                        >
                                            {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </button>

                                        {/* Delete Custom options */}
                                        {!isStandardId && (
                                            <button
                                                onClick={() => handleRemoveCustomModule(item.id)}
                                                className="p-2.5 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-xl hover:bg-brand-red/20"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Builder;
