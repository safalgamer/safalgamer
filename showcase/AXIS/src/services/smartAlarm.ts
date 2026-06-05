import { saveSleepEntry } from './database';

/**
 * AXIS Smart Alarm System
 * If an alarm is set, AXIS monitors the sleep cycle and wakes the user
 * at the lightest sleep phase within a 20-minute window before the alarm time.
 * 
 * AXIS speaks first — before any other sound or notification.
 */

interface AlarmConfig {
  enabled: boolean;
  targetTime: string;       // HH:MM format
  windowMinutes: number;    // Wake window before target (default: 20)
  lastNightSleepTime: string | null;
  sleepQuality: number;
}

interface MorningBriefing {
  greeting: string;
  weather?: string;
  schedule: string[];
  mainGoal: string;
  moodQuestion: string;
}

let alarmConfig: AlarmConfig = {
  enabled: false,
  targetTime: '07:00',
  windowMinutes: 20,
  lastNightSleepTime: null,
  sleepQuality: 0,
};

export function setAlarm(time: string, windowMinutes: number = 20): void {
  alarmConfig.enabled = true;
  alarmConfig.targetTime = time;
  alarmConfig.windowMinutes = windowMinutes;
}

export function disableAlarm(): void {
  alarmConfig.enabled = false;
}

export function isAlarmEnabled(): boolean {
  return alarmConfig.enabled;
}

export function recordSleepTime(): void {
  alarmConfig.lastNightSleepTime = new Date().toISOString();
}

export function getSleepDuration(): number {
  if (!alarmConfig.lastNightSleepTime) return 0;
  const sleepTime = new Date(alarmConfig.lastNightSleepTime).getTime();
  const now = Date.now();
  return (now - sleepTime) / (1000 * 60 * 60); // hours
}

// Calculate optimal wake time within the window
export function getOptimalWakeTime(): Date {
  const [hours, minutes] = alarmConfig.targetTime.split(':').map(Number);
  const targetDate = new Date();
  targetDate.setHours(hours, minutes, 0, 0);

  // Subtract the window to get earliest wake time
  const earliestWake = new Date(targetDate.getTime() - alarmConfig.windowMinutes * 60 * 1000);

  // In a real implementation, this would use accelerometer data
  // to detect the lightest sleep phase. For now, we randomize within the window.
  const randomOffset = Math.floor(Math.random() * alarmConfig.windowMinutes * 60 * 1000);
  const optimalTime = new Date(earliestWake.getTime() + randomOffset);

  return optimalTime;
}

// Generate morning briefing based on sleep quality and context
export function generateMorningBriefing(
  userName: string,
  sleepHours: number,
  mainGoal: string,
  schedule: string[]
): MorningBriefing {
  const hour = new Date().getHours();
  let greeting: string;

  if (sleepHours >= 8) {
    greeting = `Good morning, ${userName}. You slept well. ${sleepHours.toFixed(1)} hours. You're ready.`;
  } else if (sleepHours >= 6) {
    greeting = `Morning, ${userName}. ${sleepHours.toFixed(1)} hours. Not ideal, but you'll manage.`;
  } else {
    greeting = `${userName}. You slept ${sleepHours.toFixed(1)} hours. Take it easy today. I mean it.`;
  }

  return {
    greeting,
    schedule: schedule.length > 0 ? schedule : ['No events scheduled. Free day.'],
    mainGoal: mainGoal || 'Set a goal for today.',
    moodQuestion: 'How are you feeling?',
  };
}

// Night behavior — called when user tells AXIS they're going to sleep
// NOT called automatically based on phone inactivity
export function onUserSaidGoodnight(): void {
  recordSleepTime();
  console.log('User said goodnight. Recording sleep time.');
}

// Export for compatibility
export const onUserFallAsleep = onUserSaidGoodnight;

// When the user picks up the phone in the morning
export async function onMorningWakeUp(
  userName: string,
  mainGoal: string,
  schedule: string[]
): Promise<string> {
  const sleepHours = getSleepDuration();
  const briefing = generateMorningBriefing(userName, sleepHours, mainGoal, schedule);

  // Save sleep entry
  await saveSleepEntry({
    duration: sleepHours,
    quality: sleepHours >= 7 ? 8 : sleepHours >= 6 ? 6 : 4,
    sleepTime: alarmConfig.lastNightSleepTime || new Date().toISOString(),
    wakeTime: new Date().toISOString(),
  });

  // Build the full morning message
  let message = briefing.greeting;

  if (briefing.schedule.length > 0 && briefing.schedule[0] !== 'No events scheduled. Free day.') {
    message += ` ${briefing.schedule[0]}`;
  }

  if (briefing.mainGoal !== 'Set a goal for today.') {
    message += ` Main goal: ${briefing.mainGoal}.`;
  }

  message += ` ${briefing.moodQuestion}`;

  return message;
}
