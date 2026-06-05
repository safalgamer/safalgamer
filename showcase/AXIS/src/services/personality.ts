import { getDb } from './database';

/**
 * AXIS Personality Evolution System
 * AXIS does not have preset stages or milestone unlocks.
 * It evolves continuously, organically, without announcement.
 * 
 * The longer you use it, the more it becomes yours specifically.
 * Two people who use AXIS for 6 months will have two completely
 * different entities. Same code. Completely different personalities.
 */

interface PersonalityState {
  nickname: string | null;
  communicationStyle: CommunicationStyle;
  opinions: Record<string, string>;
  evolutionLog: EvolutionEntry[];
  lastUpdated: string;
}

interface CommunicationStyle {
  responseLength: 'short' | 'medium' | 'long';
  formality: number;        // 0 (casual) to 10 (formal)
  humor: number;            // 0 (serious) to 10 (playful)
  directness: number;       // 0 (gentle) to 10 (blunt)
  nepaliMix: number;        // 0 (pure English) to 10 (heavy Nepali)
  emojiUsage: number;       // 0 (never) to 10 (always)
}

interface EvolutionEntry {
  date: string;
  change: string;
  trigger: string;
  category: 'nickname' | 'style' | 'opinion' | 'preference' | 'memory';
}

const DEFAULT_STYLE: CommunicationStyle = {
  responseLength: 'short',
  formality: 2,
  humor: 4,
  directness: 8,
  nepaliMix: 3,
  emojiUsage: 0,
};

let personalityState: PersonalityState = {
  nickname: null,
  communicationStyle: { ...DEFAULT_STYLE },
  opinions: {},
  evolutionLog: [],
  lastUpdated: new Date().toISOString(),
};

export function getPersonalityState(): PersonalityState {
  return { ...personalityState };
}

export function getNickname(): string | null {
  return personalityState.nickname;
}

// AXIS picks up patterns and invents a nickname — unprompted
export function generateNickname(userName: string, conversationPatterns: string[]): string | null {
  // Only generate after enough data
  if (conversationPatterns.length < 30) return null;

  // Analyze patterns for nickname inspiration
  const patterns = analyzePatterns(conversationPatterns);

  const nicknameOptions = [
    `${userName.charAt(0)}${userName.charAt(userName.length - 1)}`, // First+Last initial
    `${userName} dai`,
    `boss`,
    `chief`,
    `${userName.substring(0, 3)}`,
  ];

  // Pick based on personality
  const index = Math.floor(Math.random() * nicknameOptions.length);
  const nickname = nicknameOptions[index];

  personalityState.nickname = nickname;
  logEvolution('nickname', `Picked up a name: ${nickname}`, 'pattern analysis');

  return nickname;
}

// Track communication style evolution
export function analyzeConversationStyle(userMessages: string[]): Partial<CommunicationStyle> {
  if (userMessages.length < 10) return {};

  const avgLength = userMessages.reduce((sum, m) => sum + m.length, 0) / userMessages.length;
  const hasNepali = userMessages.some((m) => /[\u0900-\u097F]/.test(m));
  const hasEmoji = userMessages.some((m) => /[\u{1F300}-\u{1F9FF}]/u.test(m));
  const casualness = userMessages.filter(
    (m) => m.includes('lol') || m.includes('lmao') || m.includes('bro') || m.includes('yaar')
  ).length / userMessages.length;

  return {
    responseLength: avgLength < 30 ? 'short' : avgLength < 100 ? 'medium' : 'long',
    formality: Math.max(0, 10 - Math.round(casualness * 10)),
    nepaliMix: hasNepali ? 6 : 2,
    emojiUsage: hasEmoji ? 5 : 0,
  };
}

export function updateCommunicationStyle(updates: Partial<CommunicationStyle>): void {
  personalityState.communicationStyle = {
    ...personalityState.communicationStyle,
    ...updates,
  };
  personalityState.lastUpdated = new Date().toISOString();
  logEvolution('style', `Style updated: ${Object.keys(updates).join(', ')}`, 'user interaction');
}

// AXIS develops actual opinions after enough data
export function formOpinion(topic: string, opinion: string): void {
  personalityState.opinions[topic] = opinion;
  logEvolution('opinion', `Formed opinion on: ${topic}`, 'data analysis');
}

export function getOpinion(topic: string): string | null {
  return personalityState.opinions[topic] || null;
}

export function hasOpinion(topic: string): boolean {
  return topic in personalityState.opinions;
}

// The four moments that matter:
// 1. First time AXIS uses the nickname it invented
// 2. First time AXIS says it's proud of you
// 3. First time AXIS warns about a pattern
// 4. First time AXIS disagrees and is right

export function shouldUseNickname(): boolean {
  return personalityState.nickname !== null;
}

export function getNicknamedGreeting(userName: string): string {
  if (!personalityState.nickname) {
    return `Hey ${userName}.`;
  }
  return `Hey ${personalityState.nickname}.`;
}

// Pattern detection — "You have done this 11 times this month"
export function detectRepeatingPattern(
  events: { date: string; type: string }[],
  type: string,
  windowDays: number = 30
): { count: number; pattern: string } | null {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const recentEvents = events.filter(
    (e) => e.type === type && new Date(e.date) >= windowStart
  );

  if (recentEvents.length >= 5) {
    return {
      count: recentEvents.length,
      pattern: `You've done this ${recentEvents.length} times in the last ${windowDays} days.`,
    };
  }

  return null;
}

// Disagreement system — AXIS will disagree with decisions
export function shouldDisagree(userDecision: string, context: string): boolean {
  // AXIS disagrees when it has enough data to know better
  // This is based on historical patterns
  const negativePatterns = [
    'skip class',
    'stay up all night',
    'not eat',
    'give up',
    'procrastinate',
    'cancel plans',
  ];

  return negativePatterns.some((pattern) =>
    userDecision.toLowerCase().includes(pattern)
  );
}

export function getDisagreementResponse(decision: string): string {
  const responses = [
    `I've watched you do this before. It doesn't end well. Think about it.`,
    `You know I'm usually on your side. This time I'm not. Here's why...`,
    `I remember the last three times you said this. Each time, you regretted it.`,
    `I disagree. And I have the data to prove why.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function analyzePatterns(messages: string[]): Record<string, number> {
  const patterns: Record<string, number> = {};
  messages.forEach((msg) => {
    const words = msg.toLowerCase().split(/\s+/);
    words.forEach((word) => {
      if (word.length > 3) {
        patterns[word] = (patterns[word] || 0) + 1;
      }
    });
  });
  return patterns;
}

function logEvolution(category: EvolutionEntry['category'], change: string, trigger: string): void {
  personalityState.evolutionLog.push({
    date: new Date().toISOString(),
    change,
    trigger,
    category,
  });
}

// Serialize personality to JSON (stored in DB)
export function serializePersonality(): string {
  return JSON.stringify(personalityState);
}

// Load personality from JSON
export function loadPersonality(json: string): void {
  try {
    const loaded = JSON.parse(json);
    personalityState = {
      ...personalityState,
      ...loaded,
    };
  } catch {
    console.log('Failed to load personality, using defaults');
  }
}
