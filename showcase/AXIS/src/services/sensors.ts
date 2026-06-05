import * as Sensors from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * AXIS Sensor Monitor
 * Uses device sensors (accelerometer, proximity, ambient light) to detect:
 * - Phone pickup (accelerometer)
 * - User proximity (proximity sensor)
 * - Environment changes (ambient light)
 * 
 * These feed into AXIS's proactive triggers and Guardian Mode.
 */

type SensorCallback = (data: any) => void;

let accelerometerSubscription: any = null;
let proximitySubscription: any = null;
let gyroscopeSubscription: any = null;

interface SensorData {
  isMoving: boolean;
  isPickedUp: boolean;
  orientation: 'flat' | 'tilted' | 'upright';
  lastMovement: number;
}

let sensorState: SensorData = {
  isMoving: false,
  isPickedUp: false,
  orientation: 'flat',
  lastMovement: Date.now(),
};

const MOVEMENT_THRESHOLD = 1.2;  // Acceleration threshold for movement
const PICKUP_THRESHOLD = 0.8;    // Threshold for pickup detection
const STILL_THRESHOLD = 0.3;     // Below this = device is still

export function getSensorState(): SensorData {
  return { ...sensorState };
}

export function startAccelerometer(onMovement?: SensorCallback): boolean {
  if (!Sensors.Accelerometer) {
    console.log('Accelerometer not available');
    return false;
  }

  Sensors.Accelerometer.setUpdateInterval(1000); // 1 second

  accelerometerSubscription = Sensors.Accelerometer.addListener((data) => {
    const { x, y, z } = data;
    const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

    // Remove gravity (approximately 9.8)
    const netAcceleration = Math.abs(totalAcceleration - 9.8);

    if (netAcceleration > MOVEMENT_THRESHOLD) {
      sensorState.isMoving = true;
      sensorState.lastMovement = Date.now();
      onMovement?.({ type: 'movement', acceleration: netAcceleration });
    } else if (netAcceleration < STILL_THRESHOLD) {
      sensorState.isMoving = false;
    }

    // Detect orientation
    if (Math.abs(z) > 9) {
      sensorState.orientation = 'flat'; // Lying flat on table
    } else if (y > 7) {
      sensorState.orientation = 'upright'; // Held upright
    } else {
      sensorState.orientation = 'tilted';
    }

    // Detect pickup (sudden change in orientation + movement)
    if (sensorState.orientation !== 'flat' && netAcceleration > PICKUP_THRESHOLD) {
      if (!sensorState.isPickedUp) {
        sensorState.isPickedUp = true;
        onMovement?.({ type: 'pickup' });
      }
    } else if (sensorState.orientation === 'flat') {
      sensorState.isPickedUp = false;
    }
  });

  return true;
}

export function startGyroscope(onRotation?: SensorCallback): boolean {
  if (!Sensors.Gyroscope) {
    console.log('Gyroscope not available');
    return false;
  }

  Sensors.Gyroscope.setUpdateInterval(1000);

  gyroscopeSubscription = Sensors.Gyroscope.addListener((data) => {
    const { x, y, z } = data;
    const rotationSpeed = Math.sqrt(x * x + y * y + z * z);

    if (rotationSpeed > 1.5) {
      onRotation?.({ type: 'rotation', speed: rotationSpeed });
    }
  });

  return true;
}

export function getInactivityDuration(): number {
  return Date.now() - sensorState.lastMovement;
}

export function isDeviceStill(): boolean {
  return !sensorState.isMoving;
}

export function isPhonePickedUp(): boolean {
  return sensorState.isPickedUp;
}

export function stopAllSensors(): void {
  if (accelerometerSubscription) {
    accelerometerSubscription.remove();
    accelerometerSubscription = null;
  }
  if (proximitySubscription) {
    proximitySubscription.remove();
    proximitySubscription = null;
  }
  if (gyroscopeSubscription) {
    gyroscopeSubscription.remove();
    gyroscopeSubscription = null;
  }
}
