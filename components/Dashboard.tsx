import React from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  Wrench, 
  MessageSquare, 
  Activity, 
  GraduationCap, 
  Image as ImageIcon, 
  Calendar, 
  Box, 
  Settings, 
  ShieldAlert, 
  Zap,
  ChevronRight,
  FileText,
  Share2
} from 'lucide-react';
import { AppMode, User } from '../types';

interface DashboardProps {
  user: User;
  onNavigate: (mode: AppMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const menus = [
    { id: AppMode.Lenses, name: 'Lenses', icon: Camera, color: 'bg-emerald-500', desc: 'AR and Vision intelligence' },
    { id: AppMode.AIChat, name: 'Neural AI', icon: Zap, color: 'bg-indigo-600', desc: 'Expert troubleshooting brain' },
    { id: AppMode.Tools, name: 'Tools', icon: Wrench, color: 'bg-brand-red', desc: 'Precision diagnostics' },
    { id: AppMode.Messages, name: 'Messages', icon: MessageSquare, color: 'bg-blue-500', desc: 'Secure facility comms' },
    { id: AppMode.Maintenance, name: 'Maintenance', icon: Activity, color: 'bg-orange-500', desc: 'Predictive upkeep' },
    { id: AppMode.Training, name: 'Training', icon: GraduationCap, color: 'bg-purple-600', desc: 'Operator skill academy' },
    { id: AppMode.Gallery, name: 'Gallery', icon: ImageIcon, color: 'bg-pink-500', desc: 'Snapshot history' },
    { id: AppMode.Calendar, name: 'Calendar', icon: Calendar, color: 'bg-indigo-500', desc: 'Facility schedule' },
    { id: AppMode.Machines, name: 'Machines', icon: Box, color: 'bg-slate-700', desc: 'Real-time asset status' },
    { id: AppMode.Settings, name: 'Settings', icon: Settings, color: 'bg-slate-500', desc: 'System configuration' },
  ];

  if (user.role === 'Admin') {
    menus.push(
      { id: AppMode.Admin, name: 'Admin', icon: ShieldAlert, color: 'bg-rose-700', desc: 'Restricted operations' },
      { id: AppMode.Builder, name: 'Builder', icon: Zap, color: 'bg-yellow-500', desc: 'AI Architecture builder' }
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950 overflow-hidden">
      <div className="px-8 pt-12 pb-6">
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
          Industrial <span className="text-brand-red">Intelligence</span>
        </h2>
        <p className="text-slate-500 font-bold max-w-sm uppercase text-[10px] tracking-widest leading-relaxed">
          Select an operations layer to initialize secure neural connection.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto hide-scrollbar px-8 pb-12 flex items-center space-x-6">
        {menus.map((menu, index) => (
          <motion.button
            key={menu.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate(menu.id)}
            className="flex-shrink-0 w-72 h-[420px] bg-white/5 border border-white/5 rounded-[3rem] p-10 flex flex-col items-start text-left hover:bg-white/10 transition-all group relative overflow-hidden shadow-2xl"
          >
            {/* Background Accent */}
            <div className={`absolute -right-12 -top-12 w-48 h-48 ${menu.color} opacity-10 blur-[60px] group-hover:opacity-20 transition-opacity`} />
            
            <div className={`p-6 rounded-[2rem] ${menu.color} mb-12 shadow-xl shadow-black/40 group-hover:scale-110 transition-transform`}>
              <menu.icon className="h-10 w-10 text-white" />
            </div>

            <div className="mt-auto">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 leading-none">
                {menu.name}
              </h3>
              <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                {menu.desc}
              </p>
              
              <div className="flex items-center text-white/40 group-hover:text-white transition-colors">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] mr-2">Initialize Layer</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Quick Line Status Bar */}
      <div className="px-8 py-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
        <div className="flex space-x-8">
          {[1, 2, 3, 4, 5, 6].map(line => (
            <div key={line} className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-600 mb-1">L{line}</span>
              <div className="h-4 w-1 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Global Status</p>
          <p className="text-xs font-black text-emerald-500 uppercase">Synchronized</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
