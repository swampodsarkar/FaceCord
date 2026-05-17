import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { logout, db } from '../../firebase/config';
import { LogOut, UserPlus, Gamepad2, Mic, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ref, onValue } from 'firebase/database';
import { formatDistanceToNow } from 'date-fns';

interface DbUser {
  uid: string;
  displayName: string;
  photoURL: string;
  isOnline: boolean;
  lastSeen: number;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  vipTier?: string;
}

interface Room {
  id: string;
  name: string;
  createdAt: number;
}

export default function ChannelSidebar() {
  const { user, setActiveChannelId, setInVoiceChannel } = useAppStore();
  const [activeTab, setActiveTab] = useState<'squads' | 'friends'>('squads');
  const [onlineUsers, setOnlineUsers] = useState<DbUser[]>([]);
  const [activeRooms, setActiveRooms] = useState<Room[]>([]);

  useEffect(() => {
    // Fetch users
    const usersRef = ref(db, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.values(data) as DbUser[];
        setOnlineUsers(userList.filter(u => u.uid !== user?.uid).sort((a, b) => b.lastSeen - a.lastSeen));
      }
    });

    // Fetch active rooms for "Recent Parties"
    const roomsRef = ref(db, 'rooms');
    const unsubRooms = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const roomList = Object.keys(data)
          .map(key => ({
            id: key,
            name: data[key].name,
            createdAt: data[key].createdAt || Date.now()
          }))
          .filter(room => room.name) // Only show rooms with actual names
          .sort((a, b) => b.createdAt - a.createdAt);
        setActiveRooms(roomList);
      } else {
        setActiveRooms([]);
      }
    });

    return () => {
      unsubUsers();
      unsubRooms();
    };
  }, [user]);

  const joinRoom = (id: string) => {
    setActiveChannelId(id);
    setInVoiceChannel(true);
  };

  return (
    <div className="w-full bg-transparent h-full flex flex-col items-stretch shrink-0 select-none relative">
      <div className="p-4 border-b border-white/5 shrink-0 bg-[#0B0E14]/50">
        <div className="flex bg-[#06080A] rounded-xl p-1 border border-white/5">
           <button 
             onClick={() => setActiveTab('squads')}
             className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", activeTab === 'squads' ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200 cursor-pointer")}
           >
              SQUADS
           </button>
           <button 
             onClick={() => setActiveTab('friends')}
             className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", activeTab === 'friends' ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-400 hover:text-slate-200 cursor-pointer")}
           >
              NETWORK
           </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-2 custom-scrollbar mt-2">
        {activeTab === 'squads' ? (
          <>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-1.5"><Mic className="w-3.5 h-3.5 text-red-400" /> Active Parties</p>
              <div className="space-y-1">
                {activeRooms.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-2">No active parties found.</p>
                ) : (
                  activeRooms.map((room) => (
                    <button onClick={() => joinRoom(room.id)} key={room.id} className="w-full flex items-center gap-3 p-2 px-3 rounded-xl text-sm transition-all group cursor-pointer text-slate-400 hover:bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/5 group-hover:border-indigo-500/30 transition-colors shrink-0">
                        <Gamepad2 className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                      </div>
                      <div className="flex-1 text-left overflow-hidden">
                        <p className="font-medium text-slate-200 text-xs group-hover:text-white transition-colors truncate">{room.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">Started {room.createdAt ? formatDistanceToNow(room.createdAt, { addSuffix: true }) : 'recently'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">All Gamers ({onlineUsers.length})</p>
            <div className="space-y-2">
               {onlineUsers.length === 0 ? (
                 <p className="text-xs text-slate-500 italic p-2">No other gamers found.</p>
               ) : (
                 onlineUsers.map(u => (
                   <div key={u.uid} className={cn("flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group", !u.isOnline && "opacity-50")}>
                      <div className={cn("w-10 h-10 rounded-full border-2 p-0.5 relative shrink-0", u.isOnline ? "bg-blue-500 border-green-500" : "bg-slate-600 border-transparent")}>
                        <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">{(u.displayName || '?').charAt(0).toUpperCase()}</div>
                          )}
                        </div>
                        <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#151921]", u.isOnline ? "bg-green-500" : "bg-slate-500")}></div>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors truncate">{u.displayName}</p>
                        <p className="text-[10px] text-indigo-400 truncate">
                          {u.isOnline ? "Online" : `Last seen ${u.lastSeen ? formatDistanceToNow(u.lastSeen, { addSuffix: true }) : "recently"}`}
                        </p>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 shrink-0">
        <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-white/5">
           <p className="text-xs font-black uppercase tracking-tighter text-indigo-300">Get Party Nitro</p>
           <p className="text-[10px] text-slate-400 leading-tight mb-3 mt-1">Boost your party rooms with better audio & 1080p stream</p>
           <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
             <div className="w-[65%] h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
           </div>
           <p className="text-[9px] font-bold text-indigo-400 mt-2 tracking-widest uppercase">2/3 Boosts Active</p>
        </div>
      </div>

      {/* User Area */}
      <div className="mt-auto p-4 shrink-0 border-t border-white/5">
        {/* Live Gamer Card Stats */}
        <div className="mb-3 px-1 flex flex-col gap-2">
           <div className="flex justify-between items-end">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">XP Level</span>
             <span className="text-xs font-black text-indigo-400">LVL {user?.level || 0}</span>
           </div>
           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" style={{ width: `${Math.max(5, (user?.xp || 0) % 100)}%` }}></div>
           </div>

           <div className="flex justify-between items-end mt-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Energy</span>
             <span className="text-xs font-black text-yellow-500">100%</span>
           </div>
           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="w-[100%] h-full bg-yellow-500 shadow-[0_0_10px_#eab308]"></div>
           </div>
        </div>

        <div className="bg-[#0B0E14] p-3 rounded-2xl flex items-center gap-3 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          <div className="w-10 h-10 bg-indigo-500 rounded-xl relative overflow-hidden shrink-0 shadow-lg shadow-indigo-500/20 border border-white/10 z-10 p-0.5">
             <div className="w-full h-full rounded-lg overflow-hidden border border-white/10">
               {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                     {user?.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                  </div>
               )}
             </div>
             <div className={cn(
               "absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-[#0B0E14] rounded-full",
               user?.status === 'online' ? "bg-green-500" :
               user?.status === 'idle' ? "bg-amber-500" :
               user?.status === 'dnd' ? "bg-red-500" : "bg-slate-500"
             )}></div>
          </div>
          <div className="flex-1 overflow-hidden z-10 min-w-0">
            <p className="text-xs font-bold truncate text-white">{user?.displayName}</p>
            <p className="text-[10px] text-slate-500 truncate group-hover:text-indigo-400 transition-colors uppercase font-black tracking-widest">{user?.customStatus || "Custom Status"}</p>
          </div>
          <div className="flex gap-1 shrink-0 z-10">
             <button onClick={logout} title="Disconnect" className="p-1.5 bg-white/5 rounded-lg text-red-500/60 hover:text-white hover:bg-red-600 transition-all cursor-pointer">
                <LogOut className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
