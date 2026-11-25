import { Injectable, effect, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import OneSignal from '@onesignal/capacitor-plugin';

import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/data/auth.service';
import { LanguageService } from '../i18n/language.service';

export const PUSH_PLATFORMS: readonly string[] = ['android'];

@Injectable({ providedIn: 'root' })
export class PushNotifications {
  private readonly authService = inject(AuthService);
  private readonly language = inject(LanguageService);
  private ready?: Promise<void>;

  readonly supported = PUSH_PLATFORMS.includes(Capacitor.getPlatform());

  constructor() {
    if (!this.supported) {
      return;
    }
    effect(() => {
      const userId = this.authService.userId();
      void this.whenReady(() => (userId ? this.identify(userId) : OneSignal.logout()));
    });
    effect(() => {
      const language = this.language.current();
      void this.whenReady(() => OneSignal.User.setLanguage(language));
    });
  }

  init(): Promise<void> {
    if (!this.supported) {
      return Promise.resolve();
    }
    this.ready ??= OneSignal.initialize(environment.oneSignalAppId);
    return this.ready;
  }

  private async whenReady(task: () => Promise<void>): Promise<void> {
    try {
      await this.init();
      await task();
    } catch {
      return;
    }
  }

  private async identify(userId: string): Promise<void> {
    await OneSignal.login(userId);
    if (await OneSignal.Notifications.canRequestPermission()) {
      await OneSignal.Notifications.requestPermission(true);
    }
  }
}
