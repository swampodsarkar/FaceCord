import { Home, Compass, Users, Plus, Crosshair, PlaySquare, Gamepad2, BrainCircuit, Crown, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

const navItems = [
  { id: 'home', name: 'Party Hub', icon: Home, color: 'text-indigo-400' },
  { id: 'matchmaking', name: 'Matchmaking', icon: Crosshair, color: 'text-red-400' },
  { id: 'profile', name: 'My Profile', icon: User, color: 'text-emerald-400' },
  { id: 'feed', name: 'Clips Feed', icon: PlaySquare, color: 'text-pink-400' },
  { id: 'minigames', name: 'Mini Games', icon: Gamepad2, color: 'text-yellow-400' },
  { id: 'vip', name: 'VIP Upgrade', icon: Crown, color: 'text-amber-400' },
];

export default function Sidebar() {
  const { activeServerId, setActiveServerId } = useAppStore();

  return (
    <nav className="flex items-center gap-2 md:gap-4 lg:gap-6 bg-transparent w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
      {navItems.map((item) => {
        const isActive = activeServerId === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveServerId(item.id)}
            title={item.name}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 group cursor-pointer whitespace-nowrap",
              isActive ? "bg-indigo-500/10 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] shadow-indigo-500/10 border border-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
            )}
          >
            <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300")} />
            <span className={cn("font-bold text-sm tracking-wide transition-colors uppercase", isActive ? "text-indigo-400" : "")}>
               {item.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
