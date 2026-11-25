import type { PipeTransform } from '@angular/core';
import { Pipe, inject } from '@angular/core';
import type { ValidationErrors } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

export type ValidationMessages = Readonly<Record<string, string>>;

@Pipe({ name: 'validationMessage' })
export class ValidationMessagePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(errors: ValidationErrors | null | undefined, messages: ValidationMessages): string {
    if (!errors) {
      return '';
    }
    const error = Object.keys(messages).find((name) => name in errors);
    if (!error) {
      return '';
    }
    const details: unknown = errors[error];
    const params = typeof details === 'object' && details !== null ? details : undefined;
    return this.translate.instant(messages[error], params);
  }
}
