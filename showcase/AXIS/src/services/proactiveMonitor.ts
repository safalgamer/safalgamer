import * as Battery from 'expo-battery';
import { Platform, AppState, AppStateStatus } from 'react-native';
import { checkProactiveTriggers, Trigger, onScreenOn, onScreenOff, onMovementDetected } from './proactiveTriggers';
import { getInactivityDuration, isPhonePickedUp } from './sensors';

/**
 * AXIS Proactive Monitor
 * The brain that runs 24/7, checking all triggers and deciding when to speak.
 * AXIS doesn't wait to be asked. It watches, it learns, it speaks when it matters.
 */

type ProactiveCallback = (trigger: Trigger) => void;

let monitoringInterval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: any = null;
let callback: ProactiveCallback | null = null;
let lastBatteryLevel: number = 100;
let screenOnTime: number | null = null;

export function startProactiveMonitoring(onTrigger: ProactiveCallback): void {
  callback = onTrigger;

  // Monitor app state (foreground/background)
  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // Check triggers every 60 seconds
  monitoringInterval = setInterval(() => {
    checkAllTriggers();
  }, 60000);

  // Initial battery check
  checkBattery();

  console.log('AXIS proactive monitoring started');
}

export function stopProactiveMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
  callback = null;
}

function handleAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'active') {
    screenOnTime = Date.now();
    onScreenOn();
  } else {
    screenOnTime = null;
    onScreenOff();
  }
}

async function checkBattery(): Promise<void> {
  try {
    const level = await Battery.getBatteryLevelAsync();
    lastBatteryLevel = Math.round(level * 100);

    if (lastBatteryLevel <= 15) {
      callback?.({
        type: 'battery',
        message: `Battery at ${lastBatteryLevel}%. Plug in soon or I'll go quiet to save power.`,
        priority: 'medium',
      });
    }
  } catch {
    // Battery API not available
  }
}

function checkAllTriggers(): void {
  // Check proactive triggers from the triggers module
  const triggers = checkProactiveTriggers();
  triggers.forEach((trigger) => {
    callback?.(trigger);
  });

  // Check battery
  checkBattery();

  // Check inactivity
  const inactivity = getInactivityDuration();
  if (inactivity > 40 * 60 * 1000) { // 40 minutes
    callback?.({
      type: 'inactivity',
      message: "You haven't moved in a while. Stand up. Walk. Your body needs it.",
      priority: 'low',
    });
  }
}

export function getBatteryLevel(): number {
  return lastBatteryLevel;
}

export function isScreenOn(): boolean {
  return screenOnTime !== null;
}

export function getScreenOnDuration(): number {
  if (!screenOnTime) return 0;
  return Date.now() - screenOnTime;
}
