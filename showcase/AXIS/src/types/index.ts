export interface User {
  id: string;
  name: string;
  age?: number;
  createdAt: string;
  interactionMode: 'voice' | 'chat';
  wakeWord: string;
  checkInFrequency: 'minimal' | 'normal' | 'active';
  voiceTone: 'chill' | 'serious';
  noDisturbStart?: string;
  noDisturbEnd?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'axis';
  content: string;
  timestamp: string;
  mood?: Mood;
  isProactive?: boolean;
  trigger?: ProactiveTrigger;
}

export interface Conversation {
  id: string;
  date: string;
  messages: Message[];
  summary?: string;
  highlighted?: boolean;
}

export type Mood = 'fine' | 'tired' | 'stressed' | 'motivated' | 'down' | 'neutral';

export type ProactiveTrigger =
  | 'screen_time'
  | 'late_night'
  | 'inactivity'
  | 'deadline'
  | 'battery'
  | 'check_in'
  | 'location_change'
  | 'habit_nudge';

export interface MoodEntry {
  id: string;
  date: string;
  score: number; // 1-10
  mood: Mood;
  notes?: string;
}

export interface SleepEntry {
  id: string;
  date: string;
  duration: number; // hours
  quality: number; // 1-10
  sleepTime: string;
  wakeTime: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  streak: number;
  completedToday: boolean;
  history: Record<string, boolean>;
}

export interface Goal {
  id: string;
  text: string;
  deadline?: string;
  progress: number; // 0-100
  isMainGoal: boolean;
  createdAt: string;
}

export interface LocationZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
  behavior: 'home' | 'college' | 'outside';
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  canAutoReply: boolean;
}

export interface AxisPersonality {
  systemPrompt: string;
  nickname?: string;
  communicationStyle: string;
  opinions: Record<string, string>;
  evolutionLog: PersonalityEvolution[];
}

export interface PersonalityEvolution {
  date: string;
  change: string;
  trigger: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: Mood;
  conversations: number;
  goalsCompleted: number;
  highlights: string[];
}

export interface ScreenActivity {
  id: string;
  packageName: string;
  appName: string;
  duration: number;
  timestamp: string;
}

export interface GuardianEvent {
  id: string;
  timestamp: string;
  type: 'stranger_detected' | 'app_blocked' | 'phone_locked' | 'pre_warning';
  details: string;
  faceMatched?: boolean;
}

export interface OnboardingData {
  name: string;
  age: string;
  dailyRoutine: string;
  wakeTime: string;
  classSchedule: string;
  currentGoals: string;
  currentMood: string;
  biggestStruggle: string;
  fitnessHabits: string;
  creativeProjects: string;
  mostWantedHelp: string;
}

export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  Main: undefined;
  Chat: undefined;
  LifeStats: undefined;
  Settings: undefined;
  Guardian: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Chat: undefined;
  Camera: undefined;
  LifeStats: undefined;
  Settings: undefined;
};
