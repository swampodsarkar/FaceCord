import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { ref, update, onValue } from 'firebase/database';
import { User, Shield, Trophy, Zap, Edit2, LogOut, Settings, Hash, Calendar, Star, MessageSquare, Palette, Circle, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Profile() {
  const { user, vipTier, setUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [customStatus, setCustomStatus] = useState(user?.customStatus || '');
  const [activity, setActivity] = useState(user?.activity || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [bannerColor, setBannerColor] = useState(user?.bannerColor || 'from-indigo-600 via-purple-700 to-pink-600');
  const [nameColor, setNameColor] = useState(user?.nameColor || 'text-white');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setBio(user.bio || '');
      setCustomStatus(user.customStatus || '');
      setActivity(user.activity || '');
      setStatus(user.status || 'online');
      setBannerColor(user.bannerColor || 'from-indigo-600 via-purple-700 to-pink-600');
      setNameColor(user.nameColor || 'text-white');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const saveProfile = async () => {
     if (!user) return;
     setIsSaving(true);
     try {
       const userRef = ref(db, `users/${user.uid}`);
       const updates = { 
         displayName, 
         bio, 
         customStatus, 
         activity,
         status,
         bannerColor,
         nameColor: vipTier !== 'free' ? nameColor : 'text-white'
       };
       await update(userRef, updates);
       setUser({ ...user, ...updates });
       setIsEditing(false);
     } catch (err) {
       console.error('Failed to update profile:', err);
     } finally {
       setIsSaving(false);
     }
  };

  const statusOptions = [
    { id: 'online', label: 'Online', color: 'bg-green-500' },
    { id: 'idle', label: 'Away', color: 'bg-amber-500' },
    { id: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
  ];

  const bannerOptions = [
    { id: 'classic', color: 'from-indigo-600 via-purple-700 to-pink-600' },
    { id: 'neon', color: 'from-cyan-500 via-blue-600 to-indigo-700' },
    { id: 'sunset', color: 'from-orange-500 via-red-600 to-purple-700' },
    { id: 'forest', color: 'from-emerald-500 via-teal-600 to-cyan-700' },
    { id: 'midnight', color: 'from-slate-900 via-slate-800 to-indigo-950' },
  ];

  const nameColors = [
    { label: 'White', class: 'text-white' },
    { label: 'Gold', class: 'text-amber-400' },
    { label: 'Cyan', class: 'text-cyan-400' },
    { label: 'Pink', class: 'text-pink-400' },
    { label: 'Purple', class: 'text-purple-400' },
  ];

  const stats = [
    { label: 'Level', value: user?.level || 0, icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Experience', value: `${user?.xp || 0} XP`, icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { label: 'Rank', value: vipTier.toUpperCase(), icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Parties Host', value: user?.partiesHost || 0, icon: Trophy, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="h-full bg-transparent p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header / Banner Area */}
        <section className="relative h-56 md:h-72 rounded-3xl shadow-2xl shadow-black/50 border border-white/5 bg-[#0B0E14]">
          <div className={`absolute inset-0 rounded-3xl overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${bannerColor}`}>
               <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
               {vipTier !== 'free' && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
               )}
            </div>
          </div>
          
          <div className="absolute -bottom-16 left-8 flex items-end gap-6 z-20">
             <div className="relative group">
                <div className={`w-28 h-28 md:w-36 md:h-36 rounded-3xl border-4 border-[#0B0E14] bg-slate-900 overflow-hidden shadow-2xl shadow-black/80 relative`}>
                   <img 
                     src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.displayName || 'Felix'}`} 
                     alt="Profile" 
                     className="w-full h-full object-cover"
                   />
                   <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-4 border-[#0B0E14] ${statusOptions.find(s => s.id === status)?.color || 'bg-green-500'}`}></div>
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer rounded-3xl">
                     <Edit2 className="w-6 h-6 text-white" />
                  </div>
                )}

                {/* Animated Frame for VIP */}
                {vipTier !== 'free' && (
                  <div className="absolute -inset-1 rounded-[32px] border-2 border-indigo-500/50 animate-pulse pointer-events-none"></div>
                )}
             </div>
             
             <div className="mb-20">
                <div className="flex items-center gap-3">
                   {isEditing ? (
                      <input 
                        type="text" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="bg-black/40 text-indigo-400 font-black text-2xl md:text-5xl italic uppercase tracking-tighter outline-none border-b-4 border-indigo-500 px-2 min-w-[200px]"
                        autoFocus
                      />
                   ) : (
                      <h1 className={`font-black text-2xl md:text-5xl italic uppercase tracking-tighter drop-shadow-2xl ${vipTier !== 'free' ? nameColor : 'text-white'}`}>
                        {user?.displayName || 'Unknown Gamer'}
                      </h1>
                   )}
                   <div className="flex flex-col gap-1">
                      <span className="bg-indigo-500 text-white text-[10px] md:text-xs font-black px-2 py-1 rounded-md uppercase italic skew-x-[-12deg] shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center gap-1">
                        <Shield className="w-3 h-3" /> {vipTier.toUpperCase()}
                      </span>
                   </div>
                </div>
                {!isEditing && (
                  <div className="mt-2 flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 w-fit">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <p className="text-white text-xs font-bold uppercase tracking-wider">{customStatus || "Setting the mood..."}</p>
                  </div>
                )}
                {!isEditing && activity && (
                  <div className="mt-2 flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500/20 w-fit">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest leading-none py-1">Playing {activity}</p>
                  </div>
                )}
             </div>
          </div>
          
          <div className="absolute top-6 right-8 flex gap-3">
             {isEditing ? (
                <div className="flex gap-2">
                   <button 
                     onClick={() => setIsEditing(false)}
                     className="bg-white/5 hover:bg-white/10 text-slate-400 font-bold py-2 px-6 rounded-xl transition-all text-sm"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={saveProfile}
                     disabled={isSaving}
                     className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-8 rounded-xl shadow-xl shadow-indigo-600/30 transition-all active:scale-95 text-sm"
                   >
                     {isSaving ? 'Pushing Updates...' : 'Save Profile'}
                   </button>
                </div>
             ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="bg-black/40 hover:bg-black/60 text-white font-bold py-2.5 px-6 rounded-xl backdrop-blur-md border border-white/10 transition-all active:scale-95 text-sm flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Customize Hub
                </button>
             )}
          </div>
        </section>

        {/* Edit Panel overlay for Banner/Status when editing */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#0B0E14] border border-indigo-500/20 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8 shadow-2xl shadow-indigo-500/5"
            >
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-l-2 border-indigo-500 pl-2">Vibe & Status</label>
                  <div className="flex flex-wrap gap-2">
                     {statusOptions.map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => setStatus(opt.id as any)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-xs font-bold ${status === opt.id ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                        >
                           <div className={`w-2 h-2 rounded-full ${opt.color}`}></div>
                           {opt.label}
                        </button>
                     ))}
                  </div>
                  <div className="relative mt-2">
                     <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                     <input 
                       type="text" 
                       placeholder="Set a custom status..."
                       value={customStatus}
                       onChange={e => setCustomStatus(e.target.value)}
                       className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm font-bold"
                     />
                  </div>
                  <div className="relative mt-2">
                     <Gamepad2 className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                     <input 
                       type="text" 
                       placeholder="What are you playing/doing?"
                       value={activity}
                       onChange={e => setActivity(e.target.value)}
                       className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 transition-colors text-sm font-bold"
                     />
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-l-2 border-emerald-500 pl-2">Hub Aesthetics</label>
                  <div className="flex flex-wrap gap-3">
                     {bannerOptions.map(opt => (
                        <button 
                          key={opt.id}
                          onClick={() => setBannerColor(opt.color)}
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} border-2 transition-transform hover:scale-110 shadow-lg ${bannerColor === opt.color ? 'border-white' : 'border-black/40'}`}
                        />
                     ))}
                  </div>
                  
                  {vipTier !== 'free' && (
                    <div className="mt-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 block">VIP Name Color</label>
                       <div className="flex flex-wrap gap-2">
                          {nameColors.map(color => (
                             <button 
                                key={color.label}
                                onClick={() => setNameColor(color.class)}
                                className={`px-2 py-1 rounded border text-[10px] font-black uppercase tracking-tighter transition-all ${nameColor === color.class ? 'bg-white/10 border-white text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
                             >
                                {color.label}
                             </button>
                          ))}
                       </div>
                    </div>
                  )}
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 border-l-2 border-pink-500 pl-2">Bio / About Me</label>
                  <textarea 
                    placeholder="Tell your squad about yourself..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full h-[100px] bg-[#06080A] text-white border border-white/10 rounded-xl p-3 focus:outline-none focus:border-pink-500/50 transition-colors text-sm font-medium resize-none custom-scrollbar"
                  />
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <section className={`grid grid-cols-2 md:grid-cols-4 gap-4 transition-all ${isEditing ? 'mt-8' : 'mt-24 md:mt-16'}`}>
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0B0E14] border border-white/5 p-4 rounded-3xl flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all hover:-translate-y-1 shadow-xl shadow-black/20"
            >
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl mb-3 group-hover:scale-110 transition-transform shadow-inner`}>
                 <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <span className="text-[10px] uppercase font-black text-slate-500 tracking-widest">{stat.label}</span>
              <span className="text-lg md:text-xl font-black text-white">{stat.value}</span>
            </motion.div>
          ))}
        </section>

        {/* Main Content Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
             {/* Bio Preview */}
             {!isEditing && (
               <div className="bg-[#0B0E14] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>
                  <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                     <Edit2 className="w-3 h-3 text-indigo-400" /> Bio
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">
                    {user?.bio || "No bio set yet. Tell the community about your gaming journey!"}
                  </p>
               </div>
             )}

             <div className="bg-[#0B0E14] border border-white/5 rounded-3xl p-6 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-400" /> Gamer Performance
                   </h3>
                   <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest bg-indigo-400/10 px-2 py-1 rounded">Top 5% League</span>
                </div>
                
                <div className="space-y-5">
                   {[
                     { label: 'Voice Activity', val: user?.voiceActivity || 0, color: 'from-blue-500 to-indigo-600' },
                     { label: 'Matchmaking Wins', val: user?.wins || 0, color: 'from-red-500 to-pink-600' },
                     { label: 'Mini Game Mastery', val: user?.minigameMastery || 0, color: 'from-amber-400 to-orange-600' },
                     { label: 'Community Karma', val: user?.karma || 0, color: 'from-emerald-400 to-teal-600' },
                   ].map((item) => (
                      <div key={item.label}>
                         <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest">
                            <span className="text-slate-500">{item.label}</span>
                            <span className="text-white">{item.val}%</span>
                         </div>
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${item.val}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className={`h-full bg-gradient-to-r ${item.color} shadow-[0_0_15px_rgba(99,102,241,0.4)] relative`}
                            >
                               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                            </motion.div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="bg-[#0B0E14] border border-white/5 rounded-3xl p-6 shadow-2xl shadow-black/20">
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-6">Nexus Credentials</h3>
                <div className="space-y-5">
                   <div className="flex items-center gap-4 text-slate-400 group p-2 hover:bg-white/5 rounded-xl transition-colors">
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <Hash className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">Unique ID</span>
                         <span className="text-xs text-white font-black tracking-tight">{user?.uid.slice(0, 16)}...</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 text-slate-400 group p-2 hover:bg-white/5 rounded-xl transition-colors">
                      <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-black text-slate-500 tracking-tighter">Season Rank</span>
                         <span className="text-xs text-white font-black tracking-tight">{user?.seasonRank || "Unranked"}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-3xl p-6 shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-2xl rounded-full -mr-8 -mt-8"></div>
                <h3 className="text-white font-black uppercase tracking-widest text-xs mb-2">Pro Perks</h3>
                <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-wider mb-4 leading-relaxed">Upgrade to UNLOCK custom banners, animated frames, and unique colors!</p>
                <button className="w-full bg-white text-indigo-600 font-black py-3 rounded-xl transition-all shadow-xl hover:scale-105 active:scale-95 text-xs uppercase italic tracking-tighter">
                   Check VIP Plans
                </button>
             </div>

             <button 
               onClick={handleLogout}
               className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black py-4 rounded-3xl transition-all flex items-center justify-center gap-3 border border-red-500/20 shadow-lg shadow-red-500/5 uppercase italic tracking-tighter"
             >
                <LogOut className="w-5 h-5" /> Logout Device
             </button>
          </div>
        </section>
      </div>
    </div>
  );
}
