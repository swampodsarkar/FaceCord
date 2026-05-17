import { create } from 'zustand';

interface User {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  xp?: number;
  level?: number;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  customStatus?: string;
  bio?: string;
  bannerColor?: string;
  nameColor?: string;
  avatarFrame?: string;
  activity?: string;
  vipTier?: 'free' | 'basic' | 'pro' | 'clan';
  partiesHost?: number;
  voiceActivity?: number;
  wins?: number;
  minigameMastery?: number;
  karma?: number;
  seasonRank?: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  activeServerId: string | null;
  setActiveServerId: (id: string | null) => void;
  activeChannelId: string | null;
  setActiveChannelId: (id: string | null) => void;
  inVoiceChannel: boolean;
  setInVoiceChannel: (status: boolean) => void;
  vipTier: 'free' | 'basic' | 'pro' | 'clan';
  setVipTier: (tier: 'free' | 'basic' | 'pro' | 'clan') => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  activeServerId: 'home',
  setActiveServerId: (id) => set({ activeServerId: id }),
  activeChannelId: 'general',
  setActiveChannelId: (id) => set({ activeChannelId: id }),
  inVoiceChannel: false,
  setInVoiceChannel: (status) => set({ inVoiceChannel: status }),
  vipTier: 'free',
  setVipTier: (tier) => set({ vipTier: tier }),
  isAdmin: false,
  setIsAdmin: (admin: boolean) => set({ isAdmin: admin }),
}));
