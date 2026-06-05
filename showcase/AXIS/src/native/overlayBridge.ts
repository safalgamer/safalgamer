import { NativeModules, Platform } from 'react-native';

const { AxisOverlay } = NativeModules;

/**
 * AXIS Overlay Bridge
 * Makes the orb stay on screen even when the app is minimized.
 * Tap the orb to reopen AXIS. Drag to reposition.
 */

export function showOverlay(): void {
  if (Platform.OS === 'android' && AxisOverlay) {
    AxisOverlay.showOverlay();
  }
}

export function hideOverlay(): void {
  if (Platform.OS === 'android' && AxisOverlay) {
    AxisOverlay.hideOverlay();
  }
}

export async function isOverlayRunning(): Promise<boolean> {
  if (Platform.OS === 'android' && AxisOverlay) {
    return AxisOverlay.isOverlayRunning();
  }
  return false;
}

export async function canDrawOverlays(): Promise<boolean> {
  if (Platform.OS === 'android' && AxisOverlay) {
    return AxisOverlay.canDrawOverlays();
  }
  return false;
}

export function requestOverlayPermission(): void {
  if (Platform.OS === 'android' && AxisOverlay) {
    AxisOverlay.requestOverlayPermission();
  }
}
