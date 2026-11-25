import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap } from 'rxjs';

import { AuthService } from '../../auth/data/auth.service';
import type { Todo, TodoDraft } from '../todo.model';

import { TodoPhotoStorage } from './todo-photo.storage';
import { TodoRepository } from './todo.repository';

interface TodosState {
  readonly todos: readonly Todo[];
  readonly loaded: boolean;
  readonly failed: boolean;
}

const INITIAL_STATE: TodosState = { todos: [], loaded: false, failed: false };

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private readonly repository = inject(TodoRepository);
  private readonly authService = inject(AuthService);
  private readonly photos = inject(TodoPhotoStorage);

  private readonly state = toSignal(
    toObservable(this.authService.userId).pipe(
      switchMap((userId) =>
        userId
          ? this.repository.watchByUser(userId).pipe(
              map((todos): TodosState => ({ todos, loaded: true, failed: false })),
              catchError(() => of<TodosState>({ todos: [], loaded: true, failed: true })),
            )
          : of(INITIAL_STATE),
      ),
    ),
    { initialValue: INITIAL_STATE },
  );

  readonly todos = computed(() => this.state().todos);
  readonly loaded = computed(() => this.state().loaded);
  readonly failed = computed(() => this.state().failed);
  readonly isEmpty = computed(() => this.state().todos.length === 0);
  readonly completedCount = computed(() => this.state().todos.filter((todo) => todo.completed).length);
  readonly activeCount = computed(() => this.state().todos.length - this.completedCount());
  readonly progress = computed(() => (this.isEmpty() ? 0 : this.completedCount() / this.state().todos.length));

  async add(draft: TodoDraft): Promise<void> {
    const userId = this.requireUserId();
    const id = this.repository.createId();
    const photo = draft.photo ? await this.photos.upload(userId, id, draft.photo) : null;
    try {
      await this.repository.create(id, {
        userId,
        title: draft.title.trim(),
        description: draft.description.trim(),
        completed: false,
        createdAt: Date.now(),
        dueDate: draft.dueDate,
        photo,
      });
    } catch (error) {
      if (photo) {
        await this.photos.remove(photo.path);
      }
      throw error;
    }
  }

  toggle(todo: Todo): Promise<void> {
    return this.repository.update(todo.id, { completed: !todo.completed });
  }

  async remove(todo: Todo): Promise<void> {
    await this.repository.remove(todo.id);
    if (todo.photo) {
      await this.photos.remove(todo.photo.path);
    }
  }

  private requireUserId(): string {
    const userId = this.authService.userId();
    if (!userId) {
      throw new Error('User is not authenticated');
    }
    return userId;
  }
}
