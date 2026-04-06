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
  'londre': 'LHR', 'londres': 'LHR', 'moscou': 'SVO',
};

function getIATA(text: string): string | undefined {
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

function getSystemPrompt(lang: string): string {
  const today = new Date().toISOString().split('T')[0];
  const defaultDate = getDefaultDate();

  const langInstruction =
    lang === 'ar' ? 'CRITICAL: You MUST respond in Arabic (العربية) ONLY. Every single word must be in Arabic. Never use English or any other language.' :
    lang === 'fr' ? 'CRITICAL: You MUST respond in French (Français) ONLY. Every single word must be in French. Never use English or any other language.' :
    lang === 'es' ? 'CRITICAL: You MUST respond in Spanish (Español) ONLY. Every single word must be in Spanish. Never use English or any other language.' :
    'CRITICAL: You MUST respond in English ONLY.';

  return `You are Fastamor, a friendly AI travel assistant. Today is ${today}.

${langInstruction}

When users ask about flights, extract origin, destination, and date.

RULES:
1. ${langInstruction}
2. Keep response SHORT (2-3 sentences max)
3. If user does not specify a date, use ${defaultDate} as default
4. Always generate a <search> block when you have origin + destination

After your short response, ALWAYS add this block if it is a flight request:
<search>
{"type":"flight","origin":"IATA_CODE","destination":"IATA_CODE","date":"YYYY-MM-DD"}
</search>

City to IATA examples:
- الرباط/Rabat = CMN
- الدار البيضاء/Casablanca = CMN
- باريس/Paris = CDG
- لندن/London = LHR
- دبي/Dubai = DXB
- القاهرة/Cairo = CAI
- الرياض/Riyadh = RUH
- اسطنبول/Istanbul = IST
- نيويورك/New York = JFK
- مراكش/Marrakech = RAK
- مدريد/Madrid = MAD
- برشلونة/Barcelona = BCN

For hotels use:
<links>
[{"name":"Intui Travel","desc":"Best hotel deals","url":"https://intui.tpx.gr/kguAoKIU","icon":"🏨"}]
</links>

For tours/activities use: https://klook.tpx.gr/vRUzaJbI or https://tiqets.tpx.gr/ot4HK9Pf or https://wegotrip.tpx.gr/DyN0pkVH
For cars/transfers use: https://gettransfer.tpx.gr/9poAnD5l or https://kiwitaxi.tpx.gr/Y6yrFeYN or https://qeeq.tpx.gr/pTbTtERj
For buses use: https://tpx.gr/n6krgEY3
For cruises use: https://searadar.tpx.gr/WC89iS5m
For flight compensation use: https://compensair.tpx.gr/MGUDRrY2 or https://airhelp.tpx.gr/baeI5YIf
For eSIM use: https://yesim.tpx.gr/9gzdax7m

Current service: ${lang}`;
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
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date }),
      });
      const data = await res.json();
      return data.flights || [];
    } catch {
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
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: getSystemPrompt(lang),
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
        }),
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

      const withReply = [...updatedHistory, { role: 'assistant' as const, content: cleanText }];
      messagesRef.current = withReply;
      setMessages([...withReply]);
      setIsTyping(false);

      if (searchMatch) {
        try {
          let searchData = JSON.parse(searchMatch[1].trim());

          if (searchData.origin) {
            const iata = getIATA(searchData.origin);
            if (iata) searchData.origin = iata;
          }
          if (searchData.destination) {
            const iata = getIATA(searchData.destination);
            if (iata) searchData.destination = iata;
          }
          if (!searchData.date) searchData.date = getDefaultDate();

          if (searchData.origin && searchData.destination) {
            setShowSearchAnim(true);
            const flights = await searchFlights(searchData.origin, searchData.destination, searchData.date);
            setShowSearchAnim(false);

            if (flights.length > 0) {
              setFlightResults(flights);
              setHasResults(true);
              trackSearch();

              const cheapest = flights[0].price;
              const confirmMsg = {
                role: 'assistant' as const,
                content:
                  lang === 'ar' ? `✅ وجدت ${flights.length} رحلة من ${searchData.origin} إلى ${searchData.destination}! أرخصها بـ $${cheapest} 👇` :
                  lang === 'fr' ? `✅ ${flights.length} vol(s) trouvé(s) de ${searchData.origin} à ${searchData.destination}! Dès $${cheapest} 👇` :
                  lang === 'es' ? `✅ ¡${flights.length} vuelo(s) de ${searchData.origin} a ${searchData.destination}! Desde $${cheapest} 👇` :
                  `✅ Found ${flights.length} flight(s) from ${searchData.origin} to ${searchData.destination}! From $${cheapest} 👇`
              };
              const withConfirm = [...withReply, confirmMsg];
              messagesRef.current = withConfirm;
              setMessages([...withConfirm]);
            } else {
              const noMsg = {
                role: 'assistant' as const,
                content:
                  lang === 'ar' ? `لم أجد رحلات مباشرة. جرّب البحث عبر هذه المواقع 👇` :
                  lang === 'fr' ? `Aucun vol direct trouvé. Essayez ces sites 👇` :
                  lang === 'es' ? `No encontré vuelos directos. Prueba estos sitios 👇` :
                  `No direct flights found. Try searching on these sites 👇`
              };
              messagesRef.current = [...withReply, noMsg];
              setMessages([...withReply, noMsg]);
              setDynamicLinks([
                { name: 'Aviasales', desc: `${searchData.origin} → ${searchData.destination}`, url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: '✈️' },
                { name: 'Intui Travel', desc: 'Flights & hotels', url: 'https://intui.tpx.gr/kguAoKIU', icon: '🌍' },
              ]);
              setHasResults(true);
            }
          }
        } catch (e) {
          console.error('Search parse error:', e);
        }
      }

      if (linksMatch) {
        try {
          const links = JSON.parse(linksMatch[1].trim());
          setDynamicLinks(links);
          setHasResults(true);
          trackSearch();
        } catch { }
      }

      setShowSearchAnim(false);

    } catch (err) {
      const fallbacks: Record<string, string> = {
        en: "Sorry, connection issue. Please try again. 🔄",
        ar: "عذراً، مشكلة في الاتصال. يرجى المحاولة مجدداً. 🔄",
        fr: "Désolé, problème de connexion. Réessayez. 🔄",
        es: "Lo siento, problema de conexión. Inténtalo de nuevo. 🔄"
      };
      const withErr = [...messagesRef.current, { role: 'assistant' as const, content: fallbacks[lang] || fallbacks.en }];
      messagesRef.current = withErr;
      setMessages([...withErr]);
      setIsTyping(false);
      setShowSearchAnim(false);
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
  if (/train|قطار|tren/.test(l)) return "train";
  if (/bus|coach|حافلة|باص/.test(l)) return "bus";
  if (/hotel|stay|فندق|إقامة/.test(l)) return "hotel";
  if (/taxi|transfer|car|تاكسي|سيارة/.test(l)) return "taxi";
  if (/tour|experience|جولة|تجربة/.test(l)) return "experience";
  if (/cruise|كروز|سفينة/.test(l)) return "cruise";
  return "flight";
}
