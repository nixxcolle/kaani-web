import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/language-context';
import { useText } from '@/lib/translate';

const titles: Record<string, string> = { '/': 'Home', '/market': 'Kaani Market', '/learning': 'Learning Hub', '/modules': 'Learning Modules', '/quiz': 'Knowledge Quiz', '/auth': 'Sign In', '/sustainability': 'Sustainability', '/legal': 'Legal Information', '/terms': 'Terms & Conditions' };
export default function RouteExperience() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  const tx = useText();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  useEffect(() => {
    document.title = `${tx(titles[pathname] || 'Page Not Found')} · KaAni Web`;
  }, [pathname, language, tx]);
  return <a className="skip-link" href="#page-content" onClick={(event) => {
    const main = document.querySelector<HTMLElement>('main, .site-content section');
    if (main) { event.preventDefault(); main.tabIndex = -1; main.focus(); main.scrollIntoView(); }
  }}>{tx('Skip to content')}</a>;
}
