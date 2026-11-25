import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { Storage, deleteObject, getDownloadURL, ref, uploadBytes } from '@angular/fire/storage';

import type { TodoPhoto } from '../todo.model';

export const TODO_PHOTOS_FOLDER = 'todos';

@Injectable({ providedIn: 'root' })
export class TodoPhotoStorage {
  private readonly storage = inject(Storage);
  private readonly injector = inject(EnvironmentInjector);

  async upload(userId: string, todoId: string, photo: Blob): Promise<TodoPhoto> {
    const path = `${TODO_PHOTOS_FOLDER}/${userId}/${todoId}`;
    const photoRef = this.run(() => ref(this.storage, path));
    await this.run(() => uploadBytes(photoRef, photo, { contentType: photo.type || 'image/jpeg' }));
    const url = await this.run(() => getDownloadURL(photoRef));
    return { url, path };
  }

  async remove(path: string): Promise<void> {
    try {
      await this.run(() => deleteObject(ref(this.storage, path)));
    } catch (error) {
      if ((error as { code?: string }).code !== 'storage/object-not-found') {
        throw error;
      }
    }
  }

  private run<T>(operation: () => T): T {
    return runInInjectionContext(this.injector, operation);
  }
}
