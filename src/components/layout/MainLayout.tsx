import { useState } from 'react';
import Sidebar from './Sidebar';
import ChannelSidebar from './ChannelSidebar';
import ChatArea from '../chat/ChatArea';
import VoiceRoom from '../voice/VoiceRoom';
import PartyDashboard from '../dashboard/PartyDashboard';
import Matchmaking from '../dashboard/Matchmaking';
import ClipsFeed from '../dashboard/ClipsFeed';
import MiniGames from '../dashboard/MiniGames';
import VIPUpgrade from '../dashboard/VIPUpgrade';
import Profile from '../dashboard/Profile';
import AIBuddy from '../chat/AIBuddy';
import AdminPanel from '../dashboard/AdminPanel';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import { Menu, X, Rocket } from 'lucide-react';

export default function MainLayout() {
  const { inVoiceChannel, activeServerId, setActiveServerId, user, vipTier, isAdmin } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [mobileVoiceTab, setMobileVoiceTab] = useState<'voice' | 'chat'>('voice');

  const renderContent = () => {
    switch (activeServerId) {
      case 'home':
        return <PartyDashboard />;
      case 'matchmaking':
        return <Matchmaking />;
      case 'profile':
        return <Profile />;
      case 'feed':
        return <ClipsFeed />;
      case 'minigames':
        return <MiniGames />;
      case 'vip':
        return <VIPUpgrade />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <PartyDashboard />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#050608] text-slate-100 overflow-hidden font-sans p-2 md:p-4 gap-4 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050608] to-[#050608]">
      {/* Top Header Navigation */}
      <header className="h-16 shrink-0 bg-[#0B0E14]/80 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-between px-4 md:px-6 shadow-xl shadow-black/50 z-20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer" onClick={() => setActiveServerId('home')}>
               <Rocket className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 tracking-wider text-xl uppercase italic">
              Nexus<span className="text-white">HUD</span>
            </div>
         </div>

         {/* Desktop Nav */}
         <div className="hidden lg:flex flex-1 justify-center px-8">
            <Sidebar />
         </div>

         <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
               <span className="text-sm font-bold text-white truncate max-w-[120px]">{user?.displayName || 'GhostHunter'}</span>
               <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest px-1.5 rounded bg-amber-400/10 border border-amber-400/20">{vipTier !== 'free' ? `${vipTier} VIP` : 'Free Tier'}</span>
            </div>
            <div 
              onClick={() => setActiveServerId('profile')}
              className="w-10 h-10 bg-slate-800 rounded-xl border-2 border-indigo-500/30 overflow-hidden shrink-0 cursor-pointer hover:border-indigo-400 transition-colors shadow-lg shadow-indigo-500/10"
            >
              <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="avatar" className="w-full h-full object-cover" />
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-indigo-400 hover:text-white transition-colors cursor-pointer p-2 rounded-md bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
         </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-4 z-50 bg-[#0B0E14]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl p-4 md:p-6 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
           <div className="flex items-center justify-between">
              <span className="text-xl font-black italic uppercase tracking-tighter text-indigo-400">Main Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
           </div>

           <div onClick={() => setMobileMenuOpen(false)} className="shrink-0 flex flex-col gap-2 overflow-y-auto max-h-[40vh] custom-scrollbar">
              <Sidebar />
           </div>
           
           <div className="flex-1 bg-[#151921] rounded-3xl border border-white/5 overflow-hidden flex flex-col min-h-0">
              <ChannelSidebar />
           </div>
        </div>
      )}

      {/* Main Content Area Grid */}
      <main className="flex-1 flex gap-4 min-h-0 relative z-10 w-full max-w-[1600px] mx-auto overflow-hidden">
        
        {/* If in voice channel */}
        {inVoiceChannel ? (
          <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 h-full min-h-0">
             {/* Toggle on mobile */}
             <div className="lg:hidden bg-[#0B0E14] p-1 rounded-2xl border border-white/5 flex">
                <button 
                  onClick={() => setMobileVoiceTab('voice')}
                  className={cn("flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all", mobileVoiceTab === 'voice' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 font-bold")}
                >
                  Voice Phase
                </button>
                <button 
                  onClick={() => setMobileVoiceTab('chat')}
                  className={cn("flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all", mobileVoiceTab === 'chat' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 font-bold")}
                >
                  Live Chat
                </button>
             </div>

             {/* Dynamic Center Stage */}
             <div className={cn("lg:col-span-8 flex-col gap-4 h-full min-h-0", mobileVoiceTab === 'voice' ? "flex" : "hidden lg:flex")}>
                <div className="flex-1 bg-[#090C10]/80 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl shadow-indigo-500/5">
                   <VoiceRoom />
                </div>
             </div>
             {/* Chat Side Panel */}
             <div className={cn("lg:col-span-4 h-full min-h-0 bg-[#090C10]/80 backdrop-blur-md rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl", mobileVoiceTab === 'chat' ? "flex" : "hidden lg:flex")}>
                <ChatArea />
             </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-0">
             {/* Left Panel (Rooms/Friends) */}
             <div className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col bg-[#090C10]/80 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden h-full shadow-2xl shadow-black/40 relative">
                <ChannelSidebar />
             </div>

             {/* Right Panel (Active Module) */}
             <div className="md:col-span-8 lg:col-span-9 flex-1 bg-[#090C10]/80 backdrop-blur-xl rounded-3xl border border-white/5 overflow-hidden flex flex-col h-full shadow-2xl shadow-black/40 relative">
               {renderContent()}
             </div>
          </div>
        )}
      </main>

      <AIBuddy />
    </div>
  );
}
