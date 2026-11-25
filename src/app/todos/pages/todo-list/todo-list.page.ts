import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlertController,
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList,
  IonRouterLink,
  IonText,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { add, clipboardOutline, cloudOfflineOutline, logOutOutline } from 'ionicons/icons';

import { LOGIN_URL } from '../../../auth/auth-urls';
import { AuthService } from '../../../auth/data/auth.service';
import { AppToast } from '../../../shared/ui/app-toast.service';
import { TodoItemComponent } from '../../components/todo-item/todo-item.component';
import { TodoStore } from '../../data/todo.store';
import type { Todo } from '../../todo.model';

export const REMOVE_CONFIRM_ROLE = 'destructive';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.page.html',
  styleUrl: './todo-list.page.scss',
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTitle,
    IonContent,
    IonList,
    IonText,
    IonIcon,
    IonFab,
    IonFabButton,
    IonRouterLink,
    RouterLink,
    TranslatePipe,
    TodoItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListPage {
  protected readonly store = inject(TodoStore);
  private readonly alerts = inject(AlertController);
  private readonly translate = inject(TranslateService);
  private readonly authService = inject(AuthService);
  private readonly nav = inject(NavController);
  private readonly toast = inject(AppToast);

  protected readonly showEmptyState = computed(
    () => this.store.loaded() && !this.store.failed() && this.store.isEmpty(),
  );

  constructor() {
    addIcons({ add, clipboardOutline, cloudOfflineOutline, logOutOutline });
  }

  protected async toggle(todo: Todo): Promise<void> {
    try {
      await this.store.toggle(todo);
    } catch {
      await this.toast.error('todos.errors.updateFailed');
    }
  }

  protected async logout(): Promise<void> {
    await this.authService.logout();
    await this.nav.navigateRoot(LOGIN_URL);
  }

  protected async confirmRemoval(todo: Todo): Promise<void> {
    const alert = await this.alerts.create({
      header: this.translate.instant('todos.remove.header'),
      subHeader: todo.title,
      message: this.translate.instant('todos.remove.message'),
      buttons: [
        { text: this.translate.instant('todos.remove.cancel'), role: 'cancel' },
        {
          text: this.translate.instant('todos.remove.confirm'),
          role: REMOVE_CONFIRM_ROLE,
          cssClass: 'alert-button-danger',
        },
      ],
    });
    await alert.present();
    const { role } = await alert.onDidDismiss();
    if (role !== REMOVE_CONFIRM_ROLE) {
      return;
    }
    try {
      await this.store.remove(todo.id);
    } catch {
      await this.toast.error('todos.errors.removeFailed');
    }
  }
}
