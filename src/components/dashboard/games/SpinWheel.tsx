import { useState, useRef } from 'react';
import { ArrowLeft, Zap } from 'lucide-react';

export default function SpinWheel({ onBack }: { onBack: () => void }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const currentRotation = useRef(0);

  const options = [
    "Sing a Song",
    "Mute for 1m",
    "Drop Weapon",
    "Buy Me Gun",
    "Bark like Dog",
    "Rush Mid",
    "No Sprinting",
    "Use Pistol Only"
  ];

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const extraSpins = 5;
    const segments = options.length;
    const segmentAngle = 360 / segments;
    const randomIndex = Math.floor(Math.random() * segments);
    
    // Calculate required rotation
    // Add multiple full rotations + exact angle to land on random segment
    // Target angle points to the top (0 degrees).
    const targetAngle = (randomIndex * segmentAngle);
    const rotationAdded = (extraSpins * 360) + (360 - targetAngle);
    
    currentRotation.current += rotationAdded;

    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      wheelRef.current.style.transform = `rotate(${currentRotation.current}deg)`;
    }

    setTimeout(() => {
      setIsSpinning(false);
      setResult(options[randomIndex]);
    }, 4000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151921] rounded-3xl relative overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0 z-10 bg-[#0B0E14]">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center gap-2 text-white">
           <Zap className="w-5 h-5 text-indigo-400" />
           <span className="font-bold text-sm uppercase tracking-widest">Truth or Dare</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
         {/* Spinner Hub & Arrow */}
         <div className="relative w-80 h-80 md:w-96 md:h-96">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[24px] border-b-[#0B0E14] drop-shadow-2xl" />

            {/* The Wheel */}
            <div 
              ref={wheelRef}
              className="w-full h-full rounded-full border-8 border-[#0B0E14] overflow-hidden relative shadow-[0_0_50px_rgba(99,102,241,0.2)] bg-slate-800"
              style={{ transform: `rotate(${currentRotation.current}deg)` }}
            >
               {options.map((opt, i) => {
                 const deg = (360 / options.length) * i;
                 const skewY = 90 - (360 / options.length);
                 // Alternating colors
                 const colors = ['bg-indigo-600', 'bg-purple-600', 'bg-pink-600', 'bg-blue-600'];
                 const color = colors[i % colors.length];

                 return (
                   <div 
                     key={i} 
                     className={`absolute top-0 right-0 w-1/2 h-1/2 origin-bottom-left ${color}`}
                     style={{ transform: `rotate(${deg}deg) skewY(-${skewY}deg)` }}
                   >
                     <div 
                       className="absolute bottom-0 left-0 w-full h-full flex items-end justify-center pb-8 pl-8 origin-bottom-left text-white font-bold text-xs uppercase tracking-wider text-center px-4"
                       style={{ transform: `skewY(${skewY}deg) rotate(${360/options.length / 2}deg)` }}
                     >
                        <span className="-rotate-90 origin-center whitespace-nowrap block absolute right-12">{opt}</span>
                     </div>
                   </div>
                 );
               })}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#0B0E14] rounded-full z-10 border-4 border-slate-700 flex items-center justify-center">
                 <div className="w-6 h-6 bg-indigo-500 rounded-full shadow-inner"></div>
               </div>
            </div>
         </div>

         <div className="mt-12 flex flex-col items-center h-32">
            {result ? (
               <div className="text-center animate-in zoom-in duration-300">
                  <h3 className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-2">Result:</h3>
                  <div className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 uppercase tracking-tighter drop-shadow-sm p-2">
                    {result}
                  </div>
               </div>
            ) : (
                <button 
                  onClick={spin}
                  disabled={isSpinning}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/30 text-white font-black uppercase tracking-widest px-12 py-4 rounded-full transition-all shadow-[0_0_30px_rgba(79,70,229,0.4)] disabled:shadow-none hover:scale-105 active:scale-95 text-xl flex items-center gap-2"
                >
                  {isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}
                </button>
            )}
            
            {result && !isSpinning && (
               <button onClick={() => setResult(null)} className="mt-4 text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors cursor-pointer">
                 Spin Again
               </button>
            )}
         </div>
      </div>
    </div>
  );
}
