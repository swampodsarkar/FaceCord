import { useState, useEffect } from 'react';
import { Crosshair, Search, Shield, Zap, Flame, Users } from 'lucide-react';
import { db } from '../../firebase/config';
import { ref, onValue } from 'firebase/database';
import { useAppStore } from '../../store/useAppStore';

interface DbUser {
  uid: string;
  displayName: string;
  photoURL: string;
  isOnline: boolean;
}

export default function Matchmaking() {
  const { user } = useAppStore();
  const [game, setGame] = useState('Valorant');
  const [players, setPlayers] = useState<DbUser[]>([]);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsub = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.values(data) as DbUser[];
        // Only show other online users for matchmaking
        setPlayers(userList.filter(u => u.uid !== user?.uid && u.isOnline));
      } else {
        setPlayers([]);
      }
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="flex-1 bg-[#151921] rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
      <div className="w-full bg-gradient-to-br from-red-600/80 to-orange-600/80 rounded-2xl p-6 mb-8 relative overflow-hidden flex flex-col shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg mb-2">AI Matchmaking</h1>
          <p className="text-red-100/80 font-medium text-sm max-w-md">Find the perfect squad based on your playstyle, rank, and live mood.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        {['Valorant', 'PUBG Mobile', 'Free Fire', 'Apex Legends'].map(g => (
          <button 
            key={g} 
            onClick={() => setGame(g)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${game === g ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 cursor-pointer'}`}
          >
            {g}
          </button>
        ))}
      </div>

      {players.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
           <Search className="w-12 h-12 mb-4 opacity-50" />
           <p className="text-sm font-bold tracking-widest uppercase">No players found</p>
           <p className="text-xs mt-2">Waiting for other gamers to come online...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {players.map((player) => (
            <div key={player.uid} className="bg-[#0B0E14] border border-white/5 rounded-2xl p-5 hover:border-red-500/30 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-12 h-12 rounded-full border-2 border-red-500 bg-slate-800 flex items-center justify-center font-black text-white overflow-hidden relative">
                   {player.photoURL ? (
                     <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" />
                   ) : (
                     (player.displayName || '?').charAt(0).toUpperCase()
                   )}
                   <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#151921] rounded-full"></div>
                 </div>
                 <div className="flex-1">
                   <h3 className="text-white font-bold text-lg">{player.displayName}</h3>
                   <div className="flex gap-2 text-[10px] uppercase tracking-widest font-bold mt-1">
                     <span className="text-red-400">Unranked</span>
                     <span className="text-slate-500">•</span>
                     <span className="text-orange-400">Flex</span>
                   </div>
                 </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                 <span className="bg-white/5 px-2 py-1 rounded text-xs text-slate-300 flex items-center gap-1"><Flame className="w-3 h-3 text-red-500" /> Chill</span>
                 <span className="bg-white/5 px-2 py-1 rounded text-xs text-slate-300 flex items-center gap-1"><Zap className="w-3 h-3 text-indigo-400" /> Mic On</span>
              </div>

              <button className="w-full py-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer">
                <Shield className="w-4 h-4" /> Send Squad Invite
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
