import { useState } from 'react';
import { Bot, Sparkles, X, Send, Music, Shield, Info, Lock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function AIBuddy() {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const { vipTier, setActiveServerId } = useAppStore();

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all animate-bounce hover:animate-none group border-2 border-white/10"
      >
        <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-[#151921] animate-pulse"></span>
      </button>
    );
  }

  const isVip = vipTier === 'pro' || vipTier === 'clan';

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-[#0B0E14] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">AI DJ Huzur <Sparkles className="w-3 h-3 text-yellow-400" /></h3>
            <p className="text-[10px] text-indigo-400 font-medium">Your Gaming Assistant</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 h-64 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 relative">
         {!isVip && (
            <div className="absolute inset-0 z-10 backdrop-blur-sm bg-[#0B0E14]/50 flex flex-col items-center justify-center p-6 text-center">
               <Lock className="w-10 h-10 text-amber-400 mb-3" />
               <h3 className="text-white font-bold mb-2 uppercase tracking-wide">VIP Exclusive</h3>
               <p className="text-xs text-slate-400 mb-4">Upgrade to Pro or Clan VIP to unlock the AI Gaming Assistant.</p>
               <button 
                  onClick={() => {
                     setIsOpen(false);
                     setActiveServerId('vip');
                  }}
                  className="bg-amber-400 text-black font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-xl"
               >
                  Upgrade Now
               </button>
            </div>
         )}
        <div className="bg-white/5 rounded-xl rounded-tl-sm p-3 text-sm text-slate-200 border border-white/5 max-w-[85%]">
           Yo! Ready to rank push? I can play some hype music, moderate your lobby, or give you game tips! 🎮🔥
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-xs py-1.5 px-3 rounded-full transition-colors flex items-center gap-1.5">
            <Music className="w-3 h-3" /> Play Hype Mix
          </button>
          <button className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs py-1.5 px-3 rounded-full transition-colors flex items-center gap-1.5">
            <Shield className="w-3 h-3" /> Mod Room
          </button>
          <button className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs py-1.5 px-3 rounded-full transition-colors flex items-center gap-1.5">
            <Info className="w-3 h-3" /> Check Stats
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-white/5 bg-[#06080A]">
        <div className="relative">
          <input 
            type="text" 
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Ask AI Huzur..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-300">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
