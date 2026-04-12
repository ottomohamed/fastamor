import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plane, Building2, Ticket, Car, Bus, Ship, ArrowLeft, Mic, Send, ExternalLink, MapPin, Sparkles, Globe } from 'lucide-react';
import { I18N, SERVICES, AFFILIATE_LINKS } from '@/lib/data';
import { trackClick } from '@/lib/tracking';
import { useFastamorChat, detectService } from '@/hooks/use-fastamor-chat';
import type { FlightResult } from '@/hooks/use-fastamor-chat';
import { useSpeech } from '@/hooks/use-speech';

interface AppViewProps {
  onClose: () => void;
  initialService?: string;
  lang: string;
  setLang: (l: string) => void;
}

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
    if (term.length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const locale = ['ar','en','fr','es'].includes(lang) ? lang : 'en';
        const res = await fetch(`https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(term)}&locale=${locale}&types[]=city&types[]=airport`);
        const data: Place[] = await res.json();
        setSuggestions(data.slice(0, 5));
      } catch { setSuggestions([]); }
      finally { setIsLoading(false); }
    }, 300);
  }, [lang]);

  return { suggestions, isLoading, search, clear: () => setSuggestions([]) };
}

function FlightCard({ flight, lang }: { flight: FlightResult; lang: string }) {
  const bookLabel = lang === 'ar' ? 'احجز الآن' : lang === 'fr' ? 'Réserver' : lang === 'es' ? 'Reservar' : 'Book Now';
  const directLabel = lang === 'ar' ? 'مباشر' : lang === 'fr' ? 'Direct' : lang === 'es' ? 'Directo' : 'Direct';

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur border border-[#bcc9c6] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#f0eee8] flex items-center justify-center shrink-0">
          <img src={flight.airline_logo} alt={flight.airline} className="w-7 h-7 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).style.display='none'; }} />
        </div>
        <div className="flex-1 flex items-center justify-between gap-2">
          <div className="text-center">
            <div className="text-xl font-black text-[#1b1c19]">{flight.origin}</div>
            <div className="text-xs text-[#6d7a77]">{flight.departure_time}</div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 px-2">
            <div className="text-xs text-[#6d7a77]">{flight.duration}</div>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-[#bcc9c6]"/>
              <Plane size={10} className="text-[#00685f] shrink-0"/>
              <div className="flex-1 h-px bg-[#bcc9c6]"/>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${flight.stops === 'Direct' || flight.stops === 'مباشر' ? 'bg-[#e1f5ee] text-[#00685f]' : 'bg-[#ffdad6] text-[#ba1a1a]'}`}>
              {flight.stops === 'Direct' ? directLabel : flight.stops}
            </span>
          </div>
          <div className="text-center">
            <div className="text-xl font-black text-[#1b1c19]">{flight.destination}</div>
            <div className="text-xs text-[#6d7a77]">{flight.gate || ''}</div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-2xl font-black text-[#1b1c19]">${flight.price}</div>
          <button onClick={() => { trackClick(flight.booking_url); window.open(flight.booking_url, '_blank'); }}
            className="mt-1 bg-[#00685f] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#005049] transition-colors flex items-center gap-1">
            {bookLabel} <ExternalLink size={10}/>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

const SERVICES_NAV = [
  { id: 'flight', icon: Plane, label: { en: 'Flights', ar: 'طيران', fr: 'Vols', es: 'Vuelos' } },
  { id: 'hotel', icon: Building2, label: { en: 'Hotels', ar: 'فنادق', fr: 'Hôtels', es: 'Hoteles' } },
  { id: 'experience', icon: Ticket, label: { en: 'Tours', ar: 'جولات', fr: 'Tours', es: 'Tours' } },
  { id: 'taxi', icon: Car, label: { en: 'Transfers', ar: 'نقل', fr: 'Transferts', es: 'Traslados' } },
  { id: 'bus', icon: Bus, label: { en: 'Buses', ar: 'حافلات', fr: 'Bus', es: 'Buses' } },
  { id: 'cruise', icon: Ship, label: { en: 'Cruises', ar: 'كروز', fr: 'Croisières', es: 'Cruceros' } },
];

const SIDEBAR_LINKS = [
  { name: 'Aviasales', desc: 'Best flight deals', url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: '✈️', color: 'from-orange-500 to-amber-400' },
  { name: 'Intui Travel', desc: 'Top hotel offers', url: 'https://intui.tpx.gr/kguAoKIU', icon: '🏨', color: 'from-blue-500 to-cyan-400' },
  { name: 'Klook', desc: 'Amazing experiences', url: 'https://klook.tpx.gr/vRUzaJbI', icon: '🎡', color: 'from-red-500 to-pink-400' },
  { name: 'GetTransfer', desc: 'Airport transfers', url: 'https://gettransfer.tpx.gr/9poAnD5l', icon: '🚕', color: 'from-yellow-500 to-orange-400' },
];

export function AppView({ onClose, initialService, lang, setLang }: AppViewProps) {
  const [activeSvc, setActiveSvc] = useState<string>(initialService || '');
  const [inputText, setInputText] = useState('');
  const [voiceMode, setVoiceMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const t = I18N[lang as keyof typeof I18N] || I18N.en;
  const isRtl = lang === 'ar';

  const { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, flightResults, sendMessage, clearChat } = useFastamorChat(activeSvc || 'flight', lang);
  const { isListening, supported, listen, speak, cancelSpeech } = useSpeech(lang);
  const { search: autoSearch, clear: autoClear } = useAutocomplete(lang);

  useEffect(() => { if (initialService) handleServiceSelect(initialService); }, [initialService]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping, flightResults]);
  useEffect(() => {
    if (voiceMode && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && last.content) speak(last.content);
    }
  }, [messages, voiceMode]);

  const handleServiceSelect = (svc: string) => {
    setActiveSvc(svc);
    const svcData = SERVICES[svc as keyof typeof SERVICES];
    const greeting = svcData?.greetings?.[lang as keyof typeof svcData.greetings] || svcData?.greetings?.en || 'Hi! How can I help you travel today?';
    clearChat(greeting);
    cancelSpeech();
  };

  const handleSend = (fromHome = false) => {
    if (!inputText.trim()) return;
    setShowDropdown(false);
    if (fromHome || !activeSvc) {
      const detected = detectService(inputText);
      handleServiceSelect(detected);
    }
    sendMessage(inputText);
    setInputText('');
  };

  const handleMic = () => {
    if (!supported) return;
    setVoiceMode(true);
    listen((text) => {
      if (!activeSvc) handleServiceSelect(detectService(text));
      sendMessage(text);
    });
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    const last = val.split(/[\s,،]/g).pop() || '';
    if (last.length >= 2) {
      autoSearch(last);
      setShowDropdown(true);
    } else {
      autoClear();
      setShowDropdown(false);
    }
  };

  const greetings: Record<string, string> = {
    en: "Where would you like to travel?",
    ar: "إلى أين تريد السفر؟",
    fr: "Où souhaitez-vous voyager ?",
    es: "¿A dónde deseas viajar?"
  };

  const subtitles: Record<string, string> = {
    en: "Tell me your destination and I'll find the best deals instantly",
    ar: "أخبرني بوجهتك وسأجد لك أفضل العروض فوراً",
    fr: "Dites-moi votre destination et je trouverai les meilleures offres",
    es: "Dime tu destino y encontraré las mejores ofertas al instante"
  };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: '#fbf9f3', fontFamily: "'Inter', sans-serif" }} dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── LEFT SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 h-full border-r border-[#e4e2dd] bg-[#fbf9f3] p-6 gap-5 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <img src="https://i.ibb.co/x8sSqTDj/1978.png" alt="Fastamor" className="h-9 w-auto"/>
          <div>
            <div className="font-black text-lg text-[#1b1c19] tracking-tight">Fastamor</div>
            <div className="text-[10px] text-[#6d7a77] font-medium tracking-wider uppercase">AI Travel Concierge</div>
          </div>
        </div>

        {/* Services nav */}
        <nav className="flex flex-col gap-1">
          {SERVICES_NAV.map(svc => (
            <button key={svc.id} onClick={() => handleServiceSelect(svc.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeSvc === svc.id
                  ? 'bg-[#e1f5ee] text-[#00685f] font-bold'
                  : 'text-[#3d4947] hover:bg-[#f0eee8] hover:translate-x-1'
              }`}>
              <svc.icon size={18} className={activeSvc === svc.id ? 'text-[#00685f]' : 'text-[#6d7a77]'}/>
              {svc.label[lang as keyof typeof svc.label] || svc.label.en}
            </button>
          ))}
        </nav>

        {/* Sponsor deals */}
        <div className="mt-2">
          <p className="text-[10px] font-bold text-[#6d7a77] uppercase tracking-widest mb-3">Partner Deals</p>
          <div className="space-y-3">
            {SIDEBAR_LINKS.map(link => (
              <button key={link.name} onClick={() => { trackClick(link.url); window.open(link.url, '_blank'); }}
                className="w-full flex items-center gap-3 p-3 bg-white border border-[#e4e2dd] rounded-xl hover:shadow-sm transition-all text-left group">
                <span className="text-xl">{link.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#1b1c19] truncate">{link.name}</div>
                  <div className="text-[10px] text-[#6d7a77] truncate">{link.desc}</div>
                </div>
                <ExternalLink size={12} className="text-[#bcc9c6] group-hover:text-[#00685f] transition-colors shrink-0"/>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-[#e4e2dd]">
          <div className="flex items-center gap-2 p-3 bg-[#e1f5ee] rounded-xl">
            <Sparkles size={14} className="text-[#00685f]"/>
            <div>
              <p className="text-[10px] font-bold text-[#00685f] uppercase tracking-wide">AI Powered</p>
              <p className="text-[10px] text-[#3f6560]">Personalized travel intelligence</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#e4e2dd] bg-white/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[#f0eee8] text-[#6d7a77] hover:text-[#1b1c19] transition-colors">
              <ArrowLeft size={20} className={isRtl ? 'rotate-180' : ''}/>
            </button>
            <div className="lg:hidden font-black text-lg text-[#1b1c19]">Fastamor</div>
          </div>

          {/* Service pills — mobile */}
          <div className="flex lg:hidden gap-1 overflow-x-auto no-scrollbar">
            {SERVICES_NAV.slice(0, 4).map(svc => (
              <button key={svc.id} onClick={() => handleServiceSelect(svc.id)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeSvc === svc.id ? 'bg-[#00685f] text-white' : 'bg-[#f0eee8] text-[#3d4947]'
                }`}>
                <svc.icon size={12}/> {svc.label[lang as keyof typeof svc.label] || svc.label.en}
              </button>
            ))}
          </div>

          {/* Language + close */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#f0eee8] rounded-full p-1 gap-0.5">
              {['en','ar','fr','es'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full transition-colors ${
                    lang === l ? 'bg-white text-[#00685f] shadow-sm' : 'text-[#6d7a77] hover:text-[#1b1c19]'
                  }`}>{l}</button>
              ))}
            </div>
            <button onClick={onClose} className="lg:hidden p-2 rounded-full hover:bg-[#f0eee8] text-[#6d7a77]">
              <X size={18}/>
            </button>
          </div>
        </header>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 md:px-8 py-6">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* Empty state */}
            {messages.length === 0 && !activeSvc && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                <div className="flex items-center justify-center gap-2 text-[#00685f] text-xs font-bold tracking-widest uppercase mb-6">
                  <div className="w-8 h-px bg-[#00685f]"/>
                  Voyager Concierge
                  <div className="w-8 h-px bg-[#00685f]"/>
                </div>
                <h2 className="text-3xl font-black text-[#1b1c19] mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {greetings[lang] || greetings.en}
                </h2>
                <p className="text-[#6d7a77] text-sm max-w-md mx-auto mb-10">{subtitles[lang] || subtitles.en}</p>
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  {SERVICES_NAV.slice(0, 3).map(svc => (
                    <button key={svc.id} onClick={() => handleServiceSelect(svc.id)}
                      className="flex flex-col items-center gap-2 p-4 bg-white border border-[#e4e2dd] rounded-2xl hover:border-[#00685f] hover:bg-[#e1f5ee] transition-all group shadow-sm">
                      <svc.icon size={22} className="text-[#6d7a77] group-hover:text-[#00685f] transition-colors"/>
                      <span className="text-xs font-bold text-[#3d4947] group-hover:text-[#00685f]">
                        {svc.label[lang as keyof typeof svc.label] || svc.label.en}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#e1f5ee] flex items-center justify-center mr-2 shrink-0 mt-1">
                    <Globe size={14} className="text-[#00685f]"/>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#00685f] text-white rounded-tr-none'
                    : 'bg-[#f0eee8] text-[#1b1c19] rounded-tl-none border border-[#e4e2dd]'
                }`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#e1f5ee] flex items-center justify-center shrink-0">
                  <Globe size={14} className="text-[#00685f]"/>
                </div>
                <div className="bg-[#f0eee8] border border-[#e4e2dd] rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#6d7a77] typing-dot" style={{ animationDelay: `${i * 0.16}s` }}/>)}
                </div>
              </div>
            )}

            {/* Search animation */}
            {showSearchAnim && (
              <div className="flex justify-center py-2">
                <div className="flex items-center gap-2 text-xs text-[#00685f] font-medium bg-[#e1f5ee] px-4 py-2 rounded-full">
                  <div className="w-3 h-3 border-2 border-[#00685f] border-t-transparent rounded-full animate-spin"/>
                  {lang === 'ar' ? 'جارٍ البحث...' : lang === 'fr' ? 'Recherche...' : lang === 'es' ? 'Buscando...' : 'Searching...'}
                </div>
              </div>
            )}

            {/* Flight results */}
            {flightResults.length > 0 && (
              <div className="space-y-2 mt-2">
                {flightResults.map((f, i) => <FlightCard key={i} flight={f} lang={lang}/>)}
              </div>
            )}

            {/* Dynamic links */}
            {hasResults && dynamicLinks.length > 0 && flightResults.length === 0 && (
              <div className="grid grid-cols-1 gap-2">
                {dynamicLinks.map((link, i) => (
                  <button key={i} onClick={() => { trackClick(link.url); window.open(link.url, '_blank'); }}
                    className="flex items-center gap-3 p-4 bg-white border border-[#e4e2dd] rounded-xl hover:border-[#00685f] hover:bg-[#e1f5ee] transition-all text-left group shadow-sm">
                    <span className="text-xl">{link.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-[#1b1c19]">{link.name}</div>
                      <div className="text-xs text-[#6d7a77] truncate">{link.desc}</div>
                    </div>
                    <ExternalLink size={14} className="text-[#bcc9c6] group-hover:text-[#00685f] shrink-0"/>
                  </button>
                ))}
              </div>
            )}

            <div ref={chatEndRef}/>
          </div>
        </div>

        {/* Input area */}
        <div className="shrink-0 px-4 md:px-8 py-4 bg-gradient-to-t from-[#fbf9f3] via-[#fbf9f3] to-transparent border-t border-[#e4e2dd]">
          <div className="max-w-2xl mx-auto">
            {/* Quick service buttons */}
            {activeSvc && (
              <div className="hidden lg:flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                {SERVICES_NAV.map(svc => (
                  <button key={svc.id} onClick={() => handleServiceSelect(svc.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      activeSvc === svc.id ? 'bg-[#00685f] text-white' : 'bg-[#f0eee8] text-[#3d4947] hover:bg-[#e4e2dd]'
                    }`}>
                    <svc.icon size={12}/>{svc.label[lang as keyof typeof svc.label] || svc.label.en}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="relative">
              {showDropdown && suggestions.length > 0 && (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-[#e4e2dd] rounded-2xl shadow-xl overflow-hidden z-50">
                    {suggestions.map((place, i) => (
                      <button key={i} onMouseDown={(e) => { e.preventDefault(); setInputText(place.city_name || place.name); setSuggestions([]); setShowDropdown(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#e1f5ee] transition-colors text-left border-b border-[#e4e2dd] last:border-0">
                        <div className="w-7 h-7 rounded-lg bg-[#e1f5ee] flex items-center justify-center shrink-0">
                          {place.type === 'airport' ? <Plane size={12} className="text-[#00685f]"/> : <MapPin size={12} className="text-[#00685f]"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-[#1b1c19] truncate">{place.city_name || place.name}</div>
                          <div className="text-xs text-[#6d7a77]">{place.country_name}</div>
                        </div>
                        <span className="text-xs font-black text-[#00685f] bg-[#e1f5ee] px-2 py-0.5 rounded-lg shrink-0">{place.code}</span>
                      </button>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              <div className="flex items-center gap-2 bg-white border border-[#bcc9c6] rounded-full p-2 shadow-lg">
                <input ref={inputRef} type="text" value={inputText}
                  onChange={e => handleInputChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(!activeSvc); if (e.key === 'Escape') setShowDropdown(false); }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  placeholder={isListening ? (lang === 'ar' ? 'يستمع...' : 'Listening...') : (t.placeholder || 'Ask anything about your trip...')}
                  className="flex-1 bg-transparent border-none text-[#1b1c19] px-4 py-2 focus:outline-none focus:ring-0 placeholder:text-[#6d7a77] text-sm"
                  dir={isRtl ? 'rtl' : 'ltr'}
                />
                <button onClick={handleMic}
                  className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-[#00685f] text-white animate-pulse' : 'text-[#6d7a77] hover:text-[#00685f] hover:bg-[#e1f5ee]'}`}>
                  <Mic size={18}/>
                </button>
                <button onClick={() => handleSend(!activeSvc)}
                  className="p-2.5 rounded-full bg-[#00685f] text-white hover:bg-[#005049] transition-colors shadow-sm">
                  <Sparkles size={18}/>
                </button>
              </div>
            </div>

            <p className="text-center text-[10px] text-[#6d7a77] mt-3 tracking-widest uppercase">
              Tailored by AI &nbsp;•&nbsp; Global Concierge Network &nbsp;•&nbsp; Verified Deals
            </p>
          </div>
        </div>
      </main>

      {/* ── RIGHT PANEL */}
      <aside className="hidden xl:flex w-80 h-full border-l border-[#e4e2dd] bg-[#f5f3ee] p-6 flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-2xl font-black text-[#00685f] mb-2 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Your Digital Curator
          </h2>
          <p className="text-sm text-[#3d4947] leading-relaxed">
            {lang === 'ar' ? 'أنا جسرك الشخصي لأفضل وجهات السفر حول العالم. كل توصية مصممة خصيصاً لتفضيلاتك.' :
             lang === 'fr' ? 'Je suis votre passerelle personnelle vers les meilleures destinations. Chaque recommandation est filtrée selon vos préférences.' :
             lang === 'es' ? 'Soy tu puente personal hacia los mejores destinos. Cada recomendación está filtrada según tus preferencias.' :
             'I am your personal bridge to the world\'s best destinations. Every recommendation is filtered through your preferences.'}
          </p>
        </div>

        <div className="p-5 bg-white border border-[#e4e2dd] rounded-2xl shadow-sm">
          <p className="text-xs font-bold text-[#00685f] uppercase tracking-widest mb-3">
            {lang === 'ar' ? 'مميزات المستخدم' : 'Member Perks'}
          </p>
          <ul className="space-y-2.5 text-sm text-[#3d4947]">
            {[
              lang === 'ar' ? '✓ أسعار مضمونة وحصرية' : '✓ Guaranteed exclusive prices',
              lang === 'ar' ? '✓ مساعد AI متاح 24/7' : '✓ AI Assistant 24/7',
              lang === 'ar' ? '✓ مقارنة فورية لمئات المواقع' : '✓ Instant comparison of 200+ sites',
              lang === 'ar' ? '✓ روابط حجز مباشرة وآمنة' : '✓ Direct & secure booking links',
            ].map((perk, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] shrink-0"/>
                {perk}
              </li>
            ))}
          </ul>
        </div>

        {/* Featured destination */}
        <div className="relative rounded-2xl overflow-hidden shadow-md group cursor-pointer"
          onClick={() => window.open('https://aviasales.tpx.gr/yQxrYmk7', '_blank')}>
          <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop"
            alt="Dubai" className="w-full h-44 object-cover group-hover:scale-110 transition-transform duration-700"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
            <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mb-1">Spotlight</p>
            <h3 className="text-white text-base font-black" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {lang === 'ar' ? 'اكتشف دبي 2026' : 'Discover Dubai 2026'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#e1f5ee] rounded-xl border border-[#89f5e7]/30 mt-auto">
          <Sparkles size={16} className="text-[#00685f] shrink-0"/>
          <div>
            <p className="text-[10px] font-bold text-[#00685f] uppercase tracking-wide">AI Verified</p>
            <p className="text-[10px] text-[#3f6560]">Personalized Travel Intelligence</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
