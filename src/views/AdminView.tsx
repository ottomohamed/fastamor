import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart2, Link2, Megaphone, Settings, LogOut, 
  Plus, Trash2, Edit3, Check, X, Eye, EyeOff,
  TrendingUp, MousePointer, Search, Globe
} from 'lucide-react';
import { supabase, getAffiliateLinks, getBanners, getStats, updateSettings } from '@/lib/supabase';
import type { AffiliateLink, Banner } from '@/lib/supabase';

interface AdminViewProps {
  onClose: () => void;
}

type Tab = 'stats' | 'links' | 'banners' | 'settings';

export function AdminView({ onClose }: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [stats, setStats] = useState({ clicks: 0, searches: 0, todayClicks: 0, total: 0 });
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

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        const s = await getStats();
        setStats(s);
      } else if (activeTab === 'links') {
        const l = await getAffiliateLinks();
        setLinks(l);
      } else if (activeTab === 'banners') {
        const b = await supabase.from('banners').select('*').order('created_at');
        setBanners(b.data || []);
      } else if (activeTab === 'settings') {
        const sc = await supabase.from('settings').select('*').eq('id', 'site_config').single();
        const cc = await supabase.from('settings').select('*').eq('id', 'chat_config').single();
        if (sc.data) setSiteConfig(sc.data.value);
        if (cc.data) setChatConfig(cc.data.value);
      }
    } catch (e) { showToast('❌ خطأ في تحميل البيانات'); }
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleLink = async (id: string, current: boolean) => {
    await supabase.from('affiliate_links').update({ is_active: !current }).eq('id', id);
    setLinks(links.map(l => l.id === id ? { ...l, is_active: !current } : l));
    showToast(current ? '🔴 رابط معطّل' : '🟢 رابط مفعّل');
  };

  const deleteLink = async (id: string) => {
    if (!confirm('حذف هذا الرابط؟')) return;
    await supabase.from('affiliate_links').delete().eq('id', id);
    setLinks(links.filter(l => l.id !== id));
    showToast('🗑️ تم الحذف');
  };

  const addLink = async () => {
    if (!newLink.name || !newLink.url) return showToast('❌ أدخل الاسم والرابط');
    setSaving(true);
    const { data } = await supabase.from('affiliate_links').insert(newLink).select().single();
    if (data) setLinks([...links, data]);
    setNewLink({ name: '', url: '', icon: '🔗', category: 'general' });
    setShowNewLink(false);
    setSaving(false);
    showToast('✅ تم إضافة الرابط');
  };

  const toggleBanner = async (id: string, current: boolean) => {
    await supabase.from('banners').update({ is_active: !current }).eq('id', id);
    setBanners(banners.map(b => b.id === id ? { ...b, is_active: !current } : b));
    showToast(current ? '🔴 إعلان معطّل' : '🟢 إعلان مفعّل');
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('حذف هذا الإعلان؟')) return;
    await supabase.from('banners').delete().eq('id', id);
    setBanners(banners.filter(b => b.id !== id));
    showToast('🗑️ تم الحذف');
  };

  const addBanner = async () => {
    if (!newBanner.text) return showToast('❌ أدخل نص الإعلان');
    setSaving(true);
    const { data } = await supabase.from('banners').insert(newBanner).select().single();
    if (data) setBanners([...banners, data]);
    setNewBanner({ text: '', url: '' });
    setShowNewBanner(false);
    setSaving(false);
    showToast('✅ تم إضافة الإعلان');
  };

  const saveSettings = async () => {
    setSaving(true);
    await updateSettings('site_config', siteConfig);
    await updateSettings('chat_config', chatConfig);
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
      {/* Toast */}
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
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* ── STATS */}
            {activeTab === 'stats' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="font-serif font-black text-2xl text-foreground mb-6">إحصائيات الموقع</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'إجمالي النقرات', value: stats.clicks, icon: <MousePointer size={24} className="text-primary"/>, color: 'border-primary/20 bg-primary/5' },
                    { label: 'نقرات اليوم', value: stats.todayClicks, icon: <TrendingUp size={24} className="text-secondary"/>, color: 'border-secondary/20 bg-secondary/5' },
                    { label: 'عمليات بحث', value: stats.searches, icon: <Search size={24} className="text-accent"/>, color: 'border-accent/20 bg-accent/5' },
                    { label: 'إجمالي الأحداث', value: stats.total, icon: <Globe size={24} className="text-info"/>, color: 'border-info/20 bg-info/5' },
                  ].map((stat, i) => (
                    <div key={i} className={`rounded-2xl border p-4 ${stat.color}`}>
                      <div className="mb-2">{stat.icon}</div>
                      <div className="text-3xl font-black text-foreground">{stat.value}</div>
                      <div className="text-xs text-muted font-medium mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-surface border border-border rounded-2xl p-6 text-center text-muted">
                  <BarChart2 size={48} className="mx-auto mb-3 opacity-30"/>
                  <p className="font-medium">الرسوم البيانية التفصيلية قادمة قريباً</p>
                  <p className="text-sm mt-1">تابع الإحصائيات التفصيلية من Travelpayouts Dashboard</p>
                  <a href="https://app.travelpayouts.com/statistics" target="_blank"
                    className="inline-block mt-3 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                    فتح Travelpayouts
                  </a>
                </div>
              </motion.div>
            )}

            {/* ── LINKS */}
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
                        <option value="compensation">تعويضات</option>
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
                  {links.map(link => (
                    <div key={link.id} className={`bg-surface border rounded-2xl p-4 flex items-center gap-3 transition-all ${link.is_active ? 'border-border' : 'border-border opacity-50'}`}>
                      <span className="text-2xl w-10 text-center">{link.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground">{link.name}</div>
                        <div className="text-xs text-muted truncate" dir="ltr">{link.url}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-background border border-border px-2 py-0.5 rounded-full">{link.category}</span>
                          <span className="text-xs text-muted">{link.clicks} نقرة</span>
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
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── BANNERS */}
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
                  {banners.map(banner => (
                    <div key={banner.id} className={`bg-surface border rounded-2xl p-4 transition-all ${banner.is_active ? 'border-border' : 'border-border opacity-50'}`}>
                      <div className="flex items-start gap-3">
                        <Megaphone size={20} className="text-primary mt-1 shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm">{banner.text}</div>
                          {banner.url && <div className="text-xs text-muted truncate mt-1" dir="ltr">{banner.url}</div>}
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
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── SETTINGS */}
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
