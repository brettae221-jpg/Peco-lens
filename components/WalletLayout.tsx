import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppMode, User } from '../types';
import { 
  Activity, 
  Layout, 
  MessageCircle, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Zap,
  Wrench,
  Image as ImageIcon,
  Calendar,
  Cpu,
  Settings,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface WalletLayoutProps {
  user: Omit<User, 'password'>;
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;
  children: React.ReactNode;
}

const WalletLayout: React.FC<WalletLayoutProps> = ({ user, activeMode, setActiveMode, children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: AppMode.Dashboard, label: 'Dashboard', icon: Layout, color: 'bg-indigo-500' },
    { id: AppMode.Lenses, label: 'Lenses', icon: Activity, color: 'bg-brand-red' },
    { id: AppMode.Tools, label: 'Tools', icon: Wrench, color: 'bg-blue-500' },
    { id: AppMode.Maintenance, label: 'Maintenance', icon: ShieldAlert, color: 'bg-orange-600' },
    { id: AppMode.Training, label: 'Training', icon: GraduationCap, color: 'bg-emerald-500' },
    { id: AppMode.Gallery, label: 'Gallery', icon: ImageIcon, color: 'bg-pink-500' },
    { id: AppMode.Calendar, label: 'Calendar', icon: Calendar, color: 'bg-purple-500' },
    { id: AppMode.Messages, label: 'Messages', icon: MessageCircle, color: 'bg-brand-red' },
    { id: AppMode.Machines, label: 'Machines', icon: Cpu, color: 'bg-slate-700' },
    { id: AppMode.Settings, label: 'Settings', icon: Settings, color: 'bg-slate-500' },
  ];

  if (user.role === 'Admin') {
    menuItems.push({ id: AppMode.Admin, label: 'Admin', icon: ShieldCheck, color: 'bg-purple-600' });
    menuItems.push({ id: AppMode.Builder, label: 'Builder', icon: Zap, color: 'bg-yellow-500' });
  }

  const activeItem = menuItems.find(m => m.id === activeMode) || menuItems[0];

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex flex-col font-sans">
      {/* Wallet Stack Navigation */}
      <div className="relative flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Main Content Area - Swipe Left/Right for Sub-pages (conceptual) */}
        <div className="flex-1 overflow-auto relative z-0 hide-scrollbar scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Vertical Wallet Bottom Bar */}
        <motion.div 
          initial={false}
          animate={{ height: isMenuOpen ? '70vh' : '88px' }}
          className="bg-white/10 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] shadow-2xl relative z-50 flex flex-col overflow-hidden"
        >
          {/* Active Card Indicator / Grabber */}
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-20 flex items-center justify-between px-8 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl ${activeItem.color} shadow-lg shadow-black/20`}>
                <activeItem.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active System</p>
                <h3 className="text-xl font-black text-white tracking-tight">{activeItem.label}</h3>
              </div>
            </div>
            <div className="p-2 rounded-full bg-white/5 text-slate-400">
              {isMenuOpen ? <ChevronDown /> : <ChevronUp />}
            </div>
          </div>

          {/* Expanded Menu Stack */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 pl-2">Navigation Deck</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMode(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full group relative overflow-hidden p-5 rounded-3xl flex items-center space-x-4 transition-all ${
                  activeMode === item.id 
                  ? 'bg-white shadow-xl scale-[1.02]' 
                  : 'bg-white/5 border border-white/5 hover:bg-white/10'
                }`}
              >
                 <div className={`p-3 rounded-2xl ${item.color} ${activeMode === item.id ? '' : 'opacity-80'}`}>
                   <item.icon className={`h-6 w-6 ${activeMode === item.id ? 'text-white' : 'text-white'}`} />
                 </div>
                 <div className="text-left">
                    <h4 className={`text-lg font-black tracking-tight ${activeMode === item.id ? 'text-slate-900' : 'text-white'}`}>
                      {item.label}
                    </h4>
                    {activeMode === item.id && (
                      <motion.div layoutId="activeTag" className="h-1 w-4 bg-brand-red rounded-full mt-1" />
                    )}
                 </div>
                 <div className={`ml-auto opacity-0 group-hover:opacity-100 transition-opacity ${activeMode === item.id ? 'text-brand-red' : 'text-slate-500'}`}>
                    <Activity className="h-4 w-4" />
                 </div>
              </button>
            ))}
            
            {/* User Profile Summary */}
            <div className="p-8 mt-12 bg-black/40 rounded-[2.5rem] border border-white/5">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-red to-orange-500 flex items-center justify-center font-black text-white">
                    {user.name?.[0].toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-black text-lg leading-tight">{user.name || 'Operator'}</h4>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{user.appPosition || user.role}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 font-bold mb-4">{user.email}</p>
                <div className="flex bg-white/5 rounded-xl p-3 items-center justify-between">
                   <span className="text-[10px] font-black text-slate-500 uppercase">System Status</span>
                   <span className="flex items-center space-x-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black text-emerald-500 uppercase">Online</span>
                   </span>
                </div>
            </div>
            <div className="h-20" /> {/* Bottom Spacer */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletLayout;
