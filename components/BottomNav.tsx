import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Camera, Wrench, MessageSquare, Settings } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AppMode, User, ModuleConfig } from '../types';
import { getModules } from '../services/moduleService';

interface BottomNavProps {
  activeMode: AppMode;
  onNavigate: (mode: AppMode) => void;
  user: Omit<User, 'password'>;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeMode, onNavigate, user }) => {
  const [modules, setModules] = useState<ModuleConfig[]>([]);

  useEffect(() => {
    const load = async () => {
        const mods = await getModules();
        setModules(mods.filter(m => m.visible));
    };
    load();
  }, []);

  // Map icon names to Lucide components
  const getIcon = (name: string) => {
    const Icon = (LucideIcons as any)[name];
    if (Icon) return Icon;
    
    // Fallbacks
    switch (name) {
        case 'Home': return Home;
        case 'Camera': return Camera;
        case 'Wrench': return Wrench;
        case 'MessageSquare': return MessageSquare;
        case 'Settings': return Settings;
        default: return Wrench;
    }
  };

  const filteredModules = modules.length > 0 ? modules : [
    { id: AppMode.Dashboard, label: 'Home', icon: 'Home', order: 0, visible: true },
    { id: AppMode.Lenses, label: 'Lenses', icon: 'Camera', order: 1, visible: true },
    { id: AppMode.Tools, label: 'Tools', icon: 'Wrench', order: 2, visible: true },
    { id: AppMode.AIChat, label: 'Neural', icon: 'Zap', order: 3, visible: true },
    { id: AppMode.Messages, label: 'Messages', icon: 'MessageSquare', order: 4, visible: true },
    { id: AppMode.Settings, label: 'Settings', icon: 'Settings', order: 5, visible: true },
  ].filter(m => m.visible);

  const tabs = filteredModules.filter(tab => {
    // If accessibleModes is not defined (legacy/admin default), show all
    if (!user.accessibleModes) return true;
    // Otherwise check if mode is included
    return user.accessibleModes.includes(tab.id);
  });

  return (
    <nav className="bg-slate-950 border-t border-white/5 py-3 px-6 flex items-center justify-around shrink-0 z-50">
      {tabs.map((tab) => {
        const Icon = getIcon(tab.icon);
        const isActive = activeMode === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id as AppMode)}
            className={`flex flex-col items-center space-y-1 transition-all ${
              isActive ? 'text-brand-red' : 'text-slate-500 hover:text-white'
            }`}
          >
            <div className="relative">
                <Icon className={`h-6 w-6 ${isActive ? 'fill-brand-red/10' : ''}`} />
                {isActive && (
                    <motion.div 
                        layoutId="nav-glow"
                        className="absolute inset-0 bg-brand-red/20 blur-lg rounded-full"
                    />
                )}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
