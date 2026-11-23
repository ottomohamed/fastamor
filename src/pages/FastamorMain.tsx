import { useState, useEffect, lazy, Suspense } from 'react';
import { LandingView } from '@/views/LandingView';

// Loaded on demand: not needed for the first paint of the homepage.
const AppView = lazy(() => import('@/views/AppView').then(m => ({ default: m.AppView })));
const PrivacyView = lazy(() => import('@/views/PrivacyView').then(m => ({ default: m.PrivacyView })));
const AdminView = lazy(() => import('@/views/AdminView'));
const AdminGate = lazy(() => import('@/components/AdminGate'));
import { initTracking } from '@/lib/tracking';
import { I18N } from '@/lib/data';
import { useLocation } from 'wouter';
import { isLang, localizedPath, type Lang } from '@/lib/i18n-url';

type ViewState = 'landing' | 'app' | 'privacy' | 'admin';

export default function FastamorMain({ initialLang = 'en' }: { initialLang?: Lang }) {
  const [view, setView] = useState<ViewState>('landing');
  const [lang, setLangState] = useState<string>(initialLang);
  const [, setLocation] = useLocation();
  // Changing the UI language also moves to the language's URL (/ar, /fr, /es).
  const setLang = (l: string) => {
    setLangState(l);
    if (isLang(l)) setLocation(localizedPath('/', l), { replace: true });
  };
  const [initialSvc, setInitialSvc] = useState<string>('');
  const [clicks, setClicks] = useState(0);

  useEffect(() => { initTracking(); }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleOpenApp = (svc?: string) => {
    setInitialSvc(svc || '');
    setView('app');
    window.scrollTo(0, 0);
  };

  const handleAdminTrigger = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 5) {
      setClicks(0);
      setView('admin');
      window.scrollTo(0, 0);
    }
    setTimeout(() => setClicks(0), 3000);
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" aria-busy="true" />}>
      {view === 'landing' && (
        <LandingView onOpenApp={handleOpenApp} lang={lang} setLang={setLang}
          onOpenPrivacy={() => { setView('privacy'); window.scrollTo(0,0); }}
          adminTrigger={handleAdminTrigger} />
      )}
      {view === 'app' && (
        <AppView onClose={() => { setView('landing'); window.scrollTo(0,0); }}
          initialService={initialSvc} lang={lang} setLang={setLang} />
      )}
      {view === 'privacy' && (
        <PrivacyView onBack={() => { setView('landing'); window.scrollTo(0,0); }} />
      )}
      {view === 'admin' && (
        <AdminGate onClose={() => { setView('landing'); window.scrollTo(0,0); }}>
          <AdminView onClose={() => { setView('landing'); window.scrollTo(0,0); }} />
        </AdminGate>
      )}
    </Suspense>
  );
}
