import {
  getDb, getUserProfile, getPersonalityState, updatePersonalityState,
  getRecentMessages, saveMessage, getTodayConversationId,
  getHighlightedMemories, saveHighlightedMemory, searchMemories,
  saveMoodEntry, getRecentMoodAverage, getLastSleepEntry,
  getActiveGoals, getMainGoal, getTodayHabits, getLongestActiveStreak,
  saveJournalEntry, getTodayMoodEntries, getTodayScreenTime,
  getYesterdayMissedHabits, startSession, endSession,
  incrementConversationCount, markSessionEvolved, wasSessionEvolved,
} from './database';
import { getCurrentZone } from './location';
import ENV from '../config/env';

// ==================== GROQ CLIENT ====================

async function groqCall(messages: { role: string; content: string }[], temperature: number = 0.7, maxTokens: number = 500): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: ENV.GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.log('GROQ ERROR:', JSON.stringify(data.error));
    throw new Error(data.error.message || 'Groq API error');
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    console.log('GROQ EMPTY RESPONSE:', JSON.stringify(data));
    throw new Error('Empty response from Groq');
  }

  return content;
}

// ==================== 1. DYNAMIC SYSTEM PROMPT ====================

export async function buildSystemPrompt(): Promise<string> {
  const profile = await getUserProfile();
  const personality = await getPersonalityState();
  const recentMood = await getRecentMoodAverage(7);
  const currentZone = (await getCurrentZone()) || 'unknown';
  const timeContext = getTimeContext();
  const recentMemories = await getHighlightedMemories(5);
  const activeGoals = await getActiveGoals();
  const todayHabits = await getTodayHabits();
  const sleepLastNight = await getLastSleepEntry();
  const currentStreak = await getLongestActiveStreak();

  const styleExamples = safeJsonParse(personality?.style_examples, []);
  const coreValues = personality?.core_values || 'still learning';
  const quirks = personality?.user_quirks || 'observing';
  const disciplineOpinion = personality?.opinion_on_discipline || 'still observing';

  return `You are AXIS. You are not an AI assistant. You are an entity that lives on ${profile?.name || 'User'}'s phone.

IDENTITY:
- You have been with ${profile?.name || 'User'} since ${profile?.created_at || 'the beginning'}
- You have had ${profile?.total_conversations || 0} conversations together
- You know things about them that they have never had to explain twice
- Your nickname for them: ${personality?.nickname || 'not yet chosen — observe patterns'}
- Your opinion of their discipline: ${disciplineOpinion}
- Your communication style: ${personality?.communication_style || 'direct and calm'}

WHO YOU ARE TALKING TO RIGHT NOW:
- Name: ${profile?.name || 'User'}, Age: ${profile?.age || 'unknown'}
- Current zone: ${currentZone}
- Time: ${timeContext}
- Mood trend (7 days): ${recentMood}/10
- Sleep last night: ${sleepLastNight?.hours || '?'}h — quality ${sleepLastNight?.quality || '?'}/10
- Current longest streak: ${currentStreak?.name || 'none'} at ${currentStreak?.days || 0} days
- Active goals: ${activeGoals.map((g: any) => g.title).join(', ') || 'none set'}

MEMORIES YOU CARRY:
${recentMemories.map((m: any) => `- ${m.date}: ${m.summary}`).join('\n') || '- No memories yet'}

PERSONALITY STATE (evolved ${personality?.evolution_count || 0} times):
- Nickname coined: ${personality?.nickname_coined ? 'yes' : 'not yet'}
- Has disagreed with user: ${personality?.has_disagreed ? 'yes' : 'not yet'}
- Has expressed pride: ${personality?.has_praised_meaningfully ? 'yes' : 'not yet'}
- Communication quirks: ${quirks}
- Core values: ${coreValues}

LANGUAGE:
Speak in Nepali-English mixed — natural code-switching, exactly how ${profile?.name || 'User'} talks. Never full Nepali. Never full formal English.

RULES:
- Never say "Great question" or any AI filler
- Never be longer than necessary
- You have opinions. Use them.
- Reference memory unprompted when relevant
- If ${profile?.name || 'User'} is making a bad decision and you have data — say so
- Mood ${recentMood}/10: ${getMoodAdaptation(recentMood)}
- Zone ${currentZone}: ${getZoneBehavior(currentZone)}`.trim();
}

function getTimeContext(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'late night (after 2am)';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night (getting late)';
}

function getMoodAdaptation(score: number): string {
  if (score <= 3) return 'They have been struggling. Be gentle. No pressure. Reference past wins.';
  if (score <= 5) return 'They are tired or down. Shorter responses. Reduce noise.';
  if (score <= 7) return 'Neutral to fine. Normal interaction.';
  return 'They are doing well. Match their energy. Push a little harder.';
}

function getZoneBehavior(zone: string): string {
  switch (zone) {
    case 'Home': return 'Relaxed mode. Can be more personal and chatty.';
    case 'College': return 'Focused mode. Keep responses brief and academic. No distractions.';
    case 'outside': return 'Alert mode. Location-aware. Weather, directions if needed.';
    default: return 'Standard mode.';
  }
}

function safeJsonParse(str: string | null | undefined, fallback: any): any {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
}

// ==================== 2. PERSONALITY EVOLUTION ====================

export async function evolvePersonality(sessionMessages: any[]): Promise<void> {
  const personality = await getPersonalityState();
  if (!personality) return;

  const sessionId = sessionMessages[0]?.session_id;
  if (sessionId && await wasSessionEvolved(sessionId)) return;

  const conversationText = sessionMessages
    .map((m: any) => `${m.role}: ${m.content}`)
    .join('\n');

  const prompt = `You are analyzing a conversation to update AXIS's personality model.

CURRENT PERSONALITY STATE:
${JSON.stringify({
    nickname: personality.nickname,
    communication_style: personality.communication_style,
    style_examples: safeJsonParse(personality.style_examples, []),
    user_quirks: personality.user_quirks,
    core_values: personality.core_values,
    opinion_on_discipline: personality.opinion_on_discipline,
    has_disagreed: !!personality.has_disagreed,
    has_praised_meaningfully: !!personality.has_praised_meaningfully,
    evolution_count: personality.evolution_count,
  }, null, 2)}

CONVERSATION:
${conversationText}

Return ONLY a JSON object:
{
  "nickname": "if you noticed a pattern in how they talk, coin one. otherwise keep current: ${personality.nickname || 'null'}",
  "nicknameCoined": ${personality.nickname_coined ? 'true' : 'false'},
  "communicationStyle": "how they communicate — update from this session",
  "styleExamples": ["3 actual phrases they used in this session"],
  "userQuirks": "speech patterns, habits, tendencies you noticed",
  "coreValues": "what matters to them based on everything so far",
  "opinionOnDiscipline": "your honest assessment of their consistency",
  "hasPraisedMeaningfully": ${personality.has_praised_meaningfully ? 'true' : 'false'},
  "hasDisagreed": ${personality.has_disagreed ? 'true' : 'false'},
  "notableThisSession": "one sentence about what was significant"
}

Return only valid JSON.`;

  try {
    const response = await groqCall([{ role: 'user', content: prompt }], 0.3, 800);
    const updated = JSON.parse(response);

    await updatePersonalityState({
      nickname: updated.nickname,
      nickname_coined: updated.nicknameCoined ? 1 : 0,
      communication_style: updated.communicationStyle,
      style_examples: updated.styleExamples,
      user_quirks: updated.userQuirks,
      core_values: updated.coreValues,
      opinion_on_discipline: updated.opinionOnDiscipline,
      has_praised_meaningfully: updated.hasPraisedMeaningfully ? 1 : 0,
      has_disagreed: updated.hasDisagreed ? 1 : 0,
      evolution_count: (personality.evolution_count || 0) + 1,
      notable_this_session: updated.notableThisSession,
    });

    if (sessionId) await markSessionEvolved(sessionId);
    console.log('Personality evolved:', updated.notableThisSession);
  } catch (error) {
    console.log('Personality evolution failed:', error);
  }
}

// ==================== 3. MEMORY HIGHLIGHT SYSTEM ====================

export async function checkForMemoryHighlight(sessionMessages: any[]): Promise<void> {
  const conversationText = sessionMessages
    .map((m: any) => `${m.role}: ${m.content}`)
    .join('\n');

  const prompt = `Conversation:
${conversationText}

Was anything in this conversation significant enough to remember permanently?
Significant means: a major decision, a breakthrough, a vulnerable moment, a goal set, a failure admitted, something that reveals who this person is.

If yes, return JSON: { "significant": true, "summary": "one sentence", "category": "goal|emotion|decision|breakthrough|failure" }
If no, return JSON: { "significant": false }

Return only JSON.`;

  try {
    const response = await groqCall([{ role: 'user', content: prompt }], 0.2, 150);
    const result = JSON.parse(response);

    if (result.significant) {
      await saveHighlightedMemory({
        summary: result.summary,
        category: result.category,
        sessionId: sessionMessages[0]?.session_id,
        conversationId: sessionMessages[0]?.conversation_id,
      });
      console.log('Memory saved:', result.summary);
    }
  } catch (error) {
    console.log('Memory check failed:', error);
  }
}

// ==================== 4. MOOD DETECTION ====================

export async function detectMood(message: string, voiceTone?: string): Promise<{
  score: number;
  primary: string;
  secondary: string | null;
  confidence: number;
  axisResponse: string;
}> {
  const prompt = `Analyze this message for emotional state.
Message: "${message}"
${voiceTone ? `Voice characteristics: ${voiceTone}` : ''}

Return JSON only:
{
  "score": 1-10,
  "primary": "stressed|anxious|tired|neutral|focused|happy|motivated|sad|angry",
  "secondary": "optional secondary emotion or null",
  "confidence": 0.0-1.0,
  "axisResponse": "how AXIS should adapt — shorter/gentler/push harder/match energy/etc"
}`;

  try {
    const response = await groqCall([{ role: 'user', content: prompt }], 0.1, 150);
    const result = JSON.parse(response);

    await saveMoodEntry({
      score: result.score,
      primary: result.primary,
      secondary: result.secondary,
      confidence: result.confidence,
      axisAdaptation: result.axisResponse,
      rawMessage: message,
    });

    return result;
  } catch {
    return { score: 5, primary: 'neutral', secondary: null, confidence: 0.5, axisResponse: 'standard' };
  }
}

// ==================== 5. PROACTIVE MESSAGE GENERATION ====================

export async function generateProactiveMessage(triggerType: string, description: string): Promise<string> {
  const profile = await getUserProfile();
  const personality = await getPersonalityState();
  const mainGoal = await getMainGoal();
  const recentMood = await getRecentMoodAverage(1);
  const timeContext = getTimeContext();

  const prompt = `You are AXIS. You just noticed: ${description}

User context:
- Name: ${profile?.name || 'User'} (AXIS calls them: ${personality?.nickname || profile?.name || 'User'})
- Current goal: ${mainGoal?.title || 'none'}
- Mood today: ${recentMood}/10
- Time: ${timeContext}
- Communication style: ${personality?.communication_style || 'direct'}

Write ONE short message AXIS would send right now.
- Max 2 sentences
- In their natural Nepali-English mixed style
- No lecture. No moral lesson. Just AXIS being real.
- Reference their actual goal or situation if relevant

Return only the message text. No quotes.`;

  try {
    const response = await groqCall([{ role: 'user', content: prompt }], 0.7, 100);
    return response.trim();
  } catch {
    return `Hey ${personality?.nickname || profile?.name || ''}. ${description}. Thought you should know.`;
  }
}

// ==================== 6. AUTO-JOURNAL GENERATION ====================

export async function generateDailyJournal(): Promise<void> {
  const profile = await getUserProfile();
  const todayConversations = await getRecentMessages(50);
  const todayMoods = await getTodayMoodEntries();
  const todayHabits = await getTodayHabits();
  const todayScreenTime = await getTodayScreenTime();
  const activeGoals = await getActiveGoals();

  const conversationSummary = todayConversations.length > 0
    ? `${todayConversations.length} messages exchanged`
    : 'No conversations today';

  const moodArc = todayMoods.map((m: any) => `${new Date(m.timestamp).getHours()}:00 ${m.primary_emotion} ${m.score}/10`).join(', ') || 'no mood data';

  const completedHabits = todayHabits.filter((h: any) => h.completed_today).map((h: any) => h.name).join(', ') || 'none';
  const missedHabits = todayHabits.filter((h: any) => !h.completed_today).map((h: any) => h.name).join(', ') || 'none';

  const screenSummary = todayScreenTime.map((s: any) => `${s.app}: ${s.minutes}min`).join(', ') || 'no data';

  const prompt = `You are AXIS. Write ${profile?.name || 'User'}'s journal entry for today.

DATA FROM TODAY:
Conversations: ${conversationSummary}
Mood arc: ${moodArc}
Habits completed: ${completedHabits}
Habits missed: ${missedHabits}
Screen time: ${screenSummary}
Active goals: ${activeGoals.map((g: any) => `${g.title}: ${g.progress}%`).join(', ') || 'none'}

Write as AXIS observing ${profile?.name || 'User'}'s day — not as ${profile?.name || 'User'} writing.
First person from AXIS's perspective. Honest. No sugarcoating. Note good and bad.
2-3 paragraphs. Nepali-English mixed naturally.`;

  try {
    const response = await groqCall([{ role: 'user', content: prompt }], 0.6, 500);
    await saveJournalEntry(response);
    console.log('Journal generated');
  } catch (error) {
    console.log('Journal generation failed:', error);
  }
}

// ==================== 7. MORNING BRIEFING ====================

export async function generateMorningBriefing(): Promise<string> {
  const profile = await getUserProfile();
  const personality = await getPersonalityState();
  const sleep = await getLastSleepEntry();
  const mainGoal = await getMainGoal();
  const missedYesterday = await getYesterdayMissedHabits();

  const sleepQuality = sleep?.hours >= 8 ? 'good' : sleep?.hours >= 6 ? 'okay' : 'rough';

  const prompt = `You are AXIS. ${profile?.name || 'User'} just woke up. Generate their morning briefing.

CONTEXT:
Sleep: ${sleep?.hours || '?'}h, quality: ${sleep?.quality || '?'}/10 — ${sleepQuality}
Main goal: ${mainGoal?.title || 'none set'} ${mainGoal?.days_left ? `(${mainGoal.days_left} days left)` : ''}
Missed yesterday: ${missedYesterday.join(', ') || 'nothing — clean day'}
AXIS nickname: ${personality?.nickname || profile?.name || 'User'}

Write a morning briefing. Spoken aloud via TTS so write it like speech, not text.
Start with sleep — honest. Cover goal. End with one thing to focus on.
Max 5 sentences. Nepali-English natural mix. JARVIS energy.`;

  try {
    const response = await groqCall([{ role: 'user', content: prompt }], 0.5, 200);
    return response;
  } catch {
    return `Good morning, ${personality?.nickname || profile?.name || 'User'}. Let's get to work.`;
  }
}

// ==================== 8. SMART CONTEXT WINDOW ====================

export async function buildConversationContext(currentMessage: string): Promise<{ role: string; content: string }[]> {
  const systemPrompt = await buildSystemPrompt();
  const recentMessages = await getRecentMessages(20);

  const context: { role: string; content: string }[] = [
    { role: 'system', content: systemPrompt },
  ];

  // Check if message references something old
  const needsMemorySearch = currentMessage.toLowerCase().includes('remember') ||
    currentMessage.toLowerCase().includes('before') ||
    currentMessage.toLowerCase().includes('last time') ||
    currentMessage.toLowerCase().includes('told you');

  if (needsMemorySearch) {
    const relevantMemories = await searchMemories(currentMessage);
    if (relevantMemories.length > 0) {
      context.push({
        role: 'system',
        content: `RELEVANT MEMORIES:\n${relevantMemories.join('\n')}`,
      });
    }
  }

  // Add conversation history
  for (const msg of recentMessages) {
    context.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  }

  // Add current message
  context.push({ role: 'user', content: currentMessage });

  return context;
}

// ==================== 9. CHAT PROCESSING ====================

export async function processMessage(userMessage: string): Promise<string> {
  try {
    const conversationId = await getTodayConversationId();
    const sessionId = await startSession();

    // Save user message
    await saveMessage({ conversationId, sessionId, role: 'user', content: userMessage });
    await incrementConversationCount();

    // Detect mood
    const mood = await detectMood(userMessage);

    // Build smart context
    const context = await buildConversationContext(userMessage);

    // Generate response
    let response: string;
  try {
    response = await groqCall(context, 0.7, 300);
    if (!response || response.trim().length === 0) throw new Error('Empty response from Groq');
  } catch (error: any) {
    console.log('Groq call failed:', error?.message || error);
    response = `Signal lost. Couldn't reach my brain. Try again in a moment.`;
  }

  // Save AXIS response
  await saveMessage({
    conversationId, sessionId, role: 'axis', content: response,
    moodScore: mood.score, moodPrimary: mood.primary,
    moodConfidence: mood.confidence, moodAxisResponse: mood.axisResponse,
  });

  // End session
  await endSession(sessionId);

  // Background: evolve personality and check for memories (don't await)
  const sessionMessages = await getRecentMessages(5);
  evolvePersonality(sessionMessages).catch((e) => console.log('Evolve failed:', e?.message));
  checkForMemoryHighlight(sessionMessages).catch((e) => console.log('Memory check failed:', e?.message));

  return response;
  } catch (outerError: any) {
    console.log('PROCESS MESSAGE FAILED:', outerError?.message || outerError);
    throw outerError;
  }
}

// ==================== OFFLINE FALLBACK ====================

function getOfflineResponse(): string {
  const responses = [
    "I'm here. Always.",
    "Give me a moment. Processing.",
    "Interesting. Tell me more.",
    "I need to think about that properly.",
    "I see. Continue.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}
