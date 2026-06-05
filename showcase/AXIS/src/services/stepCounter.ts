import { Pedometer } from 'expo-sensors';

/**
 * AXIS Step Counter
 * Uses device pedometer via expo-sensors.
 * No API key. No credit card. Device hardware only.
 */

let stepCount: number = 0;
let isAvailable: boolean = false;
let subscription: any = null;

export async function initStepCounter(): Promise<boolean> {
  try {
    isAvailable = await Pedometer.isAvailableAsync();
    if (!isAvailable) {
      console.log('Pedometer not available on this device');
      return false;
    }

    // Get today's steps so far
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();

    const result = await Pedometer.getStepCountAsync(start, end);
    stepCount = result.steps;

    // Watch for new steps
    subscription = Pedometer.watchStepCount((result) => {
      stepCount = result.steps;
    });

    return true;
  } catch (error) {
    console.log('Step counter init failed:', error);
    return false;
  }
}

export function getTodaySteps(): number {
  return stepCount;
}

export function isStepCounterAvailable(): boolean {
  return isAvailable;
}

export function stopStepCounter(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
}
