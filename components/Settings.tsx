import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWAUpdate, useInstallPrompt } from '../services/pwaService';
import { User } from '../types';
import { 
  User as UserIcon, 
  Wifi, 
  Settings as SettingsIcon, 
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  Shield,
  Bell,
  Palette,
  Globe,
  Database,
  Lock,
  LogOut,
  Save,
  Download,
  Smartphone,
  Smartphone as Phone,
  RefreshCcw,
  UploadCloud,
  Layout,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';

type SettingsView = 'menu' | 'profile' | 'connectivity' | 'app' | 'install' | 'software';

interface SettingsProps {
    user?: Omit<User, 'password'>;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
    const [view, setView] = useState<SettingsView>('menu');
    const { updateAvailable, checkForUpdates, applyUpdate, checking, lastRemoteUpdate, issueRemoteUpdate } = usePWAUpdate();
    const { installPrompt, promptInstall } = useInstallPrompt();

    const menuItems = [
      { id: 'profile', name: 'Profile', icon: UserIcon, color: 'bg-blue-600', submenus: ['Basic Info', 'Security', 'Role Access', 'Activity Log'] },
      { id: 'connectivity', name: 'Connectivity', icon: Wifi, color: 'bg-emerald-600', submenus: ['WiFi Setup', 'Neural Link', 'Cloud Sync', 'Bluetooth'] },
      { id: 'app', name: 'App Settings', icon: SettingsIcon, color: 'bg-brand-red', submenus: ['Theme', 'Language', 'Cache', 'Reset Factory'] },
      { id: 'software', name: 'Update Engine', icon: RefreshCcw, color: 'bg-indigo-600', submenus: ['Software Update', 'Kernel Version', 'Rollback'] },
      { id: 'install', name: 'Deployment', icon: Download, color: 'bg-purple-600', submenus: ['Install PWA', 'Android APK', 'iOS Config'] },
    ];

    const handleDownloadPlaceholder = (platform: 'android' | 'ios' | 'pwa') => {
      if (platform === 'pwa') {
        if (promptInstall) promptInstall();
        return;
      }

      const filename = platform === 'android' ? 'PecoFoods_Enterprise.apk' : 'PecoFoods_Enterprise.mobileconfig';
      
      // Instead of an unparsable text file, let's provide a "Manual Implementation Guide" PDF-style text
      const content = `PECOFOODS INDUSTRIAL INTELLIGENCE - NATIVE DEPLOYMENT TICKET
============================================================
PLATFORM: ${platform.toUpperCase()}
VERSION: 2.0.4-POCHANATAS
BUILD_ID: ${Math.random().toString(36).substring(7).toUpperCase()}

INFRASTRUCTURE NOTICE:
This file is a deployment ticket for a native binary build. 
A real .apk or .mobileconfig requires a native build environment (Android Studio / Xcode).

RECOMMENDED DEPLOYMENT (PWA):
The PecoFoods PWA is the AUTHORIZED method for facility deployment.
1. Return to the App Settings.
2. Select "Install PWA" for 1:1 parity with this interface.
3. PWAs operate offline and receive real-time updates without manual APK installs.

If your facility requires a strictly native wrapper (Capacitor/Cordova):
Please provide your repository endpoint to the DevOps controller to trigger a binary synthesis.
============================================================`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

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
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Core System Configuration</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <motion.button whileTap={{ scale: 0.9 }} className="px-6 py-2.5 bg-white rounded-full text-slate-950 text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl">
                  <Save className="h-4 w-4 mr-2" />
                  SAVE
               </motion.button>
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
             <div className="max-w-2xl mx-auto space-y-6">
                {view === 'software' ? (
                  <div className="space-y-8">
                     <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem]">
                        <div className="flex items-center justify-between mb-10">
                           <div>
                              <h3 className="text-3xl font-black text-white uppercase tracking-tight">System Update</h3>
                              <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mt-2">v2.0.4-POCHANATAS</p>
                           </div>
                           <div className={`h-4 w-4 rounded-full ${updateAvailable ? 'bg-brand-red animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.5)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} />
                        </div>

                        {updateAvailable ? (
                           <div className="space-y-6">
                              <div className="p-8 bg-brand-red/10 border border-brand-red/20 rounded-[2.5rem]">
                                 <p className="text-brand-red text-sm font-black uppercase tracking-tight mb-2">New Core Intelligence Available</p>
                                 <p className="text-slate-400 text-xs leading-relaxed">A new system version has been downloaded and is ready for installation. This update includes new vision lenses and improved recovery logic.</p>
                              </div>
                              <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={applyUpdate}
                                className="w-full py-6 bg-brand-red text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-brand-red/20 flex items-center justify-center space-x-3"
                              >
                                 <RefreshCcw className="h-5 w-5" />
                                 <span>Activate & Restart App</span>
                              </motion.button>
                           </div>
                        ) : (
                           <div className="space-y-6">
                              <div className="p-8 bg-white/2 border border-white/5 rounded-[2.5rem] text-center">
                                 <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed">Your machine intelligence is currently at the latest authorized version.</p>
                                 <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.3em] mt-4">Last Sync: {lastRemoteUpdate ? lastRemoteUpdate.toDate().toLocaleString() : 'Just now'}</p>
                              </div>
                              <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={checkForUpdates}
                                disabled={checking}
                                className="w-full py-6 bg-white/5 border border-white/10 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-white/10 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                              >
                                 <RefreshCcw className={`h-5 w-5 ${checking ? 'animate-spin' : ''}`} />
                                 <span>{checking ? 'Querying Servers...' : 'Check for Remote Updates'}</span>
                              </motion.button>
                           </div>
                        )}
                     </div>

                     {user?.role === 'Admin' && (
                        <div className="bg-slate-900 border border-white/5 p-10 rounded-[3rem]">
                           <div className="flex items-center space-x-4 mb-8">
                              <div className="p-3 bg-indigo-600 rounded-xl">
                                 <UploadCloud className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-white uppercase tracking-tight">Admin Override</h4>
                                 <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">Protocol Injection</p>
                              </div>
                           </div>
                           <p className="text-slate-500 text-xs mb-8">Force all active terminals to re-sync their core logic by issuing a facility-wide update signal.</p>
                           <motion.button 
                             whileTap={{ scale: 0.98 }}
                             onClick={issueRemoteUpdate}
                             className="w-full py-6 bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 flex items-center justify-center space-x-3"
                           >
                              <RefreshCcw className="h-5 w-5" />
                              <span>Signal Global Update</span>
                           </motion.button>
                        </div>
                     )}
                  </div>
                ) : view === 'install' ? (
                  <div className="space-y-8">
                    {/* Native Installation Section */}
                    <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem]">
                       <div className="flex items-center space-x-6 mb-10">
                          <div className="h-20 w-20 bg-purple-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-purple-600/20 shrink-0">
                             <Smartphone className="h-10 w-10 text-white" />
                          </div>
                          <div>
                             <h3 className="text-3xl font-black text-white uppercase tracking-tight">App Deployment</h3>
                             <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">Mobile Infrastructure Terminal</p>
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="p-8 bg-blue-500/10 border border-blue-500/20 rounded-[2.5rem]">
                             <div className="flex items-center space-x-3 mb-3 text-blue-400">
                                <Info className="h-4 w-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Technician Note</span>
                             </div>
                             <p className="text-slate-400 text-xs leading-relaxed">
                                For the fastest deployment, we recommend the <b>PWA (Progressive Web App)</b> method. It installs directly via your browser, works offline, and automatically syncs with the Command Center.
                             </p>
                          </div>

                          {installPrompt ? (
                             <motion.button 
                               whileTap={{ scale: 0.98 }}
                               onClick={promptInstall}
                               className="w-full py-8 bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl flex items-center justify-center space-x-3"
                             >
                                <Plus className="h-5 w-5" />
                                <span>Install App to Desktop/Mobile</span>
                             </motion.button>
                          ) : (
                             <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center space-x-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Device Authorized / App Installed</span>
                             </div>
                          )}

                          <div className="pt-8 border-t border-white/5">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 pl-2 text-center">Native Architecture Fallbacks</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.button 
                                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleDownloadPlaceholder('android')}
                                  className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center group"
                                >
                                   <div className="h-12 w-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                                      <Phone className="h-6 w-6 text-emerald-500" />
                                   </div>
                                   <span className="text-lg font-black text-white uppercase">Android</span>
                                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Direct APK Stub</span>
                                </motion.button>

                                <motion.button 
                                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleDownloadPlaceholder('ios')}
                                  className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] flex flex-col items-center group"
                                >
                                   <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                                      <Smartphone className="h-6 w-6 text-blue-500" />
                                   </div>
                                   <span className="text-lg font-black text-white uppercase">iOS</span>
                                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Config Profile</span>
                                </motion.button>
                             </div>
                             
                             <div className="mt-6 flex items-center justify-center space-x-2 text-rose-500/60 font-black text-[8px] uppercase tracking-widest">
                                <XCircle className="h-3 w-3" />
                                <span>Binary build requires native compiler environment</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-slate-900 border border-white/5 rounded-[3rem]">
                       <h4 className="text-white font-black text-xs uppercase tracking-widest mb-4">Manual Installation Support</h4>
                       <ul className="space-y-3">
                          {[
                             { step: '01', text: 'Open in Chrome or Safari Mobile' },
                             { step: '02', text: 'Tap Share or Menu Button' },
                             { step: '03', text: 'Select "Add to Home Screen"' },
                             { step: '04', text: 'Launch from your App Drawer' },
                          ].map(s => (
                             <li key={s.step} className="flex items-center space-x-4">
                                <span className="text-slate-600 font-black text-[10px]">{s.step}</span>
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-tight">{s.text}</span>
                             </li>
                          ))}
                       </ul>
                    </div>
                  </div>
                ) : view === 'app' ? (
                   <div className="space-y-4">
                      {[
                        { name: 'Dark Mode Protocol', desc: 'Neural contrast adjustment', default: true },
                        { name: 'Biometric Interlock', desc: 'Verify identity on module access', default: false },
                        { name: 'Offline Neural Cache', desc: 'Store AI weights locally for zero-latency', default: true },
                        { name: 'High-Fidelity Audio', desc: 'Advanced TTS vocal output', default: true },
                        { name: 'Motion Reduction', desc: 'Simplify interface for legacy hardware', default: false }
                      ].map((s, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between p-8 bg-white/2 rounded-[2rem] border border-white/5 hover:bg-white/5 transition-all group cursor-pointer"
                        >
                          <div className="flex items-center space-x-6">
                             <div className="p-4 bg-slate-800 rounded-2xl group-hover:bg-slate-700 transition-colors">
                                <SettingsIcon className="h-5 w-5 text-slate-400" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-white uppercase tracking-tight">{s.name}</p>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mt-1">{s.desc}</p>
                             </div>
                          </div>
                          <div className={`h-8 w-12 rounded-full p-1 flex items-center transition-all ${s.default ? 'bg-brand-red justify-end' : 'bg-slate-800 justify-start'}`}>
                             <div className="h-6 w-6 bg-white rounded-full shadow-lg" />
                          </div>
                        </motion.div>
                      ))}
                   </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-20 opacity-20">
                     <Lock className="h-16 w-16 mb-4" />
                     <p className="font-black uppercase tracking-widest text-[10px]">Module Level 4 Encryption Active</p>
                  </div>
                )}

                <button className="w-full h-20 mt-10 bg-brand-red/10 hover:bg-brand-red text-brand-red hover:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] border border-brand-red/20 transition-all flex items-center justify-center space-x-3 group">
                   <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                   <span>Terminate All Sessions</span>
                </button>
             </div>
          </div>
        </div>
      );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12">
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">Config <span className="text-slate-500">Core</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">System Identity & Global Preferences</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as SettingsView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">{item.name}</h3>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                            <span>Adjust Config</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Settings;
