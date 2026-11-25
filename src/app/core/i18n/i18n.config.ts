export const SUPPORTED_LANGUAGES = ['uk', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'uk';

export const DATE_LOCALES: Readonly<Record<Language, string>> = {
  uk: 'uk',
  en: 'en-US',
};

export const LANGUAGE_LABELS: Readonly<Record<Language, string>> = {
  uk: 'UA',
  en: 'EN',
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
