import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useInstallPrompt } from '../services/pwaService';
import { Smartphone, Download, ArrowRight, X, ShieldCheck, Zap, Globe } from 'lucide-react';

interface InstallScreenProps {
    onBypass: () => void;
}

const InstallScreen: React.FC<InstallScreenProps> = ({ onBypass }) => {
    const { installPrompt, promptInstall } = useInstallPrompt();
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        const checkInstalled = () => {
            const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
            setIsInstalled(isPWA);
        };
        checkInstalled();
    }, []);

    if (isInstalled) return null;

    return (
        <div className="fixed inset-0 z-[1000] bg-slate-950 flex items-center justify-center p-6 font-sans antialiased overflow-y-auto">
            <div className="w-full max-w-xl">
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-block p-8 rounded-[3rem] bg-brand-red/20 backdrop-blur-3xl border border-brand-red/20 shadow-2xl mb-8 relative">
                        <Smartphone className="h-16 w-16 text-white" />
                        <motion.div 
                            animate={{ y: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -right-2 -bottom-2 h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-slate-950"
                        >
                            <Download className="h-5 w-5 text-brand-red" />
                        </motion.div>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
                        Deployment <span className="text-brand-red">Required</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Facility Infrastructure Authorization</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 shadow-3xl shadow-black/50 space-y-10"
                >
                    <div className="space-y-6">
                        <p className="text-slate-400 text-sm font-black uppercase tracking-widest leading-relaxed text-center">
                            To access the PecoLabs Command Center and ensure <span className="text-emerald-500">Full Internet Connectivity</span>, the application must be deployed directly to your home screen.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: ShieldCheck, label: 'Secure Auth', color: 'text-blue-500' },
                                { icon: Zap, label: 'Zero Latency', color: 'text-amber-500' },
                                { icon: Globe, label: 'Cloud Sync', color: 'text-emerald-500' }
                            ].map((item, i) => (
                                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center text-center space-y-2">
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {installPrompt ? (
                            <button
                                onClick={promptInstall}
                                className="w-full h-20 bg-brand-red hover:bg-brand-red/90 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-brand-red/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-4"
                            >
                                <Download className="h-6 w-6" />
                                <span>Install to Device</span>
                            </button>
                        ) : (
                            <div className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] text-center space-y-4">
                                <p className="text-white font-black text-[10px] uppercase tracking-widest">Manual Install Required</p>
                                <div className="space-y-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <p>1. Tap the browser menu/share button</p>
                                    <p>2. Select "Add to Home Screen"</p>
                                    <p>3. Re-launch the app from your home screen</p>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={onBypass}
                            className="w-full py-4 text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] hover:text-slate-400 transition-colors"
                        >
                            Continue in Browser (Not Recommended)
                        </button>
                    </div>
                </motion.div>

                <div className="mt-12 flex justify-center">
                    <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.5em]">PecoFoods Industrial Intelligence © 2026</p>
                </div>
            </div>
        </div>
    );
};

export default InstallScreen;
