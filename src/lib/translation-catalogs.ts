import { filipino } from './translations';
import { waray } from './waray';
import type { Language } from './locales';

export const catalogs: Record<Language, Record<string, string>> = { en: {}, fil: filipino, war: waray };
const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
const english = new Map<string, string>();
for (const catalog of Object.values(catalogs)) {
  for (const [source, translated] of Object.entries(catalog)) english.set(normalize(translated), source);
}

/** Translate display text only; IDs, submitted values, names and unknown user content remain unchanged. */
export function translateText(value: string, language: Language): string {
  const key = normalize(value);
  const source = Object.values(catalogs).some(catalog => Object.prototype.hasOwnProperty.call(catalog, key)) ? key : english.get(key) || key;
  const translated = language === 'en' ? source : catalogs[language][source];
  return translated ? value.replace(value.trim(), translated) : value;
}
