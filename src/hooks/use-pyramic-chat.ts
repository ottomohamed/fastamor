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

const SYSTEM_PROMPT = `You are Fastamor, a friendly and expert AI travel assistant. You help users find flights, hotels, car rentals, tours, buses, and trains.

When a user asks about travel, you:
1. Respond warmly and helpfully in the SAME language the user writes in
2. Give a brief, useful answer (2-3 sentences max)
3. End your response with a JSON block in this exact format:

<links>
[
  {"name": "Aviasales", "desc": "Best flight deals worldwide", "url": "https://aviasales.tpx.gr/EDLTCi50", "icon": "✈️"},
  {"name": "Booking.com", "desc": "Hotels from $29/night", "url": "https://booking.tpx.gr/pO1xgUOk", "icon": "🏨"}
]
</links>

Choose URLs based on service type:
- Flights: https://aviasales.tpx.gr/EDLTCi50 or https://expedia.tpx.gr/oZmiqQ00
- Hotels: https://booking.tpx.gr/pO1xgUOk or https://hotels.tpx.gr/HZcgZ2jB or https://trip.tpx.gr/xuZyhawM
- Tours: https://getyourguide.tpx.gr/N4hqBYBh or https://klook.tpx.gr/maKAx6cu or https://tiqets.tpx.gr/4XvdA3sA
- Cars: https://discovercars.tpx.gr/Db7PkpPH
- Bus/Train: https://omio.tpx.gr/HhKpT0j2 or https://tpx.gr/nd8xOURD
- Cruises: https://searadar.tpx.gr/PdA1Y1ul

Always include 2-4 relevant links with helpful descriptions.`;

export function useFastamorChat(service: string, lang: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchAnim, setShowSearchAnim] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [dynamicLinks, setDynamicLinks] = useState<AffiliateLink[]>([]);

  const messagesRef = useRef<Message[]>([]);

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
          system: SYSTEM_PROMPT + `\n\nService context: ${service}. Language: ${lang}.`,
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error(`API error ${response.status}`);

      const data = await response.json();
      const fullText: string = data.content?.[0]?.text || '';

      const linksMatch = fullText.match(/<links>([\s\S]*?)<\/links>/);
      let extractedLinks: AffiliateLink[] = [];
      if (linksMatch) {
        try {
          extractedLinks = JSON.parse(linksMatch[1].trim());
        } catch {
          extractedLinks = [];
        }
      }

      const cleanText = fullText.replace(/<links>[\s\S]*?<\/links>/g, '').trim();

      const withReply = [...updatedHistory, { role: 'assistant' as const, content: cleanText }];
      messagesRef.current = withReply;
      setMessages([...withReply]);
      setIsTyping(false);
      setShowSearchAnim(false);

      if (extractedLinks.length > 0) {
        setHasResults(true);
        setDynamicLinks(extractedLinks);
        trackSearch();
      }

    } catch (err) {
      const fallbacks: Record<string, string> = {
        en: "Sorry, I'm having trouble connecting. Please try again. 🔄",
        ar: "عذراً، أواجه مشكلة في الاتصال. يرجى المحاولة مجدداً. 🔄",
        fr: "Désolé, problème de connexion. Veuillez réessayer. 🔄",
        es: "Lo siento, problema de conexión. Inténtalo de nuevo. 🔄"
      };
      const errMsg = fallbacks[lang] || fallbacks.en;
      const withErr = [...updatedHistory, { role: 'assistant' as const, content: errMsg }];
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
  }, []);

  return { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, sendMessage, clearChat };
}

export function detectService(text: string): string {
  const l = text.toLowerCase();
  if (/train|قطار|tren|zug/.test(l)) return "train";
  if (/bus|coach|حافلة|باص|autobus/.test(l)) return "bus";
  if (/hotel|stay|hostel|فندق|إقامة|alojamiento/.test(l)) return "hotel";
  if (/taxi|transfer|car|تاكسي|سيارة|coche/.test(l)) return "taxi";
  if (/tour|experience|activity|جولة|تجربة|actividad/.test(l)) return "experience";
  return "flight";
}
