import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

export interface GeoPoint {
  readonly lat: number;
  readonly lng: number;
  readonly accuracy: number | null;
}

export class LocationPermissionError extends Error {
  constructor() {
    super('Location permission denied');
  }
}

const POSITION_TIMEOUT_MS = 15_000;
const POSITION_MAX_AGE_MS = 60_000;
const BROWSER_PERMISSION_DENIED = 1;

@Injectable({ providedIn: 'root' })
export class AppLocation {
  async current(): Promise<GeoPoint> {
    if (Capacitor.isNativePlatform()) {
      await this.ensurePermission();
    }
    try {
      const { coords } = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: POSITION_TIMEOUT_MS,
        maximumAge: POSITION_MAX_AGE_MS,
      });
      return { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy ?? null };
    } catch (error) {
      const { code, message } = error as { code?: unknown; message?: unknown };
      if (code === BROWSER_PERMISSION_DENIED || /denied/i.test(String(message))) {
        throw new LocationPermissionError();
      }
      throw error;
    }
  }

  private async ensurePermission(): Promise<void> {
    const { location } = await Geolocation.checkPermissions();
    if (location === 'granted') {
      return;
    }
    const requested = await Geolocation.requestPermissions({ permissions: ['location'] });
    if (requested.location !== 'granted') {
      throw new LocationPermissionError();
    }
  }
}
