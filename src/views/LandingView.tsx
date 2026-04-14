import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { I18N, PARTNERS } from '@/lib/data';
import { trackClick } from '@/lib/tracking';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Plane, Building2, Car, Ticket, Bus, Ship, MapPin, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const t = I18N[lang as keyof typeof I18N] || I18N.en;
  const isRtl = lang === 'ar';

  const [articles, setArticles] = useState<Article[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loadingContent, setLoadingContent] = useState(true);

  // Default images — قابلة للتغيير من لوحة التحكم
  const heroImage = settings.hero_image || "https://i.ibb.co/WWJBNxwT/1977.png";

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
    <div className="min-h-screen bg-[#fbf9f3] selection:bg-teal-100 selection:text-teal-900" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── Announcement Bar */}
      <a href="https://aviasales.tpx.gr/s8LtyZGl" target="_blank" rel="noopener"
        onClick={() => trackClick('https://aviasales.tpx.gr/s8LtyZGl')}
        className="block bg-[#0d9488] text-white text-center py-2.5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0f766e] transition-colors">
        {settings.flash_sale_text || t.flash_sale || '✦ FLASH SALE: EXPLORE THE WORLD FOR LESS — BOOK NOW ✦'}
      </a>

      {/* ── Navbar */}
      <nav className="sticky top-0 z-40 bg-[#fbf9f3]/90 backdrop-blur-xl border-b border-[#bcc9c6]/20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-serif text-2xl font-black tracking-tighter text-[#00685f] cursor-pointer" onClick={() => onOpenApp()}>
            FASTAMOR
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#magazine" className="text-xs font-black uppercase tracking-widest text-[#3d4947] hover:text-[#00685f] transition-colors">
              {isRtl ? 'المجلة' : 'Magazine'}
            </a>
            <a href="#destinations" className="text-xs font-black uppercase tracking-widest text-[#3d4947] hover:text-[#00685f] transition-colors">
              {isRtl ? 'الوجهات' : 'Destinations'}
            </a>
            <a href="#services" className="text-xs font-black uppercase tracking-widest text-[#3d4947] hover:text-[#00685f] transition-colors">
              {t.services}
            </a>
            <Link href="/blog" className="text-xs font-black uppercase tracking-widest text-[#3d4947] hover:text-[#00685f] transition-colors">
              {isRtl ? 'كل المقالات' : 'All Stories'}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-[#f5f2e9] rounded-full p-1 border border-[#bcc9c6]/20">
              {['en','ar','fr','es'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 text-[10px] font-black uppercase rounded-full transition-all ${lang === l ? 'bg-[#00685f] text-white shadow' : 'text-[#3d4947] hover:text-[#00685f]'}`}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={() => onOpenApp()}
              className="bg-[#1b1c19] text-white px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#00685f] hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              {t.join}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Travel" className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-[#1b1c19]/35"/>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-[10px] uppercase tracking-[0.3em] mb-8">
            {t.hero_badge || 'The Digital Travel Magazine'}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-serif font-black text-white leading-[0.9] mb-8 tracking-tighter">
            {settings.hero_title_en && !isRtl ? settings.hero_title_en :
             settings.hero_title_ar && isRtl ? settings.hero_title_ar :
             t.hero_title || 'Elevate Your'} <br/>
            <span className="italic text-[#ffd23f]">Journey.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/90 max-w-xl mb-12 font-medium leading-relaxed">
            {t.hero_desc}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start gap-4">
            <button onClick={() => onOpenApp()}
              className="px-10 py-4 rounded-full bg-[#0d9488] text-white font-black text-sm uppercase tracking-widest hover:bg-[#0f766e] hover:shadow-2xl transition-all flex items-center gap-3 transform hover:-translate-y-1">
              🚀 {t.hero_btn_start}
            </button>
            <a href="#magazine"
              className="px-10 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white font-black text-sm uppercase tracking-widest hover:bg-white/20 transition-all text-center">
              {isRtl ? 'اقرأ المجلة' : 'Read Magazine'}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Services Strip */}
      <div className="border-y border-[#bcc9c6]/15 bg-white py-5 overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap px-4 animate-marquee">
          {[1,2,3].map(k => (
            <div key={k} className="flex gap-14 items-center">
              {[
                { icon: <Plane size={13}/>, label: t.cheap_flights, svc: 'flight' },
                { icon: <Building2 size={13}/>, label: t.top_hotels, svc: 'hotel' },
                { icon: <Ticket size={13}/>, label: t.experiences, svc: 'experience' },
                { icon: <Car size={13}/>, label: t.car_rental, svc: 'taxi' },
                { icon: <Bus size={13}/>, label: t.trains_buses, svc: 'bus' },
                { icon: <Ship size={13}/>, label: t.cruises, svc: 'cruise' },
              ].map(({ icon, label, svc }) => (
                <button key={svc} onClick={() => onOpenApp(svc)}
                  className="flex items-center gap-2 text-[#1b1c19] hover:text-[#0d9488] transition-colors font-black uppercase tracking-widest text-[10px]">
                  <span className="text-[#0d9488]">{icon}</span> {label}
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
            <div className="inline-block px-3 py-1 bg-teal-50 text-[#00685f] text-[10px] font-black uppercase tracking-[0.2em] mb-4 rounded-full">
              {isRtl ? 'مجلة فاستامور' : 'Fastamor Magazine'}
            </div>
            <h2 className="text-4xl md:text-6xl font-serif font-black text-[#1b1c19] leading-tight tracking-tighter">
              {isRtl ? 'أحدث المقالات' : 'Latest Stories.'}
            </h2>
          </div>
          <Link href="/blog"
            className="hidden md:flex items-center gap-2 text-[#00685f] font-black text-xs uppercase tracking-widest hover:gap-3 transition-all">
            {isRtl ? 'كل المقالات' : 'All Stories'}
            <ArrowRight size={14} className={isRtl ? 'rotate-180' : ''}/>
          </Link>
        </div>

        {loadingContent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-[#bcc9c6]/20"/>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#bcc9c6]/20">
            <Plane size={40} className="mx-auto mb-4 text-[#bcc9c6]"/>
            <p className="font-black text-[#1b1c19] text-lg mb-2">
              {isRtl ? 'لا توجد مقالات بعد' : 'No stories yet'}
            </p>
            <p className="text-[#6d7a77] text-sm mb-6">
              {isRtl ? 'ابدأ بكتابة مقالاتك من لوحة التحكم' : 'Start publishing from your admin panel'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured article */}
            {featured && (
              <Link href={`/article/${featured.slug}`} className="lg:col-span-7 block group">
                <div className="relative rounded-3xl overflow-hidden h-[420px] border border-[#bcc9c6]/20 bg-[#f0eee8]">
                  {featured.featured_image ? (
                    <img src={featured.featured_image} alt={title(featured)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                  ) : (
                    <div className="w-full h-full bg-[#e1f5ee] flex items-center justify-center">
                      <Plane size={48} className="text-[#00685f] opacity-30"/>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c19]/85 via-[#1b1c19]/20 to-transparent"/>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0d9488] bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mb-3 inline-block">
                      {CATEGORY_TAGS[featured.category] || 'Story'}
                    </span>
                    <h3 className="text-2xl font-serif font-black text-white leading-tight mb-2 group-hover:text-[#ffd23f] transition-colors">
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
                <Link key={article.id} href={`/article/${article.slug}`} className="block group flex-1">
                  <div className="flex gap-4 bg-white border border-[#bcc9c6]/20 rounded-2xl p-4 hover:shadow-md transition-shadow h-full">
                    {article.featured_image ? (
                      <img src={article.featured_image} alt={title(article)}
                        className="w-24 h-24 object-cover rounded-xl shrink-0 group-hover:scale-105 transition-transform duration-500"/>
                    ) : (
                      <div className="w-24 h-24 bg-[#e1f5ee] rounded-xl shrink-0 flex items-center justify-center">
                        <MapPin size={20} className="text-[#00685f] opacity-50"/>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#00685f]">
                        {CATEGORY_TAGS[article.category] || 'Story'}
                      </span>
                      <h4 className="font-serif font-black text-[#1b1c19] text-sm leading-tight mt-1 mb-1 line-clamp-2 group-hover:text-[#00685f] transition-colors">
                        {title(article)}
                      </h4>
                      <p className="text-xs text-[#6d7a77] line-clamp-2">{excerpt(article)}</p>
                    </div>
                  </div>
                </Link>
              ))}

              <Link href="/blog"
                className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[#bcc9c6]/40 rounded-2xl text-[#6d7a77] hover:border-[#00685f] hover:text-[#00685f] transition-all font-black text-xs uppercase tracking-widest">
                {isRtl ? 'كل المقالات' : 'View All Stories'} →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── Destinations Section */}
      <section id="destinations" className="py-24 bg-[#f0eee8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-block px-3 py-1 bg-white text-[#00685f] text-[10px] font-black uppercase tracking-[0.2em] mb-4 rounded-full">
                {isRtl ? 'وجهات مميزة' : 'Top Destinations'}
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-black text-[#1b1c19] leading-tight tracking-tighter">
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
              <MapPin size={40} className="mx-auto mb-4 text-[#bcc9c6]"/>
              <p className="text-[#6d7a77] text-sm">
                {isRtl ? 'أضف وجهات من لوحة التحكم' : 'Add destinations from admin panel'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {destinations.map((dest, i) => (
                <Link key={dest.id} href={`/destination/${dest.slug}`} className="block group">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="relative rounded-2xl overflow-hidden h-48 bg-[#e1f5ee] border border-[#bcc9c6]/20">
                    {dest.image_url ? (
                      <img src={dest.image_url} alt={destName(dest)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                    ) : (
                      <div className="w-full h-full bg-[#e1f5ee] flex items-center justify-center">
                        <MapPin size={32} className="text-[#00685f] opacity-30"/>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c19]/80 to-transparent"/>
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-serif font-black text-sm leading-tight">{destName(dest)}</p>
                      <p className="text-white/60 text-[10px]">{destCountry(dest)}</p>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Services Grid */}
      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl mb-16">
          <div className="inline-block px-3 py-1 bg-teal-50 text-[#00685f] text-[10px] font-black uppercase tracking-[0.2em] mb-6 rounded-full">
            Curated Services
          </div>
          <h2 className="text-5xl md:text-6xl font-serif font-black text-[#1b1c19] leading-[1.1] mb-6">{t.book_everything}</h2>
          <p className="text-[#3d4947] text-lg font-medium opacity-70 leading-relaxed">{t.itinerary_desc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { svc: 'flight', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&fit=crop', icon: <Plane size={20}/>, label: t.cheap_flights },
            { svc: 'hotel', img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&fit=crop', icon: <Building2 size={20}/>, label: t.top_hotels },
            { svc: 'experience', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800&fit=crop', icon: <Ticket size={20}/>, label: t.experiences },
            { svc: 'taxi', img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&fit=crop', icon: <Car size={20}/>, label: t.car_rental },
          ].map(({ svc, img, icon, label }) => (
            <button key={svc} onClick={() => onOpenApp(svc)}
              className="group relative h-72 rounded-3xl overflow-hidden bg-[#f5f2e9] border border-[#bcc9c6]/20 transition-all hover:shadow-2xl">
              <img src={img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt={label}/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c19]/90 via-[#1b1c19]/20 to-transparent"/>
              <div className="absolute bottom-6 left-6">
                <div className="w-9 h-9 rounded-full bg-[#0d9488] text-white flex items-center justify-center mb-3 shadow-xl group-hover:scale-110 transition-transform">{icon}</div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">{label}</h3>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── AI CTA Banner */}
      <section className="mx-6 mb-24 rounded-3xl overflow-hidden relative">
        <div className="bg-[#00685f] px-8 md:px-16 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-[#89f5e7] text-xs font-black uppercase tracking-[0.2em] mb-3">AI Travel Concierge</p>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-white leading-tight">
              {isRtl ? 'خطط لرحلتك بالذكاء الاصطناعي' : 'Plan Your Trip with AI.'}
            </h2>
            <p className="text-white/70 mt-3 max-w-md">
              {isRtl ? 'أخبرنا بوجهتك وسنجد لك أفضل الأسعار فوراً' : 'Tell us your destination and we\'ll find the best deals instantly.'}
            </p>
          </div>
          <button onClick={() => onOpenApp()}
            className="shrink-0 px-10 py-4 rounded-full bg-[#ffd23f] text-[#1b1c19] font-black text-sm uppercase tracking-widest hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-3">
            🚀 {t.hero_btn_start}
          </button>
        </div>
      </section>

      {/* ── Footer */}
      <footer className="bg-[#1b1c19] text-[#bcc9c6] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-1">
              <div className="font-serif text-2xl font-black text-white mb-6 tracking-tighter">FASTAMOR</div>
              <p className="text-sm leading-relaxed opacity-60 font-medium">
                {isRtl ? 'المجلة الرقمية للمسافرين. ذكاء اصطناعي لتجارب سفر استثنائية.' : 'The Digital Travel Magazine. AI-powered experiences for global voyagers.'}
              </p>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 uppercase tracking-widest text-[10px]">{isRtl ? 'المجلة' : 'Magazine'}</h4>
              <ul className="space-y-3">
                <li><Link href="/blog" className="text-sm hover:text-[#0d9488] transition-colors">{isRtl ? 'أحدث المقالات' : 'Latest Stories'}</Link></li>
                <li><Link href="/blog" className="text-sm hover:text-[#0d9488] transition-colors">{isRtl ? 'الوجهات' : 'Destinations'}</Link></li>
                <li><Link href="/blog" className="text-sm hover:text-[#0d9488] transition-colors">{isRtl ? 'نصائح السفر' : 'Travel Tips'}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 uppercase tracking-widest text-[10px]">{t.services}</h4>
              <ul className="space-y-3">
                <li><button onClick={() => onOpenApp('flight')} className="text-sm hover:text-[#0d9488] transition-colors">{t.cheap_flights}</button></li>
                <li><button onClick={() => onOpenApp('hotel')} className="text-sm hover:text-[#0d9488] transition-colors">{t.top_hotels}</button></li>
                <li><button onClick={() => onOpenApp('experience')} className="text-sm hover:text-[#0d9488] transition-colors">{t.experiences}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-black mb-6 uppercase tracking-widest text-[10px]">Legal</h4>
              <ul className="space-y-3">
                <li><button onClick={onOpenPrivacy} className="text-sm hover:text-[#0d9488] transition-colors">{t.privacy || 'Privacy Policy'}</button></li>
                <li><a href="mailto:contact@fastamor.com" className="text-sm hover:text-[#0d9488] transition-colors">{t.contact_us || 'Contact Us'}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors" onClick={adminTrigger}>
              © 2026 Fastamor. {t.rights || 'All Rights Reserved.'}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
              {t.powered_by || 'Editorial Travel Intelligence'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
