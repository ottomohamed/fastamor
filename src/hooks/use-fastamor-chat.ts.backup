import { useState, useCallback, useRef } from 'react';
import { trackSearch } from '@/lib/tracking';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type AffiliateLink = {
  name: string;
  desc: string;
  url: string;
  icon: string;
};

export type FlightResult = {
  id: string;
  airline: string;
  airline_logo: string;
  origin: string;
  destination: string;
  departure_time: string;
  duration: string;
  stops: string;
  price: number;
  currency: string;
  booking_url: string;
  gate: string;
};

const CITY_TO_IATA: Record<string, string> = {
  'دبي': 'DXB', 'باريس': 'CDG', 'لندن': 'LHR', 'القاهرة': 'CAI', 'الرياض': 'RUH',
  'جدة': 'JED', 'الدوحة': 'DOH', 'اسطنبول': 'IST', 'نيويورك': 'JFK', 'طوكيو': 'NRT',
  'الرباط': 'CMN', 'الدار البيضاء': 'CMN', 'مراكش': 'RAK', 'تونس': 'TUN',
  'الجزائر': 'ALG', 'بيروت': 'BEY', 'عمان': 'AMM', 'أبوظبي': 'AUH', 'مسقط': 'MCT',
  'الكويت': 'KWI', 'البحرين': 'BAH', 'بغداد': 'BGW', 'طرابلس': 'TIP',
  'اشبيلية': 'SVQ', 'مدريد': 'MAD', 'برشلونة': 'BCN', 'روما': 'FCO',
  'أمستردام': 'AMS', 'فرانكفورت': 'FRA', 'ميلانو': 'MXP', 'برلين': 'BER',
  'dubai': 'DXB', 'paris': 'CDG', 'london': 'LHR', 'cairo': 'CAI', 'riyadh': 'RUH',
  'jeddah': 'JED', 'doha': 'DOH', 'istanbul': 'IST', 'new york': 'JFK', 'newyork': 'JFK',
  'tokyo': 'NRT', 'rabat': 'CMN', 'casablanca': 'CMN', 'marrakech': 'RAK', 'tunis': 'TUN',
  'algiers': 'ALG', 'beirut': 'BEY', 'amman': 'AMM', 'abu dhabi': 'AUH', 'muscat': 'MCT',
  'kuwait': 'KWI', 'bahrain': 'BAH', 'baghdad': 'BGW', 'amsterdam': 'AMS',
  'frankfurt': 'FRA', 'madrid': 'MAD', 'rome': 'FCO', 'barcelona': 'BCN',
  'singapore': 'SIN', 'bangkok': 'BKK', 'sydney': 'SYD', 'toronto': 'YYZ',
  'los angeles': 'LAX', 'chicago': 'ORD', 'miami': 'MIA', 'moscow': 'SVO',
  'beijing': 'PEK', 'shanghai': 'PVG', 'mumbai': 'BOM', 'delhi': 'DEL',
  'seville': 'SVQ', 'sevilla': 'SVQ', 'tanger': 'TNG', 'tangier': 'TNG',
  'londre': 'LHR', 'londres': 'LHR', 'moscou': 'SVO', 'milan': 'MXP',
  'berlin': 'BER', 'athens': 'ATH', 'lisbon': 'LIS', 'vienna': 'VIE',
  'prague': 'PRG', 'budapest': 'BUD', 'warsaw': 'WAW', 'zurich': 'ZRH',
  'brussels': 'BRU', 'copenhagen': 'CPH', 'stockholm': 'ARN', 'oslo': 'OSL',
  'dubai': 'DXB', 'sharjah': 'SHJ', 'fujairah': 'FJR'
  };

// Aviasales API Configuration
const AVIA_TOKEN = import.meta.env.VITE_TRAVELPAYOUTS_TOKEN || '517b9f43b0fa448681c25b90fda7cf73';
const AVIA_MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '709105';

//  Affiliate links par service
const SERVICE_LINKS: Record<string, AffiliateLink[]> = {
  hotel: [
    { name: 'Intui Travel', desc: 'Best hotel deals worldwide', url: 'https://intui.tpx.gr/kguAoKIU', icon: '' },
  ],
  taxi: [
    { name: 'GetTransfer', desc: 'Airport & city transfers', url: 'https://gettransfer.tpx.gr/9poAnD5l', icon: '' },
    { name: 'Kiwi Taxi', desc: 'Reliable taxi service', url: 'https://kiwitaxi.tpx.gr/Y6yrFeYN', icon: '' },
    { name: 'LocalRent', desc: 'Car rental', url: 'https://localrent.tpx.gr/qr92Puo9', icon: '' },
  ],
  experience: [
    { name: 'Klook', desc: 'Tours & experiences', url: 'https://klook.tpx.gr/vRUzaJbI', icon: '' },
    { name: 'Tiqets', desc: 'Museums & attractions', url: 'https://tiqets.tpx.gr/ot4HK9Pf', icon: '' },
    { name: 'WeGoTrip', desc: 'Audio tours', url: 'https://wegotrip.tpx.gr/DyN0pkVH', icon: '' },
  ],
  bus: [
    { name: 'FlixBus', desc: 'Bus tickets across Europe', url: 'https://tpx.gr/n6krgEY3', icon: '' },
  ],
  cruise: [
    { name: 'Sea Radar', desc: 'Cruise deals worldwide', url: 'https://searadar.tpx.gr/WC89iS5m', icon: '' },
  ],
  esim: [
    { name: 'Yesim', desc: 'eSIM for travelers', url: 'https://yesim.tpx.gr/9gzdax7m', icon: '' },
  ],
  compensation: [
    { name: 'Compensair', desc: 'Flight compensation', url: 'https://compensair.tpx.gr/MGUDRrY2', icon: '' },
    { name: 'AirHelp', desc: 'Get your refund', url: 'https://airhelp.tpx.gr/baeI5YIf', icon: '' },
  ],
  car: [
    { name: 'EconomyBookings', desc: 'Best car rental prices', url: 'https://economybookings.tpx.gr/ONZ6dOjM', icon: '' },
    { name: 'QEEQ', desc: 'Premium car rental', url: 'https://qeeq.tpx.gr/pTbTtERj', icon: '' },
  ],
  flight: [
    { name: 'Aviasales', desc: 'Search all airlines', url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: '' },
  ]
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
  const defaultDate = getDefaultDate();

  const langRule =
    lang === 'ar' ? 'CRITICAL: Respond ONLY in Arabic. Every word must be Arabic.' :
    lang === 'fr' ? 'CRITICAL: Respond ONLY in French. Every word must be French.' :
    lang === 'es' ? 'CRITICAL: Respond ONLY in Spanish. Every word must be Spanish.' :
    'CRITICAL: Respond ONLY in English.';

  return `You are Fastamor, a friendly AI travel concierge. Today: ${today}.
${langRule}

Current service requested: ${service}

RULES:
- ${langRule}
- Keep responses SHORT (2-3 sentences max)
- ALWAYS output the correct block based on what user asks

 FOR FLIGHTS 
When user asks about flights, extract origin + destination + date.
If no date given, use ${defaultDate}.
Output:
<search>
{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"}
</search>

 FOR HOTELS 
When user asks about hotels/accommodation, output:
<links>
[{"name":"Intui Travel","desc":"Best hotel deals","url":"https://intui.tpx.gr/kguAoKIU","icon":""}]
</links>

 FOR TRANSFERS/TAXI 
When user asks about taxi/transfer/car hire, output:
<links>
[{"name":"GetTransfer","desc":"Airport transfers","url":"https://gettransfer.tpx.gr/9poAnD5l","icon":""},{"name":"Kiwi Taxi","desc":"Reliable taxi","url":"https://kiwitaxi.tpx.gr/Y6yrFeYN","icon":""},{"name":"LocalRent","desc":"Car rental","url":"https://localrent.tpx.gr/qr92Puo9","icon":""}]
</links>

 FOR TOURS/EXPERIENCES 
When user asks about tours, museums, attractions, activities, output:
<links>
[{"name":"Klook","desc":"Tours & experiences","url":"https://klook.tpx.gr/vRUzaJbI","icon":""},{"name":"Tiqets","desc":"Museums & attractions","url":"https://tiqets.tpx.gr/ot4HK9Pf","icon":""},{"name":"WeGoTrip","desc":"Audio tours","url":"https://wegotrip.tpx.gr/DyN0pkVH","icon":""}]
</links>

 FOR BUSES 
When user asks about buses/coaches, output:
<links>
[{"name":"FlixBus","desc":"Bus tickets Europe","url":"https://tpx.gr/n6krgEY3","icon":""}]
</links>

 FOR CRUISES 
When user asks about cruises, output:
<links>
[{"name":"Sea Radar","desc":"Cruise deals","url":"https://searadar.tpx.gr/WC89iS5m","icon":""}]
</links>

 FOR eSIM 
When user asks about SIM card/internet abroad, output:
<links>
[{"name":"Yesim","desc":"eSIM for travelers","url":"https://yesim.tpx.gr/9gzdax7m","icon":""}]
</links>

 FOR CAR RENTAL 
When user asks about renting a car, output:
<links>
[{"name":"EconomyBookings","desc":"Best car rental","url":"https://economybookings.tpx.gr/ONZ6dOjM","icon":""},{"name":"QEEQ","desc":"Premium cars","url":"https://qeeq.tpx.gr/pTbTtERj","icon":""}]
</links>

 FOR FLIGHT COMPENSATION 
When user mentions delayed/cancelled flight, output:
<links>
[{"name":"Compensair","desc":"Get compensation","url":"https://compensair.tpx.gr/MGUDRrY2","icon":""},{"name":"AirHelp","desc":"Flight refund","url":"https://airhelp.tpx.gr/baeI5YIf","icon":""}]
</links>

City  IATA: Dubai=DXB, Paris=CDG, London=LHR, Cairo=CAI, Riyadh=RUH, Casablanca=CMN, Rabat=CMN, Istanbul=IST, NYC=JFK, Tokyo=NRT, Madrid=MAD, Barcelona=BCN, Rome=FCO, Marrakech=RAK`;
}

export function useFastamorChat(service: string, lang: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchAnim, setShowSearchAnim] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [dynamicLinks, setDynamicLinks] = useState<AffiliateLink[]>([]);
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  const messagesRef = useRef<Message[]>([]);

  //  Direct Aviasales API call (no backend needed)
  const searchFlights = async (origin: string, destination: string, date: string) => {
    try {
      const month = date.substring(0, 7);
      const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${month}&currency=usd&limit=20&token=${AVIA_TOKEN}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        return data.data.map((flight: any, idx: number) => ({
          id: `${flight.airline}_${idx}`,
          airline: flight.airline,
          airline_logo: `https://pics.avs.io/200/200/${flight.airline}.png`,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_at,
          duration: flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A',
          stops: flight.transfers === 0 ? 'Direct' : `${flight.transfers} stop(s)`,
          price: flight.price,
          currency: 'USD',
          booking_url: `https://www.aviasales.com/search/${flight.origin}${flight.destination}${month}?marker=${AVIA_MARKER}`,
          gate: 'aviasales'
        }));
      }
      return [];
    } catch (error) {
      console.error('Flight search error:', error);
      return [];
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

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
  },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: getSystemPrompt(lang, service),
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content }))
  })
  });

      if (!response.ok) throw new Error(`API error ${response.status}`);

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

      //  Handle flight search
      if (searchMatch) {
        try {
          const searchData = JSON.parse(searchMatch[1].trim());
          if (searchData.origin) { const i = getIATA(searchData.origin); if (i) searchData.origin = i; }
          if (searchData.destination) { const i = getIATA(searchData.destination); if (i) searchData.destination = i; }
          if (!searchData.date) searchData.date = getDefaultDate();

          if (searchData.destination) {
            setShowSearchAnim(true);
            const flights = await searchFlights(searchData.origin || '', searchData.destination, searchData.date);
            setShowSearchAnim(false);

            if (flights.length > 0) {
              setFlightResults(flights);
              setHasResults(true);
              trackSearch();
              const cheapest = flights[0].price;
              const msg = {
                role: 'assistant' as const,
                content:
                  lang === 'ar' ? ` وجدت ${flights.length} رحلة! أرخصها $${cheapest} ` :
                  lang === 'fr' ? ` ${flights.length} vol(s) trouvé(s)! Dès $${cheapest} ` :
                  lang === 'es' ? ` ${flights.length} vuelo(s)! Desde $${cheapest} ` :
                  ` Found ${flights.length} flight(s)! From $${cheapest} `
  };
              const updated = [...withReply, msg];
              messagesRef.current = updated;
              setMessages(updated);
            } else {
              // No flights  show affiliate links
              setDynamicLinks(SERVICE_LINKS.flight);
              setHasResults(true);
              const msg = {
                role: 'assistant' as const,
                content:
                  lang === 'ar' ? `لم أجد رحلات متاحة. ابحث مباشرة عبر ` :
                  lang === 'fr' ? `Aucun vol trouvé. Recherchez directement sur ` :
                  lang === 'es' ? `No encontré vuelos. Busca directamente en ` :
                  `No cached flights found. Search directly on `
  };
              const updated = [...withReply, msg];
              messagesRef.current = updated;
              setMessages(updated);
            }
          }
        } catch (e) {
          console.error('Search parse error:', e);
        }
      }

      //  Handle service links
      if (linksMatch) {
        try {
          const links = JSON.parse(linksMatch[1].trim());
          setDynamicLinks(links);
          setHasResults(true);
          trackSearch();
        } catch { }
      }

      //  If no block detected, show service-specific links
      if (!searchMatch && !linksMatch && service && service !== 'flight') {
        const links = SERVICE_LINKS[service] || SERVICE_LINKS.flight;
        setDynamicLinks(links);
        setHasResults(true);
      }

    } catch (err) {
      setIsTyping(false);
      setShowSearchAnim(false);
      const fallbacks: Record<string, string> = {
        en: 'Sorry, connection issue. Please try again. ',
        ar: 'عذراً، مشكلة في الاتصال. حاول مجدداً. ',
        fr: 'Désolé, problème de connexion. ',
        es: 'Lo siento, error de conexión. '
  };
      const msg = { role: 'assistant' as const, content: fallbacks[lang] || fallbacks.en };
      const updated = [...messagesRef.current, msg];
      messagesRef.current = updated;
      setMessages(updated);
    }
  }, [isTyping, service, lang]);

  const clearChat = useCallback((greeting?: string) => {
    const initial: Message[] = greeting ? [{ role: 'assistant', content: greeting }] : [];
    messagesRef.current = initial;
    setMessages([...initial]);
    setHasResults(false);
    setShowSearchAnim(false);
    setDynamicLinks([]);
    setFlightResults([]);
  }, []);

  return { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, flightResults, sendMessage, clearChat };
}

export function detectService(text: string): string {
  const l = text.toLowerCase();
  if (/cruise|كروز|croisière|crucero/.test(l)) return 'cruise';
  if (/bus|coach|حافلة|autobus/.test(l)) return 'bus';
  if (/hotel|stay|فندق|إقامة|hôtel|alojamiento/.test(l)) return 'hotel';
  if (/taxi|transfer|تاكسي|نقل|transfert|traslado/.test(l)) return 'taxi';
  if (/car|rent|سيارة|location|alquiler/.test(l)) return 'car';
  if (/tour|experience|جولة|تجربة|visite|excursion/.test(l)) return 'experience';
  if (/esim|sim|internet|بيانات/.test(l)) return 'esim';
  if (/delay|cancel|compensation|تعويض|remboursement/.test(l)) return 'compensation';
  return 'flight';
}

