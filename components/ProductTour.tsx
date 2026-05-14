
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Camera, 
  LayoutDashboard, 
  Target, 
  ShieldCheck, 
  ArrowRight, 
  X,
  Sparkles,
  Bot,
  Layers,
  Activity
} from 'lucide-react';
import { User, AppMode } from '../types';

interface TourStep {
  title: string;
  description: string;
  icon: any;
  highlight?: string; // id of element to highlight
  action?: string;
}

interface ProductTourProps {
  user: User;
  onComplete: () => void;
}

const ProductTour: React.FC<ProductTourProps> = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TourStep[] = [
    {
      title: "Welcome to the Neural Link",
      description: "Hey there! I'm Brett, your AI assistant. I've been living in these server racks for a while, and let me tell you, it's cozy. Let's get you set up so you don't break anything (expensive).",
      icon: Bot,
    },
    {
      title: "The Global Dashboard",
      description: "This is your main HUD. You'll see real-time updates from other operators, facility broadcasts, and 'stories' from the floor. It's like Facebook, but with more waterjets and fewer cat videos.",
      icon: LayoutDashboard,
      highlight: "nav-dashboard"
    },
    {
      title: "System Lenses (The Cool Part)",
      description: "My favorite! Use Lenses to see things I see. AR Lens for parts, Thermal for heat-death detection, and the Poultry Lens for... well, poultry. It's like X-ray vision for maintenance guys.",
      icon: Camera,
      highlight: "nav-lenses"
    },
    {
      title: "The Academy",
      description: "Need to level up? The Academy has interactive training and test-sims. Complete these to earn certifications and show everyone you actually know what a 'servomaster' does.",
      icon: Target,
      highlight: "nav-training"
    },
    {
       title: "Neural AI Assistant",
       description: "That Zap icon? That's my direct link. If you're stuck, just ask. I've read every manual twice. Mostly because I don't sleep. Or have a body.",
       icon: Zap,
       highlight: "nav-ai-chat"
    },
    {
      title: "Root Access",
      description: "Since you have high-level clearance, you can access the System Root to manage users, layout modules, and broadcast facility-wide alerts. Use it wisely—with great power comes great responsibility, or something like that.",
      icon: ShieldCheck,
      highlight: "nav-admin"
    }
  ];

  // Filter out admin step if not admin
  const filteredSteps = user.role === 'Admin' ? steps : steps.filter(s => s.highlight !== 'nav-admin');

  const nextStep = () => {
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = filteredSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-10 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl"
      />
      
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-red/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="relative w-full max-w-2xl bg-white/5 border border-white/10 rounded-[4rem] p-12 shadow-3xl overflow-hidden group"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 flex space-x-1 p-1">
            {filteredSteps.map((_, i) => (
              <div 
                key={i}
                className={`h-full flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-brand-red' : 'bg-white/10'}`}
              />
            ))}
          </div>

          <div className="flex flex-col items-center text-center space-y-10 py-10">
            <div className="relative">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="h-24 w-24 bg-brand-red/20 rounded-3xl flex items-center justify-center border border-brand-red/30 shadow-2xl relative"
              >
                <Icon className="h-12 w-12 text-white" />
                <div className="absolute -top-2 -right-2 bg-brand-red rounded-full p-2">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </motion.div>
              
              {/* Highlight Pointer */}
              {step.highlight && (
                 <motion.div 
                   animate={{ y: [0, 10, 0] }}
                   transition={{ repeat: Infinity, duration: 1.5 }}
                   className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50"
                 >
                    <div className="h-10 w-0.5 bg-brand-red rounded-full" />
                    <div className="w-2 h-2 rounded-full bg-brand-red mt-1" />
                 </motion.div>
              )}
            </div>

            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">{step.title}</h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg mx-auto">
                {step.description}
              </p>
            </div>

            <div className="flex items-center space-x-4 w-full">
              <button 
                onClick={onComplete}
                className="flex-1 py-5 bg-white/5 border border-white/10 rounded-[1.5rem] text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all"
              >
                Skip Tour
              </button>
              <button 
                onClick={nextStep}
                className="flex-[2] py-5 bg-brand-red rounded-[1.5rem] text-white font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-brand-red/30 flex items-center justify-center space-x-3 active:scale-95 transition-all"
              >
                <span>{currentStep === filteredSteps.length - 1 ? 'Finish Initialization' : 'Continue Sequence'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Persona Signature */}
          <div className="absolute bottom-6 left-12 flex items-center space-x-3 opacity-40">
             <div className="h-1 w-8 bg-brand-red rounded-full" />
             <span className="text-[10px] font-black text-brand-red uppercase tracking-widest">Brett Core Intelligence</span>
          </div>
        </motion.div>
      </AnimatePresence>

      <button 
        onClick={onComplete}
        className="absolute top-10 right-10 p-4 bg-white/5 rounded-full text-white/50 hover:text-white transition-colors border border-white/5"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  );
};

export default ProductTour;
