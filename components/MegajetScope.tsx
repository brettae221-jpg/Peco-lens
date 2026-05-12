import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CameraIcon } from './icons/CameraIcon';
import { ActivityIcon } from './icons/ActivityIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { XMarkIcon } from './icons/XMarkIcon';
import { analyzeMegajetScope, generateDiagram } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

const MegajetScope: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<{ analysis: string, canPinpoint: boolean, nextSteps?: string } | null>(null);
    const [showDiagnosticFlow, setShowDiagnosticFlow] = useState(false);
    const [generatedScope, setGeneratedScope] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [trainingLevel, setTrainingLevel] = useState<'Beginner' | 'Advanced'>('Beginner');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const colors = [
        { name: 'Orange', meaning: 'Command Position (Target Path)', color: 'bg-orange-500' },
        { name: 'White (Center)', meaning: 'Cutter Position (Feedback)', color: 'bg-white' },
        { name: 'Yellow', meaning: 'Velocity', color: 'bg-yellow-500' },
        { name: 'Purplish Blue', meaning: 'Noise', color: 'bg-indigo-500' },
        { name: 'White (Secondary)', meaning: 'Cutter Motion Speed', color: 'bg-slate-300' },
        { name: 'Cyan', meaning: 'Unknown (Needs Investigation)', color: 'bg-cyan-400' },
    ];

    const knownIssues = [
        "Loose / Tight Belts",
        "Bad V-Wheels (Flat Spots)",
        "Worn Rollers / Railings",
        "Bellow Coupling Slop",
        "Axis Calibration Offset",
        "Possible Camera Issues",
        "Cutter Misalignment",
    ];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setAnalysisResult(null);
                setShowDiagnosticFlow(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeMegajetScope({ mimeType: 'image/png', data: image });
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleGenerateScope = async () => {
        if (selectedIssues.length === 0) return;
        setIsGenerating(true);
        try {
            const prompt = `A technical oscilloscope-style motion scope reading for a PecoFoods Megajet waterjet system. 
            Level: ${trainingLevel}
            Issues to show: ${selectedIssues.join(', ')}. 
            
            **Color Coding Requirements:**
            - Orange line: Command Position (should be smooth)
            - White line (center): Cutter Position (should track command)
            - Yellow line: Velocity
            - Purplish Blue line: Noise (should spike where issues occur)
            - White line (secondary): Cutter Motion Speed
            - Cyan line: Unknown
            
            The background must be a dark grid. If you cannot generate a realistic HMI screenshot, generate a clean technical diagram on a white background using these exact colors to illustrate the waveforms.`;
            const result = await generateDiagram(prompt);
            setGeneratedScope(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleIssue = (issue: string) => {
        setSelectedIssues(prev => 
            prev.includes(issue) ? prev.filter(i => i !== issue) : [...prev, issue]
        );
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="glass p-6 rounded-[2.5rem] border border-white/50 shadow-xl">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-brand-red rounded-2xl shadow-lg shadow-brand-red/20">
                        <ActivityIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Megajet Scope</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Real-time Diagnostics</p>
                    </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                    The Megajet Scope is a high-frequency diagnostic tool used to monitor the mechanical health of the cutting system. By analyzing the motion signatures, you can identify issues with **loose or tight belts**, **worn V-wheels**, **bad rollers/railings**, **calibration offsets**, and **bellow coupling slop** before they impact cut quality.
                </p>
            </div>

            {/* Legend Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass p-6 rounded-[2rem] border border-white/50 shadow-lg">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center">
                        <div className="w-1 h-3 bg-brand-red rounded-full mr-2"></div>
                        Scope Color Legend
                    </h3>
                    <div className="space-y-3">
                        {colors.map((c) => (
                            <div key={c.name} className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${c.color} shadow-sm border border-slate-200`}></div>
                                <span className="text-xs font-bold text-slate-700">{c.name}:</span>
                                <span className="text-xs text-slate-500">{c.meaning}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upload Section */}
                <div className="glass p-6 rounded-[2rem] border border-white/50 shadow-lg flex flex-col items-center justify-center text-center">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                    />
                    {!image ? (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="group flex flex-col items-center space-y-3 p-8 rounded-3xl border-2 border-dashed border-slate-200 hover:border-brand-red transition-colors"
                        >
                            <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-brand-red/10 transition-colors">
                                <CameraIcon className="h-8 w-8 text-slate-400 group-hover:text-brand-red" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Upload Scope Image</p>
                                <p className="text-[10px] text-slate-400 mt-1">Capture or select a scope screenshot</p>
                            </div>
                        </button>
                    ) : (
                        <div className="w-full space-y-4">
                            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
                                <img src={image} alt="Scope" className="w-full h-48 object-contain" />
                                <button 
                                    onClick={() => setImage(null)}
                                    className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-md rounded-full text-slate-600 hover:text-brand-red shadow-sm"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full py-4 bg-brand-red text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-brand-red/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? 'Analyzing Scope...' : 'Analyze Reading'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Analysis Result */}
            <AnimatePresence>
                {analysisResult && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-2xl space-y-6"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500/10 rounded-xl">
                                <LightBulbIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">AI Scope Analysis</h3>
                        </div>
                        
                        <div className="prose prose-slate max-w-none">
                            <MarkdownRenderer content={analysisResult.analysis} />
                        </div>

                        {analysisResult.canPinpoint ? (
                            <div className="bg-brand-red/5 p-6 rounded-3xl border border-brand-red/10">
                                <p className="text-sm font-bold text-brand-red mb-4">
                                    I believe I have pinpointed the exact cause. Would you like a more detailed diagnostic plan?
                                </p>
                                <div className="flex space-x-3">
                                    <button 
                                        onClick={() => setShowDiagnosticFlow(true)}
                                        className="px-6 py-3 bg-brand-red text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-brand-red/20 active:scale-95 transition-all"
                                    >
                                        Yes, provide details
                                    </button>
                                    <button 
                                        onClick={() => setAnalysisResult(null)}
                                        className="px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                                    >
                                        No, I'm good
                                    </button>
                                </div>
                            </div>
                        ) : (
                            analysisResult.nextSteps && (
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Next Steps / Missing Info</p>
                                    <p className="text-sm text-slate-600">{analysisResult.nextSteps}</p>
                                </div>
                            )
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Diagnostic Flow */}
            <AnimatePresence>
                {showDiagnosticFlow && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass p-8 rounded-[2.5rem] border border-brand-red/30 shadow-2xl space-y-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800 tracking-tight">Advanced Diagnostic Flow</h3>
                            <button onClick={() => setShowDiagnosticFlow(false)} className="text-slate-400 hover:text-brand-red">
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">
                                To confirm the mechanical diagnosis, please answer the following or provide an additional image:
                            </p>
                            <div className="p-6 bg-white/50 rounded-3xl border border-white shadow-sm">
                                <p className="font-bold text-slate-800 mb-4">Is there visible vibration in the X-axis belt while the machine is homing?</p>
                                <div className="flex space-x-3">
                                    <button className="flex-1 py-3 bg-slate-100 hover:bg-brand-red hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">Yes, visible vibration</button>
                                    <button className="flex-1 py-3 bg-slate-100 hover:bg-brand-red hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">No, it's steady</button>
                                </div>
                            </div>
                            <div className="p-6 bg-white/50 rounded-3xl border border-white shadow-sm flex flex-col items-center">
                                <p className="font-bold text-slate-800 mb-4">Upload a close-up image of the V-wheels and railings</p>
                                <button className="p-4 bg-brand-red/10 rounded-2xl text-brand-red hover:bg-brand-red hover:text-white transition-all">
                                    <CameraIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generate Scope Section */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/50 shadow-xl space-y-6">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-brand-red/10 rounded-xl">
                        <ActivityIcon className="h-5 w-5 text-brand-red" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Simulate Known Issues</h3>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">
                        Select one or more known issues to generate a simulated scope reading for training or reference.
                    </p>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button 
                            onClick={() => setTrainingLevel('Beginner')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trainingLevel === 'Beginner' ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400'}`}
                        >
                            Beginner
                        </button>
                        <button 
                            onClick={() => setTrainingLevel('Advanced')}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${trainingLevel === 'Advanced' ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400'}`}
                        >
                            Advanced
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {knownIssues.map((issue) => (
                        <button 
                            key={issue}
                            onClick={() => toggleIssue(issue)}
                            className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-left transition-all border ${
                                selectedIssues.includes(issue)
                                    ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/20'
                                    : 'bg-white text-slate-600 border-slate-100 hover:border-brand-red/30'
                            }`}
                        >
                            {issue}
                        </button>
                    ))}
                </div>

                <button 
                    onClick={handleGenerateScope}
                    disabled={isGenerating || selectedIssues.length === 0}
                    className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all disabled:opacity-50"
                >
                    {isGenerating ? 'Generating Simulation...' : 'Generate Scope Reading'}
                </button>

                <AnimatePresence>
                    {generatedScope && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-900 aspect-video flex items-center justify-center"
                        >
                            <img src={generatedScope} alt="Generated Scope" className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Simulated Reading</span>
                            </div>
                            <button 
                                onClick={() => setGeneratedScope(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MegajetScope;
