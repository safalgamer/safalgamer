import { Platform } from 'react-native';

// Proactive trigger thresholds
const TRIGGERS = {
  SCREEN_TIME_MS: 2 * 60 * 60 * 1000,     // 2 hours continuous
  INACTIVITY_MS: 40 * 60 * 1000,           // 40 minutes no movement
  LATE_NIGHT_HOUR: 2,                        // After 2am
  BATTERY_CRITICAL: 15,                      // 15% battery
};

interface TriggerState {
  screenOnSince: number | null;
  lastMovement: number;
  lastCheckIn: number;
}

let state: TriggerState = {
  screenOnSince: null,
  lastMovement: Date.now(),
  lastCheckIn: 0,
};

export type TriggerType =
  | 'screen_time'
  | 'late_night'
  | 'inactivity'
  | 'deadline'
  | 'battery'
  | 'check_in'
  | 'location_change'
  | 'habit_nudge';

export interface Trigger {
  type: TriggerType;
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export function checkProactiveTriggers(): Trigger[] {
  const triggers: Trigger[] = [];
  const now = Date.now();
  const hour = new Date().getHours();

  // Screen time trigger
  if (state.screenOnSince && (now - state.screenOnSince) > TRIGGERS.SCREEN_TIME_MS) {
    triggers.push({
      type: 'screen_time',
      message: "You've been on your phone for over 2 hours straight. Your eyes need a break.",
      priority: 'medium',
    });
  }

  // Late night trigger
  if (hour >= TRIGGERS.LATE_NIGHT_HOUR && hour < 6) {
    triggers.push({
      type: 'late_night',
      message: "It's past 2am. Your body needs rest. Everything else can wait until morning.",
      priority: 'high',
    });
  }

  // Inactivity trigger
  if ((now - state.lastMovement) > TRIGGERS.INACTIVITY_MS) {
    triggers.push({
      type: 'inactivity',
      message: "You haven't moved in over 40 minutes. Stand up. Stretch. Walk for a bit.",
      priority: 'low',
    });
  }

  return triggers;
}

export function onScreenOn(): void {
  if (!state.screenOnSince) {
    state.screenOnSince = Date.now();
  }
}

export function onScreenOff(): void {
  state.screenOnSince = null;
}

export function onMovementDetected(): void {
  state.lastMovement = Date.now();
}

export function getLastTriggerTime(): number {
  return state.lastCheckIn;
}

export function resetTriggerTimer(): void {
  state.lastCheckIn = Date.now();
}
