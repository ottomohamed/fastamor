import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { localizedPath, type Lang } from '@/lib/i18n-url';

import { supabase } from '@/lib/supabase';
import { useDocumentMeta } from '@/hooks/use-document-meta';
import { ArrowRight, Plane, MapPin, Eye, Clock } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  title_es: string;   // ✅ أضف
  title_fr: string;   // ✅ أضف
  excerpt_ar: string;
  excerpt_en: string;
  excerpt_es: string; // ✅ أضف
  excerpt_fr: string; // ✅ أضف
  category: string;
  featured_image: string | null;
  author_slug: string;
  views: number;
  published_at: string;
}

const CATEGORIES = [
  { id: 'all', en: 'All Stories', ar: 'كل المقالات', fr: 'Tout', es: 'Todo' },
  { id: 'destination_guide', en: 'Destinations', ar: 'الوجهات', fr: 'Destinations', es: 'Destinos' },
  { id: 'hotel_review', en: 'Hotels', ar: 'الفنادق', fr: 'Hôtels', es: 'Hoteles' },
  { id: 'travel_tips', en: 'Travel Tips', ar: 'نصائح السفر', fr: 'Conseils', es: 'Consejos' },
  { id: 'itinerary', en: 'Itineraries', ar: 'برامج رحلات', fr: 'Itinéraires', es: 'Itinerarios' },
];

const CATEGORY_TAGS: Record<string, string> = {
  destination_guide: 'Destination Guide',
  hotel_review: 'Hotel Review',
  travel_tips: 'Travel Tips',
  itinerary: 'Itinerary',
  news: 'Travel News',
};

export default function BlogView({ lang: urlLang = 'en' }: { lang?: Lang }) {
  const [, setLocation] = useLocation();
  useDocumentMeta({
    title: 'Travel Blog — Guides, Tips & Itineraries',
    description: 'Travel guides, destination tips and itineraries from Fastamor, your AI travel concierge.',
    path: '/blog',
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const lang = urlLang;
  const setLang = (l: Lang) => setLocation(localizedPath('/blog', l));
  const L = (p: string) => localizedPath(p, lang);
  const [category, setCategory] = useState('all');

  useEffect(() => { loadArticles(); }, [category]);

  const loadArticles = async () => {
    setLoading(true);
    let query = supabase
      .from('articles')
      .select('*')
      // .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (category !== 'all') query = query.eq('category', category);
    const { data } = await query;
    setArticles(data || []);
    setLoading(false);
  };

  // ✅ التعديل الأساسي: دعم جميع اللغات للعنوان
  const getTitle = (a: Article) => {
    switch (lang) {
      case 'ar': return a.title_ar;
      case 'es': return a.title_es;
      case 'fr': return a.title_fr;
      default: return a.title_en;
    }
  };

  // ✅ التعديل الأساسي: دعم جميع اللغات للمقتطف
  const getExcerpt = (a: Article) => {
    switch (lang) {
      case 'ar': return a.excerpt_ar;
      case 'es': return a.excerpt_es;
      case 'fr': return a.excerpt_fr;
      default: return a.excerpt_en;
    }
  };

  const catLabel = (c: typeof CATEGORIES[0]) => c[lang as keyof typeof c] || c.en;

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="min-h-screen bg-[#F7F8FC] selection:bg-indigo-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* Announcement bar */}
      <div className="bg-[#3550C8] text-white text-center py-2.5 text-xs font-black">
        The Fastamor Travel Magazine — Expert guides, hotel reviews & AI-powered trip planning
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#F7F8FC]/90 backdrop-blur-xl border-b border-[#E1E4F0]/20">
        <div className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <Link href={L('/')} className="font-serif text-2xl font-black tracking-tighter text-[#3550C8]">
            FASTAMOR
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href={L('/blog')} className="text-xs font-black text-[#3550C8] border-b-2 border-[#3550C8] pb-0.5">
              Magazine
            </Link>
            <Link href={L('/')} className="text-xs font-black text-[#353D5C] hover:text-[#3550C8] transition-colors">
              AI Concierge
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#f5f2e9] rounded-full p-1 border border-[#E1E4F0]/20">
              {(['en','ar','fr','es'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs font-black rounded-full transition-all ${lang === l ? 'bg-[#3550C8] text-white shadow' : 'text-[#353D5C] hover:text-[#3550C8]'}`}>
                  {l}
                </button>
              ))}
            </div>
            <Link href={L('/')} className="hidden sm:block bg-[#14204A] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#3550C8] transition-all">
              Plan Trip
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero header */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="inline-block px-3 py-1 bg-teal-50 text-[#3550C8] text-xs font-black mb-6 rounded-full">
          Travel Magazine
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-black text-[#14204A] leading-[1.05] tracking-tighter mb-4">
          {lang === 'ar' ? 'مجلة السفر' : lang === 'fr' ? 'Le Magazine' : lang === 'es' ? 'La Revista' : 'The Magazine.'}
        </h1>
        <p className="text-[#353D5C] text-lg font-medium opacity-70 max-w-xl">
          {lang === 'ar' ? 'أدلة وجهات حصرية، مراجعات فنادق، ونصائح سفر من خبرائنا حول العالم' :
           lang === 'fr' ? 'Guides exclusifs, critiques d\'hôtels et conseils de voyage par nos experts' :
           lang === 'es' ? 'Guías exclusivas, reseñas de hoteles y consejos de viaje de nuestros expertos' :
           'Exclusive destination guides, hotel reviews & travel tips from our global experts'}
        </p>
      </div>

      {/* Category filter */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex gap-2 flex-wrap border-b border-[#E1E4F0]/20 pb-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-[11px] font-black tracking-wider transition-all ${
                category === cat.id
                  ? 'bg-[#14204A] text-white'
                  : 'text-[#353D5C] hover:text-[#14204A] hover:bg-[#EEF0F8]'
              }`}>
              {catLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-[#3550C8] border-t-transparent rounded-full animate-spin"/>
              <p className="text-xs text-[#5B6488] font-bold">Curating stories...</p>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-32">
            <Plane size={40} className="mx-auto mb-6 text-[#14204A]/60"/>
            <p className="text-[#14204A] font-black text-xl mb-2">
              {lang === 'ar' ? 'لا توجد مقالات بعد' : 'No stories yet'}
            </p>
            <p className="text-[#5B6488] text-sm">
              {lang === 'ar' ? 'ابدأ بكتابة مقالاتك من لوحة التحكم' : 'Start writing from the admin panel'}
            </p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <div className="fa-rise mb-16">
                <Link href={L(`/article/${featured.slug}`)} className="block group">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-[#E1E4F0]/20 bg-white shadow-sm hover:shadow-xl transition-shadow">
                    {featured.featured_image ? (
                      <div className="relative h-72 lg:h-auto overflow-hidden">
                        <img src={featured.featured_image} alt={getTitle(featured)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"/>
                      </div>
                    ) : (
                      <div className="h-72 lg:h-auto bg-[#EEF0F8] flex items-center justify-center">
                        <Plane size={48} className="text-[#3550C8] opacity-30"/>
                      </div>
                    )}
                    <div className="p-8 md:p-12 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-xs font-black text-[#3550C8] bg-teal-50 px-3 py-1 rounded-full">
                            {CATEGORY_TAGS[featured.category] || 'Story'}
                          </span>
                          <span className="text-xs text-[#5B6488] flex items-center gap-1 font-medium">
                            <Eye size={10}/> {featured.views || 0}
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-[#14204A] leading-[1.15] mb-4 group-hover:text-[#3550C8] transition-colors">
                          {getTitle(featured)}
                        </h2>
                        <p className="text-[#353D5C] leading-relaxed opacity-70 line-clamp-3 text-base">
                          {getExcerpt(featured)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-8 text-[#3550C8] font-black text-xs group-hover:gap-3 transition-all">
                        {lang === 'ar' ? 'اقرأ المقال' : lang === 'fr' ? 'Lire l\'article' : lang === 'es' ? 'Leer artículo' : 'Read Story'}
                        <ArrowRight size={14} className={lang === 'ar' ? 'rotate-180' : ''}/>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((article, i) => (
                  <div className="fa-rise" key={article.id} style={{ animationDelay: `${(i * 0.05)}s` }}>
                    <Link href={L(`/article/${article.slug}`)} className="block group h-full">
                      <div className="bg-white border border-[#E1E4F0]/20 rounded-2xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                        {article.featured_image ? (
                          <div className="h-52 overflow-hidden">
                            <img src={article.featured_image} alt={getTitle(article)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                          </div>
                        ) : (
                          <div className="h-52 bg-[#EEF0F8] flex items-center justify-center">
                            <MapPin size={32} className="text-[#14204A]/60"/>
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-[#3550C8] bg-teal-50 px-2 py-0.5 rounded-full">
                              {CATEGORY_TAGS[article.category] || 'Story'}
                            </span>
                            <span className="text-xs text-[#14204A]/60 font-medium">
                              {new Date(article.published_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-serif font-black text-[#14204A] text-lg leading-tight mb-2 group-hover:text-[#3550C8] transition-colors line-clamp-2 flex-1">
                            {getTitle(article)}
                          </h3>
                          <p className="text-[#5B6488] text-sm line-clamp-2 mb-4 leading-relaxed">
                            {getExcerpt(article)}
                          </p>
                          <div className="flex items-center gap-1 text-[#3550C8] text-xs font-black">
                            {lang === 'ar' ? 'اقرأ' : lang === 'fr' ? 'Lire' : lang === 'es' ? 'Leer' : 'Read'}
                            <ArrowRight size={10} className={lang === 'ar' ? 'rotate-180' : ''}/>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#14204A] text-[#14204A]/60 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-serif text-xl font-black text-white">FASTAMOR</div>
          <p className="text-xs font-black opacity-40">
            © 2026 Fastamor. Editorial Travel Intelligence.
          </p>
          <Link href={L('/')} className="text-xs font-black text-[#3550C8] hover:text-white transition-colors">
            AI Concierge →
          </Link>
        </div>
      </footer>
    </div>
  );
}