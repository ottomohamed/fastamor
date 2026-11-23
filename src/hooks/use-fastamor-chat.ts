import { useState, useCallback, useRef } from 'react';
import { trackSearch } from '@/lib/tracking';
import { toAffiliateLink } from '@/lib/convertLinks';
import { buildFerryBookingLink, isValidRoute, formatFerrySummary } from '@/lib/ferryBooking';
import { findPort, autoCorrectPortName } from '@/lib/ferryPorts';

export type Message = { role: 'user' | 'assistant'; content: string; };
export type AffiliateLink = { name: string; desc: string; url: string; icon: string; };
/** name: as the user wrote it (for display); city: English city name (for partner searches). */
export type TripDest = { name: string; city: string };
export type FlightResult = {
  id: string; airline: string; airline_logo: string;
  origin: string; destination: string; departure_time: string;
  duration: string; stops: string; price: number; currency: string;
  booking_url: string; gate: string; is_direct?: boolean;
};

const PORT_CODES: Record<string, string> = {
  "tangier": "TNG",
  "tanger med": "TNM",
  "tanger ville": "TAV",
  "nador": "NDR",
  "algeciras": "ALG",
  "malaga": "MLG",
  "almeria": "ALM",
  "barcelona": "BCN",
  "tarifa": "TAR",
  "ceuta": "CEU",
  "motril": "MOT",
  "gran canaria": "LPA",
  "las palmas": "LPA",
  "tenerife": "TFS",
  "marseille": "MRS",
  "sete": "SET",
  "genoa": "GOA",
  "naples": "NAP",
  "tunis": "TUN",
  "la goulette": "LAG",
  "oran": "ORN",
  "algiers": "ALG",
};

// City codes (all airports of a city) give the fare API the most results.
const CITY_TO_IATA: Record<string, string> = {
  "paris": "PAR", "باريس": "PAR", "london": "LON", "لندن": "LON", "brussels": "BRU", "bruxelles": "BRU", "بروكسل": "BRU",
  "amsterdam": "AMS", "أمستردام": "AMS", "madrid": "MAD", "مدريد": "MAD", "barcelona": "BCN", "barcelone": "BCN", "برشلونة": "BCN",
  "marseille": "MRS", "مرسيليا": "MRS", "lyon": "LYS", "ليون": "LYS", "nice": "NCE", "toulouse": "TLS", "dusseldorf": "DUS", "düsseldorf": "DUS", "دوسلدورف": "DUS",
  "frankfurt": "FRA", "milan": "MIL", "ميلانو": "MIL", "rome": "ROM", "روما": "ROM", "malaga": "AGP", "seville": "SVQ", "sevilla": "SVQ",
  "casablanca": "CMN", "الدار البيضاء": "CMN", "marrakech": "RAK", "مراكش": "RAK", "agadir": "AGA", "أكادير": "AGA", "nador": "NDR", "الناظور": "NDR",
  "oujda": "OUD", "وجدة": "OUD", "tangier": "TNG", "tanger": "TNG", "طنجة": "TNG", "fes": "FEZ", "fès": "FEZ", "فاس": "FEZ", "rabat": "RBA", "الرباط": "RBA",
  "dakhla": "VIL", "الداخلة": "VIL", "essaouira": "ESU", "الصويرة": "ESU", "ouarzazate": "OZZ", "ورزازات": "OZZ", "al hoceima": "AHU", "الحسيمة": "AHU", "tetouan": "TTU", "تطوان": "TTU",
  "dubai": "DXB", "دبي": "DXB", "istanbul": "IST", "إسطنبول": "IST", "اسطنبول": "IST", "cairo": "CAI", "القاهرة": "CAI", "jeddah": "JED", "جدة": "JED",
  "riyadh": "RUH", "الرياض": "RUH", "doha": "DOH", "الدوحة": "DOH", "tunis": "TUN", "تونس": "TUN", "algiers": "ALG", "الجزائر": "ALG",
  "abu dhabi": "AUH", "أبوظبي": "AUH", "muscat": "MCT", "kuwait": "KWI", "bahrain": "BAH", "beirut": "BEY", "amman": "AMM", "new york": "NYC", "tokyo": "TYO",
};

const SERVICE_LINKS: Record<string, AffiliateLink[]> = {
  hotel: [{ name: "Booking.com", desc: "Search hotels and apartments", url: "https://www.booking.com/", icon: "" }],
  taxi: [
    { name: "Kiwitaxi", desc: "Pre-booked airport transfers", url: "https://kiwitaxi.tpx.gr/Y6yrFeYN", icon: "" },
    { name: "Welcome Pickups", desc: "Airport pickup with a local driver", url: "https://tpx.gr/n6krgEY3", icon: "" },
    { name: "Economybookings", desc: "Compare car hire", url: "https://economybookings.tpx.gr/ONZ6dOjM", icon: "" },
  ],
  experience: [
    { name: "Klook", desc: "Tours & experiences", url: "https://klook.tpx.gr/vRUzaJbI", icon: "" },
    { name: "Tiqets", desc: "Museums & attractions", url: "https://tiqets.tpx.gr/ot4HK9Pf", icon: "" },
  ],
  bus: [{ name: "Intui", desc: "Transfers from the station or airport", url: "https://intui.tpx.gr/kguAoKIU", icon: "" }],
  ferry: [
    { name: "DirectFerries", desc: "Spain/France/Italy  Morocco", url: "https://www.directferries.com", icon: "" },
    { name: "Balearia", desc: "Spain  Morocco ferries", url: "https://www.balearia.com", icon: "" },
  ],
  cruise: [{ name: "Klook", desc: "Boat trips and day cruises", url: "https://klook.tpx.gr/vRUzaJbI", icon: "" }],
  esim: [{ name: "Yesim", desc: "eSIM for travelers", url: "https://yesim.tpx.gr/9gzdax7m", icon: "" }],
  compensation: [
    { name: "Compensair", desc: "Flight compensation", url: "https://compensair.tpx.gr/MGUDRrY2", icon: "" },
    { name: "AirHelp", desc: "Get your refund", url: "https://airhelp.tpx.gr/baeI5YIf", icon: "" },
  ],
  flight: [{ name: "Aviasales", desc: "Search all airlines", url: "https://aviasales.tpx.gr/yQxrYmk7", icon: "" }],
};

const AIRPORT_TO_CITY: Record<string, string> = { CDG: "PAR", ORY: "PAR", BVA: "PAR", LHR: "LON", LGW: "LON", STN: "LON", CRL: "BRU", JFK: "NYC", NRT: "TYO", FCO: "ROM", MXP: "MIL", BGY: "MIL", SAW: "IST" };

function getIATA(text: string): string | undefined {
  if (!text) return undefined;
  const up = text.trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(up)) return AIRPORT_TO_CITY[up] || up;
  const lower = text.toLowerCase().trim();
  for (const [city, iata] of Object.entries(CITY_TO_IATA)) {
    if (lower.includes(city)) return iata;
  }
  return undefined;
}

/** English city name for a city/airport code, from the first Latin-script entry in CITY_TO_IATA. */
function cityFromCode(code?: string): string | undefined {
  if (!code) return undefined;
  const c = AIRPORT_TO_CITY[code] || code;
  for (const [city, iata] of Object.entries(CITY_TO_IATA)) {
    if (iata === c && /^[a-z .'-]+$/.test(city)) return city.replace(/\b\w/g, ch => ch.toUpperCase());
  }
  return undefined;
}

function getDefaultDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

function buildFerryLink(from: string, to: string, date: string): string {
  const correctedFrom = autoCorrectPortName(from);
  const correctedTo = autoCorrectPortName(to);
  const encodedFrom = encodeURIComponent(correctedFrom);
  const encodedTo = encodeURIComponent(correctedTo);
  return `https://www.balearia.com/es/web/balearia-booking/funnel?origin=${encodedFrom}&destination=${encodedTo}`;
}


export function useFastamorChat(service: string, lang: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchAnim, setShowSearchAnim] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [dynamicLinks, setDynamicLinks] = useState<AffiliateLink[]>([]);
  const [flightResults, setFlightResults] = useState<FlightResult[]>([]);
  // Destination of the current trip, used by the trip kit (hotel, eSIM, transfer, tours).
  const [tripDest, setTripDest] = useState<TripDest | null>(null);
  const messagesRef = useRef<Message[]>([]);

  const searchFlights = async (origin: string, destination: string, date: string) => {
    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, date }),
      });
      const data = await response.json();
      return { flights: data.flights || [], hasDirectFlights: data.has_direct || false, fallbackUrl: data.fallback_url };
    } catch {
      return { flights: [], hasDirectFlights: false, fallbackUrl: "https://aviasales.tpx.gr/yQxrYmk7" };
    }
  };

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const newMsg: Message = { role: "user", content };
    const updatedHistory = [...messagesRef.current, newMsg];
    messagesRef.current = updatedHistory;
    setMessages([...updatedHistory]);
    setIsTyping(true);
    setShowSearchAnim(true);

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          service,
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const fullText: string = data.content?.[0]?.text || "";
      const searchMatch = fullText.match(/<search>([\s\S]*?)<\/search>/);
      const linksMatch = fullText.match(/<links>([\s\S]*?)<\/links>/);
      const cleanText = fullText.replace(/<search>[\s\S]*?<\/search>/g, "").replace(/<links>[\s\S]*?<\/links>/g, "").trim();

      const withReply = [...updatedHistory, { role: "assistant" as const, content: cleanText || "..." }];
      messagesRef.current = withReply;
      setMessages([...withReply]);
      setIsTyping(false);
      setShowSearchAnim(false);

      if (searchMatch) {
        try {
          const searchData = JSON.parse(searchMatch[1].trim());

          if (searchData.type === "ferry") {
            const rawUrl = buildFerryLink(searchData.from, searchData.to, searchData.date);
            if (rawUrl) {
              const affUrl = await toAffiliateLink(rawUrl);
              setDynamicLinks([{ name: "Balearia", desc: `${searchData.from} → ${searchData.to}`, url: affUrl, icon: "⛴️" }]);
              setHasResults(true);
              trackSearch();
              const confirmMsg = lang === "ar" ? "⛴️ هاك رابط الحجز المباشر للباخرة" : "⛴️ Here is your ferry booking link";
              messagesRef.current = [...withReply, { role: "assistant", content: confirmMsg }];
              setMessages([...messagesRef.current]);
              return;
            }
          }

          // ✅ البحث عن الحافلات مع Deep Link المباشر
          if (searchData.type === "bus") {
            const origin = encodeURIComponent(searchData.origin);
            const destination = encodeURIComponent(searchData.destination);
            const date = searchData.date || getDefaultDate();
            
            // رابط FlixBus مع معلمات البحث المباشرة
            const directUrl = `https://www.flixbus.com/search?departureCity=${origin}&arrivalCity=${destination}&rideDate=${date}&adult=1`;
            
            // تحويل إلى رابط عمولة
            const affiliateUrl = await toAffiliateLink(directUrl);
            
            console.log("Bus search URL:", affiliateUrl);
            
            setDynamicLinks([{ 
              name: "FlixBus", 
              desc: `${searchData.origin} → ${searchData.destination} • ${date}`, 
              url: affiliateUrl, 
              icon: "🚌" 
            }]);
            
            setHasResults(true);
            trackSearch();
            
            const confirmMsg = lang === "ar" 
              ? `🚌 وجدت لك رحلات حافلات من ${searchData.origin} إلى ${searchData.destination} في ${date}\nاضغط على الرابط أدناه للحجز المباشر`
              : `🚌 Found bus trips from ${searchData.origin} to ${searchData.destination} on ${date}\nClick the link below to book directly`;
            
            messagesRef.current = [...messagesRef.current, { role: "assistant", content: confirmMsg }];
            setMessages([...messagesRef.current]);
            return;
          }

          if (searchData.type === "flight") {
            const rawDest = String(searchData.destination || '').trim();
            if (searchData.origin) { const i = getIATA(searchData.origin); if (i) searchData.origin = i; }
            if (searchData.destination) { const i = getIATA(searchData.destination); if (i) searchData.destination = i; }
            if (!searchData.date) searchData.date = getDefaultDate();

            if (searchData.origin && searchData.destination) {
              setShowSearchAnim(true);
              const { flights, hasDirectFlights, fallbackUrl } = await searchFlights(searchData.origin, searchData.destination, searchData.date);
              setShowSearchAnim(false);

              if (rawDest) setTripDest({ name: rawDest, city: cityFromCode(searchData.destination) || rawDest });
              if (flights.length > 0) {
                setFlightResults(flights);
                setHasResults(true);
                trackSearch();
                const cheapest = flights[0].price;
                const confirmMsg = lang === "ar" ? `✈️ وجدت رحلات أرخصها ${cheapest}$` : `✈️ Found flights from ${cheapest}$`;
                messagesRef.current = [...withReply, { role: "assistant", content: confirmMsg }];
                setMessages([...messagesRef.current]);
              } else {
                const searchUrl = fallbackUrl || `https://www.aviasales.com/search/${searchData.origin}${searchData.destination}1?marker=709105`;
                setDynamicLinks([{ name: "Aviasales", desc: `${searchData.origin} → ${searchData.destination}`, url: searchUrl, icon: "✈️" }]);
                setHasResults(true);
                const noMsg = lang === "ar" ? "لم أجد رحلات مخزنة، ابحث مباشرة هنا" : "No cached results, search live here";
                messagesRef.current = [...withReply, { role: "assistant", content: noMsg }];
                setMessages([...messagesRef.current]);
              }
            }
          }
        } catch (e) { console.error("Parse error:", e); }
      }

      // ✅ معالجة الروابط (Links Processing) - للخدمات الأخرى
      if (linksMatch) {
        try {
          const links = JSON.parse(linksMatch[1].trim());
          // معالجة الروابط لتحويلها إلى Affiliate Links بشكل حي
          const processedLinks = await Promise.all(links.map(async (link: any) => ({
            ...link,
            url: await toAffiliateLink(link.url)
          })));
          setDynamicLinks(processedLinks);
          setHasResults(true);
          trackSearch();
        } catch (e) { console.error("Links parsing error:", e); }
      }

      if (!searchMatch && !linksMatch && service && service !== "flight") {
        const links = SERVICE_LINKS[service];
        if (links) {
          for (const link of links) {
            if (link.url) link.url = await toAffiliateLink(link.url);
          }
          setDynamicLinks(links);
          setHasResults(true);
        }
      }

    } catch (err) {
      console.error("SendMessage error:", err);
      setIsTyping(false);
      setShowSearchAnim(false);
      const errMsg = lang === "ar" ? "عذراً، مشكلة في الاتصال. الرجاء المحاولة مرة أخرى" : "Connection issue. Please try again.";
      messagesRef.current = [...messagesRef.current, { role: "assistant", content: errMsg }];
      setMessages([...messagesRef.current]);
    }
  }, [isTyping, service, lang]);

  const clearChat = useCallback((greeting?: string) => {
    const initial: Message[] = greeting ? [{ role: "assistant", content: greeting }] : [];
    messagesRef.current = initial;
    setMessages([...initial]);
    setFlightResults([]);
    setHasResults(false);
    setDynamicLinks([]);
    setTripDest(null);
  }, []);

  return { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, flightResults, tripDest, sendMessage, clearChat };
}

export function detectService(text: string): string {
  const l = text.toLowerCase();
  if (/ferry|bakhra|عبارة/.test(l)) return "ferry";
  if (/cruise|كروز/.test(l)) return "cruise";
  if (/bus|autobus|باص|حافلة/.test(l)) return "bus";
  if (/hotel|فندق/.test(l)) return "hotel";
  if (/taxi|transfer|تاكسي/.test(l)) return "taxi";
  if (/tour|experience|جولة|رحلة سياحية/.test(l)) return "experience";
  if (/esim|شريحة/.test(l)) return "esim";
  if (/delay|cancel|تأخير|إلغاء/.test(l)) return "compensation";
  return "flight";
}