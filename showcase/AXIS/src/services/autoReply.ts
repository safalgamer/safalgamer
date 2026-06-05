import { sendMessage } from './groqApi';
import { speak } from './voice';
import { saveMessage, getTodayConversationId, getUserProfile } from './database';
import { useAxisStore } from '../store/axisStore';

/**
 * AXIS Auto-Reply System
 * AXIS can reply to messages fully autonomously — no approval needed.
 * It has been given full trust.
 * 
 * It learns the user's exact texting style purely by observing
 * how they communicate in their conversations with AXIS.
 * 
 * Trusted contacts: auto-reply immediately
 * Unknown numbers: show draft first
 * 
 * The language AXIS uses: Nepali-English mixed, casual, authentic.
 * Not formal AI text. The user's actual voice.
 */

interface AutoReplyConfig {
  enabled: boolean;
  trustedContacts: TrustedContact[];
  userTextStyle: TextStyle;
}

interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  canAutoReply: boolean;
}

interface TextStyle {
  language: 'nepali-english-mixed' | 'english' | 'nepali';
  formality: 'casual' | 'moderate' | 'formal';
  useSlang: boolean;
  commonPhrases: string[];
  greetingStyle: string;
}

interface IncomingMessage {
  id: string;
  sender: string;
  senderPhone: string;
  content: string;
  app: string;
  timestamp: string;
}

interface ReplyDraft {
  id: string;
  originalMessage: IncomingMessage;
  suggestedReply: string;
  confidence: number;
  approved: boolean | null; // null = pending, true = approved, false = rejected
}

let config: AutoReplyConfig = {
  enabled: false,
  trustedContacts: [],
  userTextStyle: {
    language: 'nepali-english-mixed',
    formality: 'casual',
    useSlang: true,
    commonPhrases: [],
    greetingStyle: 'hey',
  },
};

let pendingDrafts: ReplyDraft[] = [];

export function isAutoReplyEnabled(): boolean {
  return config.enabled;
}

export function setAutoReplyEnabled(enabled: boolean): void {
  config.enabled = enabled;
}

export function addTrustedContact(contact: TrustedContact): void {
  config.trustedContacts.push(contact);
}

export function removeTrustedContact(id: string): void {
  config.trustedContacts = config.trustedContacts.filter((c) => c.id !== id);
}

export function getTrustedContacts(): TrustedContact[] {
  return [...config.trustedContacts];
}

export function isTrustedContact(phone: string): boolean {
  return config.trustedContacts.some(
    (c) => c.phone === phone && c.canAutoReply
  );
}

// Process incoming message and decide what to do
export async function processIncomingMessage(
  message: IncomingMessage
): Promise<{ action: 'auto_replied' | 'draft_created' | 'ignored'; reply?: string }> {
  if (!config.enabled) {
    return { action: 'ignored' };
  }

  const trusted = isTrustedContact(message.senderPhone);

  if (trusted) {
    // Auto-reply immediately
    const reply = await generateReply(message);
    return { action: 'auto_replied', reply };
  } else {
    // Create draft for user approval
    const reply = await generateReply(message);
    const draft: ReplyDraft = {
      id: `draft-${Date.now()}`,
      originalMessage: message,
      suggestedReply: reply,
      confidence: 0.7,
      approved: null,
    };
    pendingDrafts.push(draft);
    return { action: 'draft_created', reply };
  }
}

// Generate a reply that sounds like the user
async function generateReply(message: IncomingMessage): Promise<string> {
  const prompt = `You are replying to a message AS the user. You must sound exactly like them.

USER'S TEXTING STYLE:
- Language: ${config.userTextStyle.language} (Nepali-English mixed)
- Formality: ${config.userTextStyle.formality}
- Uses slang: ${config.userTextStyle.useSlang}
- Greeting style: ${config.userTextStyle.greetingStyle}

RULES:
- Reply in the user's EXACT style
- Keep it short (1-2 sentences)
- Be casual and authentic
- Use Nepali-English mix naturally
- No formal AI language
- Sound like a real person texting their friend

INCOMING MESSAGE FROM ${message.sender}:
"${message.content}"

Write the reply:`;

  try {
    const reply = await sendMessage(
      [{ role: 'user', content: prompt }],
      'You are a text message reply generator. Reply exactly as instructed.'
    );
    return reply;
  } catch {
    return getFallbackReply(message.content);
  }
}

function getFallbackReply(incomingMessage: string): string {
  const msg = incomingMessage.toLowerCase();

  if (msg.includes('hey') || msg.includes('hello') || msg.includes('hi')) {
    return 'hey! whats up';
  }
  if (msg.includes('k cha') || msg.includes('k xa')) {
    return 'thik cha, timi bata?';
  }
  if (msg.includes('?')) {
    return 'hmm, let me think about that';
  }
  return 'okay cool';
}

// Learn user's texting style from their conversations with AXIS
export function learnTextStyle(userMessages: string[]): void {
  if (userMessages.length < 20) return;

  // Detect language mix
  const hasNepali = userMessages.some((m) => /[\u0900-\u097F]/.test(m));
  config.userTextStyle.language = hasNepali ? 'nepali-english-mixed' : 'english';

  // Detect formality
  const casualIndicators = userMessages.filter(
    (m) => /lol|lmao|bro|yaar|haha|okk|okie|ya\b/i.test(m)
  ).length;
  config.userTextStyle.formality =
    casualIndicators / userMessages.length > 0.3 ? 'casual' : 'moderate';

  // Extract common phrases
  const words = userMessages.join(' ').toLowerCase().split(/\s+/);
  const freq: Record<string, number> = {};
  words.forEach((w) => {
    if (w.length > 2) freq[w] = (freq[w] || 0) + 1;
  });
  config.userTextStyle.commonPhrases = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

// Get pending drafts for user to approve
export function getPendingDrafts(): ReplyDraft[] {
  return pendingDrafts.filter((d) => d.approved === null);
}

// User approves or rejects a draft
export function approveDraft(draftId: string, approved: boolean, editedReply?: string): void {
  const draft = pendingDrafts.find((d) => d.id === draftId);
  if (draft) {
    draft.approved = approved;
    if (editedReply) {
      draft.suggestedReply = editedReply;
    }
  }
}
