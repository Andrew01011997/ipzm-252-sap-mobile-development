import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

const TOAST_DURATION_MS = 3000;

@Injectable({ providedIn: 'root' })
export class AppToast {
  private readonly toasts = inject(ToastController);
  private readonly translate = inject(TranslateService);

  async error(messageKey: string): Promise<void> {
    const toast = await this.toasts.create({
      message: this.translate.instant(messageKey),
      color: 'danger',
      duration: TOAST_DURATION_MS,
      position: 'top',
    });
    await toast.present();
  }
}
