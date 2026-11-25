import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { DatetimeChangeEventDetail } from '@ionic/angular';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { calendarOutline, cameraOutline, close } from 'ionicons/icons';

import { LanguageService } from '../../../core/i18n/language.service';
import { PhotoPicker } from '../../../shared/media/photo-picker.service';
import { AppHaptics } from '../../../shared/native/haptics.service';
import { AppToast } from '../../../shared/ui/app-toast.service';
import { VoiceButtonComponent } from '../../../shared/voice/voice-button.component';
import { TodoStore } from '../../data/todo.store';
import { TODO_DESCRIPTION_MAX_LENGTH, TODO_TITLE_MAX_LENGTH } from '../../todo.model';

export const TODOS_LIST_URL = '/todos';

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

function toLocalIsoMinutes(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.page.html',
  styleUrl: './todo-form.page.scss',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonInput,
    IonTextarea,
    IonDatetime,
    IonModal,
    IonIcon,
    IonSpinner,
    IonFooter,
    IonButton,
    TranslatePipe,
    VoiceButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFormPage {
  private readonly store = inject(TodoStore);
  private readonly nav = inject(NavController);
  private readonly toast = inject(AppToast);
  private readonly photoPicker = inject(PhotoPicker);
  private readonly haptics = inject(AppHaptics);
  protected readonly language = inject(LanguageService);

  protected readonly listUrl = TODOS_LIST_URL;
  protected readonly titleMaxLength = TODO_TITLE_MAX_LENGTH;
  protected readonly descriptionMaxLength = TODO_DESCRIPTION_MAX_LENGTH;
  protected readonly minDueDate = toLocalIsoMinutes(new Date());
  protected readonly saving = signal(false);
  protected readonly dueDateOpen = signal(false);
  protected readonly photo = signal<Blob | null>(null);
  protected readonly photoPreview = signal<string | null>(null);

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [notBlank, Validators.maxLength(TODO_TITLE_MAX_LENGTH)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(TODO_DESCRIPTION_MAX_LENGTH)],
    }),
    dueDate: new FormControl<string | null>(null),
  });

  constructor() {
    addIcons({ calendarOutline, cameraOutline, close });
    inject(DestroyRef).onDestroy(() => this.setPhoto(null));
  }

  protected onDueDateChange(event: CustomEvent<DatetimeChangeEventDetail>): void {
    const value = event.detail.value;
    this.form.controls.dueDate.setValue(typeof value === 'string' ? value : null);
    this.dueDateOpen.set(false);
  }

  protected clearDueDate(): void {
    this.form.controls.dueDate.setValue(null);
  }

  protected async pickPhoto(): Promise<void> {
    try {
      const photo = await this.photoPicker.pick();
      if (photo) {
        this.setPhoto(photo);
      }
    } catch {
      await this.toast.error('media.errors.pickFailed');
    }
  }

  protected appendTranscript(field: 'title' | 'description', text: string): void {
    const control = this.form.controls[field];
    const maxLength = field === 'title' ? TODO_TITLE_MAX_LENGTH : TODO_DESCRIPTION_MAX_LENGTH;
    const current = control.value.trim();
    control.setValue((current ? `${current} ${text}` : text).slice(0, maxLength));
    control.markAsDirty();
  }

  protected removePhoto(): void {
    this.setPhoto(null);
  }

  protected async save(): Promise<void> {
    if (this.saving()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      const { title, description, dueDate } = this.form.getRawValue();
      await this.store.add({
        title,
        description,
        dueDate: dueDate ? new Date(dueDate).getTime() : null,
        photo: this.photo(),
      });
      void this.haptics.success();
      await this.nav.navigateBack(TODOS_LIST_URL);
    } catch {
      await this.toast.error('todos.errors.saveFailed');
    } finally {
      this.saving.set(false);
    }
  }

  private setPhoto(photo: Blob | null): void {
    const previous = this.photoPreview();
    if (previous) {
      URL.revokeObjectURL(previous);
    }
    this.photo.set(photo);
    this.photoPreview.set(photo ? URL.createObjectURL(photo) : null);
  }
}
