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
  'dubai': 'DXB', 'paris': 'CDG', 'london': 'LHR', 'cairo': 'CAI', 'riyadh': 'RUH',
  'jeddah': 'JED', 'doha': 'DOH', 'istanbul': 'IST', 'new york': 'JFK', 'tokyo': 'NRT',
  'rabat': 'CMN', 'casablanca': 'CMN', 'marrakech': 'RAK', 'tunis': 'TUN',
  'algiers': 'ALG', 'beirut': 'BEY', 'amman': 'AMM', 'abu dhabi': 'AUH', 'muscat': 'MCT',
  'kuwait': 'KWI', 'bahrain': 'BAH', 'baghdad': 'BGW',
  'seville': 'SVQ', 'madrid': 'MAD', 'barcelona': 'BCN', 'rome': 'FCO',
  'amsterdam': 'AMS', 'frankfurt': 'FRA', 'milan': 'MXP', 'berlin': 'BER',
  'tangier': 'TNG', 'londres': 'LHR',
};

const SERVICE_LINKS: Record<string, AffiliateLink[]> = {
  hotel: [{ name: 'Intui Travel', desc: 'Best hotel deals worldwide', url: 'https://intui.tpx.gr/kguAoKIU', icon: '' }],
  taxi: [
    { name: 'GetTransfer', desc: 'Airport & city transfers', url: 'https://gettransfer.tpx.gr/9poAnD5l', icon: '' },
    { name: 'Kiwi Taxi', desc: 'Reliable taxi service', url: 'https://kiwitaxi.tpx.gr/Y6yrFeYN', icon: '' },
  ],
  experience: [
    { name: 'Klook', desc: 'Tours & experiences', url: 'https://klook.tpx.gr/vRUzaJbI', icon: '' },
    { name: 'Tiqets', desc: 'Museums & attractions', url: 'https://tiqets.tpx.gr/ot4HK9Pf', icon: '' },
  ],
  bus: [{ name: 'FlixBus', desc: 'Bus tickets across Europe', url: 'https://tpx.gr/n6krgEY3', icon: '' }],
  cruise: [{ name: 'Sea Radar', desc: 'Cruise deals worldwide', url: 'https://searadar.tpx.gr/WC89iS5m', icon: '' }],
  flight: [{ name: 'Aviasales', desc: 'Search all airlines', url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: '' }],
};

const MARKER = '709105';

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
  const langRule = lang === 'ar' ? 'Respond ONLY in Arabic.' : 'Respond ONLY in English.';
  return `You are Fastamor, a travel concierge. Today: ${today}. ${langRule}
When user asks about flights, extract origin + destination + date.
Output: <search>{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"}</search>`;
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
      const response = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, date })
      });
      const data = await response.json();
      return data.flights || [];
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
        },
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
      const cleanText = fullText.replace(/<search>[\s\S]*?<\/search>/g, '').trim();

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
            setShowSearchAnim(true);
            const flights = await searchFlights(searchData.origin, searchData.destination, searchData.date || new Date().toISOString().split('T')[0]);
            setShowSearchAnim(false);

            if (flights.length > 0) {
              setFlightResults(flights);
              setHasResults(true);
              trackSearch();
              const msg = { role: 'assistant' as const, content: ` Found ${flights.length} flights! Cheapest: $${flights[0].price} ` };
              messagesRef.current = [...messagesRef.current, msg];
              setMessages([...messagesRef.current]);
            } else {
              const affiliateUrl = `https://aviasales.tpx.gr/yQxrYmk7?origin=${searchData.origin}&destination=${searchData.destination}&marker=${MARKER}`;
              setDynamicLinks([{ name: 'Aviasales', desc: `Search flights from ${searchData.origin} to ${searchData.destination}`, url: affiliateUrl, icon: '' }]);
              setHasResults(true);
              const msg = { role: 'assistant' as const, content: `No flights found. Search directly on Aviasales ` };
              messagesRef.current = [...messagesRef.current, msg];
              setMessages([...messagesRef.current]);
            }
          }
        } catch (e) { console.error('Parse error:', e); }
      }
    } catch (err) {
      console.error('Error:', err);
      setIsTyping(false);
      setShowSearchAnim(false);
    }
  }, [isTyping, service, lang]);

  const clearChat = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
    setFlightResults([]);
    setHasResults(false);
    setDynamicLinks([]);
  }, []);

  return { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, flightResults, sendMessage, clearChat };
}

export function detectService(text: string): string {
  const l = text.toLowerCase();
  if (/cruise/.test(l)) return 'cruise';
  if (/bus/.test(l)) return 'bus';
  if (/hotel/.test(l)) return 'hotel';
  if (/taxi/.test(l)) return 'taxi';
  if (/car/.test(l)) return 'car';
  if (/tour/.test(l)) return 'experience';
  return 'flight';
}
