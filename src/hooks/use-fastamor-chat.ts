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
  // Arabic city names
  'dubai': 'DXB',
  'paris': 'CDG',
  'london': 'LHR',
  'cairo': 'CAI',
  'riyadh': 'RUH',
  'jeddah': 'JED',
  'doha': 'DOH',
  'istanbul': 'IST',
  'new york': 'JFK',
  'tokyo': 'NRT',
  'rabat': 'CMN',
  'casablanca': 'CMN',
  'marrakech': 'RAK',
  'tunis': 'TUN',
  'algiers': 'ALG',
  'beirut': 'BEY',
  'amman': 'AMM',
  'abu dhabi': 'AUH',
  'muscat': 'MCT',
  'kuwait': 'KWI',
  'bahrain': 'BAH',
  'baghdad': 'BGW',
  'tripoli': 'TIP',
  'seville': 'SVQ',
  'madrid': 'MAD',
  'barcelona': 'BCN',
  'rome': 'FCO',
  'amsterdam': 'AMS',
  'frankfurt': 'FRA',
  'milan': 'MXP',
  'berlin': 'BER',
  'athens': 'ATH',
  'lisbon': 'LIS',
  'vienna': 'VIE',
  'prague': 'PRG',
  'budapest': 'BUD',
  'warsaw': 'WAW',
  'zurich': 'ZRH',
  'brussels': 'BRU',
  'copenhagen': 'CPH',
  'stockholm': 'ARN',
  'oslo': 'OSL',
  'singapore': 'SIN',
  'bangkok': 'BKK',
  'sydney': 'SYD',
  'toronto': 'YYZ',
  'los angeles': 'LAX',
  'chicago': 'ORD',
  'miami': 'MIA',
  'moscow': 'SVO',
  'beijing': 'PEK',
  'shanghai': 'PVG',
  'mumbai': 'BOM',
  'delhi': 'DEL',
  'tangier': 'TNG',
  'londres': 'LHR',
  'moscou': 'SVO',
  'newyork': 'JFK',
};

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
    { name: 'Compensair', desc: 'Get compensation', url: 'https://compensair.tpx.gr/MGUDRrY2', icon: '' },
    { name: 'AirHelp', desc: 'Get your refund', url: 'https://airhelp.tpx.gr/baeI5YIf', icon: '' },
  ],
  car: [
    { name: 'EconomyBookings', desc: 'Best car rental prices', url: 'https://economybookings.tpx.gr/ONZ6dOjM', icon: '' },
    { name: 'QEEQ', desc: 'Premium car rental', url: 'https://qeeq.tpx.gr/pTbTtERj', icon: '' },
  ],
  flight: [
    { name: 'Aviasales', desc: 'Search all airlines', url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: '' },
  ],
};

const MARKER = '709105';
const AFFILIATE_BASE_URL = 'https://aviasales.tpx.gr/yQxrYmk7';

function getIATA(text: string): string | undefined {
  if (!text) return undefined;
  if (/^[A-Z]{3}$/.test(text.trim())) return text.trim();
  const lower = text.toLowerCase().trim();
  for (const [city, iata] of Object.entries(CITY_TO_IATA)) {
    if (lower.includes(city.toLowerCase())) return iata;
  }
  return undefined;
}

function getSystemPrompt(lang: string, service: string): string {
  const today = new Date().toISOString().split('T')[0];

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

=== FOR FLIGHTS ===
When user asks about flights, extract origin + destination + date.
If no date given, use ${today}.
Output:
<search>
{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"}
</search>

=== FOR HOTELS ===
When user asks about hotels/accommodation, output:
<links>
[{"name":"Intui Travel","desc":"Best hotel deals","url":"https://intui.tpx.gr/kguAoKIU","icon":""}]
</links>

City -> IATA: Dubai=DXB, Paris=CDG, London=LHR, Cairo=CAI, Riyadh=RUH, Casablanca=CMN, Rabat=CMN, Istanbul=IST, NYC=JFK, Tokyo=NRT, Madrid=MAD, Barcelona=BCN, Rome=FCO, Marrakech=RAK`;
}

export function useFastamorChat(service: string, lang: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchAnim, setShowSearchAnim] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [dynamicLinks, setDynamicLinks] = useState<AffiliateLink[]>([]);
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  const messagesRef = useRef<Message[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const newMsg: Message = { role: 'user', content };
    const updatedHistory = [...messagesRef.current, newMsg];
    messagesRef.current = updatedHistory;
    setMessages([...updatedHistory]);
    setIsTyping(true);
    setShowSearchAnim(true);
    setFlightResults([]);
    setHasResults(false);

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
          max_tokens: 512,
          system: getSystemPrompt(lang, service),
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

      const withReply = [...updatedHistory, { role: 'assistant' as const, content: cleanText || '...' }];
      messagesRef.current = withReply;
      setMessages([...withReply]);
      setIsTyping(false);
      setShowSearchAnim(false);

      if (searchMatch) {
        try {
          const searchData = JSON.parse(searchMatch[1].trim());
          if (searchData.origin) { const i = getIATA(searchData.origin); if (i) searchData.origin = i; }
          if (searchData.destination) { const i = getIATA(searchData.destination); if (i) searchData.destination = i; }

          if (searchData.origin && searchData.destination) {
            setShowSearchAnim(false);
            
            const affiliateUrl = `${AFFILIATE_BASE_URL}?origin=${searchData.origin}&destination=${searchData.destination}&marker=${MARKER}`;
            
            setDynamicLinks([{ 
              name: 'Aviasales', 
              desc: `Search flights from ${searchData.origin} to ${searchData.destination}`, 
              url: affiliateUrl, 
              icon: '' 
            }]);
            setHasResults(true);
            
            const replyText = lang === 'ar' 
              ? ` You can search for flights from ${searchData.origin} to ${searchData.destination} using the link below.`
              : ` You can search for flights from ${searchData.origin} to ${searchData.destination} using the link below.`;
            
            const msg = {
              role: 'assistant' as const,
              content: replyText,
            };
            const updated = [...withReply, msg];
            messagesRef.current = updated;
            setMessages(updated);
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

    } catch (err) {
      console.error('Error:', err);
      setIsTyping(false);
      setShowSearchAnim(false);
      const fallbacks: Record<string, string> = {
        en: 'Sorry, connection issue. Please try again. ',
        ar: 'Sorry, connection issue. Please try again. ',
        fr: 'Sorry, connection issue. Please try again. ',
        es: 'Sorry, connection issue. Please try again. ',
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
  if (/cruise|krooz|safina/.test(l)) return 'cruise';
  if (/bus|coach|hafila/.test(l)) return 'bus';
  if (/hotel|stay|fundoq/.test(l)) return 'hotel';
  if (/taxi|transfer|sayara/.test(l)) return 'taxi';
  if (/car|rent|sayara/.test(l)) return 'car';
  if (/tour|experience|jawla/.test(l)) return 'experience';
  if (/esim|sim|internet/.test(l)) return 'esim';
  if (/delay|cancel|compensation/.test(l)) return 'compensation';
  return 'flight';
}
