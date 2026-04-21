import { useState, useCallback, useRef } from 'react';
import { trackSearch } from '@/lib/tracking';
import { toAffiliateLink } from '@/lib/convertLinks';

export type Message = { role: 'user' | 'assistant'; content: string; };
export type AffiliateLink = { name: string; desc: string; url: string; icon: string; };
export type FlightResult = {
  id: string; airline: string; airline_logo: string;
  origin: string; destination: string; departure_time: string;
  duration: string; stops: string; price: number; currency: string;
  booking_url: string; gate: string; is_direct?: boolean;
};

const CITY_TO_IATA: Record<string, string> = {
  'دبي': 'DXB', 'باريس': 'CDG', 'لندن': 'LHR', 'القاهرة': 'CAI', 'الرياض': 'RUH',
  'جدة': 'JED', 'الدوحة': 'DOH', 'اسطنبول': 'IST', 'نيويورك': 'JFK', 'طوكيو': 'NRT',
  'الرباط': 'RBA', 'الدار البيضاء': 'CMN', 'مراكش': 'RAK', 'تونس': 'TUN',
  'الجزائر': 'ALG', 'بيروت': 'BEY', 'عمان': 'AMM', 'ابوظبي': 'AUH', 'مسقط': 'MCT',
  'الكويت': 'KWI', 'البحرين': 'BAH', 'بغداد': 'BGW', 'طنجة': 'TNG',
  'مدريد': 'MAD', 'برشلونة': 'BCN', 'روما': 'FCO', 'اشبيلية': 'SVQ',
  'امستردام': 'AMS', 'فرانكفورت': 'FRA', 'ميلان': 'MXP', 'برلين': 'BER',
  'المغرب': 'CMN', 'فرنسا': 'CDG', 'اسبانيا': 'MAD', 'ايطاليا': 'FCO',
  'dubai': 'DXB', 'paris': 'CDG', 'london': 'LHR', 'cairo': 'CAI', 'riyadh': 'RUH',
  'jeddah': 'JED', 'doha': 'DOH', 'istanbul': 'IST', 'new york': 'JFK', 'tokyo': 'NRT',
  'rabat': 'RBA', 'casablanca': 'CMN', 'marrakech': 'RAK', 'tunis': 'TUN',
  'algiers': 'ALG', 'beirut': 'BEY', 'amman': 'AMM', 'abu dhabi': 'AUH', 'muscat': 'MCT',
  'tangier': 'TNG', 'tanger': 'TNG', 'madrid': 'MAD', 'barcelona': 'BCN',
  'rome': 'FCO', 'seville': 'SVQ', 'sevilla': 'SVQ', 'amsterdam': 'AMS',
  'frankfurt': 'FRA', 'milan': 'MXP', 'berlin': 'BER', 'singapore': 'SIN',
  'bangkok': 'BKK', 'sydney': 'SYD', 'toronto': 'YYZ', 'los angeles': 'LAX',
  'chicago': 'ORD', 'miami': 'MIA', 'moscow': 'SVO', 'londre': 'LHR', 'londres': 'LHR',
};

const SERVICE_LINKS: Record<string, AffiliateLink[]> = {
  hotel: [{ name: 'Intui Travel', desc: 'Best hotel deals worldwide', url: 'https://intui.tpx.gr/kguAoKIU', icon: '🏨' }],
  taxi: [
    { name: 'GetTransfer', desc: 'Airport & city transfers', url: 'https://gettransfer.tpx.gr/9poAnD5l', icon: '🚕' },
    { name: 'Kiwi Taxi', desc: 'Reliable taxi service', url: 'https://kiwitaxi.tpx.gr/Y6yrFeYN', icon: '🚖' },
    { name: 'LocalRent', desc: 'Car rental', url: 'https://localrent.tpx.gr/qr92Puo9', icon: '🚗' },
    { name: 'EconomyBookings', desc: 'Cheap car rental', url: 'https://economybookings.tpx.gr/ONZ6dOjM', icon: '🚙' },
    { name: 'QEEQ', desc: 'Premium car rental', url: 'https://qeeq.tpx.gr/pTbTtERj', icon: '🏎️' },
  ],
  experience: [
    { name: 'Klook', desc: 'Tours & experiences', url: 'https://klook.tpx.gr/vRUzaJbI', icon: '🎡' },
    { name: 'Tiqets', desc: 'Museums & attractions', url: 'https://tiqets.tpx.gr/ot4HK9Pf', icon: '🎭' },
    { name: 'WeGoTrip', desc: 'Audio tours', url: 'https://wegotrip.tpx.gr/DyN0pkVH', icon: '🗺️' },
  ],
  bus: [{ name: 'FlixBus', desc: 'Bus tickets across Europe', url: 'https://tpx.gr/n6krgEY3', icon: '🚌' }],
  cruise: [
    { name: 'Sea Radar', desc: 'Ferry & cruise deals', url: 'https://searadar.tpx.gr/WC89iS5m', icon: '🚢' },
    { name: 'DirectFerries', desc: 'Spain/France → Morocco/Tunisia', url: 'https://www.directferries.com', icon: '⛴️' },
  ],
  ferry: [
    { name: 'Sea Radar', desc: 'Ferry routes Europe-Africa', url: 'https://searadar.tpx.gr/WC89iS5m', icon: '🚢' },
    { name: 'DirectFerries', desc: 'Algeciras-Tanger, Marseille-Tunis...', url: 'https://www.directferries.com', icon: '⛴️' },
  ],
  esim: [{ name: 'Yesim', desc: 'eSIM for travelers', url: 'https://yesim.tpx.gr/9gzdax7m', icon: '📱' }],
  compensation: [
    { name: 'Compensair', desc: 'Flight compensation', url: 'https://compensair.tpx.gr/MGUDRrY2', icon: '💰' },
    { name: 'AirHelp', desc: 'Get your refund', url: 'https://airhelp.tpx.gr/baeI5YIf', icon: '🛡️' },
  ],
  flight: [{ name: 'Aviasales', desc: 'Search all airlines', url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: '✈️' }],
};

function getIATA(text: string): string | undefined {
  if (!text) return undefined;
  if (/^[A-Z]{3}$/.test(text.trim())) return text.trim();
  const lower = text.toLowerCase().trim();
  for (const [city, iata] of Object.entries(CITY_TO_IATA)) {
    if (lower.includes(city.toLowerCase())) return iata;
  }
  return undefined;
}

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

function getSystemPrompt(lang: string, service: string): string {
  const today = new Date().toISOString().split('T')[0];
  const langRule =
    lang === 'ar' ? 'CRITICAL: Respond ONLY in Arabic. 1-2 sentences max.' :
    lang === 'fr' ? 'CRITICAL: Respond ONLY in French. 1-2 sentences max.' :
    lang === 'es' ? 'CRITICAL: Respond ONLY in Spanish. 1-2 sentences max.' :
    'CRITICAL: Respond ONLY in English. 1-2 sentences max.';

  return `You are Fastamor, a smart travel concierge. Today: ${today}.
${langRule}
Current service: ${service}

RULES:
- NEVER output raw JSON to the user
- Keep response to 1-2 sentences MAX
- Always use XML tags for actions

FOR FLIGHTS (extract origin + destination + date):
<search>{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"}</search>

FOR FLIGHTS flexible (no specific date or user says "cheapest/this week/this month"):
<search>{"type":"flight","origin":"IATA","destination":"IATA","date_from":"YYYY-MM-DD","date_to":"YYYY-MM-DD","flexible":true}</search>

FOR FERRY/BOAT:
<search>{"type":"ferry","from":"city","to":"city","date":"YYYY-MM-DD"}</search>

FOR HOTELS:
<links>[{"name":"Intui Travel","desc":"Best hotels","url":"https://intui.tpx.gr/kguAoKIU","icon":"🏨"}]</links>

FOR TRANSFERS/CAR:
<links>[{"name":"GetTransfer","desc":"Airport transfers","url":"https://gettransfer.tpx.gr/9poAnD5l","icon":"🚕"},{"name":"LocalRent","desc":"Car rental","url":"https://localrent.tpx.gr/qr92Puo9","icon":"🚗"}]</links>

FOR TOURS:
<links>[{"name":"Klook","desc":"Tours","url":"https://klook.tpx.gr/vRUzaJbI","icon":"🎡"},{"name":"Tiqets","desc":"Museums","url":"https://tiqets.tpx.gr/ot4HK9Pf","icon":"🎭"}]</links>

FOR BUS:
<links>[{"name":"FlixBus","desc":"Bus tickets","url":"https://tpx.gr/n6krgEY3","icon":"🚌"}]</links>

DATE RULES:
- "this week" → date_from=today, date_to=today+7, flexible=true
- "this month" / "cheapest" → date_from=today, date_to=today+30, flexible=true
- No date mentioned → use specific date = today+7

${langRule}`;
}

export function useFastamorChat(service: string, lang: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchAnim, setShowSearchAnim] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [dynamicLinks, setDynamicLinks] = useState<AffiliateLink[]>([]);
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  const messagesRef = useRef<Message[]>([]);

  const searchFlights = async (origin: string, destination: string, date: string) => {
    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date }),
      });
      const data = await res.json();
      return { flights: data.flights || [], hasDirect: data.has_direct || false, fallback: data.fallback_url };
    } catch {
      return { flights: [], hasDirect: false, fallback: 'https://aviasales.tpx.gr/yQxrYmk7' };
    }
  };

  const searchFlexible = async (origin: string, destination: string, dateFrom: string, dateTo: string) => {
    // Search the whole month at once using the cache endpoint
    try {
      const res = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date: dateFrom }),
      });
      const data = await res.json();
      return { flights: data.flights || [], hasDirect: data.has_direct || false, fallback: data.fallback_url };
    } catch {
      return { flights: [], hasDirect: false, fallback: 'https://aviasales.tpx.gr/yQxrYmk7' };
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const newMsg: Message = { role: 'user', content };
    const updated = [...messagesRef.current, newMsg];
    messagesRef.current = updated;
    setMessages([...updated]);
    setIsTyping(true);
    setShowSearchAnim(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: getSystemPrompt(lang, service),
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const fullText: string = data.content?.[0]?.text || '';

      // Extract XML tags
      const searchMatch = fullText.match(/<search>([\s\S]*?)<\/search>/);
      const linksMatch = fullText.match(/<links>([\s\S]*?)<\/links>/);
      const cleanText = fullText
        .replace(/<search>[\s\S]*?<\/search>/g, '')
        .replace(/<links>[\s\S]*?<\/links>/g, '')
        .trim();

      // Show text reply first
      const withReply = [...updated, { role: 'assistant' as const, content: cleanText || '...' }];
      messagesRef.current = withReply;
      setMessages([...withReply]);
      setIsTyping(false);
      setShowSearchAnim(false);

      // Handle flight search
      if (searchMatch) {
        try {
          const sd = JSON.parse(searchMatch[1].trim());

          // Handle ferry
          if (sd.type === 'ferry') {
            const links = SERVICE_LINKS.ferry.map(l => ({ ...l }));
            for (const link of links) link.url = await toAffiliateLink(link.url);
            setDynamicLinks(links);
            setHasResults(true);
            trackSearch();
            const msg = lang === 'ar'
              ? `🚢 إليك أفضل خيارات العبارة من ${sd.from} إلى ${sd.to} 👇`
              : `🚢 Here are ferry options from ${sd.from} to ${sd.to} 👇`;
            messagesRef.current = [...withReply, { role: 'assistant', content: msg }];
            setMessages([...messagesRef.current]);
            return;
          }

          // Handle flight
          if (sd.type === 'flight') {
            if (sd.origin) { const i = getIATA(sd.origin); if (i) sd.origin = i; }
            if (sd.destination) { const i = getIATA(sd.destination); if (i) sd.destination = i; }

            if (!sd.origin || !sd.destination) return;

            setShowSearchAnim(true);
            let result;
            if (sd.flexible && sd.date_from) {
              result = await searchFlexible(sd.origin, sd.destination, sd.date_from, sd.date_to || getDefaultDate());
            } else {
              result = await searchFlights(sd.origin, sd.destination, sd.date || getDefaultDate());
            }
            setShowSearchAnim(false);

            if (result.flights.length > 0) {
              setFlightResults(result.flights);
              setHasResults(true);
              trackSearch();
              const directCount = result.flights.filter((f: FlightResult) => f.is_direct).length;
              const cheapest = result.flights[0].price;
              const msg =
                lang === 'ar' ? (directCount > 0 ? `✅ وجدت ${directCount} رحلة مباشرة! أرخصها $${cheapest} 👇` : `⚠️ لا رحلات مباشرة. أفضل الخيارات من $${cheapest} 👇`) :
                lang === 'fr' ? (directCount > 0 ? `✅ ${directCount} vol(s) direct(s)! Dès $${cheapest} 👇` : `⚠️ Pas de vols directs. Dès $${cheapest} 👇`) :
                lang === 'es' ? (directCount > 0 ? `✅ ¡${directCount} vuelo(s) directo(s)! Desde $${cheapest} 👇` : `⚠️ Sin vuelos directos. Desde $${cheapest} 👇`) :
                (directCount > 0 ? `✅ Found ${directCount} direct flight(s)! From $${cheapest} 👇` : `⚠️ No direct flights. Best from $${cheapest} 👇`);
              messagesRef.current = [...withReply, { role: 'assistant', content: msg }];
              setMessages([...messagesRef.current]);
            } else {
              const url = result.fallback || `https://www.aviasales.com/search/${sd.origin}${sd.destination}1?marker=709105`;
              setDynamicLinks([{ name: 'Aviasales', desc: `${sd.origin} → ${sd.destination}`, url, icon: '✈️' }]);
              setHasResults(true);
              const msg = lang === 'ar' ? `لم أجد رحلات. ابحث مباشرة 👇` : lang === 'fr' ? `Aucun vol. Cherchez directement 👇` : lang === 'es' ? `Sin vuelos. Busca directamente 👇` : `No cached flights. Search live 👇`;
              messagesRef.current = [...withReply, { role: 'assistant', content: msg }];
              setMessages([...messagesRef.current]);
            }
          }
        } catch (e) { console.error('Search parse error:', e); }
      }

      // Handle links
      if (linksMatch) {
        try {
          const links = JSON.parse(linksMatch[1].trim());
          for (const link of links) {
            if (link.url) link.url = await toAffiliateLink(link.url);
          }
          setDynamicLinks(links);
          setHasResults(true);
          trackSearch();
        } catch { }
      }

      // Fallback service links
      if (!searchMatch && !linksMatch && service && service !== 'flight') {
        const links = (SERVICE_LINKS[service] || []).map(l => ({ ...l }));
        if (links.length) {
          for (const link of links) link.url = await toAffiliateLink(link.url);
          setDynamicLinks(links);
          setHasResults(true);
        }
      }

    } catch (err) {
      setIsTyping(false);
      setShowSearchAnim(false);
      const msg = lang === 'ar' ? 'عذراً، مشكلة في الاتصال. 🔄' : lang === 'fr' ? 'Problème de connexion. 🔄' : lang === 'es' ? 'Error de conexión. 🔄' : 'Connection issue. Try again. 🔄';
      messagesRef.current = [...messagesRef.current, { role: 'assistant', content: msg }];
      setMessages([...messagesRef.current]);
    }
  }, [isTyping, service, lang]);

  const clearChat = useCallback((greeting?: string) => {
    const initial: Message[] = greeting ? [{ role: 'assistant', content: greeting }] : [];
    messagesRef.current = initial;
    setMessages([...initial]);
    setFlightResults([]);
    setHasResults(false);
    setDynamicLinks([]);
  }, []);

  return { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, flightResults, sendMessage, clearChat };
}

export function detectService(text: string): string {
  const l = text.toLowerCase();
  if (/ferry|باخرة|عبارة|بابور|فيري|بواخر/.test(l)) return 'ferry';
  if (/cruise|كروز|رحلة بحرية/.test(l)) return 'cruise';
  if (/bus|coach|حافلة|بركاصة|autobus/.test(l)) return 'bus';
  if (/hotel|فندق|hôtel|alojamiento/.test(l)) return 'hotel';
  if (/taxi|transfer|تاكسي|نقل|transfert|traslado|car|rent|سيارة|كراء/.test(l)) return 'taxi';
  if (/tour|experience|جولة|تجربة|visite|excursion/.test(l)) return 'experience';
  if (/esim|sim|internet|بيانات/.test(l)) return 'esim';
  if (/delay|cancel|تعويض|تأخير|remboursement/.test(l)) return 'compensation';
  return 'flight';
}
