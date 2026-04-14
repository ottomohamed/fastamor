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
  'madrid': 'MAD', 'barcelona': 'BCN', 'tangier': 'TNG', 'casablanca': 'CMN', 'marrakech': 'RAK'
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

const MARKER = '709105';

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
      // استخراج المدن
      const patterns = [
        /من\s*([^\s]+(?:\s+[^\s]+)?)\s*إلى\s*([^\s]+(?:\s+[^\s]+)?)/i,
        /from\s*([^\s]+(?:\s+[^\s]+)?)\s*to\s*([^\s]+(?:\s+[^\s]+)?)/i,
      ];
      
      let origin = null;
      let destination = null;
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          origin = getIATA(match[1].trim());
          destination = getIATA(match[2].trim());
          if (origin && destination) break;
        }
      }
      
      setShowSearchAnim(false);
      
      if (origin && destination) {
        // رابط مباشر مع marker
        const affiliateUrl = `https://aviasales.tpx.gr/yQxrYmk7?origin=${origin}&destination=${destination}&marker=${MARKER}`;
        
        setDynamicLinks([{ 
          name: 'Aviasales', 
          desc: `Search flights from ${origin} to ${destination}`, 
          url: affiliateUrl, 
          icon: '' 
        }]);
        setHasResults(true);
        
        const replyText = lang === 'ar' 
          ? ` يمكنك البحث عن رحلة من ${origin} إلى ${destination} عبر الرابط أدناه.`
          : ` You can search for flights from ${origin} to ${destination} using the link below.`;
        
        const reply = { role: 'assistant' as const, content: replyText };
        messagesRef.current = [...messagesRef.current, reply];
        setMessages([...messagesRef.current]);
      } else {
        const helpText = lang === 'ar'
          ? ' للبحث عن رحلة، اكتب: "رحلة من دبي إلى لندن"'
          : ' To search for a flight, write: "Flight from Dubai to London"';
        
        const reply = { role: 'assistant' as const, content: helpText };
        messagesRef.current = [...messagesRef.current, reply];
        setMessages([...messagesRef.current]);
      }
      
      setIsTyping(false);
      
    } catch (error) {
      console.error('Error:', error);
      const errorText = lang === 'ar'
        ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى. '
        : 'Sorry, an error occurred. Please try again. ';
      
      const reply = { role: 'assistant' as const, content: errorText };
      messagesRef.current = [...messagesRef.current, reply];
      setMessages([...messagesRef.current]);
      setIsTyping(false);
      setShowSearchAnim(false);
    }
  }, [isTyping, lang]);

  const clearChat = useCallback(() => {
    const greeting = lang === 'ar' 
      ? 'مرحباً!  أنا Fastamor. كيف يمكنني مساعدتك؟'
      : 'Hello!  I\'m Fastamor. How can I help you?';
    messagesRef.current = [{ role: 'assistant', content: greeting }];
    setMessages([{ role: 'assistant', content: greeting }]);
    setHasResults(false);
    setShowSearchAnim(false);
    setDynamicLinks([]);
    setFlightResults([]);
  }, [lang]);

  return { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, flightResults, sendMessage, clearChat };
}

export function detectService(text: string): string {
  const l = text.toLowerCase();
  if (/hotel|فندق/.test(l)) return 'hotel';
  if (/taxi|تاكسي/.test(l)) return 'taxi';
  if (/tour|جولة/.test(l)) return 'experience';
  return 'flight';
}
