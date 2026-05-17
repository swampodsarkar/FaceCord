import React, { useState, useEffect } from 'react';
import { Users, Gamepad2, Search, PlusCircle, Mic, X, Lock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../firebase/config';
import { ref, onValue, push, set, serverTimestamp } from 'firebase/database';

interface Party {
  id: string;
  name: string;
  game: string;
  mood?: string;
  participants: number;
  max: number;
  isLive: boolean;
  createdBy: string;
  isPrivate?: boolean;
  password?: string;
  color: string;
  bg: string;
  border: string;
}

export default function PartyDashboard() {
  const { setActiveChannelId, setInVoiceChannel, user } = useAppStore();
  const [parties, setParties] = useState<Party[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyGame, setNewPartyGame] = useState('Valorant');
  const [newPartyMood, setNewPartyMood] = useState('Chill');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordPromptRoom, setPasswordPromptRoom] = useState<Party | null>(null);
  const [joinPassword, setJoinPassword] = useState('');

  useEffect(() => {
    const roomsRef = ref(db, 'rooms');
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const partyList = Object.keys(data)
          .filter(key => data[key] && data[key].name) // Only include rooms with a real name
          .map(key => {
            const room = data[key];
            // Assign random colors based on game string or something similar
            const gameString = room.game || '';
            const isValorant = gameString.toLowerCase().includes('valorant');
            const isApex = gameString.toLowerCase().includes('apex');
            
            let color = 'text-indigo-400';
            let bg = 'bg-indigo-500/10';
            let border = 'border-indigo-500/20';

            if (isApex) {
              color = 'text-red-400';
              bg = 'bg-red-500/10';
              border = 'border-red-500/20';
            } else if (isValorant) {
              color = 'text-orange-400';
              bg = 'bg-orange-500/10';
              border = 'border-orange-500/20';
            }

            return {
              id: key,
              name: room.name,
              game: room.game || 'Just Chatting',
              mood: room.mood || 'Chill',
              participants: room.participants || 1,
              max: room.max || 5,
              isLive: room.isLive !== false,
              createdBy: room.createdBy || '',
              isPrivate: !!room.isPrivate,
              password: room.password || '',
              color,
              bg,
              border
            };
          });
        setParties(partyList);
      } else {
        setParties([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const joinParty = (party: Party) => {
    if (party.isPrivate && party.createdBy !== user?.uid) {
      setPasswordPromptRoom(party);
      return;
    }
    setActiveChannelId(party.id);
    setInVoiceChannel(true);
  };

  const handlePasswordJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordPromptRoom && joinPassword === passwordPromptRoom.password) {
      setActiveChannelId(passwordPromptRoom.id);
      setInVoiceChannel(true);
      setPasswordPromptRoom(null);
      setJoinPassword('');
    } else {
      alert("Incorrect password!");
    }
  };

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim() || !user) return;

    const myActiveRooms = parties.filter(p => p.createdBy === user.uid).length;
    const { vipTier, setActiveServerId } = useAppStore.getState();

    let maxRooms = 1;
    if (vipTier === 'basic') maxRooms = 5;
    if (vipTier === 'pro' || vipTier === 'clan') maxRooms = 999;

    if (myActiveRooms >= maxRooms) {
      alert(`You have reached your room limit (${maxRooms}). Please upgrade your VIP plan!`);
      setShowCreateModal(false);
      setActiveServerId('vip');
      return;
    }

    try {
      const roomRef = push(ref(db, 'rooms'));
      await set(roomRef, {
        name: newPartyName,
        game: newPartyGame,
        mood: newPartyMood,
        participants: 1,
        max: vipTier === 'clan' ? 100 : (vipTier === 'pro' ? 20 : 5),
        isLive: true,
        createdBy: user.uid,
        isPrivate,
        password: isPrivate ? password : '',
        createdAt: serverTimestamp()
      });
      
      setShowCreateModal(false);
      setNewPartyName('');
      setIsPrivate(false);
      setPassword('');
      setActiveChannelId(roomRef.key!);
      setInVoiceChannel(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 bg-[#151921] rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 rounded-2xl p-6 mb-8 relative overflow-hidden flex flex-col shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg mb-2">Nexus Party Hub</h1>
          <p className="text-indigo-100/80 font-medium text-sm max-w-md">Join live gaming sessions, meet new teammates, or start your own voice party instantly.</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-4 relative z-10">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-white text-indigo-900 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-100 transition-colors shadow-xl flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            Create Party
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 shrink-0">
        <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Parties
        </h2>
      </div>

      {parties.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
           <Gamepad2 className="w-12 h-12 mb-4 opacity-50" />
           <p className="text-sm font-bold tracking-widest uppercase">No Active Parties</p>
           <p className="text-xs mt-2">Why not create one and invite your squad?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
          {parties.map((party) => (
            <div key={party.id} className="bg-[#0B0E14] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 transition-colors group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md inline-block ${party.bg} ${party.color} border ${party.border}`}>
                      {party.game}
                    </span>
                    {party.mood && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md inline-block bg-white/5 text-slate-400 border border-white/10">
                        {party.mood}
                      </span>
                    )}
                    {party.isPrivate && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md inline-block bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Private
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg leading-tight group-hover:text-indigo-400 transition-colors truncate">{party.name}</h3>
                </div>
                {party.isLive && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-full p-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)] shrink-0">
                    <Mic className="w-4 h-4 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-6 mt-2">
                <div className="flex -space-x-2">
                   <div className="w-6 h-6 rounded-full border-2 border-[#0B0E14] bg-indigo-500"></div>
                   <div className="w-6 h-6 rounded-full border-2 border-[#0B0E14] bg-emerald-500"></div>
                </div>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 ml-2">
                  <Users className="w-3.5 h-3.5" />
                  {party.participants} / {party.max}
                </span>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex gap-2">
                <button onClick={() => joinParty(party)} className="flex-1 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 font-bold py-2 rounded-xl transition-all cursor-pointer text-sm">
                  {party.isPrivate ? 'Enter Password' : 'Join Lobby'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Party Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151921] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
             <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer transition-colors">
               <X className="w-5 h-5" />
             </button>
             <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-6">Create Party</h3>
             
             <form onSubmit={handleCreateParty} className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Party Name</label>
                  <input 
                    type="text" 
                    value={newPartyName}
                    onChange={e => setNewPartyName(e.target.value)}
                    required
                    maxLength={30}
                    placeholder="e.g. Late Night Comp"
                    className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm"
                  />
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Game</label>
                    <select 
                      value={newPartyGame}
                      onChange={e => setNewPartyGame(e.target.value)}
                      className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm appearance-none"
                    >
                      <option value="Just Chatting">Just Chatting</option>
                      <option value="Valorant">Valorant</option>
                      <option value="Apex Legends">Apex</option>
                      <option value="Minecraft">Minecraft</option>
                      <option value="League of Legends">LoL</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Mood</label>
                    <select 
                      value={newPartyMood}
                      onChange={e => setNewPartyMood(e.target.value)}
                      className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm appearance-none"
                    >
                      <option value="Chill">Chill Vibes</option>
                      <option value="Rank Push">Rank Push</option>
                      <option value="Rage Room">Rage Room</option>
                      <option value="Funny Mic">Funny Mic</option>
                    </select>
                 </div>
               </div>

               <div className="flex items-center gap-3 bg-[#06080A] p-4 rounded-xl border border-white/5">
                 <input 
                   type="checkbox" 
                   id="isPrivate"
                   checked={isPrivate}
                   onChange={e => setIsPrivate(e.target.checked)}
                   className="w-4 h-4 accent-indigo-500"
                 />
                 <label htmlFor="isPrivate" className="text-sm font-bold text-slate-300 cursor-pointer">Private Party (Password Required)</label>
               </div>

               {isPrivate && (
                 <div className="animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Set Room Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required={isPrivate}
                      placeholder="Enter password..."
                      className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm"
                    />
                 </div>
               )}

               <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl active:scale-95 transition-all text-sm mt-4 shadow-lg shadow-indigo-600/20 cursor-pointer">
                  Start Voice Party
               </button>
             </form>
          </div>
        </div>
      )}
      {/* Join Password Modal */}
      {passwordPromptRoom && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151921] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
             <button onClick={() => setPasswordPromptRoom(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer transition-colors">
               <X className="w-5 h-5" />
             </button>
             <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">Private Party</h3>
             <p className="text-xs text-slate-400 mb-6 font-bold uppercase tracking-widest">Enter password to join {passwordPromptRoom.name}</p>
             
             <form onSubmit={handlePasswordJoin} className="space-y-4">
                <input 
                  type="password" 
                  autoFocus
                  value={joinPassword}
                  onChange={e => setJoinPassword(e.target.value)}
                  required
                  placeholder="Enter password..."
                  className="w-full bg-[#06080A] text-white border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500/50 transition-colors text-sm"
                />
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl active:scale-95 transition-all text-sm mt-4 shadow-lg shadow-indigo-600/20 cursor-pointer">
                  Join Party
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
