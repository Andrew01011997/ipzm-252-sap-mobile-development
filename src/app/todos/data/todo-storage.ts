import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import type { Todo } from '../todo.model';
import { isTodo } from '../todo.model';

export const TODOS_STORAGE_KEY = 'todos';

@Injectable({ providedIn: 'root', useFactory: () => new PreferencesTodoStorage() })
export abstract class TodoStorage {
  abstract load(): Promise<Todo[]>;
  abstract save(todos: readonly Todo[]): Promise<void>;
}

export class PreferencesTodoStorage extends TodoStorage {
  async load(): Promise<Todo[]> {
    const { value } = await Preferences.get({ key: TODOS_STORAGE_KEY });
    return parseTodos(value);
  }

  async save(todos: readonly Todo[]): Promise<void> {
    await Preferences.set({ key: TODOS_STORAGE_KEY, value: JSON.stringify(todos) });
  }
}

export function parseTodos(raw: string | null): Todo[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTodo) : [];
  } catch {
    return [];
  }
}
