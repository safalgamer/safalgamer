/**
 * AXIS Guardian Mode
 * When someone else picks up your phone, AXIS detects it.
 * Silent face recognition — checks if the face matches the owner.
 * 
 * AXIS does not announce it is watching.
 * It simply knows. And acts silently.
 * 
 * Note: Face detection uses expo-camera's onFacesDetected callback.
 * No deprecated expo-face-detector needed.
 */

interface FaceData {
  faceID?: number;
  bounds: {
    origin: { x: number; y: number };
    size: { width: number; height: number };
  };
  rollAngle?: number;
  yawAngle?: number;
}

interface GuardianState {
  isActive: boolean;
  isStrangerDetected: boolean;
  ownerFaceDescriptor: number[] | null;
  lastFaceCheck: number;
  intrusionLog: IntrusionEvent[];
}

interface IntrusionEvent {
  id: string;
  timestamp: string;
  type: 'stranger_detected' | 'app_blocked' | 'phone_locked' | 'face_checked';
  details: string;
  faceMatched?: boolean;
}

let guardianState: GuardianState = {
  isActive: false,
  isStrangerDetected: false,
  ownerFaceDescriptor: null,
  lastFaceCheck: 0,
  intrusionLog: [],
};

export function getGuardianState(): GuardianState {
  return { ...guardianState };
}

export function activateGuardian(): void {
  guardianState.isActive = true;
  guardianState.isStrangerDetected = false;
  console.log('Guardian Mode activated — silent monitoring');
}

export function deactivateGuardian(): void {
  guardianState.isActive = false;
  guardianState.isStrangerDetected = false;
  console.log('Guardian Mode deactivated');
}

export function isGuardianActive(): boolean {
  return guardianState.isActive;
}

export function isStrangerDetected(): boolean {
  return guardianState.isStrangerDetected;
}

// Register the owner's face (called during setup)
export function registerOwnerFace(descriptor: number[]): void {
  guardianState.ownerFaceDescriptor = descriptor;
  console.log('Owner face registered');
}

// Process faces detected by camera
export function processDetectedFaces(faces: FaceData[]): {
  isStranger: boolean;
  action: 'none' | 'silent_watch' | 'lock_apps' | 'return_home';
} {
  if (!guardianState.isActive) {
    return { isStranger: false, action: 'none' };
  }

  guardianState.lastFaceCheck = Date.now();

  if (faces.length === 0) {
    return { isStranger: false, action: 'none' };
  }

  if (guardianState.ownerFaceDescriptor) {
    const isOwner = compareFaces(faces[0], guardianState.ownerFaceDescriptor);
    if (!isOwner) {
      guardianState.isStrangerDetected = true;
      logIntrusion('stranger_detected', 'Unknown face detected');
      return { isStranger: true, action: 'silent_watch' };
    }
  }

  guardianState.isStrangerDetected = false;
  return { isStranger: false, action: 'none' };
}

function compareFaces(detectedFace: FaceData, ownerDescriptor: number[]): boolean {
  // Placeholder — real implementation uses MLKit Face Embeddings
  return true;
}

function logIntrusion(type: IntrusionEvent['type'], details: string): void {
  guardianState.intrusionLog.push({
    id: `intrusion-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type,
    details,
    faceMatched: type !== 'stranger_detected',
  });
}

export function getIntrusionLog(): IntrusionEvent[] {
  return [...guardianState.intrusionLog];
}

export function clearIntrusionLog(): void {
  guardianState.intrusionLog = [];
}

// Pre-warning system
interface PreWarning {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

let preWarnings: PreWarning[] = [];

export function addPreWarning(name: string, startTime: string, endTime: string): void {
  preWarnings.push({
    id: `warning-${Date.now()}`,
    name,
    startTime,
    endTime,
    isActive: true,
  });
}

export function getActivePreWarnings(): PreWarning[] {
  const now = new Date();
  return preWarnings.filter((w) => {
    if (!w.isActive) return false;
    return now >= new Date(w.startTime) && now <= new Date(w.endTime);
  });
}

export function hasActivePreWarning(): boolean {
  return getActivePreWarnings().length > 0;
}

export function getStealthAppInfo(): { name: string; icon: string } {
  return {
    name: 'System Update',
    icon: 'settings',
  };
}
