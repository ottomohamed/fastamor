import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { localizedPath, type Lang } from '@/lib/i18n-url';

import { supabase } from '@/lib/supabase';
import { safeHtml } from '@/lib/sanitize';
import { useDocumentMeta } from '@/hooks/use-document-meta';
import { ArrowLeft, Eye, Heart, MapPin, ExternalLink, Plane } from 'lucide-react';
import { trackClick, aff, sid } from '@/lib/tracking';
import { TripKit } from '@/components/TripKit';
import ARTICLE_DEST from '../../api/_data/article-dest.json';

type DestEntry = { city: string; name: Record<string, string> };

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
  { name: 'Yesim eSIM', tagline: 'Mobile data abroad', url: 'https://yesim.tpx.gr/9gzdax7m', emoji: '📶', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
  { name: 'Klook', tagline: 'Tours & Activities', url: 'https://klook.tpx.gr/vRUzaJbI', emoji: '🎡', bg: 'bg-red-50 border-red-100', text: 'text-red-700' },
  { name: 'Kiwitaxi', tagline: 'Airport Transfers', url: 'https://kiwitaxi.tpx.gr/Y6yrFeYN', emoji: '🚕', bg: 'bg-yellow-50 border-yellow-100', text: 'text-yellow-700' },
];

const CATEGORY_TAGS: Record<string, string> = {
  destination_guide: 'Destination Guide',
  hotel_review: 'Hotel Review',
  travel_tips: 'Travel Tips',
  itinerary: 'Itinerary',
  news: 'Travel News',
};

export default function ArticleView({ slug, lang: urlLang = 'en' }: { slug: string; lang?: Lang }) {
  const [, setLocation] = useLocation();
  const L = (p: string) => localizedPath(p, lang);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const lang = urlLang;
  // Switching language navigates to that language's URL.
  const setLang = (l: Lang) => setLocation(localizedPath(`/article/${slug}`, l));
  const [liked, setLiked] = useState(false);

  // If this language has no real content for the article, move to one that does.
  useEffect(() => {
    if (!article) return;
    const has = (l: Lang) => ((article as any)[`body_${l}`] || '').length >= 1500 && (article as any)[`title_${l}`];
    if (has(lang)) return;
    const alt = (['en', 'ar', 'fr', 'es'] as const).find(has);
    if (alt) setLocation(localizedPath(`/article/${slug}`, alt), { replace: true });
  }, [article, lang, slug]);

  useDocumentMeta({
    title: article ? ((article as any)[`title_${lang}`] || article.title_en || article.title_ar) : undefined,
    description: article ? ((article as any)[`excerpt_${lang}`] || article.excerpt_en || article.excerpt_ar) : undefined,
    image: article?.featured_image,
    path: `/article/${slug}`,
    lang,
    type: 'article',
  });

  useEffect(() => { loadArticle(); }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('articles').select('*').eq('slug', slug).eq('status', 'published').single();
    if (data) {
      setArticle(data);
      // Server-side increment (see supabase/migrations). Falls back to the legacy update until the migration is applied.
      supabase.rpc('increment_article_views', { article_id: data.id });
    }
    setLoading(false);
  };

  const handleLike = async () => {
    if (!article || liked) return;
    setLiked(true);
    await supabase.rpc('increment_article_likes', { article_id: article.id });
    setArticle({ ...article, likes: (article.likes || 0) + 1 });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F7F8FC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#3550C8] border-t-transparent rounded-full animate-spin"/>
        <p className="text-xs text-[#5B6488] font-bold">Loading story...</p>
      </div>
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center">
      <Plane size={40} className="text-[#14204A]/60 mb-6"/>
      <p className="text-2xl font-serif font-black text-[#14204A] mb-4">Story not found</p>
      <Link href={L('/blog')} className="text-[#3550C8] font-bold text-sm hover:underline">← Back to Magazine</Link>
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
  const destEntry = (ARTICLE_DEST as unknown as Record<string, DestEntry>)[slug];
  const tripDest = destEntry ? { name: destEntry.name[lang] || destEntry.name.en, city: destEntry.city } : null;
  const kitPage = sid('art', slug);
  const PLAN: Record<string, { label: (d?: string) => string; cta: string; note: string }> = {
    en: { label: d => d ? `Planning a trip to ${d}?` : 'Planning a trip?', cta: 'Ask the AI', note: 'Partner links: Fastamor may earn a commission, at no extra cost to you.' },
    ar: { label: d => d ? `تخطط لرحلة إلى ${d}؟` : 'تخطط لرحلة؟', cta: 'اسأل المساعد', note: 'روابط شركاء: قد يحصل فاستامور على عمولة دون أي تكلفة إضافية عليك.' },
    fr: { label: d => d ? `Vous préparez un voyage en ${d.replace(/^(la |le |l’)/, '')} ?` : 'Vous préparez un voyage ?', cta: 'Demander à l’IA', note: 'Liens partenaires : Fastamor peut percevoir une commission, sans surcoût pour vous.' },
    es: { label: d => d ? `¿Planeas un viaje a ${d}?` : '¿Planeas un viaje?', cta: 'Pregunta a la IA', note: 'Enlaces de socios: Fastamor puede recibir una comisión, sin coste adicional para ti.' },
  };
  const plan = PLAN[lang] || PLAN.en;

  return (
    <div className="min-h-screen bg-[#F7F8FC] selection:bg-indigo-100 pb-16 lg:pb-0" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#F7F8FC]/90 backdrop-blur-xl border-b border-[#E1E4F0]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={L('/blog')} className="flex items-center gap-2 text-[#353D5C] hover:text-[#3550C8] transition-colors font-bold text-sm">
              <ArrowLeft size={16} className={isRtl ? 'rotate-180' : ''}/>
              <span className="hidden sm:block">Magazine</span>
            </Link>
            <span className="text-[#14204A]/60 hidden sm:block">·</span>
            <Link href={L('/')} className="font-serif text-xl font-black text-[#3550C8] hidden sm:block">FASTAMOR</Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#f5f2e9] rounded-full p-1 border border-[#E1E4F0]/20">
              {(['en','ar','fr','es'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-xs font-black rounded-full transition-all ${lang === l ? 'bg-[#3550C8] text-white shadow' : 'text-[#353D5C] hover:text-[#3550C8]'}`}>
                  {l}
                </button>
              ))}
            </div>
            <Link href={L('/')} className="hidden sm:flex items-center gap-1.5 bg-[#3550C8] text-white px-4 py-2 rounded-full text-xs font-black tracking-wider hover:bg-[#2B43A8] transition-colors">
              <Plane size={12}/> Plan Trip
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero image */}
      {article.featured_image && (
        <div className="relative h-[50vh] overflow-hidden">
          <img src={article.featured_image} alt={title} className="w-full h-full object-cover" fetchPriority="high" decoding="async"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#F7F8FC] via-black/20 to-transparent"/>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main article */}
          <article className="lg:col-span-8">
            <div className="fa-rise">

              {/* Meta */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-xs font-black text-[#3550C8] bg-teal-50 px-3 py-1 rounded-full">
                  {CATEGORY_TAGS[article.category] || 'Story'}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#5B6488] font-medium">
                  <Eye size={10}/> {article.views || 0}
                </span>
                <span className="text-xs text-[#14204A]/60 font-medium">
                  {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-serif font-black text-[#14204A] leading-[1.1] tracking-tight mb-6">
                {title}
              </h1>

              {/* Divider */}
              <div className="w-12 h-1 bg-[#3550C8] mb-8"/>

              {/* Body */}
              <div
                className="prose prose-lg max-w-[68ch] text-ink prose-headings:font-extrabold prose-headings:text-ink prose-h2:text-[1.6rem] prose-h2:mt-12 prose-h3:mt-8 prose-a:text-brand prose-li:my-1 prose-img:rounded-2xl prose-table:text-base"
                dangerouslySetInnerHTML={{ __html: body ? safeHtml(body) : `<p>${isRtl ? 'المحتوى غير متوفر بهذه اللغة.' : 'Content not available in this language.'}</p>` }}
              />

              {/* Trip kit for this article's destination (hotel, eSIM, transfer, tours) */}
              <div className="mt-12 max-w-[68ch] rounded-2xl bg-[#EEF0F8] p-4 sm:p-5">
                <TripKit dest={tripDest} lang={lang} page={kitPage} wide />
                <p className="mt-3 text-xs text-[#5B6488]">{plan.note}</p>
              </div>

              {/* Tags */}
              {tags?.length ? (
                <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[#E1E4F0]/20">
                  {tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-[#EEF0F8] text-[#353D5C] rounded-full text-xs font-bold">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* Like button */}
              <div className="flex items-center gap-3 mt-8 pt-8 border-t border-[#E1E4F0]/20">
                <button onClick={handleLike}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border font-bold text-sm transition-all ${
                    liked
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-[#E1E4F0]/30 text-[#5B6488] hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                  }`}>
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'}/>
                  {article.likes || 0}
                </button>
                <p className="text-xs text-[#5B6488]">
                  {isRtl ? 'أعجبك هذا المقال؟' : 'Found this helpful?'}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-12 p-8 bg-white border border-[#E1E4F0]/20 rounded-3xl text-center shadow-sm">
                <div className="inline-block px-3 py-1 bg-teal-50 text-[#3550C8] text-xs font-black mb-4 rounded-full">
                  AI Travel Concierge
                </div>
                <p className="text-2xl font-serif font-black text-[#14204A] mb-2">
                  {isRtl ? 'مستعد للسفر؟' : 'Ready to Travel?'}
                </p>
                <p className="text-[#5B6488] text-sm mb-6">
                  {isRtl ? 'دع مساعدنا الذكي يجد لك أفضل الأسعار فوراً' : 'Let our AI find the best deals instantly'}
                </p>
                <Link href={L('/')} className="inline-flex items-center gap-2 bg-[#3550C8] text-white px-8 py-3.5 rounded-full font-bold text-sm hover:bg-[#2B43A8] hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                  {isRtl ? 'ابدأ البحث الآن' : 'Start Planning Now'}
                </Link>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <p className="text-xs font-black text-[#5B6488] mb-4">
                {isRtl ? 'احجز رحلتك' : 'Book Your Trip'}
              </p>

              {AFFILIATE_SIDEBAR.map(item => (
                <a key={item.name} href={aff(item.url, sid('art', slug, 'sidebar', item.name, lang))} target="_blank" rel="sponsored nofollow noopener"
                  onClick={() => trackClick(item.url)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border ${item.bg} hover:shadow-md transition-all group`}>
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm ${item.text}`}>{item.name}</p>
                    <p className="text-xs text-[#5B6488]">{item.tagline}</p>
                  </div>
                  <ExternalLink size={14} className="text-[#14204A]/60 group-hover:text-[#3550C8] shrink-0"/>
                </a>
              ))}

              <div className="mt-6 p-4 bg-[#EEF0F8] rounded-2xl">
                <p className="text-xs text-[#5B6488] text-center leading-relaxed">
                  {isRtl
                    ? 'روابط الحجز تحتوي على عمولات تابعة تساعدنا في تشغيل الموقع مجاناً'
                    : 'Booking links contain affiliate commissions that help keep our service free'}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile: sticky "plan this trip" bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t border-[#E1E4F0] px-4 py-2.5 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[#14204A] truncate">{plan.label(tripDest?.name)}</span>
        <Link href={L('/')} className="shrink-0 rounded-full bg-[#3550C8] text-white px-4 py-2 text-sm font-bold">{plan.cta}</Link>
      </div>

      {/* Footer */}
      <footer className="bg-[#14204A] text-[#14204A]/60 py-12 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-serif text-xl font-black text-white">FASTAMOR</div>
          <p className="text-xs font-black opacity-40">© 2026 Fastamor. All Rights Reserved.</p>
          <Link href={L('/blog')} className="text-xs font-black text-[#3550C8] hover:text-white transition-colors">
            ← Magazine
          </Link>
        </div>
      </footer>
    </div>
  );
}