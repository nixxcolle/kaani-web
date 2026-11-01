import { Languages } from '@/components/icons';
import { useLanguage } from '@/lib/language-context';
import { LANGUAGES, isLanguage } from '@/lib/locales';
import { useText } from '@/lib/translate';

export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();
  const tx = useText();
  return <label className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-emerald-200 bg-white px-2 py-1.5 text-sm text-emerald-950 shadow-xs">
    <Languages aria-hidden="true" className="h-4 w-4 shrink-0" />
    <select aria-label={tx('Language')} value={language} onChange={event => { if (isLanguage(event.target.value)) setLanguage(event.target.value); }} className={`${compact ? 'w-[3.5rem]' : 'w-[7.5rem]'} min-h-7 min-w-0 bg-transparent text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded`}>
      {Object.entries(LANGUAGES).map(([code, locale]) => <option key={code} value={code} lang={locale.htmlLang}>{compact ? locale.short : locale.label}</option>)}
    </select>
  </label>;
}
