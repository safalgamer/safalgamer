import { create } from 'zustand';

export type OrbState = 'idle' | 'speaking' | 'guardian' | 'listening';

interface AxisState {
  // Orb
  orbState: OrbState;
  setOrbState: (state: OrbState) => void;

  // Speaking
  isSpeaking: boolean;
  startSpeaking: () => void;
  stopSpeaking: () => void;

  // Guardian
  isGuardianMode: boolean;
  activateGuardian: () => void;
  deactivateGuardian: () => void;

  // User
  userName: string;
  userNickname: string;
  setUserName: (name: string) => void;
  setNickname: (nickname: string) => void;

  // Interaction mode
  interactionMode: 'voice' | 'chat';
  setInteractionMode: (mode: 'voice' | 'chat') => void;

  // Onboarding
  hasOnboarded: boolean;
  setHasOnboarded: (value: boolean) => void;

  // Active
  isActive: boolean;
  setIsActive: (value: boolean) => void;

  // Chat
  isTyping: boolean;
  setIsTyping: (value: boolean) => void;

  // Location
  currentZone: string | null;
  setCurrentZone: (zone: string | null) => void;

  // Mood
  currentMood: string;
  setCurrentMood: (mood: string) => void;

  // Messages
  lastAxisMessage: string;
  setLastAxisMessage: (msg: string) => void;
}

export const useAxisStore = create<AxisState>((set) => ({
  orbState: 'idle',
  setOrbState: (state) => set({ orbState: state }),

  isSpeaking: false,
  startSpeaking: () => set({ orbState: 'speaking', isSpeaking: true }),
  stopSpeaking: () => set({ orbState: 'idle', isSpeaking: false }),

  isGuardianMode: false,
  activateGuardian: () => set({ orbState: 'guardian', isGuardianMode: true }),
  deactivateGuardian: () => set({ orbState: 'idle', isGuardianMode: false }),

  userName: '',
  userNickname: '',
  setUserName: (name) => set({ userName: name }),
  setNickname: (nickname) => set({ userNickname: nickname }),

  interactionMode: 'chat',
  setInteractionMode: (mode) => set({ interactionMode: mode }),

  hasOnboarded: false,
  setHasOnboarded: (value) => set({ hasOnboarded: value }),

  isActive: false,
  setIsActive: (value) => set({ isActive: value }),

  isTyping: false,
  setIsTyping: (value) => set({ isTyping: value }),

  currentZone: null,
  setCurrentZone: (zone) => set({ currentZone: zone }),

  currentMood: 'neutral',
  setCurrentMood: (mood) => set({ currentMood: mood }),

  lastAxisMessage: '',
  setLastAxisMessage: (msg) => set({ lastAxisMessage: msg }),
}));
