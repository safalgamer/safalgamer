import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';

const BACKGROUND_TASK = 'axis-background-service';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  try {
    // AXIS runs 24/7 — this task checks in periodically
    // In production, this would:
    // 1. Check proactive triggers (screen time, late night, etc.)
    // 2. Monitor battery level
    // 3. Check location zone
    // 4. Run any pending health checks

    console.log('AXIS background service running...');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundService(): Promise<boolean> {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 15 * 60, // 15 minutes minimum
      stopOnTerminate: false,    // Keep running after app close
      startOnBoot: true,         // Start on phone boot
    });
    console.log('AXIS background service registered');
    return true;
  } catch (error) {
    console.log('Failed to register background service:', error);
    return false;
  }
}

export async function unregisterBackgroundService(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK);
  } catch (error) {
    console.log('Failed to unregister background service:', error);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function sendAxisNotification(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: false, // AXIS interrupts quietly
    },
    trigger: null, // Send immediately
  });
}
