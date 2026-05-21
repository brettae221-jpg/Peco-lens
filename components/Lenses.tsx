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
  Upload,
  Loader2,
  Volume2,
  VolumeX,
  Scan,
  RefreshCw,
  Mic,
  MicOff,
  Sparkles,
  Send,
  Download
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
    { id: 'poultry', name: 'Poultry Lens', icon: Eye, color: 'bg-emerald-500', machine: 'Trim & Yield Spec', active: true },
    { id: 'megajet', name: 'MegaJet Lens', icon: Droplet, color: 'bg-blue-500', machine: 'MegaJet Waterjets', active: true },
    { id: 'grasselli', name: 'Grasselli Lens', icon: Box, color: 'bg-orange-500', machine: 'GR-4.2 Skinners', active: true },
    { id: 'vision', name: 'Vision Sys Lens', icon: Zap, color: 'bg-purple-500', machine: 'Sortation Lines', active: true },
    { id: 'thermal', name: 'Thermal Lens', icon: Thermometer, color: 'bg-yellow-500', machine: 'Internal Parts', active: true },
    { id: 'calibration', name: 'Calibration Lens', icon: Target, color: 'bg-slate-600', machine: 'Maintenance Only', active: true },
    { id: 'scope', name: 'Live Scope', icon: Activity, color: 'bg-indigo-500', machine: 'MegaJet Diagnostics', active: true },
  ];

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar relative bg-slate-950">
      {/* Immersive Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-red/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-10 space-y-12 pb-32 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center space-x-8">
            <button 
              onClick={onBack}
              className="p-6 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 text-white active:scale-95 transition-all shadow-2xl group hover:bg-brand-red/20 hover:border-brand-red/30"
            >
              <ArrowLeft className="h-8 w-8 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h2 className="text-6xl font-black text-white uppercase tracking-tighter leading-none">System <span className="text-brand-red">Lenses</span></h2>
              <div className="flex items-center space-x-4 mt-4">
                 <div className="h-1 w-12 bg-brand-red rounded-full" />
                 <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.5em]">Neural Projection Hub</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-8 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem]">
             <div className="flex -space-x-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
             </div>
             <div className="h-8 w-px bg-white/10" />
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Health</p>
                <div className="flex items-center space-x-3">
                   <span className="text-xl font-black text-white">99.8%</span>
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pt-10">
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

const DEMO_TARGETS: Record<string, { name: string; description: string; svg: string; context: string }> = {
  megajet_belt: {
    name: "MegaJet Belt (Loose)",
    description: "Line 2 Cutter 4 carriage drive belt exhibiting severe slack (approx. 95 PSI against 140 PSI spec)",
    context: "PecoFoods MegaJet Cutter carriage assembly showing slack in the secondary cutter arm drive belt on Line 2. Severe belt slack, slipping, tension estimated at 95 PSI instead of targeted 140 PSI. Note: The nozzle cuts using high pressure water stream, not a mechanical blade; this belt drives relative X-Y robotic positioning.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%233b82f6" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%2360a5fa" font-size="12" font-weight="black">TARGET: MEGAJET MJ-L2-C4-BELT</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">RESOLUTION: SUB-PIXEL AR OPTICAL FLOW</text>
      <circle cx="130" cy="150" r="30" fill="none" stroke="%23475569" stroke-width="4" />
      <circle cx="130" cy="150" r="10" fill="none" stroke="%23475569" stroke-width="2" />
      <circle cx="270" cy="150" r="22" fill="none" stroke="%23475569" stroke-width="4" />
      <path d="M 130 120 Q 200 135, 270 128" fill="none" stroke="%23ea580c" stroke-width="6" stroke-linecap="round" />
      <path d="M 130 180 L 270 172" fill="none" stroke="%233b82f6" stroke-width="6" stroke-linecap="round" />
      <path d="M 200 128 L 200 102" fill="none" stroke="%23ef4444" stroke-width="2" stroke-dasharray="3 3" />
      <polygon points="200,128 196,120 204,120" fill="%23ef4444" />
      <text x="140" y="92" fill="%23ef4444" font-size="9" font-weight="black">SLACK SECTIONS: 95 PSI (SLIP WARNING)</text>
    </svg>`
  },
  megajet_nozzle: {
    name: "MJ-Nozzle (Blocked)",
    description: "Line 1 cutter nozzle showing orifice erosion, deflection, and irregular spray pattern",
    context: "MegaJet high-pressure cutter nozzle on Line 1. Blocked debris, water pressure irregular, nozzle deflection causing spray fan alignment deviation.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%233b82f6" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%233b82f6" font-size="12" font-weight="black">TARGET: MEGAJET MJ-L1-HP-NOZZLE</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">SPECTRAL FLOW VECTOR PROFILE</text>
      <rect x="175" y="70" width="50" height="70" fill="%231e293b" stroke="%23475569" stroke-width="2" />
      <path d="M 175 140 L 190 165 L 210 165 L 225 140 Z" fill="%23334155" stroke="%23475569" stroke-width="2" />
      <path d="M 200 165 Q 205 200, 235 255" fill="none" stroke="%23ef4444" stroke-width="4" stroke-linecap="round" />
      <path d="M 200 165 Q 197 200, 218 258" fill="none" stroke="%23ea580c" stroke-width="2" stroke-linecap="round" />
      <circle cx="200" cy="165" r="8" fill="none" stroke="%23ef4444" stroke-width="2" />
      <text x="220" y="170" fill="%23ef4444" font-size="8" font-weight="bold">ORIFICE EROSION / CLOG DETECTED</text>
    </svg>`
  },
  megajet_vwheel_slop: {
    name: "MJ V-Wheel (Slop)",
    description: "Line 3 Cutter 1 arm V-Wheel displaying bearing erosion and mechanical play/slop",
    context: "PecoFoods MegaJet Line 3 Cutter 1 V-Wheel mechanical slop. Wear and play detected in bearing. Lateral deviation measured at 0.85mm, resulting in cutter head wobble and non-straight cutting tracks on McNugget Strips.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%233b82f6" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">TARGET: MEGAJET MJ-L3-C1-V-WHEEL</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">BEARING DEFLECTION COMPLIANCE MONITOR</text>
      <circle cx="200" cy="150" r="60" fill="%231e293b" stroke="%23ea580c" stroke-width="4" />
      <circle cx="200" cy="150" r="30" fill="%230f172a" stroke="%23ef4444" stroke-width="2" stroke-dasharray="2 2" />
      <line x1="140" y1="150" x2="260" y2="150" stroke="%23ef4444" stroke-width="2" stroke-dasharray="4 4" />
      <line x1="200" y1="90" x2="200" y2="210" stroke="%23ef4444" stroke-width="2" stroke-dasharray="4 4" />
      <path d="M 197 142 Q 206 150, 203 158" fill="none" stroke="%23ef4444" stroke-width="3" />
      <text x="215" y="135" fill="%23ef4444" font-size="8" font-weight="black">PLAY: 0.85mm SLOP</text>
    </svg>`
  },
  megajet_intensifier_leak: {
    name: "MJ Intensifier (Leak)",
    description: "High pressure intensifier showing hydraulic seal failure and water bypass leak",
    context: "MegaJet high pressure intensifier pump. Low operating pressure, hyper-cycling, water bypass leaks identified on high-pressure plungers, sealing failure.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23ef4444" stroke-width="1.5" stroke-dasharray="5 5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">TARGET: MJ-PUMP-INTENSIFIER-HP-SEAL</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">HYDRAULIC ENERGY DEFICIT SIGNATURE</text>
      <rect x="100" y="100" width="200" height="100" rx="8" fill="%231e293b" stroke="%23ef4444" stroke-width="3" />
      <rect x="120" y="120" width="60" height="60" rx="4" fill="%23ef4444" fill-opacity="0.2" stroke="%23ef4444" stroke-width="2" />
      <text x="128" y="153" fill="%23ef4444" font-size="8" font-weight="black">HP SEAL BYPASS</text>
      <path d="M 180 150 Q 230 165, 260 180" fill="none" stroke="%2360a5fa" stroke-width="3" stroke-dasharray="3 3" />
      <text x="195" y="115" fill="%2394a3b8" font-size="8">CYCLE RHYTHM: HYPER-CYCLING</text>
    </svg>`
  },
  megajet_servo_delay: {
    name: "MJ Servo (Lag)",
    description: "Line 4 Cutter 3 tracking motor showing a 15ms command phase delay under high-speed load",
    context: "MegaJet Line 4 Cutter 3 servo motor tracking delay. Phase gap of 15ms detected on the Y-Axis encoder feed, resulting in edge tearing and rounded corners during McDonald's McCrispy cuts.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%233b82f6" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%233b82f6" font-size="12" font-weight="black">TARGET: MEGAJET MJ-L4-C3-Y-SERVO</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">HIGH-FREQUENCY FEEDBACK DRIFT</text>
      <path d="M 50 180 Q 150 70, 250 180 T 350 180" fill="none" stroke="%23ea580c" stroke-width="3" />
      <path d="M 65 180 Q 165 70, 265 180 T 365 180" fill="none" stroke="%23ef4444" stroke-width="2" stroke-dasharray="3 3" />
      <text x="180" y="110" fill="%23ef4444" font-size="8" font-weight="black">PHASE GAP: 15ms SIGNAL LAG</text>
    </svg>`
  },
  megajet_swivel: {
    name: "MJ Swivel (Leak)",
    description: "Line 2 Cutter 1 high pressure rotary swivel joint showing bypass leakage at 60k PSI",
    context: "PecoFoods MegaJet Line 2 Cutter 1 waterjet high-pressure swivel joint. Significant wear on internal high-grade carbon seals causing water spray at the rotating union under constant cycling.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%233b82f6" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">TARGET: MJ-L2-C1-HP-SWIVEL</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">ROTARY HIGH PRESSURE SEAL FLOW</text>
      <rect x="140" y="110" width="120" height="60" fill="%231e293b" stroke="%23475569" stroke-width="2" />
      <circle cx="200" cy="140" r="15" fill="none" stroke="%23ef4444" stroke-width="3" />
      <path d="M 215 140 Q 250 148, 280 160" fill="none" stroke="%2338bdf8" stroke-width="4" stroke-dasharray="3 2" />
      <text x="100" y="210" fill="%23ef4444" font-size="8" font-weight="bold">ROTATIONAL INTEGRITY BYPASS / 60,000 PSI FAILURE</text>
    </svg>`
  },
  megajet_accumulator: {
    name: "MJ Accumulator (Deficit)",
    description: "PecoFoods high-pressure water attenuator bottle displaying severe nitrogen precharge loss",
    context: "MegaJet hydraulic accumulator attenuation bottle. Low nitrogen buffer levels. Actual precharge is 450 PSI against standard 1100 PSI setting, resulting in rapid pressure spikes and water hammer.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%233b82f6" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">TARGET: MJ-PUMP-HP-ATTENUATOR-ACCUMULATOR</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">TRANSIENT WAVE PULSE CHARACTERIZATION</text>
      <path d="M 160 100 Q 200 60, 240 100 L 240 200 Q 200 220, 160 200 Z" fill="%231e293b" stroke="%23ef4444" stroke-width="3" />
      <line x1="160" y1="150" x2="240" y2="150" stroke="%23ef4444" stroke-width="2" stroke-dasharray="3 3" />
      <text x="172" y="135" fill="%23ef4444" font-size="8" font-weight="black">N2: 450 PSI</text>
      <text x="168" y="175" fill="%2310b981" font-size="8" font-weight="black">SPEC: 1100 PSI</text>
    </svg>`
  },
  megajet_sapphire: {
    name: "MJ Sapphire (Chipped)",
    description: "Cutter head sapphire orifice displaying micron-level structural edge fractures",
    context: "MegaJet waterjet sapphire cutting head orifice. Edge chip detected, water jet splitting, stream cohesion lost, high abrasive scattering causing unacceptable chicken edge roughness.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%233b82f6" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%233b82f6" font-size="12" font-weight="black">TARGET: MJ-SAPPHIRE-ORIFICE-0.007</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">ORIFICE EDGE MACRO INTERFEROMETRY</text>
      <circle cx="200" cy="150" r="40" fill="%231e293b" stroke="%23475569" stroke-width="3" />
      <circle cx="200" cy="150" r="10" fill="%23090d16" stroke="%23ef4444" stroke-width="2" />
      <path d="M 208 144 L 214 138 L 205 142 Z" fill="%23ef4444" stroke="%23ef4444" stroke-width="1" />
      <text x="145" y="220" fill="%23ef4444" font-size="8" font-weight="black">MICRON CHIP: BEAM STRATIFICATION</text>
    </svg>`
  },
  megajet_bleed_down: {
    name: "MJ Bleed Valve (Stuck)",
    description: "High pressure automatic safety dump bleed valve leaking to drain tank in active state",
    context: "MegaJet bleed-down valve. Fails to seal completely due to worn stem and seat. 4,000 PSI high-pressure feed continues escaping directly to drain layout during cutting sequence.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23ef4444" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">TARGET: MJ-DUMP-BLEED-DOWN-VALVE</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">HIGH VOLUMETRIC VALVE SHEAR MATRIX</text>
      <polygon points="150,110 250,110 200,160" fill="%231e293b" stroke="%23ef4444" stroke-width="2" />
      <rect x="190" y="160" width="20" height="40" fill="%23ef4444" fill-opacity="0.8" />
      <circle cx="200" cy="180" r="12" fill="none" stroke="%23ef4444" stroke-width="2" />
      <text x="135" y="230" fill="%23ef4444" font-size="8" font-weight="black">STUCK STEM DETECTED: WATER BYPASS GAP</text>
    </svg>`
  },
  megajet_gantry: {
    name: "MJ Gantry (Skewed)",
    description: "X and Y axis aluminum gantry beam misaligned or out of true orthogonality",
    context: "MegaJet Cutter Station structural gantry misalignment. X/Y orthogonal matrix deviation calculated at 1.45mm offset across the 1200mm span, causing slanted strip dimension variance.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%233b82f6" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%233b82f6" font-size="12" font-weight="black">TARGET: MJ-GANTRY-ORTHOGONALITY</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">SPATIAL AXIS CO-REPRESENTATION</text>
      <line x1="100" y1="220" x2="320" y2="180" stroke="%23ef4444" stroke-width="4" stroke-dasharray="2 1" />
      <line x1="100" y1="220" x2="320" y2="220" stroke="%2310b981" stroke-width="2" stroke-dasharray="4 4" />
      <text x="120" y="160" fill="%23ef4444" font-size="8" font-weight="black">GANTRY DEVIATION: 1.45mm SKEW ANGLE</text>
    </svg>`
  },
  grasselli_blade: {
    name: "GR Slicer Blade (Worn)",
    description: "Slicer premium grade blade showing micro-abrasions, high heat buildup, and blunt edge",
    context: "Grasselli NCL 4.2 slicer blade. Micro-abrasions, surface friction wear, dulled cutter edge, heat buildup on blade tracking cassette.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23f97316" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23f97316" font-size="12" font-weight="black">TARGET: GRASSELLI NCL-4.2-BLADE</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">BLADE CALIBRATION MATRIX STATUS</text>
      <rect x="50" y="130" width="300" height="20" fill="%23334155" stroke="%23475569" stroke-width="2" />
      <path d="M 50 150 L 60 160 L 70 150 L 80 160 L 90 150 L 100 160 L 110 150 L 120 160 L 130 150 L 140 160 L 150 150 L 160 160 L 170 150 L 180 160 L 190 150 L 200 160 L 210 150 L 220 160 L 230 150 L 240 160 L 250 150 L 260 160 L 270 150 L 280 160 L 290 150 L 300 160" fill="none" stroke="%23cbd5e1" stroke-width="2" />
      <circle cx="170" cy="155" r="15" fill="none" stroke="%23ef4444" stroke-width="2" />
      <text x="195" y="190" fill="%23ef4444" font-size="8" font-weight="black">ABRASIVE MICRO-FRACTURES</text>
    </svg>`
  },
  grasselli_conveyor: {
    name: "GR Conveyor (Drift)",
    description: "Slicer feed conveyor running off-center of nose roller, causing edge tracking wear",
    context: "Grasselli slicer feed conveyor running off-center. Misaligned tracking drift, nose-roller side-clash causing belt tearing.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23f97316" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23f97316" font-size="12" font-weight="black">TARGET: GRASSELLI NCL-CONVEYOR</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">FEED POSITION COMPLIANCE ANALYTICS</text>
      <rect x="80" y="110" width="30" height="110" rx="6" fill="%231e293b" stroke="%23475569" stroke-width="2" />
      <rect x="290" y="110" width="30" height="110" rx="6" fill="%231e293b" stroke="%23475569" stroke-width="2" />
      <rect x="95" y="118" width="210" height="94" fill="%23334155" fill-opacity="0.6" stroke="%23ef4444" stroke-width="2" />
      <path d="M 200 118 L 200 100" stroke="%23ef4444" stroke-width="2" />
      <text x="180" y="90" fill="%23ef4444" font-size="8" font-weight="black">ALIGN DRIFT: 8mm RIGHT</text>
    </svg>`
  },
  grasselli_nose_roller: {
    name: "GR Nose Roller (Seized)",
    description: "Line 5 slicer nose roller operating at 165°F thermal signature due to bearing seizure",
    context: "Grasselli Line 5 slicer nose roller. Bearing seizure identified on left side support roller. Normal operational range is 90°F-110°F; scanner reports 165°F. Definite friction warning leading to rapid feed belt failure.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23f97316" stroke-width="1.5" stroke-dasharray="5 5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">TARGET: GR-L5-NOSE-ROLLER-BEARING</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">THERMAL SCAN REGISTRY PROFILE</text>
      <rect x="80" y="130" width="240" height="40" rx="4" fill="%231e293b" stroke="%23475569" stroke-width="2" />
      <circle cx="95" cy="150" r="15" fill="%23ef4444" fill-opacity="0.8" />
      <circle cx="305" cy="150" r="10" fill="%2310b981" />
      <text x="120" y="145" fill="%23ef4444" font-size="8" font-weight="black">LEFT BEARING: 165°F (THERMAL SPIKE)</text>
      <text x="120" y="160" fill="%2310b981" font-size="8">RIGHT BEARING: 98°F (NOMINAL)</text>
    </svg>`
  },
  grasselli_thickness_plate: {
    name: "GR Slice Plate (Skew)",
    description: "Thickness adjustment plate showing 1.25mm left-to-right alignment deflection",
    context: "Grasselli slicer adjustable thickness guidance plate. Left-to-right uneven plate height detected. Skew measured at 1.25mm skew, resulting in wedge-shaped chicken fillets failing McCrispy QA checking.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23f97316" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23f97316" font-size="12" font-weight="black">TARGET: GRASSELLI ADJUSTABLE THICKNESS PLATE</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">CHASSIS PARALLELISM MATRIX</text>
      <line x1="50" y1="120" x2="350" y2="155" stroke="%23ef4444" stroke-width="5" />
      <line x1="50" y1="120" x2="350" y2="120" stroke="%2310b981" stroke-width="2" stroke-dasharray="4 4" />
      <text x="60" y="95" fill="%23ef4444" font-size="8" font-weight="black">PLATE OFFSET: 1.25mm THICKNESS SKEW</text>
    </svg>`
  },
  grasselli_tension_cyl: {
    name: "GR Tension Cylinder (Low)",
    description: "Slicer belt pneumatic tensioning cylinder showing a 25% internal pre-charge pressure drop",
    context: "Grasselli slicer feed belt tension pneumatic cylinder system. Internal seal degradation causing minor air bleed, reducing holding force on the feeder belt, causing high-load slippage.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23f97316" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">TARGET: GR-BELT-PNEUMATIC-TENSIONER</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">ACTUATOR PRESSURE FEED REGISTRY</text>
      <rect x="150" y="110" width="100" height="42" fill="%231e293b" stroke="%23ef4444" stroke-width="2" />
      <line x1="150" y1="131" x2="100" y2="131" stroke="%23ef4444" stroke-width="5" />
      <text x="110" y="100" fill="%23ef4444" font-size="8" font-weight="black">PRESSURE: 4.8 BAR (UNDER 6.5 SPEC)</text>
    </svg>`
  },
  grasselli_drive_motor: {
    name: "GR Slicer Motor (Hot)",
    description: "Blade drive motor operating at critical 180°F thermal profile under continuous stack load",
    context: "Grasselli main cutter stack driving asynchronous motor. Internal windings friction or partial phase imbalance generating high thermal load. Temperature measured at 180°F (critical warning limit is 160°F).",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23f97316" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">TARGET: GR-SLICER-DRIVE-MOTOR</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">MOTOR WINDINGS THERMAL PROFILE</text>
      <rect x="140" y="100" width="120" height="80" fill="%23ea580c" fill-opacity="0.9" stroke="%23ef4444" stroke-width="3" />
      <text x="150" y="145" fill="%23fff" font-size="10" font-weight="black">TEMP: 180°F (HIGH)</text>
    </svg>`
  },
  grasselli_hold_down: {
    name: "GR Hold Roller (Skew)",
    description: "Product hold-down dynamic spring roller displaying highly uneven compression pressure",
    context: "Grasselli slicer feed throat product hold-down assembly. Asymmetric spring displacement detected (Left: 22mm, Right: 12mm), causing fillets to compress and tear asymmetrically.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23f97316" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23f97316" font-size="12" font-weight="black">TARGET: GR-HOLD-DOWN-ASSEMBLY</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">SPRING COMPRESSION COEFFICIENT STATS</text>
      <line x1="80" y1="120" x2="320" y2="170" stroke="%23ef4444" stroke-width="6" />
      <circle cx="80" cy="120" r="10" fill="%23ef4444" />
      <circle cx="320" cy="170" r="10" fill="%233b82f6" />
      <text x="60" y="95" fill="%23ef4444" font-size="8" font-weight="bold">SPRING SKEW: ASYMMETRIC FILLET PRESS</text>
    </svg>`
  },
  grasselli_gripper: {
    name: "GR Gripper Belt (Damaged)",
    description: "Traction feed clearing belt displaying several damaged/frayed custom elastomer ribs",
    context: "Grasselli slicer upper gripper feed band. Frayed traction teeth on the underside. Two core ribs have completely broken off, allowing product back-slipping inside slicing cassette.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23f97316" stroke-width="1" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%23f97316" font-size="12" font-weight="black">TARGET: GR-L3-UPPER-GRIPPER-FEED-BAND</text>
      <text x="25" y="58" fill="%2394a3b8" font-size="8" font-weight="bold">CLEAT RETENTION AND RIB CONDITION</text>
      <rect x="60" y="120" width="280" height="15" rx="3" fill="%23334155" />
      <rect x="100" y="135" width="15" height="10" fill="%23334155" />
      <rect x="140" y="135" width="15" height="10" fill="%23ef4444" fill-opacity="0.8" />
      <rect x="180" y="135" width="15" height="10" fill="%23ef4444" fill-opacity      <text x="130" y="100" fill="%23ef4444" font-size="8" font-weight="bold">MISSING GRIP CLEATS: ROTATIONAL DRIFT</text>
    </svg>`
  }
};

const POULTRY_SPECIMENS: Record<string, { name: string; description: string; svg: string; context: string }> = {
  poultry_trim_spec: {
    name: "Clipped Breast Fillet (Trim Check)",
    description: "Chicken breast fillet showing excess fat margin on the left lateral border and partial skin remnants",
    context: "PecoFoods Poultry spec checker detecting unclipped fat trim margin under Pocahontas Line 3 vision scanner. Fat trim represents 5.8% of product mass, exceeding the 3.0% threshold. Requires operator clip correction.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%2310b981" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%2310b981" font-size="12" font-weight="black">POULTRY YIELD: TRIM SPECIMEN L3</text>
      <ellipse cx="200" cy="150" rx="100" ry="60" fill="%23fda4af" stroke="%23e11d48" stroke-width="2" />
      <path d="M 120 135 C 100 110, 140 110, 140 135 C 140 160, 100 160, 120 135 Z" fill="%23ffffff" fill-opacity="0.8" stroke="%23eab308" stroke-width="2" />
      <text x="110" y="100" fill="%23eab308" font-size="9" font-weight="extrabold">EXCESS UNCLIPPED FAT (5.8%)</text>
      <text x="110" y="240" fill="%23ef4444" font-size="9" font-weight="black">QA VERDICT: REJECTED (RE-TRIM REQUIRED)</text>
    </svg>`
  },
  poultry_yield_slicing: {
    name: "Precision Sliced Fillet (Yield Check)",
    description: "Butterflied breast fillet sliced on Grasselli KSL showing consistent 12mm thickness with minimal tearing",
    context: "PecoFoods Poultry yield inspection. 12mm slice thickness nominal test under high conveyor rate. Tearing of fibers less than 0.5%, perfect weight consistency of 135 grams.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%2310b981" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5" />
      <text x="25" y="40" fill="%2310b981" font-size="12" font-weight="black">POULTRY YIELD: GR-KSL-SLICED-FILLET</text>
      <ellipse cx="200" cy="150" rx="110" ry="50" fill="%23fda4af" stroke="%23e11d48" stroke-width="2" />
      <line x1="90" y1="150" x2="310" y2="150" stroke="%2310b981" stroke-width="1.5" stroke-dasharray="3 3" />
      <text x="140" y="135" fill="%2310b981" font-size="8" font-weight="extrabold">SLICE H-LINE 1 (12mm NOMINAL)</text>
      <text x="140" y="180" fill="%2310b981" font-size="9" font-weight="black">QA VERDICT: PASSED (OPTIMAL YIELD)</text>
    </svg>`
  },
  poultry_tearing_defect: {
    name: "Torn Muscular Fibers (Defect Check)",
    description: "Chicken fillet showing horizontal muscle tearing due to worn high-load skinning gripper",
    context: "PecoFoods Poultry surface analysis. Flesh tearing detected on outer breast lobe, caused by excessive friction or dull GR-4.2 skinning gripper. Defect area is 12mm x 8mm, affecting grade spec.",
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%" style="background:%23020617;font-family:monospace">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="%23334155" stroke-width="0.5" opacity="0.3"/>
        </pattern>
      </defs>
      <rect width="400" height="300" fill="url(%23grid)" />
      <rect x="10" y="10" width="380" height="280" fill="none" stroke="%23ef4444" stroke-width="1.5" stroke-dasharray="5 5" />
      <text x="25" y="40" fill="%23ef4444" font-size="12" font-weight="black">POULTRY DEFECT: FRAYED SURFACE FIBERS</text>
      <ellipse cx="200" cy="150" rx="105" ry="55" fill="%23fda4af" stroke="%23e11d48" stroke-width="2" />
      <path d="M 180 140 Q 190 145, 185 150 Q 200 155, 190 160 Q 215 145, 180 140" fill="%23ef4444" stroke="%23b91c1c" stroke-width="1.5" />
      <circle cx="195" cy="150" r="18" fill="none" stroke="%23ef4444" stroke-width="2" stroke-dasharray="2 2" />
      <text x="220" y="152" fill="%23ef4444" font-size="9" font-weight="black">MUSCLE FIBER TEARING (RE-GRADE)</text>
    </svg>`
  }
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
  const [selectedDemoKey, setSelectedDemoKey] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoScanTimer = useRef<NodeJS.Timeout | null>(null);
  const [selectedMegajet, setSelectedMegajet] = useState('MegaJet System - Line 1');
  const [selectedGrasselli, setSelectedGrasselli] = useState('Grasselli KSL Slicer');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const canvasSimRef = useRef<HTMLCanvasElement>(null);

  // Advanced Interactive AI States
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [questionText, setQuestionText] = useState('');
  const [lastAskedQuestion, setLastAskedQuestion] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const getSuggestedQueries = (m: LensView) => {
    switch (m) {
      case 'megajet':
        return [
          "is this v wheel bad",
          "What is the status of the carriage belt?",
          "Is the sapphire orifice chipped?",
          "Is the high-pressure swivel joint leaking?"
        ];
      case 'poultry':
        return [
          "Are there fat trim defects in this breast fillet?",
          "Is the sliced fillet yield optimal?",
          "Does this muscle fillet show surface tearing?"
        ];
      case 'grasselli':
        return [
          "What is this servo scope saying?",
          "Is the feed-belt tracking off-center?",
          "Are the gripper band cleats worn?"
        ];
      case 'thermal':
        return [
          "Which nose roller bearing is overheating?",
          "Is the drive motor temperature too hot?"
        ];
      case 'scope':
        return [
          "What is this servo scope saying?",
          "What is causing the positioning oscillations?"
        ];
      default:
        return [
          "Is this part out of spec or bad?",
          "Check alignment and physical tolerances."
        ];
    }
  };

  const handleSavePicture = () => {
    let finalDataUrl = capturedImage;
    
    if (!finalDataUrl && videoRef.current && isCameraActive) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 1280;
        canvas.height = videoRef.current.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0);
        finalDataUrl = canvas.toDataURL('image/png');
      } catch (err) {
        console.error("Failed to capture video frames for saving:", err);
      }
    } else if (!finalDataUrl && canvasSimRef.current) {
      try {
        finalDataUrl = canvasSimRef.current.toDataURL('image/png');
      } catch (err) {}
    }

    if (finalDataUrl) {
      const link = document.createElement('a');
      link.href = finalDataUrl;
      link.download = `PecoFoods_${mode}_lens_capture_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      speak("Snapshot saved to your device rolls.");
    } else {
      speak("Unable to capture active frame buffer.");
    }
  };

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

  // Reset state on lens type changes
  useEffect(() => {
    setCapturedImage(null);
    setSelectedDemoKey(null);
    setAnalysis(null);
    setIsScanning(false);
    setQuestionText('');
    setLastAskedQuestion(null);
    setCameraError(null);
  }, [mode]);

  useEffect(() => {
    if (mode === 'poultry') {
      setIsCameraActive(false);
      return;
    }

    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      setCameraError(null);

      // Secure context validation (HTTPS/localhost check)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Security restriction: Device Web API 'mediaDevices' is unavailable. Browsers completely disable camera and microphone streams on insecure HTTP deployments. Please connect via HTTPS (e.g., https://) or test on http://localhost.");
        setIsCameraActive(false);
        return;
      }

      try {
        // Attempt higher quality chosen/facing camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        activeStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraActive(true);
      } catch (err) {
        console.warn(`Chosen camera (${facingMode}) failed, trying fallback...`, err);
        try {
          // Attempt general dynamic camera
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: facingMode } 
          });
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setIsCameraActive(true);
        } catch (err2) {
          console.warn("Facing dynamic camera failed, trying any stream...", err2);
          try {
            // Attempt any camera stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            activeStream = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
            setIsCameraActive(true);
          } catch (err3: any) {
            console.error("Camera permissions completely denied or unavailable:", err3);
            setIsCameraActive(false);
            if (err3 && (err3.name === 'NotAllowedError' || err3.name === 'PermissionDeniedError')) {
              setCameraError("Camera access denied. Site permissions are blocked. Tap the lock/info icon next to the address bar in your browser to grant device camera and microphone access.");
            } else {
              setCameraError(`Camera connection failed: ${err3?.message || "Unknown hardware error."} Make sure no other application is using your camera.`);
            }
          }
        }
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current?.srcObject) {
        try {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        } catch (_) {}
      }
      setIsCameraActive(false);
    };
  }, [mode, facingMode, retryTrigger]);

  useEffect(() => {
    if (autoScan && !isScanning) {
      // First scan at 1500ms, subsequent continuous scans at 6000ms (6s interval)
      const delay = analysis ? 6000 : 1500;
      autoScanTimer.current = setTimeout(() => handleScan(), delay);
    } else {
      if (autoScanTimer.current) clearTimeout(autoScanTimer.current);
    }
    return () => { if (autoScanTimer.current) clearTimeout(autoScanTimer.current); };
  }, [autoScan, isScanning, analysis]);

  const speak = (text: string) => {
    setSubtitle(text);
    setTimeout(() => setSubtitle(null), 5000);
    
    if (isMuted) return;
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
        // Cancel previous speaking to prevent cues queuing up indefinitely
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 1.2; // A bit higher for "Brett"
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.warn("Speech synthesis unavailable or blocked:", err);
    }
  };

  const handleScan = async (voiceTranscript?: string) => {
    if (isScanning) return;
    setIsScanning(true);

    let imageData = capturedImage;
    const finalQuestion = voiceTranscript || questionText;
    setLastAskedQuestion(finalQuestion || "General Surface Scan");
    setQuestionText('');

    let scanContext = finalQuestion || "Is there anything faulty, broken, misaligned, or out of spec in this view?";

    // Embed current model selection as hardware telemetry state
    const targetTelemetry = `[SCAN COMPREHENSION TARGET SPECIFICATION: Active MegaJet Unit under scan: ${selectedMegajet}. Active Grasselli Unit under scan: ${selectedGrasselli}]`;
    scanContext = `${scanContext} // ${targetTelemetry}`;

    if (selectedDemoKey && DEMO_TARGETS[selectedDemoKey]) {
      const demo = DEMO_TARGETS[selectedDemoKey];
      scanContext = `${scanContext} // Simulated sensor target loaded - Component Name: ${demo.name}, Description: ${demo.description}, Details: ${demo.context}`;
    }

    if (!capturedImage) {
        if (isCameraActive && videoRef.current) {
            if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
                // Camera stream is still booting up; gracefully defer and retry in 1s
                setIsScanning(false);
                if (autoScan) {
                    if (autoScanTimer.current) clearTimeout(autoScanTimer.current);
                    autoScanTimer.current = setTimeout(() => handleScan(), 1000);
                }
                return;
            }
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            imageData = canvas.toDataURL('image/jpeg');
        } else if (canvasSimRef.current) {
            // Snaps directly from the active live simulation canvas!
            imageData = canvasSimRef.current.toDataURL('image/jpeg');
        }
    }

    try {
      const formattedMode = mode === 'ar' ? 'AR' : mode.charAt(0).toUpperCase() + mode.slice(1);
      
      // Dynamically detect MIME template/type
      let mimeType = 'image/jpeg';
      if (imageData && imageData.includes('image/png')) {
        mimeType = 'image/png';
      } else if (imageData && (imageData.includes('image/svg+xml') || imageData.startsWith('data:image/svg+xml'))) {
        mimeType = 'image/svg+xml';
      }

      const result = await analyzeLensScan(formattedMode as any, { 
        mimeType: mimeType, 
        data: imageData || '' 
      }, scanContext);
      
      setAnalysis(result);
      
      // Brett speaks the full conversational evaluation!
      if (result.analysis) {
        speak(result.analysis);
      } else if (result.issues.length > 0) {
        speak(`Attention operator. Found potential hardware concern. Specifically: ${result.issues[0].label}.`);
      } else {
        speak("Mechanical scan completed. Telemetry and structural thresholds appear normal.");
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
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.warn("Speech recognition error stopping:", err);
      }
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        } else {
          speak("Interactive voice commands are not supported on this device. Use camera scan instead!");
        }
      } catch (err) {
        console.warn("Speech recognition error starting:", err);
        setIsListening(false);
      }
    }
  };

  // High-Fidelity Animated Canvas Live Simulation Loop
  useEffect(() => {
    if (isCameraActive || capturedImage || !canvasSimRef.current) return;

    const canvas = canvasSimRef.current;
    let animFrameId: number;
    let chickenX = 0;
    let rotationAngle = 0;
    let pulseOpacity = 1;
    let pulseDir = -1;
    
    // Resize the canvas to fit its bounds
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 800;
      canvas.height = rect.height || 600;
    };
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Clean Slate
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, w, h);

      // Draw Tech Grid
      ctx.strokeStyle = '#33415515';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Update parameters
      chickenX = (chickenX + 1.5) % (w + 200);
      rotationAngle = (rotationAngle + 0.02) % (Math.PI * 2);
      pulseOpacity += pulseDir * 0.015;
      if (pulseOpacity <= 0.3 || pulseOpacity >= 1) pulseDir *= -1;

      // Draw specific layouts depending on the active mode
      if (mode === 'scope') {
        // OSCILLOSCOPE DRAWING
        ctx.fillStyle = '#090d16';
        ctx.fillRect(20, 20, w - 40, h - 40);
        ctx.strokeStyle = '#33415533';
        ctx.lineWidth = 1;
        // Inner grid
        for (let ix = 20; ix < w - 20; ix += gridSize) {
          ctx.beginPath(); ctx.moveTo(ix, 20); ctx.lineTo(ix, h - 20); ctx.stroke();
        }
        for (let iy = 20; iy < h - 20; iy += gridSize) {
          ctx.beginPath(); ctx.moveTo(20, iy); ctx.lineTo(w - 20, iy); ctx.stroke();
        }

        // Channels
        const now = Date.now();
        
        ctx.lineWidth = 2;
        
        // Orange: Command Position
        ctx.strokeStyle = '#f97316';
        ctx.beginPath();
        for (let x = 20; x < w - 20; x++) {
          const val = h / 2 + Math.sin((x + now / 15) * 0.015) * 50;
          if (x === 20) ctx.moveTo(x, val); else ctx.lineTo(x, val);
        }
        ctx.stroke();

        // White: Actual position with slight noise/lag
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        for (let x = 20; x < w - 20; x++) {
          const lagOffset = -15; // 15ms lag
          const val = h / 2 + Math.sin((x + lagOffset + now / 15) * 0.015) * 50 + Math.sin(x * 0.2) * 2;
          if (x === 20) ctx.moveTo(x, val); else ctx.lineTo(x, val);
        }
        ctx.stroke();

        // Yellow: Velocity
        ctx.strokeStyle = '#eab308';
        ctx.beginPath();
        for (let x = 20; x < w - 20; x++) {
          const val = h * 0.75 + Math.cos((x + now / 10) * 0.02) * 20 + Math.random() * 3;
          if (x === 20) ctx.moveTo(x, val); else ctx.lineTo(x, val);
        }
        ctx.stroke();

        // Purple: Noise
        ctx.strokeStyle = '#a855f7';
        ctx.beginPath();
        for (let x = 20; x < w - 20; x++) {
          const val = h * 0.25 + (Math.sin((x + now / 5) * 0.05) * 10 + Math.random() * 8);
          if (x === 20) ctx.moveTo(x, val); else ctx.lineTo(x, val);
        }
        ctx.stroke();

        // Channel labels
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('COMMAND POSITION (ORANGE)', 30, h - 35);
        ctx.fillText('ACTUAL POSITION (WHITE)', 30, h - 25);
        ctx.fillText('VELOCITY ENCODER (YELLOW)', 200, h - 35);
        ctx.fillText('COUPLING NOISE FLUCTUATION (PURPLE)', 200, h - 25);

      } else {
        // CONVEYOR-BASED LENSES (ar, poultry, megajet, grasselli, vision, thermal, calibration)
        
        // Draw the conveyor track itself
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h / 2 - 45, w, 90);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 4;
        ctx.strokeRect(-10, h / 2 - 45, w + 20, 90);

        // Draw rollers on the left and right
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(40, h / 2, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(w - 40, h / 2, 40, 0, Math.PI * 2);
        ctx.fill();

        // Draw chicken fillets moving across
        for (let i = 0; i < 4; i++) {
          const cx = (chickenX + i * 280) % (w + 200) - 100;
          const cy = h / 2;

          // Chicken shape
          ctx.fillStyle = '#fda4af'; // warm raw pink
          ctx.beginPath();
          ctx.ellipse(cx, cy, 55, 32, 0.05, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Highlight specific overlays per lens
          if (mode === 'poultry') {
            // Draw trim inspection contours
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 40, 22, -0.05, 0, Math.PI * 2);
            ctx.stroke();

            // Fat spot
            ctx.fillStyle = '#ffffffdd';
            ctx.beginPath();
            ctx.arc(cx - 20, cy + 5, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ef4444';
            ctx.stroke();

            ctx.fillStyle = '#ef4444';
            ctx.font = '9px monospace';
            ctx.fillText('FAT: 4.8%', cx - 40, cy + 25);

            // Weight label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('142g (QA_OK)', cx - 25, cy - 12);
          } else if (mode === 'ar') {
            // Overlay rectangles
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(cx - 60, cy - 36, 120, 72);
            
            ctx.fillStyle = '#020617ee';
            ctx.fillRect(cx - 55, cy - 50, 110, 12);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 7px monospace';
            ctx.fillText('PRODUCT_SEGMENT_AR_TRUE', cx - 50, cy - 42);
          } else if (mode === 'vision') {
            // Lane mapping
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx - 58, cy - 34, 116, 68);
            
            // Draw scan crosshair
            ctx.beginPath();
            ctx.moveTo(cx - 10, cy); ctx.lineTo(cx + 10, cy);
            ctx.moveTo(cx, cy - 10); ctx.lineTo(cx, cy + 10);
            ctx.strokeStyle = '#a855f7';
            ctx.stroke();
          } else if (mode === 'thermal') {
            // Replace chicken color with yellow thermal blob
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.ellipse(cx, cy, 55, 32, 0.05, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(cx - 15, cy - 5, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('CORE: 41°F', cx - 25, cy + 5);
          }
        }

        // MODE SPECIFIC STATIONARY OVERLAYS

        if (mode === 'megajet') {
          // MegaJet high-pressure water cutter nozzle mechanism
          ctx.fillStyle = '#334155';
          ctx.fillRect(w / 2 - 30, h / 2 - 120, 60, 40);
          ctx.fillStyle = '#64748b';
          ctx.fillRect(w / 2 - 8, h / 2 - 80, 16, 30);
          
          // Animate jet
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2 - 50);
          ctx.lineTo(w / 2, h / 2);
          ctx.stroke();

          // Spray mist particles (fine lines/dots)
          ctx.fillStyle = '#38bdf8';
          for (let pi = 0; pi < 12; pi++) {
            ctx.beginPath();
            ctx.arc(w / 2 + (Math.random() - 0.5) * 16, h / 2 + Math.random() * 20, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Mechanical labels
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`Cutter Unit: ${selectedMegajet.split(' ')[0]}`, w / 2 + 40, h / 2 - 100);
          ctx.fillText('JET SEALS: NOMINAL', w / 2 + 40, h / 2 - 85);
          ctx.fillText('PSI: 60,000 OK', w / 2 + 40, h / 2 - 70);

          // Pointer line
          ctx.strokeStyle = '#38bdf833';
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2 - 80);
          ctx.lineTo(w / 2 + 35, h / 2 - 103);
          ctx.stroke();

        } else if (mode === 'grasselli') {
          // Slicer rotating blades stack representation
          ctx.fillStyle = '#475569';
          ctx.fillRect(w / 2 - 40, h / 2 - 110, 80, 30);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;

          // Draw rotating lines representing moving blades
          ctx.save();
          ctx.translate(w / 2, h / 2 - 95);
          ctx.rotate(rotationAngle);
          for (let rx = 0; rx < 4; rx++) {
            ctx.beginPath();
            ctx.moveTo(-25, 0); ctx.lineTo(25, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / 4);
          }
          ctx.restore();

          // Standard Grasselli telemetry values
          ctx.fillStyle = '#f97316';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`Slicer model: ${selectedGrasselli}`, w / 2 + 50, h / 2 - 100);
          ctx.fillText('BLADE ENGAGEMENT: active', w / 2 + 50, h / 2 - 85);
          ctx.fillText('TENSION SEALS: ok', w / 2 + 50, h / 2 - 70);
          
        } else if (mode === 'vision') {
          // Sharp red laser projector
          ctx.fillStyle = '#334155';
          ctx.fillRect(w / 2 - 15, 40, 30, 20);

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(w / 2, 60);
          ctx.lineTo(w / 2, h - 40);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset shadow

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('TRIANGULATION LASER ENABLED', w / 2 + 20, 80);
          ctx.fillText('CAMERA FRAME SYNC: 100%', w / 2 + 20, 95);

        } else if (mode === 'thermal') {
          // Overlay hot spots inside motors or gearboxes
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(60, h / 2 - 60, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px monospace';
          ctx.fillText('TR-L5-MOTOR: 165°F', 65, h / 2 - 90);
          ctx.fillText('WARNING: HEAT OVERLOAD', 65, h / 2 - 76);

          // Cooler lines
          ctx.fillStyle = '#3b82f6';
          ctx.fillRect(w - 120, h - 80, 80, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillText('COOLANT INTAKE', w - 110, h - 90);

        } else if (mode === 'calibration') {
          // Crosshairs
          ctx.strokeStyle = '#00ffcc';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(w / 2, 20); ctx.lineTo(w / 2, h - 20);
          ctx.moveTo(20, h / 2); ctx.lineTo(w - 20, h / 2);
          ctx.stroke();

          // Calibration circles
          ctx.strokeStyle = '#00ffcc';
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 100, 0, Math.PI * 2);
          ctx.arc(w / 2, h / 2, 200, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]); // reset

          ctx.fillStyle = '#00ffcc';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('SYS CALIBRATION STEERING: 0.00°', w / 2 + 10, h / 2 - 10);
          ctx.fillText('ALIGNMENT TRUE MATRIX: 1.0000', w / 2 + 10, h / 2 + 15);
        } else if (mode === 'ar') {
          // General factory environment overlay
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 10px monospace';
          ctx.fillText('AR OVERLAYS STATUS: PROJECTION_ON', 30, 60);
          ctx.fillText('FACILITY REGISTRY FEED: ACTIVE', 30, 75);
        }
      }

      // Scanner Visor bounds / details
      ctx.strokeStyle = 'rgba(225,29,72,' + (pulseOpacity * 0.4) + ')';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, w - 60, h - 60);

      // AI telemetry text overlay on outer border
      ctx.fillStyle = '#64748b';
      ctx.font = '7px monospace';
      ctx.fillText('UPLINK FEED: 10GBit OPTICAL', 40, h - 40);
      ctx.fillText(`SCAN TYPE: ${mode.toUpperCase()} LENS - DIGITAL STREAM`, w - 220, h - 40);

      animFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mode, isCameraActive, capturedImage, selectedMegajet, selectedGrasselli]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden z-[70]">
      {/* Target/Focus Overlay */}
      <div className="absolute inset-0 border-[2px] border-white/5 pointer-events-none z-10">
          <div className="absolute top-10 left-10 w-24 h-24 border-t-4 border-l-4 border-brand-red/40 rounded-tl-3xl" />
          <div className="absolute top-10 right-10 w-24 h-24 border-t-4 border-r-4 border-brand-red/40 rounded-tr-3xl" />
          <div className="absolute bottom-40 left-10 w-24 h-24 border-b-4 border-l-4 border-brand-red/40 rounded-bl-3xl" />
          <div className="absolute bottom-40 right-10 w-24 h-24 border-b-4 border-r-4 border-brand-red/40 rounded-br-3xl" />
      </div>

      {/* Subtitles / AI Transcript */}
      <AnimatePresence>
        {subtitle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-44 inset-x-8 z-[80] flex justify-center pointer-events-none"
          >
            <div className="bg-black/80 backdrop-blur-3xl border border-white/10 px-8 py-5 rounded-[2rem] max-w-2xl text-center shadow-2xl">
               <p className="text-white font-medium text-lg leading-relaxed italic">"{subtitle}"</p>
               <div className="flex items-center justify-center space-x-2 mt-3">
                  <div className="h-1 w-8 bg-brand-red rounded-full" />
                  <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">Brett Intelligence</span>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Viewfinder Header */}
      <div className="absolute top-0 inset-x-0 p-8 flex justify-between items-start z-50">
        <div className="flex items-center space-x-8">
          <button 
            onClick={onClose}
            className="p-6 bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/10 text-white active:scale-95 transition-all shadow-2xl hover:bg-white/20"
          >
            <ArrowLeft className="h-8 w-8" />
          </button>
          
          <div className="flex items-center space-x-6">
             <div className="p-5 bg-brand-red/20 backdrop-blur-3xl rounded-3xl border border-brand-red/30 text-brand-red">
               <info.icon className="h-8 w-8" />
             </div>
             <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{info.name}</h3>
                <div className="flex items-center space-x-3 mt-2">
                    <div className={`h-2 w-2 rounded-full bg-emerald-500 ${isScanning ? 'animate-ping' : ''}`} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">
                      {isScanning ? searchStatus : 'Uplink: Synchronized'}
                    </p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
            <div className="hidden lg:flex flex-col items-end mr-6">
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Neural Bandwidth</p>
               <div className="flex space-x-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: isScanning ? [8, 20, 8] : 8 }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                      className="w-1 bg-brand-red rounded-full opacity-40 hover:opacity-100 transition-opacity"
                    />
                  ))}
               </div>
            </div>

            {/* Neural Assistant Core (Brett Avatar) */}
            <div className="relative group">
              <div className={`h-20 w-20 rounded-[2rem] bg-slate-900 border border-white/10 flex items-center justify-center relative overflow-hidden transition-all duration-700 ${isScanning ? 'scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)] border-brand-red/50' : ''}`}>
                 <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <motion.div 
                   animate={{ 
                     scale: isScanning ? [1, 1.2, 1] : 1,
                     rotate: isScanning ? [0, 90, 0] : 0
                   }}
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="relative z-10"
                 >
                    <div className="h-10 w-10 border-4 border-brand-red rounded-xl rotate-45 flex items-center justify-center">
                       <div className="h-4 w-4 bg-brand-red rounded-full" />
                    </div>
                 </motion.div>
                 
                 {/* Visualized "Brain Waves" */}
                 {isScanning && (
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-full border-2 border-brand-red/20 rounded-full animate-ping" />
                   </div>
                 )}
              </div>
            </div>
        </div>
      </div>

      {/* Interactive Simulator / Input Hub */}
      <div className="absolute top-28 inset-x-8 z-50 flex items-center justify-start space-x-3 overflow-x-auto no-scrollbar py-2.5 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-2xl px-5 shadow-2xl">
        {mode === 'poultry' ? (
          <>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap mr-2 flex items-center flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Poultry Specimen:
            </span>

            {/* Custom Poultry Select Button */}
            <label
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all whitespace-nowrap flex items-center space-x-2 ${capturedImage && !selectedDemoKey ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30' : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload Specimen Photo</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setCapturedImage(ev.target?.result as string);
                      setSelectedDemoKey(null);
                      setAnalysis(null);
                      speak("Custom poultry spec photo loaded. Running AI yield inspection!");
                      setTimeout(() => handleScan(), 450);
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </label>

            <div className="h-6 w-px bg-white/15 flex-shrink-0 mx-2" />
            
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap mr-1">
              Select Test Specimen:
            </span>

            {Object.entries(POULTRY_SPECIMENS).map(([key, value]) => {
              const isSelected = selectedDemoKey === key;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setCapturedImage(value.svg);
                    setSelectedDemoKey(key);
                    setAnalysis(null);
                    speak(`Loading poultry specimen preset: ${value.name}. Running AI inspection...`);
                    setTimeout(() => {
                      handleScan();
                    }, 400);
                  }}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap flex items-center space-x-2 ${isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black' : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                  <span>{value.name}</span>
                </button>
              );
            })}
          </>
        ) : (
          <>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap mr-2 flex items-center flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-red mr-2 animate-pulse" />
              Scanner Feed:
            </span>

            {/* MegaJet Model Selector */}
            {mode === 'megajet' && (
              <div className="flex items-center space-x-2 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1 flex-shrink-0 shadow-inner">
                <Droplet className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">MJ Machine Spec</span>
                  <select
                    value={selectedMegajet}
                    onChange={(e) => {
                      setSelectedMegajet(e.target.value);
                      speak(`Uplink targeting ${e.target.value}`);
                    }}
                    className="bg-transparent text-white font-black text-[9px] uppercase tracking-wider focus:outline-none cursor-pointer pr-4 border-0 py-0 leading-tight"
                  >
                    <option value="MegaJet System (Line 1)" className="bg-slate-950 text-white">MegaJet Line 1</option>
                    <option value="MegaJet System (Line 2)" className="bg-slate-950 text-white">MegaJet Line 2</option>
                    <option value="MegaJet System (Line 3)" className="bg-slate-950 text-white">MegaJet Line 3</option>
                    <option value="MegaJet System (Line 4)" className="bg-slate-950 text-white">MegaJet Line 4</option>
                    <option value="MegaJet System (Line 5)" className="bg-slate-950 text-white">MegaJet Line 5</option>
                    <option value="MegaJet System (Line 6)" className="bg-slate-950 text-white">MegaJet Line 6</option>
                  </select>
                </div>
              </div>
            )}

            {/* Grasselli Model Selector */}
            {mode === 'grasselli' && (
              <div className="flex items-center space-x-2 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1 flex-shrink-0 shadow-inner">
                <Box className="h-3.5 w-3.5 text-orange-400 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none">GR Machine Spec</span>
                  <select
                    value={selectedGrasselli}
                    onChange={(e) => {
                      setSelectedGrasselli(e.target.value);
                      speak(`Uplink targeting ${e.target.value}`);
                    }}
                    className="bg-transparent text-white font-black text-[9px] uppercase tracking-wider focus:outline-none cursor-pointer pr-4 border-0 py-0 leading-tight"
                  >
                    <option value="Grasselli KSL Slicer" className="bg-slate-950 text-white">Grasselli KSL Slicer</option>
                    <option value="Grasselli GR-4.2 Skinner" className="bg-slate-950 text-white">Grasselli GR-4.2 Skinner</option>
                    <option value="Grasselli NCL-4.2 Continuous" className="bg-slate-950 text-white">Grasselli NCL-4.2</option>
                    <option value="Grasselli SL-600 Dicer" className="bg-slate-950 text-white">Grasselli SL-600 Dicer</option>
                  </select>
                </div>
              </div>
            )}

            <div className="h-6 w-px bg-white/15 flex-shrink-0" />

            {/* Live Camera Scanner Option */}
            <button
              onClick={() => {
                setCapturedImage(null);
                setSelectedDemoKey(null);
                setAnalysis(null);
                speak("Live on-air production camera scan active.");
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap flex items-center space-x-2 ${!capturedImage ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/30' : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Real Live Scan Feed</span>
            </button>

            {/* Custom live hardware file upload scan toggle */}
            <label
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all whitespace-nowrap flex items-center space-x-2 ${capturedImage && !selectedDemoKey ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Scan Custom Frame</span>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setCapturedImage(ev.target?.result as string);
                      setSelectedDemoKey(null);
                      setAnalysis(null);
                      speak("Custom live camera frame loaded successfully. Triggering diagnostic scan!");
                      setTimeout(() => handleScan(), 300);
                    };
                    reader.readAsDataURL(file);
                  }
                }} 
              />
            </label>

            {/* Contextually relevant signature injection buttons specifically for testing/diagnostics */}
            {(mode === 'megajet' || mode === 'grasselli') && (
              <>
                <div className="h-4 w-px bg-white/15 flex-shrink-0 mx-2" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Diagnostic Injector:</span>
                {Object.entries(DEMO_TARGETS)
                  .filter(([key]) => {
                    if (mode === 'megajet') return key.startsWith('megajet_');
                    if (mode === 'grasselli') return key.startsWith('grasselli_');
                    return false;
                  })
                  .map(([key, value]) => {
                    const isSelected = selectedDemoKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setCapturedImage(value.svg);
                          setSelectedDemoKey(key);
                          setAnalysis(null);
                          speak(`Injecting waterjet/slicer hardware fault: ${value.name}.`);
                          setTimeout(() => {
                            handleScan();
                          }, 350);
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap flex items-center space-x-2 ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black' : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <span>{value.name}</span>
                      </button>
                    );
                  })}
              </>
            )}
          </>
        )}
      </div>

      {/* Main Viewport */}
      <div className="absolute inset-0 flex items-center justify-center pt-24">
        <div className={`relative w-full h-full transition-all duration-700 ${mode === 'thermal' ? 'grayscale brightness-110 contrast-125 saturate-200 sepia-[0.3] hue-rotate-[180deg]' : ''}`}>
            {mode === 'poultry' && !capturedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 p-12 text-center z-10 relative">
                    <div className="max-w-xl bg-slate-900 border border-white/10 rounded-[3rem] p-12 flex flex-col items-center space-y-8 shadow-2xl">
                        <div className="p-8 bg-emerald-500/10 text-emerald-400 rounded-[2rem] border border-emerald-500/20">
                            <Eye className="h-16 w-16" />
                        </div>
                        <div>
                         <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Poultry Specimen Yield Inspect</h3>
                         <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                           Yield and trim evaluation lens. Drag & drop or select raw chicken fillets, breast carcasses, or specimen slice photos to inspect fat trim ratio, structural tearing, and volumetric compliance.
                         </p>
                        </div>
                        <label className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black uppercase tracking-widest text-xs px-8 py-4 rounded-full cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
                            Select Poultry Image File
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    setCapturedImage(ev.target?.result as string);
                                    setSelectedDemoKey(null);
                                    setAnalysis(null);
                                    speak("Poultry product photo loaded. Running AI evaluation checks.");
                                    setTimeout(() => handleScan(), 500);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }} 
                            />
                        </label>
                        <div className="flex items-center space-x-3 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                           <span>or select a specimen preset on the input bar</span>
                        </div>
                    </div>
                </div>
            ) : capturedImage ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 p-6">
                  {capturedImage.startsWith('data:image/svg+xml') ? (
                    <div className="w-full max-w-2xl aspect-[4/3] rounded-[2rem] overflow-hidden border border-white/15 shadow-2xl relative">
                      <iframe src={capturedImage} className="w-full h-full pointer-events-none border-0" title="Schematic" />
                    </div>
                  ) : (
                    <img src={capturedImage} className="w-full h-full object-contain max-h-[80vh] rounded-[2rem]" alt="Captured Preset" />
                  )}
                </div>
            ) : (
                <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`} 
                  />
                  
                  {!isCameraActive && !cameraError && (
                    <canvas ref={canvasSimRef} className="w-full h-full object-cover bg-slate-950" />
                  )}

                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center z-30">
                      <div className="max-w-md bg-slate-900/90 border border-brand-red/30 rounded-[2.5rem] p-8 flex flex-col items-center space-y-6 shadow-2xl backdrop-blur-xl">
                        <div className="p-4 bg-brand-red/10 text-brand-red rounded-2xl border border-brand-red/20 animate-pulse">
                          <AlertTriangle className="h-10 w-10" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-white uppercase tracking-wider">Camera Sensor Offline</h4>
                          <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                            {cameraError}
                          </p>
                        </div>
                        
                        <div className="w-full bg-white/5 rounded-2xl p-4 text-left border border-white/5 space-y-2.5">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block font-mono">PWA / Standalone Troubleshooting:</span>
                          <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                            <span className="text-brand-red font-black">✓</span>
                            <span><strong>Secure Connections Rule:</strong> Chrome and iOS Safari strictly disable device media streams on insecure <code className="text-slate-400 font-mono">http://</code> pages. Always host on HTTPS (e.g. GitHub Pages) or deploy to a secure PWA endpoint.</span>
                          </div>
                          <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                            <span className="text-brand-red font-black">✓</span>
                            <span><strong>Browser Permissions:</strong> Look at your address bar next to the domain, click the Lock icon, and manually unlock <strong>Camera</strong> access permission.</span>
                          </div>
                          <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                            <span className="text-brand-red font-black">✓</span>
                            <span><strong>Device Hardware:</strong> Ensure your phone camera isn't locked by another active app in the background.</span>
                          </div>
                        </div>

                        <div className="flex space-x-3 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              setCameraError(null);
                              setRetryTrigger(prev => prev + 1);
                              speak("Retrying production camera connection.");
                            }}
                            className="flex-1 py-3 bg-brand-red hover:bg-brand-red/90 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-red/20"
                          >
                            Retry Cam
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              speak("Connecting stream to digital twin offline mode.");
                              setCameraError(null);
                            }}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                          >
                            Use Offline Simulator
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            )}

            {/* Real-time Streaming Status Badge */}
            {mode !== 'poultry' && !capturedImage && (
              <div className="absolute top-6 right-6 z-40 bg-black/85 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${isCameraActive ? 'bg-brand-red animate-ping' : 'bg-yellow-500 animate-pulse'}`} />
                <span className="text-[9px] font-black text-white uppercase tracking-wider">
                  {isCameraActive ? 'ON-AIR: REAL-TIME OPTICAL FEED' : 'DIGITAL TWIN CONVEYOR STREAMS'}
                </span>
              </div>
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

      {/* Dynamic Conversational PecoLens AI HUD */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute left-8 right-8 bottom-32 max-h-[42vh] overflow-y-auto no-scrollbar bg-slate-950/95 backdrop-blur-3xl border border-indigo-500/20 rounded-[2.5rem] p-6 shadow-2xl z-40 max-w-2xl mx-auto flex flex-col space-y-4"
          >
            {/* Header: User Question Asked */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">PecoLens Assistant Response</span>
              </div>
              <button 
                onClick={() => setAnalysis(null)} 
                className="text-slate-500 hover:text-white transition-colors"
                title="Clear Assistant Output"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conversation text bubble */}
            <div className="space-y-4">
              {lastAskedQuestion && (
                <div className="flex flex-col space-y-1">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">Operator Asked:</span>
                  <p className="text-xs text-white font-medium italic bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
                    "{lastAskedQuestion}"
                  </p>
                </div>
              )}

              <div className="flex flex-col space-y-1">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-wider">Brett's Industrial Verdict:</span>
                <p className="text-zinc-200 text-sm leading-relaxed font-sans font-normal">
                  {analysis.analysis}
                </p>
              </div>

              {analysis.aiReasoning && (
                <div className="flex flex-col space-y-1 bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                  <span className="text-[8px] font-black text-emerald-400 uppercase tracking-wider">Engineering Logic & Laws:</span>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {analysis.aiReasoning}
                  </p>
                </div>
              )}

              {/* Dynamic 3D Guided Scanning Instructions based on detected faults */}
              {analysis.issues && analysis.issues.length > 0 && (
                <div className="bg-brand-red/10 border border-brand-red/20 p-4 rounded-2xl flex flex-col space-y-1">
                  <div className="flex items-center space-x-2 text-brand-red">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Holographic 3D Surface Reconstruction Guidance</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {mode === 'megajet' ? (
                      "Please slow-pan the lens 45° around the dual cutter gantry bracket. Scan the lateral holding pins from left-to-right to measure sub-millimeter axial bearing play."
                    ) : mode === 'grasselli' ? (
                      "Angle the viewport downward into the feed throat guide. Gently shift perspective to the left roller casing to complete diagnostic thermal depth mapping."
                    ) : (
                      "To fully synthesize the 3D model: Align the central indicator dots, tilt the camera 20° upward, and complete a slow circumferential scan."
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* HUD Call to Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">MODEL COMPREHENSION V3.5</span>
              
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSavePicture}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 active:scale-95 transition-all flex items-center space-x-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Save Diagnostic Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysis(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                >
                  Dismiss HUD
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control & Dialogue Prompt Center */}
      <div className="absolute bottom-6 inset-x-8 flex flex-col space-y-3.5 z-40 max-w-2xl mx-auto">
        
        {/* Suggested Queries Chips */}
        {!analysis && !isScanning && (
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {getSuggestedQueries(mode).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuestionText(q);
                  speak(`Triggering diagnostic query: ${q}`);
                  // Directly execute
                  setTimeout(() => handleScan(q), 200);
                }}
                className="px-3 py-1.5 bg-slate-950/80 border border-white/10 hover:border-indigo-500/40 hover:bg-slate-900 rounded-full text-[9px] font-black uppercase text-zinc-400 hover:text-white transition-all whitespace-nowrap active:scale-95 flex items-center space-x-1"
              >
                <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        )}

        {/* Master Query Bar & Button Core */}
        <div className="flex space-x-3 items-center">
          
          {/* Flip Camera switch */}
          {mode !== 'poultry' && (
            <button 
               type="button"
               onClick={() => {
                 const nextMode = facingMode === 'user' ? 'environment' : 'user';
                 setFacingMode(nextMode);
                 speak(`Rotating viewer to ${nextMode === 'user' ? 'front camera' : 'back camera'}.`);
               }}
               className={`w-14 h-14 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-all ${facingMode === 'user' ? 'bg-indigo-600/40 border-indigo-500/50 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
               title="Flip front / rear camera"
            >
                <RefreshCw className="h-5 w-5" />
            </button>
          )}

          {/* Interactive Chat Input bar */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (questionText.trim()) {
                handleScan();
              }
            }}
            className="flex-1 h-14 bg-slate-950/90 border border-white/10 rounded-2xl flex items-center px-4 space-x-2 shadow-2xl focus-within:border-indigo-500/50 transition-all"
          >
            <input 
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder={`Ask Brett (e.g. 'Is this v wheel bad?')`}
              className="flex-1 bg-transparent text-white placeholder-slate-500 font-bold text-xs focus:outline-none border-0 py-0"
              disabled={isScanning}
            />
            {questionText.trim() && (
              <button 
                type="submit"
                disabled={isScanning}
                className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 transition-all flex items-center justify-center animate-fadeIn"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            )}
          </form>

          {/* Hand Scan button for non-text general scan */}
          <button 
             type="button"
             onClick={() => handleScan()}
             disabled={isScanning}
             className={`h-14 px-5 bg-brand-red rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-50`}
             title="Run raw scanning diagnostic"
          >
              {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
              <span>{isScanning ? 'STREAMING...' : 'SCAN'}</span>
          </button>

          {/* Mic Toggle button */}
          <button 
             type="button"
             onClick={toggleListening}
             className={`w-14 h-14 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center active:scale-95 transition-all ${isListening ? 'bg-emerald-500 border-emerald-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/15'}`}
             title={isListening ? 'Listening...' : 'Push to speak'}
          >
              {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
        </div>
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
