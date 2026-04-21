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

// ✅ إضافة جديدة: قاموس الموانئ للبواخر
const PORT_CODES: Record<string, string> = {
  '??????? ???????': 'ALG', 'algeciras': 'ALG',
  '???? ???????': 'TNM', 'tanger med': 'TNM',
  '???? ???????': 'TAV', 'tanger ville': 'TAV',
  '?????': 'MLG', 'malaga': 'MLG',
  '???????': 'NAD', 'nador': 'NAD',
  '????': 'CEU', 'ceuta': 'CEU',
  '??????': 'ALM', 'almeria': 'ALM',
  '???????': 'BCN', 'barcelona': 'BCN',
  '???? ??????': 'LPA', 'gran canaria': 'LPA',
  '???? ??????': 'LPA',
  '??? ??????': 'LPA', 'las palmas': 'LPA',
  '????????': 'TFS', 'tenerife': 'TFS',
};

const CITY_TO_IATA: Record<string, string> = {
  'دبي': 'DXB', 'باريس': 'CDG', 'لندن': 'LHR', 'القاهرة': 'CAI', 'الرياض': 'RUH',
  'جدة': 'JED', 'الدوحة': 'DOH', 'اسطنبول': 'IST', 'نيويورك': 'JFK', 'طوكيو': 'NRT',
  'الرباط': 'CMN', 'الدار البيضاء': 'CMN', 'مراكش': 'RAK', 'تونس': 'TUN',
  'الجزائر': 'ALG', 'بيروت': 'BEY', 'عمان': 'AMM', 'ابوظبي': 'AUH', 'مسقط': 'MCT',
  'الكويت': 'KWI', 'البحرين': 'BAH', 'بغداد': 'BGW', 'طنجة': 'TNG',
  'مدريد': 'MAD', 'برشلونة': 'BCN', 'روما': 'FCO', 'اشبيلية': 'SVQ',
  'dubai': 'DXB', 'paris': 'CDG', 'london': 'LHR', 'cairo': 'CAI', 'riyadh': 'RUH',
  'jeddah': 'JED', 'doha': 'DOH', 'istanbul': 'IST', 'new york': 'JFK', 'tokyo': 'NRT',
  'rabat': 'CMN', 'casablanca': 'CMN', 'marrakech': 'RAK', 'tunis': 'TUN',
  'algiers': 'ALG', 'beirut': 'BEY', 'amman': 'AMM', 'abu dhabi': 'AUH', 'muscat': 'MCT',
  'kuwait': 'KWI', 'bahrain': 'BAH', 'baghdad': 'BGW', 'tangier': 'TNG', 'tanger': 'TNG',
  'madrid': 'MAD', 'barcelona': 'BCN', 'rome': 'FCO', 'seville': 'SVQ', 'sevilla': 'SVQ',
  'amsterdam': 'AMS', 'frankfurt': 'FRA', 'milan': 'MXP', 'berlin': 'BER',
  'singapore': 'SIN', 'bangkok': 'BKK', 'sydney': 'SYD', 'toronto': 'YYZ',
  'los angeles': 'LAX', 'chicago': 'ORD', 'miami': 'MIA', 'moscow': 'SVO',
  'londre': 'LHR', 'londres': 'LHR', 'nueva york': 'JFK',
};

// ✅ إضافة جديدة: إضافة خدمة البواخر (Ferries)
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
  // ✅ إضافة خدمة البواخر
  ferry: [
    { name: 'DirectFerries', desc: 'Spain/France/Italy → Morocco', url: 'https://www.directferries.com', icon: '🚢' },
    { name: 'Balearia', desc: 'Spain → Morocco ferries', url: 'https://www.balearia.com', icon: '⛴️' },
  ],
  cruise: [{ name: 'Sea Radar', desc: 'Cruise deals worldwide', url: 'https://searadar.tpx.gr/WC89iS5m', icon: '🚢' }],
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

// ✅ إضافة جديدة: دالة بناء روابط البواخر
function buildFerryLink(from: string, to: string, date: string): string {
  const d = date || getDefaultDate();
  const fLower = from.toLowerCase();
  const tLower = to.toLowerCase();
  
  // ????? ??????? ??????? ??? ??????????
  const arabicToEnglish: Record<string, string> = {
    // ??????
    '????': 'Tangier',
    '???? ???????': 'Tanger Med',
    '???? ???????': 'Tanger Ville',
    '????? ???????': 'Casablanca',
    '???????': 'Nador',
    '???????': 'Al Hoceima',
    // ???????
    '??????? ???????': 'Algeciras',
    '?????': 'Malaga',
    '??????': 'Almeria',
    '???????': 'Barcelona',
    '????': 'Ceuta',
    // ??? ???????
    '???? ??????': 'Gran Canaria',
    '???? ??????': 'Gran Canaria',
    '??? ??????': 'Las Palmas',
    '????????': 'Tenerife',
  };
  
  const fromEnglish = arabicToEnglish[fLower] || from;
  const toEnglish = arabicToEnglish[tLower] || to;
  
  const fromCode = PORT_CODES[fLower] || fromEnglish;
  const toCode = PORT_CODES[tLower] || toEnglish;
  
  return `https://www.balearia.com/en/search-v2?origin=${fromCode}&destination=${toCode}&departure_date=${d}&passengers=1`;
}

function getSystemPrompt(lang: string, service: string): string {
  const today = new Date().toISOString().split('T')[0];
  const langRule =
    lang === 'ar' ? 'CRITICAL: Respond ONLY in Arabic.' :
    lang === 'fr' ? 'CRITICAL: Respond ONLY in French.' :
    lang === 'es' ? 'CRITICAL: Respond ONLY in Spanish.' :
    'CRITICAL: Respond ONLY in English.';

  return `You are Fastamor, a smart travel concierge. Today: ${today}.
${langRule}
Current service: ${service}

FLIGHT SEARCH RULES:
- Extract origin + destination + date from user message
- If no date, use next week
- Output ONLY this block (no extra text before it):
<search>{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"}</search>
- Keep response to 1-2 sentences max

FERRIES SEARCH RULES:
- Extract from + to + date from user message
- Output: <search>{"type":"ferry","from":"city_name","to":"city_name","date":"YYYY-MM-DD"}</search>

HOTEL SEARCH: output:
<links>[{"name":"Intui Travel","desc":"Best hotels","url":"https://intui.tpx.gr/kguAoKIU","icon":"🏨"}]</links>

TRANSFER/CAR: output:
<links>[{"name":"GetTransfer","desc":"Airport transfers","url":"https://gettransfer.tpx.gr/9poAnD5l","icon":"🚕"},{"name":"LocalRent","desc":"Car rental","url":"https://localrent.tpx.gr/qr92Puo9","icon":"🚗"}]</links>

TOURS/ACTIVITIES: output:
<links>[{"name":"Klook","desc":"Tours","url":"https://klook.tpx.gr/vRUzaJbI","icon":"🎡"},{"name":"Tiqets","desc":"Museums","url":"https://tiqets.tpx.gr/ot4HK9Pf","icon":"🎭"}]</links>

BUS: output:
<links>[{"name":"FlixBus","desc":"Bus tickets","url":"https://tpx.gr/n6krgEY3","icon":"🚌"}]</links>

FERRIES: output:
<links>[{"name":"DirectFerries","desc":"Ferry deals","url":"https://www.directferries.com","icon":"🚢"},{"name":"Balearia","desc":"Spain-Morocco ferries","url":"https://www.balearia.com","icon":"⛴️"}]</links>

CRUISE: output:
<links>[{"name":"Sea Radar","desc":"Cruises","url":"https://searadar.tpx.gr/WC89iS5m","icon":"🚢"}]</links>

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
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date }),
      });
      const data = await response.json();
      return { flights: data.flights || [], hasDirectFlights: data.has_direct || false, fallbackUrl: data.fallback_url };
    } catch {
      return { flights: [], hasDirectFlights: false, fallbackUrl: `https://aviasales.tpx.gr/yQxrYmk7` };
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const newMsg: Message = { role: 'user', content };
    const updatedHistory = [...messagesRef.current, newMsg];
    messagesRef.current = updatedHistory;
    setMessages([...updatedHistory]);
    setIsTyping(true);
    setShowSearchAnim(true);

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_KEY;
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: getSystemPrompt(lang, service),
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const fullText: string = data.content?.[0]?.text || '';
      const searchMatch = fullText.match(/<search>([\s\S]*?)<\/search>/);
      const linksMatch = fullText.match(/<links>([\s\S]*?)<\/links>/);
      const cleanText = fullText
        .replace(/<search>[\s\S]*?<\/search>/g, '')
        .replace(/<links>[\s\S]*?<\/links>/g, '')
        .trim();

      const withReply = [...updatedHistory, { role: 'assistant' as const, content: cleanText || '...' }];
      messagesRef.current = withReply;
      setMessages([...withReply]);
      setIsTyping(false);
      setShowSearchAnim(false);

      // ── Flight search
      if (searchMatch) {
        try {
          const searchData = JSON.parse(searchMatch[1].trim());

          // ✅ إضافة جديدة: معالجة البواخر (Ferries)
          if (searchData.type === 'ferry') {
            const rawUrl = buildFerryLink(searchData.from, searchData.to, searchData.date);
            if (rawUrl) {
              const affUrl = await toAffiliateLink(rawUrl);
              setDynamicLinks([{
                name: 'Balearia',
                desc: `${searchData.from} → ${searchData.to}`,
                url: affUrl,
                icon: '🚢'
              }]);
              setHasResults(true);
              trackSearch();

              const confirmMsg = lang === 'ar' 
                ? `✅ هاك رابط الحجز المباشر للباخرة من ${searchData.from} إلى ${searchData.to} 👇`
                : `✅ Here's your ferry booking link from ${searchData.from} to ${searchData.to} 👇`;
              
              messagesRef.current = [...withReply, { role: 'assistant', content: confirmMsg }];
              setMessages([...messagesRef.current]);
              return;
            }
          }

          if (searchData.type === 'flight') {
            if (searchData.origin) { const i = getIATA(searchData.origin); if (i) searchData.origin = i; }
            if (searchData.destination) { const i = getIATA(searchData.destination); if (i) searchData.destination = i; }
            if (!searchData.date) searchData.date = getDefaultDate();

            if (searchData.origin && searchData.destination) {
              setShowSearchAnim(true);
              const { flights, hasDirectFlights, fallbackUrl } = await searchFlights(
                searchData.origin, searchData.destination, searchData.date
              );
              setShowSearchAnim(false);

              if (flights.length > 0) {
                setFlightResults(flights);
                setHasResults(true);
                trackSearch();

                const directCount = flights.filter((f: FlightResult) => f.is_direct).length;
                const cheapest = flights[0].price;

                let confirmMsg = '';
                if (lang === 'ar') {
                  confirmMsg = directCount > 0
                    ? `✅ وجدت ${directCount} رحلة مباشرة! أرخصها $${cheapest} 👇`
                    : `⚠️ لا توجد رحلات مباشرة متاحة الآن. إليك أفضل الخيارات من $${cheapest} 👇`;
                } else if (lang === 'fr') {
                  confirmMsg = directCount > 0
                    ? `✅ ${directCount} vol(s) direct(s) trouvé(s)! Dès $${cheapest} 👇`
                    : `⚠️ Pas de vols directs disponibles. Meilleures options dès $${cheapest} 👇`;
                } else if (lang === 'es') {
                  confirmMsg = directCount > 0
                    ? `✅ ¡${directCount} vuelo(s) directo(s)! Desde $${cheapest} 👇`
                    : `⚠️ No hay vuelos directos disponibles. Mejores opciones desde $${cheapest} 👇`;
                } else {
                  confirmMsg = directCount > 0
                    ? `✅ Found ${directCount} direct flight(s)! From $${cheapest} 👇`
                    : `⚠️ No direct flights in cache. Best available from $${cheapest} — or [search live on Aviasales](${fallbackUrl}) 👇`;
                }

                messagesRef.current = [...withReply, { role: 'assistant', content: confirmMsg }];
                setMessages([...messagesRef.current]);
              } else {
                const searchUrl = fallbackUrl || `https://www.aviasales.com/search/${searchData.origin}${searchData.destination}1?marker=709105`;
                setDynamicLinks([{
                  name: 'Aviasales',
                  desc: `${searchData.origin} → ${searchData.destination}`,
                  url: searchUrl,
                  icon: '✈️'
                }]);
                setHasResults(true);
                const noMsg = lang === 'ar'
                  ? `لم أجد رحلات مخزنة. ابحث مباشرة على Aviasales للنتائج الحية 👇`
                  : lang === 'fr' ? `Aucun résultat en cache. Cherchez en direct sur Aviasales 👇`
                  : lang === 'es' ? `Sin resultados en caché. Busca en directo en Aviasales 👇`
                  : `No cached results. Search live on Aviasales for real-time flights 👇`;
                messagesRef.current = [...withReply, { role: 'assistant', content: noMsg }];
                setMessages([...messagesRef.current]);
              }
            }
          }
        } catch (e) { console.error('Parse error:', e); }
      }

      // ── Service links
      if (linksMatch) {
        try {
          const links = JSON.parse(linksMatch[1].trim());
          
          // تحويل الروابط تلقائياً إلى روابط عمولة
          for (let i = 0; i < links.length; i++) {
            if (links[i].url) {
              try {
                links[i].url = await toAffiliateLink(links[i].url);
              } catch (e) {
                console.warn('Failed to convert link:', links[i].url);
              }
            }
          }
          
          setDynamicLinks(links);
          setHasResults(true);
          trackSearch();
        } catch { }
      }

      // ── Fallback service links
      if (!searchMatch && !linksMatch && service && service !== 'flight') {
        const links = SERVICE_LINKS[service];
        if (links) {
          // تحويل الروابط الثابتة تلقائياً إلى روابط عمولة
          for (let i = 0; i < links.length; i++) {
            if (links[i].url) {
              try {
                links[i].url = await toAffiliateLink(links[i].url);
              } catch (e) {
                console.warn('Failed to convert fallback link:', links[i].url);
              }
            }
          }
          setDynamicLinks(links);
          setHasResults(true);
        }
      }

    } catch (err) {
      setIsTyping(false);
      setShowSearchAnim(false);
      const errMsg = lang === 'ar' ? 'عذراً، مشكلة في الاتصال. 🔄'
        : lang === 'fr' ? 'Problème de connexion. 🔄'
        : lang === 'es' ? 'Error de conexión. 🔄'
        : 'Connection issue. Please try again. 🔄';
      messagesRef.current = [...messagesRef.current, { role: 'assistant', content: errMsg }];
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
  // ✅ إضافة جديدة: التعرف على البواخر بالدارجة
  if (/ferry|باخرة|عبارة|شقف|بابور/.test(l)) return 'ferry';
  if (/cruise|كروز|croisière|crucero/.test(l)) return 'cruise';
  if (/bus|coach|حافلة|autobus/.test(l)) return 'bus';
  if (/hotel|فندق|hôtel|alojamiento/.test(l)) return 'hotel';
  if (/taxi|transfer|تاكسي|نقل|transfert|traslado|car|rent|voiture|coche|سيارة|كراء/.test(l)) return 'taxi';
  if (/tour|experience|جولة|تجربة|visite|excursion/.test(l)) return 'experience';
  if (/esim|sim|internet|بيانات/.test(l)) return 'esim';
  if (/delay|cancel|compensation|تعويض|remboursement|indemnización/.test(l)) return 'compensation';
  return 'flight';
}