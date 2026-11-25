import { ChangeDetectionStrategy, Component } from '@angular/core';
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
  IonRouterLink,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

import type { ValidationMessages } from '../../../shared/forms/validation-message.pipe';
import { ValidationMessagePipe } from '../../../shared/forms/validation-message.pipe';
import { matchControl, notInFuture, phone, todayIsoDate } from '../../../shared/forms/validators';

export const PASSWORD_MIN_LENGTH = 6;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['../auth-page.scss'],
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonInput,
    IonInputPasswordToggle,
    IonButton,
    IonRouterLink,
    RouterLink,
    TranslatePipe,
    ValidationMessagePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUpPage {
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
    this.form.controls.password.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.form.controls.confirmPassword.updateValueAndValidity());
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
  }
}
