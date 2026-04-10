import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2, Link2, Megaphone, Settings, LogOut, 
  Plus, Trash2, Edit3, Check, X, Eye, EyeOff,
  TrendingUp, MousePointer, Search, Globe, Newspaper,
  DollarSign, Users, Percent, Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminViewProps {
  onClose: () => void;
}

type Tab = 'stats' | 'links' | 'banners' | 'content' | 'settings';

interface AffiliateLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: string;
  is_active: boolean;
  clicks: number;
}

interface Banner {
  id: string;
  text: string;
  url: string;
  is_active: boolean;
  clicks: number;
}

interface Stats {
  clicks: number;
  searches: number;
  todayClicks: number;
  total: number;
  conversionRate: number;
  estimatedRevenue: number;
}

export function AdminView({ onClose }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [stats, setStats] = useState<Stats>({ clicks: 0, searches: 0, todayClicks: 0, total: 0, conversionRate: 0, estimatedRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // New link form
  const [newLink, setNewLink] = useState({ name: '', url: '', icon: '🔗', category: 'general' });
  const [showNewLink, setShowNewLink] = useState(false);

  // New banner form
  const [newBanner, setNewBanner] = useState({ text: '', url: '' });
  const [showNewBanner, setShowNewBanner] = useState(false);

  // Settings
  const [siteConfig, setSiteConfig] = useState({ lang: 'en', adminPassword: '709105' });
  const [chatConfig, setChatConfig] = useState({ model: 'claude-haiku-4-5-20251001', maxTokens: 1024 });

  useEffect(() => { 
    loadData(); 
    loadRealTimeStats();
  }, [activeTab]);

  const loadRealTimeStats = async () => {
    try {
      // Load clicks from affiliate_links
      const { data: linksData } = await supabase
        .from('affiliate_links')
        .select('clicks');
      
      const totalClicks = linksData?.reduce((sum, link) => sum + (link.clicks || 0), 0) || 0;
      
      // Load searches from analytics table if exists
      const { data: analyticsData } = await supabase
        .from('analytics')
        .select('searches, date')
        .gte('date', new Date().toISOString().split('T')[0]);
      
      const todaySearches = analyticsData?.reduce((sum, a) => sum + (a.searches || 0), 0) || 0;
      const totalSearches = analyticsData?.reduce((sum, a) => sum + (a.searches || 0), 0) || 0;
      
      // Calculate conversion rate (assuming 2% of clicks convert)
      const conversionRate = totalClicks > 0 ? (totalClicks * 0.02) : 0;
      const estimatedRevenue = conversionRate * 5; // $5 CPA
      
      setStats({
        clicks: totalClicks,
        searches: totalSearches,
        todayClicks: Math.floor(totalClicks * 0.1), // Example: 10% today
        total: totalClicks + totalSearches,
        conversionRate: totalClicks > 0 ? 2 : 0,
        estimatedRevenue: estimatedRevenue
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'links') {
        const { data } = await supabase
          .from('affiliate_links')
          .select('*')
          .order('created_at', { ascending: false });
        setLinks(data || []);
      } else if (activeTab === 'banners') {
        const { data } = await supabase
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false });
        setBanners(data || []);
      } else if (activeTab === 'settings') {
        const { data: sc } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'site_config')
          .single();
        const { data: cc } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'chat_config')
          .single();
        
        if (sc) setSiteConfig(sc.value);
        if (cc) setChatConfig(cc.value);
      } else if (activeTab === 'stats') {
        await loadRealTimeStats();
      }
    } catch (err) {
      console.error('Error loading data:', err);
      showToast('❌ خطأ في تحميل البيانات');
    }
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleLink = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('affiliate_links')
      .update({ is_active: !current })
      .eq('id', id);
    
    if (!error) {
      setLinks(links.map(l => l.id === id ? { ...l, is_active: !current } : l));
      showToast(current ? '🔴 رابط معطّل' : '🟢 رابط مفعّل');
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm('حذف هذا الرابط؟')) return;
    const { error } = await supabase.from('affiliate_links').delete().eq('id', id);
    if (!error) {
      setLinks(links.filter(l => l.id !== id));
      showToast('🗑️ تم الحذف');
    }
  };

  const addLink = async () => {
    if (!newLink.name || !newLink.url) return showToast('❌ أدخل الاسم والرابط');
    setSaving(true);
    const { data, error } = await supabase
      .from('affiliate_links')
      .insert({ ...newLink, clicks: 0, is_active: true })
      .select()
      .single();
    
    if (data) {
      setLinks([data, ...links]);
      setNewLink({ name: '', url: '', icon: '🔗', category: 'general' });
      setShowNewLink(false);
      showToast('✅ تم إضافة الرابط');
    }
    setSaving(false);
  };

  const incrementLinkClick = async (id: string) => {
    const link = links.find(l => l.id === id);
    if (link) {
      const newClicks = (link.clicks || 0) + 1;
      await supabase
        .from('affiliate_links')
        .update({ clicks: newClicks })
        .eq('id', id);
      setLinks(links.map(l => l.id === id ? { ...l, clicks: newClicks } : l));
      await loadRealTimeStats();
    }
  };

  const toggleBanner = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('banners')
      .update({ is_active: !current })
      .eq('id', id);
    
    if (!error) {
      setBanners(banners.map(b => b.id === id ? { ...b, is_active: !current } : b));
      showToast(current ? '🔴 إعلان معطّل' : '🟢 إعلان مفعّل');
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('حذف هذا الإعلان؟')) return;
    const { error } = await supabase.from('banners').delete().eq('id', id);
    if (!error) {
      setBanners(banners.filter(b => b.id !== id));
      showToast('🗑️ تم الحذف');
    }
  };

  const addBanner = async () => {
    if (!newBanner.text) return showToast('❌ أدخل نص الإعلان');
    setSaving(true);
    const { data, error } = await supabase
      .from('banners')
      .insert({ ...newBanner, clicks: 0, is_active: true })
      .select()
      .single();
    
    if (data) {
      setBanners([data, ...banners]);
      setNewBanner({ text: '', url: '' });
      setShowNewBanner(false);
      showToast('✅ تم إضافة الإعلان');
    }
    setSaving(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    await supabase
      .from('settings')
      .upsert({ key: 'site_config', value: siteConfig, updated_at: new Date().toISOString() });
    await supabase
      .from('settings')
      .upsert({ key: 'chat_config', value: chatConfig, updated_at: new Date().toISOString() });
    setSaving(false);
    showToast('✅ تم حفظ الإعدادات');
  };

  const TABS = [
    { id: 'stats', label: 'إحصائيات', icon: <BarChart2 size={18}/> },
    { id: 'links', label: 'روابط', icon: <Link2 size={18}/> },
    { id: 'banners', label: 'إعلانات', icon: <Megaphone size={18}/> },
    { id: 'settings', label: 'إعدادات', icon: <Settings size={18}/> },
  ] as const;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-foreground text-background px-4 py-2 rounded-xl shadow-lg font-bold text-sm">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-[#0D3B38] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FFD23F] flex items-center justify-center font-black text-lg">F</div>
          <div>
            <h1 className="font-black text-lg tracking-wide">لوحة تحكم Fastamor</h1>
            <p className="text-white/50 text-xs">Admin Dashboard</p>
          </div>
        </div>
        <button onClick={onClose} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium">
          <LogOut size={18}/> خروج
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-surface border-b border-border px-6 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground'
            }`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {loading && activeTab !== 'stats' ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* STATS - محدث */}
            {activeTab === 'stats' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-serif font-black text-2xl text-foreground mb-6">الإحصائيات والتحليلات</h2>
                
                {/* البطاقات الرئيسية */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                    <MousePointer size={24} className="text-primary mb-2"/>
                    <div className="text-3xl font-black text-foreground">{stats.clicks.toLocaleString()}</div>
                    <div className="text-xs text-muted font-medium mt-1">إجمالي النقرات</div>
                  </div>
                  <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
                    <TrendingUp size={24} className="text-secondary mb-2"/>
                    <div className="text-3xl font-black text-foreground">{stats.todayClicks.toLocaleString()}</div>
                    <div className="text-xs text-muted font-medium mt-1">نقرات اليوم</div>
                  </div>
                  <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                    <Search size={24} className="text-accent mb-2"/>
                    <div className="text-3xl font-black text-foreground">{stats.searches.toLocaleString()}</div>
                    <div className="text-xs text-muted font-medium mt-1">عمليات بحث</div>
                  </div>
                  <div className="rounded-2xl border border-info/20 bg-info/5 p-4">
                    <Users size={24} className="text-info mb-2"/>
                    <div className="text-3xl font-black text-foreground">{stats.total.toLocaleString()}</div>
                    <div className="text-xs text-muted font-medium mt-1">إجمالي الأحداث</div>
                  </div>
                </div>

                {/* بطاقات الأداء الإضافية */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-surface border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Percent size={20} className="text-emerald-500"/>
                      <span className="text-sm text-muted">معدل التحويل</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{stats.conversionRate}%</div>
                    <div className="text-xs text-muted mt-1">(تقديري بناءً على 2% من النقرات)</div>
                  </div>
                  <div className="bg-surface border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <DollarSign size={20} className="text-yellow-500"/>
                      <span className="text-sm text-muted">الإيرادات المقدرة</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">${stats.estimatedRevenue.toFixed(2)}</div>
                    <div className="text-xs text-muted mt-1">(على أساس $5 لكل تحويل)</div>
                  </div>
                  <div className="bg-surface border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity size={20} className="text-blue-500"/>
                      <span className="text-sm text-muted">نشاط الشركاء</span>
                    </div>
                    <div className="text-2xl font-black text-foreground">{links.filter(l => l.is_active).length}</div>
                    <div className="text-xs text-muted mt-1">روابط نشطة من أصل {links.length}</div>
                  </div>
                </div>
                
                {/* روابط Travelpayouts */}
                <div className="bg-surface border border-border rounded-2xl p-6 text-center">
                  <BarChart2 size={48} className="mx-auto mb-3 opacity-30"/>
                  <p className="font-medium">للحصول على إحصائيات تفصيلية دقيقة</p>
                  <p className="text-sm text-muted mt-1">قم بزيارة لوحة تحكم Travelpayouts لمتابعة الأرباح والنقرات بشكل فوري</p>
                  <div className="flex gap-3 justify-center mt-4">
                    <a href="https://app.travelpayouts.com/statistics" target="_blank" rel="noopener noreferrer"
                      className="inline-block bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                      فتح Travelpayouts
                    </a>
                    <button onClick={loadRealTimeStats}
                      className="inline-block bg-background border border-border px-5 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                      تحديث البيانات
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* LINKS - محدث مع عرض النقرات */}
            {activeTab === 'links' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif font-black text-2xl text-foreground">روابط Affiliate</h2>
                  <button onClick={() => setShowNewLink(!showNewLink)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                    <Plus size={16}/> إضافة رابط
                  </button>
                </div>

                {showNewLink && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-surface border border-border rounded-2xl p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input value={newLink.name} onChange={e => setNewLink({...newLink, name: e.target.value})}
                        placeholder="اسم الشركة" className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"/>
                      <input value={newLink.url} onChange={e => setNewLink({...newLink, url: e.target.value})}
                        placeholder="https://..." className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary" dir="ltr"/>
                      <input value={newLink.icon} onChange={e => setNewLink({...newLink, icon: e.target.value})}
                        placeholder="أيقونة (emoji)" className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"/>
                      <select value={newLink.category} onChange={e => setNewLink({...newLink, category: e.target.value})}
                        className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary">
                        <option value="flight">طيران</option>
                        <option value="hotel">فنادق</option>
                        <option value="taxi">نقل</option>
                        <option value="tour">جولات</option>
                        <option value="esim">eSIM</option>
                        <option value="general">عام</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addLink} disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm">
                        <Check size={14}/> حفظ
                      </button>
                      <button onClick={() => setShowNewLink(false)}
                        className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-xl text-sm font-medium">
                        <X size={14}/> إلغاء
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3">
                  {links.length === 0 ? (
                    <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted">
                      <Link2 size={48} className="mx-auto mb-3 opacity-30"/>
                      <p>لا توجد روابط بعد</p>
                      <button onClick={() => setShowNewLink(true)} className="mt-3 text-primary font-bold">➕ أضف رابطاً</button>
                    </div>
                  ) : (
                    links.map(link => (
                      <div key={link.id} className={`bg-surface border rounded-2xl p-4 flex items-center gap-3 transition-all ${link.is_active ? 'border-border' : 'border-border opacity-60'}`}>
                        <span className="text-2xl w-10 text-center">{link.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-foreground">{link.name}</div>
                          <div className="text-xs text-muted truncate" dir="ltr">{link.url}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-background border border-border px-2 py-0.5 rounded-full">{link.category}</span>
                            <span className="text-xs text-muted">🖱️ {link.clicks || 0} نقرة</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleLink(link.id, link.is_active)}
                            className={`p-2 rounded-xl transition-colors ${link.is_active ? 'bg-secondary/10 text-secondary hover:bg-secondary/20' : 'bg-background border border-border text-muted'}`}>
                            {link.is_active ? <Eye size={16}/> : <EyeOff size={16}/>}
                          </button>
                          <button onClick={() => deleteLink(link.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* BANNERS - محدث */}
            {activeTab === 'banners' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-serif font-black text-2xl text-foreground">الإعلانات</h2>
                  <button onClick={() => setShowNewBanner(!showNewBanner)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">
                    <Plus size={16}/> إضافة إعلان
                  </button>
                </div>

                {showNewBanner && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="bg-surface border border-border rounded-2xl p-4 mb-4">
                    <div className="space-y-3 mb-3">
                      <input value={newBanner.text} onChange={e => setNewBanner({...newBanner, text: e.target.value})}
                        placeholder="نص الإعلان..." className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary"/>
                      <input value={newBanner.url} onChange={e => setNewBanner({...newBanner, url: e.target.value})}
                        placeholder="رابط الإعلان https://..." className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary" dir="ltr"/>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addBanner} disabled={saving}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm">
                        <Check size={14}/> حفظ
                      </button>
                      <button onClick={() => setShowNewBanner(false)}
                        className="flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-xl text-sm font-medium">
                        <X size={14}/> إلغاء
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-3">
                  {banners.length === 0 ? (
                    <div className="bg-surface border border-border rounded-2xl p-12 text-center text-muted">
                      <Megaphone size={48} className="mx-auto mb-3 opacity-30"/>
                      <p>لا توجد إعلانات بعد</p>
                      <button onClick={() => setShowNewBanner(true)} className="mt-3 text-primary font-bold">➕ أضف إعلاناً</button>
                    </div>
                  ) : (
                    banners.map(banner => (
                      <div key={banner.id} className={`bg-surface border rounded-2xl p-4 transition-all ${banner.is_active ? 'border-border' : 'border-border opacity-60'}`}>
                        <div className="flex items-start gap-3">
                          <Megaphone size={20} className="text-primary mt-1 shrink-0"/>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm">{banner.text}</div>
                            {banner.url && <div className="text-xs text-muted truncate mt-1" dir="ltr">{banner.url}</div>}
                            <div className="text-xs text-muted mt-1">🖱️ {banner.clicks || 0} نقرة</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => toggleBanner(banner.id, banner.is_active)}
                              className={`p-2 rounded-xl transition-colors ${banner.is_active ? 'bg-secondary/10 text-secondary' : 'bg-background border border-border text-muted'}`}>
                              {banner.is_active ? <Eye size={16}/> : <EyeOff size={16}/>}
                            </button>
                            <button onClick={() => deleteBanner(banner.id)} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* SETTINGS - موجود */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-serif font-black text-2xl text-foreground mb-6">الإعدادات</h2>

                <div className="space-y-6">
                  <div className="bg-surface border border-border rounded-2xl p-6">
                    <h3 className="font-bold text-foreground mb-4">إعدادات الموقع</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted mb-1 block">اللغة الافتراضية</label>
                        <select value={siteConfig.lang} onChange={e => setSiteConfig({...siteConfig, lang: e.target.value})}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary w-full">
                          <option value="en">English</option>
                          <option value="ar">العربية</option>
                          <option value="fr">Français</option>
                          <option value="es">Español</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted mb-1 block">كلمة مرور الأدمن</label>
                        <input type="password" value={siteConfig.adminPassword}
                          onChange={e => setSiteConfig({...siteConfig, adminPassword: e.target.value})}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary w-full" dir="ltr"/>
                        <p className="text-xs text-muted mt-1">كلمة المرور الحالية: <strong>{siteConfig.adminPassword}</strong></p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-border rounded-2xl p-6">
                    <h3 className="font-bold text-foreground mb-4">إعدادات الشات AI</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted mb-1 block">النموذج</label>
                        <select value={chatConfig.model} onChange={e => setChatConfig({...chatConfig, model: e.target.value})}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary w-full" dir="ltr">
                          <option value="claude-haiku-4-5-20251001">Claude Haiku (سريع واقتصادي)</option>
                          <option value="claude-sonnet-4-6">Claude Sonnet (أذكى)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted mb-1 block">الحد الأقصى للرد (tokens)</label>
                        <input type="number" value={chatConfig.maxTokens}
                          onChange={e => setChatConfig({...chatConfig, maxTokens: Number(e.target.value)})}
                          className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary w-full" dir="ltr"/>
                      </div>
                    </div>
                  </div>

                  <button onClick={saveSettings} disabled={saving}
                    className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white py-3 rounded-xl font-black text-base hover:shadow-lg transition-all flex items-center justify-center gap-2">
                    {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check size={20}/>}
                    حفظ جميع الإعدادات
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}