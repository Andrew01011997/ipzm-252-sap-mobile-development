const AUTH_ERROR_KEYS: Readonly<Record<string, string>> = {
  'auth/invalid-credential': 'auth.errors.invalidCredential',
  'auth/invalid-login-credentials': 'auth.errors.invalidCredential',
  'auth/user-not-found': 'auth.errors.invalidCredential',
  'auth/wrong-password': 'auth.errors.invalidCredential',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/network-request-failed': 'auth.errors.network',
  'auth/operation-not-allowed': 'auth.errors.operationNotAllowed',
  'auth/popup-blocked': 'auth.errors.popupBlocked',
  'auth/account-exists-with-different-credential': 'auth.errors.accountExists',
};

const CANCELLATION_CODES: ReadonlySet<string> = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

function errorCode(error: unknown): string {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';
}

export function authErrorKey(error: unknown): string {
  return AUTH_ERROR_KEYS[errorCode(error)] ?? 'auth.errors.unknown';
}

export function isAuthCancellation(error: unknown): boolean {
  return CANCELLATION_CODES.has(errorCode(error));
}
