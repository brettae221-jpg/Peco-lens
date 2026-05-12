import React, { useState, useRef, useEffect } from 'react';
import { Blueprint, System } from '../types';
import { generateBlueprint } from '../services/geminiService';
import { CogIcon } from './icons/CogIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { BlueprintIcon } from './icons/BlueprintIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { CheckIcon } from './icons/CheckIcon';

interface BlueprintsProps {
    blueprints: { megajet: Blueprint[], grassilli: Blueprint[] };
    addBlueprint: (blueprint: Omit<Blueprint, 'id'>, system: System) => void;
    deleteBlueprint: (id: string, system: System) => void;
}

const BlueprintViewer: React.FC<{ blueprint: Blueprint; onClose: () => void }> = ({ blueprint, onClose }) => {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        setZoom(prev => e.deltaY > 0 ? Math.max(0.5, prev / zoomFactor) : Math.min(5, prev * zoomFactor));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        if(containerRef.current) containerRef.current.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current) {
            setPosition({
                x: e.clientX - startPos.current.x,
                y: e.clientY - startPos.current.y
            });
        }
    };
    
    const handleMouseUp = () => {
        isDragging.current = false;
        if(containerRef.current) containerRef.current.style.cursor = 'grab';
    };

    const handleZoomIn = () => setZoom(prev => Math.min(5, prev * 1.2));
    const handleZoomOut = () => setZoom(prev => Math.max(0.5, prev / 1.2));
    const handleReset = () => {
        setZoom(1);
        setPosition({x: 0, y: 0});
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center animate-fade-in"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <div 
              ref={containerRef}
              className="relative w-full h-full overflow-hidden cursor-grab"
              onWheel={handleWheel}
            >
                <img
                    ref={imgRef}
                    src={blueprint.imageData}
                    alt={blueprint.name}
                    className="absolute max-w-none transition-transform duration-100"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                        transformOrigin: 'center center'
                    }}
                    onMouseDown={handleMouseDown}
                />
            </div>
            {/* Controls */}
            <div className="absolute top-6 right-6 flex flex-col items-center gap-3">
                <div className="glass p-2 rounded-2xl border border-white/20 flex flex-col gap-2 shadow-2xl">
                    <button onClick={handleZoomIn} className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors font-bold text-xl">+</button>
                    <button onClick={handleZoomOut} className="p-3 text-white hover:bg-white/20 rounded-xl transition-colors font-bold text-xl">-</button>
                    <button onClick={handleReset} className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-xl transition-colors text-xs font-bold uppercase tracking-tighter">Reset</button>
                </div>
                 <button onClick={onClose} className="p-3 bg-brand-red rounded-full hover:bg-brand-red-dark border border-white/20 shadow-xl transition-all active:scale-90" aria-label="Close">
                    <XMarkIcon className="h-6 w-6 text-white" />
                </button>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 glass text-white px-8 py-3 rounded-2xl text-xl font-black tracking-tight border border-white/20 shadow-2xl">
                {blueprint.name}
            </div>
        </div>
    );
};

const NameBlueprintModal: React.FC<{
    imageData: string;
    originalPrompt: string;
    onSave: (name: string) => void;
    onCancel: () => void;
}> = ({ imageData, originalPrompt, onSave, onCancel }) => {
    const [name, setName] = useState(originalPrompt);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
        }
    };
    
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
    }, []);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-center justify-center animate-fade-in p-4">
            <div className="glass rounded-3xl border border-white/50 p-8 w-full max-w-lg relative shadow-2xl">
                <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight">Name Your <span className="text-brand-red">Blueprint</span></h3>
                <div className="bg-white/50 rounded-2xl p-4 border border-white mb-6 shadow-inner">
                    <img src={imageData} alt="Newly generated blueprint" className="w-full h-48 object-contain rounded-xl"/>
                </div>
                <div className="space-y-2">
                    <label htmlFor="blueprint-name" className="block text-sm font-bold text-slate-700 ml-1">Blueprint Name</label>
                    <input
                        ref={inputRef}
                        id="blueprint-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Actuator Assembly - Exploded View"
                        className="w-full bg-white/80 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all shadow-sm text-slate-800 font-medium"
                        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                    />
                </div>
                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onCancel} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-6 rounded-2xl transition-all active:scale-95">
                        Discard
                    </button>
                    <button 
                        onClick={handleSave} 
                        disabled={!name.trim()} 
                        className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3 px-8 rounded-2xl transition-all flex items-center shadow-lg shadow-brand-red/20 disabled:opacity-50 active:scale-95"
                    >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Save to Library
                    </button>
                </div>
            </div>
        </div>
    );
};

const Blueprints: React.FC<BlueprintsProps> = ({ blueprints, addBlueprint, deleteBlueprint }) => {
    const [prompt, setPrompt] = useState('');
    const [system, setSystem] = useState<System>(System.Megajet);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
    const [pendingBlueprint, setPendingBlueprint] = useState<{ imageData: string, originalPrompt: string } | null>(null);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentPrompt = prompt.trim();
        if (!currentPrompt || isLoading) return;

        setIsLoading(true);
        setError(null);
        try {
            const imageData = await generateBlueprint(currentPrompt);
            setPendingBlueprint({ imageData, originalPrompt: currentPrompt });
            setPrompt('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveBlueprint = (name: string) => {
        if (pendingBlueprint) {
            addBlueprint({
                name: name,
                imageData: pendingBlueprint.imageData
            }, system);
            setPendingBlueprint(null);
        }
    };

    const handleCancelSave = () => {
        setPendingBlueprint(null);
    };
    
    return (
        <div className="h-full flex flex-col">
            {selectedBlueprint && <BlueprintViewer blueprint={selectedBlueprint} onClose={() => setSelectedBlueprint(null)} />}
            
            {pendingBlueprint && (
                <NameBlueprintModal
                    imageData={pendingBlueprint.imageData}
                    originalPrompt={pendingBlueprint.originalPrompt}
                    onSave={handleSaveBlueprint}
                    onCancel={handleCancelSave}
                />
            )}

            <h2 className="text-3xl font-extrabold mb-2 text-app-text tracking-tight">System <span className="text-brand-red">Blueprints</span></h2>
            <p className="mb-8 text-slate-500 font-medium">
                Request a technical diagram or schematic for any part of the PecoFoods equipment.
            </p>

            <form onSubmit={handleGenerate} className="p-6 glass rounded-3xl border border-white/50 shadow-xl space-y-5 mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-2">
                        <label htmlFor="blueprint-prompt" className="block text-sm font-bold text-slate-700 ml-1">Blueprint Request</label>
                        <textarea
                            id="blueprint-prompt"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., An exploded view of a Megajet actuator assembly..."
                            rows={3}
                            className="w-full bg-white/80 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all shadow-sm text-slate-800 placeholder:text-slate-400 font-medium"
                            disabled={isLoading}
                        />
                    </div>
                     <div className="space-y-2">
                        <label htmlFor="system-select" className="block text-sm font-bold text-slate-700 ml-1">System</label>
                        <select
                            id="system-select"
                            value={system}
                            onChange={(e) => setSystem(e.target.value as System)}
                            className="w-full h-[116px] bg-white/80 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-brand-red outline-none transition-all shadow-sm text-slate-800 font-medium"
                            disabled={isLoading}
                        >
                            <option value={System.Megajet}>Megajet</option>
                            <option value={System.Grassilli}>Grassilli</option>
                        </select>
                    </div>
                </div>
                <div className="text-right">
                    <button type="submit" disabled={isLoading || !prompt.trim()} className="w-full lg:w-auto bg-brand-red hover:bg-brand-red-dark text-white font-bold py-4 px-10 rounded-2xl transition-all flex items-center justify-center lg:ml-auto shadow-lg shadow-brand-red/20 active:scale-95 disabled:opacity-50">
                        {isLoading ? <CogIcon className="h-6 w-6 animate-spin mr-2" /> : <PlusCircleIcon className="h-6 w-6 mr-2" />}
                        {isLoading ? 'Generating Schematic...' : 'Generate Blueprint'}
                    </button>
                </div>
            </form>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-brand-red text-sm font-medium animate-shake">
                    <strong>Error:</strong> {error}
                </div>
            )}
            
            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {/* Megajet Blueprints */}
                <div className="mb-12">
                    <div className="flex items-center mb-6">
                        <div className="w-1.5 h-8 bg-brand-red rounded-full mr-4"></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Megajet Library</h3>
                    </div>
                    {blueprints.megajet.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blueprints.megajet.map(blueprint => (
                                <div key={blueprint.id} className="group glass rounded-3xl border border-white/50 overflow-hidden transition-all hover:shadow-2xl hover:border-white shadow-xl">
                                    <button onClick={() => setSelectedBlueprint(blueprint)} className="block w-full text-left">
                                        <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                                             <img src={blueprint.imageData} alt={blueprint.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <div className="p-5 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-black text-slate-800 tracking-tight">{blueprint.name}</p>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Technical Schematic</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBlueprint(blueprint.id, System.Megajet);
                                                }}
                                                className="p-2.5 rounded-xl text-slate-300 hover:text-brand-red hover:bg-red-50 transition-all active:scale-90"
                                                aria-label="Delete blueprint"
                                            >
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-300 py-16 glass rounded-3xl border border-dashed border-slate-200">
                            <BlueprintIcon className="h-16 w-16 mx-auto opacity-20" />
                            <h4 className="mt-4 text-lg font-bold">No Megajet blueprints generated yet.</h4>
                        </div>
                    )}
                </div>

                 {/* Grassilli Blueprints */}
                <div>
                    <div className="flex items-center mb-6">
                        <div className="w-1.5 h-8 bg-brand-red rounded-full mr-4"></div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Grassilli Library</h3>
                    </div>
                    {blueprints.grassilli.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {blueprints.grassilli.map(blueprint => (
                                <div key={blueprint.id} className="group glass rounded-3xl border border-white/50 overflow-hidden transition-all hover:shadow-2xl hover:border-white shadow-xl">
                                    <button onClick={() => setSelectedBlueprint(blueprint)} className="block w-full text-left">
                                        <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                                             <img src={blueprint.imageData} alt={blueprint.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                             <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        </div>
                                        <div className="p-5 bg-white/50 backdrop-blur-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-black text-slate-800 tracking-tight">{blueprint.name}</p>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Technical Schematic</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteBlueprint(blueprint.id, System.Grassilli);
                                                }}
                                                className="p-2.5 rounded-xl text-slate-300 hover:text-brand-red hover:bg-red-50 transition-all active:scale-90"
                                                aria-label="Delete blueprint"
                                            >
                                                <TrashIcon className="h-5 w-5"/>
                                            </button>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-slate-300 py-16 glass rounded-3xl border border-dashed border-slate-200">
                            <BlueprintIcon className="h-16 w-16 mx-auto opacity-20" />
                            <h4 className="mt-4 text-lg font-bold">No Grasselli blueprints generated yet.</h4>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blueprints;