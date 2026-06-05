import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function createTables(database: SQLite.SQLiteDatabase): Promise<void> {
  const tables = [
    `CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY DEFAULT 'user', name TEXT NOT NULL, age INTEGER,
      created_at TEXT NOT NULL, interaction_mode TEXT DEFAULT 'chat',
      wake_word TEXT DEFAULT 'AXIS', total_conversations INTEGER DEFAULT 0, last_active TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS personality_state (
      id TEXT PRIMARY KEY DEFAULT 'axis', nickname TEXT, nickname_coined INTEGER DEFAULT 0,
      communication_style TEXT DEFAULT 'direct and calm, JARVIS-like', style_examples TEXT DEFAULT '[]',
      user_quirks TEXT DEFAULT '', core_values TEXT DEFAULT '',
      opinion_on_discipline TEXT DEFAULT 'still observing', has_disagreed INTEGER DEFAULT 0,
      has_praised_meaningfully INTEGER DEFAULT 0, evolution_count INTEGER DEFAULT 0,
      last_updated TEXT, notable_this_session TEXT DEFAULT '', updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY, date TEXT NOT NULL, summary TEXT,
      message_count INTEGER DEFAULT 0, started_at TEXT, ended_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY, conversation_id TEXT NOT NULL, session_id TEXT,
      role TEXT NOT NULL, content TEXT NOT NULL, timestamp TEXT NOT NULL,
      mood_score INTEGER, mood_primary TEXT, mood_confidence REAL,
      mood_axis_response TEXT, is_proactive INTEGER DEFAULT 0, trigger_type TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS highlighted_memories (
      id TEXT PRIMARY KEY, date TEXT NOT NULL, summary TEXT NOT NULL,
      category TEXT NOT NULL, session_id TEXT, conversation_id TEXT, created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS mood_entries (
      id TEXT PRIMARY KEY, date TEXT NOT NULL, timestamp TEXT NOT NULL,
      score INTEGER NOT NULL, primary_emotion TEXT NOT NULL,
      secondary_emotion TEXT, confidence REAL, axis_adaptation TEXT, raw_message TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS sleep_entries (
      id TEXT PRIMARY KEY, date TEXT NOT NULL, duration REAL NOT NULL,
      quality INTEGER NOT NULL, sleep_time TEXT NOT NULL, wake_time TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT NOT NULL,
      streak INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0,
      completed_today INTEGER DEFAULT 0, history TEXT DEFAULT '{}'
    )`,
    `CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, text TEXT NOT NULL,
      deadline TEXT, progress INTEGER DEFAULT 0, is_main_goal INTEGER DEFAULT 0,
      days_left INTEGER, created_at TEXT NOT NULL, completed_at TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS location_logs (
      id TEXT PRIMARY KEY, zone_name TEXT NOT NULL, entry_time TEXT NOT NULL, exit_time TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS screen_activity (
      id TEXT PRIMARY KEY, package_name TEXT NOT NULL, app_name TEXT NOT NULL,
      duration INTEGER NOT NULL, timestamp TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY, date TEXT NOT NULL UNIQUE, content TEXT NOT NULL,
      generated_by_axis INTEGER DEFAULT 1, created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS guardian_events (
      id TEXT PRIMARY KEY, timestamp TEXT NOT NULL, type TEXT NOT NULL,
      details TEXT NOT NULL, face_matched INTEGER
    )`,
    `CREATE TABLE IF NOT EXISTS trusted_contacts (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, can_auto_reply INTEGER DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS location_zones (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, lat REAL NOT NULL,
      lng REAL NOT NULL, radius INTEGER NOT NULL, behavior TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, started_at TEXT NOT NULL, ended_at TEXT,
      message_count INTEGER DEFAULT 0, evolved INTEGER DEFAULT 0
    )`,
  ];

  for (const sql of tables) {
    try {
      await database.runAsync(sql);
    } catch (e: any) {
      console.log('Table creation warning:', e?.message);
    }
  }

  // Init personality if not exists
  try {
    const existing = await database.getFirstAsync('SELECT id FROM personality_state WHERE id = ?', ['axis']);
    if (!existing) {
      await database.runAsync(
        `INSERT INTO personality_state (id, communication_style, updated_at) VALUES (?, ?, ?)`,
        ['axis', 'direct and calm, JARVIS-like', new Date().toISOString()]
      );
    }
  } catch {}
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const database = await SQLite.openDatabaseAsync('axis_memory_v2.db');
    await createTables(database);
    db = database;
    initPromise = null;
    console.log('AXIS database initialized');
    return database;
  })();

  return initPromise;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!db) return initDatabase();
  return db;
}

// ==================== USER PROFILE ====================

export async function saveUserProfile(profile: { name: string; age?: number; interactionMode: string }): Promise<void> {
  const database = await getDb();
  await database.runAsync(
    'INSERT OR REPLACE INTO user_profile (id, name, age, created_at, interaction_mode, last_active) VALUES (?, ?, ?, ?, ?, ?)',
    ['user', profile.name, profile.age || null, new Date().toISOString(), profile.interactionMode, new Date().toISOString()]
  );
}

export async function getUserProfile(): Promise<any> {
  const database = await getDb();
  return database.getFirstAsync('SELECT * FROM user_profile WHERE id = ?', ['user']);
}

export async function isOnboarded(): Promise<boolean> {
  try {
    const profile = await getUserProfile();
    return !!profile;
  } catch { return false; }
}

export async function incrementConversationCount(): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync('UPDATE user_profile SET total_conversations = total_conversations + 1, last_active = ? WHERE id = ?',
      [new Date().toISOString(), 'user']);
  } catch {}
}

// ==================== PERSONALITY STATE ====================

export async function getPersonalityState(): Promise<any> {
  const database = await getDb();
  return database.getFirstAsync('SELECT * FROM personality_state WHERE id = ?', ['axis']);
}

export async function updatePersonalityState(updates: Record<string, any>): Promise<void> {
  try {
    const database = await getDb();
    const fields: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(updates)) {
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = ?`);
      values.push(typeof value === 'object' ? JSON.stringify(value) : value);
    }
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push('axis');
    await database.runAsync(`UPDATE personality_state SET ${fields.join(', ')} WHERE id = ?`, values);
  } catch {}
}

// ==================== SESSIONS ====================

export async function startSession(): Promise<string> {
  const database = await getDb();
  const id = `session-${Date.now()}`;
  await database.runAsync('INSERT INTO sessions (id, started_at) VALUES (?, ?)', [id, new Date().toISOString()]);
  return id;
}

export async function endSession(sessionId: string): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync('UPDATE sessions SET ended_at = ? WHERE id = ?', [new Date().toISOString(), sessionId]);
  } catch {}
}

export async function markSessionEvolved(sessionId: string): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync('UPDATE sessions SET evolved = 1 WHERE id = ?', [sessionId]);
  } catch {}
}

export async function wasSessionEvolved(sessionId: string): Promise<boolean> {
  try {
    const database = await getDb();
    const result = await database.getFirstAsync<{ evolved: number }>('SELECT evolved FROM sessions WHERE id = ?', [sessionId]);
    return result?.evolved === 1;
  } catch { return false; }
}

// ==================== MESSAGES ====================

export async function saveMessage(data: {
  conversationId: string; sessionId?: string; role: string; content: string;
  moodScore?: number; moodPrimary?: string; moodConfidence?: number;
  moodAxisResponse?: string; isProactive?: boolean; triggerType?: string;
}): Promise<void> {
  const database = await getDb();
  const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  await database.runAsync(
    `INSERT INTO messages (id, conversation_id, session_id, role, content, timestamp, mood_score, mood_primary, mood_confidence, mood_axis_response, is_proactive, trigger_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, data.conversationId, data.sessionId || null, data.role, data.content, new Date().toISOString(),
     data.moodScore || null, data.moodPrimary || null, data.moodConfidence || null,
     data.moodAxisResponse || null, data.isProactive ? 1 : 0, data.triggerType || null]
  );
}

export async function getRecentMessages(limit: number = 20): Promise<any[]> {
  const database = await getDb();
  const rows = await database.getAllAsync<any>('SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?', [limit]);
  return rows.reverse();
}

export async function getTodayConversationId(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];
  const database = await getDb();
  const existing = await database.getFirstAsync<{ id: string }>('SELECT id FROM conversations WHERE date = ?', [today]);
  if (existing) return existing.id;
  const id = `conv-${today}`;
  await database.runAsync('INSERT INTO conversations (id, date, started_at) VALUES (?, ?, ?)', [id, today, new Date().toISOString()]);
  return id;
}

export async function getConversationMessages(conversationId: string): Promise<any[]> {
  const database = await getDb();
  return database.getAllAsync('SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC', [conversationId]);
}

// ==================== HIGHLIGHTED MEMORIES ====================

export async function saveHighlightedMemory(data: { summary: string; category: string; sessionId?: string; conversationId?: string }): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync(
      'INSERT INTO highlighted_memories (id, date, summary, category, session_id, conversation_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [`mem-${Date.now()}`, new Date().toISOString().split('T')[0], data.summary, data.category, data.sessionId || null, data.conversationId || null, new Date().toISOString()]
    );
  } catch {}
}

export async function getHighlightedMemories(limit: number = 10): Promise<any[]> {
  try {
    const database = await getDb();
    return database.getAllAsync('SELECT * FROM highlighted_memories ORDER BY created_at DESC LIMIT ?', [limit]);
  } catch { return []; }
}

export async function searchMemories(query: string, limit: number = 5): Promise<string[]> {
  try {
    const database = await getDb();
    const memories = await database.getAllAsync<any>('SELECT * FROM highlighted_memories ORDER BY created_at DESC LIMIT 50');
    const queryLower = query.toLowerCase();
    const words = queryLower.split(' ').filter((w: string) => w.length > 3);
    const matches = memories.filter((m: any) => words.some((w: string) => (m.summary || '').toLowerCase().includes(w)));
    return matches.slice(0, limit).map((m: any) => `${m.date}: ${m.summary}`);
  } catch { return []; }
}

// ==================== MOOD ====================

export async function saveMoodEntry(data: { score: number; primary: string; secondary?: string; confidence: number; axisAdaptation: string; rawMessage: string }): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync(
      'INSERT INTO mood_entries (id, date, timestamp, score, primary_emotion, secondary_emotion, confidence, axis_adaptation, raw_message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [`mood-${Date.now()}`, new Date().toISOString().split('T')[0], new Date().toISOString(), data.score, data.primary, data.secondary || null, data.confidence, data.axisAdaptation, data.rawMessage]
    );
  } catch {}
}

export async function getRecentMoodAverage(days: number = 7): Promise<number> {
  try {
    const database = await getDb();
    const result = await database.getFirstAsync<{ avg: number }>("SELECT AVG(score) as avg FROM mood_entries WHERE date >= date('now', ?)", [`-${days} days`]);
    return Math.round(result?.avg || 5);
  } catch { return 5; }
}

export async function getTodayMoodEntries(): Promise<any[]> {
  try {
    const database = await getDb();
    return database.getAllAsync('SELECT * FROM mood_entries WHERE date = ? ORDER BY timestamp ASC', [new Date().toISOString().split('T')[0]]);
  } catch { return []; }
}

// ==================== SLEEP ====================

export async function saveSleepEntry(data: { duration: number; quality: number; sleepTime: string; wakeTime: string }): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync(
      'INSERT INTO sleep_entries (id, date, duration, quality, sleep_time, wake_time) VALUES (?, ?, ?, ?, ?, ?)',
      [`sleep-${Date.now()}`, new Date().toISOString().split('T')[0], data.duration, data.quality, data.sleepTime, data.wakeTime]
    );
  } catch {}
}

export async function getLastSleepEntry(): Promise<any> {
  try {
    const database = await getDb();
    return database.getFirstAsync('SELECT * FROM sleep_entries ORDER BY date DESC LIMIT 1');
  } catch { return null; }
}

// ==================== GOALS ====================

export async function saveGoal(data: { title: string; text: string; deadline?: string; isMainGoal?: boolean }): Promise<void> {
  try {
    const database = await getDb();
    let daysLeft = data.deadline ? Math.ceil((new Date(data.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
    await database.runAsync(
      'INSERT INTO goals (id, title, text, deadline, is_main_goal, days_left, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [`goal-${Date.now()}`, data.title, data.text, data.deadline || null, data.isMainGoal ? 1 : 0, daysLeft, new Date().toISOString()]
    );
  } catch {}
}

export async function getActiveGoals(): Promise<any[]> {
  try {
    const database = await getDb();
    return database.getAllAsync('SELECT * FROM goals WHERE progress < 100 ORDER BY is_main_goal DESC, created_at DESC');
  } catch { return []; }
}

export async function getMainGoal(): Promise<any> {
  try {
    const database = await getDb();
    return database.getFirstAsync('SELECT * FROM goals WHERE is_main_goal = 1 AND progress < 100 ORDER BY created_at DESC LIMIT 1');
  } catch { return null; }
}

// ==================== HABITS ====================

export async function getTodayHabits(): Promise<any[]> {
  try {
    const database = await getDb();
    return database.getAllAsync('SELECT * FROM habits ORDER BY streak DESC');
  } catch { return []; }
}

export async function getLongestActiveStreak(): Promise<any> {
  try {
    const database = await getDb();
    return database.getFirstAsync('SELECT name, streak as days FROM habits WHERE streak > 0 ORDER BY streak DESC LIMIT 1');
  } catch { return null; }
}

export async function saveHabit(name: string, icon: string): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync('INSERT INTO habits (id, name, icon) VALUES (?, ?, ?)', [`habit-${Date.now()}`, name, icon]);
  } catch {}
}

export async function completeHabit(id: string): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync('UPDATE habits SET streak = streak + 1, completed_today = 1 WHERE id = ?', [id]);
  } catch {}
}

// ==================== JOURNAL ====================

export async function saveJournalEntry(content: string): Promise<void> {
  try {
    const database = await getDb();
    const date = new Date().toISOString().split('T')[0];
    await database.runAsync(
      'INSERT OR REPLACE INTO journal_entries (id, date, content, generated_by_axis, created_at) VALUES (?, ?, ?, 1, ?)',
      [`journal-${date}`, date, content, new Date().toISOString()]
    );
  } catch {}
}

export async function getJournalEntries(days: number = 7): Promise<any[]> {
  try {
    const database = await getDb();
    return database.getAllAsync('SELECT * FROM journal_entries ORDER BY date DESC LIMIT ?', [days]);
  } catch { return []; }
}

// ==================== SCREEN TIME ====================

export async function getTodayScreenTime(): Promise<any[]> {
  try {
    const database = await getDb();
    const today = new Date().toISOString().split('T')[0];
    return database.getAllAsync('SELECT app_name as app, SUM(duration) / 60000 as minutes FROM screen_activity WHERE date(timestamp) = ? GROUP BY app_name ORDER BY minutes DESC', [today]);
  } catch { return []; }
}

export async function getYesterdayMissedHabits(): Promise<string[]> {
  try {
    const database = await getDb();
    const habits = await database.getAllAsync<any>('SELECT name FROM habits WHERE completed_today = 0');
    return habits.map((h: any) => h.name);
  } catch { return []; }
}
