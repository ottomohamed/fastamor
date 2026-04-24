import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Eye, Heart, MapPin, ExternalLink, Plane } from 'lucide-react';
import { trackClick } from '@/lib/tracking';
import { motion } from 'framer-motion';

interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  title_es: string;
  title_fr: string;
  body_ar: string;
  body_en: string;
  body_es: string;
  body_fr: string;
  excerpt_ar: string;
  excerpt_en: string;
  excerpt_es: string;
  excerpt_fr: string;
  category: string;
  featured_image: string | null;
  author_slug: string;
  views: number;
  likes: number;
  published_at: string;
  tags_en?: string[];
  tags_ar?: string[];
}

const AFFILIATE_SIDEBAR = [
  { name: 'Aviasales', tagline: 'Cheapest Flights', url: 'https://aviasales.tpx.gr/yQxrYmk7', emoji: '✈️', bg: 'bg-orange-50 border-orange-100', text: 'text-orange-700' },
  { name: 'Intui Travel', tagline: 'Best Hotel Deals', url: 'https://intui.tpx.gr/kguAoKIU', emoji: '🏨', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
  { name: 'Klook', tagline: 'Tours & Activities', url: 'https://klook.tpx.gr/vRUzaJbI', emoji: '🎡', bg: 'bg-red-50 border-red-100', text: 'text-red-700' },
  { name: 'GetTransfer', tagline: 'Airport Transfers', url: 'https://gettransfer.tpx.gr/9poAnD5l', emoji: '🚕', bg: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-700' },
];

const CATEGORY_TAGS: Record<string, string> = {
  destination_guide: 'Destination Guide',
  hotel_review: 'Hotel Review',
  travel_tips: 'Travel Tips',
  itinerary: 'Itinerary',
  news: 'Travel News',
};

export default function ArticleView({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'ar' | 'fr' | 'es'>('en');
  const [liked, setLiked] = useState(false);

  useEffect(() => { loadArticle(); }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('articles').select('*').eq('slug', slug).eq('status', 'published').single();
    if (data) {
      setArticle(data);
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

  if (loading) return (
    <div className="min-h-screen bg-[#fbf9f3] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#00685f] border-t-transparent rounded-full animate-spin"/>
        <p className="text-[10px] text-[#6d7a77] uppercase tracking-widest font-bold">Loading story...</p>
      </div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-[#fbf9f3] flex flex-col items-center justify-center">
      <Plane size={40} className="text-[#bcc9c6] mb-6"/>
      <p className="text-2xl font-serif font-black text-[#1b1c19] mb-4">Story not found</p>
      <Link href="/blog" className="text-[#00685f] font-bold text-sm hover:underline">← Back to Magazine</Link>
    </div>
  );

  // ✅ التعديل الأساسي: دعم جميع اللغات
  const getTitle = () => {
    switch (lang) {
      case 'ar': return article.title_ar;
      case 'es': return article.title_es;
      case 'fr': return article.title_fr;
      default: return article.title_en;
    }
  };

  const getBody = () => {
    switch (lang) {
      case 'ar': return article.body_ar;
      case 'es': return article.body_es;
      case 'fr': return article.body_fr;
      default: return article.body_en;
    }
  };

  const getTags = () => {
    return lang === 'ar' ? article.tags_ar : article.tags_en;
  };

  const isRtl = lang === 'ar';
  const title = getTitle();
  const body = getBody();
  const tags = getTags();

  return (
    <div className="min-h-screen bg-[#fbf9f3] selection:bg-teal-100" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#fbf9f3]/90 backdrop-blur-xl border-b border-[#bcc9c6]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/blog" className="flex items-center gap-2 text-[#3d4947] hover:text-[#00685f] transition-colors font-bold text-sm">
              <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''}/>
              <span className="hidden sm:block">Magazine</span>
            </Link>
            <span className="text-[#bcc9c6] hidden sm:block">·</span>
            <Link href="/" className="font-serif text-xl font-black text-[#00685f] hidden sm:block">FASTAMOR</Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#f5f2e9] rounded-full p-1 border border-[#bcc9c6]/20">
              {(['en','ar','fr','es'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-[9px] font-black uppercase rounded-full transition-all ${lang === l ? 'bg-[#00685f] text-white shadow' : 'text-[#3d4947] hover:text-[#00685f]'}`}>
                  {l}
                </button>
              ))}
            </div>
            <Link href="/" className="hidden sm:flex items-center gap-1.5 bg-[#0d9488] text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-[#0f766e] transition-colors">
              <Plane size={12}/> Plan Trip
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero image */}
      {article.featured_image && (
        <div className="relative h-[50vh] overflow-hidden">
          <img src={article.featured_image} alt={title} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#fbf9f3] via-black/20 to-transparent"/>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main article */}
          <article className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Meta */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00685f] bg-teal-50 px-3 py-1 rounded-full">
                  {CATEGORY_TAGS[article.category] || 'Story'}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-[#6d7a77] font-medium">
                  <Eye size={10}/> {article.views || 0}
                </span>
                <span className="text-[10px] text-[#bcc9c6] font-medium">
                  {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-serif font-black text-[#1b1c19] leading-[1.1] tracking-tight mb-6">
                {title}
              </h1>

              {/* Divider */}
              <div className="w-12 h-1 bg-[#0d9488] mb-8"/>

              {/* Body */}
              <div
                className="prose prose-lg max-w-none text-[#1b1c19]"
                style={{
                  lineHeight: 1.85,
                  fontFamily: "'Inter', sans-serif",
                }}
                dangerouslySetInnerHTML={{ __html: body || `<p>${isRtl ? 'المحتوى غير متوفر بهذه اللغة.' : 'Content not available in this language.'}</p>` }}
              />

              {/* Tags */}
              {tags?.length ? (
                <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[#bcc9c6]/20">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#f0eee8] text-[#3d4947] rounded-full text-xs font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Like button */}
              <div className="flex items-center gap-3 mt-8 pt-8 border-t border-[#bcc9c6]/20">
                <button onClick={handleLike}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border font-bold text-sm transition-all ${
                    liked
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-[#bcc9c6]/30 text-[#6d7a77] hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                  }`}>
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'}/>
                  {article.likes || 0}
                </button>
                <p className="text-xs text-[#6d7a77]">
                  {isRtl ? 'أعجبك هذا المقال؟' : 'Found this helpful?'}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-12 p-8 bg-white border border-[#bcc9c6]/20 rounded-3xl text-center shadow-sm">
                <div className="inline-block px-3 py-1 bg-teal-50 text-[#00685f] text-[9px] font-black uppercase tracking-[0.2em] mb-4 rounded-full">
                  AI Travel Concierge
                </div>
                <p className="text-2xl font-serif font-black text-[#1b1c19] mb-2">
                  {isRtl ? 'مستعد للسفر؟' : 'Ready to Travel?'}
                </p>
                <p className="text-[#6d7a77] text-sm mb-6">
                  {isRtl ? 'دع مساعدنا الذكي يجد لك أفضل الأسعار فوراً' : 'Let our AI find the best deals instantly'}
                </p>
                <Link href="/" className="inline-flex items-center gap-2 bg-[#0d9488] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#0f766e] hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                  🚀 {isRtl ? 'ابدأ البحث الآن' : 'Start Planning Now'}
                </Link>
              </div>
            </motion.div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6d7a77] mb-4">
                {isRtl ? 'احجز رحلتك' : 'Book Your Trip'}
              </p>

              {AFFILIATE_SIDEBAR.map(item => (
                <a key={item.name} href={item.url} target="_blank" rel="noopener noreferrer"
                  onClick={() => trackClick(item.url)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${item.bg} hover:shadow-md transition-all group`}>
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm ${item.text}`}>{item.name}</p>
                    <p className="text-xs text-[#6d7a77]">{item.tagline}</p>
                  </div>
                  <ExternalLink size={14} className="text-[#bcc9c6] group-hover:text-[#00685f] shrink-0"/>
                </a>
              ))}

              <div className="mt-6 p-4 bg-[#f0eee8] rounded-2xl">
                <p className="text-[9px] text-[#6d7a77] text-center leading-relaxed">
                  {isRtl
                    ? 'روابط الحجز تحتوي على عمولات تابعة تساعدنا في تشغيل الموقع مجاناً'
                    : 'Booking links contain affiliate commissions that help keep our service free'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1b1c19] text-[#bcc9c6] py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-serif text-xl font-black text-white">FASTAMOR</div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">© 2026 Fastamor. All Rights Reserved.</p>
          <Link href="/blog" className="text-[10px] font-black uppercase tracking-widest text-[#0d9488] hover:text-white transition-colors">
            ← Magazine
          </Link>
        </div>
      </footer>
    </div>
  );
}