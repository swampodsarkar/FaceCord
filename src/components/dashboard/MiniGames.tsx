import { useState } from 'react';
import { Target, Dice1, Zap, BrainCircuit } from 'lucide-react';
import ReactionGame from './games/ReactionGame';
import DiceGame from './games/DiceGame';
import SpinWheel from './games/SpinWheel';
import QuickQuiz from './games/QuickQuiz';

export default function MiniGames() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const games = [
    { id: 'reaction', title: "1v1 Shooter", icon: Target, players: "0", status: "Live", bg: "from-red-600 to-orange-600" },
    { id: 'dice', title: "Party Ludo", icon: Dice1, players: "0", status: "Popular", bg: "from-amber-500 to-yellow-600" },
    { id: 'spin', title: "Spin Wheel", icon: Zap, players: "0", status: "Casual", bg: "from-indigo-600 to-purple-600" },
    { id: 'quiz', title: "Quick Quiz", icon: BrainCircuit, players: "0", status: "Event", bg: "from-emerald-500 to-teal-600" },
  ];

  if (activeGame === 'reaction') return <ReactionGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'dice') return <DiceGame onBack={() => setActiveGame(null)} />;
  if (activeGame === 'spin') return <SpinWheel onBack={() => setActiveGame(null)} />;
  if (activeGame === 'quiz') return <QuickQuiz onBack={() => setActiveGame(null)} />;

  return (
    <div className="flex-1 bg-[#151921] rounded-3xl border border-white/5 p-6 md:p-8 flex flex-col h-full overflow-y-auto custom-scrollbar relative">
      <div className="w-full bg-gradient-to-br from-yellow-500/80 to-amber-600/80 rounded-2xl p-6 mb-8 relative overflow-hidden flex flex-col shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg mb-2">Mini Games</h1>
          <p className="text-yellow-100/90 font-medium text-sm max-w-md">Take a break from ranked. Play fun casual games inside your voice party!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {games.map((game, i) => (
          <div key={i} className="bg-[#0B0E14] border border-white/5 rounded-2xl p-1 hover:-translate-y-1 transition-transform duration-300 group cursor-pointer" onClick={() => setActiveGame(game.id)}>
             <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${game.bg} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-xl -translate-y-1/2 translate-x-1/2"></div>
                <game.icon className="w-16 h-16 text-white/90 drop-shadow-lg mb-4 transform group-hover:scale-110 transition-transform" />
                <h3 className="text-white font-black uppercase tracking-wider text-center">{game.title}</h3>
                <span className="mt-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">{game.status}</span>
             </div>
             <div className="p-4">
               <div className="flex justify-between items-center text-xs">
                 <span className="text-slate-400 font-bold uppercase tracking-widest">Active Players</span>
                 <span className="text-white font-black">{game.players}</span>
               </div>
               <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors cursor-pointer">
                 Play Now
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
