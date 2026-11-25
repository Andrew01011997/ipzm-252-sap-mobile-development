import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { IonButton, IonContent, IonIcon, NavController } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';

import { HOME_URL, LOGIN_URL } from '../../../auth/auth-urls';
import { AuthService } from '../../../auth/data/auth.service';
import { BiometricLock, PROTECTED_URL_PREFIX } from '../biometric-lock.service';

@Component({
  selector: 'app-lock',
  templateUrl: './lock.page.html',
  styleUrl: './lock.page.scss',
  imports: [IonContent, IonIcon, IonButton, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LockPage {
  private readonly nav = inject(NavController);
  private readonly authService = inject(AuthService);
  protected readonly lock = inject(BiometricLock);

  readonly redirect = input<string>();
  protected readonly pending = signal(false);

  constructor() {
    addIcons({ lockClosedOutline });
  }

  protected async unlock(): Promise<void> {
    if (this.pending()) {
      return;
    }
    this.pending.set(true);
    try {
      if (await this.lock.unlock()) {
        const redirect = this.redirect();
        await this.nav.navigateRoot(redirect?.startsWith(PROTECTED_URL_PREFIX) ? redirect : HOME_URL);
      }
    } finally {
      this.pending.set(false);
    }
  }

  protected async logout(): Promise<void> {
    this.lock.lock();
    await this.authService.logout();
    await this.nav.navigateRoot(LOGIN_URL);
  }
}
