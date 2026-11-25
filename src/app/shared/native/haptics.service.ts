import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Injectable({ providedIn: 'root' })
export class AppHaptics {
  success(): Promise<void> {
    return Haptics.notification({ type: NotificationType.Success }).catch(() => undefined);
  }

  impact(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
    return Haptics.impact({ style }).catch(() => undefined);
  }
}
