import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Eye, Heart, Share2, MapPin, ExternalLink } from 'lucide-react';
import { trackClick } from '@/lib/tracking';

interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  category: string;
  featured_image: string | null;
  author_slug: string;
  views: number;
  likes: number;
  published_at: string;
  affiliate_links?: { platform: string; url: string }[];
  tags_en?: string[];
  tags_ar?: string[];
}

const AFFILIATE_BANNERS = [
  { name: 'Aviasales', desc: 'Find cheapest flights', url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: '✈️', color: 'bg-orange-50 border-orange-200' },
  { name: 'Intui Travel', desc: 'Best hotel deals', url: 'https://intui.tpx.gr/kguAoKIU', icon: '🏨', color: 'bg-blue-50 border-blue-200' },
  { name: 'Klook', desc: 'Tours & activities', url: 'https://klook.tpx.gr/vRUzaJbI', icon: '🎡', color: 'bg-red-50 border-red-200' },
  { name: 'GetTransfer', desc: 'Airport transfers', url: 'https://gettransfer.tpx.gr/9poAnD5l', icon: '🚕', color: 'bg-yellow-50 border-yellow-200' },
];

export default function ArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (data) {
      setArticle(data);
      // increment views
      supabase.from('articles').update({ views: (data.views || 0) + 1 }).eq('id', data.id);
    }
    setLoading(false);
  };

  const handleLike = async () => {
    if (!article || liked) return;
    setLiked(true);
    await supabase.from('articles').update({ likes: (article.likes || 0) + 1 }).eq('id', article.id);
    setArticle({ ...article, likes: (article.likes || 0) + 1 });
  };

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF7]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF7]">
        <p className="text-2xl font-black mb-4">Article not found</p>
        <Link href="/blog" className="text-primary hover:underline">← Back to blog</Link>
      </div>
    );
  }

  const title = lang === 'ar' ? article.title_ar : article.title_en;
  const body = lang === 'ar' ? article.body_ar : article.body_en;

  return (
    <div className="min-h-screen bg-[#FFFDF7]" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-black/10 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-sm text-muted hover:text-foreground">
            <ArrowLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''}/>
            {t('العودة للمدونة', 'Back to blog')}
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-xs border border-border px-2 py-1 rounded-lg">
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <Link href="/" className="text-xs bg-primary text-white px-3 py-1 rounded-lg font-medium">
              {t('ابحث عن رحلة', 'Search flights')} ✈️
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {article.featured_image && (
              <img src={article.featured_image} alt={title} className="w-full h-64 object-cover rounded-2xl mb-6"/>
            )}

            <h1 className="text-3xl font-black text-foreground mb-4">{title}</h1>

            <div className="flex items-center gap-4 text-sm text-muted mb-8 pb-4 border-b border-border">
              <span className="flex items-center gap-1"><Eye size={14}/> {article.views || 0} views</span>
              <button onClick={handleLike} className={`flex items-center gap-1 transition-colors ${liked ? 'text-red-500' : 'hover:text-red-500'}`}>
                <Heart size={14} fill={liked ? 'currentColor' : 'none'}/> {article.likes || 0}
              </button>
              <span>{new Date(article.published_at).toLocaleDateString()}</span>
            </div>

            {/* Article body */}
            <div
              className="prose prose-lg max-w-none text-foreground"
              style={{ lineHeight: 1.8 }}
              dangerouslySetInnerHTML={{ __html: body || '<p>No content available in this language.</p>' }}
            />

            {/* Tags */}
            {(lang === 'ar' ? article.tags_ar : article.tags_en)?.length ? (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                {(lang === 'ar' ? article.tags_ar : article.tags_en)!.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-surface border border-border rounded-full text-xs text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            {/* CTA */}
            <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center">
              <p className="font-black text-lg mb-2">{t('هل أنت مستعد للسفر؟', 'Ready to travel?')}</p>
              <p className="text-muted text-sm mb-4">{t('دع مساعدنا الذكي يجد لك أفضل الأسعار', 'Let our AI find you the best prices')}</p>
              <Link href="/" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                ✈️ {t('ابدأ البحث', 'Start searching')}
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <h3 className="font-black text-foreground">{t('احجز رحلتك', 'Book your trip')}</h3>
            {AFFILIATE_BANNERS.map(banner => (
              <a
                key={banner.name}
                href={banner.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick(banner.url)}
                className={`block p-4 rounded-xl border ${banner.color} hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{banner.icon}</span>
                  <div>
                    <p className="font-bold text-sm">{banner.name}</p>
                    <p className="text-xs text-muted">{banner.desc}</p>
                  </div>
                  <ExternalLink size={14} className="ml-auto text-muted"/>
                </div>
              </a>
            ))}

            <div className="mt-6 p-4 bg-white border border-border rounded-xl">
              <p className="text-xs text-muted text-center">
                {t('روابط الحجز تحتوي على عمولات تابعة تساعدنا في تشغيل الموقع', 'Booking links contain affiliate commissions that help us run the site')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
