import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWAUpdate } from '../services/pwaService';
import { getUsers, createUser, deleteUser, updateUser } from '../services/userService';
import { getModules, saveModules } from '../services/moduleService';
import { 
  Users, 
  ShieldCheck, 
  FileCode, 
  ArrowLeft,
  ChevronRight,
  Plus,
  ArrowRight,
  UserPlus,
  Lock,
  Search,
  Activity,
  UserCheck,
  Server,
  Key,
  RefreshCcw,
  Trash2,
  X,
  Mail,
  User as UserIcon,
  CheckCircle2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  ArrowUp,
  ArrowDown,
  Megaphone,
  Database,
  Terminal,
  Cpu,
  Zap,
  Clock,
  Filter,
  MoreVertical,
  Check,
  AlertTriangle
} from 'lucide-react';
import { User, AppMode, ModuleConfig, AuditLog, SystemConfig } from '../types';
import { collection, query, orderBy, getDocs, limit, addDoc, serverTimestamp, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

type AdminView = 'menu' | 'users' | 'access' | 'logs' | 'config';

const dummyActivityData = [
    { time: '08:00', queries: 45, events: 12 },
    { time: '09:00', queries: 82, events: 18 },
    { time: '10:00', queries: 65, events: 25 },
    { time: '11:00', queries: 120, events: 42 },
    { time: '12:00', queries: 110, events: 38 },
    { time: '13:00', queries: 95, events: 30 },
    { time: '14:00', queries: 155, events: 55 },
    { time: '15:00', queries: 170, events: 62 },
];

const facilityLines = [
    { id: 'L1', status: 'Online', efficiency: 98, load: 85 },
    { id: 'L2', status: 'Online', efficiency: 94, load: 78 },
    { id: 'L3', status: 'Maintenance', efficiency: 0, load: 0 },
    { id: 'L4', status: 'Online', efficiency: 88, load: 92 },
    { id: 'L5', status: 'Online', efficiency: 96, load: 81 },
    { id: 'L6', status: 'Offline', efficiency: 0, load: 0 },
];

interface AdminMenuProps {
    user: User;
}

const AdminMenu: React.FC<AdminMenuProps> = ({ user }) => {
    const [view, setView] = useState<AdminView>('menu');
    const [userList, setUserList] = useState<User[]>([]);
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
    const { issueRemoteUpdate } = usePWAUpdate();

    // New/Edit User State
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'Admin' | 'Operator'>('Operator');
    const [selectedModes, setSelectedModes] = useState<AppMode[]>([
        AppMode.Dashboard,
        AppMode.Lenses,
        AppMode.Tools,
        AppMode.Maintenance
    ]);

    const menuItems = [
      { id: 'users', name: 'Identity Matrix', icon: Users, color: 'bg-indigo-600', desc: 'Manage facility access & roles' },
      { id: 'access', name: 'Layout Config', icon: GripVertical, color: 'bg-purple-600', desc: 'System ribbon & module visibility' },
      { id: 'logs', name: 'Neural Audit', icon: Terminal, color: 'bg-brand-red', desc: 'Secure facility-wide traffic logs' },
      { id: 'config', name: 'System Root', icon: Cpu, color: 'bg-slate-700', desc: 'Facility mode & global broadcasts' },
    ];

    useEffect(() => {
        if (view === 'users') loadUsers();
        if (view === 'access') loadModules();
        if (view === 'logs') loadAuditLogs();
        
        let unsubscribeConfig: (() => void) | undefined;
        if (view === 'config' || view === 'menu') {
            const docRef = doc(db, 'system', 'config');
            unsubscribeConfig = onSnapshot(docRef, (d) => {
                if (d.exists()) setSystemConfig({ id: d.id, ...d.data() } as SystemConfig);
            });
        }

        return () => {
            if (unsubscribeConfig) unsubscribeConfig();
        };
    }, [view]);

    const logAction = async (action: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
        try {
            await addDoc(collection(db, 'audit_logs'), {
                userId: user.id || 'unknown',
                userEmail: user.email,
                action,
                details,
                timestamp: serverTimestamp(),
                severity
            });
        } catch (e) {
            console.error("LOG_ERROR: Failed to commit audit trace", e);
        }
    };

    const loadUsers = async () => {
        setIsLoading(true);
        const users = await getUsers();
        setUserList(users);
        setIsLoading(false);
    };

    const loadModules = async () => {
        setIsLoading(true);
        const mods = await getModules();
        setModules(mods);
        setIsLoading(false);
    };

    const loadAuditLogs = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50));
            const snap = await getDocs(q);
            setAuditLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AuditLog[]);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveModules = async () => {
        setIsLoading(true);
        try {
            await saveModules(modules);
            await logAction('MODULE_SYNC', `Updated global ribbon layout with ${modules.length} modules.`);
            alert('SYSTEM_CONFIRM: Layout Synchronization Complete');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSystemConfig = async (updates: Partial<SystemConfig>) => {
        setIsLoading(true);
        try {
            const docRef = doc(db, 'system', 'config');
            await setDoc(docRef, updates, { merge: true });
            await logAction('SYS_CONFIG_UPDATE', `Modified facility parameters: ${Object.keys(updates).join(', ')}`);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleModuleVisibility = (id: string) => {
        setModules(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
    };

    const moveModule = (index: number, direction: 'up' | 'down') => {
        const newModules = [...modules];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newModules.length) return;

        const temp = newModules[index];
        newModules[index] = newModules[targetIndex];
        newModules[targetIndex] = temp;

        const updated = newModules.map((m, i) => ({ ...m, order: i }));
        setModules(updated);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (editingUser) {
                await updateUser(editingUser.id!, {
                    name: newUserName,
                    role: newUserRole,
                    accessibleModes: selectedModes
                });
                await logAction('USER_UPDATE', `Updated parameters for node: ${newUserEmail}`);
            } else {
                await createUser({
                    email: newUserEmail.toLowerCase(),
                    name: newUserName,
                    username: newUserName,
                    role: newUserRole,
                    password: newUserPassword,
                    firstLogin: true,
                    accessibleModes: selectedModes
                });
                await logAction('USER_INIT', `Provisioned new node: ${newUserEmail}`);
            }
            setIsAddingUser(false);
            setEditingUser(null);
            loadUsers();
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const startEditUser = (u: User) => {
        setEditingUser(u);
        setNewUserName(u.name || u.username || '');
        setNewUserEmail(u.email);
        setNewUserRole(u.role);
        setSelectedModes(u.accessibleModes || []);
        setIsAddingUser(true);
    };

    const handleDeleteUser = async (id: string | undefined, email: string) => {
        if (!id) return;
        if (window.confirm(`PROTOCOL_WARNING: Permanently revoke access for ${email}?`)) {
            try {
                await deleteUser(id);
                await logAction('USER_REVOKED', `Permanently deleted node: ${email}`, 'warning');
                loadUsers();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const toggleMode = (mode: AppMode) => {
        setSelectedModes(prev => 
            prev.includes(mode) ? prev.filter(m => m !== mode) : [...prev, mode]
        );
    };

    if (view !== 'menu') {
      const activeItem = menuItems.find(i => i.id === view) || menuItems[0];
      return (
        <div className="h-full bg-slate-950 flex flex-col overflow-hidden">
          <div className="p-8 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center space-x-6">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => setView('menu')} className="p-3 bg-white/5 rounded-full text-white border border-white/5">
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">{activeItem.name}</h2>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Privileged System Control</p>
              </div>
            </div>
            {view === 'users' && (
                <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={() => { setEditingUser(null); setIsAddingUser(true); }}
                    className="px-6 py-2.5 bg-brand-red rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    INIT_NODE
                </motion.button>
            )}
            {view === 'logs' && (
                <motion.button 
                    whileTap={{ scale: 0.9 }} 
                    onClick={loadAuditLogs}
                    className="p-3 bg-white/5 rounded-full text-white border border-white/5"
                >
                    <RefreshCcw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </motion.button>
            )}
          </div>

          <div className="flex-1 p-8 overflow-y-auto no-scrollbar pb-32">
             {isLoading && view !== 'logs' ? (
                <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                    <Database className="h-12 w-12 text- brand-red mb-4" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Querying Neural Data...</p>
                </div>
             ) : view === 'users' ? (
                <div className="space-y-4">
                    {userList.map(u => (
                        <motion.div 
                            key={u.id} 
                            onClick={() => startEditUser(u)}
                            className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 hover:border-brand-red/30 transition-all group cursor-pointer"
                        >
                            <div className="flex items-center space-x-6">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border border-white/10 ${u.role === 'Admin' ? 'bg-brand-red/10 text-brand-red' : 'bg-slate-900 text-slate-500'}`}>
                                    <UserIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight">{u.name || 'System Student'}</h4>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === 'Admin' ? 'text-brand-red' : 'text-slate-500'}`}>{u.role}</span>
                                        <span className="h-1 w-1 bg-slate-800 rounded-full" />
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{u.email}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Modes</p>
                                    <p className="text-xs font-black text-white">{u.accessibleModes?.length || 0}</p>
                                </div>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id, u.email); }}
                                    className="p-3 bg-white/5 rounded-xl text-slate-700 hover:text-brand-red transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <ChevronRight className="h-5 w-5 text-slate-800 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    ))}
                </div>
             ) : view === 'access' ? (
                <div className="space-y-6">
                    <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 mb-10 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                            <GripVertical className="h-40 w-40 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Neural Ribbon Config</h3>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-8 max-w-sm">
                            Adjust module priority and visibility for the master terminal dashboard. Changes are broadcast to all nodes instantly upon commit.
                        </p>
                        <button 
                            onClick={handleSaveModules}
                            className="w-full py-6 bg-brand-red text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[1.5rem] flex items-center justify-center space-x-3 shadow-2xl shadow-brand-red/20 active:scale-95 transition-all"
                        >
                            <Save className="h-4 w-4" />
                            <span>Commit Global Layout</span>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {modules.map((mod, i) => (
                            <motion.div 
                                key={mod.id} layout
                                className={`flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 transition-all ${!mod.visible ? 'opacity-30' : ''}`}
                            >
                                <div className="flex items-center space-x-6">
                                    <div className="flex flex-col space-y-1">
                                        <button onClick={() => moveModule(i, 'up')} className="p-1 hover:text-brand-red text-slate-700"><ArrowUp className="h-4 w-4" /></button>
                                        <button onClick={() => moveModule(i, 'down')} className="p-1 hover:text-brand-red text-slate-700"><ArrowDown className="h-4 w-4" /></button>
                                    </div>
                                    <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{mod.label}</h4>
                                        <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-1">MODULE_ID: {mod.id}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => toggleModuleVisibility(mod.id)}
                                    className={`p-4 rounded-2xl border transition-all ${mod.visible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-700'}`}
                                >
                                    {mod.visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
             ) : view === 'logs' ? (
                <div className="space-y-4">
                    {auditLogs.map(log => (
                        <div key={log.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-start space-x-6">
                            <div className={`p-4 rounded-2xl mt-1 ${log.severity === 'critical' ? 'bg-brand-red/10 text-brand-red' : log.severity === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                <Terminal className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{log.action}</span>
                                        <span className="h-1 w-1 bg-slate-800 rounded-full" />
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{log.userEmail}</span>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">
                                        {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString() : '...'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed italic">"{log.details}"</p>
                            </div>
                        </div>
                    ))}
                    {auditLogs.length === 0 && (
                        <div className="text-center py-20 opacity-20">
                            <Activity className="h-16 w-16 mx-auto mb-4" />
                            <p className="font-black uppercase tracking-widest text-[10px]">No Neural Echoes in Buffer</p>
                        </div>
                    )}
                </div>
             ) : view === 'config' ? (
                <div className="space-y-12">
                    <section className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <Megaphone className="h-5 w-5 text-brand-red" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Global Broadcasts</h3>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem] space-y-6">
                            <div>
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 block">Active Banner Alert</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl p-6 text-white text-sm font-medium tracking-tight placeholder:text-slate-800 focus:border-brand-red outline-none transition-all"
                                    placeholder="Enter system-wide announcement..."
                                    rows={3}
                                    value={systemConfig?.alertBanner || ''}
                                    onChange={(e) => setSystemConfig(prev => prev ? { ...prev, alertBanner: e.target.value } : null)}
                                />
                            </div>
                            <button 
                                onClick={() => handleUpdateSystemConfig({ alertBanner: systemConfig?.alertBanner })}
                                className="px-8 py-4 bg-brand-red rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
                            >
                                Project Broadcast
                            </button>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <Server className="h-5 w-5 text-indigo-500" />
                            <h3 className="text-xl font-black text-white uppercase tracking-tight">Operational Mode</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {(['Full', 'Maintenance', 'Emergency', 'Holiday'] as const).map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => handleUpdateSystemConfig({ operationalMode: mode })}
                                    className={`p-10 rounded-[3rem] border flex flex-col items-center text-center transition-all ${systemConfig?.operationalMode === mode ? 'bg-indigo-600 border-indigo-500 shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100'}`}
                                >
                                    <div className="h-16 w-16 bg-white/10 rounded-3xl flex items-center justify-center mb-6">
                                        {mode === 'Full' ? <Check className="h-8 w-8" /> : mode === 'Emergency' ? <AlertTriangle className="h-8 w-8" /> : mode === 'Maintenance' ? <RefreshCcw className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                                    </div>
                                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{mode}</h4>
                                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-2">Active Protocol</p>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
             ) : null}
          </div>

          <AnimatePresence>
            {isAddingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingUser(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-5xl bg-slate-900 rounded-[5rem] border border-white/5 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-12 flex items-center justify-between border-b border-white/5 shrink-0">
                            <div>
                                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{editingUser ? 'Overhaul Node' : 'Initialize Node'}</h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-3">Neural Authorization Framework</p>
                            </div>
                            <button onClick={() => setIsAddingUser(false)} className="p-6 bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"><X className="h-8 w-8" /></button>
                        </div>
                        <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-12 no-scrollbar space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                                <section className="space-y-8">
                                    <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.4em]">Core Credentials</h4>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700" />
                                            <input 
                                                type="email" 
                                                disabled={!!editingUser}
                                                className="w-full h-18 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-white text-sm font-black uppercase tracking-widest placeholder:text-slate-800 focus:border-brand-red outline-none transition-all disabled:opacity-40"
                                                placeholder="Identity Email"
                                                value={newUserEmail}
                                                onChange={(e) => setNewUserEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="relative">
                                            <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700" />
                                            <input 
                                                type="text" 
                                                className="w-full h-18 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-white text-sm font-black uppercase tracking-widest placeholder:text-slate-800 focus:border-brand-red outline-none transition-all"
                                                placeholder="Display Identity"
                                                value={newUserName}
                                                onChange={(e) => setNewUserName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {(!editingUser || true) && (
                                            <div className="relative">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-700" />
                                                <input 
                                                    type="password" 
                                                    className="w-full h-18 bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 text-white text-sm font-black uppercase tracking-widest placeholder:text-slate-800 focus:border-brand-red outline-none transition-all"
                                                    placeholder={editingUser ? "Leave blank to keep current" : "Secure Access Token"}
                                                    value={newUserPassword}
                                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                                    required={!editingUser}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.4em] mb-6">Permission Hierarchy</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {(['Operator', 'Admin'] as const).map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setNewUserRole(role)}
                                                    className={`h-24 rounded-[2rem] border flex flex-col items-center justify-center space-y-2 transition-all ${newUserRole === role ? 'bg-brand-red border-brand-red shadow-xl text-white' : 'bg-white/5 border-white/5 text-slate-600'}`}
                                                >
                                                    <span className="text-xs font-black uppercase tracking-widest">{role}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Access Level</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                                <section className="space-y-8">
                                    <h4 className="text-[10px] font-black text-brand-red uppercase tracking-[0.4em]">Neural Vector Mapping</h4>
                                    <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-4 no-scrollbar">
                                        {Object.values(AppMode).map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => toggleMode(mode)}
                                                className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all ${selectedModes.includes(mode) ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 opacity-40'}`}
                                            >
                                                <span className="text-[10px] font-black text-white uppercase tracking-tight">{mode.replace('-', ' ')}</span>
                                                {selectedModes.includes(mode) && <CheckCircle2 className="h-4 w-4 text-brand-red" />}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-10 bg-brand-red hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-[1em] rounded-full shadow-3xl shadow-brand-red/30 transition-all flex items-center justify-center space-x-6"
                            >
                                <Zap className={`h-8 w-8 ${isLoading ? 'animate-pulse' : ''}`} />
                                <span>{editingUser ? 'Sync Node Parameters' : 'Authorize New Neural Link'}</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
        <div className="h-full bg-slate-950 flex flex-col p-8 pb-32 overflow-y-auto no-scrollbar">
            <div className="mb-12 flex justify-between items-end">
               <div>
                  <h2 className="text-6xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">Access <span className="text-brand-red">Root</span></h2>
                  <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em]">Advanced Operational Deployment Node</p>
               </div>
               <div className="flex space-x-4">
                    <div className="text-right">
                        <p className="text-[px] font-black text-slate-800 uppercase tracking-widest mb-1">Status</p>
                        <div className="flex items-center space-x-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-[10px] font-black text-white uppercase tracking-widest">Master Link: Active</span>
                        </div>
                    </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as AdminView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[4rem] flex flex-col items-center text-center hover:bg-brand-red/5 hover:border-brand-red/20 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-8 rounded-[2.5rem] ${item.color} mb-8 shadow-lg shadow-black/60 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-2">{item.name}</h3>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-relaxed mb-8">{item.desc}</p>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-brand-red transition-all">
                            <span>Access Override</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 overflow-hidden relative group">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Neural Pulse <span className="text-brand-red">Analytics</span></h3>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Facility-wide intelligence demand monitor</p>
                            </div>
                            <div className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-2 rounded-full bg-brand-red" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase">Queries</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase">Events</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dummyActivityData}>
                                    <defs>
                                        <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                        itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                                    />
                                    <Area type="monotone" dataKey="queries" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorQueries)" />
                                    <Area type="monotone" dataKey="events" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 overflow-hidden relative group">
                         <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Facility <span className="text-emerald-500">Node Status</span></h3>
                                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mt-1">Real-time production line synchronization</p>
                            </div>
                            <button 
                                onClick={issueRemoteUpdate}
                                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white hover:bg-white/10 transition-all flex items-center space-x-2"
                            >
                                <RefreshCcw className="h-4 w-4" />
                                <span>RE-SYNC ALL</span>
                            </button>
                         </div>

                         <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {facilityLines.map(line => (
                                <div key={line.id} className="p-6 bg-slate-950/50 border border-white/5 rounded-[2rem] hover:border-white/10 transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-lg font-black text-white">{line.id}</span>
                                        <div className={`h-2 w-2 rounded-full ${line.status === 'Online' ? 'bg-emerald-500' : line.status === 'Maintenance' ? 'bg-yellow-500' : 'bg-rose-500'} shadow-[0_0_10px_currentColor] animate-pulse`} />
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase mb-1">
                                                <span>Efficiency</span>
                                                <span className="text-white">{line.efficiency}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${line.efficiency}%` }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase mb-1">
                                                <span>Neural Load</span>
                                                <span className="text-white">{line.load}%</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${line.load}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 flex flex-col items-center justify-center text-center space-y-8 h-full relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-brand-red/5 to-transparent pointer-events-none" />
                        <div className="h-40 w-40 bg-brand-red/10 border border-brand-red/20 rounded-full flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-brand-red/20 rounded-full animate-ping" />
                            <Activity className="h-16 w-16 text-brand-red group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Global Pulse</h4>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed italic">
                                Facility intelligence synchronized. Current neural throughput at 82% capacity.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                             <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5">
                                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-2">AUTH_BATCH</p>
                                <p className="text-3xl font-black text-emerald-500 tabular-nums">2.1k</p>
                             </div>
                             <div className="p-8 bg-black/40 rounded-[2.5rem] border border-white/5">
                                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-2">LOG_DELTA</p>
                                <p className="text-3xl font-black text-brand-red tabular-nums">+04</p>
                             </div>
                        </div>
                        <button className="w-full py-6 bg-white/5 hover:bg-brand-red text-white font-black text-[10px] uppercase tracking-[0.4em] rounded-[2rem] border border-white/10 transition-all">
                            Terminal Lockdown
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMenu;
