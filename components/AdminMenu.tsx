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
  ArrowDown
} from 'lucide-react';
import { User, AppMode, ModuleConfig } from '../types';

type AdminView = 'menu' | 'users' | 'access' | 'logs';

const AdminMenu: React.FC = () => {
    const [view, setView] = useState<AdminView>('menu');
    const [userList, setUserList] = useState<User[]>([]);
    const [modules, setModules] = useState<ModuleConfig[]>([]);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { issueRemoteUpdate } = usePWAUpdate();

    // New User State
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
      { id: 'users', name: 'Users', icon: Users, color: 'bg-purple-600', submenus: ['Operator List', 'Admin Roles', 'Add User', 'User History'] },
      { id: 'access', name: 'Access Control', icon: ShieldCheck, color: 'bg-brand-red', submenus: ['Lens Permission', 'Tool Access', 'Machine Root', 'LDAP Sync'] },
      { id: 'logs', name: 'System Logs', icon: FileCode, color: 'bg-slate-700', submenus: ['Audit Trail', 'Fault Dump', 'API Traffic', 'Clear Logs'] },
    ];

    useEffect(() => {
        if (view === 'users') loadUsers();
        if (view === 'access') loadModules();
    }, [view]);

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

    const handleSaveModules = async () => {
        setIsLoading(true);
        try {
            await saveModules(modules);
            alert('SYSTEM_CONFIRM: Layout Synchronization Complete');
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

        // Update orders
        const updated = newModules.map((m, i) => ({ ...m, order: i }));
        setModules(updated);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await createUser({
                email: newUserEmail.toLowerCase(),
                name: newUserName,
                username: newUserName,
                role: newUserRole,
                password: newUserPassword,
                firstLogin: true,
                accessibleModes: selectedModes
            });
            setIsAddingUser(false);
            loadUsers();
            // Reset fields
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (id: string | undefined) => {
        if (!id) return;
        if (window.confirm('PROTOCOL_WARNING: Permanently revoke user access?')) {
            try {
                await deleteUser(id);
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
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Privileged System Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <motion.button whileTap={{ scale: 0.9 }} className="p-3 bg-white/5 rounded-full text-white border border-white/5"><Search className="h-5 w-5" /></motion.button>
               <motion.button 
                 whileTap={{ scale: 0.9 }} 
                 onClick={() => setIsAddingUser(true)}
                 className="px-6 py-2.5 bg-purple-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest flex items-center shadow-2xl"
               >
                  <UserPlus className="h-4 w-4 mr-2" />
                  INIT_USER
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
             <div className="space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <RefreshCcw className="h-10 w-10 text-purple-600 animate-spin" />
                    </div>
                ) : view === 'access' ? (
                    <div className="space-y-6">
                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 mb-10">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Facility Ribbon Configuration</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-8">
                                Adjust the priority and visibility of core system modules for all authenticated terminals.
                            </p>
                            <button 
                              onClick={handleSaveModules}
                              className="w-full py-6 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-[1.5rem] flex items-center justify-center space-x-3 shadow-2xl shadow-emerald-600/20"
                            >
                                <Save className="h-4 w-4" />
                                <span>Commit Layout Changes</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {modules.map((mod, index) => (
                                <motion.div 
                                  key={mod.id}
                                  layout
                                  className={`flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5 transition-all ${!mod.visible ? 'opacity-40 grayscale' : ''}`}
                                >
                                    <div className="flex items-center space-x-6">
                                        <div className="flex flex-col space-y-1">
                                            <button onClick={() => moveModule(index, 'up')} className="p-1 hover:text-white text-slate-600"><ArrowUp className="h-4 w-4" /></button>
                                            <button onClick={() => moveModule(index, 'down')} className="p-1 hover:text-white text-slate-600"><ArrowDown className="h-4 w-4" /></button>
                                        </div>
                                        <div className="h-12 w-12 bg-white/5 rounded-xl flex items-center justify-center">
                                            <GripVertical className="h-5 w-5 text-slate-700" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-white uppercase tracking-tight">{mod.label}</p>
                                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ID: {mod.id}</p>
                                        </div>
                                    </div>

                                    <button 
                                      onClick={() => toggleModuleVisibility(mod.id)}
                                      className={`p-4 rounded-xl border transition-all ${mod.visible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-slate-500'}`}
                                    >
                                        {mod.visible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ) : userList.length === 0 ? (
                    <div className="text-center py-20 bg-white/2 rounded-[3rem] border border-dashed border-white/10">
                        <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">No Active Nodes Identified</p>
                    </div>
                ) : (
                    userList.map(user => (
                    <motion.div 
                        key={user.id} 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-8 bg-white/2 rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all group"
                    >
                        <div className="flex items-center space-x-8">
                        <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center border border-white/5 ${user.role === 'Admin' ? 'bg-brand-red/20 border-brand-red/30' : 'bg-slate-800'}`}>
                            <UserIcon className={`h-8 w-8 ${user.role === 'Admin' ? 'text-brand-red' : 'text-slate-500'}`} />
                        </div>
                        <div>
                            <p className="text-xl font-black text-white uppercase tracking-tight">{user.name || user.email.split('@')[0]}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <p className={`text-[10px] font-black uppercase tracking-widest leading-none ${user.role === 'Admin' ? 'text-brand-red' : 'text-purple-600'}`}>{user.role} Clearace</p>
                                <span className="h-1 w-1 bg-slate-700 rounded-full" />
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{user.email}</p>
                            </div>
                        </div>
                        </div>
                        
                        <div className="flex space-x-4 items-center">
                        <div className="text-right mr-4">
                            <p className="text-[10px] font-black text-slate-600 uppercase leading-none mb-1">Modules</p>
                            <p className="text-sm font-black text-slate-400">{user.accessibleModes?.length || 0}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-4 bg-white/5 rounded-2xl text-slate-600 hover:text-brand-red transition-colors border border-white/5"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                        </div>
                    </motion.div>
                    ))
                )}
             </div>
          </div>

          <AnimatePresence>
            {isAddingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-20">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsAddingUser(false)}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-slate-900 rounded-[4rem] border border-white/10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="p-10 flex items-center justify-between border-b border-white/5">
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Initialize New Node</h3>
                                <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Operator Provisioning Protocol</p>
                            </div>
                            <button onClick={() => setIsAddingUser(false)} className="p-4 bg-white/5 rounded-full text-slate-400">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-12 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">Identity Matrix</h4>
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-purple-500" />
                                            <input 
                                              type="text" 
                                              placeholder="Display Name" 
                                              value={newUserName}
                                              onChange={(e) => setNewUserName(e.target.value)}
                                              className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 text-white text-sm font-bold uppercase tracking-widest placeholder:text-slate-700"
                                              required
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-purple-500" />
                                            <input 
                                              type="email" 
                                              placeholder="System Email" 
                                              value={newUserEmail}
                                              onChange={(e) => setNewUserEmail(e.target.value)}
                                              className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 text-white text-sm font-bold uppercase tracking-widest placeholder:text-slate-700"
                                              required
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-purple-500" />
                                            <input 
                                              type="text" 
                                              placeholder="Temporary Password" 
                                              value={newUserPassword}
                                              onChange={(e) => setNewUserPassword(e.target.value)}
                                              className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 text-white text-sm font-bold uppercase tracking-widest placeholder:text-slate-700"
                                              required
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] mb-4">Authorization Tier</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Operator', 'Admin'].map(role => (
                                                <button
                                                    key={role}
                                                    type="button"
                                                    onClick={() => setNewUserRole(role as any)}
                                                    className={`h-16 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${newUserRole === role ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500'}`}
                                                >
                                                    {role} Clearace
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">Module Permissions</h4>
                                    <div className="grid grid-cols-2 gap-3 h-[300px] overflow-y-auto no-scrollbar pr-2">
                                        {Object.values(AppMode).map(mode => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => toggleMode(mode)}
                                                className={`p-5 rounded-2xl border text-left flex flex-col transition-all ${selectedModes.includes(mode) ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 opacity-40'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-white uppercase tracking-tight">{mode}</span>
                                                    {selectedModes.includes(mode) && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-8 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.4em] rounded-[2rem] shadow-3xl shadow-purple-600/30 transition-all flex items-center justify-center space-x-4"
                            >
                                <Plus className="h-6 w-6" />
                                <span>{isLoading ? 'EXECUTING_INIT...' : 'Finalize Provisioning'}</span>
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
            <div className="mb-12">
               <h2 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase tracking-tight">Access <span className="text-purple-500">Root</span></h2>
               <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.3em]">Master Operational Directive Control</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {menuItems.map(item => (
                    <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView(item.id as AdminView)}
                        className="group relative bg-white/5 border border-white/5 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-white/10 transition-all shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 rounded-[2rem] ${item.color} mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform`}>
                            <item.icon className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">{item.name}</h3>
                        
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                            <span>Open Root</span>
                            <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                        </div>
                    </motion.button>
                ))}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={issueRemoteUpdate}
                    className="group relative bg-brand-red/5 border border-brand-red/20 p-10 rounded-[3rem] flex flex-col items-start text-left hover:bg-brand-red/10 transition-all shadow-2xl overflow-hidden col-span-1 md:col-span-2"
                >
                    <div className="p-6 rounded-[2rem] bg-brand-red mb-8 shadow-lg shadow-black/40 group-hover:scale-110 transition-transform">
                        <RefreshCcw className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">Signal Global Update</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed mb-8">Force all active facility terminals to check for new engine protocols and assets.</p>
                    
                    <div className="flex items-center text-[10px] font-black text-brand-red uppercase tracking-widest mt-auto group-hover:text-white transition-all">
                        <span>Initiate Sync</span>
                        <ArrowRight className="ml-3 h-4 w-4 transform group-hover:translate-x-2 transition-transform" />
                    </div>
                </motion.button>
            </div>
        </div>
    );
};

export default AdminMenu;
