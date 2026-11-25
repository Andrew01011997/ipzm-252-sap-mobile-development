import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IonButton, NavController } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

import { AppToast } from '../../../shared/ui/app-toast.service';
import { HOME_URL } from '../../auth-urls';
import { authErrorKey, isAuthCancellation } from '../../data/auth-error';
import { AuthService } from '../../data/auth.service';

@Component({
  selector: 'app-google-sign-in',
  templateUrl: './google-sign-in.component.html',
  styleUrl: './google-sign-in.component.scss',
  imports: [IonButton, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleSignInComponent {
  private readonly authService = inject(AuthService);
  private readonly nav = inject(NavController);
  private readonly toast = inject(AppToast);

  protected readonly pending = signal(false);
  protected readonly available = this.authService.googleSignInAvailable;

  protected async signIn(): Promise<void> {
    if (this.pending()) {
      return;
    }
    this.pending.set(true);
    try {
      await this.authService.loginWithGoogle();
      await this.nav.navigateRoot(HOME_URL);
    } catch (error) {
      if (!isAuthCancellation(error)) {
        await this.toast.error(authErrorKey(error));
      }
    } finally {
      this.pending.set(false);
    }
  }
}
