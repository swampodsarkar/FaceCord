import { useState, useEffect, useRef } from 'react';
import { Target, ArrowLeft, Trophy } from 'lucide-react';

export default function ReactionGame({ onBack }: { onBack: () => void }) {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'clicked' | 'tooEarly'>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    setGameState('waiting');
    setReactionTime(null);
    clearTimeout(timeoutRef.current!);
    
    const randomDelay = Math.floor(Math.random() * 3000) + 2000; // 2s to 5s
    timeoutRef.current = setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
    }, randomDelay);
  };

  const handleClick = () => {
    if (gameState === 'waiting') {
      clearTimeout(timeoutRef.current!);
      setGameState('tooEarly');
    } else if (gameState === 'ready') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setGameState('clicked');
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
    } else {
      startGame();
    }
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current!);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151921] rounded-3xl relative">
      <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0 z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-yellow-500">
           <Trophy className="w-4 h-4" />
           <span className="font-bold text-sm">Best: {bestTime ? `${bestTime}ms` : '--'}</span>
        </div>
      </div>
      
      <div 
        className={`flex-1 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 select-none ${
          gameState === 'waiting' ? 'bg-red-500/20 hover:bg-red-500/30' :
          gameState === 'ready' ? 'bg-green-500 hover:bg-green-400' :
          gameState === 'tooEarly' ? 'bg-orange-500/20 hover:bg-orange-500/30' :
          'bg-indigo-500/20 hover:bg-indigo-500/30'
        }`}
        onMouseDown={handleClick}
      >
        {gameState === 'waiting' && (
          <div className="text-center">
             <Target className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-50 block" />
             <h2 className="text-4xl font-black uppercase text-red-500 mb-2">Wait for Green</h2>
             <p className="text-slate-400">Click as soon as the background turns green.</p>
          </div>
        )}

        {gameState === 'ready' && (
          <div className="text-center">
             <h2 className="text-6xl font-black uppercase text-white drop-shadow-lg mb-2">Fire!</h2>
             <p className="text-white/80 font-bold">CLICK NOW!</p>
          </div>
        )}

        {gameState === 'clicked' && (
          <div className="text-center">
             <h2 className="text-5xl font-black uppercase text-indigo-400 mb-2">{reactionTime} ms</h2>
             <p className="text-slate-400 font-bold mb-8">Not bad, but can you do better?</p>
             <p className="text-slate-500 text-sm">Click anywhere to try again</p>
          </div>
        )}

        {gameState === 'tooEarly' && (
           <div className="text-center">
             <h2 className="text-4xl font-black uppercase text-orange-500 mb-2">Too Early!</h2>
             <p className="text-slate-400 font-bold mb-8">You triggered a false start.</p>
             <p className="text-slate-500 text-sm">Click anywhere to try again</p>
          </div>
        )}

        {}
      </div>
    </div>
  );
}
