import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Building2, Ticket, Car, Bus, Train, ArrowLeft, Bot, Mic, Send, ExternalLink, MapPin } from 'lucide-react';
import { I18N, SERVICES, AFFILIATE_LINKS } from '@/lib/data';
import { trackClick } from '@/lib/tracking';
import { useFastamorChat, detectService } from '@/hooks/use-pyramic-chat';
import { useSpeech } from '@/hooks/use-speech';
import { SearchOverlay } from '@/components/SearchOverlay';

interface AppViewProps {
  onClose: () => void;
  initialService?: string;
  lang: string;
  setLang: (l: string) => void;
}

// ═══════════════════════════════════════════════════════
// Autocomplete Hook — Aviasales API
// ═══════════════════════════════════════════════════════
interface Place {
  code: string;
  name: string;
  city_name?: string;
  country_name: string;
  type: string;
}

function useAutocomplete(lang: string) {
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const locale = ['ar','en','fr','es'].includes(lang) ? lang : 'en';
        const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(term)}&locale=${locale}&types[]=city&types[]=airport`;
        const res = await fetch(url);
        const data: Place[] = await res.json();
        setSuggestions(data.slice(0, 6));
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [lang]);

  const clear = () => setSuggestions([]);

  return { suggestions, isLoading, search, clear };
}

// ═══════════════════════════════════════════════════════
// Autocomplete Dropdown Component
// ═══════════════════════════════════════════════════════
function AutocompleteDropdown({
  suggestions,
  isLoading,
  onSelect,
  isRtl,
}: {
  suggestions: Place[];
  isLoading: boolean;
  onSelect: (place: Place) => void;
  isRtl: boolean;
}) {
  if (!isLoading && suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.15 }}
        className={`absolute bottom-full mb-2 left-0 right-0 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {isLoading && (
          <div className="px-4 py-3 text-xs text-muted font-medium flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            Searching...
          </div>
        )}
        {suggestions.map((place, i) => (
          <button
            key={place.code + i}
            onMouseDown={(e) => { e.preventDefault(); onSelect(place); }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left border-b border-border last:border-0"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              {place.type === 'airport'
                ? <Plane size={14} className="text-primary" />
                : <MapPin size={14} className="text-primary" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-foreground truncate">
                {place.city_name || place.name}
              </div>
              <div className="text-xs text-muted truncate">{place.country_name}</div>
            </div>
            <div className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg flex-shrink-0">
              {place.code}
            </div>
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════════════════
// Smart Input — يدمج Autocomplete مع الرسالة
// ═══════════════════════════════════════════════════════
function SmartInput({
  value,
  onChange,
  onSend,
  onMic,
  isListening,
  placeholder,
  isRtl,
  lang,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onMic: () => void;
  isListening: boolean;
  placeholder: string;
  isRtl: boolean;
  lang: string;
}) {
  const { suggestions, isLoading, search, clear } = useAutocomplete(lang);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // استخرج آخر كلمة يكتبها المستخدم للبحث
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    // ابحث عن آخر كلمة (بعد فراغ أو حرف خاص)
    const lastWord = val.split(/[\s→,،]/g).pop() || '';
    if (lastWord.length >= 2) {
      search(lastWord);
      setShowDropdown(true);
    } else {
      clear();
      setShowDropdown(false);
    }
  };

  const handleSelect = (place: Place) => {
    // استبدل آخر كلمة بالمدينة المختارة
    const parts = value.split(/\s+/);
    parts[parts.length - 1] = place.city_name || place.name;
    const newValue = parts.join(' ') + ' ';
    onChange(newValue);
    clear();
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      clear();
      setShowDropdown(false);
      onSend();
    }
    if (e.key === 'Escape') {
      clear();
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full">
      {showDropdown && (
        <AutocompleteDropdown
          suggestions={suggestions}
          isLoading={isLoading}
          onSelect={handleSelect}
          isRtl={isRtl}
        />
      )}
      <div className="flex items-center gap-2 bg-surface border border-border rounded-full p-2 shadow-xl">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={isListening ? "Listening..." : placeholder}
          className="flex-1 bg-transparent border-none text-foreground px-4 focus:outline-none focus:ring-0 font-medium placeholder:text-muted"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
        <button
          onClick={onMic}
          className={`p-3 rounded-full transition-colors ${isListening ? 'bg-primary text-white animate-pulse' : 'bg-background border border-border text-muted hover:text-primary'}`}
        >
          <Mic size={20} />
        </button>
        <button
          onClick={() => { clear(); setShowDropdown(false); onSend(); }}
          className="p-3 rounded-full bg-primary text-white hover:bg-[#FF5733] transition-colors shadow-sm"
        >
          <Send size={20} className={isRtl ? "rotate-180" : ""} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main AppView
// ═══════════════════════════════════════════════════════
export function AppView({ onClose, initialService, lang, setLang }: AppViewProps) {
  const [activeSvc, setActiveSvc] = useState<string>(initialService || '');
  const [inputText, setInputText] = useState('');

  const t = I18N[lang as keyof typeof I18N] || I18N.en;
  const isRtl = lang === 'ar';

  const { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, sendMessage, clearChat } = useFastamorChat(activeSvc || 'flight', lang);
  const { isListening, supported, listen, cancelSpeech } = useSpeech(lang);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialService) handleServiceSelect(initialService);
  }, [initialService]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, hasResults]);

  const handleServiceSelect = (svc: string) => {
    setActiveSvc(svc);
    const svcData = SERVICES[svc as keyof typeof SERVICES];
    const greeting = svcData?.greetings?.[lang as keyof typeof svcData.greetings] || svcData?.greetings?.en || "Hi! How can I help you travel today?";
    clearChat(greeting);
    cancelSpeech();
  };

  const handleHomeSend = () => {
    if (!inputText.trim()) return;
    const detected = detectService(inputText);
    handleServiceSelect(detected);
    sendMessage(inputText);
    setInputText('');
  };

  const handleChatSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleMicClick = (context: 'home' | 'chat') => {
    if (!supported) return alert("Voice recognition not supported in this browser.");
    listen((text) => {
      setInputText(text);
      if (context === 'home') {
        const detected = detectService(text);
        handleServiceSelect(detected);
        sendMessage(text);
        setInputText('');
      } else {
        sendMessage(text);
        setInputText('');
      }
    });
  };

  // ── HOME SCREEN ──────────────────────────────────────
  if (!activeSvc) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
        {/* Ad Sidebar */}
        <div className="hidden lg:block w-72 bg-surface border-r border-border p-6 overflow-y-auto shadow-sm">
          <div className="mb-8 font-serif text-xl font-black tracking-widest text-foreground">
            FAST<span className="text-primary italic">AMOR</span>
          </div>
          <p className="text-xs text-muted font-bold uppercase tracking-widest mb-4">Sponsor Deals</p>
          <div className="space-y-4">
            <div onClick={() => trackClick('https://trip.tpx.gr/kxwnTr31')} className="group cursor-pointer rounded-2xl overflow-hidden border border-border shadow-sm relative">
              <img src={`${import.meta.env.BASE_URL}images/hotel-luxury.png`} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <p className="text-white font-bold">Trip.com VIP</p>
                <p className="text-[#FFD23F] text-xs font-bold drop-shadow-md">Exclusive 20% Discount</p>
              </div>
            </div>
            <div onClick={() => trackClick('https://hotels.tpx.gr/HZcgZ2jB')} className="group cursor-pointer rounded-2xl overflow-hidden border border-border shadow-sm relative">
              <img src={`${import.meta.env.BASE_URL}images/tour-experience.png`} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <p className="text-white font-bold">Marriott Bonvoy</p>
                <p className="text-[#00C9B1] text-xs font-bold drop-shadow-md">Earn Double Points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar relative pb-24">
          <div className="bg-surface/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
            <div className="lg:hidden font-serif text-lg font-black tracking-widest text-foreground">
              FAST<span className="text-primary italic">AMOR</span>
            </div>
            <div className="flex bg-background rounded-full p-1 border border-border shadow-inner mx-auto lg:ml-0">
              {['en', 'ar', 'fr', 'es'].map(l => (
                <button key={l} onClick={() => setLang(l)} className={`px-4 py-1.5 text-xs font-bold uppercase rounded-full transition-colors ${lang === l ? 'bg-[#FFD23F] text-black shadow-sm' : 'text-muted hover:text-foreground'}`}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 text-muted hover:text-foreground transition-colors"><X size={20} /></button>
          </div>

          <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
            {/* Hero */}
            <div className="relative rounded-3xl overflow-hidden mb-10 h-64 md:h-80 border border-border shadow-lg group">
              <img src={`${import.meta.env.BASE_URL}images/flight-scenic.png`} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-6 md:bottom-10 left-6 md:left-10 right-6 md:right-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <span className="inline-block bg-[#00C9B1] text-white text-xs font-bold uppercase px-3 py-1 rounded-full mb-3 shadow-md"><span className="text-white mr-1">✓</span>Verified Price</span>
                  <div className="flex items-center gap-4 text-white">
                    <div className="text-center"><div className="text-2xl md:text-4xl font-black drop-shadow-md">NYC</div><div className="text-xs text-white/80 font-medium">New York</div></div>
                    <Plane className="text-white/50 w-8 h-8 md:w-12 md:h-12" />
                    <div className="text-center"><div className="text-2xl md:text-4xl font-black drop-shadow-md">DXB</div><div className="text-xs text-white/80 font-medium">Dubai</div></div>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div>
                    <div className="text-white/60 line-through text-sm font-medium">$850</div>
                    <div className="text-white text-3xl font-black drop-shadow-md"><span className="text-xl">$</span>599</div>
                  </div>
                  <button onClick={() => handleServiceSelect('flight')} className="flex-1 md:flex-none bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white px-6 py-3 rounded-xl font-black hover:shadow-lg transition-all transform hover:-translate-y-0.5">Claim Deal</button>
                </div>
              </div>
            </div>

            <h3 className="font-serif text-2xl font-black text-foreground mb-4">{t.trending}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div onClick={() => trackClick('https://trip.tpx.gr/kxwnTr31')} className="cursor-pointer bg-surface border border-border shadow-sm rounded-2xl p-4 hover:border-[#00C9B1]/50 hover:shadow-md transition-all flex items-center gap-4">
                <img src={`${import.meta.env.BASE_URL}images/hotel-luxury.png`} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div><p className="text-foreground font-bold">Luxury Suites</p><p className="text-[#00C9B1] text-sm font-black">$129/nt - Book</p></div>
              </div>
              <div onClick={() => trackClick('https://booking.tpx.gr/EWmbrXYx')} className="cursor-pointer bg-surface border border-border shadow-sm rounded-2xl p-4 hover:border-[#00C9B1]/50 hover:shadow-md transition-all flex items-center gap-4">
                <img src={`${import.meta.env.BASE_URL}images/hotel-luxury.png`} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div><p className="text-foreground font-bold">Tropical Villas</p><p className="text-[#00C9B1] text-sm font-black">$89/nt - Book</p></div>
              </div>
              <div onClick={() => trackClick('https://aviasales.tpx.gr/EDLTCi50')} className="cursor-pointer bg-surface border border-border shadow-sm rounded-2xl p-4 hover:border-[#FF6B35]/50 hover:shadow-md transition-all flex items-center gap-4">
                <img src={`${import.meta.env.BASE_URL}images/flight-scenic.png`} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div><p className="text-foreground font-bold">City Breaks</p><p className="text-[#FF6B35] text-sm font-black">Flights from $110</p></div>
              </div>
            </div>

            <h3 className="font-serif text-2xl font-black text-foreground mb-4">{t.services}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(SERVICES).map(([key, svc]) => (
                <button key={key} onClick={() => handleServiceSelect(key)} className="group relative h-32 rounded-2xl overflow-hidden border border-border bg-surface shadow-sm hover:shadow-md text-left transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute top-4 right-4 text-muted group-hover:text-primary transition-colors">
                    {key === 'flight' && <Plane size={32} />}
                    {key === 'hotel' && <Building2 size={32} />}
                    {key === 'taxi' && <Car size={32} />}
                    {key === 'experience' && <Ticket size={32} />}
                    {key === 'bus' && <Bus size={32} />}
                    {key === 'train' && <Train size={32} />}
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <h4 className="text-foreground font-bold text-lg">{svc.title}</h4>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ✅ Home Input مع Autocomplete */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none">
            <div className="max-w-3xl mx-auto pointer-events-auto">
              <SmartInput
                value={inputText}
                onChange={setInputText}
                onSend={handleHomeSend}
                onMic={() => handleMicClick('home')}
                isListening={isListening}
                placeholder={t.placeholder}
                isRtl={isRtl}
                lang={lang}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CHAT SCREEN ──────────────────────────────────────
  const svcInfo = SERVICES[activeSvc as keyof typeof SERVICES];
  const staticLinks = AFFILIATE_LINKS[activeSvc as keyof typeof AFFILIATE_LINKS] || [];
  const links = dynamicLinks.length > 0 ? dynamicLinks : staticLinks;

  return (
    <div className="h-screen bg-[#FFFDF7] flex flex-col overflow-hidden">
      <SearchOverlay isVisible={showSearchAnim} />

      {/* Chat Header */}
      <div className="bg-surface border-b border-border px-4 py-3 flex items-center gap-4 sticky top-0 z-20 shadow-sm">
        <button onClick={() => setActiveSvc('')} className="p-2 bg-background border border-border rounded-full hover:bg-black/5 text-foreground transition-colors">
          <ArrowLeft size={20} className={isRtl ? "rotate-180" : ""} />
        </button>
        <div className="flex-1">
          <h2 className="font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B35] to-[#00C9B1] uppercase tracking-widest text-sm">
            FASTAMOR — {svcInfo?.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted font-medium">
            <span className="w-2 h-2 rounded-full bg-[#00C9B1] animate-pulse"></span>
            Ready for adventure
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#FFD23F] flex items-center justify-center text-white shadow-md">
          <Bot size={24} />
        </div>
      </div>

      {/* Promos Bar */}
      <div className="bg-surface px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar border-b border-border shadow-sm">
        <div className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20 text-xs font-black flex items-center gap-1">
          🔥 {t.deals}
        </div>
        <button onClick={() => trackClick('https://aviasales.tpx.gr/EDLTCi50')} className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground text-xs font-bold hover:bg-black/5 hover:border-border transition-colors shadow-sm">✈️ Flights</button>
        <button onClick={() => trackClick('https://booking.tpx.gr/EWmbrXYx')} className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground text-xs font-bold hover:bg-black/5 hover:border-border transition-colors shadow-sm">🏨 Hotels</button>
        <button onClick={() => trackClick('https://klook.tpx.gr/B3ZUPfZM')} className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground text-xs font-bold hover:bg-black/5 hover:border-border transition-colors shadow-sm">🎟️ Tours</button>
        <button onClick={() => trackClick('https://discovercars.tpx.gr/9pGzpviq')} className="whitespace-nowrap px-3 py-1.5 rounded-lg bg-surface border border-border text-foreground text-xs font-bold hover:bg-black/5 hover:border-border transition-colors shadow-sm">🚗 Cars</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${m.role === 'user' ? 'bg-[#FF6B35] text-white rounded-tr-sm' : 'bg-surface border border-border text-foreground rounded-tl-sm'}`}>
                <p className="text-sm md:text-base leading-relaxed font-medium">{m.content}</p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-5 py-4 flex gap-1 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#FF6B35] typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-[#FFD23F] typing-dot"></div>
                <div className="w-2 h-2 rounded-full bg-[#00C9B1] typing-dot"></div>
              </div>
            </div>
          )}

          {hasResults && links.length > 0 && !isTyping && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C9B1] to-[#FF6B35] flex items-center justify-center text-white text-sm shadow-md">🎯</div>
                <div>
                  <div className="font-serif font-black text-foreground text-base">
                    {lang === 'ar' ? 'نتائجك — اضغط للحجز' : lang === 'fr' ? 'Vos résultats — Réservez!' : lang === 'es' ? '¡Tus resultados — Reserva!' : 'Your Results — Click to Book!'}
                  </div>
                  <div className="text-xs text-muted font-medium">
                    {lang === 'ar' ? 'أسعار حقيقية من المواقع الرسمية' : lang === 'fr' ? 'Prix réels depuis les sites officiels' : lang === 'es' ? 'Precios reales desde sitios oficiales' : 'Live prices from official booking sites'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {links.map((l, i) => {
                  const palette = [
                    { ring: "ring-[#00C9B1]/30", glow: "shadow-[0_2px_16px_rgba(0,201,177,0.18)]", iconBg: "bg-[#00C9B1]/10 text-[#00C9B1]", badge: "bg-[#00C9B1] text-white" },
                    { ring: "ring-[#FF6B35]/30", glow: "shadow-[0_2px_16px_rgba(255,107,53,0.18)]", iconBg: "bg-[#FF6B35]/10 text-[#FF6B35]", badge: "bg-[#FF6B35] text-white" },
                    { ring: "ring-[#FFD23F]/30", glow: "shadow-[0_2px_16px_rgba(255,210,63,0.18)]", iconBg: "bg-[#FFD23F]/10 text-[#FFD23F]", badge: "bg-[#FFD23F] text-black" },
                  ];
                  const p = palette[i % palette.length];
                  const icon = 'icon' in l ? (l as any).icon : null;
                  const ctaLabel = lang === 'ar' ? 'احجز الآن' : lang === 'fr' ? 'Réserver' : lang === 'es' ? 'Reservar' : 'Book Now';
                  return (
                    <button key={i} onClick={() => trackClick(l.url)}
                      className={`w-full flex items-center gap-4 bg-surface border border-border ring-1 ${p.ring} ${p.glow} rounded-2xl px-4 py-3.5 hover:scale-[1.01] active:scale-[0.99] transition-all group text-left`}>
                      {icon && <span className={`text-xl w-10 h-10 rounded-xl ${p.iconBg} flex items-center justify-center shrink-0 font-bold`}>{icon}</span>}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-black text-foreground">{l.name}</div>
                        <div className="text-xs text-muted font-semibold truncate mt-0.5">{l.desc}</div>
                      </div>
                      <span className={`shrink-0 text-xs font-black px-3 py-1.5 rounded-full ${p.badge} flex items-center gap-1`}>
                        {ctaLabel} <ExternalLink size={11} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* ✅ Chat Input مع Autocomplete */}
      <div className="shrink-0 p-4 border-t border-border bg-[#FFFDF7]">
        <div className="max-w-3xl mx-auto">
          <SmartInput
            value={inputText}
            onChange={setInputText}
            onSend={handleChatSend}
            onMic={() => handleMicClick('chat')}
            isListening={isListening}
            placeholder={t.placeholder}
            isRtl={isRtl}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}
