export const SUPPORTED_LANGUAGES = ['uk', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'uk';
