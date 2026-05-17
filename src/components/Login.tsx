import React, { useState } from 'react';
import { loginWithGoogle, auth } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Gamepad2, Mail, Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        // Ignore, another popup is already open
      } else {
        setError(err.message.replace('Firebase: ', '').replace('Error ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        if (!username.trim()) throw new Error("Please enter a username for your squad");
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // We update the profile immediately
        await updateProfile(result.user, { 
          displayName: username,
          photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });
        // Instead of reload, we let App.tsx handle the state change
        // but we might want to manually update the store here too if we want zero-latency
      }
    } catch (err: any) {
      console.error(err);
      let msg = err.message.replace('Firebase: ', '').replace('Error ', '');
      if (err.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      if (err.code === 'auth/invalid-credential') msg = "Wrong email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse delay-1000"></div>

      <div className="bg-[#151921] z-10 p-10 rounded-3xl max-w-md w-full mx-4 border border-white/5 shadow-2xl flex flex-col items-center relative">
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 transform rotate-3">
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-black text-white mb-2 tracking-tight text-center font-display uppercase italic">Nexus<span className="text-indigo-400">Voice</span></h1>
        <p className="text-slate-400 mb-8 text-center text-sm font-medium">{isLogin ? 'Welcome back, gamer.' : 'Join the squad.'}</p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-xl mb-6 flex items-start gap-2 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!isLogin && (
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <UserIcon className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Squad Name (Username)" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all text-sm placeholder-slate-500"
                required={!isLogin}
              />
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all text-sm placeholder-slate-500"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type="password" 
              placeholder={isLogin ? "Password" : "Create Password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all text-sm placeholder-slate-500"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className="relative group animate-in slide-in-from-top-2 duration-200">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-indigo-500/50 focus:bg-white/5 transition-all text-sm placeholder-slate-500"
                required
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden bg-indigo-600 text-white font-bold text-sm py-4 px-6 rounded-xl transition-all hover:bg-indigo-500 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Login to Nexus' : 'Create Account')}
          </button>
        </form>

        <div className="w-full flex items-center my-6 gap-3">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full relative overflow-hidden bg-white/5 hover:bg-white/10 text-white font-bold text-sm py-3.5 px-6 rounded-xl border border-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-xs text-slate-500 font-medium">
          {isLogin ? "Don't have an account?" : "Already in the squad?"}
          <button 
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            className="text-indigo-400 hover:text-indigo-300 ml-1.5 font-bold cursor-pointer hover:underline transition-all"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

