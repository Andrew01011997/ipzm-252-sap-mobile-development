import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonInput, IonInputPasswordToggle } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { checkmarkDoneOutline } from 'ionicons/icons';

import type { ValidationMessages } from '../../../shared/forms/validation-message.pipe';
import { ValidationMessagePipe } from '../../../shared/forms/validation-message.pipe';

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
    TranslatePipe,
    ValidationMessagePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
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

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }
  }
}
