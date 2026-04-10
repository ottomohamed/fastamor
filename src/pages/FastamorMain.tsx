import { useState, useEffect } from 'react';
import { LandingView } from '@/views/LandingView';
import { AppView } from '@/views/AppView';
import { PrivacyView } from '@/views/PrivacyView';
import AdminView from '@/views/AdminView';
import { initTracking } from '@/lib/tracking';
import { I18N } from '@/lib/data';

type ViewState = 'landing' | 'app' | 'privacy' | 'admin';

export default function FastamorMain() {
  const [view, setView] = useState<ViewState>('landing');
  const [lang, setLang] = useState('en');
  const [initialSvc, setInitialSvc] = useState<string>('');
  const [clicks, setClicks] = useState(0);

  useEffect(() => { initTracking(); }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
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
    <>
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
        <AdminView onClose={() => { setView('landing'); window.scrollTo(0,0); }} />
      )}
    </>
  );
}
