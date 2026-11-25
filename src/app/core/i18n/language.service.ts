import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AppStorage } from '../storage/app-storage.service';

import type { Language } from './i18n.config';
import { DATE_LOCALES, DEFAULT_LANGUAGE, isLanguage } from './i18n.config';

export const LANGUAGE_STORAGE_KEY = 'language';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly storage = inject(AppStorage);
  private readonly document = inject(DOCUMENT);
  private readonly state = signal<Language>(DEFAULT_LANGUAGE);

  readonly current = this.state.asReadonly();
  readonly dateLocale = computed(() => DATE_LOCALES[this.state()]);

  async init(): Promise<void> {
    const stored = await this.storage.get<string>(LANGUAGE_STORAGE_KEY);
    await this.apply(isLanguage(stored) ? stored : DEFAULT_LANGUAGE);
  }

  async use(language: Language): Promise<void> {
    if (language === this.state()) {
      return;
    }
    await this.apply(language);
    await this.storage.set(LANGUAGE_STORAGE_KEY, language);
  }

  private async apply(language: Language): Promise<void> {
    await firstValueFrom(this.translate.use(language));
    this.document.documentElement.lang = language;
    this.state.set(language);
  }
}
