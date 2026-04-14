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
  '???': 'DXB', '?????': 'CDG', '????': 'LHR', '???????': 'CAI', '??????': 'RUH',
  '???': 'JED', '??????': 'DOH', '???????': 'IST', '???????': 'JFK', '?????': 'NRT',
  '??????': 'CMN', '????? ???????': 'CMN', '?????': 'RAK', '????': 'TUN',
  '???????': 'ALG', '?????': 'BEY', '????': 'AMM', '??????': 'AUH', '????': 'MCT',
  '??????': 'KWI', '???????': 'BAH', '?????': 'BGW', '??????': 'TIP',
  '???????': 'SVQ', '?????': 'MAD', '???????': 'BCN', '????': 'FCO',
  '????????': 'AMS', '?????????': 'FRA', '??????': 'MXP', '?????': 'BER',
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

 FOR FLIGHTS 
When user asks about flights, extract origin + destination + date.
If no date given, use ${new Date().toISOString().split('T')[0]}.
Output:
<search>
{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"}
</search>

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

      //  Handle flight search
      if (searchMatch) {
        try {
          const searchData = JSON.parse(searchMatch[1].trim());
          if (searchData.origin) { const i = getIATA(searchData.origin); if (i) searchData.origin = i; }
          if (searchData.destination) { const i = getIATA(searchData.destination); if (i) searchData.destination = i; }

          if (searchData.origin && searchData.destination) {
            setShowSearchAnim(false);
            
            // ???? ????? ?????
            const affiliateUrl = `${AFFILIATE_BASE_URL}?origin=${searchData.origin}&destination=${searchData.destination}&marker=${MARKER}`;
            
            setDynamicLinks([{ 
              name: 'Aviasales', 
              desc: `Search flights from ${searchData.origin} to ${searchData.destination}`, 
              url: affiliateUrl, 
              icon: '' 
            }]);
            setHasResults(true);
            
            const replyText = lang === 'ar' 
              ? ` ????? ????? ?? ???? ?? ${searchData.origin} ??? ${searchData.destination} ??? ?????? ?????.`
              : lang === 'fr'
              ? ` Vous pouvez rechercher un vol de ${searchData.origin} à ${searchData.destination} via le lien ci-dessous.`
              : lang === 'es'
              ? ` Puedes buscar un vuelo de ${searchData.origin} a ${searchData.destination} mediante el siguiente enlace.`
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

      //  Handle service links
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
        ar: '?????? ????? ?? ???????. ???? ??????. ',
        fr: 'Désolé, problème de connexion. ',
        es: 'Lo siento, error de conexión. ',
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
  if (/cruise|????|croisière|crucero/.test(l)) return 'cruise';
  if (/bus|coach|?????|autobus/.test(l)) return 'bus';
  if (/hotel|stay|????|?????|hôtel|alojamiento/.test(l)) return 'hotel';
  if (/taxi|transfer|?????|???|transfert|traslado/.test(l)) return 'taxi';
  if (/car|rent|?????|location|alquiler/.test(l)) return 'car';
  if (/tour|experience|????|?????|visite|excursion/.test(l)) return 'experience';
  if (/esim|sim|internet|??????/.test(l)) return 'esim';
  if (/delay|cancel|compensation|?????|remboursement/.test(l)) return 'compensation';
  return 'flight';
}
