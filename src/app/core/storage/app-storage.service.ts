import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class AppStorage {
  private readonly storage = inject(Storage);
  private ready?: Promise<Storage>;

  async get<T>(key: string): Promise<T | null> {
    const storage = await this.instance();
    return ((await storage.get(key)) as T | undefined) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const storage = await this.instance();
    await storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    const storage = await this.instance();
    await storage.remove(key);
  }

  private instance(): Promise<Storage> {
    this.ready ??= this.storage.create();
    return this.ready;
  }
}
