import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Header from './Header';
import BottomNav from './components/BottomNav';
import { 
  ArrowLeft,
  MessageSquare,
  RefreshCcw,
  Bell
} from 'lucide-react';
import Lenses from './components/Lenses';
import Messenger from './components/Messenger';
import AdminMenu from './components/AdminMenu';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import TrainingMode from './components/TrainingMode';
import Tools from './components/Tools';
import Maintenance from './components/Maintenance';
import Gallery from './components/Gallery';
import Calendar from './components/Calendar';
import Machines from './components/Machines';
import Settings from './components/Settings';
import Builder from './components/Builder';
import AIChat from './components/AIChat';
import NewsFeed from './components/NewsFeed';
import DensityCalculator from './components/DensityCalculator';
import MegajetScope from './components/MegajetScope';
import ProductTour from './components/ProductTour';
import { AppMode, User, TroubleshootingScenario, TrainingCourse, LogEntry, Blueprint, NewsPost } from './types';
import { initialTrainingCourses } from './public/trainingCourses';
import { initialDiagrams } from './initialDiagrams';
import { usePWAUpdate } from './services/pwaService';

import { auth, db } from './firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { users as staticUsers } from './users';

// ... inside App component or outside as a helper
const initializeUsers = async () => {
    if (!auth || !db) {
        console.warn('INIT: Nodes offline. Check system configuration.');
        return;
    }
    try {
        await signInAnonymously(auth);
        console.log('INIT: Neural link established (Anonymous)');
    } catch (error) {
        console.warn('INIT_WARN: Anonymous node handshake failed (optional configuration)', error);
    }
    
    try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
            console.log('INIT: Provisioning initial admin nodes...');
            for (const user of staticUsers) {
                const userRef = doc(collection(db, 'users'));
                await setDoc(userRef, {
                    ...user,
                    firstLogin: false,
                    accessibleModes: Object.values(AppMode)
                });
            }
        }
    } catch (listError) {
        console.warn('INIT_WARN: Could not verify users list (possible rules or auth restriction)', listError);
    }
};

const App: React.FC = () => {
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [isFirebaseError, setIsFirebaseError] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Basic check for config
      if (!auth || !db) {
        setIsFirebaseError(true);
        return;
      }

      // We attempt initialization but don't wait indefinitely if it hangs
      initializeUsers().catch(err => {
        console.warn("Init background failure", err);
      }).finally(() => {
        setIsFirebaseReady(true);
      });
    };
    init();
  }, []);

  const { updateAvailable, applyUpdate } = usePWAUpdate();
  const [user, setUser] = useState<Omit<User, 'password'> | null>(() => {
    try {
      const saved = sessionStorage.getItem('pecofoods-user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Session storage error", e);
      return null;
    }
  });

  const [activeMode, setActiveMode] = useState<AppMode>(AppMode.Dashboard);
  const [showTour, setShowTour] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>(initialTrainingCourses);
  const [troubleshootingScenarios, setTroubleshootingScenarios] = useState<TroubleshootingScenario[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [blueprints, setBlueprints] = useState<Blueprint[]>(initialDiagrams);

  useEffect(() => {
    // Load persisted data
    const savedLogs = localStorage.getItem('pecofoods-logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem('pecofoods-logs', JSON.stringify(logs));
  }, [logs]);

  const handleLogin = (loggedInUser: Omit<User, 'password'>) => {
    // Force AI Chat into accessible modes for Admins if missing
    if (loggedInUser.role === 'Admin' && loggedInUser.accessibleModes && !loggedInUser.accessibleModes.includes(AppMode.AIChat)) {
        loggedInUser = {
            ...loggedInUser,
            accessibleModes: [...loggedInUser.accessibleModes, AppMode.AIChat]
        };
    }
    
    setUser(loggedInUser);
    if (loggedInUser.firstLogin) {
      setShowTour(true);
    }
    try {
      sessionStorage.setItem('pecofoods-user', JSON.stringify(loggedInUser));
    } catch (e) {
      console.error("Failed to save session", e);
    }
  };

  const Content = () => {
    switch (activeMode) {
      case AppMode.Dashboard:
        return <Dashboard user={user as User} onNavigate={setActiveMode} />;
      case AppMode.Lenses:
        return null; // Rendered top-level for full-screen
      case AppMode.Tools:
        return <Tools />;
      case AppMode.Maintenance:
        return <Maintenance user={user as User} />;
      case AppMode.Training:
        return <TrainingMode user={user as User} />;
      case AppMode.Gallery:
        return <Gallery user={user as User} />;
      case AppMode.Calendar:
        return <Calendar />;
      case AppMode.Messages:
        return <Messenger user={user as User} />;
      case AppMode.Machines:
        return user?.role === 'Admin' ? <Machines user={user as User} /> : <Dashboard user={user as User} onNavigate={setActiveMode} />;
      case AppMode.Settings:
        return <Settings user={user as User} />;
      case AppMode.AIChat:
        return <AIChat user={user as User} />;
      case AppMode.NewsFeed:
      case AppMode.ScenarioNewsFeed:
        return <NewsFeed user={user as User} />;
      case AppMode.ScenarioRoot:
      case AppMode.ScenarioTraining:
        return <TrainingMode user={user as User} />;
      case AppMode.DensityCalculator:
        return <DensityCalculator />;
      case AppMode.Scope:
        return <MegajetScope />;
      case AppMode.Admin:
        return user?.role === 'Admin' ? <AdminMenu user={user as User} /> : <Dashboard user={user as User} onNavigate={setActiveMode} />;
      case AppMode.Builder:
        return user?.role === 'Admin' ? <Builder /> : <Dashboard user={user as User} onNavigate={setActiveMode} />;
      default:
        // Handle dynamic modules from AI Architect
        if ((activeMode as string).startsWith('mode-')) {
          return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-700">
               <div className="h-24 w-24 bg-brand-red/10 rounded-[2rem] flex items-center justify-center border border-brand-red/20 shadow-2xl">
                  <RefreshCcw className="h-10 w-10 text-brand-red animate-spin-slow" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Neural Module Active</h3>
                  <p className="text-slate-500 max-w-sm mx-auto leading-relaxed italic">
                    "Expanding facility logic for this specific directive... Initializing neural handshakes with Megajet registers."
                  </p>
               </div>
            </div>
          );
        }
        return <Dashboard user={user as User} onNavigate={setActiveMode} />;
    }
  };

  if (isFirebaseError) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-8 space-y-8 text-center text-slate-200 font-sans">
        <div className="p-8 bg-brand-red/10 rounded-full border border-brand-red/20">
          <RefreshCcw className="h-16 w-16 text-brand-red animate-pulse" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black uppercase tracking-tighter">System Offline</h1>
          <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
            Neural configuration is missing. Ensure all environment variables are correctly mapped in your deployment controller.
          </p>
        </div>
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 font-mono text-[10px] text-slate-600">
          ERROR_CODE: FIREBASE_CONFIG_NULL
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  if (!isFirebaseReady) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center space-y-6">
        <RefreshCcw className="h-10 w-10 text-brand-red animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Synchronizing Neural Nodes...</p>
      </div>
    );
  }

  const getContextLabel = () => {
    switch (activeMode) {
      case AppMode.Dashboard: return 'Core Command';
      case AppMode.Lenses: return 'Visual Intelligence';
      case AppMode.Tools: return 'System Diagnostics';
      case AppMode.Messages: return 'Neural Comms';
      case AppMode.Maintenance: return 'Upkeep Monitor';
      case AppMode.Training: return 'Skill Academy';
      case AppMode.Gallery: return 'Visual Archive';
      case AppMode.Calendar: return 'Facility Schedule';
      case AppMode.Machines: return 'Asset Management';
      case AppMode.Settings: return 'System Config';
      case AppMode.Admin: return 'Admin Override';
      case AppMode.Builder: return 'AI Architecture';
      case AppMode.AIChat: return 'Neural AI Diagnostic';
      case AppMode.NewsFeed: return 'Facility Pulse';
      case AppMode.DensityCalculator: return 'HMI Matrix Calculator';
      case AppMode.Scope: return 'MJ Motion Scope';
      default: return 'PecoFoods';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden font-sans antialiased text-slate-200">
      
      {/* Product Tour */}
      <AnimatePresence>
        {showTour && user && (
          <ProductTour user={user as User} onComplete={() => setShowTour(false)} />
        )}
      </AnimatePresence>

      {/* Global Overlays */}
      <AnimatePresence>
        {activeMode === AppMode.Lenses && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <Lenses onBack={() => setActiveMode(AppMode.Dashboard)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messenger Indicator (Shaded out line with blue light indicator) */}
      <div className="fixed top-6 right-6 z-[60] pointer-events-none">
        <div className="flex items-center space-x-2">
          <div className="h-[1px] w-12 bg-white/10" />
          <div className={`h-2 w-2 rounded-full ring-4 ring-white/5 transition-all duration-700 ${hasNewMessages ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]' : 'bg-white/5'}`} />
        </div>
      </div>

      <AnimatePresence>
        {updateAvailable && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-brand-red text-white flex items-center justify-between px-6 py-3 shrink-0 z-40"
          >
            <div className="flex items-center space-x-3">
              <RefreshCcw className="h-4 w-4 animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-widest">Peco Engine Update</span>
            </div>
            <button 
              onClick={applyUpdate}
              className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Sync
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-hidden relative">
        <Content />
        
        {/* Global Back Button - Only visible when not on Dashboard or Lenses (which has its own nav) */}
        {activeMode !== AppMode.Dashboard && activeMode !== AppMode.Lenses && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setActiveMode(AppMode.Dashboard)}
            className="absolute bottom-8 left-8 z-50 h-16 w-16 bg-white/10 backdrop-blur-3xl border border-white/10 rounded-full flex items-center justify-center text-white shadow-2xl active:scale-95 transition-transform"
          >
            <ArrowLeft className="h-6 w-6" />
          </motion.button>
        )}
      </main>

      {/* Navigation only hidden on Lenses for maximum immersion */}
      {activeMode !== AppMode.Lenses && (
        <BottomNav activeMode={activeMode} onNavigate={setActiveMode} user={user} />
      )}
    </div>
  );
};

export default App;
