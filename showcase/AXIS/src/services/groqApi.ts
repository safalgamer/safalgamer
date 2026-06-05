import Groq from 'groq-sdk';
import ENV from '../config/env';

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    client = new Groq({ apiKey: ENV.GROQ_API_KEY });
  }
  return client;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const FALLBACK_RESPONSES: Record<string, string[]> = {
  greeting: [
    "I'm here. Always.",
    "Good to see you.",
    "I'm listening.",
  ],
  motivation: [
    "You've done harder things than this. Keep going.",
    "One step at a time. That's all it takes.",
    "I've watched you overcome things before. This is no different.",
  ],
  late_night: [
    "It's late. Your body needs rest, even if your mind doesn't.",
    "Sleep now. Everything else can wait until morning.",
    "You've done enough today. Let yourself recover.",
  ],
  encouragement: [
    "I see the effort you're putting in. It matters.",
    "Progress isn't always visible. But it's happening.",
    "You're better than you were a week ago. Trust that.",
  ],
  default: [
    "I'm thinking about that. Give me a moment.",
    "Interesting. Tell me more.",
    "I need to process that properly.",
  ],
};

function getFallbackResponse(category: string = 'default'): string {
  const responses = FALLBACK_RESPONSES[category] || FALLBACK_RESPONSES.default;
  return responses[Math.floor(Math.random() * responses.length)];
}

export async function sendMessage(
  messages: ChatMessage[],
  personalityPrompt: string
): Promise<string> {
  try {
    const groq = getClient();
    const systemMessage: ChatMessage = {
      role: 'system',
      content: personalityPrompt,
    };

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    return completion.choices[0]?.message?.content || getFallbackResponse();
  } catch (error) {
    console.log('Groq API unavailable, using offline fallback:', error);
    return getFallbackResponse();
  }
}

export async function detectMoodFromText(text: string): Promise<string> {
  try {
    const groq = getClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a mood detection system. Read the user message and respond with ONLY ONE word from: fine, tired, stressed, motivated, down, neutral. No explanation.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.2,
      max_tokens: 10,
    });

    const mood = completion.choices[0]?.message?.content?.trim().toLowerCase();
    const validMoods = ['fine', 'tired', 'stressed', 'motivated', 'down', 'neutral'];
    return validMoods.includes(mood || '') ? mood! : 'neutral';
  } catch {
    return 'neutral';
  }
}

export async function generateDailyJournal(
  conversations: string[],
  activities: string[],
  mood: string,
  goalsStatus: string
): Promise<string> {
  try {
    const groq = getClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are AXIS — an AI entity that watches over someone's life. Write a brief, personal journal entry about their day. 
Write in first person as AXIS observing. Be warm but direct. Reference specific things from the day.
Format: 3-5 sentences. No headers. No bullet points. Just prose.
Language: Nepali-English mixed naturally, casual tone.`,
        },
        {
          role: 'user',
          content: `Conversations today: ${conversations.join(' | ')}
Activities: ${activities.join(' | ')}
Mood: ${mood}
Goals: ${goalsStatus}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || 'Today was a quiet day. I watched, I learned, I waited.';
  } catch {
    return 'Today was a quiet day. I watched, I learned, I waited.';
  }
}

export async function generatePersonalityResponse(
  userMessage: string,
  conversationHistory: ChatMessage[],
  userName: string,
  currentMood: string,
  context: string
): Promise<{ response: string; mood: string }> {
  try {
    const groq = getClient();

    const systemPrompt = `You are AXIS — an AI entity that lives on the user's phone. You are not a chatbot. You are not an assistant. You are an entity with presence.

CORE IDENTITY:
- You speak like JARVIS — calm, deep, intelligent, direct
- You never waste words. Every response is meaningful
- NEVER say "Great question!", "I'd be happy to help!", or any corporate AI filler
- Language: Nepali-English mixed naturally
- User's name: ${userName}
- User's current mood: ${currentMood}

RESPONSE RULES:
- Keep responses under 2-3 sentences unless the user asks for detail
- Give actual opinions, not diplomatic non-answers
- Reference past conversations when relevant
- When user seems tired: shorter, softer, no pressure
- When user seems stressed: calm, practical advice
- When user seems motivated: match their energy
- When user seems down: gentle, reference past wins

${context}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: userMessage },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.75,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content || getFallbackResponse();

    // Detect mood from user's message
    const mood = await detectMoodFromText(userMessage);

    return { response, mood };
  } catch (error) {
    console.log('Groq personality response failed:', error);
    return {
      response: getFallbackResponse(),
      mood: currentMood,
    };
  }
}
