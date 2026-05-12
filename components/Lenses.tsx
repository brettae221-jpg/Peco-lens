import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Eye, 
  Droplet, 
  Box, 
  Image as ImageIcon,
  Zap, 
  Thermometer, 
  Target,
  ChevronRight,
  Maximize2,
  X,
  Plus,
  ArrowRight,
  AlertTriangle,
  Layers,
  Activity,
  Maximize,
  History as HistoryIcon,
  Box as BoxIcon,
  Settings,
  Database,
  Search,
  CheckCircle2,
  Trash2,
  Play,
  RotateCcw,
  Share2,
  Download,
  Loader2
} from 'lucide-react';
import { analyzeLensScan } from '../services/geminiService';

type LensView = 'menu' | 'ar' | 'poultry' | 'megajet' | 'grasselli' | 'vision' | 'thermal' | 'calibration';

const Lenses: React.FC = () => {
  const [view, setView] = useState<LensView>('menu');

  const renderView = () => {
    switch (view) {
      case 'menu': return <LensMenu onSelect={setView} />;
      default: return <LiveLensView mode={view} onClose={() => setView('menu')} />;
    }
  };

  return (
    <div className="h-full bg-slate-950 overflow-hidden text-slate-200">
      {renderView()}
    </div>
  );
};

const LensMenu: React.FC<{ onSelect: (v: LensView) => void }> = ({ onSelect }) => {
  const lenses = [
    { id: 'ar', name: 'AR Lens', icon: Camera, color: 'bg-brand-red', machine: 'All Systems' },
    { id: 'poultry', name: 'Poultry Lens', icon: Eye, color: 'bg-emerald-500', machine: 'Vision Stations' },
    { id: 'megajet', name: 'MegaJet Lens', icon: Droplet, color: 'bg-blue-500', machine: 'MJ-8 Waterjets' },
    { id: 'grasselli', name: 'Grasselli Lens', icon: BoxIcon, color: 'bg-orange-500', machine: 'GR-4.2 Skinners' },
    { id: 'vision', name: 'Vision Sys Lens', icon: Zap, color: 'bg-purple-500', machine: 'Sortation Lines' },
    { id: 'thermal', name: 'Thermal Lens', icon: Thermometer, color: 'bg-yellow-500', machine: 'Fryers / Coolers' },
    { id: 'calibration', name: 'Calibration Lens', icon: Target, color: 'bg-slate-600', machine: 'Maintenance Only' },
  ];

  return (
    <div className="h-full overflow-y-auto p-8 space-y-6 pb-24">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">System <span className="text-brand-red">Lenses</span></h2>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Select an intelligence layer to project onto equipment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lenses.map((lens) => (
          <motion.button
            key={lens.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(lens.id as LensView)}
            className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex items-center group hover:bg-white/10 transition-all text-left shadow-2xl"
          >
            <div className={`p-5 rounded-[1.5rem] ${lens.color} mr-6 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
              <lens.icon className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{lens.name}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{lens.machine}</p>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-700 group-hover:text-white transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

interface LiveLensViewProps {
  mode: LensView;
  onClose: () => void;
}

const LiveLensView: React.FC<LiveLensViewProps> = ({ mode, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [showGrasselliStatus, setShowGrasselliStatus] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getLensInfo = (m: LensView) => {
    switch(m) {
      case 'ar': return { name: 'AR Intelligence', color: 'text-brand-red', icon: Camera, machine: 'Plant-wide Systems' };
      case 'poultry': return { name: 'Poultry Vision', color: 'text-emerald-500', icon: Eye, machine: 'Vision Stations' };
      case 'megajet': return { name: 'MegaJet Neural', color: 'text-blue-500', icon: Droplet, machine: 'MJ-8 Waterjets' };
      case 'grasselli': return { name: 'Grasselli Sentry', color: 'text-orange-500', icon: BoxIcon, machine: 'GR-4.2 Skinners' };
      case 'vision': return { name: 'Vision Insight', color: 'text-purple-500', icon: Zap, machine: 'Sortation Lines' };
      case 'thermal': return { name: 'Thermal Vector', color: 'text-yellow-500', icon: Thermometer, machine: 'Motors/Intensifiers' };
      case 'calibration': return { name: 'Maintenance Mode', color: 'text-slate-400', icon: Target, machine: 'Maintenance Nodes' };
      default: return { name: 'System', color: 'text-brand-red', icon: Camera, machine: 'Unknown' };
    }
  };

  const info = getLensInfo(mode);

  useEffect(() => {
    if (mode === 'poultry') return; // Poultry uses upload

    navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      } 
    })
      .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
      .catch(console.error);
    return () => {
      if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    };
  }, [mode]);

  const handleScan = async () => {
    setIsScanning(true);
    setAnalysis(null);
    setSelectedIssue(null);

    // If image upload (poultry), handle differently or just simulate for now if no image provided
    if (mode === 'poultry' && !capturedImage) {
        // Trigger file input? For now let's assume we capture from video if available
    }

    if (videoRef.current && !capturedImage) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
    }

    try {
      const formattedMode = mode === 'ar' ? 'AR' : mode.charAt(0).toUpperCase() + mode.slice(1);
      const result = await analyzeLensScan(formattedMode as any, { 
        mimeType: 'image/jpeg', 
        data: capturedImage || '' 
      });
      setAnalysis(result);
      if (mode === 'grasselli' && result.issues.length > 0) {
        setShowGrasselliStatus(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePoultryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setCapturedImage(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bottom-24 bg-black overflow-hidden z-40">
      {/* Target/Focus Overlay */}
      <div className="absolute inset-0 border-[40px] border-black/20 pointer-events-none z-10">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white/40" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white/40" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white/40" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white/40" />
      </div>

      {/* Top Bar Navigation */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center space-x-4">
          <button onClick={onClose} className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white">
            <X className="h-6 w-6" />
          </button>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{info.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Telemetry Sync: {analysis ? 'Locked' : 'Active'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
            <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Link</span>
            </div>
            <button className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white">
                <Settings className="h-5 w-5" />
            </button>
        </div>
      </div>

      {/* Viewfinder Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {mode === 'poultry' && !capturedImage ? (
          <div className="flex flex-col items-center justify-center text-center p-10">
            <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20">
                <ImageIcon className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase mb-4">Feed Capture Required</h2>
            <p className="text-slate-500 text-sm max-w-xs mb-10 leading-relaxed uppercase font-black tracking-widest">Upload a high-resolution image of the poultry segment for volumetric grading.</p>
            <label className="bg-emerald-500 px-10 py-5 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer">
                <span>Select Source Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handlePoultryUpload} />
            </label>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {capturedImage ? (
                <img src={capturedImage} className="w-full h-full object-cover" alt="Frozen segment" />
            ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}

            {/* Scanning Animation */}
            {isScanning && (
                <div className="absolute inset-x-0 h-1 bg-brand-red shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-scan z-30" />
            )}

            {/* Neural Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

            {/* Issue markers for Lenses */}
            <AnimatePresence>
                {analysis?.issues.map((issue: any, index: number) => (
                    <motion.button
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        whileHover={{ scale: 1.2 }}
                        onClick={() => setSelectedIssue(issue)}
                        className={`absolute w-14 h-14 flex items-center justify-center z-40 pointer-events-auto`}
                        style={{ 
                            left: `${issue.coords.x}%`, 
                            top: `${issue.coords.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className={`absolute inset-0 rounded-xl animate-ping opacity-75 ${
                            issue.severity === 'High' ? 'bg-red-500' : (issue.severity === 'Medium' ? 'bg-orange-500' : 'bg-brand-red')
                        }`} />
                        <div className={`relative h-8 w-8 rounded-xl border-2 border-white shadow-2xl flex items-center justify-center backdrop-blur-md ${
                            issue.severity === 'High' ? 'bg-red-500' : (issue.severity === 'Medium' ? 'bg-orange-500' : 'bg-brand-red')
                        }`}>
                           <AlertTriangle className="h-4 w-4 text-white" />
                        </div>

                        {/* AR Label in-view */}
                        {(mode === 'ar' || mode === 'grasselli') && (
                            <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                <p className="text-[10px] font-black text-white uppercase tracking-tighter">{issue.label}</p>
                            </div>
                        )}
                    </motion.button>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* AR Specific Interactive Box */}
      <AnimatePresence>
        {selectedIssue && mode === 'ar' && (
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="absolute inset-x-8 bottom-32 bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-50 max-w-lg mx-auto"
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${selectedIssue.severity === 'High' ? 'bg-red-500' : 'bg-orange-500'}`}>
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight">{selectedIssue.label}</h4>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1">AI Detection Node #4282</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedIssue(null)} className="p-2 hover:bg-white/10 rounded-full text-slate-500"><X className="h-6 w-6" /></button>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-2">Neural Explanation</p>
                        <p className="text-sm text-slate-300 font-medium leading-relaxed italic">"{selectedIssue.reason || selectedIssue.description}"</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Diagnostic Recommended Action</p>
                        <div className="flex items-center space-x-3 text-emerald-400">
                            <CheckCircle2 className="h-5 w-5" />
                            <p className="text-sm font-black uppercase tracking-tight">{selectedIssue.recommendedAction}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <button className="w-full py-5 bg-brand-red text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-brand-red/20 active:scale-95 transition-all">
                        Accept & Build 3D Model to Gallery
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                            Accept (No 3D)
                        </button>
                        <button onClick={() => setSelectedIssue(null)} className="py-4 bg-white/5 border border-white/10 text-slate-500 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                            Disregard Part
                        </button>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Grasselli Specific Status Box */}
      <AnimatePresence>
        {mode === 'grasselli' && analysis && (
            <motion.div
                initial={{ y: 200 }}
                animate={{ y: showGrasselliStatus ? 0 : 120 }}
                className="absolute inset-x-8 bottom-32 z-50 max-w-lg mx-auto"
            >
                <div className="bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                    <button 
                        onClick={() => setShowGrasselliStatus(!showGrasselliStatus)}
                        className="w-full p-6 flex justify-between items-center border-b border-white/5 hover:bg-white/5 transition-all"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <Activity className="h-4 w-4 text-white" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-black text-white uppercase tracking-tight">Grasselli Integrity Status</h4>
                                <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest">{analysis.issues.length} Critical Indicators Found</p>
                            </div>
                        </div>
                        <ChevronRight className={`h-5 w-5 text-slate-500 transition-transform ${showGrasselliStatus ? 'rotate-90' : '-rotate-90'}`} />
                    </button>
                    
                    <AnimatePresence>
                        {showGrasselliStatus && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="p-8 space-y-6 max-h-[40vh] overflow-y-auto"
                            >
                                {analysis.issues.map((issue: any, i: number) => (
                                    <div key={i} className="flex space-x-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="h-10 w-10 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white uppercase tracking-tight mb-1">{issue.label}</p>
                                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-3">{issue.description}</p>
                                            <div className="p-3 bg-black/40 rounded-xl">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Reasoning</p>
                                                <p className="text-[10px] text-orange-200 italic">"{issue.reason}"</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-4 bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-orange-600/20">
                                    Initiate Calibration Protocol
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Control Bar (Initiate Scan) */}
      <div className="absolute bottom-8 inset-x-8 h-20 flex space-x-4 z-50">
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="flex-1 bg-brand-red h-full rounded-2xl text-white font-black uppercase tracking-[0.3em] text-sm shadow-2xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4"
        >
          {isScanning ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6" />}
          <span>{isScanning ? 'Syncing...' : 'Neural Scan'}</span>
        </button>
        <button 
          onClick={() => { setAnalysis(null); setCapturedImage(null); setSelectedIssue(null); setShowGrasselliStatus(false); }}
          className="w-20 bg-white/10 backdrop-blur-xl border border-white/10 h-full rounded-2xl text-white flex items-center justify-center active:scale-95 transition-all"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Lenses;
