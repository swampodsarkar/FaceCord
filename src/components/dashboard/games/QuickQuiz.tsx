import { useState } from 'react';
import { ArrowLeft, BrainCircuit, Check, X } from 'lucide-react';

const QA = [
  { q: "What is the highest rank in Valorant?", options: ["Radiant", "Immortal", "Global Elite", "Predator"], a: 0 },
  { q: "Which company developed Apex Legends?", options: ["Epic Games", "Riot Games", "Respawn", "Valve"], a: 2 },
  { q: "What year was Minecraft fully released?", options: ["2009", "2011", "2013", "2015"], a: 1 },
  { q: "What is the name of Master Chief's AI companion?", options: ["Siri", "Cortana", "Alexa", "GLaDOS"], a: 1 },
  { q: "In CS:GO, what is the max money a player can hold?", options: ["$10,000", "$16,000", "$12,000", "$20,000"], a: 1 },
];

export default function QuickQuiz({ onBack }: { onBack: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  const handleAnswer = (index: number) => {
    if (selectedAns !== null) return;
    setSelectedAns(index);
    
    if (index === QA[currentQ].a) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQ < QA.length - 1) {
        setCurrentQ(q => q + 1);
        setSelectedAns(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const restartText = () => {
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setSelectedAns(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#151921] rounded-3xl relative overflow-hidden">
      <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0 z-10 bg-[#0B0E14]">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm uppercase tracking-widest">Back</span>
        </button>
        <div className="flex items-center gap-2 text-emerald-400">
           <BrainCircuit className="w-5 h-5" />
           <span className="font-bold text-sm uppercase tracking-widest">Trivia: {currentQ + 1}/{QA.length}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center relative">
         {showResult ? (
            <div className="text-center">
              <h2 className="text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-4">
                 {score}/{QA.length} Correct
              </h2>
              <p className="text-slate-400 font-bold mb-8 text-lg">
                {score === QA.length ? 'Flawless Victory! 🎉' : score > 2 ? 'Good job, gamer! 👍' : 'Need more practice. 💀'}
              </p>
              <button 
                onClick={restartText}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
              >
                Play Again
              </button>
            </div>
         ) : (
            <div className="w-full max-w-2xl">
              <div className="bg-[#0B0E14] border border-white/5 p-8 rounded-3xl mb-8 relative">
                 <div className="absolute top-0 left-8 -translate-y-1/2 bg-emerald-500 text-black font-black uppercase tracking-widest text-xs px-3 py-1 rounded-full">
                    Question {currentQ + 1}
                 </div>
                 <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                   {QA[currentQ].q}
                 </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {QA[currentQ].options.map((opt, i) => {
                   const isSelected = selectedAns === i;
                   const isCorrect = i === QA[currentQ].a;
                   const showAnswer = selectedAns !== null;
                   
                   let btnStyle = "bg-[#0B0E14] border-white/5 text-slate-300 hover:border-emerald-500/50 hover:bg-white/5";
                   if (showAnswer) {
                     if (isCorrect) {
                       btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                     } else if (isSelected) {
                       btnStyle = "bg-red-500/20 border-red-500 text-red-400";
                     } else {
                       btnStyle = "bg-[#0B0E14] border-white/5 text-slate-600 opacity-50";
                     }
                   }

                   return (
                     <button
                       key={i}
                       onClick={() => handleAnswer(i)}
                       disabled={showAnswer}
                       className={`p-6 rounded-2xl border-2 font-bold text-lg transition-all text-left flex justify-between items-center group cursor-pointer ${btnStyle}`}
                     >
                       <span>{opt}</span>
                       {showAnswer && isCorrect && <Check className="w-6 h-6 text-emerald-500" />}
                       {showAnswer && !isCorrect && isSelected && <X className="w-6 h-6 text-red-500" />}
                     </button>
                   );
                 })}
              </div>
            </div>
         )}
      </div>
    </div>
  );
}
