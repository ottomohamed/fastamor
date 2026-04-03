import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Users, Link as LinkIcon, Copy } from 'lucide-react';
import { getStats } from '@/lib/tracking';
import { I18N } from '@/lib/data';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export function AdminModal({ isOpen, onClose, lang }: AdminModalProps) {
  const [tab, setTab] = useState<'stats' | 'partners' | 'marketing'>('stats');
  const [campName, setCampName] = useState('');
  const t = I18N[lang as keyof typeof I18N] || I18N.en;
  const stats = getStats();

  const handleCopy = () => {
    if (!campName.trim()) return alert(t.enter_source_name);
    const url = `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(campName)}`;
    navigator.clipboard.writeText(url);
    alert(`Copied: ${url}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            className="bg-surface border border-border w-full max-w-3xl rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-background p-6 border-b md:border-b-0 md:border-r border-border">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-serif font-black text-xl text-primary uppercase tracking-widest">Control</h3>
                <button onClick={onClose} className="md:hidden p-2 text-muted hover:text-foreground"><X size={20}/></button>
              </div>
              <div className="space-y-2">
                <button onClick={() => setTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'stats' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted hover:bg-black/5 hover:text-foreground'}`}><BarChart3 size={18}/> Analytics</button>
                <button onClick={() => setTab('partners')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'partners' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted hover:bg-black/5 hover:text-foreground'}`}><Users size={18}/> Partners</button>
                <button onClick={() => setTab('marketing')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${tab === 'marketing' ? 'bg-primary/10 text-primary shadow-sm' : 'text-muted hover:bg-black/5 hover:text-foreground'}`}><LinkIcon size={18}/> Marketing</button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 md:p-10 relative bg-surface">
              <button onClick={onClose} className="hidden md:block absolute top-6 right-6 p-2 text-muted hover:text-foreground bg-background border border-border rounded-full shadow-sm"><X size={20}/></button>

              {tab === 'stats' && (
                <div className="space-y-8 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-3xl font-black text-foreground">Performance</h2>
                    <p className="text-muted mt-1 font-medium">Real-time session analytics</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Clicks</p>
                      <p className="text-3xl font-black text-foreground">{stats.clicks}</p>
                    </div>
                    <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Searches</p>
                      <p className="text-3xl font-black text-foreground">{stats.searches}</p>
                    </div>
                    <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Active Ref</p>
                      <p className="text-xl font-bold text-secondary truncate">{stats.activeRef}</p>
                    </div>
                    <div className="bg-background border border-border rounded-2xl p-5 shadow-sm">
                      <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">Conversion</p>
                      <p className="text-3xl font-black text-info">{stats.conversion}%</p>
                    </div>
                  </div>
                  <div className="bg-[#FFD23F]/10 border border-[#FFD23F]/30 rounded-2xl p-6 shadow-sm">
                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Est. Revenue ($5 CPA @ 2%)</p>
                    <p className="text-4xl font-black text-amber-600">${stats.revenue}</p>
                  </div>
                </div>
              )}

              {tab === 'partners' && (
                <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                  <div>
                    <h2 className="font-serif text-3xl font-black text-foreground">Partners</h2>
                    <p className="text-muted mt-1 font-medium">Active integrated networks</p>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-2 no-scrollbar">
                    {["Booking.com", "Expedia", "Trip.com", "GetYourGuide", "Discover Cars", "Klook", "Omio", "Aviasales"].map(p => (
                      <div key={p} className="flex justify-between items-center bg-background border border-border rounded-xl p-4 shadow-sm">
                        <span className="font-bold text-foreground">{p}</span>
                        <span className="text-xs font-black text-white bg-[#00C9B1] px-2 py-1 rounded-md shadow-sm">ACTIVE</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tab === 'marketing' && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="font-serif text-3xl font-black text-foreground">Campaigns</h2>
                    <p className="text-muted mt-1 font-medium">Generate tracked URLs for affiliates</p>
                  </div>
                  <div className="bg-background border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-2">{t.campaign_source_label}</label>
                      <input
                        type="text"
                        value={campName}
                        onChange={e => setCampName(e.target.value)}
                        placeholder="e.g. tiktok_summer"
                        className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white font-black py-3 rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <Copy size={18} /> {t.generate_copy_link}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
