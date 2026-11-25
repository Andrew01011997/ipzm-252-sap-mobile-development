import type { EnvironmentProviders, Provider } from '@angular/core';
import { inject, provideAppInitializer } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './i18n.config';
import { LanguageService } from './language.service';

export function provideI18n(): (Provider | EnvironmentProviders)[] {
  return [
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: 'assets/i18n/', suffix: '.json' }),
      langs: [...SUPPORTED_LANGUAGES],
      fallbackLang: DEFAULT_LANGUAGE,
    }),
    provideAppInitializer(() => inject(LanguageService).init()),
  ];
}
