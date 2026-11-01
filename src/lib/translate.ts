import { useLanguage } from './language-context';
import { useCallback } from 'react';
import { translateText } from './translation-catalogs';
export { translateText } from './translation-catalogs';

export function useText() {
  const { language } = useLanguage();
  return useCallback(<T,>(value: T): T => {
    if (typeof value === 'string') return translateText(value, language) as T;
    if (Array.isArray(value)) return value.map(item => typeof item === 'string' ? translateText(item, language) : item) as T;
    return value;
  }, [language]);
}
