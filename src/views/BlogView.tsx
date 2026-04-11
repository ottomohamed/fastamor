import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Clock, Eye, MapPin, Plane, Filter } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  category: string;
  featured_image: string | null;
  author_slug: string;
  views: number;
  published_at: string;
  tags_en?: string[];
  tags_ar?: string[];
}

const CATEGORIES = [
  { id: 'all', en: 'All', ar: 'الكل' },
  { id: 'destination_guide', en: 'Destinations', ar: 'الوجهات' },
  { id: 'hotel_review', en: 'Hotels', ar: 'الفنادق' },
  { id: 'travel_tips', en: 'Travel Tips', ar: 'نصائح' },
  { id: 'itinerary', en: 'Itineraries', ar: 'برامج رحلات' },
];

const CATEGORY_COLORS: Record<string, string> = {
  destination_guide: 'bg-teal-100 text-teal-800',
  hotel_review: 'bg-blue-100 text-blue-800',
  travel_tips: 'bg-amber-100 text-amber-800',
  itinerary: 'bg-purple-100 text-purple-800',
  news: 'bg-red-100 text-red-800',
};

export default function BlogView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    loadArticles();
  }, [category]);

  const loadArticles = async () => {
    setLoading(true);
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (category !== 'all') {
      query = query.eq('category', category);
    }

    const { data } = await query;
    setArticles(data || []);
    setLoading(false);
  };

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;
  const title = (a: Article) => lang === 'ar' ? a.title_ar : a.title_en;
  const excerpt = (a: Article) => lang === 'ar' ? a.excerpt_ar : a.excerpt_en;

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="min-h-screen bg-[#FFFDF7]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-black/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="https://i.ibb.co/x8sSqTDj/1978.png" alt="Fastamor" className="h-8 w-auto"/>
            <span className="font-black text-lg">Fastamor</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/blog" className="text-sm font-medium text-primary">
              {t('المدونة', 'Blog')}
            </Link>
            <Link href="/" className="text-sm text-muted hover:text-foreground">
              {t('الشات', 'Chat')}
            </Link>
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="text-xs border border-border px-2 py-1 rounded-lg hover:bg-surface"
            >
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero title */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-foreground mb-2">
            {t('مجلة فاستامور للسفر', 'Fastamor Travel Magazine')}
          </h1>
          <p className="text-muted text-lg">
            {t('أدلة السفر، مراجعات الفنادق، ونصائح من خبراء', 'Travel guides, hotel reviews, and expert tips')}
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                category === cat.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-foreground border-border hover:border-primary'
              }`}
            >
              {lang === 'ar' ? cat.ar : cat.en}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20">
            <Plane size={48} className="mx-auto mb-4 opacity-20"/>
            <p className="text-muted text-lg">{t('لا توجد مقالات بعد', 'No articles yet')}</p>
            <p className="text-sm text-muted mt-2">{t('ابدأ بكتابة مقالاتك من لوحة التحكم', 'Start writing articles from the admin panel')}</p>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <Link href={`/article/${featured.slug}`} className="block mb-10 group">
                <div className="rounded-2xl overflow-hidden border border-border bg-white hover:shadow-lg transition-shadow">
                  {featured.featured_image && (
                    <div className="h-72 overflow-hidden">
                      <img
                        src={featured.featured_image}
                        alt={title(featured)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[featured.category] || 'bg-gray-100 text-gray-700'}`}>
                        {CATEGORIES.find(c => c.id === featured.category)?.[lang] || featured.category}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Eye size={12}/> {featured.views || 0}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">
                      {title(featured)}
                    </h2>
                    <p className="text-muted line-clamp-2">{excerpt(featured)}</p>
                    <div className="flex items-center gap-2 mt-4 text-primary font-medium text-sm">
                      {t('اقرأ المقال', 'Read article')}
                      <ArrowRight size={16} className={lang === 'ar' ? 'rotate-180' : ''}/>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Article grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(article => (
                <Link key={article.id} href={`/article/${article.slug}`} className="block group">
                  <div className="rounded-xl overflow-hidden border border-border bg-white hover:shadow-md transition-shadow h-full">
                    {article.featured_image && (
                      <div className="h-44 overflow-hidden">
                        <img
                          src={article.featured_image}
                          alt={title(article)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[article.category] || 'bg-gray-100 text-gray-700'}`}>
                        {CATEGORIES.find(c => c.id === article.category)?.[lang] || article.category}
                      </span>
                      <h3 className="font-black text-foreground mt-2 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                        {title(article)}
                      </h3>
                      <p className="text-sm text-muted line-clamp-2">{excerpt(article)}</p>
                      <div className="flex items-center justify-between mt-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><Eye size={12}/>{article.views || 0}</span>
                        <span>{new Date(article.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted">
        <p>© 2026 Fastamor — {t('مجلة السفر الذكية', 'The Smart Travel Magazine')}</p>
      </footer>
    </div>
  );
}
