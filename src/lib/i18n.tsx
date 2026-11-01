import React, { useState, useEffect, useCallback, useMemo } from "react";
import { LanguageContext } from "./language-context";
import { LANGUAGES, savedLanguage, isLanguage, type Language } from './locales';
import { TRANSLATIONS } from './i18n-data';
import { translateText } from './translation-catalogs';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try { return savedLanguage(localStorage.getItem('kaani_lang')); } catch { return 'en'; }
  });
  const setLanguage = useCallback((lang: Language) => {
    if (!isLanguage(lang)) return;
    setLanguageState(lang);
    try { localStorage.setItem('kaani_lang', lang); } catch { /* In-memory switching still works when storage is blocked. */ }
    window.dispatchEvent(new CustomEvent('language-change', { detail: lang }));
  }, []);
  useEffect(() => { document.documentElement.lang = LANGUAGES[language].htmlLang; }, [language]);
  useEffect(() => {
    try { localStorage.removeItem('kaani_local_registered_users'); } catch { /* Optional legacy cache. */ }
    const sync = (event: StorageEvent) => { if (event.key === 'kaani_lang') setLanguageState(savedLanguage(event.newValue)); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const t = useCallback((key: string, fallback?: string) => TRANSLATIONS[language][key] || translateText(TRANSLATIONS.en[key] || fallback || key, language), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};
