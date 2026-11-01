export const LANGUAGES = {
  en: { label: 'English', short: 'EN', htmlLang: 'en' },
  fil: { label: 'Tagalog', short: 'TL', htmlLang: 'tl' },
  war: { label: 'Waray-Waray', short: 'WAR', htmlLang: 'war' },
} as const;
export type Language = keyof typeof LANGUAGES;
export const isLanguage = (value: unknown): value is Language => typeof value === 'string' && Object.prototype.hasOwnProperty.call(LANGUAGES, value);
export const savedLanguage = (value: unknown): Language => value === 'tl' ? 'fil' : isLanguage(value) ? value : 'en';
