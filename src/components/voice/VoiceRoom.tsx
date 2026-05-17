import { useState, useEffect } from 'react';
import { Mic, MicOff, PhoneOff, VolumeX, Volume2, User, Shield, EllipsisVertical, Volume1, Trash2, Ban, Monitor } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { db } from '../../firebase/config';
import { ref, get, remove } from 'firebase/database';
import {
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useRemoteUsers,
  useRemoteAudioTracks,
} from "agora-rtc-react";
import { AGORA_APP_ID } from "../../agora/config";
import { cn } from "../../lib/utils";

export default function VoiceRoom() {
  const { activeChannelId, setInVoiceChannel, user } = useAppStore();
  const [micOn, setMicOn] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<any>(null);

  // Check if current user is the host
  useEffect(() => {
    if (activeChannelId) {
      const roomRef = ref(db, `rooms/${activeChannelId}`);
      get(roomRef).then(snap => {
        if (snap.exists() && snap.val().createdBy === user?.uid) {
          setIsHost(true);
        }
      });
    }
  }, [activeChannelId, user]);
  useJoin({ appid: AGORA_APP_ID, channel: activeChannelId || 'lobby', token: null }, true);

  // Local track
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  
  // Publish local track if mic is on
  usePublish([localMicrophoneTrack, screenTrack]);

  // Remote users
  const remoteUsers = useRemoteUsers();
  const { audioTracks } = useRemoteAudioTracks(remoteUsers);

  // Automatically play remote audio when speaker is on
  audioTracks.forEach((track) => {
    if (speakerOn) {
      track.play();
    } else {
      track.stop();
    }
  });

  // Room persistence is now handled by the host's explicit choice
  useEffect(() => {
    // No longer deleting on unmount to allow persistence
  }, [activeChannelId, user]);

  // Screen Share (480p)
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const track = await import('agora-rtc-react').then(({ createScreenVideoTrack }) =>
          createScreenVideoTrack({
            encoderConfig: '480p_1', // 480p
          })
        );
        setScreenTrack(track);
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen share failed', err);
        alert('Screen sharing not supported or permission denied');
      }
    } else {
      if (screenTrack) {
        screenTrack.stop();
        screenTrack.close();
      }
      setScreenTrack(null);
      setIsScreenSharing(false);
    }
  };

  return (
    <div className="h-full bg-[#06080A] flex flex-col relative overflow-hidden p-6 gap-6 rounded-3xl">
      {/* Background RGB/Party Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/10 rounded-full filter blur-[100px] animate-pulse pointer-events-none [animation-delay:2000ms]"></div>
      
      {/* 3D Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shrink-0">
        <div>
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">{activeChannelId}</h1>
          <p className="text-xs text-indigo-400 font-mono flex items-center gap-2">
            AGORA_RTC_CONNECTED
            <span className={cn("px-1.5 py-0.5 rounded text-[10px] uppercase font-bold", useAppStore.getState().vipTier === 'free' ? "bg-slate-800 text-slate-400" : "bg-amber-400/20 text-amber-400 border border-amber-400/30")}>
              {useAppStore.getState().vipTier === 'free' ? 'NORMAL Q' : 'HD VOICE'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all text-slate-400 hover:text-white border border-white/5"
            >
              Voice Settings
            </button>
            <button 
              onClick={toggleScreenShare}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isScreenSharing 
                  ? 'bg-red-500/90 text-white' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              {isScreenSharing ? 'Stop Share' : 'Share Screen (480p)'}
            </button>
          <button 
            onClick={() => {
               navigator.clipboard.writeText(`${window.location.origin}/join/${activeChannelId}`);
               alert("Invite link copied to clipboard!");
            }}
            className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors text-white cursor-pointer hover:scale-105 active:scale-95 duration-200"
          >
            Invite Squad
          </button>
        </div>
      </div>

      {/* Voice Settings Overlay */}
      {showSettings && (
        <div className="absolute top-24 right-6 w-64 bg-[#151921]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 z-50 shadow-2xl animate-in fade-in slide-in-from-top-4">
           <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 border-l-2 border-indigo-500 pl-2">Voice Config</p>
           <div className="space-y-4">
              <div>
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Input Sensitivity</span>
                    <span className="text-[10px] font-mono text-indigo-400">{sensitivity}%</span>
                 </div>
                 <input 
                   type="range" 
                   value={sensitivity} 
                   onChange={e => setSensitivity(parseInt(e.target.value))}
                   className="w-full h-1 bg-white/10 rounded-full accent-indigo-500 outline-none" 
                 />
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Noise Suppression</span>
                 <button 
                   onClick={() => setNoiseSuppression(!noiseSuppression)}
                   className={cn("w-8 h-4 rounded-full transition-colors relative", noiseSuppression ? "bg-indigo-500" : "bg-slate-700")}
                 >
                    <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all", noiseSuppression ? "right-0.5" : "left-0.5")}></div>
                 </button>
              </div>
              <p className="text-[9px] text-slate-500 italic mt-2">Adjusting Agora RTC pipeline values...</p>
           </div>
        </div>
      )}

      {/* Participant Grid */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 grid-rows-2 gap-4 overflow-y-auto content-start z-10 w-full mb-2">
        {/* Local User */}
        <div className="relative flex flex-col items-center justify-center gap-3 group">
          <div className="relative">
            {/* Visualizer Rings */}
            {micOn && (
              <>
                <div className="absolute inset-0 rounded-full border border-indigo-500/50 scale-[1.15] animate-ping opacity-50 pointer-events-none bg-indigo-500/10"></div>
                <div className="absolute inset-0 rounded-full border border-pink-500/30 scale-[1.3] animate-ping [animation-delay:500ms] opacity-30 pointer-events-none bg-pink-500/5"></div>
              </>
            )}
            
            <div className={cn(
               "w-28 h-28 rounded-full border-[3px] p-1 transition-all duration-300 relative z-10", 
               micOn ? "border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.6)]" : "border-slate-800",
               useAppStore.getState().vipTier !== 'free' ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse' : 'bg-[#151921]'
            )}>
              <div className="w-full h-full rounded-full bg-slate-700 overflow-hidden relative border-2 border-[#151921]">
                 <img src={user?.photoURL || ''} alt="me" className="w-full h-full object-cover" />
                 {!micOn && (
                   <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-[2px]">
                      <MicOff className="w-8 h-8 text-rose-500" />
                   </div>
                 )}
              </div>
            </div>
            
            {/* RGB Energy Core Indicator & VIP Badge */}
            <div className="absolute -top-2 right-2 z-20">
              {useAppStore.getState().vipTier !== 'free' && (
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black uppercase text-black shadow-lg",
                  useAppStore.getState().vipTier === 'basic' && "bg-blue-400",
                  useAppStore.getState().vipTier === 'pro' && "bg-pink-500",
                  useAppStore.getState().vipTier === 'clan' && "bg-amber-400"
                )}>
                  VIP
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 right-2 w-6 h-6 bg-[#0B0E14] rounded-full flex items-center justify-center z-20 border-2 border-[#151921]">
               <div className={cn("w-3 h-3 rounded-full", micOn ? "bg-green-500 shadow-[0_0_10px_#22c55e]" : "bg-slate-600")}></div>
            </div>
          </div>
          
          <div className="text-center z-10">
            <p className={cn("text-sm font-black tracking-widest uppercase transition-colors", micOn ? "text-white" : "text-slate-500")}>
              {user?.displayName}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <span className={cn(
                "text-[9px] font-black bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest",
                isHost ? "text-indigo-400" : "text-slate-500"
              )}>
                {isHost ? 'Owner' : 'Participant'}
              </span>
              {isHost && <Shield className="w-2.5 h-2.5 text-indigo-400" />}
            </div>
          </div>
        </div>

        {/* Remote Users */}
        {remoteUsers.map((remoteUser) => (
          <div key={remoteUser.uid} className={cn("flex flex-col items-center justify-center gap-3 transition-all", !remoteUser.hasAudio && "opacity-60 grayscale-[50%]")}>
            <div className="relative">
               {/* Remote Visualizer Rings */}
               {remoteUser.hasAudio && (
                  <div className="absolute inset-0 rounded-full border border-emerald-500/50 scale-[1.15] animate-ping opacity-50 pointer-events-none bg-emerald-500/10"></div>
               )}
               
               <div className={cn(
                 "w-28 h-28 rounded-full border-[3px] p-1 transition-all duration-300 bg-[#151921] relative z-10",
                 remoteUser.hasAudio ? "border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)]" : "border-slate-800"
               )}>
                 <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white relative overflow-hidden">
                   <User className="w-10 h-10 text-slate-600" />
                   {!remoteUser.hasAudio && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-[2px]">
                       <MicOff className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                 </div>
               </div>

               <div className="absolute bottom-0 right-2 w-6 h-6 bg-[#0B0E14] rounded-full flex items-center justify-center z-20 border-2 border-[#151921]">
                 <div className={cn("w-3 h-3 rounded-full", remoteUser.hasAudio ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-slate-600")}></div>
               </div>
            </div>
            
            <div className="text-center z-10 w-full relative">
              <p className={cn("text-sm font-black uppercase tracking-widest truncate max-w-[120px] px-2 mx-auto", remoteUser.hasAudio ? "text-emerald-300" : "text-slate-400")}>
                User {remoteUser.uid.toString().substring(0,4)}
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-1">
                 <span className="text-[9px] text-slate-500 font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-widest">Guest</span>
                 {isHost && (
                   <div className="group/mod relative inline-block">
                      <EllipsisVertical className="w-3 h-3 text-slate-600 hover:text-white cursor-pointer" />
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black border border-white/10 rounded-xl p-1 hidden group-hover/mod:flex flex-col gap-1 z-50 min-w-[100px] shadow-2xl">
                         <button className="flex items-center gap-2 p-1.5 text-[9px] font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg">
                            <Volume1 className="w-3 h-3" /> Mute User
                         </button>
                         <button className="flex items-center gap-2 p-1.5 text-[9px] font-bold text-red-400 hover:text-white hover:bg-red-500 rounded-lg">
                            <Ban className="w-3 h-3" /> Kick
                         </button>
                      </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-4 py-2 shrink-0 z-10 flex-wrap">
        {useAppStore.getState().vipTier !== 'free' && (
          <select className="bg-[#151921] border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer hidden sm:block">
            <option value="none">Voice: Normal</option>
            <option value="robot">Effect: Robot</option>
            <option value="echo">Effect: Echo</option>
            <option value="deep">Effect: Deep Voice</option>
            <option value="funny">Effect: Funny</option>
          </select>
        )}
        <button 
          onClick={() => setSpeakerOn(!speakerOn)}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer text-slate-300 hover:text-white"
        >
          {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
        </button>
        
        <button 
          onClick={async () => {
             if (activeChannelId && user) {
                const roomRef = ref(db, `rooms/${activeChannelId}`);
                const snapshot = await get(roomRef);
                if (snapshot.exists()) {
                   const roomData = snapshot.val();
                   // If host leaves, we can prompt or just let the room stay
                   // For now, let's allow host to OPTIONALLY delete or just leave
                   if (roomData.createdBy === user.uid) {
                      const shouldDelete = window.confirm("You are the host. Do you want to delete this room for everyone?");
                      if (shouldDelete) {
                         await remove(roomRef);
                      }
                   }
                }
             }
             setInVoiceChannel(false);
          }}
          className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-xl shadow-red-600/40 hover:bg-red-500 transition-colors cursor-pointer text-white hover:scale-110 active:scale-95 duration-200"
        >
          <PhoneOff className="w-6 h-6 rotate-[135deg]" />
        </button>

        <button 
          onClick={() => setMicOn(!micOn)}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
        >
          {micOn ? <Mic className="w-5 h-5 text-indigo-400" /> : <MicOff className="w-5 h-5 text-red-400" />}
        </button>
      </div>
    </div>
  );
}
