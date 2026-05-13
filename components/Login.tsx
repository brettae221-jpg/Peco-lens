
import React, { useState } from 'react';
import { authenticateUser, updateUser } from '../services/userService';
import { User } from '../types';
import { auth } from '../firebase';
import { signInAnonymously } from 'firebase/auth';
import { CogIcon } from './icons/CogIcon';
import { Mail, Lock, ArrowRight, Info, ShieldCheck, Zap, Globe, KeyRound } from 'lucide-react';

interface LoginProps {
  onLogin: (user: Omit<User, 'password'>) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    setIsLoading(true);
    try {
      // Sign in to Firebase Auth anonymously to satisfy rules (isSignedIn)
      if (!auth) {
        throw new Error('FIREBASE_NOT_INITIALIZED: Configuration may be invalid or missing.');
      }
      
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const user = await authenticateUser(email, password);
      if (user) {
        if (user.firstLogin) {
          setTempUser(user);
          setIsResettingPassword(true);
        } else {
          const { password: _, ...userToReturn } = user;
          onLogin(userToReturn);
        }
      } else {
        setError('AUTH_REFUSED: Invalid Credentials for Secure Root');
      }
    } catch (err: any) {
      console.error("Login sequence fault:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('SECURITY_FAULT: Domain not authorized in Firebase Console. Add your GitHub Pages URL to Authorized Domains.');
      } else if (err.message?.includes('FIREBASE_NOT_INITIALIZED')) {
        setError('CONFIG_FAULT: Firebase configuration is missing or invalid.');
      } else {
        setError(`SYSTEM_FAULT: ${err.message || 'Authentication Service Unreachable'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('VALIDATION_ERROR: Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('VALIDATION_ERROR: Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      if (tempUser?.id) {
        await updateUser(tempUser.id, { 
          password: newPassword, 
          firstLogin: false 
        });
        
        // Auto-login after reset
        const { password: _, ...userToReturn } = tempUser;
        onLogin({ ...userToReturn, firstLogin: false });
      }
    } catch (err) {
      setError('SYSTEM_FAULT: Password update failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isResettingPassword) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans antialiased">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
             <div className="inline-block p-6 rounded-[2.5rem] bg-brand-red/20 backdrop-blur-2xl border border-brand-red/20 shadow-2xl mb-6">
                <KeyRound className="h-14 w-14 text-white" />
             </div>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Security <span className="text-brand-red">Protocol</span></h1>
             <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Initialize Your Secure Access</p>
          </div>

          <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10">
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed mb-8 text-center">
              This is your first login. For peak facility security, you must establish a permanent system keyword.
            </p>
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New System Keyword"
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all uppercase tracking-widest"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Keyword"
                    className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all uppercase tracking-widest"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-brand-red/10 border border-brand-red/20 p-4 rounded-2xl flex items-center space-x-3">
                  <Info className="h-5 w-5 text-brand-red shrink-0" />
                  <p className="text-brand-red text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 bg-brand-red hover:bg-brand-red/90 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-brand-red/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
              >
                <span>{isLoading ? 'ENCRYPTING...' : 'Update & Connect'}</span>
                {!isLoading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans antialiased">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-block p-6 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/10 shadow-2xl mb-6 group">
            {CogIcon ? (
              <CogIcon className="h-14 w-14 text-white animate-spin-slow group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center">?</div>
            )}
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Peco<span className="text-brand-red">Lens</span></h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em]">Troubleshooting Command Center</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-3xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Operator Email"
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all uppercase tracking-widest"
                  required
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-brand-red transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="System Keyword"
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-[1.5rem] pl-16 pr-6 text-white text-sm font-bold placeholder:text-slate-600 focus:outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all uppercase tracking-widest"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-brand-red/10 border border-brand-red/20 p-4 rounded-2xl flex items-center space-x-3">
                <Info className="h-5 w-5 text-brand-red shrink-0" />
                <p className="text-brand-red text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-16 bg-brand-red hover:bg-brand-red/90 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-2xl shadow-brand-red/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <span>{isLoading ? 'INIT_SEQUENCE...' : 'Establish Connection'}</span>
              {!isLoading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 px-6 text-white/50">
          <div className="text-center">
            <ShieldCheck className="h-5 w-5 mx-auto mb-2" />
            <p className="text-[8px] font-black uppercase tracking-widest">Secure</p>
          </div>
          <div className="text-center border-x border-white/5">
            <Zap className="h-5 w-5 mx-auto mb-2" />
            <p className="text-[8px] font-black uppercase tracking-widest">Real-time</p>
          </div>
          <div className="text-center">
            <Globe className="h-5 w-5 mx-auto mb-2" />
            <p className="text-[8px] font-black uppercase tracking-widest">Neural</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
