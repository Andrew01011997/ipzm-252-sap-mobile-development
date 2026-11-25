import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';

export const PHONE_PATTERN = /^\+?[\d\s()-]{10,20}$/;

export function matchControl(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const other = control.parent?.get(otherControlName);
    if (!other || !control.value) {
      return null;
    }
    return control.value === other.value ? null : { mismatch: true };
  };
}

export function notInFuture(control: AbstractControl<string | null>): ValidationErrors | null {
  if (!control.value) {
    return null;
  }
  return control.value > todayIsoDate() ? { future: true } : null;
}

export const phone = Validators.pattern(PHONE_PATTERN);

export function todayIsoDate(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}
