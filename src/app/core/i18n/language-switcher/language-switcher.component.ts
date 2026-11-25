import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES } from '../i18n.config';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-language-switcher',
  template: `
    <div class="switcher" role="group" [attr.aria-label]="'language.label' | translate">
      @for (language of languages; track language) {
        <button
          type="button"
          [class.active]="language === service.current()"
          [attr.aria-pressed]="language === service.current()"
          [attr.lang]="language"
          [attr.title]="'language.names.' + language | translate"
          (click)="service.use(language)"
        >
          {{ labels[language] }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .switcher {
      display: inline-flex;
      padding: 2px;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      background: var(--app-bg-subtle);
    }

    button {
      min-width: 36px;
      height: 26px;
      padding: 0 10px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--app-muted);
      font: inherit;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition:
        background-color 0.15s ease,
        color 0.15s ease;
    }

    .active {
      background: var(--app-fg);
      color: var(--app-bg);
    }
  `,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherComponent {
  protected readonly service = inject(LanguageService);
  protected readonly languages = SUPPORTED_LANGUAGES;
  protected readonly labels = LANGUAGE_LABELS;
}
