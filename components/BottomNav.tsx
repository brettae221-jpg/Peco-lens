import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Camera, Wrench, MessageSquare, Settings } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { AppMode, User, ModuleConfig } from '../types';
import { subscribeToModules } from '../services/moduleService';

interface BottomNavProps {
  activeMode: AppMode;
  onNavigate: (mode: AppMode) => void;
  user: Omit<User, 'password'>;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeMode, onNavigate, user }) => {
  const [modules, setModules] = useState<ModuleConfig[]>([]);

  useEffect(() => {
    return subscribeToModules((mods) => {
      setModules(mods.filter(m => m.visible));
    });
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
    { id: AppMode.Scope, label: 'Scope', icon: 'Activity', order: 4, visible: true },
    { id: AppMode.Messages, label: 'Messages', icon: 'MessageSquare', order: 5, visible: true },
    { id: AppMode.Training, label: 'Academy', icon: 'GraduationCap', order: 6, visible: true },
    { id: AppMode.Maintenance, label: 'Fix', icon: 'ShieldCheck', order: 6, visible: true },
    { id: AppMode.Gallery, label: 'Archive', icon: 'Image', order: 7, visible: true },
    { id: AppMode.Machines, label: 'Assets', icon: 'Box', order: 8, visible: true },
    { id: AppMode.Calendar, label: 'Schedule', icon: 'Calendar', order: 9, visible: true },
    { id: AppMode.Admin, label: 'Admin', icon: 'ShieldCheck', order: 10, visible: true },
    { id: AppMode.Settings, label: 'Settings', icon: 'Settings', order: 11, visible: true },
  ].filter(m => m.visible);

  const tabs = filteredModules.filter(tab => {
    // If accessibleModes is not defined (legacy/admin default), show all
    if (!user.accessibleModes) return true;
    // Otherwise check if mode is included
    return user.accessibleModes.includes(tab.id);
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <nav className="bg-slate-950 border-t border-white/5 py-6 shrink-0 z-50">
      <div className="flex items-center space-x-10 px-8 overflow-x-auto hide-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const Icon = getIcon(tab.icon);
          const isActive = activeMode === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              onClick={() => onNavigate(tab.id as AppMode)}
              className={`flex flex-col items-center space-y-3 transition-all shrink-0 min-w-[72px] ${
                isActive ? 'text-brand-red scale-110' : 'text-slate-600 hover:text-white'
              }`}
            >
              <div className="relative">
                  <Icon className={`h-7 w-7 ${isActive ? 'fill-brand-red/10' : ''}`} />
                  {isActive && (
                      <motion.div 
                          layoutId="nav-glow"
                          className="absolute inset-0 bg-brand-red/30 blur-xl rounded-full"
                      />
                  )}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] text-center whitespace-nowrap ${isActive ? 'text-white' : ''}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
