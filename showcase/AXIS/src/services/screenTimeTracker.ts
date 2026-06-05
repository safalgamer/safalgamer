import { AppState, AppStateStatus } from 'react-native';
import { getDb } from './database';

/**
 * AXIS Screen Time Tracker
 * Tracks how long the app is in the foreground using AppState.
 * No native module needed. Works immediately.
 */

let appStateSubscription: any = null;
let foregroundStartTime: number | null = null;
let totalForegroundMs: number = 0;

export function startScreenTimeTracking(): void {
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // If app is currently active, start tracking
  if (AppState.currentState === 'active') {
    foregroundStartTime = Date.now();
  }
}

export function stopScreenTimeTracking(): void {
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  // Save any remaining time
  if (foregroundStartTime) {
    totalForegroundMs += Date.now() - foregroundStartTime;
    foregroundStartTime = null;
  }
}

function handleAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'active') {
    // App came to foreground
    foregroundStartTime = Date.now();
  } else if (foregroundStartTime) {
    // App went to background or inactive
    const duration = Date.now() - foregroundStartTime;
    totalForegroundMs += duration;
    foregroundStartTime = null;

    // Save to database
    saveScreenActivity(duration);
  }
}

async function saveScreenActivity(durationMs: number): Promise<void> {
  try {
    const db = await getDb();
    const id = `screen-${Date.now()}`;
    await db.runAsync(
      'INSERT INTO screen_activity (id, package_name, app_name, duration, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, 'com.axis.app', 'AXIS', durationMs, new Date().toISOString()]
    );
  } catch (error) {
    // Silent fail — screen time tracking shouldn't break the app
  }
}

export function getTodayScreenTimeMs(): number {
  return totalForegroundMs + (foregroundStartTime ? Date.now() - foregroundStartTime : 0);
}

export function getTodayScreenTimeFormatted(): string {
  const ms = getTodayScreenTimeMs();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}m`;
}
