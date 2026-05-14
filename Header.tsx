import React from 'react';
import { Bell, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  user: any;
  contextLabel: string;
  status?: 'operational' | 'warning' | 'critical';
}

const HexPIcon = ({ className }: { className?: string }) => (
  <div className={`relative ${className}`}>
    <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z" fill="currentColor" className="text-brand-red" />
    </svg>
    <span className="absolute inset-0 flex items-center justify-center text-white font-black text-[12px] leading-none mb-0.5">P</span>
  </div>
);

const Header: React.FC<HeaderProps> = ({ user, contextLabel, status = 'operational' }) => {
  const statusColors = {
    operational: 'bg-emerald-500',
    warning: 'bg-yellow-500',
    critical: 'bg-brand-red'
  };

  return (
    <header className="bg-slate-950 border-b border-white/5 py-4 px-6 flex items-center justify-between shrink-0 z-50">
      <div className="flex items-center space-x-4">
        <HexPIcon className="h-10 w-10 shadow-lg shadow-brand-red/20" />
        <div className="h-6 w-px bg-white/10 hidden md:block" />
        <h1 className="text-white font-black uppercase text-xs tracking-[0.2em] hidden md:block">
          {contextLabel}
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
          <div className={`h-2 w-2 rounded-full ${statusColors[status]} animate-pulse`} />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{status}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-brand-red rounded-full border-2 border-slate-950" />
          </button>
          <button className="h-9 w-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white overflow-hidden active:scale-95 transition-all">
            <UserIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
