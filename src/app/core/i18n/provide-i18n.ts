import { DOCUMENT } from '@angular/common';
import type { EnvironmentProviders, Provider } from '@angular/core';
import { DestroyRef, inject, provideAppInitializer } from '@angular/core';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom } from 'rxjs';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './i18n.config';

export function provideI18n(): (Provider | EnvironmentProviders)[] {
  return [
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: 'assets/i18n/', suffix: '.json' }),
      langs: [...SUPPORTED_LANGUAGES],
      fallbackLang: DEFAULT_LANGUAGE,
    }),
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      const document = inject(DOCUMENT);
      const subscription = translate.onLangChange.subscribe(({ lang }) => {
        document.documentElement.lang = lang;
      });
      inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
      return firstValueFrom(translate.use(DEFAULT_LANGUAGE));
    }),
  ];
}
