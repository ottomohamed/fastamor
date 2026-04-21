import { useState, useCallback, useRef } from 'react';
import { trackSearch } from '@/lib/tracking';
import { toAffiliateLink } from '@/lib/convertLinks';
import { buildFerryBookingLink, isValidRoute, formatFerrySummary } from '@/lib/ferryBooking';
import { findPort, autoCorrectPortName } from '@/lib/ferryPorts';

export type Message = { role: 'user' | 'assistant'; content: string; };
export type AffiliateLink = { name: string; desc: string; url: string; icon: string; };
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

const CITY_TO_IATA: Record<string, string> = {
  "dubai": "DXB", "paris": "CDG", "london": "LHR", "cairo": "CAI", "riyadh": "RUH",
  "jeddah": "JED", "doha": "DOH", "istanbul": "IST", "new york": "JFK", "tokyo": "NRT",
  "rabat": "RBA", "casablanca": "CMN", "marrakech": "RAK", "tunis": "TUN",
  "algiers": "ALG", "beirut": "BEY", "amman": "AMM", "abu dhabi": "AUH", "muscat": "MCT",
  "kuwait": "KWI", "bahrain": "BAH", "baghdad": "BGW", "tangier": "TNG",
  "madrid": "MAD", "barcelona": "BCN", "rome": "FCO", "seville": "SVQ",
};

const SERVICE_LINKS: Record<string, AffiliateLink[]> = {
  hotel: [{ name: "Intui Travel", desc: "Best hotel deals worldwide", url: "https://intui.tpx.gr/kguAoKIU", icon: "" }],
  taxi: [
    { name: "GetTransfer", desc: "Airport & city transfers", url: "https://gettransfer.tpx.gr/9poAnD5l", icon: "" },
    { name: "Kiwi Taxi", desc: "Reliable taxi service", url: "https://kiwitaxi.tpx.gr/Y6yrFeYN", icon: "" },
    { name: "LocalRent", desc: "Car rental", url: "https://localrent.tpx.gr/qr92Puo9", icon: "" },
  ],
  experience: [
    { name: "Klook", desc: "Tours & experiences", url: "https://klook.tpx.gr/vRUzaJbI", icon: "" },
    { name: "Tiqets", desc: "Museums & attractions", url: "https://tiqets.tpx.gr/ot4HK9Pf", icon: "" },
  ],
  bus: [{ name: "FlixBus", desc: "Bus tickets across Europe", url: "https://tpx.gr/n6krgEY3", icon: "" }],
  ferry: [
    { name: "DirectFerries", desc: "Spain/France/Italy  Morocco", url: "https://www.directferries.com", icon: "" },
    { name: "Balearia", desc: "Spain  Morocco ferries", url: "https://www.balearia.com", icon: "" },
  ],
  cruise: [{ name: "Sea Radar", desc: "Cruise deals worldwide", url: "https://searadar.tpx.gr/WC89iS5m", icon: "" }],
  esim: [{ name: "Yesim", desc: "eSIM for travelers", url: "https://yesim.tpx.gr/9gzdax7m", icon: "" }],
  compensation: [
    { name: "Compensair", desc: "Flight compensation", url: "https://compensair.tpx.gr/MGUDRrY2", icon: "" },
    { name: "AirHelp", desc: "Get your refund", url: "https://airhelp.tpx.gr/baeI5YIf", icon: "" },
  ],
  flight: [{ name: "Aviasales", desc: "Search all airlines", url: "https://aviasales.tpx.gr/yQxrYmk7", icon: "" }],
};

function getIATA(text: string): string | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase().trim();
  for (const [city, iata] of Object.entries(CITY_TO_IATA)) {
    if (lower.includes(city)) return iata;
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

function getSystemPrompt(lang: string, service: string): string {
  const today = new Date().toISOString().split("T")[0];
  const langRule = lang === "ar" ? "Respond in Arabic." : lang === "fr" ? "Respond in French." : lang === "es" ? "Respond in Spanish." : "Respond in English.";

  return `You are Fastamor, a smart travel concierge. Today: ${today}.
${langRule}
Current service: ${service}

FLIGHT SEARCH RULES:
- Extract origin + destination + date from user message
- Output: <search>{"type":"flight","origin":"IATA","destination":"IATA","date":"YYYY-MM-DD"}</search>

FERRIES SEARCH RULES:
- Extract from + to + date from user message
- Output: <search>{"type":"ferry","from":"city","to":"city","date":"YYYY-MM-DD"}</search>

HOTEL SEARCH: output <links>[{"name":"Intui Travel","url":"https://intui.tpx.gr/kguAoKIU","icon":""}]</links>
TRANSFER: output <links>[{"name":"GetTransfer","url":"https://gettransfer.tpx.gr/9poAnD5l","icon":""}]</links>
TOURS: output <links>[{"name":"Klook","url":"https://klook.tpx.gr/vRUzaJbI","icon":""}]</links>
BUS: output <links>[{"name":"FlixBus","url":"https://tpx.gr/n6krgEY3","icon":""}]</links>
FERRIES: output <links>[{"name":"Balearia","url":"https://www.balearia.com","icon":""}]</links>`;
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
          model: "claude-haiku-4-5-20251001",
          max_tokens: 512,
          system: getSystemPrompt(lang, service),
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
              setDynamicLinks([{ name: "Balearia", desc: `${searchData.from}  ${searchData.to}`, url: affUrl, icon: "" }]);
              setHasResults(true);
              trackSearch();
              const confirmMsg = lang === "ar" ? " هاك رابط الحجز المباشر للباخرة" : " Here is your ferry booking link";
              messagesRef.current = [...withReply, { role: "assistant", content: confirmMsg }];
              setMessages([...messagesRef.current]);
              return;
            }
          }

          if (searchData.type === "flight") {
            if (searchData.origin) { const i = getIATA(searchData.origin); if (i) searchData.origin = i; }
            if (searchData.destination) { const i = getIATA(searchData.destination); if (i) searchData.destination = i; }
            if (!searchData.date) searchData.date = getDefaultDate();

            if (searchData.origin && searchData.destination) {
              setShowSearchAnim(true);
              const { flights, hasDirectFlights, fallbackUrl } = await searchFlights(searchData.origin, searchData.destination, searchData.date);
              setShowSearchAnim(false);

              if (flights.length > 0) {
                setFlightResults(flights);
                setHasResults(true);
                trackSearch();
                const cheapest = flights[0].price;
                const confirmMsg = lang === "ar" ? ` وجدت رحلات أرخصها ${cheapest}$ ` : ` Found flights from ${cheapest}$ `;
                messagesRef.current = [...withReply, { role: "assistant", content: confirmMsg }];
                setMessages([...messagesRef.current]);
              } else {
                const searchUrl = fallbackUrl || `https://www.aviasales.com/search/${searchData.origin}${searchData.destination}1?marker=709105`;
                setDynamicLinks([{ name: "Aviasales", desc: `${searchData.origin}  ${searchData.destination}`, url: searchUrl, icon: "" }]);
                setHasResults(true);
                const noMsg = lang === "ar" ? "لم أجد رحلات مخزنة، ابحث مباشرة هنا " : "No cached results, search live here ";
                messagesRef.current = [...withReply, { role: "assistant", content: noMsg }];
                setMessages([...messagesRef.current]);
              }
            }
          }
        } catch (e) { console.error("Parse error:", e); }
      }

      if (linksMatch) {
        try {
          const links = JSON.parse(linksMatch[1].trim());
          for (const link of links) {
            if (link.url) link.url = await toAffiliateLink(link.url);
          }
          setDynamicLinks(links);
          setHasResults(true);
          trackSearch();
        } catch { }
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
      const errMsg = lang === "ar" ? "عذراً، مشكلة في الاتصال. " : "Connection issue. Please try again. ";
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
  }, []);

  return { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, flightResults, sendMessage, clearChat };
}

export function detectService(text: string): string {
  const l = text.toLowerCase();
  if (/ferry|bakhra/.test(l)) return "ferry";
  if (/cruise/.test(l)) return "cruise";
  if (/bus/.test(l)) return "bus";
  if (/hotel/.test(l)) return "hotel";
  if (/taxi|transfer/.test(l)) return "taxi";
  if (/tour|experience/.test(l)) return "experience";
  if (/esim/.test(l)) return "esim";
  if (/delay|cancel/.test(l)) return "compensation";
  return "flight";
}
