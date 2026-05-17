import { useState } from 'react';
import { ArrowLeft, Dices, Users } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { db } from '../../../firebase/config';
import { ref, onValue, set } from 'firebase/database';
import { useEffect } from 'react';

export default function DiceGame({ onBack }: { onBack: () => void }) {
  const { user, activeChannelId } = useAppStore();
  const [isRolling, setIsRolling] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);

  useEffect(() => {
    if (!activeChannelId) return;
    
    // In a real implementation this would sync with a specific minigame ref
    // For now we'll mock multi-player sync locally
    setPlayers([
      { id: user?.uid, name: user?.displayName || 'Me', score: 0, lastRoll: null, color: 'bg-indigo-500' },
      { id: 'cpu', name: 'Bot', score: 0, lastRoll: null, color: 'bg-amber-500' }
    ]);
  }, [user, activeChannelId]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    let rolls = 0;
    const rollInterval = setInterval(() => {
      const newPlayers = [...players];
      newPlayers[currentTurn].lastRoll = Math.floor(Math.random() * 6) + 1;
      setPlayers([...newPlayers]);
      rolls++;

      if (rolls > 10) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        newPlayers[currentTurn].lastRoll = finalRoll;
        newPlayers[currentTurn].score += finalRoll;
        setPlayers([...newPlayers]);
        setIsRolling(false);
        
        if (newPlayers[currentTurn].score >= 30) {
          // Win condition - do nothing, win UI shows
        } else {
           setTimeout(() => {
             setCurrentTurn((prev) => (prev + 1) % newPlayers.length);
           }, 1000);
        }
      }
    }, 100);
  };

  // Bot Turn
  useEffect(() => {
    const hasWinner = players.some(p => p.score >= 30);
    if (!hasWinner && players.length > 0 && players[currentTurn]?.id === 'cpu' && !isRolling) {
      setTimeout(rollDice, 1500);
    }
  }, [currentTurn, players, isRolling]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151921] rounded-3xl relative overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0 z-10 bg-[#0B0E14]">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center gap-2 text-white">
           <Dices className="w-5 h-5 text-amber-500" />
           <span className="font-bold text-sm uppercase tracking-widest">Race to 30</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-6 items-center justify-center relative bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-repeat shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#151921]/50 to-[#151921] pointer-events-none"></div>

        <div className="w-full max-w-lg z-10 grid grid-cols-2 gap-8 mb-12">
           {players.map((p, i) => (
             <div key={p.id} className={`bg-[#0B0E14] border-2 rounded-2xl p-6 flex flex-col items-center transition-transform ${currentTurn === i ? 'border-white scale-105 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'border-white/5 scale-100 opacity-60'}`}>
                <div className={`w-16 h-16 rounded-full ${p.color} flex items-center justify-center font-black text-2xl text-white mb-4 border-4 border-[#0B0E14]`}>
                  {(p.name || '?').charAt(0)}
                </div>
                <h3 className="text-white font-bold mb-1 truncate w-full text-center">{p.name}</h3>
                <div className="text-3xl font-black text-white bg-white/5 w-full text-center py-2 rounded-xl border border-white/5 mb-4">
                  {p.score}
                </div>
                {p.lastRoll && (
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    Rolled <span className={`text-white text-lg w-6 h-6 flex items-center justify-center rounded bg-white/10`}>{p.lastRoll}</span>
                  </div>
                )}
             </div>
           ))}
        </div>

        <div className="z-10 flex flex-col items-center">
            {players.some(p => p.score >= 30) ? (
               <div className="text-center">
                 <h2 className="text-4xl font-black uppercase text-amber-500 mb-2 drop-shadow-lg">
                   {players.find(p => p.score >= 30)?.name} Wins!
                 </h2>
                 <button 
                   onClick={() => {
                     setPlayers(players.map(p => ({...p, score: 0, lastRoll: null})));
                     setCurrentTurn(0);
                   }}
                   className="mt-6 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 active:scale-95"
                 >
                   Play Again
                 </button>
               </div>
            ) : (
                <button 
                  onClick={rollDice}
                  disabled={isRolling || players[currentTurn]?.id === 'cpu'}
                  className="bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/30 disabled:text-black/30 text-black font-black uppercase tracking-widest px-12 py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.4)] disabled:shadow-none hover:-translate-y-1 active:translate-y-0 disabled:transform-none flex items-center gap-3 text-lg"
                >
                  <Dices className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
                  {isRolling ? 'Rolling...' : (players[currentTurn]?.id === 'cpu' ? 'Bot thinking...' : 'Roll Dice')}
                </button>
            )}
        </div>
      </div>
    </div>
  );
}
