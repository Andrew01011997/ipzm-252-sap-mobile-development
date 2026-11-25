import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonRouterLinkWithHref,
  IonSpinner,
  IonToolbar,
} from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline, mailUnreadOutline } from 'ionicons/icons';

import type { ValidationMessages } from '../../../shared/forms/validation-message.pipe';
import { ValidationMessagePipe } from '../../../shared/forms/validation-message.pipe';
import { AppToast } from '../../../shared/ui/app-toast.service';
import { LOGIN_URL } from '../../auth-urls';
import { authErrorKey } from '../../data/auth-error';
import { AuthService } from '../../data/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrl: './forgot-password.page.scss',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    IonRouterLinkWithHref,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    TranslatePipe,
    ValidationMessagePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private readonly authService = inject(AuthService);
  private readonly toast = inject(AppToast);

  readonly email = input<string>();

  protected readonly loginUrl = LOGIN_URL;
  protected readonly submitting = signal(false);
  protected readonly sentTo = signal<string | null>(null);
  protected readonly emailMessages: ValidationMessages = {
    required: 'auth.validation.emailRequired',
    email: 'auth.validation.emailInvalid',
  };
  protected readonly emailControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });

  constructor() {
    addIcons({ checkmarkDoneOutline, mailUnreadOutline });
    effect(() => {
      const email = this.email();
      if (email && !this.emailControl.dirty) {
        this.emailControl.setValue(email);
      }
    });
  }

  protected async submit(): Promise<void> {
    if (this.submitting()) {
      return;
    }
    if (this.emailControl.invalid) {
      this.emailControl.markAsTouched();
      return;
    }
    this.submitting.set(true);
    try {
      const email = this.emailControl.value.trim();
      await this.authService.sendPasswordReset(email);
      this.sentTo.set(email);
    } catch (error) {
      await this.toast.error(authErrorKey(error));
    } finally {
      this.submitting.set(false);
    }
  }

  protected resend(): void {
    this.sentTo.set(null);
  }
}
