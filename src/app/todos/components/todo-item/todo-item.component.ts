import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { IonButton, IonCheckbox, IonIcon, IonItem, IonLabel } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { calendarOutline, locationOutline, trashOutline } from 'ionicons/icons';

import { LanguageService } from '../../../core/i18n/language.service';
import { CoordinatesPipe } from '../../../shared/native/coordinates.pipe';
import { TODO_CATEGORY_META } from '../../todo-category';
import type { Todo } from '../../todo.model';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss',
  imports: [IonItem, IonCheckbox, IonLabel, IonButton, IonIcon, TranslatePipe, DatePipe, CoordinatesPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoItemComponent {
  protected readonly language = inject(LanguageService);

  readonly todo = input.required<Todo>();
  readonly completionToggled = output<void>();
  readonly removeRequested = output<void>();

  protected readonly categoryMeta = computed(() => TODO_CATEGORY_META[this.todo().category]);

  protected readonly isOverdue = computed(() => {
    const { dueDate, completed } = this.todo();
    return !completed && dueDate !== null && dueDate < Date.now();
  });

  constructor() {
    addIcons({ calendarOutline, locationOutline, trashOutline });
  }
}
