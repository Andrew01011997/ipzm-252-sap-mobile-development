import { Injectable, computed, inject, signal } from '@angular/core';

import type { Todo, TodoDraft } from '../todo.model';

import { TodoStorage } from './todo-storage';

@Injectable({ providedIn: 'root' })
export class TodoStore {
  private readonly storage = inject(TodoStorage);
  private readonly state = signal<readonly Todo[]>([]);
  private readonly loadedState = signal(false);
  private loading?: Promise<void>;

  readonly todos = this.state.asReadonly();
  readonly loaded = this.loadedState.asReadonly();
  readonly isEmpty = computed(() => this.state().length === 0);

  load(): Promise<void> {
    this.loading ??= this.storage.load().then((todos) => {
      this.state.set(todos);
      this.loadedState.set(true);
    });
    return this.loading;
  }

  async add(draft: TodoDraft): Promise<Todo> {
    await this.load();
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: draft.title.trim(),
      description: draft.description.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    await this.commit([todo, ...this.state()]);
    return todo;
  }

  async toggle(id: string): Promise<void> {
    await this.load();
    await this.commit(this.state().map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  }

  async remove(id: string): Promise<void> {
    await this.load();
    await this.commit(this.state().filter((todo) => todo.id !== id));
  }

  private async commit(todos: readonly Todo[]): Promise<void> {
    const previous = this.state();
    this.state.set(todos);
    try {
      await this.storage.save(todos);
    } catch (error) {
      this.state.set(previous);
      throw error;
    }
  }
}
