import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { AbstractControl, ValidationErrors } from '@angular/forms';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonTextarea,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

import { AppToast } from '../../../shared/ui/app-toast.service';
import { TodoStore } from '../../data/todo.store';
import { TODO_DESCRIPTION_MAX_LENGTH, TODO_TITLE_MAX_LENGTH } from '../../todo.model';

export const TODOS_LIST_URL = '/todos';

function notBlank(control: AbstractControl<string>): ValidationErrors | null {
  return control.value.trim() ? null : { required: true };
}

@Component({
  selector: 'app-todo-form',
  templateUrl: './todo-form.page.html',
  styleUrl: './todo-form.page.scss',
  imports: [
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonInput,
    IonTextarea,
    IonFooter,
    IonButton,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFormPage {
  private readonly store = inject(TodoStore);
  private readonly nav = inject(NavController);
  private readonly toast = inject(AppToast);

  protected readonly listUrl = TODOS_LIST_URL;
  protected readonly titleMaxLength = TODO_TITLE_MAX_LENGTH;
  protected readonly descriptionMaxLength = TODO_DESCRIPTION_MAX_LENGTH;
  protected readonly saving = signal(false);

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [notBlank, Validators.maxLength(TODO_TITLE_MAX_LENGTH)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(TODO_DESCRIPTION_MAX_LENGTH)],
    }),
  });

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
      await this.store.add(this.form.getRawValue());
      await this.nav.navigateBack(TODOS_LIST_URL);
    } catch {
      await this.toast.error('todos.errors.saveFailed');
    } finally {
      this.saving.set(false);
    }
  }
}
