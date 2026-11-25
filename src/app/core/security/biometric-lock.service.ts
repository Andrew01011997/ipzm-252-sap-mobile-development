import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { TranslateService } from '@ngx-translate/core';

export const LOCK_URL = '/locked';
export const PROTECTED_URL_PREFIX = '/todos';

const BIOMETRY_LABEL_KEYS: Partial<Record<BiometryType, string>> = {
  [BiometryType.faceId]: 'lock.biometry.faceId',
  [BiometryType.touchId]: 'lock.biometry.touchId',
  [BiometryType.fingerprintAuthentication]: 'lock.biometry.fingerprint',
  [BiometryType.faceAuthentication]: 'lock.biometry.face',
  [BiometryType.irisAuthentication]: 'lock.biometry.iris',
};

@Injectable({ providedIn: 'root' })
export class BiometricLock {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly unlockedState = signal(false);
  private readonly biometryLabelKey = signal('lock.biometry.generic');

  readonly unlocked = this.unlockedState.asReadonly();
  readonly biometryLabel = this.biometryLabelKey.asReadonly();

  async init(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    await App.addListener('pause', () => this.lock());
    await App.addListener('resume', () => {
      const url = this.router.url;
      if (!this.unlockedState() && url.startsWith(PROTECTED_URL_PREFIX)) {
        void this.router.navigate([LOCK_URL], { queryParams: { redirect: url } });
      }
    });
  }

  async unlock(): Promise<boolean> {
    if (this.unlockedState()) {
      return true;
    }
    const { isAvailable, biometryType } = await BiometricAuth.checkBiometry();
    if (!isAvailable) {
      this.unlockedState.set(true);
      return true;
    }
    this.biometryLabelKey.set(BIOMETRY_LABEL_KEYS[biometryType] ?? 'lock.biometry.generic');
    try {
      await BiometricAuth.authenticate({
        reason: this.translate.instant('lock.reason'),
        cancelTitle: this.translate.instant('common.cancel'),
        androidTitle: this.translate.instant('lock.title'),
        androidSubtitle: this.translate.instant('lock.reason'),
        allowDeviceCredential: true,
      });
      this.unlockedState.set(true);
      return true;
    } catch {
      return false;
    }
  }

  lock(): void {
    this.unlockedState.set(false);
  }
}
