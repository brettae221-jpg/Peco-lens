import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  ArrowLeft,
  Eye, 
  Droplet, 
  Box, 
  Image as ImageIcon,
  Zap, 
  Thermometer, 
  Target,
  ChevronRight,
  X,
  Plus,
  ArrowRight,
  AlertTriangle,
  Activity,
  Settings,
  RotateCcw,
  Loader2,
  Volume2,
  VolumeX,
  Scan,
  RefreshCw,
  Mic,
  MicOff
} from 'lucide-react';
import { analyzeLensScan } from '../services/geminiService';

type LensView = 'menu' | 'ar' | 'poultry' | 'megajet' | 'grasselli' | 'vision' | 'thermal' | 'calibration' | 'scope';

interface LensesProps {
  onBack: () => void;
}

const Lenses: React.FC<LensesProps> = ({ onBack }) => {
  const [view, setView] = useState<LensView>('menu');

  const renderView = () => {
    switch (view) {
      case 'menu': return <LensMenu onSelect={setView} onBack={onBack} />;
      default: return <LiveLensView mode={view} onClose={() => setView('menu')} />;
    }
  };

  return (
    <div className="h-full bg-slate-950 overflow-hidden text-slate-200">
      {renderView()}
    </div>
  );
};

const LensMenu: React.FC<{ onSelect: (v: LensView) => void; onBack: () => void }> = ({ onSelect, onBack }) => {
  const lenses = [
    { id: 'ar', name: 'AR Lens', icon: Camera, color: 'bg-brand-red', machine: 'All Systems', active: true },
    { id: 'poultry', name: 'Poultry Lens', icon: Eye, color: 'bg-emerald-500', machine: 'Manual Upload Only', active: true },
    { id: 'megajet', name: 'MegaJet Lens', icon: Droplet, color: 'bg-blue-500', machine: 'MJ-8 Waterjets', active: true },
    { id: 'grasselli', name: 'Grasselli Lens', icon: Box, color: 'bg-orange-500', machine: 'GR-4.2 Skinners', active: true },
    { id: 'vision', name: 'Vision Sys Lens', icon: Zap, color: 'bg-purple-500', machine: 'Sortation Lines', active: true },
    { id: 'thermal', name: 'Thermal Lens', icon: Thermometer, color: 'bg-yellow-500', machine: 'Internal Parts', active: true },
    { id: 'calibration', name: 'Calibration Lens', icon: Target, color: 'bg-slate-600', machine: 'Maintenance Only', active: true },
    { id: 'scope', name: 'Live Scope', icon: Activity, color: 'bg-indigo-500', machine: 'MJ Motion Diagnostics', active: true },
  ];

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar relative bg-slate-950">
      {/* Immersive Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-red/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-8 space-y-10 pb-32 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={onBack}
              className="p-5 bg-white/5 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 text-white active:scale-95 transition-all shadow-2xl"
            >
              <ArrowLeft className="h-7 w-7" />
            </button>
            <div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">System <span className="text-brand-red">Lenses</span></h2>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-3">Select an intelligence layer to project onto equipment.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center space-x-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Sensors Ready</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-10">
          {lenses.map((lens, idx) => (
            <motion.button
              key={lens.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(lens.id as LensView)}
              className="bg-white/5 border border-white/5 rounded-[3rem] p-10 flex flex-col group hover:bg-white/10 hover:border-white/10 transition-all text-left shadow-2xl relative overflow-hidden h-[320px]"
            >
              <div className={`p-6 rounded-[2rem] ${lens.color} mb-12 shadow-xl shadow-black/40 group-hover:scale-110 transition-transform w-20 h-20 flex items-center justify-center`}>
                <lens.icon className="h-10 w-10 text-white" />
              </div>
              
              <div className="mt-auto">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{lens.name}</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{lens.machine}</p>
              </div>

              <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-slate-950">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </div>

              {/* Technical Accents */}
              <div className="absolute bottom-0 left-0 h-1 bg-white/10 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </motion.button>
          ))}
        </div>
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
  const [autoScan, setAutoScan] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoScanTimer = useRef<NodeJS.Timeout | null>(null);

  const getLensInfo = (m: LensView) => {
    switch(m) {
      case 'ar': return { name: 'AR Intelligence', color: 'text-brand-red', icon: Camera, theme: 'rgba(239, 68, 68, 0.4)' };
      case 'poultry': return { name: 'Poultry Vision', color: 'text-emerald-500', icon: Eye, theme: 'rgba(16, 185, 129, 0.4)' };
      case 'megajet': return { name: 'MegaJet Neural', color: 'text-blue-500', icon: Droplet, theme: 'rgba(59, 130, 246, 0.4)' };
      case 'grasselli': return { name: 'Grasselli Sentry', color: 'text-orange-500', icon: Box, theme: 'rgba(249, 115, 22, 0.4)' };
      case 'vision': return { name: 'Vision Insight', color: 'text-purple-500', icon: Zap, theme: 'rgba(168, 85, 247, 0.4)' };
      case 'thermal': return { name: 'Thermal Vector', color: 'text-yellow-500', icon: Thermometer, theme: 'rgba(234, 179, 8, 0.4)' };
      case 'calibration': return { name: 'Maintenance Mode', color: 'text-slate-400', icon: Target, theme: 'rgba(148, 163, 184, 0.4)' };
      case 'scope': return { name: 'Motion Scope AI', color: 'text-indigo-400', icon: Activity, theme: 'rgba(99, 102, 241, 0.4)' };
      default: return { name: 'System', color: 'text-brand-red', icon: Camera, theme: 'rgba(239, 68, 68, 0.4)' };
    }
  };

  const info = getLensInfo(mode);

  useEffect(() => {
    if (mode === 'poultry') return;

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

  useEffect(() => {
    if (autoScan && !isScanning) {
      autoScanTimer.current = setTimeout(handleScan, 10000); // Scan every 10s if auto on
    } else {
      if (autoScanTimer.current) clearTimeout(autoScanTimer.current);
    }
    return () => { if (autoScanTimer.current) clearTimeout(autoScanTimer.current); };
  }, [autoScan, isScanning]);

  const speak = (text: string) => {
    if (isMuted) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.2; // A bit higher for "Brett"
    window.speechSynthesis.speak(utterance);
  };

  const handleScan = async (voiceTranscript?: string) => {
    if (isScanning) return;
    setIsScanning(true);

    let imageData = capturedImage;

    if (videoRef.current && !capturedImage) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0);
        imageData = canvas.toDataURL('image/jpeg');
    }

    try {
      const formattedMode = mode === 'ar' ? 'AR' : mode.charAt(0).toUpperCase() + mode.slice(1);
      const result = await analyzeLensScan(formattedMode as any, { 
        mimeType: 'image/jpeg', 
        data: imageData || '' 
      }, voiceTranscript);
      setAnalysis(result);
      
      // Brett speaks!
      if (result.issues.length > 0) {
        speak(`Hey! I found ${result.issues.length} potential issues. Specifically, ${result.issues[0].label}. You might want to check it out.`);
      } else {
        speak("All systems appear within tolerance. Looking good, buddy!");
      }

    } catch (error) {
      console.error(error);
      speak("Ugh, my brain just glitched. Re-syncing uplink now.");
    } finally {
      setIsScanning(false);
    }
  };

  const [searchStatus, setSearchStatus] = useState('Standby');
  const searchPhrases = [
    'Scanning Neural Vectors...',
    'Analyzing Thermal Signatures...',
    'Checking Belt PSI Variance...',
    'Querying Global Facility Registry...',
    'Detecting Mechanical Slop...',
    'Verifying Nozzle Alignment...',
    'Assessing Cutter Arm Sync...',
    'Tracing Wago Handshake...',
    'Calibrating Optical Flow...',
    'Computing Volumetric Flowrate...',
    'Triangulating Parts Position...',
    'Executing Heuristic Diagnostic...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setSearchStatus(searchPhrases[Math.floor(Math.random() * searchPhrases.length)]);
      }, 800);
    } else {
      setSearchStatus('Uplink Synchronized');
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleScan(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-40">
      {/* Target/Focus Overlay */}
      <div className="absolute inset-0 border-[2px] border-white/10 pointer-events-none z-10">
          <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-brand-red/60" />
          <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-brand-red/60" />
          <div className="absolute bottom-32 left-4 w-12 h-12 border-b-2 border-l-2 border-brand-red/60" />
          <div className="absolute bottom-32 right-4 w-12 h-12 border-b-2 border-r-2 border-brand-red/60" />
      </div>

      {/* Viewfinder Header */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 text-white active:scale-95 transition-all mr-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-white flex items-center justify-center">
            <info.icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{info.name}</h3>
            <div className="flex items-center space-x-2 mt-1">
                <div className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${isScanning ? 'animate-ping' : ''}`} />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  {isScanning ? searchStatus : 'Uplink: Synchronized'}
                </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
            {isScanning && (
              <div className="flex flex-col items-end mr-4 hidden sm:flex">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-1 w-1 bg-brand-red animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <span className="text-[7px] font-black text-brand-red uppercase tracking-widest mt-1">Processing Neural Batch</span>
              </div>
            )}
            <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 ${isMuted ? 'text-slate-500' : 'text-emerald-500'} active:scale-95 transition-all`}
            >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <button 
                onClick={() => setAutoScan(!autoScan)}
                className={`p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 ${autoScan ? 'text-brand-red' : 'text-slate-500'} active:scale-95 transition-all`}
            >
                <RefreshCw className={`h-5 w-5 ${autoScan ? 'animate-spin-slow' : ''}`} />
            </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="absolute inset-0 flex items-center justify-center">
        {mode === 'poultry' && !capturedImage ? (
          <div className="flex flex-col items-center justify-center text-center p-10 z-20">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20 shadow-2xl">
                <ImageIcon className="h-10 w-10 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase mb-2 tracking-tight">Image Capture <span className="text-emerald-500">Required</span></h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10 max-w-xs">Upload product data for volumetric analysis.</p>
            <label className="bg-emerald-500 rounded-2xl px-12 py-5 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/30 cursor-pointer active:scale-95 transition-all">
                Select Photo
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                        const r = new FileReader();
                        r.onload = (ev) => setCapturedImage(ev.target?.result as string);
                        r.readAsDataURL(f);
                    }
                }} />
            </label>
            <button onClick={onClose} className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Return to Hub</button>
          </div>
        ) : (
          <div className={`relative w-full h-full transition-all duration-700 ${mode === 'thermal' ? 'grayscale brightness-110 contrast-125 saturate-200 sepia-[0.3] hue-rotate-[180deg]' : ''}`}>
            {capturedImage ? (
                <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
            ) : (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            )}

            {/* Neural Grids & Scanning Line */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] z-20" />
            
            {mode === 'scope' && (
              <div className="absolute inset-0 pointer-events-none z-30 opacity-40">
                <div className="absolute inset-x-10 top-1/4 h-px bg-white/20" />
                <div className="absolute inset-x-10 top-1/2 h-px bg-white/40" />
                <div className="absolute inset-x-10 top-3/4 h-px bg-white/20" />
                <div className="absolute inset-y-10 left-1/4 w-px bg-white/20" />
                <div className="absolute inset-y-10 left-1/2 w-px bg-white/40" />
                <div className="absolute inset-y-10 left-3/4 w-px bg-white/20" />
                
                {/* Waveform simulation elements */}
                <svg className="absolute inset-0 w-full h-full text-indigo-500/30">
                  <path d="M0 250 Q 50 200, 100 250 T 200 250 T 300 250 T 400 250" fill="none" stroke="currentColor" strokeWidth="1" className="animate-pulse" />
                  <path d="M0 300 Q 150 150, 300 300 T 600 300" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
                </svg>
              </div>
            )}

            {isScanning && (
                <div className="absolute inset-x-0 h-1.5 bg-brand-red shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-scan z-30" />
            )}

            {isScanning && (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-64 space-y-2 z-30 hidden md:block">
                {[...Array(20)].map((_, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: [0, 0.8, 0], x: [50, 0, -50] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.08 }}
                    className="text-[7px] font-mono text-emerald-500 uppercase whitespace-nowrap flex items-center space-x-2"
                  >
                    <span className="opacity-40">0x{Math.random().toString(16).substring(2, 6).toUpperCase()}</span>
                    <span className="text-emerald-400 font-black tracking-widest">SCANNING_BIT_{i}</span>
                    <span className="opacity-40">{Math.random().toFixed(4)}</span>
                  </motion.div>
                ))}
                
                <div className="mt-8 pt-8 border-t border-white/10">
                   <div className="flex items-center justify-between text-[8px] font-black text-white uppercase tracking-[0.2em] mb-2">
                      <span>Neural Load</span>
                      <span className="text-emerald-500">{(Math.random() * 100).toFixed(1)}%</span>
                   </div>
                   <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: ['20%', '80%', '40%', '95%', '60%'] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="h-full bg-brand-red shadow-[0_0_10px_rgba(225,29,72,0.8)]"
                      />
                   </div>
                </div>
              </div>
            )}

            {/* Detection Markers */}
            <AnimatePresence>
                {analysis?.issues.map((issue: any, index: number) => (
                    <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute z-40 pointer-events-auto"
                        style={{ left: `${issue.coords.x}%`, top: `${issue.coords.y}%` }}
                    >
                        {/* Outline Box */}
                        <div 
                            className={`w-32 h-32 border-2 rounded-xl -translate-x-1/2 -translate-y-1/2 shadow-2xl backdrop-blur-[2px] transition-all`}
                            style={{ borderColor: issue.color || 'red', backgroundColor: `${issue.color}15` || 'rgba(255,0,0,0.1)' }}
                        >
                            <div className="absolute -top-3 -left-3 h-6 w-6 border-t-2 border-l-2" style={{ borderColor: 'white' }} />
                            <div className="absolute -bottom-3 -right-3 h-6 w-6 border-b-2 border-r-2" style={{ borderColor: 'white' }} />
                            
                            {/* Label */}
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 border border-white/10 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                <p className="text-[10px] font-black text-white uppercase tracking-tighter leading-none">{issue.label}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 leading-none">{issue.severity} Severity</p>
                            </div>
                        </div>

                        {/* Interactive Dot */}
                        <motion.button 
                            whileHover={{ scale: 1.2 }}
                            onClick={() => setSelectedIssue(issue)}
                            className="absolute inset-0 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 group"
                        >
                            <div className="h-6 w-6 rounded-full bg-white shadow-2xl flex items-center justify-center">
                                <div className="h-3 w-3 rounded-full bg-brand-red animate-pulse" />
                            </div>
                        </motion.button>
                    </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Info Card for Selected Issue */}
      <AnimatePresence>
        {selectedIssue && (
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="absolute inset-x-8 bottom-32 bg-slate-950/95 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl z-50 max-w-xl mx-auto"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-6">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-brand-red flex items-center justify-center shadow-xl shadow-brand-red/20">
                            <AlertTriangle className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedIssue.label}</h4>
                            <p className="text-[10px] font-black text-brand-red uppercase tracking-widest mt-1">Status: Component Fault Detected</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedIssue(null)} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-6 mb-10">
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl italic text-slate-300 text-sm font-medium leading-relaxed">
                        "{selectedIssue.description}"
                        <p className="not-italic text-[9px] font-black text-slate-600 uppercase tracking-widest mt-4">Brett's Technical Reasoning: {selectedIssue.reason}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Diagnostic Command</p>
                        <div className="flex items-center space-x-4 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <Activity className="h-6 w-6 text-emerald-500" />
                            <p className="text-emerald-400 font-black uppercase text-sm leading-tight">{selectedIssue.recommendedAction}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button className="py-5 bg-brand-red text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-brand-red/20 active:scale-95 transition-all">
                        Log Repair
                    </button>
                    <button onClick={() => setSelectedIssue(null)} className="py-5 bg-white/5 border border-white/10 text-slate-500 font-black uppercase text-xs tracking-widest rounded-2xl active:scale-95 transition-all">
                        Dismiss
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Control Buttons */}
      <div className="absolute bottom-10 inset-x-8 flex space-x-4 z-40">
        <button 
           onClick={() => handleScan()}
           disabled={isScanning}
           className="flex-1 h-20 bg-brand-red rounded-[2rem] text-white font-black uppercase tracking-[0.4em] text-sm shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all disabled:opacity-50"
        >
            {isScanning ? <Loader2 className="h-7 w-7 animate-spin" /> : <Scan className="h-7 w-7" />}
            {isScanning ? 'Syncing...' : 'Brett Scan'}
        </button>
        <button 
           onClick={toggleListening}
           className={`w-20 h-20 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center active:scale-95 transition-all ${isListening ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white/10 text-white'}`}
        >
            {isListening ? <Mic className="h-7 w-7" /> : <MicOff className="h-7 w-7" />}
        </button>
      </div>

      <style>{`
        @keyframes scan { 0% { top: 0%; opacity: 0; } 50% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .animate-scan { animation: scan 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Lenses;
