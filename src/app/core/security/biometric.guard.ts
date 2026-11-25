import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';

import { BiometricLock, LOCK_URL } from './biometric-lock.service';

export const biometricGuard: CanActivateFn = async (_route, state) => {
  const lock = inject(BiometricLock);
  const router = inject(Router);
  return (await lock.unlock()) || router.createUrlTree([LOCK_URL], { queryParams: { redirect: state.url } });
};
