import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { localizedPath, isLang } from '@/lib/i18n-url';

import { I18N, PARTNERS } from '@/lib/data';
import { trackClick } from '@/lib/tracking';
import { HeroAssistant } from '@/components/HeroAssistant';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Plane, Building2, Car, Ticket, Bus, Ship, MapPin, Eye, Menu, X } from 'lucide-react';

interface LandingViewProps {
  onOpenApp: (svc?: string) => void;
  lang: string;
  setLang: (l: string) => void;
  onOpenPrivacy: () => void;
  adminTrigger: () => void;
}

interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  category: string;
  featured_image: string | null;
  views: number;
  published_at: string;
}

interface Destination {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  country_ar: string;
  country_en: string;
  image_url: string;
  rating: number;
  average_cost: number;
}

interface SiteSettings {
  hero_image?: string;
  hero_title_en?: string;
  hero_title_ar?: string;
  flash_sale_text?: string;
}

const CATEGORY_TAGS: Record<string, string> = {
  destination_guide: 'Destination',
  hotel_review: 'Hotel',
  travel_tips: 'Tips',
  itinerary: 'Itinerary',
  news: 'News',
};

export function LandingView({ onOpenApp, lang, setLang, onOpenPrivacy, adminTrigger }: LandingViewProps) {
  const L = (p: string) => localizedPath(p, isLang(lang) ? lang : 'en');
  const t = I18N[lang as keyof typeof I18N] || I18N.en;
  const isRtl = lang === 'ar';

  const [menuOpen, setMenuOpen] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loadingContent, setLoadingContent] = useState(true);


  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoadingContent(true);
    const [articlesRes, destinationsRes, settingsRes] = await Promise.all([
      supabase.from('articles').select('id,slug,title_ar,title_en,excerpt_ar,excerpt_en,category,featured_image,views,published_at')
        .eq('status', 'published').order('published_at', { ascending: false }).limit(6),
      supabase.from('destinations').select('id,slug,name_ar,name_en,country_ar,country_en,image_url,rating,average_cost')
        .eq('status', 'published').order('rating', { ascending: false }).limit(6),
      supabase.from('settings').select('*').eq('id', 'site').single(),
    ]);
    if (articlesRes.data) setArticles(articlesRes.data);
    if (destinationsRes.data) setDestinations(destinationsRes.data);
    if (settingsRes.data?.value) setSettings(settingsRes.data.value);
    setLoadingContent(false);
  };

  const title = (a: Article) => isRtl ? a.title_ar : a.title_en;
  const excerpt = (a: Article) => isRtl ? a.excerpt_ar : a.excerpt_en;
  const destName = (d: Destination) => isRtl ? d.name_ar : d.name_en;
  const destCountry = (d: Destination) => isRtl ? d.country_ar : d.country_en;

  const featured = articles[0];
  const restArticles = articles.slice(1, 4);

  return (
    <div className="min-h-screen bg-[#F7F8FC] selection:bg-indigo-100 selection:text-indigo-900" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── Announcement: factual, no hype */}
      <a href={L('/car')} className="block bg-[#14204A] text-white text-center py-2.5 px-4 text-sm font-semibold hover:bg-[#3550C8] transition-colors">
        {({ ar: 'جديد: فاستامور كار، قارن أسعار كراء السيارات حول العالم', fr: 'Nouveau : Fastamor Car, comparez la location de voiture dans le monde', es: 'Nuevo: Fastamor Car, compara el alquiler de coches en todo el mundo' } as Record<string, string>)[lang] || 'New: Fastamor Car, compare car rental worldwide'}
      </a>

      {/* ── Navbar */}
      <nav className="sticky top-0 z-40 bg-[#F7F8FC]/90 backdrop-blur-xl border-b border-[#E1E4F0]/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={L('/')} className="font-serif text-2xl font-black tracking-tighter text-[#14204A]" aria-label="Fastamor">
            FASTAMOR
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#magazine" className="text-xs font-black text-[#353D5C] hover:text-[#3550C8] transition-colors">
              {isRtl ? 'المجلة' : 'Magazine'}
            </a>
            <a href="#destinations" className="text-xs font-black text-[#353D5C] hover:text-[#3550C8] transition-colors">
              {isRtl ? 'الوجهات' : 'Destinations'}
            </a>
            <a href="#services" className="text-xs font-black text-[#353D5C] hover:text-[#3550C8] transition-colors">
              {t.services}
            </a>
            <Link href={L('/blog')} className="text-xs font-black text-[#353D5C] hover:text-[#3550C8] transition-colors">
              {isRtl ? 'كل المقالات' : 'All Stories'}
            </Link>
            {/* Server-rendered page: full navigation, not a SPA route */}
            <a href={L('/car')} className="text-xs font-black bg-[#14204A] text-white px-3 py-1.5 rounded-full hover:bg-[#3550C8] transition-colors">
              Fastamor Car
            </a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-[#f5f2e9] rounded-full p-1 border border-[#E1E4F0]/20">
              {['en','ar','fr','es'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs font-black rounded-full transition-all ${lang === l ? 'bg-[#3550C8] text-white shadow' : 'text-[#353D5C] hover:text-[#3550C8]'}`}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={() => onOpenApp()}
              className="min-h-11 bg-[#14204A] text-white px-5 rounded-full font-bold text-sm hover:bg-[#3550C8] transition-colors">
              {t.join}
            </button>
            <button onClick={() => setMenuOpen(o => !o)} aria-expanded={menuOpen} aria-controls="mobile-menu"
              aria-label={isRtl ? 'القائمة' : 'Menu'}
              className="md:hidden grid place-items-center w-11 h-11 rounded-full text-[#14204A] hover:bg-[#EEF0F8]">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {/* Mobile menu: sections + crawlable language links */}
        {menuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-[#E1E4F0] bg-white px-6 py-4">
            <ul className="flex flex-col">
              {[
                { href: L('/blog'), label: isRtl ? 'المجلة' : ({ fr: 'Magazine', es: 'Revista' } as Record<string, string>)[lang] || 'Magazine', spa: true },
                { href: L('/flights'), label: ({ ar: 'خطوط الطيران', fr: 'Lignes aériennes', es: 'Rutas de vuelo' } as Record<string, string>)[lang] || 'Flight routes' },
                { href: L('/car'), label: 'Fastamor Car' },
              ].map(item => (
                <li key={item.href}>
                  {item.spa
                    ? <Link href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center min-h-12 text-base font-bold text-[#14204A]">{item.label}</Link>
                    : <a href={item.href} className="flex items-center min-h-12 text-base font-bold text-[#14204A]">{item.label}</a>}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2" role="group" aria-label={isRtl ? 'اللغة' : 'Language'}>
              {(['en', 'ar', 'fr', 'es'] as const).map(l => (
                <a key={l} href={localizedPath('/', l)} hrefLang={l} lang={l}
                  className={`flex-1 grid place-items-center min-h-12 rounded-xl text-sm font-bold ${lang === l ? 'bg-[#3550C8] text-white' : 'bg-[#EEF0F8] text-[#14204A]'}`}>
                  {{ en: 'English', ar: 'العربية', fr: 'Français', es: 'Español' }[l]}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main>
      {/* ── Hero: the AI assistant is the first thing visitors use */}
      <HeroAssistant lang={lang} onOpenApp={onOpenApp} />

      {/* ── Services Strip */}
      <div className="border-y border-[#E1E4F0] bg-white py-2 overflow-x-auto">
        <div className="flex gap-2 justify-start md:justify-center whitespace-nowrap px-4">
          {[1].map(k => (
            <div key={k} className="flex gap-2 items-center">
              {[
                { icon: <Plane size={13}/>, label: t.cheap_flights, svc: 'flight' },
                { icon: <Building2 size={13}/>, label: t.top_hotels, svc: 'hotel' },
                { icon: <Ticket size={13}/>, label: t.experiences, svc: 'experience' },
                { icon: <Car size={13}/>, label: t.car_rental, svc: 'taxi' },
                { icon: <Bus size={13}/>, label: t.trains_buses, svc: 'bus' },
                { icon: <Ship size={13}/>, label: t.cruises, svc: 'cruise' },
              ].map(({ icon, label, svc }) => (
                <button key={svc} onClick={() => onOpenApp(svc)}
                  className="min-h-11 flex items-center gap-2 px-4 rounded-full text-[#14204A] hover:bg-[#EEF0F8] hover:text-[#3550C8] transition-colors font-semibold text-sm">
                  <span className="text-[#3550C8]">{icon}</span> {label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Magazine Section */}
      <section id="magazine" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="inline-block px-3 py-1 bg-teal-50 text-[#3550C8] text-xs font-black mb-4 rounded-full">
              {isRtl ? 'مجلة فاستامور' : 'Fastamor Magazine'}
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-black text-[#14204A] leading-tight tracking-tighter">
              {isRtl ? 'أحدث المقالات' : 'Latest Stories.'}
            </h2>
          </div>
          <Link href={L('/blog')}
            className="hidden md:flex items-center gap-2 text-[#3550C8] font-black text-xs hover:gap-3 transition-all">
            {isRtl ? 'كل المقالات' : 'All Stories'}
            <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''}/>
          </Link>
        </div>

        {loadingContent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-[#E1E4F0]/20"/>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E1E4F0]/20">
            <Plane size={40} className="mx-auto mb-4 text-[#14204A]/60"/>
            <p className="font-black text-[#14204A] text-lg mb-2">
              {isRtl ? 'لا توجد مقالات بعد' : 'No stories yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured article */}
            {featured && (
              <Link href={L(`/article/${featured.slug}`)} className="lg:col-span-7 block group">
                <div className="relative rounded-3xl overflow-hidden h-[420px] border border-[#E1E4F0]/20 bg-[#EEF0F8]">
                  {featured.featured_image ? (
                    <img src={featured.featured_image} alt={title(featured)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                  ) : (
                    <div className="w-full h-full bg-[#EEF0F8] flex items-center justify-center">
                      <Plane size={48} className="text-[#3550C8] opacity-30"/>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#14204A]/85 via-[#14204A]/20 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="text-xs font-black text-[#3550C8] bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mb-3 inline-block">
                      {CATEGORY_TAGS[featured.category] || 'Story'}
                    </span>
                    <h3 className="text-2xl font-serif font-black text-white leading-tight mb-2 group-hover:text-[#F2A93B] transition-colors">
                      {title(featured)}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2">{excerpt(featured)}</p>
                    <div className="flex items-center gap-3 mt-4 text-white/50 text-xs">
                      <span className="flex items-center gap-1"><Eye size={10}/>{featured.views || 0}</span>
                      <span>{new Date(featured.published_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Side articles */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {restArticles.map(article => (
                <Link key={article.id} href={L(`/article/${article.slug}`)} className="block group flex-1">
                  <div className="flex gap-4 bg-white border border-[#E1E4F0]/20 rounded-2xl p-4 hover:shadow-md transition-shadow h-full">
                    {article.featured_image ? (
                      <img src={article.featured_image} alt={title(article)}
                        className="w-24 h-24 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="w-24 h-24 bg-[#EEF0F8] rounded-xl shrink-0 flex items-center justify-center">
                        <MapPin size={20} className="text-[#3550C8] opacity-50"/>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-black text-[#3550C8]">
                        {CATEGORY_TAGS[article.category] || 'Story'}
                      </span>
                      <h4 className="font-serif font-black text-[#14204A] text-sm leading-tight mt-1 mb-1 line-clamp-2 group-hover:text-[#3550C8] transition-colors">
                        {title(article)}
                      </h4>
                      <p className="text-xs text-[#5B6488] line-clamp-2">{excerpt(article)}</p>
                    </div>
                  </div>
                </Link>
              ))}

              <Link href={L('/blog')}
                className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#E1E4F0]/40 rounded-2xl text-[#5B6488] hover:border-[#3550C8] hover:text-[#3550C8] transition-all font-black text-xs">
                {isRtl ? 'كل المقالات' : 'View All Stories'} →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── Destinations Section */}
      <section id="destinations" className="py-24 bg-[#EEF0F8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-block px-3 py-1 bg-white text-[#3550C8] text-xs font-black mb-4 rounded-full">
                {isRtl ? 'وجهات مميزة' : 'Top Destinations'}
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-[#14204A] leading-tight tracking-tighter">
                {isRtl ? 'اكتشف العالم.' : 'Explore the World.'}
              </h2>
            </div>
          </div>

          {loadingContent ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl h-48 animate-pulse"/>
              ))}
            </div>
          ) : destinations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl">
              <MapPin size={40} className="mx-auto mb-4 text-[#14204A]/60"/>

            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {destinations.map((dest, i) => (
                <Link key={dest.id} href={L(`/destination/${dest.slug}`)} className="block group">
                  <div
                    className="fa-rise relative rounded-2xl overflow-hidden h-48 bg-[#EEF0F8] border border-[#E1E4F0]/20" style={{ animationDelay: `${(i * 0.05)}s` }}>
                    {dest.image_url ? (
                      <img src={dest.image_url} alt={destName(dest)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    ) : (
                      <div className="w-full h-full bg-[#EEF0F8] flex items-center justify-center">
                        <MapPin size={32} className="text-[#3550C8] opacity-30"/>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14204A]/80 to-transparent"/>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-serif font-black text-sm leading-tight">{destName(dest)}</p>
                      <p className="text-white/60 text-xs">{destCountry(dest)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Services Grid */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <div className="inline-block px-3 py-1 bg-teal-50 text-[#3550C8] text-xs font-black mb-6 rounded-full">
            Curated Services
          </div>
          <h2 className="text-5xl md:text-6xl font-serif font-black text-[#14204A] leading-[1.1] mb-6">{t.book_everything}</h2>
          <p className="text-[#353D5C] text-lg font-medium opacity-70 leading-relaxed">{t.itinerary_desc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { svc: 'flight', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&fit=crop', icon: <Plane size={20}/>, label: t.cheap_flights },
            { svc: 'hotel', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&fit=crop', icon: <Building2 size={20}/>, label: t.top_hotels },
            { svc: 'experience', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&fit=crop', icon: <Ticket size={20}/>, label: t.experiences },
            { svc: 'taxi', img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&fit=crop', icon: <Car size={20}/>, label: t.car_rental },
          ].map(({ svc, img, icon, label }) => (
            <button key={svc} onClick={() => onOpenApp(svc)}
              className="group relative h-72 rounded-3xl overflow-hidden bg-[#f5f2e9] border border-[#E1E4F0]/20 transition-all hover:shadow-2xl">
              <img src={img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={label}/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#14204A]/90 via-[#14204A]/20 to-transparent"/>
              <div className="absolute bottom-6 left-6">
                <div className="w-9 h-9 rounded-full bg-[#3550C8] text-white flex items-center justify-center mb-3 shadow-xl group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="text-lg font-black text-white tracking-wider">{label}</h3>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── AI CTA Banner */}
      <section className="mx-6 mb-24 rounded-3xl overflow-hidden relative">
        <div className="bg-[#3550C8] px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[#89f5e7] text-xs font-black mb-3">AI Travel Concierge</p>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
              {isRtl ? 'خطط لرحلتك بالذكاء الاصطناعي' : 'Plan Your Trip with AI.'}
            </h2>
            <p className="text-white/70 mt-3 max-w-md">
              {isRtl ? 'أخبرنا بوجهتك وسنجد لك أفضل الأسعار فوراً' : 'Tell us your destination and we\'ll find the best deals instantly.'}
            </p>
          </div>
          <button onClick={() => onOpenApp()}
            className="shrink-0 px-10 py-4 rounded-full bg-[#F2A93B] text-[#14204A] font-black text-sm hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-3">
            {t.hero_btn_start}
          </button>
        </div>
      </section>

      </main>

      {/* ── Footer */}
      <footer className="bg-[#14204A] text-[#14204A]/60 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="font-serif text-2xl font-black text-white mb-6 tracking-tighter">FASTAMOR</div>
              <p className="text-sm leading-relaxed opacity-60 font-medium">
                {isRtl ? 'المجلة الرقمية للمسافرين. ذكاء اصطناعي لتجارب سفر استثنائية.' : 'The Digital Travel Magazine. AI-powered experiences for global voyagers.'}
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-5 text-sm">{isRtl ? 'المجلة' : 'Magazine'}</h3>
              <ul className="space-y-3">
                <li><Link href={L('/blog')} className="text-sm hover:text-[#3550C8] transition-colors">{isRtl ? 'أحدث المقالات' : 'Latest Stories'}</Link></li>
                <li><Link href={L('/blog')} className="text-sm hover:text-[#3550C8] transition-colors">{isRtl ? 'الوجهات' : 'Destinations'}</Link></li>
                <li><Link href={L('/blog')} className="text-sm hover:text-[#3550C8] transition-colors">{isRtl ? 'نصائح السفر' : 'Travel Tips'}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-5 text-sm">{t.services}</h3>
              <ul className="space-y-3">
                <li><button onClick={() => onOpenApp('flight')} className="text-sm hover:text-[#3550C8] transition-colors">{t.cheap_flights}</button></li>
                <li><button onClick={() => onOpenApp('hotel')} className="text-sm hover:text-[#3550C8] transition-colors">{t.top_hotels}</button></li>
                <li><button onClick={() => onOpenApp('experience')} className="text-sm hover:text-[#3550C8] transition-colors">{t.experiences}</button></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-5 text-sm">{({ ar: 'معلومات', fr: 'Informations', es: 'Información' } as Record<string, string>)[lang] || 'Information'}</h3>
              <ul className="space-y-3">
                <li><button onClick={onOpenPrivacy} className="text-sm hover:text-[#3550C8] transition-colors">{t.privacy || 'Privacy Policy'}</button></li>
                <li><a href="mailto:contact@fastamor.com" className="text-sm hover:text-[#3550C8] transition-colors">{t.contact_us || 'Contact Us'}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/70 cursor-default" onClick={adminTrigger}>
              © 2026 Fastamor. {t.rights || 'All Rights Reserved.'}
            </p>
            <p className="text-sm text-white/70 max-w-xl">
              {({ ar: 'فاستامور مجاني للمسافرين: قد نحصل على عمولة من شركائنا عند الحجز، دون أي تكلفة إضافية عليك.', fr: 'Fastamor est gratuit : nous pouvons percevoir une commission de nos partenaires quand vous réservez, sans coût supplémentaire pour vous.', es: 'Fastamor es gratis: podemos recibir una comisión de nuestros socios cuando reservas, sin coste adicional para ti.' } as Record<string, string>)[lang] || 'Fastamor is free to use: we may earn a commission from partners when you book, at no extra cost to you.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
