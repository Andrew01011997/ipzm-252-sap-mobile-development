import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import type { CollectionReference } from '@angular/fire/firestore';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import type { Todo } from '../todo.model';

export const TODOS_COLLECTION = 'todos';

export type TodoDocument = Omit<Todo, 'id'>;
export type TodoChanges = Partial<
  Pick<TodoDocument, 'title' | 'description' | 'completed' | 'dueDate' | 'photo' | 'location'>
>;

@Injectable({ providedIn: 'root' })
export class TodoRepository {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly collection = collection(this.firestore, TODOS_COLLECTION) as CollectionReference<TodoDocument>;
  private readonly todos = this.collection as CollectionReference<Todo>;

  watchByUser(userId: string): Observable<Todo[]> {
    return this.run(() => collectionData(query(this.todos, where('userId', '==', userId)), { idField: 'id' })).pipe(
      map((todos) =>
        todos
          .map((todo): Todo => ({
            ...todo,
            dueDate: todo.dueDate ?? null,
            photo: todo.photo ?? null,
            location: todo.location ?? null,
          }))
          .sort((a, b) => b.createdAt - a.createdAt),
      ),
    );
  }

  createId(): string {
    return this.run(() => doc(this.collection).id);
  }

  async create(id: string, todo: TodoDocument): Promise<void> {
    await this.run(() => setDoc(doc(this.collection, id), todo));
  }

  update(id: string, changes: TodoChanges): Promise<void> {
    return this.run(() => updateDoc(doc(this.collection, id), changes));
  }

  remove(id: string): Promise<void> {
    return this.run(() => deleteDoc(doc(this.collection, id)));
  }

  private run<T>(operation: () => T): T {
    return runInInjectionContext(this.injector, operation);
  }
}
