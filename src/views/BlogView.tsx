import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Plane, MapPin, Eye, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function BlogView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar' | 'fr' | 'es'>('en');
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
    <div className="min-h-screen bg-[#fbf9f3] selection:bg-teal-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>

      {/* Announcement bar */}
      <div className="bg-[#0d9488] text-white text-center py-2.5 text-[10px] font-black uppercase tracking-[0.2em]">
        ✦ The Fastamor Travel Magazine — Expert guides, hotel reviews & AI-powered trip planning ✦
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#fbf9f3]/90 backdrop-blur-xl border-b border-[#bcc9c6]/20">
        <div className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl font-black tracking-tighter text-[#00685f]">
            FASTAMOR
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/blog" className="text-xs font-black uppercase tracking-widest text-[#00685f] border-b-2 border-[#00685f] pb-0.5">
              Magazine
            </Link>
            <Link href="/" className="text-xs font-black uppercase tracking-widest text-[#3d4947] hover:text-[#00685f] transition-colors">
              AI Concierge
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#f5f2e9] rounded-full p-1 border border-[#bcc9c6]/20">
              {(['en','ar','fr','es'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 text-[10px] font-black uppercase rounded-full transition-all ${lang === l ? 'bg-[#00685f] text-white shadow' : 'text-[#3d4947] hover:text-[#00685f]'}`}>
                  {l}
                </button>
              ))}
            </div>
            <Link href="/" className="hidden sm:block bg-[#1b1c19] text-white px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#00685f] transition-all">
              ✈️ Plan Trip
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero header */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="inline-block px-3 py-1 bg-teal-50 text-[#00685f] text-[10px] font-black uppercase tracking-[0.2em] mb-6 rounded-full">
          Travel Magazine
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1b1c19] leading-[1.05] tracking-tighter mb-4">
          {lang === 'ar' ? 'مجلة السفر' : lang === 'fr' ? 'Le Magazine' : lang === 'es' ? 'La Revista' : 'The Magazine.'}
        </h1>
        <p className="text-[#3d4947] text-lg font-medium opacity-70 max-w-xl">
          {lang === 'ar' ? 'أدلة وجهات حصرية، مراجعات فنادق، ونصائح سفر من خبرائنا حول العالم' :
           lang === 'fr' ? 'Guides exclusifs, critiques d\'hôtels et conseils de voyage par nos experts' :
           lang === 'es' ? 'Guías exclusivas, reseñas de hoteles y consejos de viaje de nuestros expertos' :
           'Exclusive destination guides, hotel reviews & travel tips from our global experts'}
        </p>
      </div>

      {/* Category filter */}
      <div className="max-w-7xl mx-auto px-6 mb-10">
        <div className="flex gap-2 flex-wrap border-b border-[#bcc9c6]/20 pb-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${
                category === cat.id
                  ? 'bg-[#1b1c19] text-white'
                  : 'text-[#3d4947] hover:text-[#1b1c19] hover:bg-[#f0eee8]'
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
              <div className="w-8 h-8 border-2 border-[#00685f] border-t-transparent rounded-full animate-spin"/>
              <p className="text-[10px] text-[#6d7a77] uppercase tracking-widest font-bold">Curating stories...</p>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-32">
            <Plane size={40} className="mx-auto mb-6 text-[#bcc9c6]"/>
            <p className="text-[#1b1c19] font-black text-xl mb-2">
              {lang === 'ar' ? 'لا توجد مقالات بعد' : 'No stories yet'}
            </p>
            <p className="text-[#6d7a77] text-sm">
              {lang === 'ar' ? 'ابدأ بكتابة مقالاتك من لوحة التحكم' : 'Start writing from the admin panel'}
            </p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
                <Link href={`/article/${featured.slug}`} className="block group">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-[#bcc9c6]/20 bg-white shadow-sm hover:shadow-xl transition-shadow">
                    {featured.featured_image ? (
                      <div className="relative h-72 lg:h-auto overflow-hidden">
                        <img src={featured.featured_image} alt={getTitle(featured)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"/>
                      </div>
                    ) : (
                      <div className="h-72 lg:h-auto bg-[#e1f5ee] flex items-center justify-center">
                        <Plane size={48} className="text-[#00685f] opacity-30"/>
                      </div>
                    )}
                    <div className="p-8 md:p-12 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-6">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00685f] bg-teal-50 px-3 py-1 rounded-full">
                            {CATEGORY_TAGS[featured.category] || 'Story'}
                          </span>
                          <span className="text-[10px] text-[#6d7a77] flex items-center gap-1 font-medium">
                            <Eye size={10}/> {featured.views || 0}
                          </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-[#1b1c19] leading-[1.15] mb-4 group-hover:text-[#00685f] transition-colors">
                          {getTitle(featured)}
                        </h2>
                        <p className="text-[#3d4947] leading-relaxed opacity-70 line-clamp-3 text-base">
                          {getExcerpt(featured)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-8 text-[#00685f] font-black text-xs uppercase tracking-widest group-hover:gap-3 transition-all">
                        {lang === 'ar' ? 'اقرأ المقال' : lang === 'fr' ? 'Lire l\'article' : lang === 'es' ? 'Leer artículo' : 'Read Story'}
                        <ArrowRight size={14} className={lang === 'ar' ? 'rotate-180' : ''}/>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rest.map((article, i) => (
                  <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link href={`/article/${article.slug}`} className="block group h-full">
                      <div className="bg-white border border-[#bcc9c6]/20 rounded-2xl overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                        {article.featured_image ? (
                          <div className="h-52 overflow-hidden">
                            <img src={article.featured_image} alt={getTitle(article)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
                          </div>
                        ) : (
                          <div className="h-52 bg-[#f0eee8] flex items-center justify-center">
                            <MapPin size={32} className="text-[#bcc9c6]"/>
                          </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00685f] bg-teal-50 px-2 py-0.5 rounded-full">
                              {CATEGORY_TAGS[article.category] || 'Story'}
                            </span>
                            <span className="text-[10px] text-[#bcc9c6] font-medium">
                              {new Date(article.published_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h3 className="font-serif font-black text-[#1b1c19] text-lg leading-tight mb-2 group-hover:text-[#00685f] transition-colors line-clamp-2 flex-1">
                            {getTitle(article)}
                          </h3>
                          <p className="text-[#6d7a77] text-sm line-clamp-2 mb-4 leading-relaxed">
                            {getExcerpt(article)}
                          </p>
                          <div className="flex items-center gap-1 text-[#00685f] text-[10px] font-black uppercase tracking-widest">
                            {lang === 'ar' ? 'اقرأ' : lang === 'fr' ? 'Lire' : lang === 'es' ? 'Leer' : 'Read'}
                            <ArrowRight size={10} className={lang === 'ar' ? 'rotate-180' : ''}/>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#1b1c19] text-[#bcc9c6] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-serif text-xl font-black text-white">FASTAMOR</div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
            © 2026 Fastamor. Editorial Travel Intelligence.
          </p>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-[#0d9488] hover:text-white transition-colors">
            ✈️ AI Concierge →
          </Link>
        </div>
      </footer>
    </div>
  );
}