import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PMList from './PMList';
import { 
  ClipboardList, 
  ArrowLeft,
} from 'lucide-react';
import { User } from '../types';

interface MaintenanceProps {
    user: User;
}

const Maintenance: React.FC<MaintenanceProps> = ({ user }) => {
    return (
        <div className="h-full flex flex-col bg-slate-950">
            <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
                <div className="flex items-center space-x-6">
                    <div className="p-3 bg-brand-red/10 rounded-2xl text-brand-red border border-brand-red/10">
                        <ClipboardList className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Weekly PM <span className="text-brand-red">Log</span></h2>
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Active Maintenance Registry</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                <PMList user={user} />
            </div>
        </div>
    );
};

export default Maintenance;
