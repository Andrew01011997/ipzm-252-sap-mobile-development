import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonRouterLink,
  NavController,
} from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline } from 'ionicons/icons';

import type { ValidationMessages } from '../../../shared/forms/validation-message.pipe';
import { ValidationMessagePipe } from '../../../shared/forms/validation-message.pipe';
import { AppToast } from '../../../shared/ui/app-toast.service';
import { HOME_URL } from '../../auth-urls';
import { GoogleSignInComponent } from '../../components/google-sign-in/google-sign-in.component';
import { authErrorKey } from '../../data/auth-error';
import { AuthService } from '../../data/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['../auth-page.scss'],
  imports: [
    ReactiveFormsModule,
    IonContent,
    IonIcon,
    IonInput,
    IonInputPasswordToggle,
    IonButton,
    IonRouterLink,
    RouterLink,
    TranslatePipe,
    ValidationMessagePipe,
    GoogleSignInComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly nav = inject(NavController);
  private readonly toast = inject(AppToast);

  protected readonly submitting = signal(false);
  protected readonly emailMessages: ValidationMessages = {
    required: 'auth.validation.emailRequired',
    email: 'auth.validation.emailInvalid',
  };
  protected readonly passwordMessages: ValidationMessages = {
    required: 'auth.validation.passwordRequired',
  };

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    addIcons({ checkmarkDoneOutline });
  }

  protected async submit(): Promise<void> {
    if (this.submitting()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    try {
      await this.authService.login(this.form.getRawValue());
      await this.nav.navigateRoot(HOME_URL);
    } catch (error) {
      await this.toast.error(authErrorKey(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
