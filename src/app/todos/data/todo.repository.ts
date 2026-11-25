import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import type { CollectionReference } from '@angular/fire/firestore';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';

import type { Todo } from '../todo.model';

export const TODOS_COLLECTION = 'todos';

export type TodoDocument = Omit<Todo, 'id'>;
export type TodoChanges = Partial<Pick<TodoDocument, 'title' | 'description' | 'completed'>>;

@Injectable({ providedIn: 'root' })
export class TodoRepository {
  private readonly firestore = inject(Firestore);
  private readonly injector = inject(EnvironmentInjector);
  private readonly collection = collection(this.firestore, TODOS_COLLECTION) as CollectionReference<TodoDocument>;
  private readonly todos = this.collection as CollectionReference<Todo>;

  watchByUser(userId: string): Observable<Todo[]> {
    return this.run(() => collectionData(query(this.todos, where('userId', '==', userId)), { idField: 'id' })).pipe(
      map((todos) => [...todos].sort((a, b) => b.createdAt - a.createdAt)),
    );
  }

  async create(todo: TodoDocument): Promise<void> {
    await this.run(() => addDoc(this.collection, todo));
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
