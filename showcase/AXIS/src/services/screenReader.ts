import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

/**
 * AXIS Screen Reading Service
 * Uses Android Accessibility Services to see what app the user is in,
 * how long they've been there, and what content is visible.
 * 
 * AXIS does not announce it is watching. It simply knows.
 * 
 * NOTE: This requires a native Android module.
 * The AccessibilityService must be registered in AndroidManifest.xml
 * and the user must enable it in Settings > Accessibility > AXIS.
 */

interface ScreenData {
  packageName: string;
  appName: string;
  className: string;
  text?: string;
  contentDescription?: string;
  timestamp: number;
}

interface AppUsageData {
  packageName: string;
  appName: string;
  startTime: number;
  duration: number;
}

// In-memory tracking
let currentApp: string | null = null;
let currentAppStartTime: number = 0;
let appUsageLog: AppUsageData[] = [];
let isServiceEnabled = false;

// App name mapping for common packages
const APP_NAMES: Record<string, string> = {
  'com.instagram.android': 'Instagram',
  'com.facebook.katana': 'Facebook',
  'com.twitter.android': 'Twitter',
  'com.whatsapp': 'WhatsApp',
  'com.google.android.youtube': 'YouTube',
  'com.spotify.music': 'Spotify',
  'com.android.chrome': 'Chrome',
  'com.snapchat.android': 'Snapchat',
  'com.tiktok': 'TikTok',
  'com.reddit.frontpage': 'Reddit',
  'com.discord': 'Discord',
  'com.slack': 'Slack',
  'com.google.android.gm': 'Gmail',
  'com.android.settings': 'Settings',
  'com.android.camera': 'Camera',
  'com.google.android.apps.photos': 'Photos',
  'com.android.gallery': 'Gallery',
  'com.termux': 'Terminal',
  'com.google.android.apps.docs': 'Google Docs',
};

export function getAppName(packageName: string): string {
  return APP_NAMES[packageName] || packageName.split('.').pop() || packageName;
}

export function isScreenReadingEnabled(): boolean {
  return isServiceEnabled;
}

export function setScreenReadingEnabled(enabled: boolean): void {
  isServiceEnabled = enabled;
}

export function getCurrentApp(): { packageName: string; appName: string; duration: number } | null {
  if (!currentApp) return null;
  return {
    packageName: currentApp,
    appName: getAppName(currentApp),
    duration: Date.now() - currentAppStartTime,
  };
}

export function getAppUsageLog(): AppUsageData[] {
  return [...appUsageLog];
}

export function getTotalScreenTimeToday(): number {
  const today = new Date().toISOString().split('T')[0];
  return appUsageLog
    .filter((entry) => new Date(entry.startTime).toISOString().split('T')[0] === today)
    .reduce((total, entry) => total + entry.duration, 0);
}

export function getTopAppsToday(limit: number = 5): { app: string; minutes: number }[] {
  const today = new Date().toISOString().split('T')[0];
  const todayLog = appUsageLog.filter(
    (entry) => new Date(entry.startTime).toISOString().split('T')[0] === today
  );

  const appTotals: Record<string, number> = {};
  todayLog.forEach((entry) => {
    const name = getAppName(entry.packageName);
    appTotals[name] = (appTotals[name] || 0) + entry.duration;
  });

  return Object.entries(appTotals)
    .map(([app, ms]) => ({ app, minutes: Math.round(ms / 60000) }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, limit);
}

// Called from native AccessibilityService when app changes
export function onAppChanged(packageName: string): void {
  if (!isServiceEnabled) return;

  const now = Date.now();

  // Log previous app usage
  if (currentApp) {
    appUsageLog.push({
      packageName: currentApp,
      appName: getAppName(currentApp),
      startTime: currentAppStartTime,
      duration: now - currentAppStartTime,
    });
  }

  currentApp = packageName;
  currentAppStartTime = now;
}

// Called from native AccessibilityService with screen content
export function onScreenContentChanged(data: ScreenData): void {
  if (!isServiceEnabled) return;
  // AXIS silently processes screen content for context
  // This data is used to understand what the user is doing
}

// Export for use in proactive triggers
export function isGalleryOrMessagesOpen(): boolean {
  if (!currentApp) return false;
  const sensitivePackages = [
    'com.android.gallery',
    'com.google.android.apps.photos',
    'com.android.mms',
    'com.google.android.apps.messaging',
    'com.whatsapp',
    'com.instagram.android',
  ];
  return sensitivePackages.includes(currentApp);
}
