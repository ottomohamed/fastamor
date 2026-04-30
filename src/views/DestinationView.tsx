import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Star, DollarSign, MapPin, Calendar, Globe, ExternalLink } from 'lucide-react';
import { trackClick } from '@/lib/tracking';

interface Destination {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  country_ar: string;
  country_en: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  best_time_ar: string;
  best_time_en: string;
  currency: string;
  average_cost: number;
  rating: number;
  popular_attractions_ar?: string[];
  popular_attractions_en?: string[];
}

interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  featured_image: string | null;
  category: string;
}

export default function DestinationView({ slug }: { slug: string }) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar'>('en');

  useEffect(() => { loadData(); }, [slug]);

  const loadData = async () => {
    setLoading(true);
    const { data: dest } = await supabase
      .from('destinations')
      .select('*')
      .eq('slug', slug)
      // .eq('status', 'published')
      .single();

    if (dest) {
      setDestination(dest);
      const { data: arts } = await supabase
        .from('articles')
        .select('id,slug,title_ar,title_en,featured_image,category')
        .eq('destination_id', dest.id)
        // .eq('status', 'published')
        .limit(6);
      setArticles(arts || []);
    }
    setLoading(false);
  };

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!destination) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF7]">
      <p className="text-2xl font-black mb-4">Destination not found</p>
      <Link href="/blog" className="text-primary hover:underline">← Back</Link>
    </div>
  );

  const name = lang === 'ar' ? destination.name_ar : destination.name_en;
  const country = lang === 'ar' ? destination.country_ar : destination.country_en;
  const description = lang === 'ar' ? destination.description_ar : destination.description_en;
  const bestTime = lang === 'ar' ? destination.best_time_ar : destination.best_time_en;
  const attractions = lang === 'ar' ? destination.popular_attractions_ar : destination.popular_attractions_en;

  const flightUrl = `https://aviasales.tpx.gr/yQxrYmk7`;
  const hotelUrl = `https://intui.tpx.gr/kguAoKIU`;

  return (
    <div className="min-h-screen bg-[#FFFDF7]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-black/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
            <ArrowLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''}/>
            {t('الوجهات', 'Destinations')}
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-xs border border-border px-2 py-1 rounded-lg">
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      {destination.image_url && (
        <div className="relative h-80 overflow-hidden">
          <img src={destination.image_url} alt={name} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-sm font-medium opacity-80 flex items-center gap-1">
              <MapPin size={14}/>{country}
            </p>
            <h1 className="text-4xl font-black">{name}</h1>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill={i < Math.round(destination.rating || 0) ? 'white' : 'none'} color="white"/>
              ))}
              <span className="text-sm ml-1">{destination.rating}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
<div className="text-lg text-foreground leading-relaxed mb-8 prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: description }} />

            {attractions?.length ? (
              <div className="mb-8">
                <h2 className="text-xl font-black mb-4">{t('أبرز المعالم', 'Top Attractions')}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {attractions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-white border border-border rounded-xl">
                      <MapPin size={16} className="text-primary shrink-0"/>
                      <span className="text-sm font-medium">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Related articles */}
            {articles.length > 0 && (
              <div>
                <h2 className="text-xl font-black mb-4">{t('مقالات عن ' + name, 'Articles about ' + name)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articles.map(article => (
                    <Link key={article.id} href={`/article/${article.slug}`} className="block group">
                      <div className="rounded-xl overflow-hidden border border-border bg-white hover:shadow-md transition-shadow">
                        {article.featured_image && (
                          <img src={article.featured_image} alt="" className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-500"/>
                        )}
                        <div className="p-3">
                          <h3 className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">
                            {lang === 'ar' ? article.title_ar : article.title_en}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick info */}
            <div className="bg-white border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-black">{t('معلومات سريعة', 'Quick Info')}</h3>
              {bestTime && (
                <div className="flex items-start gap-2 text-sm">
                  <Calendar size={16} className="text-primary mt-0.5 shrink-0"/>
                  <div>
                    <p className="font-medium">{t('أفضل وقت للزيارة', 'Best time to visit')}</p>
                    <p className="text-muted">{bestTime}</p>
                  </div>
                </div>
              )}
              {destination.currency && (
                <div className="flex items-start gap-2 text-sm">
                  <Globe size={16} className="text-primary mt-0.5 shrink-0"/>
                  <div>
                    <p className="font-medium">{t('العملة', 'Currency')}</p>
                    <p className="text-muted">{destination.currency}</p>
                  </div>
                </div>
              )}
              {destination.average_cost > 0 && (
                <div className="flex items-start gap-2 text-sm">
                  <DollarSign size={16} className="text-primary mt-0.5 shrink-0"/>
                  <div>
                    <p className="font-medium">{t('متوسط التكلفة/يوم', 'Avg. cost/day')}</p>
                    <p className="text-muted">${destination.average_cost}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Book CTA */}
            <a href={flightUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => trackClick(flightUrl)}
              className="flex items-center gap-3 p-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
              <span className="text-2xl">✈️</span>
              <div>
                <p className="font-bold">{t('احجز رحلة إلى ' + name, 'Fly to ' + name)}</p>
                <p className="text-xs opacity-80">{t('أفضل الأسعار عبر Aviasales', 'Best prices via Aviasales')}</p>
              </div>
              <ExternalLink size={16} className="ml-auto"/>
            </a>

            <a href={hotelUrl} target="_blank" rel="noopener noreferrer"
              onClick={() => trackClick(hotelUrl)}
              className="flex items-center gap-3 p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <span className="text-2xl">🏨</span>
              <div>
                <p className="font-bold">{t('فنادق في ' + name, 'Hotels in ' + name)}</p>
                <p className="text-xs opacity-80">{t('أفضل العروض عبر Intui Travel', 'Best deals via Intui Travel')}</p>
              </div>
              <ExternalLink size={16} className="ml-auto"/>
            </a>

            {/* AI Chat promo */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
              <p className="font-bold text-sm mb-2">{t('خطط لرحلتك بالذكاء الاصطناعي', 'Plan your trip with AI')}</p>
              <Link href="/" className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:underline">
                {t('تحدث مع فاستامور', 'Chat with Fastamor')} →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
