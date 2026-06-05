import { getDb, saveMoodEntry, saveGoal, saveHabit } from './database';

/**
 * AXIS Seed Data
 * Called once after onboarding to populate initial data
 * so the UI isn't empty when the user first opens the app.
 */

export async function seedInitialData(userName: string): Promise<void> {
  const db = await getDb();

  // Check if already seeded
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM mood_entries');
  if (existing && existing.count > 0) return;

  // Seed initial mood (neutral starting point)
  await saveMoodEntry({
    score: 5,
    primary: 'neutral',
    confidence: 0.5,
    axisAdaptation: 'standard',
    rawMessage: 'Initial onboarding',
  });

  // Seed a starter goal
  await saveGoal({
    title: 'Get started with AXIS',
    text: 'Use AXIS for 3 days straight to build the habit',
    isMainGoal: true,
  });

  // Seed starter habits
  await saveHabit('Use AXIS daily', 'brain');
  await saveHabit('Set a goal for today', 'target');
  await saveHabit('Check your mood', 'heart');

  console.log('Initial data seeded for', userName);
}
