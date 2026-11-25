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
};

export function authErrorKey(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? String((error as { code: unknown }).code) : '';
  return AUTH_ERROR_KEYS[code] ?? 'auth.errors.unknown';
}
