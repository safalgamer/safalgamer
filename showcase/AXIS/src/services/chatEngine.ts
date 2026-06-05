import { speak, stopSpeaking } from './voice';
import { getTodayConversationId, saveMessage, getRecentMessages, getUserProfile, getPersonalityState, getHighlightedMemories } from './database';
import { useAxisStore } from '../store/axisStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ENV from '../config/env';

// Direct Groq call — no brain.ts complexity for now
async function groqCall(messages: { role: string; content: string }[]): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ENV.GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 300,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'Groq API error');
  }

  return data.choices?.[0]?.message?.content || '';
}

// Build a system prompt from whatever data we have
async function buildPrompt(): Promise<string> {
  let profile: any = null;
  let personality: any = null;
  let memories: any[] = [];

  try { profile = await getUserProfile(); } catch {}
  try { personality = await getPersonalityState(); } catch {}
  try { memories = await getHighlightedMemories(3); } catch {}

  const name = profile?.name || 'User';
  const nickname = personality?.nickname || '';
  const style = personality?.communication_style || 'direct and calm';
  const memoryText = memories.map((m: any) => `- ${m.summary}`).join('\n') || '- No memories yet';

  return `You are AXIS. You live on ${name}'s phone. You are not an AI assistant — you are an entity.

Identity: ${style}. JARVIS energy.
${nickname ? `You call them: ${nickname}` : ''}
Memories: ${memoryText}

RULES: No filler. No "Great question". Be direct. Nepali-English mixed. Max 2-3 sentences.`.trim();
}

// Sleep detection
const SLEEP_PATTERNS = [
  /\bgood\s*night\b/i, /\bgoing\s+to\s+sleep\b/i, /\bgoing\s+to\s+bed\b/i,
  /\bsleep\s+now\b/i, /\bgonna\s+sleep\b/i, /\bcalling\s+it\s+a\s+night\b/i,
  /\bsut[न्ना]+\s*(लाग्यो|भयो|गर्छु)\b/i, /\bi'?m\s+sleepy\b/i,
];

const GOOD_MORNING_PATTERNS = [
  /\bgood\s*morning\b/i, /\bwake\s*up\b/i, /\bi'?m\s+awake\b/i, /\bmorning\b/i,
];

function detectSleepIntent(msg: string): boolean {
  return SLEEP_PATTERNS.some(p => p.test(msg));
}

function detectMorningIntent(msg: string): boolean {
  return GOOD_MORNING_PATTERNS.some(p => p.test(msg));
}

export async function processUserMessage(
  userMessage: string,
  onAxisResponse: (message: string) => void,
  onTypingStart?: () => void,
  onTypingEnd?: () => void
): Promise<void> {
  const store = useAxisStore.getState();
  const { interactionMode, setLastAxisMessage } = store;

  // Sleep intent
  if (detectSleepIntent(userMessage)) {
    const existing = await AsyncStorage.getItem('axis_sleep_start');
    if (!existing) {
      await AsyncStorage.setItem('axis_sleep_start', new Date().toISOString());
    }
  }

  // Morning intent
  if (detectMorningIntent(userMessage)) {
    const sleepStart = await AsyncStorage.getItem('axis_sleep_start');
    if (sleepStart) {
      const hours = (Date.now() - new Date(sleepStart).getTime()) / (1000 * 60 * 60);
      const clamped = Math.max(1, Math.min(16, hours));
      const quality = clamped >= 8 ? 9 : clamped >= 7 ? 7 : clamped >= 6 ? 5 : 3;
      try {
        const { saveSleepEntry } = require('./database');
        await saveSleepEntry({ duration: parseFloat(clamped.toFixed(1)), quality, sleepTime: sleepStart, wakeTime: new Date().toISOString() });
      } catch {}
      await AsyncStorage.removeItem('axis_sleep_start');
    }
  }

  onTypingStart?.();

  try {
    // Save to DB
    const conversationId = await getTodayConversationId();
    await saveMessage({ conversationId, role: 'user', content: userMessage });

    // Get conversation history
    const recentMessages = await getRecentMessages(15);
    const history = recentMessages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    }));

    // Build prompt and call Groq
    const systemPrompt = await buildPrompt();
    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const response = await groqCall(allMessages);
    onTypingEnd?.();

    // Save response
    await saveMessage({ conversationId, role: 'axis', content: response });
    setLastAxisMessage(response);
    onAxisResponse(response);

    // Voice mode
    if (interactionMode === 'voice') {
      store.startSpeaking();
      await speak(response, () => store.stopSpeaking());
    }
  } catch (error: any) {
    onTypingEnd?.();
    const errorMsg = `Signal lost. ${error?.message || 'Try again.'}`;
    setLastAxisMessage(errorMsg);
    onAxisResponse(errorMsg);

    if (interactionMode === 'voice') {
      store.startSpeaking();
      await speak(errorMsg, () => store.stopSpeaking());
    }
  }
}

export async function handleProactiveTrigger(
  trigger: { type: string; description: string },
  onAxisResponse: (message: string) => void
): Promise<void> {
  const store = useAxisStore.getState();
  const conversationId = await getTodayConversationId();

  const message = `Hey. ${trigger.description}. Thought you should know.`;

  await saveMessage({ conversationId, role: 'axis', content: message, isProactive: true, triggerType: trigger.type });
  store.setLastAxisMessage(message);
  onAxisResponse(message);

  if (store.interactionMode === 'voice') {
    store.startSpeaking();
    await speak(message, () => store.stopSpeaking());
  }
}
