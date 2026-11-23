import { useEffect, useRef, useState } from 'react';
import { Plane, Building2, Ship, Car, Smartphone, Ticket, Send, Maximize2, RotateCcw, Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { useVoice } from '@/hooks/use-voice';
import { useFastamorChat, detectService } from '@/hooks/use-fastamor-chat';
import { trackClick } from '@/lib/tracking';

type L = 'en' | 'ar' | 'fr' | 'es';

const COPY: Record<L, {
  h1: string; sub: string; placeholder: string; send: string; full: string; reset: string;
  passenger: string; from: string; stubTitle: string; stubEmpty: string; typing: string; book: string; open: string;
  chips: string[]; tabs: Record<string, string>; direct: string; stops: (n: string) => string;
  mic: string; micStop: string; listening: string; voiceOn: string; voiceOff: string; micDenied: string; noSpeech: string;
}> = {
  en: {
    h1: 'Tell me where you’re going.',
    sub: 'Ask in your own words. Fastamor finds the flight, the ferry, the hotel and the ride from the airport.',
    placeholder: 'e.g. Paris to Casablanca in January', send: 'Search', full: 'Open full screen', reset: 'New trip',
    passenger: 'Passenger', from: 'Your trip', stubTitle: 'Results', stubEmpty: 'Fares and booking links appear here as soon as I find them.',
    typing: 'Looking for the best options…', book: 'Book', open: 'Open',
    chips: ['Flight from Paris to Casablanca in January', 'Ferry from Algeciras to Tanger Med in July', 'Hotel in Marrakech for 3 nights', 'eSIM for a week in Morocco'],
    tabs: { flight: 'Flights', hotel: 'Hotels', ferry: 'Ferries', taxi: 'Transfers', experience: 'Tours', esim: 'eSIM' },
    direct: 'Direct', stops: n => `${n} stop(s)`,
    mic: 'Speak your question', micStop: 'Stop listening', listening: 'Listening… speak now', voiceOn: 'Read replies aloud', voiceOff: 'Stop reading replies aloud',
    micDenied: 'Microphone access is blocked. Allow it in your browser settings, then try again.', noSpeech: 'I didn’t hear anything. Tap the microphone and speak.',
  },
  ar: {
    h1: 'قل لي إلى أين تسافر.',
    sub: 'اكتب بكلماتك. فاستامور يجد لك الطيران والباخرة والفندق والنقل من المطار.',
    placeholder: 'مثال: باريس إلى الدار البيضاء في يناير', send: 'ابحث', full: 'ملء الشاشة', reset: 'رحلة جديدة',
    passenger: 'المسافر', from: 'رحلتك', stubTitle: 'النتائج', stubEmpty: 'ستظهر هنا الأسعار وروابط الحجز فور العثور عليها.',
    typing: 'أبحث عن أفضل الخيارات…', book: 'احجز', open: 'افتح',
    chips: ['رحلة من باريس إلى الدار البيضاء في يناير', 'باخرة من الجزيرة الخضراء إلى طنجة المتوسط في يوليو', 'فندق في مراكش لثلاث ليالٍ', 'شريحة eSIM لأسبوع في المغرب'],
    tabs: { flight: 'طيران', hotel: 'فنادق', ferry: 'بواخر', taxi: 'نقل', experience: 'جولات', esim: 'eSIM' },
    direct: 'مباشرة', stops: n => `توقف: ${n}`,
    mic: 'اسأل بصوتك', micStop: 'إيقاف الاستماع', listening: 'أستمع إليك… تكلم الآن', voiceOn: 'قراءة الردود بصوت مسموع', voiceOff: 'إيقاف قراءة الردود',
    micDenied: 'الوصول إلى الميكروفون محظور. اسمح به من إعدادات المتصفح ثم أعد المحاولة.', noSpeech: 'لم أسمع شيئاً. اضغط على الميكروفون وتكلم.',
  },
  fr: {
    h1: 'Dites-moi où vous partez.',
    sub: 'Écrivez avec vos mots. Fastamor trouve le vol, le ferry, l’hôtel et le transfert depuis l’aéroport.',
    placeholder: 'ex. Paris – Casablanca en janvier', send: 'Rechercher', full: 'Plein écran', reset: 'Nouveau voyage',
    passenger: 'Passager', from: 'Votre voyage', stubTitle: 'Résultats', stubEmpty: 'Les prix et liens de réservation apparaissent ici dès que je les trouve.',
    typing: 'Je cherche les meilleures options…', book: 'Réserver', open: 'Ouvrir',
    chips: ['Vol de Paris à Casablanca en janvier', 'Ferry d’Algésiras à Tanger Med en juillet', 'Hôtel à Marrakech, 3 nuits', 'eSIM pour une semaine au Maroc'],
    tabs: { flight: 'Vols', hotel: 'Hôtels', ferry: 'Ferries', taxi: 'Transferts', experience: 'Activités', esim: 'eSIM' },
    direct: 'Direct', stops: n => `${n} escale(s)`,
    mic: 'Posez votre question à voix haute', micStop: 'Arrêter l’écoute', listening: 'Je vous écoute… parlez maintenant', voiceOn: 'Lire les réponses à voix haute', voiceOff: 'Arrêter la lecture des réponses',
    micDenied: 'L’accès au micro est bloqué. Autorisez-le dans les réglages du navigateur, puis réessayez.', noSpeech: 'Je n’ai rien entendu. Touchez le micro et parlez.',
  },
  es: {
    h1: 'Dime adónde vas.',
    sub: 'Escribe con tus palabras. Fastamor encuentra el vuelo, el ferri, el hotel y el traslado desde el aeropuerto.',
    placeholder: 'p. ej. Madrid a Casablanca en enero', send: 'Buscar', full: 'Pantalla completa', reset: 'Nuevo viaje',
    passenger: 'Pasajero', from: 'Tu viaje', stubTitle: 'Resultados', stubEmpty: 'Los precios y enlaces de reserva aparecen aquí en cuanto los encuentro.',
    typing: 'Buscando las mejores opciones…', book: 'Reservar', open: 'Abrir',
    chips: ['Vuelo de Madrid a Casablanca en enero', 'Ferri de Algeciras a Tánger Med en julio', 'Hotel en Marrakech, 3 noches', 'eSIM para una semana en Marruecos'],
    tabs: { flight: 'Vuelos', hotel: 'Hoteles', ferry: 'Ferris', taxi: 'Traslados', experience: 'Actividades', esim: 'eSIM' },
    direct: 'Directo', stops: n => `${n} escala(s)`,
    mic: 'Haz tu pregunta en voz alta', micStop: 'Dejar de escuchar', listening: 'Te escucho… habla ahora', voiceOn: 'Leer las respuestas en voz alta', voiceOff: 'Dejar de leer las respuestas',
    micDenied: 'El acceso al micrófono está bloqueado. Permítelo en los ajustes del navegador y vuelve a intentarlo.', noSpeech: 'No he oído nada. Toca el micrófono y habla.',
  },
};

const AIRLINES: Record<string, string> = { AT: 'Royal Air Maroc', '3O': 'Air Arabia', TO: 'Transavia', HV: 'Transavia', FR: 'Ryanair', U2: 'easyJet', EC: 'easyJet',
  VY: 'Vueling', IB: 'Iberia', UX: 'Air Europa', V7: 'Volotea', AF: 'Air France', KL: 'KLM', SN: 'Brussels Airlines', TB: 'TUI fly', EW: 'Eurowings',
  LH: 'Lufthansa', W6: 'Wizz Air', TK: 'Turkish Airlines', PC: 'Pegasus', EK: 'Emirates', QR: 'Qatar Airways', MS: 'EgyptAir', SV: 'Saudia', FZ: 'flydubai' };
const airlineName = (c: string) => AIRLINES[c] || c;

const TABS = [
  { id: 'flight', Icon: Plane },
  { id: 'ferry', Icon: Ship },
  { id: 'hotel', Icon: Building2 },
  { id: 'taxi', Icon: Car },
  { id: 'experience', Icon: Ticket },
  { id: 'esim', Icon: Smartphone },
] as const;

// Eight-point zellige star, tiled at low opacity behind the hero.
const ZELLIGE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.07' stroke-width='1.2'%3E%3Cpath d='M32 6l7.6 18.4L58 32l-18.4 7.6L32 58l-7.6-18.4L6 32l18.4-7.6z'/%3E%3Crect x='17' y='17' width='30' height='30' transform='rotate(45 32 32)'/%3E%3C/g%3E%3C/svg%3E\")";

export function HeroAssistant({ lang, onOpenApp }: { lang: string; onOpenApp: (svc?: string) => void }) {
  const l = (['en', 'ar', 'fr', 'es'].includes(lang) ? lang : 'en') as L;
  const c = COPY[l];
  const isRtl = l === 'ar';
  const [service, setService] = useState<string>('flight');
  const [input, setInput] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const { messages, isTyping, showSearchAnim, dynamicLinks, flightResults, sendMessage, clearChat } = useFastamorChat(service, l);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [voiceReplies, setVoiceReplies] = useState(false);
  const voice = useVoice(l, text => { setVoiceReplies(true); submit(text); });
  const spokenUpTo = useRef(0);

  // Read new assistant replies aloud when voice replies are on.
  useEffect(() => {
    if (!voiceReplies || !voice.canSpeak) { spokenUpTo.current = messages.length; return; }
    const fresh = messages.slice(spokenUpTo.current).filter(m => m.role === 'assistant');
    spokenUpTo.current = messages.length;
    if (fresh.length) voice.speak(fresh.map(m => m.content).join('. '));
  }, [messages, voiceReplies]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Send after the service state has updated, so the request uses the right service.
  useEffect(() => {
    if (pending) {
      sendMessage(pending);
      setPending(null);
    }
  }, [pending, service, sendMessage]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || isTyping) return;
    if (messages.length === 0) {
      const detected = detectService(t);
      if (detected !== service && service === 'flight') setService(detected);
    }
    setInput('');
    setPending(t);
  };

  const started = messages.length > 0;
  const hasStub = flightResults.length > 0 || dynamicLinks.length > 0;

  return (
    <section
      className="fa-hero relative overflow-hidden text-white"
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{ backgroundColor: '#14204A', backgroundImage: ZELLIGE, fontFamily: 'Cairo, Inter, system-ui, sans-serif' }}
    >
      <style>{`
        .fa-hero ::selection{background:#F2A93B;color:#14204A}
        .fa-pass{--notch:18px}
        .fa-perf{background-image:linear-gradient(to bottom,#C9CEDF 50%,transparent 0);background-size:2px 12px;background-repeat:repeat-y;background-position:center}
        @media (max-width:1023px){.fa-perf{background-image:linear-gradient(to right,#C9CEDF 50%,transparent 0);background-size:12px 2px;background-repeat:repeat-x}}
        .fa-print{animation:fa-print .5s cubic-bezier(.2,.8,.2,1) both}
        @keyframes fa-print{from{clip-path:inset(0 0 100% 0);transform:translateY(-6px)}to{clip-path:inset(0 0 0 0);transform:none}}
        .fa-dot{animation:fa-blink 1.2s infinite both}.fa-dot:nth-child(2){animation-delay:.2s}.fa-dot:nth-child(3){animation-delay:.4s}
        @keyframes fa-blink{0%,80%,100%{opacity:.25}40%{opacity:1}}
        @media (max-width:639px){.fa-tabs{-webkit-mask-image:linear-gradient(to right,#000 calc(100% - 28px),transparent);mask-image:linear-gradient(to right,#000 calc(100% - 28px),transparent);scrollbar-width:none}[dir=rtl] .fa-tabs{-webkit-mask-image:linear-gradient(to left,#000 calc(100% - 28px),transparent);mask-image:linear-gradient(to left,#000 calc(100% - 28px),transparent)}}
        .fa-listening{box-shadow:0 0 0 0 rgba(53,80,200,.55);animation:fa-pulse 1.4s infinite}
        @keyframes fa-pulse{0%{box-shadow:0 0 0 0 rgba(53,80,200,.55)}70%{box-shadow:0 0 0 14px rgba(53,80,200,0)}100%{box-shadow:0 0 0 0 rgba(53,80,200,0)}}
        @media (prefers-reduced-motion:reduce){.fa-print,.fa-dot,.fa-listening{animation:none}}
        .fa-hero textarea:focus-visible,.fa-hero button:focus-visible,.fa-hero a:focus-visible{outline:3px solid #F2A93B;outline-offset:2px}
      `}</style>

      <div className="max-w-6xl mx-auto px-5 pt-14 pb-16 md:pt-20 md:pb-24">
        <h1 className="font-extrabold leading-[1.05] tracking-tight max-w-3xl" style={{ fontSize: 'clamp(2.4rem, 6vw, 4.6rem)' }}>
          {c.h1}
        </h1>
        <p className="mt-4 max-w-xl text-white/75 text-lg leading-relaxed">{c.sub}</p>

        {/* Boarding pass */}
        <div className="fa-pass mt-10 grid lg:grid-cols-[1fr_2px_340px] bg-white text-[#14204A] rounded-[22px] shadow-[0_30px_80px_-20px_rgba(0,0,0,.55)] overflow-hidden">
          {/* Main part: conversation */}
          <div className="flex flex-col min-h-[360px] min-w-0">
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-[#E7E9F2]">
              <div className="fa-tabs flex gap-1 overflow-x-auto min-w-0 flex-1" role="tablist" aria-label={c.from}>
                {TABS.map(({ id, Icon }) => (
                  <button key={id} role="tab" aria-selected={service === id}
                    onClick={() => setService(id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${service === id ? 'bg-[#3550C8] text-white' : 'text-[#14204A]/70 hover:bg-[#EEF0F8]'}`}>
                    <Icon size={15} aria-hidden /> {c.tabs[id]}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {voice.canSpeak && (
                  <button onClick={() => { if (voiceReplies) voice.stopSpeaking(); setVoiceReplies(v => !v); }}
                    className={`p-2 rounded-full hover:bg-[#EEF0F8] ${voiceReplies ? 'text-[#3550C8]' : 'text-[#14204A]/60'}`}
                    aria-pressed={voiceReplies} aria-label={voiceReplies ? c.voiceOff : c.voiceOn} title={voiceReplies ? c.voiceOff : c.voiceOn}>
                    {voiceReplies ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                )}
                {started && (
                  <button onClick={() => clearChat()} className="p-2 rounded-full text-[#14204A]/60 hover:bg-[#EEF0F8]" aria-label={c.reset} title={c.reset}>
                    <RotateCcw size={16} />
                  </button>
                )}
                <button onClick={() => onOpenApp(service)} className="hidden sm:inline-flex p-2 rounded-full text-[#14204A]/60 hover:bg-[#EEF0F8]" aria-label={c.full} title={c.full}>
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 max-h-[340px]" aria-live="polite">
              {!started && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {c.chips.map(chip => (
                    <button key={chip} onClick={() => submit(chip)}
                      className="max-w-full text-start text-[15px] font-semibold px-4 py-2.5 rounded-2xl border-2 border-[#E1E4F0] hover:border-[#3550C8] hover:text-[#3550C8] transition-colors">
                      {chip}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap leading-relaxed text-[15px] px-4 py-2.5 rounded-2xl ${m.role === 'user' ? 'bg-[#3550C8] text-white' : 'bg-[#F1F2F8] text-[#14204A]'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {(isTyping || showSearchAnim) && (
                <div className="flex items-center gap-2 text-sm text-[#14204A]/60">
                  <span className="flex gap-1" aria-hidden>
                    <span className="fa-dot w-1.5 h-1.5 rounded-full bg-[#3550C8]" />
                    <span className="fa-dot w-1.5 h-1.5 rounded-full bg-[#3550C8]" />
                    <span className="fa-dot w-1.5 h-1.5 rounded-full bg-[#3550C8]" />
                  </span>
                  {c.typing}
                </div>
              )}
            </div>

            <form onSubmit={e => { e.preventDefault(); submit(input); }} className="flex items-end gap-2 px-4 pb-4 pt-2">
              <label className="sr-only" htmlFor="fa-q">{c.placeholder}</label>
              <textarea id="fa-q" ref={inputRef} rows={1} value={voice.listening ? voice.interim : input} readOnly={voice.listening}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input); } }}
                placeholder={voice.listening ? c.listening : c.placeholder}
                className="flex-1 min-w-0 resize-none rounded-2xl placeholder-shown:whitespace-nowrap placeholder-shown:overflow-hidden placeholder-shown:text-ellipsis bg-[#F1F2F8] px-4 py-3.5 text-[16px] font-semibold placeholder:text-[#14204A]/40 focus:outline-none" />
              {voice.canListen && (
                <button type="button" onClick={() => (voice.listening ? voice.stop() : voice.start())} disabled={isTyping}
                  aria-pressed={voice.listening} aria-label={voice.listening ? c.micStop : c.mic} title={voice.listening ? c.micStop : c.mic}
                  className={`fa-mic shrink-0 grid place-items-center w-[52px] h-[52px] rounded-2xl transition-colors disabled:opacity-50 ${voice.listening ? 'bg-[#3550C8] text-white fa-listening' : 'bg-[#EEF0F8] text-[#3550C8] hover:bg-[#E1E4F5]'}`}>
                  {voice.listening ? <Square size={18} fill="currentColor" aria-hidden /> : <Mic size={21} aria-hidden />}
                </button>
              )}
              <button type="submit" disabled={!input.trim() || isTyping || voice.listening}
                className="shrink-0 flex items-center gap-2 rounded-2xl bg-[#F2A93B] text-[#14204A] font-extrabold px-5 py-3.5 disabled:opacity-50 hover:bg-[#f5b85a] transition-colors">
                <Send size={17} className={isRtl ? 'rotate-180' : ''} aria-hidden /> <span className="hidden sm:inline">{c.send}</span><span className="sr-only sm:hidden">{c.send}</span>
              </button>
            </form>
            {voice.error && (
              <p role="status" className="px-5 pb-3 -mt-1 text-sm font-semibold text-[#B4441B]">
                {voice.error === 'denied' ? c.micDenied : c.noSpeech}
              </p>
            )}
          </div>

          {/* Perforation; ticket notches on wide screens */}
          <div className="fa-perf relative h-[2px] lg:h-auto mx-5 lg:mx-0 lg:my-5" aria-hidden>
            <span className="hidden lg:block absolute left-1/2 -translate-x-1/2 -top-[38px] w-[22px] h-[22px] rounded-full bg-[#14204A]" />
            <span className="hidden lg:block absolute left-1/2 -translate-x-1/2 -bottom-[38px] w-[22px] h-[22px] rounded-full bg-[#14204A]" />
          </div>

          {/* Stub: results */}
          <aside className="bg-[#F7F8FC] px-5 py-5 flex flex-col" aria-label={c.stubTitle}>
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-extrabold">{c.stubTitle}</h2>
              <span className="text-xs font-bold text-[#14204A]/50">FASTAMOR</span>
            </div>

            {!hasStub && <p className="mt-3 text-[15px] text-[#14204A]/60 leading-relaxed">{c.stubEmpty}</p>}

            {flightResults.length > 0 && (
              <ul className="fa-print mt-3 space-y-2">
                {flightResults.slice(0, 4).map((f, i) => (
                  <li key={i} className="bg-white rounded-xl border border-[#E7E9F2] px-3.5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-[15px] truncate">{f.origin} → {f.destination}</div>
                      <div className="text-xs text-[#14204A]/60 truncate">
                        {airlineName(f.airline)} · {f.departure_time} · {f.is_direct || f.stops === '0' ? c.direct : c.stops(f.stops)}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="font-extrabold text-[17px]">{Math.round(f.price)} {f.currency === 'USD' || f.currency === 'usd' ? '$' : f.currency}</div>
                      <a href={f.booking_url} target="_blank" rel="nofollow sponsored noopener" onClick={() => trackClick(f.booking_url)}
                        className="text-sm font-extrabold text-[#3550C8] hover:underline">{c.book}</a>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {flightResults.length === 0 && dynamicLinks.length > 0 && (
              <ul className="fa-print mt-3 space-y-2">
                {dynamicLinks.map((d, i) => (
                  <li key={i}>
                    <a href={d.url} target="_blank" rel="nofollow sponsored noopener" onClick={() => trackClick(d.url)}
                      className="flex items-center gap-3 bg-white rounded-xl border border-[#E7E9F2] px-3.5 py-3 hover:border-[#3550C8] transition-colors">
                      <span className="text-xl" aria-hidden>{d.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block font-extrabold text-[15px] truncate">{d.name}</span>
                        <span className="block text-xs text-[#14204A]/60 truncate">{d.desc}</span>
                      </span>
                      <span className="text-sm font-extrabold text-[#3550C8]">{c.open}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
