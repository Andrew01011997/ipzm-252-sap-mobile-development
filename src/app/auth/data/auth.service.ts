import { EnvironmentInjector, Injectable, inject, runInInjectionContext, signal } from '@angular/core';
import type { User } from '@angular/fire/auth';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

import { AppStorage } from '../../core/storage/app-storage.service';

import type { Credentials, SignUpData, UserProfile } from './user-profile.model';

export const USER_ID_STORAGE_KEY = 'userId';
export const USERS_COLLECTION = 'users';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly storage = inject(AppStorage);
  private readonly injector = inject(EnvironmentInjector);
  private readonly userIdState = signal<string | null>(null);

  readonly user$ = authState(this.auth);
  readonly userId = this.userIdState.asReadonly();

  async restoreSession(): Promise<void> {
    const [user, storedUserId] = await Promise.all([
      firstValueFrom(this.user$),
      this.storage.get<string>(USER_ID_STORAGE_KEY),
    ]);
    if (user && user.uid === storedUserId) {
      this.userIdState.set(storedUserId);
    } else if (user) {
      await this.rememberUser(user);
    } else {
      await this.forgetUser();
    }
  }

  async login({ email, password }: Credentials): Promise<void> {
    const { user } = await this.run(() => signInWithEmailAndPassword(this.auth, email.trim(), password));
    await this.rememberUser(user);
  }

  async register(data: SignUpData): Promise<void> {
    const { user } = await this.run(() => createUserWithEmailAndPassword(this.auth, data.email.trim(), data.password));
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email ?? data.email.trim(),
      username: data.username.trim(),
      phone: data.phone.trim() || null,
      birthDate: data.birthDate || null,
      city: data.city.trim() || null,
      createdAt: Date.now(),
    };
    try {
      await this.run(() => updateProfile(user, { displayName: profile.username }));
      await this.run(() => setDoc(doc(this.firestore, USERS_COLLECTION, user.uid), profile));
    } catch (error) {
      await this.run(() => deleteUser(user));
      throw error;
    }
    await this.rememberUser(user);
  }

  async logout(): Promise<void> {
    await this.forgetUser();
    await this.run(() => signOut(this.auth));
  }

  private async rememberUser(user: User): Promise<void> {
    await this.storage.set(USER_ID_STORAGE_KEY, user.uid);
    this.userIdState.set(user.uid);
  }

  private async forgetUser(): Promise<void> {
    await this.storage.remove(USER_ID_STORAGE_KEY);
    this.userIdState.set(null);
  }

  private run<T>(operation: () => Promise<T>): Promise<T> {
    return runInInjectionContext(this.injector, operation);
  }
}
