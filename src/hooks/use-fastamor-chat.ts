import { useState, useCallback, useRef, useEffect } from 'react';
import { trackSearch } from '@/lib/tracking';
import { toAffiliateLink } from '@/lib/convertLinks';

// ============================================
// TYPES - نظام أنواع متكامل
// ============================================
export type Message = { role: 'user' | 'assistant'; content: string; };
export type AffiliateLink = { name: string; desc: string; url: string; icon: string; };
export type FlightResult = {
  id: string; airline: string; airline_logo: string;
  origin: string; destination: string; departure_time: string;
  duration: string; stops: string; price: number; currency: string;
  booking_url: string; gate: string; is_direct?: boolean;
};

export type ChatStatus = 'idle' | 'typing' | 'searching' | 'results' | 'error';

export type FlexibleResult = {
  date: string;
  flights: FlightResult[];
  cheapest: number;
  hasFlights: boolean;
};

export type ScoreWeights = {
  priceWeight: number;
  stopsPenalty: number;
  durationWeight: number;
};

export type SearchData = {
  type: 'flight' | 'ferry' | 'taxi' | 'bus';
  origin?: string;
  destination?: string;
  from?: string;
  to?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  flexible?: boolean;
  sort_by?: 'price' | 'duration' | 'quality';
};

// نوع جديد لـ AI Action Layer
export type AIAction = {
  action: 'search_flights' | 'search_ferry' | 'search_taxi' | 'search_bus' | 'show_links';
  data: SearchData | AffiliateLink[];
  confidence: number;
  fallback?: string;
};

export type ParsedDuration = {
  minutes: number;
  hours: number;
  original: string;
};

export type AnalyticsEvent = {
  type: 'search' | 'click' | 'conversion' | 'error' | 'flight_select' | 'ai_response';
  service: string;
  timestamp: number;
  metadata?: Record<string, any>;
};

export type ErrorState = {
  hasError: boolean;
  message: string;
  retryCount: number;
  lastError?: string;
};

export type QueuedMessage = {
  id: string;
  content: string;
  timestamp: number;
};

// ============================================
// CONSTANTS & DICTIONARIES
// ============================================
const PORT_CODES: Record<string, string> = {
  'الجزيرة الخضراء': 'ALG', 'algeciras': 'ALG',
  'طنجة المتوسط': 'TNM', 'tanger med': 'TNM',
  'طنجة المدينة': 'TAV', 'tanger ville': 'TAV',
  'مالقة': 'MLG', 'malaga': 'MLG',
  'الناظور': 'NAD', 'nador': 'NAD',
  'سبتة': 'CEU', 'ceuta': 'CEU',
  'المرية': 'ALM', 'almeria': 'ALM',
  'برشلونة': 'BCN', 'barcelona': 'BCN',
  'مرسيليا': 'MRS', 'marseille': 'MRS',
  'جنوة': 'GOA', 'genoa': 'GOA',
  'الحسيمة': 'AHU', 'al hoceima': 'AHU'
};

const COUNTRY_TO_MAIN_AIRPORT: Record<string, string> = {
  'المغرب': 'CMN', 'morocco': 'CMN',
  'فرنسا': 'CDG', 'france': 'CDG',
  'اسبانيا': 'MAD', 'spain': 'MAD',
  'بريطانيا': 'LHR', 'uk': 'LHR', 'united kingdom': 'LHR',
  'ايطاليا': 'FCO', 'italy': 'FCO',
  'المانيا': 'FRA', 'germany': 'FRA',
  'هولندا': 'AMS', 'netherlands': 'AMS',
  'بلجيكا': 'BRU', 'belgium': 'BRU',
};

const CITY_TO_IATA: Record<string, string> = {
  'دبي': 'DXB', 'باريس': 'CDG', 'لندن': 'LHR', 'القاهرة': 'CAI', 'الرياض': 'RUH',
  'جدة': 'JED', 'الدوحة': 'DOH', 'اسطنبول': 'IST', 'نيويورك': 'JFK', 'طوكيو': 'NRT',
  'الرباط': 'RBA', 'الدار البيضاء': 'CMN', 'مراكش': 'RAK', 'تونس': 'TUN',
  'الجزائر': 'ALG', 'بيروت': 'BEY', 'عمان': 'AMM', 'ابوظبي': 'AUH', 'مسقط': 'MCT',
  'طنجة': 'TNG', 'مدريد': 'MAD', 'برشلونة': 'BCN', 'روما': 'FCO', 'اشبيلية': 'SVQ',
  'dubai': 'DXB', 'paris': 'CDG', 'london': 'LHR', 'cairo': 'CAI', 'riyadh': 'RUH',
  'rabat': 'RBA', 'casablanca': 'CMN', 'marrakech': 'RAK', 'tangier': 'TNG', 'tanger': 'TNG',
  'madrid': 'MAD', 'barcelona': 'BCN', 'rome': 'FCO', 'seville': 'SVQ', 'sevilla': 'SVQ'
};

const SERVICE_LINKS: Record<string, AffiliateLink[]> = {
  hotel: [{ name: 'Intui Travel', desc: 'Best hotel deals worldwide', url: 'https://intui.tpx.gr/kguAoKIU', icon: '🏨' }],
  taxi: [
    { name: 'GetTransfer', desc: 'Airport & city transfers', url: 'https://gettransfer.tpx.gr/9poAnD5l', icon: '🚕' },
    { name: 'Kiwi Taxi', desc: 'Reliable taxi service', url: 'https://kiwitaxi.tpx.gr/Y6yrFeYN', icon: '🚖' },
    { name: 'LocalRent', desc: 'Car rental', url: 'https://localrent.tpx.gr/qr92Puo9', icon: '🚗' },
  ],
  experience: [
    { name: 'Klook', desc: 'Tours & experiences', url: 'https://klook.tpx.gr/vRUzaJbI', icon: '🎡' },
    { name: 'Tiqets', desc: 'Museums & attractions', url: 'https://tiqets.tpx.gr/ot4HK9Pf', icon: '🎭' },
  ],
  bus: [{ name: 'FlixBus', desc: 'Bus tickets across Europe', url: 'https://tpx.gr/n6krgEY3', icon: '🚌' }],
  ferry: [
    { name: 'DirectFerries', desc: 'Spain/France/Italy → Morocco/Tunisia', url: 'https://www.directferries.com', icon: '🚢' },
    { name: 'Balearia', desc: 'Spain → Morocco ferries', url: 'https://www.balearia.com', icon: '⛴️' },
    { name: 'Sea Radar', desc: 'Cruise & ferry deals', url: 'https://searadar.tpx.gr/WC89iS5m', icon: '⛵' },
  ],
  cruise: [{ name: 'Sea Radar', desc: 'Cruise deals worldwide', url: 'https://searadar.tpx.gr/WC89iS5m', icon: '🚢' }],
  esim: [{ name: 'Yesim', desc: 'eSIM for travelers', url: 'https://yesim.tpx.gr/9gzdax7m', icon: '📱' }],
  compensation: [
    { name: 'Compensair', desc: 'Flight compensation', url: 'https://compensair.tpx.gr/MGUDRrY2', icon: '💰' },
    { name: 'AirHelp', desc: 'Get your refund', url: 'https://airhelp.tpx.gr/baeI5YIf', icon: '🛡️' },
  ],
  flight: [{ name: 'Aviasales', desc: 'Search all airlines', url: 'https://aviasales.tpx.gr/yQxrYmk7', icon: '✈️' }],
};

// ============================================
// ADVANCED CACHE MANAGEMENT (Session-scoped with limits)
// ============================================
interface CachedFlightResult {
  flights: FlightResult[] | FlexibleResult[];
  timestamp: number;
  hasDirectFlights?: boolean;
  fallbackUrl?: string;
}

interface SessionCache {
  cache: Map<string, CachedFlightResult>;
  lastAccess: number;
}

const MAX_SESSIONS = 100;
const sessionCaches = new Map<string, SessionCache>();
const CACHE_TTL = 5 * 60 * 1000; // 5 دقائق
const MAX_CACHE_SIZE = 100;

function getSessionCache(sessionId: string): Map<string, CachedFlightResult> {
  // تنظيف الجلسات القديمة إذا تجاوزنا الحد
  if (sessionCaches.size > MAX_SESSIONS) {
    const entries = Array.from(sessionCaches.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
    const toDelete = entries.slice(0, Math.floor(sessionCaches.size / 2));
    for (const [id] of toDelete) {
      sessionCaches.delete(id);
      console.log(`🧹 Session ${id} cache cleaned due to session limit`);
    }
  }
  
  if (!sessionCaches.has(sessionId)) {
    sessionCaches.set(sessionId, {
      cache: new Map(),
      lastAccess: Date.now()
    });
  }
  
  const session = sessionCaches.get(sessionId)!;
  session.lastAccess = Date.now();
  return session.cache;
}

function cleanCacheIfNeeded(sessionId: string): void {
  const session = sessionCaches.get(sessionId);
  if (!session) return;
  
  const cache = session.cache;
  if (cache.size > MAX_CACHE_SIZE) {
    console.log(`🧹 Cache limit reached for session ${sessionId}, cleaning...`);
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL * 2) {
        cache.delete(key);
      }
    }
    if (cache.size > MAX_CACHE_SIZE) {
      const entries = Array.from(cache.entries());
      const toDelete = entries.slice(0, Math.floor(cache.size / 2));
      for (const [key] of toDelete) {
        cache.delete(key);
      }
    }
    session.lastAccess = Date.now();
  }
}

// تنظيف الجلسات القديمة كل ساعة
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of sessionCaches.entries()) {
      if (now - session.lastAccess > 60 * 60 * 1000) {
        sessionCaches.delete(sessionId);
        console.log(`🧹 Session ${sessionId} cache cleaned due to inactivity`);
      }
    }
  }, 60 * 60 * 1000);
}

// ============================================
// MAP FOR FAST LOOKUP
// ============================================
const CITY_TO_IATA_MAP = new Map<string, string>();
for (const [city, iata] of Object.entries(CITY_TO_IATA)) {
  CITY_TO_IATA_MAP.set(city.toLowerCase(), iata);
}
for (const [country, iata] of Object.entries(COUNTRY_TO_MAIN_AIRPORT)) {
  CITY_TO_IATA_MAP.set(country.toLowerCase(), iata);
}

// ============================================
// SMART PARSERS (دعم صيغ متعددة)
// ============================================
function parseDuration(durationStr: string): number {
  if (!durationStr) return 0;
  
  const str = durationStr.toString().trim();
  let totalMinutes = 0;
  
  // صيغ متعددة: 2h30m, 2h 30m, 2h30, 2:30, 2.5h
  const patterns = [
    /(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/i, // 2h 30m
    /(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(\d+(?:\.\d+)?)/i, // 2h30
    /(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/, // 2:30
    /(\d+(?:\.\d+)?)\s*m(?:in(?:utes?)?)?/i, // 30m
    /(\d+(?:\.\d+)?)\s*h(?:ours?)?/i, // 2h
  ];
  
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) {
      if (match[2]) {
        totalMinutes += parseFloat(match[1]) * 60 + parseFloat(match[2]);
      } else {
        if (str.includes('m') || str.includes('min')) {
          totalMinutes += parseFloat(match[1]);
        } else if (str.includes('h') || pattern.toString().includes(':')) {
          totalMinutes += parseFloat(match[1]) * 60;
        } else {
          totalMinutes += parseFloat(match[1]);
        }
      }
      break;
    }
  }
  
  if (totalMinutes === 0 && /^\d+$/.test(str)) {
    totalMinutes = parseInt(str);
  }
  
  return totalMinutes;
}

function parseStops(stopsStr: string): number {
  if (!stopsStr) return 0;
  const str = stopsStr.toString().toLowerCase();
  if (str === 'direct' || str === 'non-stop' || str === 'مباشر') return 0;
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

// ============================================
// NORMALIZED SCORING (Dynamic Weights)
// ============================================
type NormalizedValues = {
  price: number;
  stops: number;
  duration: number;
};

function normalizeValues(flights: FlightResult[]): NormalizedValues[] {
  if (flights.length === 0) return [];
  
  const prices = flights.map(f => f.price);
  const stops = flights.map(f => parseStops(f.stops));
  const durations = flights.map(f => parseDuration(f.duration));
  
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minStops = Math.min(...stops);
  const maxStops = Math.max(...stops);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  
  return flights.map((_, i) => ({
    price: maxPrice === minPrice ? 0 : (prices[i] - minPrice) / (maxPrice - minPrice),
    stops: maxStops === minStops ? 0 : (stops[i] - minStops) / (maxStops - minStops),
    duration: maxDuration === minDuration ? 0 : (durations[i] - minDuration) / (maxDuration - minDuration)
  }));
}

function calculateAdvancedScore(
  normalized: NormalizedValues,
  userPreference: 'cheap' | 'fast' | 'balanced' = 'balanced'
): number {
  const weights = {
    cheap: { price: 0.7, stops: 0.15, duration: 0.15 },
    fast: { price: 0.2, stops: 0.3, duration: 0.5 },
    balanced: { price: 0.4, stops: 0.3, duration: 0.3 }
  };
  
  const w = weights[userPreference];
  return (normalized.price * w.price) + (normalized.stops * w.stops) + (normalized.duration * w.duration);
}

function sortFlightsByScore(flights: FlightResult[], preference: 'cheap' | 'fast' | 'balanced' = 'balanced'): FlightResult[] {
  if (flights.length === 0) return flights;
  
  const normalized = normalizeValues(flights);
  const scored = flights.map((flight, i) => ({
    flight,
    score: calculateAdvancedScore(normalized[i], preference)
  }));
  
  scored.sort((a, b) => a.score - b.score);
  return scored.map(s => s.flight);
}

// ============================================
// AI RESPONSE PARSING (مع Validation قوي)
// ============================================
function validateAndParseAIResponse(fullText: string): {
  success: boolean;
  searchData?: SearchData;
  links?: AffiliateLink[];
  cleanText?: string;
  error?: string;
} {
  try {
    const searchMatch = fullText.match(/<search>([\s\S]*?)<\/search>/);
    const linksMatch = fullText.match(/<links>([\s\S]*?)<\/links>/);
    const cleanText = fullText
      .replace(/<search>[\s\S]*?<\/search>/g, '')
      .replace(/<links>[\s\S]*?<\/links>/g, '')
      .trim();
    
    let searchData: SearchData | undefined;
    let links: AffiliateLink[] | undefined;
    
    if (searchMatch) {
      try {
        const parsed = JSON.parse(searchMatch[1].trim());
        if (parsed.type && ['flight', 'ferry', 'taxi', 'bus'].includes(parsed.type)) {
          searchData = parsed as SearchData;
        } else {
          console.warn('Invalid search data type:', parsed.type);
        }
      } catch (e) {
        console.error('Failed to parse search JSON:', e);
      }
    }
    
    if (linksMatch) {
      try {
        links = JSON.parse(linksMatch[1].trim()) as AffiliateLink[];
      } catch (e) {
        console.error('Failed to parse links JSON:', e);
      }
    }
    
    return {
      success: !!(searchData || links),
      searchData,
      links,
      cleanText: cleanText || undefined
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown parsing error'
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function getCurrency(lang: string): string {
  switch (lang) {
    case 'ar': return 'MAD';
    case 'fr': return 'EUR';
    case 'es': return 'EUR';
    default: return 'USD';
  }
}

function getIATA(text: string): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  return CITY_TO_IATA_MAP.get(lower);
}

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

// ============================================
// DEEP LINK BUILDER
// ============================================
function buildDeepLink(type: string, from: string, to: string, date: string): string {
  const d = date || getDefaultDate();
  const fLower = from.toLowerCase();
  const tLower = to.toLowerCase();

  if (type === 'ferry') {
    const fromCode = PORT_CODES[fLower] || from;
    const toCode = PORT_CODES[tLower] || to;
    return `https://www.balearia.com/en/search-v2?origin=${fromCode}&destination=${toCode}&departure_date=${d}&passengers=1`;
  }
  
  if (type === 'taxi' || type === 'transfer') {
    const formattedDate = d.split('-').reverse().join('.'); 
    return `https://gettransfer.com/en/selection?pickup_text=${encodeURIComponent(from)}&destination_text=${encodeURIComponent(to)}&date=${formattedDate}`;
  }

  if (type === 'bus') {
    return `https://shop.flixbus.com/search?departureCity=${from}&arrivalCity=${to}&rideDate=${d.split('-').reverse().join('.')}`;
  }

  return '';
}

// ============================================
// SYSTEM PROMPT (AI Action Layer)
// ============================================
function getSystemPrompt(lang: string, service: string): string {
  const today = new Date().toISOString().split('T')[0];
  const currency = getCurrency(lang);
  
  return `You are Fastamor, a smart Moroccan travel concierge. Today: ${today}.
Current service: ${service}
Currency for display: ${currency}

IMPORTANT: You MUST respond with a JSON object in the following format. Do NOT add any text before or after the JSON.

Response format:
{
  "action": "search_flights" | "search_ferry" | "search_taxi" | "search_bus" | "show_links",
  "data": { ... },
  "confidence": 0.0-1.0,
  "fallback": "optional message if confidence is low"
}

For search_flights (specific date):
{"action":"search_flights","data":{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"},"confidence":0.95}

For search_flights (flexible dates):
{"action":"search_flights","data":{"type":"flight","origin":"IATA","destination":"IATA","date_from":"YYYY-MM-DD","date_to":"YYYY-MM-DD","flexible":true},"confidence":0.95}

For ferry/taxi/bus:
{"action":"search_ferry","data":{"type":"ferry","from":"city_name","to":"city_name","date":"YYYY-MM-DD"},"confidence":0.95}

For links (hotels, transfers, tours):
{"action":"show_links","data":[{"name":"Service Name","desc":"Description","url":"https://...","icon":"🚕"}],"confidence":0.95}

DATE RANGE RULES:
- "this week" → date_from = today, date_to = today + 7 days
- "this month" → date_from = today, date_to = today + 30 days
- "next month" → date_from = today + 30 days, date_to = today + 60 days
- "any day" → date_from = today, date_to = today + 90 days
- "cheapest" → sort_by = "price"

RESPONSE STYLE: ${lang === 'ar' ? 'Use friendly Moroccan Darija' : 'Be friendly and helpful'}`;
}

// ============================================
// FLIGHT SEARCH FUNCTIONS
// ============================================
async function searchFlights(
  origin: string, 
  destination: string, 
  date: string, 
  sessionId: string
): Promise<{ 
  flights: FlightResult[]; 
  hasDirectFlights: boolean; 
  fallbackUrl: string 
}> {
  const cacheKey = `${origin}-${destination}-${date}`;
  const cache = getSessionCache(sessionId);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL && cached.flights as FlightResult[]) {
    console.log(`✅ Using cached results for ${cacheKey}`);
    return { 
      flights: cached.flights as FlightResult[], 
      hasDirectFlights: cached.hasDirectFlights || false, 
      fallbackUrl: cached.fallbackUrl || `https://aviasales.tpx.gr/yQxrYmk7` 
    };
  }

  try {
    const response = await fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, date }),
    });
    const data = await response.json();
    const result = { 
      flights: data.flights || [], 
      hasDirectFlights: data.has_direct || false, 
      fallbackUrl: data.fallback_url 
    };
    
    cache.set(cacheKey, {
      flights: result.flights,
      hasDirectFlights: result.hasDirectFlights,
      fallbackUrl: result.fallbackUrl,
      timestamp: Date.now()
    });
    
    cleanCacheIfNeeded(sessionId);
    return result;
  } catch (error) {
    console.error('Flight search error:', error);
    return { flights: [], hasDirectFlights: false, fallbackUrl: `https://aviasales.tpx.gr/yQxrYmk7` };
  }
}

async function searchFlexibleFlights(
  origin: string, 
  destination: string, 
  dateFrom: string, 
  dateTo: string,
  sessionId: string
): Promise<FlexibleResult[]> {
  const cacheKey = `flex-${origin}-${destination}-${dateFrom}-${dateTo}`;
  const cache = getSessionCache(sessionId);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✅ Using cached flexible results for ${cacheKey}`);
    return cached.flights as FlexibleResult[];
  }

  try {
    const response = await fetch('/api/flights/search-range', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, date_from: dateFrom, date_to: dateTo }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const results: FlexibleResult[] = data.results;
        results.sort((a, b) => a.cheapest - b.cheapest);
        
        cache.set(cacheKey, {
          flights: results,
          timestamp: Date.now()
        });
        cleanCacheIfNeeded(sessionId);
        return results;
      }
    }
  } catch (e) {
    console.log('Range API not available, falling back to per-day search');
  }

  const dates: string[] = [];
  const currentDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  
  while (currentDate <= endDate && dates.length < 7) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  const results: FlexibleResult[] = await Promise.all(
    dates.map(async (date) => {
      const res = await searchFlights(origin, destination, date, sessionId);
      return { 
        date, 
        flights: res.flights, 
        cheapest: res.flights.length > 0 ? res.flights[0].price : Infinity,
        hasFlights: res.flights.length > 0
      };
    })
  );
  
  results.sort((a, b) => a.cheapest - b.cheapest);
  
  cache.set(cacheKey, {
    flights: results,
    timestamp: Date.now()
  });
  cleanCacheIfNeeded(sessionId);
  
  return results;
}

// ============================================
// PARALLEL LINK CONVERSION
// ============================================
async function convertLinksInParallel(links: AffiliateLink[]): Promise<AffiliateLink[]> {
  const conversionPromises = links.map(async (link) => {
    if (!link.url) return link;
    try {
      const affiliateUrl = await toAffiliateLink(link.url);
      return { ...link, url: affiliateUrl };
    } catch (e) {
      console.error('Failed to convert link:', link.url, e);
      return link;
    }
  });
  return Promise.all(conversionPromises);
}

// ============================================
// ADVANCED ANALYTICS
// ============================================
function trackAdvancedEvent(event: AnalyticsEvent): void {
  console.log('[Analytics]', event);
  
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.type, {
      event_category: event.service,
      event_label: event.type,
      value: event.timestamp,
      ...event.metadata
    });
  }
  
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
    keepalive: true
  }).catch(e => console.error('Analytics error:', e));
}

// ============================================
// HANDLER FUNCTIONS
// ============================================
async function handleTransportFlow(
  action: AIAction,
  lang: string,
  withReply: Message[],
  setDynamicLinks: (links: AffiliateLink[]) => void,
  setHasResults: (value: boolean) => void,
  setStatus: (status: ChatStatus) => void,
  setMessages: (messages: Message[]) => void,
  messagesRef: React.MutableRefObject<Message[]>
): Promise<boolean> {
  const searchData = action.data as SearchData;
  if (!searchData.from || !searchData.to) return false;
  
  const rawUrl = buildDeepLink(searchData.type, searchData.from, searchData.to, searchData.date || '');
  if (!rawUrl) return false;
  
  const affUrl = await toAffiliateLink(rawUrl);
  
  let linkName = 'GetTransfer'; let icon = '🚕';
  if (searchData.type === 'ferry') { linkName = 'Balearia'; icon = '🚢'; }
  if (searchData.type === 'bus') { linkName = 'FlixBus'; icon = '🚌'; }

  setDynamicLinks([{
    name: linkName,
    desc: `${searchData.from} → ${searchData.to}`,
    url: affUrl,
    icon: icon
  }]);
  setHasResults(true);
  setStatus('results');
  trackSearch();

  const confirmMsg = lang === 'ar' 
    ? `✅ هاك الهمزة اللي قلبتي عليها! رابط الحجز المباشر من ${searchData.from} إلى ${searchData.to} 👇`
    : `✅ Here's your direct booking link from ${searchData.from} to ${searchData.to} 👇`;
  
  messagesRef.current = [...withReply, { role: 'assistant', content: confirmMsg }];
  setMessages([...messagesRef.current]);
  return true;
}

async function handleFlexibleFlightFlow(
  action: AIAction,
  lang: string,
  withReply: Message[],
  setFlightResults: (flights: FlightResult[]) => void,
  setHasResults: (value: boolean) => void,
  setStatus: (status: ChatStatus) => void,
  setMessages: (messages: Message[]) => void,
  messagesRef: React.MutableRefObject<Message[]>,
  sessionId: string
): Promise<boolean> {
  const searchData = action.data as SearchData;
  if (!searchData.date_from || !searchData.date_to || !searchData.flexible) return false;
  if (!searchData.origin || !searchData.destination) return false;
  
  const flexibleResults = await searchFlexibleFlights(
    searchData.origin, 
    searchData.destination, 
    searchData.date_from, 
    searchData.date_to,
    sessionId
  );
  
  const bestResult = flexibleResults.find((r: FlexibleResult) => r.hasFlights);
  if (bestResult && bestResult.flights.length > 0) {
    const sortedFlights = sortFlightsByScore(bestResult.flights);
    setFlightResults(sortedFlights);
    setHasResults(true);
    setStatus('results');
    trackSearch();

    const currency = getCurrency(lang);
    const confirmMsg = lang === 'ar'
      ? `✅ لقيت أرخص تذكرة فـ ${bestResult.date} من ${bestResult.cheapest} ${currency} 👇`
      : `✅ Found cheapest ticket on ${bestResult.date} from ${bestResult.cheapest} ${currency} 👇`;
    
    messagesRef.current = [...withReply, { role: 'assistant', content: confirmMsg }];
    setMessages([...messagesRef.current]);
    return true;
  }
  
  const noMsg = lang === 'ar'
    ? `⚠️ ما لقيتش رحلات فهاد الفترة. جرب تاريخ آخر أو شوف البحث المباشر 👇`
    : `⚠️ No flights found in this period. Try another date or search live 👇`;
  messagesRef.current = [...withReply, { role: 'assistant', content: noMsg }];
  setMessages([...messagesRef.current]);
  setStatus('idle');
  return true;
}

async function handleSpecificDateFlightFlow(
  action: AIAction,
  lang: string,
  withReply: Message[],
  setFlightResults: (flights: FlightResult[]) => void,
  setHasResults: (value: boolean) => void,
  setStatus: (status: ChatStatus) => void,
  setDynamicLinks: (links: AffiliateLink[]) => void,
  setMessages: (messages: Message[]) => void,
  messagesRef: React.MutableRefObject<Message[]>,
  sessionId: string
): Promise<boolean> {
  const searchData = action.data as SearchData;
  if (!searchData.date || !searchData.origin || !searchData.destination) return false;
  
  const { flights, hasDirectFlights, fallbackUrl } = await searchFlights(
    searchData.origin, searchData.destination, searchData.date, sessionId
  );

  if (flights.length > 0) {
    const sortedFlights = sortFlightsByScore(flights);
    setFlightResults(sortedFlights);
    setHasResults(true);
    setStatus('results');
    trackSearch();

    const directCount = sortedFlights.filter((f: FlightResult) => f.is_direct).length;
    const cheapest = sortedFlights[0].price;
    const currency = getCurrency(lang);

    let confirmMsg = '';
    if (lang === 'ar') {
      confirmMsg = directCount > 0
        ? `✅ وجدت ${directCount} رحلة مباشرة! أرخصها ${cheapest} ${currency} 👇`
        : `⚠️ لا توجد رحلات مباشرة متاحة. أفضل الخيارات من ${cheapest} ${currency} 👇`;
    } else {
      confirmMsg = directCount > 0
        ? `✅ Found ${directCount} direct flight(s)! From ${cheapest} ${currency} 👇`
        : `⚠️ No direct flights. Best available from ${cheapest} ${currency} 👇`;
    }

    messagesRef.current = [...withReply, { role: 'assistant', content: confirmMsg }];
    setMessages([...messagesRef.current]);
    return true;
  }
  
  const searchUrl = fallbackUrl || `https://www.aviasales.com/search/${searchData.origin}${searchData.destination}1?marker=709105`;
  setDynamicLinks([{
    name: 'Aviasales',
    desc: `${searchData.origin} → ${searchData.destination}`,
    url: searchUrl,
    icon: '✈️'
  }]);
  setHasResults(true);
  setStatus('results');
  const noMsg = lang === 'ar'
    ? `لم أجد رحلات مخزنة. ابحث مباشرة على Aviasales للنتائج الحية 👇`
    : `No cached results. Search live on Aviasales 👇`;
  messagesRef.current = [...withReply, { role: 'assistant', content: noMsg }];
  setMessages([...messagesRef.current]);
  return true;
}

async function handleLinksFlow(
  action: AIAction,
  withReply: Message[],
  setDynamicLinks: (links: AffiliateLink[]) => void,
  setHasResults: (value: boolean) => void,
  setStatus: (status: ChatStatus) => void,
  setMessages: (messages: Message[]) => void,
  messagesRef: React.MutableRefObject<Message[]>
): Promise<void> {
  const links = action.data as AffiliateLink[];
  if (!links || links.length === 0) return;
  
  const convertedLinks = await convertLinksInParallel(links);
  setDynamicLinks(convertedLinks);
  setHasResults(true);
  setStatus('results');
  trackSearch();
}

// ============================================
// MAIN HOOK
// ============================================
export function useFastamorChat(service: string, lang: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>('idle');
  const [hasResults, setHasResults] = useState(false);
  const [dynamicLinks, setDynamicLinks] = useState<AffiliateLink[]>([]);
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    message: '',
    retryCount: 0,
    lastError: undefined
  });
  
  const messagesRef = useRef<Message[]>([]);
  const statusRef = useRef<ChatStatus>(status);
  const isProcessing = useRef(false);
  const messageQueue = useRef<QueuedMessage[]>([]);
  
  // إنشاء session ID فريد للمستخدم
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = sessionStorage.getItem('fastamor_session_id');
      if (!id) {
        id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem('fastamor_session_id', id);
      }
      return id;
    }
    return `server_${Date.now()}`;
  });

  // تحديث statusRef عند تغيير status
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // محولات للتوافق مع الكود القديم
  const isTyping = status === 'typing';
  const showSearchAnim = status === 'searching';

  // معالجة قائمة الانتظار
  const processQueue = useCallback(async () => {
    if (isProcessing.current || messageQueue.current.length === 0) return;
    
    isProcessing.current = true;
    const nextMessage = messageQueue.current.shift();
    
    if (nextMessage) {
      try {
        await sendMessageInternal(nextMessage.content);
      } catch (error) {
        console.error('Failed to process queued message:', error);
        setErrorState(prev => ({
          ...prev,
          hasError: true,
          message: error instanceof Error ? error.message : 'Unknown error',
          lastError: String(error)
        }));
        setStatus('error');
      }
    }
    
    isProcessing.current = false;
    
    if (messageQueue.current.length > 0) {
      setTimeout(() => processQueue(), 100);
    }
  }, []);

  const sendMessageInternal = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const newMsg: Message = { role: 'user', content };
    const updatedHistory = [...messagesRef.current, newMsg];
    messagesRef.current = updatedHistory;
    setMessages([...updatedHistory]);
    setStatus('typing');
    setErrorState(prev => ({ ...prev, hasError: false }));

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: getSystemPrompt(lang, service),
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const fullText: string = data.content?.[0]?.text || '';
      
      let action: AIAction | null = null;
      
      // محاولة parse كـ JSON (AI Action Layer)
      try {
        const parsed = JSON.parse(fullText);
        if (parsed.action && ['search_flights', 'search_ferry', 'search_taxi', 'search_bus', 'show_links'].includes(parsed.action)) {
          action = parsed as AIAction;
        }
      } catch {
        // Fallback: محاولة parse بالطريقة القديمة
        const { searchData, links, cleanText } = validateAndParseAIResponse(fullText);
        
        if (searchData) {
          action = {
            action: `search_${searchData.type}` as AIAction['action'],
            data: searchData,
            confidence: 0.9
          };
        } else if (links) {
          action = {
            action: 'show_links',
            data: links,
            confidence: 0.9
          };
        } else if (cleanText) {
          const withReply = [...updatedHistory, { role: 'assistant', content: cleanText }];
          messagesRef.current = withReply;
          setMessages([...withReply]);
          setStatus('idle');
          return;
        }
      }
      
      if (!action) {
        throw new Error('Failed to parse AI response');
      }
      
      trackAdvancedEvent({
        type: 'ai_response',
        service: action.action,
        timestamp: Date.now(),
        metadata: { confidence: action.confidence }
      });
      
      const withReply = [...updatedHistory, { role: 'assistant', content: '' }];
      setStatus('searching');
      
      let handled = false;
      
      switch (action.action) {
        case 'search_flights':
          const searchData = action.data as SearchData;
          if (!searchData.date && !searchData.date_from) {
            searchData.date = getDefaultDate();
          }
          
          if (searchData.date_from && searchData.date_to && searchData.flexible) {
            handled = await handleFlexibleFlightFlow(
              action, lang, withReply,
              setFlightResults, setHasResults, setStatus,
              setMessages, messagesRef, sessionId
            );
          } else if (searchData.date) {
            handled = await handleSpecificDateFlightFlow(
              action, lang, withReply,
              setFlightResults, setHasResults, setStatus,
              setDynamicLinks, setMessages, messagesRef, sessionId
            );
          }
          break;
          
        case 'search_ferry':
        case 'search_taxi':
        case 'search_bus':
          handled = await handleTransportFlow(
            action, lang, withReply,
            setDynamicLinks, setHasResults, setStatus,
            setMessages, messagesRef
          );
          break;
          
        case 'show_links':
          await handleLinksFlow(
            action, withReply,
            setDynamicLinks, setHasResults, setStatus,
            setMessages, messagesRef
          );
          handled = true;
          break;
      }
      
      if (!handled) {
        setStatus('idle');
      }
      
    } catch (err) {
      console.error('SendMessage error:', err);
      setErrorState(prev => ({
        ...prev,
        hasError: true,
        message: err instanceof Error ? err.message : 'Unknown error',
        lastError: String(err)
      }));
      setStatus('error');
      
      const errMsg = lang === 'ar' 
        ? 'عذراً، مشكلة في الاتصال ولد البلاد. حاول مرة أخرى! 🔄'
        : 'Sorry, something went wrong. Please try again! 🔄';
      
      messagesRef.current = [...messagesRef.current, { role: 'assistant', content: errMsg }];
      setMessages([...messagesRef.current]);
    }
  }, [lang, service, sessionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    if (statusRef.current !== 'idle' || isProcessing.current) {
      messageQueue.current.push({
        id: `${Date.now()}_${Math.random()}`,
        content,
        timestamp: Date.now()
      });
      return;
    }
    
    await processQueue();
    await sendMessageInternal(content);
  }, [processQueue, sendMessageInternal]);

  const retryLastMessage = useCallback(async () => {
    if (messagesRef.current.length > 0) {
      const lastUserMessage = [...messagesRef.current].reverse().find(m => m.role === 'user');
      if (lastUserMessage) {
        setErrorState(prev => ({ ...prev, hasError: false, retryCount: prev.retryCount + 1 }));
        await sendMessage(lastUserMessage.content);
      }
    }
  }, [sendMessage]);

  const clearChat = useCallback((greeting?: string) => {
    const initial: Message[] = greeting ? [{ role: 'assistant', content: greeting }] : [];
    messagesRef.current = initial;
    setMessages([...initial]);
    setFlightResults([]);
    setDynamicLinks([]);
    setHasResults(false);
    setStatus('idle');
    setErrorState({ hasError: false, message: '', retryCount: 0, lastError: undefined });
    messageQueue.current = [];
    isProcessing.current = false;
  }, []);

  return { 
    messages, 
    isTyping, 
    showSearchAnim, 
    hasResults, 
    dynamicLinks, 
    flightResults, 
    sendMessage,
    clearChat,
    retryLastMessage,
    errorState,
    status
  };
}

// ============================================
// SERVICE DETECTION
// ============================================
export function detectServiceType(text: string): string {
  const l = text.toLowerCase();
  
  if (/car_rental|rental|كراء سيارة|rent a car|localrent|سيارة كراء/.test(l)) return 'car_rental';
  if (/ferry|باخرة|عبارة|شقف|بابور|فيري|مركب|عبّارة/.test(l)) return 'ferry';
  if (/taxi|transfer|تاكسي|نقل|transfert|traslado|طوموبيل|لوکاسيون|vito|grand taxi/.test(l)) return 'taxi';
  if (/bus|coach|حافلة|بركاصة|ستيام|كار|فلوكس|بوس|اتوبيس/.test(l)) return 'bus';
  if (/cruise|كروز|رحلة بحرية|سياحة بحرية/.test(l)) return 'cruise';
  if (/hotel|فندق|لوطيل|بلاصا|فين نبيت|اقامة|ريزور/.test(l)) return 'hotel';
  if (/tour|experience|جولة|تجربة|زيارة|معلم|متحف|سياحة/.test(l)) return 'experience';
  if (/esim|sim|بيانات|انترنت|نت|واي فاي/.test(l)) return 'esim';
  if (/delay|cancel|تعويض|تأخير|إلغاء|استرجاع|تعويضات/.test(l)) return 'compensation';
  return 'flight';
}

export const detectService = detectServiceType;