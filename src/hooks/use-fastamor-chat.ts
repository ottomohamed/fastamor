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
  'Ø¯Ø¨ÙŠ': 'DXB', 'Ø¨Ø§Ø±ÙŠØ³': 'CDG', 'Ù„Ù†Ø¯Ù†': 'LHR', 'Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©': 'CAI', 'Ø§Ù„Ø±ÙŠØ§Ø¶': 'RUH',
  'Ø¬Ø¯Ø©': 'JED', 'Ø§Ù„Ø¯ÙˆØ­Ø©': 'DOH', 'Ø§Ø³Ø·Ù†Ø¨ÙˆÙ„': 'IST', 'Ù†ÙŠÙˆÙŠÙˆØ±Ùƒ': 'JFK', 'Ø·ÙˆÙƒÙŠÙˆ': 'NRT',
  'Ø§Ù„Ø±Ø¨Ø§Ø·': 'CMN', 'Ø§Ù„Ø¯Ø§Ø± Ø§Ù„Ø¨ÙŠØ¶Ø§Ø¡': 'CMN', 'Ù…Ø±Ø§ÙƒØ´': 'RAK', 'ØªÙˆÙ†Ø³': 'TUN',
  'Ø§Ù„Ø¬Ø²Ø§Ø¦Ø±': 'ALG', 'Ø¨ÙŠØ±ÙˆØª': 'BEY', 'Ø¹Ù…Ø§Ù†': 'AMM', 'Ø£Ø¨ÙˆØ¸Ø¨ÙŠ': 'AUH', 'Ù…Ø³Ù‚Ø·': 'MCT',
  'Ø§Ù„ÙƒÙˆÙŠØª': 'KWI', 'Ø§Ù„Ø¨Ø­Ø±ÙŠÙ†': 'BAH', 'Ø¨ØºØ¯Ø§Ø¯': 'BGW', 'Ø·Ø±Ø§Ø¨Ù„Ø³': 'TIP',
  'Ø§Ø´Ø¨ÙŠÙ„ÙŠØ©': 'SVQ', 'Ù…Ø¯Ø±ÙŠØ¯': 'MAD', 'Ø¨Ø±Ø´Ù„ÙˆÙ†Ø©': 'BCN', 'Ø±ÙˆÙ…Ø§': 'FCO',
  'Ø£Ù…Ø³ØªØ±Ø¯Ø§Ù…': 'AMS', 'ÙØ±Ø§Ù†ÙƒÙÙˆØ±Øª': 'FRA', 'Ù…ÙŠÙ„Ø§Ù†Ùˆ': 'MXP', 'Ø¨Ø±Ù„ÙŠÙ†': 'BER',
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
  'dubai': 'DXB', 'sharjah': 'SHJ', 'fujairah': 'FJR',
};

// â”€â”€ Affiliate links par service
const SERVICE_LINKS: Record<string, AffiliateLink[]> = {
  hotel: [
    { name: 'Intui Travel', desc: 'Best hotel deals worldwide', url: 'https://intui.tpx.gr/kguAoKIU', icon: 'ðŸ¨' },
  ],
  taxi: [
    { name: 'GetTransfer', desc: 'Airport & city transfers', url: 'https://gettransfer.tpx.gr/9poAnD5l', icon: 'ðŸš•' },
    { name: 'Kiwi Taxi', desc: 'Reliable taxi service', url: 'https://kiwitaxi.tpx.gr/Y6yrFeYN', icon: 'ðŸš–' },
    { name: 'LocalRent', desc: 'Car rental', url: 'https://localrent.tpx.gr/qr92Puo9', icon: 'ðŸš—' },
  ],
  experience: [
    { name: 'Klook', desc: 'Tours & experiences', url: 'https://klook.tpx.gr/vRUzaJbI', icon: 'ðŸŽ¡' },
    { name: 'Tiqets', desc: 'Museums & attractions', url: 'https://tiqets.tpx.gr/ot4HK9Pf', icon: 'ðŸŽ­' },
    { name: 'WeGoTrip', desc: 'Audio tours', url: 'https://wegotrip.tpx.gr/DyN0pkVH', icon: 'ðŸ—ºï¸' },
  ],
  bus: [
    { name: 'FlixBus', desc: 'Bus tickets across Europe', url: 'https://tpx.gr/n6krgEY3', icon: 'ðŸšŒ' },
  ],
  cruise: [
    { name: 'Sea Radar', desc: 'Cruise deals worldwide', url: 'https://searadar.tpx.gr/WC89iS5m', icon: 'ðŸš¢' },
  ],
  esim: [
    { name: 'Yesim', desc: 'eSIM for travelers', url: 'https://yesim.tpx.gr/9gzdax7m', icon: 'ðŸ“±' },
  ],
  compensation: [
    { name: 'Compensair', desc: 'Flight compensation', url: 'https://compensair.tpx.gr/MGUDRrY2', icon: 'ðŸ’°' },
    { name: 'AirHelp', desc: 'Get your refund', url: 'https://airhelp.tpx.gr/baeI5YIf', icon: 'ðŸ›¡ï¸' },
  ],
  car: [
    { name: 'EconomyBookings', desc: 'Best car rental prices', url: 'https://economybookings.tpx.gr/ONZ6dOjM', icon: 'ðŸš™' },
    { name: 'QEEQ', desc: 'Premium car rental', url: 'https://qeeq.tpx.gr/pTbTtERj', icon: 'ðŸŽï¸' },
  ],
  flight: [
    { name: 'Aviasales', desc: 'Search all airlines', url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: 'âœˆï¸' },
  ],
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

â•â•â• FOR FLIGHTS â•â•â•
When user asks about flights, extract origin + destination + date.
If no date given, use ${defaultDate}.
Output:
<search>
{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"}
</search>

â•â•â• FOR HOTELS â•â•â•
When user asks about hotels/accommodation, output:
<links>
[{"name":"Intui Travel","desc":"Best hotel deals","url":"https://intui.tpx.gr/kguAoKIU","icon":"ðŸ¨"}]
</links>

â•â•â• FOR TRANSFERS/TAXI â•â•â•
When user asks about taxi/transfer/car hire, output:
<links>
[{"name":"GetTransfer","desc":"Airport transfers","url":"https://gettransfer.tpx.gr/9poAnD5l","icon":"ðŸš•"},{"name":"Kiwi Taxi","desc":"Reliable taxi","url":"https://kiwitaxi.tpx.gr/Y6yrFeYN","icon":"ðŸš–"},{"name":"LocalRent","desc":"Car rental","url":"https://localrent.tpx.gr/qr92Puo9","icon":"ðŸš—"}]
</links>

â•â•â• FOR TOURS/EXPERIENCES â•â•â•
When user asks about tours, museums, attractions, activities, output:
<links>
[{"name":"Klook","desc":"Tours & experiences","url":"https://klook.tpx.gr/vRUzaJbI","icon":"ðŸŽ¡"},{"name":"Tiqets","desc":"Museums & attractions","url":"https://tiqets.tpx.gr/ot4HK9Pf","icon":"ðŸŽ­"},{"name":"WeGoTrip","desc":"Audio tours","url":"https://wegotrip.tpx.gr/DyN0pkVH","icon":"ðŸ—ºï¸"}]
</links>

â•â•â• FOR BUSES â•â•â•
When user asks about buses/coaches, output:
<links>
[{"name":"FlixBus","desc":"Bus tickets Europe","url":"https://tpx.gr/n6krgEY3","icon":"ðŸšŒ"}]
</links>

â•â•â• FOR CRUISES â•â•â•
When user asks about cruises, output:
<links>
[{"name":"Sea Radar","desc":"Cruise deals","url":"https://searadar.tpx.gr/WC89iS5m","icon":"ðŸš¢"}]
</links>

â•â•â• FOR eSIM â•â•â•
When user asks about SIM card/internet abroad, output:
<links>
[{"name":"Yesim","desc":"eSIM for travelers","url":"https://yesim.tpx.gr/9gzdax7m","icon":"ðŸ“±"}]
</links>

â•â•â• FOR CAR RENTAL â•â•â•
When user asks about renting a car, output:
<links>
[{"name":"EconomyBookings","desc":"Best car rental","url":"https://economybookings.tpx.gr/ONZ6dOjM","icon":"ðŸš™"},{"name":"QEEQ","desc":"Premium cars","url":"https://qeeq.tpx.gr/pTbTtERj","icon":"ðŸŽï¸"}]
</links>

â•â•â• FOR FLIGHT COMPENSATION â•â•â•
When user mentions delayed/cancelled flight, output:
<links>
[{"name":"Compensair","desc":"Get compensation","url":"https://compensair.tpx.gr/MGUDRrY2","icon":"ðŸ’°"},{"name":"AirHelp","desc":"Flight refund","url":"https://airhelp.tpx.gr/baeI5YIf","icon":"ðŸ›¡ï¸"}]
</links>

City â†’ IATA: Dubai=DXB, Paris=CDG, London=LHR, Cairo=CAI, Riyadh=RUH, Casablanca=CMN, Rabat=CMN, Istanbul=IST, NYC=JFK, Tokyo=NRT, Madrid=MAD, Barcelona=BCN, Rome=FCO, Marrakech=RAK`;
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
      const res = await fetch('https://fastamor-api.onrender.com/api/flights', {
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

      // â”€â”€ Handle flight search
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
                  lang === 'ar' ? `âœ… ÙˆØ¬Ø¯Øª ${flights.length} Ø±Ø­Ù„Ø©! Ø£Ø±Ø®ØµÙ‡Ø§ $${cheapest} ðŸ‘‡` :
                  lang === 'fr' ? `âœ… ${flights.length} vol(s) trouvÃ©(s)! DÃ¨s $${cheapest} ðŸ‘‡` :
                  lang === 'es' ? `âœ… Â¡${flights.length} vuelo(s)! Desde $${cheapest} ðŸ‘‡` :
                  `âœ… Found ${flights.length} flight(s)! From $${cheapest} ðŸ‘‡`,
              };
              const updated = [...withReply, msg];
              messagesRef.current = updated;
              setMessages(updated);
            } else {
              // No flights â†’ show affiliate links
              setDynamicLinks(SERVICE_LINKS.flight);
              setHasResults(true);
              const msg = {
                role: 'assistant' as const,
                content:
                  lang === 'ar' ? `Ù„Ù… Ø£Ø¬Ø¯ Ø±Ø­Ù„Ø§Øª Ù…ØªØ§Ø­Ø©. Ø§Ø¨Ø­Ø« Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ø¨Ø± ðŸ‘‡` :
                  lang === 'fr' ? `Aucun vol trouvÃ©. Recherchez directement sur ðŸ‘‡` :
                  lang === 'es' ? `No encontrÃ© vuelos. Busca directamente en ðŸ‘‡` :
                  `No cached flights found. Search directly on ðŸ‘‡`,
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

      // â”€â”€ Handle service links
      if (linksMatch) {
        try {
          const links = JSON.parse(linksMatch[1].trim());
          setDynamicLinks(links);
          setHasResults(true);
          trackSearch();
        } catch { }
      }

      // â”€â”€ If no block detected, show service-specific links
      if (!searchMatch && !linksMatch && service && service !== 'flight') {
        const links = SERVICE_LINKS[service] || SERVICE_LINKS.flight;
        setDynamicLinks(links);
        setHasResults(true);
      }

    } catch (err) {
      setIsTyping(false);
      setShowSearchAnim(false);
      const fallbacks: Record<string, string> = {
        en: 'Sorry, connection issue. Please try again. ðŸ”„',
        ar: 'Ø¹Ø°Ø±Ø§Ù‹ØŒ Ù…Ø´ÙƒÙ„Ø© ÙÙŠ Ø§Ù„Ø§ØªØµØ§Ù„. Ø­Ø§ÙˆÙ„ Ù…Ø¬Ø¯Ø¯Ø§Ù‹. ðŸ”„',
        fr: 'DÃ©solÃ©, problÃ¨me de connexion. ðŸ”„',
        es: 'Lo siento, error de conexiÃ³n. ðŸ”„',
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
  if (/cruise|ÙƒØ±ÙˆØ²|croisiÃ¨re|crucero/.test(l)) return 'cruise';
  if (/bus|coach|Ø­Ø§ÙÙ„Ø©|autobus/.test(l)) return 'bus';
  if (/hotel|stay|ÙÙ†Ø¯Ù‚|Ø¥Ù‚Ø§Ù…Ø©|hÃ´tel|alojamiento/.test(l)) return 'hotel';
  if (/taxi|transfer|ØªØ§ÙƒØ³ÙŠ|Ù†Ù‚Ù„|transfert|traslado/.test(l)) return 'taxi';
  if (/car|rent|Ø³ÙŠØ§Ø±Ø©|location|alquiler/.test(l)) return 'car';
  if (/tour|experience|Ø¬ÙˆÙ„Ø©|ØªØ¬Ø±Ø¨Ø©|visite|excursion/.test(l)) return 'experience';
  if (/esim|sim|internet|Ø¨ÙŠØ§Ù†Ø§Øª/.test(l)) return 'esim';
  if (/delay|cancel|compensation|ØªØ¹ÙˆÙŠØ¶|remboursement/.test(l)) return 'compensation';
  return 'flight';
}

