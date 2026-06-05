import * as Location from 'expo-location';

/**
 * AXIS Location Service
 * Works WITHOUT Google Maps API — pure Expo Location + haversine math.
 * No credit card, no API key, no external service needed.
 */

export interface GeofenceZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  behavior: 'home' | 'college' | 'outside';
}

let currentZone: string | null = null;
let locationSubscription: Location.LocationSubscription | null = null;

// Default zones (user updates these with their actual coordinates)
let zones: GeofenceZone[] = [
  {
    id: 'home',
    name: 'Home',
    latitude: parseFloat(process.env.HOME_LATITUDE || '27.7172'),
    longitude: parseFloat(process.env.HOME_LONGITUDE || '85.3240'),
    radius: parseFloat(process.env.HOME_RADIUS_METERS || '100'),
    behavior: 'home',
  },
  {
    id: 'college',
    name: 'College',
    latitude: parseFloat(process.env.COLLEGE_LATITUDE || '27.7200'),
    longitude: parseFloat(process.env.COLLEGE_LONGITUDE || '85.3300'),
    radius: parseFloat(process.env.COLLEGE_RADIUS_METERS || '150'),
    behavior: 'college',
  },
];

export function setZones(newZones: GeofenceZone[]): void {
  zones = newZones;
}

export function getZones(): GeofenceZone[] {
  return zones;
}

export function getCurrentZone(): string | null {
  return currentZone;
}

export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foreground } = await Location.requestForegroundPermissionsAsync();
  if (foreground !== 'granted') {
    console.log('Foreground location permission denied');
    return false;
  }

  // Background permission for always-on tracking
  const { status: background } = await Location.requestBackgroundPermissionsAsync();
  if (background !== 'granted') {
    console.log('Background location permission denied — will only track in foreground');
  }

  return true;
}

type ZoneChangeCallback = (
  currentZone: string | null,
  previousZone: string | null,
  zoneData: GeofenceZone | null
) => void;

export async function startLocationTracking(
  onZoneChange: ZoneChangeCallback
): Promise<boolean> {
  const hasPermission = await requestLocationPermissions();
  if (!hasPermission) return false;

  try {
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        distanceInterval: 30,  // Update every 30 meters
        timeInterval: 15000,   // Or every 15 seconds
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        const detected = detectZone(latitude, longitude);

        if (detected !== currentZone) {
          const previousZone = currentZone;
          currentZone = detected;
          const zoneData = zones.find((z) => z.name === detected) || null;
          onZoneChange(currentZone, previousZone, zoneData);
        }
      }
    );

    console.log('Location tracking started');
    return true;
  } catch (error) {
    console.log('Failed to start location tracking:', error);
    return false;
  }
}

function detectZone(lat: number, lng: number): string | null {
  for (const zone of zones) {
    const distance = haversineDistance(lat, lng, zone.latitude, zone.longitude);
    if (distance <= zone.radius) {
      return zone.name;
    }
  }
  return 'outside';
}

/**
 * Haversine formula — calculates distance between two GPS coordinates in meters.
 * Pure math. No API. No Google Maps. Works offline.
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function stopLocationTracking(): void {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}

// Get current location once
export async function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
} | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return null;
  }
}
