import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  ChevronLeft,
  MapPin,
  Bell
} from 'lucide-react';

type CalendarView = 'menu' | 'schedule' | 'events' | 'deadlines';

const Calendar: React.FC = () => {
    const [view, setView] = useState<CalendarView>('menu');

    const menuItems = [
      { id: 'schedule', name: 'Schedule', icon: CalendarIcon, color: 'bg-blue-600', submenus: ['Production Run', 'Maintenance Slot', 'Shift Planner', 'Export ICS'] },
      { id: 'events', name: 'Events', icon: MapPin, color: 'bg-brand-red', submenus: ['Town Hall', 'Safety Day', 'Team Briefs', 'Add Event'] },
      { id: 'deadlines', name: 'Deadlines', icon: AlertCircle, color: 'bg-orange-500', submenus: ['Audit Prep', 'PM Overdue', 'Parts Arrival', 'Priority View'] },
    ];

    if (view !== 'menu') {
      const activeItem = menuItems.find(i => i.id === view)!;
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full text-white border border-white/5">
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{activeItem.name}</h2>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Temporal Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 rounded-full text-white border border-white/5"><Plus className="h-5 w-5" /></motion.button>
               <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 rounded-full text-white border border-white/5"><Bell className="h-5 w-5" /></motion.button>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md px-8 py-4 flex space-x-4 overflow-x-auto hide-scrollbar border-b border-white/5 shrink-0">
            {activeItem.submenus.map(sub => (
              <button key={sub} className="flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-500 border border-white/5 hover:text-white transition-all">
                {sub}
              </button>
            ))}
          </div>

          <div className="flex-1 p-10 overflow-y-auto no-scrollbar pb-32">
             <div className="max-w-4xl mx-auto space-y-12">
                <div className="flex items-center justify-between">
                   <h3 className="text-5xl font-black text-white uppercase tracking-tighter">MAY <span className="text-slate-700">2026</span></h3>
                   <div className="flex space-x-4">
                      <button className="p-4 bg-white/5 rounded-2xl text-white border border-white/5"><ChevronLeft className="h-6 w-6" /></button>
                      <button className="p-4 bg-white/5 rounded-2xl text-white border border-white/5"><ChevronRight className="h-6 w-6" /></button>
                   </div>
                </div>

                <div className="grid grid-cols-7 gap-4">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                    <div key={d} className="text-center py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">{d}</div>
                  ))}
                  {Array.from({ length: 31 }).map((_, i) => {
                    const isToday = i + 1 === 12;
                    return (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.01 }}
                        className={`aspect-square rounded-[2rem] border border-white/5 flex flex-col p-4 transition-all cursor-pointer relative overflow-hidden group ${isToday ? 'bg-brand-red border-brand-red shadow-2xl shadow-brand-red/20' : 'bg-white/2'}`}
                      >
                         <span className={`text-sm font-black ${isToday ? 'text-white' : 'text-slate-700'}`}>{i + 1}</span>
                         {i + 1 === 15 && (
                           <div className="mt-auto flex space-x-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                           </div>
                         )}
                         {isToday && <div className="mt-auto text-[8px] font-black text-white/50 uppercase tracking-widest">CURRENT</div>}
                      </motion.div>
                    );
                  })}
                </div>
             </div>
          </div>
        </div>
      );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12">
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">Operation <span className="text-blue-500">Events</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Temporal Synchronization Hub</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as CalendarView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">{item.name}</h3>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                            <span>Open Schedule</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
