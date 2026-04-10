// fastamor-admin.tsx
import { supabase } from '@/lib/supabase'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import TiptapLink from '@tiptap/extension-link'

import { useState, useEffect, useRef } from "react";
import { 
  Loader2, ShieldAlert, RefreshCw, Activity, Crosshair, Send, Inbox, 
  Check, X, TrendingUp, BarChart2, Eye, Megaphone, Image as ImageIcon, 
  Layout, ImagePlus, Settings, Save, Trash2, MessageSquare, 
  Users, PenLine, ToggleLeft, ToggleRight, Plus, Upload, Search, 
  Star, Clock, Edit, Globe, Sparkles, Bell, Calendar, Newspaper,
  Link, Hash, Heart, Share2, Bold, Italic, List, Quote, Link2, 
  Image as ImageIcon2, Eye as EyeIcon, Download, TrendingUp as TrendingIcon,
  Award, Menu, Hotel, Plane, MapPin, DollarSign, ShoppingBag, Languages
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast, Toaster } from 'react-hot-toast';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as XLSX from 'xlsx';

// ==================== Constants ====================
const ADMIN_KEY = "709105";

// ==================== Types ====================
interface TravelWriter {
  slug: string;
  name: string;        // Will be shown based on language
  name_ar: string;
  name_en: string;
  specialty: string;
  specialty_ar: string;
  specialty_en: string;
  emoji: string;
  color: string;
  bio_ar: string;
  bio_en: string;
  expertise: string[]; // Dubai, Thailand, Hotels, Flights, etc.
  social: {
    instagram?: string;
    twitter?: string;
    blog?: string;
  };
}

interface Destination {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  country_ar: string;
  country_en: string;
  continent: string;
  description_ar: string;
  description_en: string;
  image_url: string;
  best_time_ar: string;
  best_time_en: string;
  currency: string;
  language_ar: string;
  language_en: string;
  popular_attractions_ar: string[];
  popular_attractions_en: string[];
  average_cost: number;
  rating: number;
  status: 'draft' | 'published';
  meta_title_ar?: string;
  meta_title_en?: string;
  meta_description_ar?: string;
  meta_description_en?: string;
}

interface Hotel {
  id: string;
  name_ar: string;
  name_en: string;
  destination_id: string;
  stars: number;
  price_per_night: number;
  image_url: string;
  description_ar: string;
  description_en: string;
  amenities: string[];
  booking_url: string;
  latitude?: number;
  longitude?: number;
  rating: number;
}

interface Article {
  id: string;
  slug: string;
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  excerpt_ar: string;
  excerpt_en: string;
  category: 'destination_guide' | 'hotel_review' | 'travel_tips' | 'itinerary' | 'news';
  destination_id?: string;
  hotel_id?: string;
  author_slug: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string;
  featured_image: string | null;
  gallery_images?: string[];
  views: number;
  likes: number;
  affiliate_links?: { platform: string; url: string }[];
  tags_ar?: string[];
  tags_en?: string[];
  seo_title_ar?: string;
  seo_title_en?: string;
  seo_description_ar?: string;
  seo_description_en?: string;
}

// ==================== Travel Writers (Multilingual) ====================
export const TRAVEL_WRITERS: TravelWriter[] = [
  {
    slug: "youssef-travel",
    name_ar: "يوسف السفر",
    name_en: "Youssef Travel",
    name: "Youssef Travel",
    specialty_ar: "وجهات عالمية",
    specialty_en: "Global Destinations",
    specialty: "Global Destinations",
    emoji: "🌍",
    color: "text-emerald-400",
    bio_ar: "خبير سفر زار أكثر من 50 دولة، متخصص في الوجهات السياحية وتكاليف السفر",
    bio_en: "Travel expert who visited 50+ countries, specializing in destinations and travel costs",
    expertise: ["Luxury Travel", "Budget Travel", "Southeast Asia", "Middle East"],
    social: { instagram: "youssef.travel", blog: "yousseftravel.com" }
  },
  {
    slug: "laila-hotels",
    name_ar: "ليلى الفنادق",
    name_en: "Laila Hotels",
    name: "Laila Hotels",
    specialty_ar: "فنادق ومنتجعات",
    specialty_en: "Hotels & Resorts",
    specialty: "Hotels & Resorts",
    emoji: "🏨",
    color: "text-blue-400",
    bio_ar: "ناقدة فنادق محترفة، 200+ فندق تمت زيارتها",
    bio_en: "Professional hotel critic, visited 200+ hotels worldwide",
    expertise: ["Luxury Hotels", "Boutique Hotels", "Resorts", "Spa Retreats"],
    social: { instagram: "laila.hotels" }
  },
  {
    slug: "ahmed-flights",
    name_ar: "أحمد الطيران",
    name_en: "Ahmed Flights",
    name: "Ahmed Flights",
    specialty_ar: "طيران وسفر جوي",
    specialty_en: "Aviation & Flight",
    specialty: "Aviation & Flight",
    emoji: "✈️",
    color: "text-cyan-400",
    bio_ar: "خبير تذاكر الطيران وأسعارها",
    bio_en: "Flight ticket expert and price hacking specialist",
    expertise: ["Flight Deals", "Airlines", "Airports", "Miles & Points"],
    social: { twitter: "ahmedflights", blog: "flights.ahmed.com" }
  },
  {
    slug: "sarah-adventure",
    name_ar: "سارة المغامرات",
    name_en: "Sarah Adventure",
    name: "Sarah Adventure",
    specialty_ar: "مغامرات",
    specialty_en: "Adventure Travel",
    specialty: "Adventure Travel",
    emoji: "🏔️",
    color: "text-orange-400",
    bio_ar: "متخصصة في رحلات المغامرة والتسلق",
    bio_en: "Adventure travel specialist, trekking and climbing expert",
    expertise: ["Hiking", "Climbing", "Safari", "Extreme Sports"],
    social: { instagram: "sarah.adventure" }
  }
];

// ==================== Rich Text Editor ====================
function RichTextEditor({ content, onChange, darkMode, language }: { content: string; onChange: (content: string) => void; darkMode: boolean; language: 'ar' | 'en' }) {
  const editor = useEditor({
    extensions: [StarterKit, TiptapImage.configure({ inline: false, allowBase64: true }), TiptapLink.configure({ openOnClick: false })],
    content: content || (language === 'ar' ? '<p>اكتب محتوى المقال هنا...</p>' : '<p>Write your article content here...</p>'),
    onUpdate: ({ editor }: any) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: `min-h-[300px] p-4 focus:outline-none ${darkMode ? 'text-zinc-300' : 'text-gray-800'}`,
        dir: language === 'ar' ? 'rtl' : 'ltr',
      },
    },
  });

  return (
    <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
      <div className={`flex flex-wrap items-center gap-1 p-2 border-b ${darkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-gray-200 bg-gray-50'}`}>
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className="p-1.5 rounded hover:bg-zinc-700"><Bold className="w-4 h-4" /></button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="p-1.5 rounded hover:bg-zinc-700"><Italic className="w-4 h-4" /></button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="p-1.5 rounded hover:bg-zinc-700"><List className="w-4 h-4" /></button>
        <button onClick={() => editor?.chain().focus().toggleBlockquote().run()} className="p-1.5 rounded hover:bg-zinc-700"><Quote className="w-4 h-4" /></button>
        <button onClick={() => { const url = prompt(language === 'ar' ? 'أدخل رابط الصورة:' : 'Enter image URL:'); if (url && editor) editor.chain().focus().setImage({ src: url }).run(); }} className="p-1.5 rounded hover:bg-zinc-700"><ImageIcon2 className="w-4 h-4" /></button>
        <button onClick={() => { const url = prompt(language === 'ar' ? 'أدخل رابط الحجز:' : 'Enter booking URL:'); if (url && editor) editor.chain().focus().setLink({ href: url }).run(); }} className="p-1.5 rounded hover:bg-zinc-700"><ShoppingBag className="w-4 h-4" /></button>
      </div>
      <div className={darkMode ? 'bg-black' : 'bg-white'}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// ==================== Article Editor Modal (Bilingual) ====================
function ArticleEditorModal({ article, destinations, hotels, onClose, onSave, darkMode }: any) {
  const [activeLang, setActiveLang] = useState<'ar' | 'en'>('en');
  const [titleAr, setTitleAr] = useState(article?.title_ar || '');
  const [titleEn, setTitleEn] = useState(article?.title_en || '');
  const [bodyAr, setBodyAr] = useState(article?.body_ar || '');
  const [bodyEn, setBodyEn] = useState(article?.body_en || '');
  const [excerptAr, setExcerptAr] = useState(article?.excerpt_ar || '');
  const [excerptEn, setExcerptEn] = useState(article?.excerpt_en || '');
  const [category, setCategory] = useState(article?.category || 'destination_guide');
  const [destinationId, setDestinationId] = useState(article?.destination_id || '');
  const [hotelId, setHotelId] = useState(article?.hotel_id || '');
  const [featuredImage, setFeaturedImage] = useState(article?.featured_image || '');
  const [authorSlug, setAuthorSlug] = useState(article?.author_slug || 'youssef-travel');
  const [tagsAr, setTagsAr] = useState<string[]>(article?.tags_ar || []);
  const [tagsEn, setTagsEn] = useState<string[]>(article?.tags_en || []);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const articleData = {
      title_ar: titleAr, title_en: titleEn,
      body_ar: bodyAr, body_en: bodyEn,
      excerpt_ar: excerptAr || bodyAr.slice(0, 200),
      excerpt_en: excerptEn || bodyEn.slice(0, 200),
      category, destination_id: destinationId || null, hotel_id: hotelId || null,
      featured_image: featuredImage, author_slug: authorSlug,
      tags_ar: tagsAr, tags_en: tagsEn,
      updated_at: new Date().toISOString(),
    };
    
    if (article?.id) {
      await supabase.from('articles').update(articleData).eq('id', article.id);
      toast.success(activeLang === 'ar' ? 'تم تحديث المقال' : 'Article updated');
    } else {
      await supabase.from('articles').insert({
        ...articleData, status: 'draft', created_at: new Date().toISOString(),
        slug: titleEn.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      });
      toast.success(activeLang === 'ar' ? 'تم حفظ المقال' : 'Article saved');
    }
    onSave();
    onClose();
    setSaving(false);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    if (activeLang === 'ar') setTagsAr([...tagsAr, newTag.trim()]);
    else setTagsEn([...tagsEn, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    if (activeLang === 'ar') setTagsAr(tagsAr.filter(t => t !== tag));
    else setTagsEn(tagsEn.filter(t => t !== tag));
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${darkMode ? 'bg-zinc-900' : 'bg-white'} rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header with Language Toggle */}
        <div className={`sticky top-0 p-4 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'} flex justify-between items-center`}>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg"><X className="w-5 h-5" /></button>
          <div className="flex gap-2">
            <button onClick={() => setActiveLang('ar')} className={`px-3 py-1 rounded ${activeLang === 'ar' ? 'bg-emerald-500 text-white' : darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>العربية</button>
            <button onClick={() => setActiveLang('en')} className={`px-3 py-1 rounded ${activeLang === 'en' ? 'bg-emerald-500 text-white' : darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>English</button>
          </div>
          <h3 className="text-lg font-bold">{article?.id ? (activeLang === 'ar' ? 'تحرير المقال' : 'Edit Article') : (activeLang === 'ar' ? 'مقال جديد' : 'New Article')}</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Title */}
          <input type="text" value={activeLang === 'ar' ? titleAr : titleEn} onChange={e => activeLang === 'ar' ? setTitleAr(e.target.value) : setTitleEn(e.target.value)} placeholder={activeLang === 'ar' ? 'عنوان المقال' : 'Article Title'} className={`w-full ${darkMode ? 'bg-black border-zinc-800 text-zinc-300' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3 text-xl font-bold`} />
          
          {/* Featured Image */}
          <div>
            <label className={`block text-sm mb-2 ${darkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{activeLang === 'ar' ? 'الصورة الرئيسية' : 'Featured Image'}</label>
            <input type="text" value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="https://..." className={`w-full p-2 rounded-lg border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`} />
            {featuredImage && <img src={featuredImage} className="mt-2 w-full h-48 object-cover rounded-lg" />}
          </div>

          {/* Category & Author */}
          <div className="grid grid-cols-2 gap-4">
            <select value={category} onChange={e => setCategory(e.target.value as any)} className={`p-3 rounded-lg border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
              <option value="destination_guide">{activeLang === 'ar' ? 'دليل وجهة' : 'Destination Guide'}</option>
              <option value="hotel_review">{activeLang === 'ar' ? 'مراجعة فندق' : 'Hotel Review'}</option>
              <option value="travel_tips">{activeLang === 'ar' ? 'نصائح سفر' : 'Travel Tips'}</option>
              <option value="itinerary">{activeLang === 'ar' ? 'برنامج رحلة' : 'Itinerary'}</option>
              <option value="news">{activeLang === 'ar' ? 'أخبار سياحية' : 'Travel News'}</option>
            </select>
            
            <select value={authorSlug} onChange={e => setAuthorSlug(e.target.value)} className={`p-3 rounded-lg border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
              {TRAVEL_WRITERS.map(w => <option key={w.slug} value={w.slug}>{w.emoji} {activeLang === 'ar' ? w.name_ar : w.name_en} - {activeLang === 'ar' ? w.specialty_ar : w.specialty_en}</option>)}
            </select>
          </div>

          {/* Destination / Hotel Relation */}
          {category === 'destination_guide' && destinations && (
            <select value={destinationId} onChange={e => setDestinationId(e.target.value)} className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
              <option value="">{activeLang === 'ar' ? 'اختر وجهة' : 'Select Destination'}</option>
              {destinations.map((d: any) => <option key={d.id} value={d.id}>{activeLang === 'ar' ? d.name_ar : d.name_en} ({activeLang === 'ar' ? d.country_ar : d.country_en})</option>)}
            </select>
          )}
          
          {category === 'hotel_review' && hotels && (
            <select value={hotelId} onChange={e => setHotelId(e.target.value)} className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
              <option value="">{activeLang === 'ar' ? 'اختر فندق' : 'Select Hotel'}</option>
              {hotels.map((h: any) => <option key={h.id} value={h.id}>{activeLang === 'ar' ? h.name_ar : h.name_en} ({'★'.repeat(h.stars)})</option>)}
            </select>
          )}

          {/* Content */}
          <RichTextEditor content={activeLang === 'ar' ? bodyAr : bodyEn} onChange={activeLang === 'ar' ? setBodyAr : setBodyEn} darkMode={darkMode} language={activeLang} />
          
          {/* Excerpt */}
          <textarea value={activeLang === 'ar' ? excerptAr : excerptEn} onChange={e => activeLang === 'ar' ? setExcerptAr(e.target.value) : setExcerptEn(e.target.value)} rows={3} placeholder={activeLang === 'ar' ? 'مقتطف قصير' : 'Short excerpt'} className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`} />
          
          {/* Tags */}
          <div>
            <label className={`block text-sm mb-2 ${darkMode ? 'text-zinc-400' : 'text-gray-600'}`}>{activeLang === 'ar' ? 'العلامات' : 'Tags'}</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyPress={e => e.key === 'Enter' && addTag()} placeholder={activeLang === 'ar' ? 'أضف علامة' : 'Add tag'} className={`flex-1 p-2 rounded-lg border ${darkMode ? 'bg-black border-zinc-800' : 'bg-gray-50 border-gray-200'}`} />
              <button onClick={addTag} className="px-3 py-2 bg-emerald-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(activeLang === 'ar' ? tagsAr : tagsEn).map(tag => (
                <span key={tag} className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${darkMode ? 'bg-zinc-800' : 'bg-gray-100'}`}>
                  <Hash className="w-3 h-3" /> {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className={`sticky bottom-0 p-4 border-t ${darkMode ? 'border-zinc-800 bg-zinc-900' : 'border-gray-200 bg-white'} flex gap-3 justify-end`}>
          <button onClick={onClose} className="px-4 py-2 bg-red-600/10 text-red-400 rounded-lg">{activeLang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {article?.id ? (activeLang === 'ar' ? 'تحديث' : 'Update') : (activeLang === 'ar' ? 'نشر' : 'Publish')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== Main Admin Component ====================
export default function FastamorAdmin() {
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [adminLang, setAdminLang] = useState<'ar' | 'en'>('en'); // Admin UI language
  
  useEffect(() => {
    if (sessionStorage.getItem('fastamor_auth') === 'true') setAuth(true);
    const savedMode = localStorage.getItem('fastamor_dark_mode');
    if (savedMode !== null) setDarkMode(savedMode === 'true');
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === ADMIN_KEY) {
      sessionStorage.setItem('fastamor_auth', 'true');
      setAuth(true);
      toast.success(adminLang === 'ar' ? 'تم الدخول بنجاح' : 'Login successful');
    } else {
      setError(adminLang === 'ar' ? 'مفتاح غير صالح' : 'Invalid key');
    }
  };

  if (!auth) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`} dir={adminLang === 'ar' ? 'rtl' : 'ltr'}>
        <Toaster position="top-center" />
        <div className={`w-full max-w-md p-8 rounded-xl border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-center mb-6">
            <Globe className="w-16 h-16 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Fastamor Travel</h1>
          <p className={`text-center text-sm mb-6 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Admin Hub</p>
          
          <div className="flex justify-center gap-2 mb-4">
            <button onClick={() => setAdminLang('ar')} className={`px-3 py-1 rounded ${adminLang === 'ar' ? 'bg-emerald-500 text-white' : darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>العربية</button>
            <button onClick={() => setAdminLang('en')} className={`px-3 py-1 rounded ${adminLang === 'en' ? 'bg-emerald-500 text-white' : darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>English</button>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder={adminLang === 'ar' ? 'مفتاح الإدارة' : 'Admin Key'} autoFocus className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-black border-zinc-800 text-zinc-300' : 'bg-gray-50 border-gray-200'}`} />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold">{adminLang === 'ar' ? 'دخول' : 'Login'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#0a0a0a] text-zinc-300' : 'bg-gray-100 text-gray-800'}`} dir={adminLang === 'ar' ? 'rtl' : 'ltr'}>
      <Toaster position="top-center" />
      <AdminDashboard darkMode={darkMode} adminLang={adminLang} setAdminLang={setAdminLang} />
    </div>
  );
}

// ==================== Admin Dashboard ====================
function AdminDashboard({ darkMode, adminLang, setAdminLang }: { darkMode: boolean; adminLang: 'ar' | 'en'; setAdminLang: (lang: 'ar' | 'en') => void }) {
  const [activeTab, setActiveTab] = useState<'articles' | 'destinations' | 'hotels' | 'analytics' | 'writers' | 'settings'>('articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showNewArticle, setShowNewArticle] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    const [articlesRes, destinationsRes, hotelsRes] = await Promise.all([
      supabase.from('articles').select('*').order('created_at', { ascending: false }),
      supabase.from('destinations').select('*').order('created_at', { ascending: false }),
      supabase.from('hotels').select('*').order('created_at', { ascending: false })
    ]);
    if (articlesRes.data) setArticles(articlesRes.data);
    if (destinationsRes.data) setDestinations(destinationsRes.data);
    if (hotelsRes.data) setHotels(hotelsRes.data);
    setIsLoading(false);
  };

  const filteredArticles = articles.filter(a => 
    a.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.title_ar?.includes(searchQuery)
  );

  const t = (key: string): string => {
    const translations: Record<string, { ar: string; en: string }> = {
      articles: { ar: 'المقالات', en: 'Articles' },
      destinations: { ar: 'الوجهات', en: 'Destinations' },
      hotels: { ar: 'الفنادق', en: 'Hotels' },
      analytics: { ar: 'التحليلات', en: 'Analytics' },
      writers: { ar: 'الكتّاب', en: 'Writers' },
      settings: { ar: 'الإعدادات', en: 'Settings' },
      new_article: { ar: 'مقال جديد', en: 'New Article' },
      search: { ar: 'بحث...', en: 'Search...' },
      no_articles: { ar: 'لا توجد مقالات', en: 'No articles found' },
    };
    return translations[key]?.[adminLang] || key;
  };

  return (
    <div className="max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className={`flex items-center justify-between mb-6 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'} pb-4`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Plane className="w-6 h-6 text-emerald-500" />
            <span className="text-xl font-bold">Fastamor</span>
            <span className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>Travel Admin Hub</span>
          </div>
          <button onClick={loadAllData} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'}`}>
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute ${adminLang === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500`} />
            <input type="text" placeholder={t('search')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className={`${adminLang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2 text-sm rounded-lg border ${darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`} />
          </div>
          <button onClick={() => setAdminLang(adminLang === 'ar' ? 'en' : 'ar')} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'}`}>
            <Languages className="w-5 h-5" />
          </button>
          <button onClick={() => { localStorage.setItem('fastamor_dark_mode', (!darkMode).toString()); window.location.reload(); }} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-zinc-800' : 'hover:bg-gray-200'}`}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className={`flex gap-1 mb-6 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'}`}>
        {[
          { id: 'articles', icon: Newspaper, label: t('articles') },
          { id: 'destinations', icon: MapPin, label: t('destinations') },
          { id: 'hotels', icon: Hotel, label: t('hotels') },
          { id: 'analytics', icon: BarChart2, label: t('analytics') },
          { id: 'writers', icon: Users, label: t('writers') },
          { id: 'settings', icon: Settings, label: t('settings') },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? `border-b-2 border-emerald-500 text-emerald-500` : darkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'articles' && (
            <div className={`${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'} border rounded-lg overflow-hidden`}>
              <div className={`p-4 border-b ${darkMode ? 'border-zinc-800' : 'border-gray-200'} flex justify-between items-center`}>
                <h3 className="text-sm font-bold">{t('articles')}</h3>
                <button onClick={() => setShowNewArticle(true)} className="px-3 py-1.5 text-xs bg-emerald-500 text-white rounded-lg flex items-center gap-1">
                  <Plus className="w-3 h-3" /> {t('new_article')}
                </button>
              </div>
              <div className="divide-y divide-zinc-800">
                {filteredArticles.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500">{t('no_articles')}</div>
                ) : (
                  filteredArticles.map(article => (
                    <div key={article.id} className="p-4 hover:bg-zinc-900/30 transition-colors">
                      <div className="flex gap-4">
                        {article.featured_image && <img src={article.featured_image} className="w-20 h-20 object-cover rounded" />}
                        <div className="flex-1 text-right">
                          <div className="flex items-center gap-2 justify-end mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded ${article.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                              {article.status}
                            </span>
                            <span className="text-xs text-zinc-500">{article.author_slug}</span>
                          </div>
                          <h4 className="font-bold mb-1">{adminLang === 'ar' ? article.title_ar : article.title_en}</h4>
                          <div className="flex gap-3 mt-2 justify-end">
                            <button onClick={() => setEditingArticle(article)} className="text-blue-400"><Edit className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {activeTab === 'destinations' && <DestinationsPanel darkMode={darkMode} adminLang={adminLang} destinations={destinations} onRefresh={loadAllData} />}
          {activeTab === 'hotels' && <HotelsPanel darkMode={darkMode} adminLang={adminLang} hotels={hotels} destinations={destinations} onRefresh={loadAllData} />}
          {activeTab === 'analytics' && <AnalyticsPanel darkMode={darkMode} adminLang={adminLang} articles={articles} />}
        </div>
        
        {/* Sidebar - Writers & Quick Actions */}
        <div className="space-y-6">
          <div className={`${darkMode ? 'bg-black border-emerald-900/40' : 'bg-white border-gray-200'} border p-5 rounded-lg`}>
            <h3 className="text-xs font-bold text-emerald-500 uppercase mb-4 flex items-center gap-2 justify-end">
              {adminLang === 'ar' ? 'كتّاب السفر' : 'Travel Writers'}
              <Users className="w-3.5 h-3.5" />
            </h3>
            <div className="space-y-3">
              {TRAVEL_WRITERS.map(writer => (
                <div key={writer.slug} className="flex items-center gap-3 justify-end">
                  <div className="text-right">
                    <div className={`text-sm font-bold ${writer.color}`}>{writer.emoji} {adminLang === 'ar' ? writer.name_ar : writer.name_en}</div>
                    <div className="text-[10px] text-zinc-500">{adminLang === 'ar' ? writer.specialty_ar : writer.specialty_en}</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${writer.color.replace('text', 'bg')}`} />
                </div>
              ))}
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'} border p-5 rounded-lg`}>
            <h3 className="text-xs font-bold uppercase mb-3">{adminLang === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>{adminLang === 'ar' ? 'المقالات' : 'Articles'}:</span><span className="font-bold">{articles.length}</span></div>
              <div className="flex justify-between"><span>{adminLang === 'ar' ? 'الوجهات' : 'Destinations'}:</span><span className="font-bold">{destinations.length}</span></div>
              <div className="flex justify-between"><span>{adminLang === 'ar' ? 'الفنادق' : 'Hotels'}:</span><span className="font-bold">{hotels.length}</span></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {(editingArticle || showNewArticle) && (
        <ArticleEditorModal
          article={editingArticle}
          destinations={destinations}
          hotels={hotels}
          onClose={() => { setEditingArticle(null); setShowNewArticle(false); }}
          onSave={loadAllData}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

// Placeholder components (simplified)
function DestinationsPanel({ darkMode, adminLang, destinations, onRefresh }: any) {
  return <div className={`p-8 text-center ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'} border rounded-lg`}>{adminLang === 'ar' ? 'إدارة الوجهات قيد التطوير' : 'Destinations management coming soon'}</div>;
}

function HotelsPanel({ darkMode, adminLang }: any) {
  return <div className={`p-8 text-center ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'} border rounded-lg`}>{adminLang === 'ar' ? 'إدارة الفنادق قيد التطوير' : 'Hotels management coming soon'}</div>;
}

function AnalyticsPanel({ darkMode, adminLang, articles }: any) {
  return <div className={`p-8 text-center ${darkMode ? 'bg-black border-zinc-800' : 'bg-white border-gray-200'} border rounded-lg`}>{adminLang === 'ar' ? 'التحليلات قيد التطوير' : 'Analytics coming soon'}</div>;
}
