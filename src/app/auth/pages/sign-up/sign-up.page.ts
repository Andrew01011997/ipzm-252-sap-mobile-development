import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonInputPasswordToggle,
  IonRouterLinkWithHref,
  IonIcon,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline } from 'ionicons/icons';

import type { ValidationMessages } from '../../../shared/forms/validation-message.pipe';
import { ValidationMessagePipe } from '../../../shared/forms/validation-message.pipe';
import { matchControl, notInFuture, phone, todayIsoDate } from '../../../shared/forms/validators';
import { AppToast } from '../../../shared/ui/app-toast.service';
import { HOME_URL } from '../../auth-urls';
import { GoogleSignInComponent } from '../../components/google-sign-in/google-sign-in.component';
import { authErrorKey } from '../../data/auth-error';
import { AuthService } from '../../data/auth.service';

export const PASSWORD_MIN_LENGTH = 6;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonButton,
    IonRouterLinkWithHref,
    RouterLink,
    TranslatePipe,
    ValidationMessagePipe,
    GoogleSignInComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPage {
  private readonly authService = inject(AuthService);
  private readonly nav = inject(NavController);
  private readonly toast = inject(AppToast);

  protected readonly submitting = signal(false);
  protected readonly maxBirthDate = todayIsoDate();
  protected readonly usernameMaxLength = USERNAME_MAX_LENGTH;

  protected readonly messages = {
    email: { required: 'auth.validation.emailRequired', email: 'auth.validation.emailInvalid' },
    password: { required: 'auth.validation.passwordRequired', minlength: 'auth.validation.passwordMinLength' },
    confirmPassword: {
      required: 'auth.validation.confirmPasswordRequired',
      mismatch: 'auth.validation.passwordsMismatch',
    },
    username: { required: 'auth.validation.usernameRequired', minlength: 'auth.validation.usernameMinLength' },
    phone: { pattern: 'auth.validation.phoneInvalid' },
    birthDate: { future: 'auth.validation.birthDateInvalid' },
  } satisfies Record<string, ValidationMessages>;

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, matchControl('password')],
    }),
    username: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(USERNAME_MIN_LENGTH),
        Validators.maxLength(USERNAME_MAX_LENGTH),
      ],
    }),
    phone: new FormControl('', { nonNullable: true, validators: [phone] }),
    birthDate: new FormControl('', { nonNullable: true, validators: [notInFuture] }),
    city: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    addIcons({ checkmarkDoneOutline });
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
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
      const { email, password, username, phone, birthDate, city } = this.form.getRawValue();
      await this.authService.register({ email, password, username, phone, birthDate, city });
      await this.nav.navigateRoot(HOME_URL);
    } catch (error) {
      await this.toast.error(authErrorKey(error));
    } finally {
      this.submitting.set(false);
    }
  }
}
