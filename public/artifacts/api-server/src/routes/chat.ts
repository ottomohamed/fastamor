import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "ioredis";

// 📦 استيراد جميع قواعد البيانات
import { searchHotels, formatHotelResponse, AVAILABLE_CITIES } from '../data/hotels-db';
import { findReadyResponse, detectLanguage } from '../data/ready-responses';
import { findFAQ, getCurrentOffers, formatSeasonalOffer } from '../data/travel-data';
import { findDestination, formatDestinationInfo, findAirline, formatAirlineBaggage } from '../data/destinations';
import { findAgenciesForRoute, getArabicSpeakingAgencies } from '../data/agencies';

// 📦 استيراد محرك التحليل الذكي الجديد
import { travelParser, TravelResult } from '../utils/travel-parser';

const router: IRouter = Router();

// ═══════════════════════════════════════════════════════
// 1️⃣ CACHE LAYER
// ═══════════════════════════════════════════════════════
let redis: Redis | null = null;
try {
  redis = new Redis({ host: process.env.REDIS_HOST || 'localhost', lazyConnect: true });
} catch {
  console.log("⚠️ Redis not available, running without cache");
}

async function getCachedOrFetch<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
  if (!redis) return fetcher();
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
    const fresh = await fetcher();
    await redis.setex(key, ttl, JSON.stringify(fresh));
    return fresh;
  } catch {
    return fetcher();
  }
}

// ═══════════════════════════════════════════════════════
// 2️⃣ TRAVELPAYOUTS API
// ═══════════════════════════════════════════════════════
const TP_TOKEN = process.env.TRAVELPAYOUTS_TOKEN || "517b9f43b0fa448681c25b90fda7cf73";
const TP_MARKER = process.env.TRAVELPAYOUTS_MARKER || "709105";

async function searchFlights(origin: string, destination: string, departDate: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = new URL("https://api.travelpayouts.com/v1/prices/cheap");
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("depart_date", departDate);
    url.searchParams.set("token", TP_TOKEN);
    url.searchParams.set("currency", "USD");

    const r = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeout);

    if (!r.ok) return null;
    const data = await r.json();
    if (!data.success || !data.data) return null;

    const destData = data.data[Object.keys(data.data)[0]] || {};
    const flights: any[] = [];

    Object.entries(destData).forEach(([airline, info]: [string, any]) => {
      flights.push({
        airline,
        price: info.price,
        depart_date: info.depart_date,
        booking_url: `https://www.aviasales.com/search/${origin}${(info.depart_date || "").replace(/-/g, "").slice(4, 8)}${destination}1?marker=${TP_MARKER}`
      });
    });

    return flights.sort((a, b) => a.price - b.price).slice(0, 5);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════
// 3️⃣ AFFILIATE LINKS BUILDER
// ═══════════════════════════════════════════════════════
function buildAffiliateLinks(origin: string, dest: string, departDate: string, returnDate = "", adults = "1") {
  const links: { name: string; desc: string; url: string; icon: string }[] = [];
  const d = departDate.replace(/-/g, "");
  const ddmm = d.slice(6, 8) + d.slice(4, 6);

  links.push({
    name: "Aviasales",
    desc: `${origin} → ${dest} · ${departDate}`,
    url: `https://www.aviasales.com/search/${origin}${ddmm}${dest}${adults}?marker=${TP_MARKER}`,
    icon: "✈️"
  });

  links.push({
    name: "Expedia",
    desc: "Flights + Hotels",
    url: `https://www.expedia.com/Flights-Search?leg1=from:${origin},to:${dest},departure:${departDate}TANYT&passengers=adults:${adults}`,
    icon: "🌍"
  });

  links.push({
    name: "Booking.com",
    desc: `Hotels in ${dest}`,
    url: `https://www.booking.com/searchresults.html?ss=${dest}&checkin=${departDate}&checkout=${departDate}&group_adults=${adults}`,
    icon: "🏨"
  });

  return links;
}

// ═══════════════════════════════════════════════════════
// 4️⃣ RESPONSE TEMPLATES
// ═══════════════════════════════════════════════════════
const TEMPLATES = {
  en: {
    greeting: "Hi! I'm Fastamor AI ✈️ Where would you like to travel?",
    found: (o: string, d: string, date: string) => `✨ Found flights from ${o} to ${d} on ${date}!`,
    needMore: "Please tell me your departure city and destination 🌍",
    noResults: "Here are the best options I found for you 👇",
    thinking: "Searching for the best deals... 🔍",
    hotels: "🏨 Hotels I found for you:",
  },
  ar: {
    greeting: "مرحباً! أنا Fastamor AI ✈️ إلى أين تريد السفر؟",
    found: (o: string, d: string, date: string) => `✨ وجدت رحلات من ${o} إلى ${d} بتاريخ ${date}!`,
    needMore: "الرجاء إخباري بمدينة المغادرة والوجهة 🌍",
    noResults: "إليك أفضل الخيارات التي وجدتها 👇",
    thinking: "أبحث عن أفضل العروض... 🔍",
    hotels: "🏨 الفنادق التي وجدتها:",
  },
  fr: {
    greeting: "Bonjour! Je suis Fastamor AI ✈️ Où souhaitez-vous voyager?",
    found: (o: string, d: string, date: string) => `✨ J'ai trouvé des vols de ${o} à ${d} le ${date}!`,
    needMore: "Veuillez me dire votre ville de départ et destination 🌍",
    noResults: "Voici les meilleures options que j'ai trouvées 👇",
    thinking: "Je cherche les meilleures offres... 🔍",
    hotels: "🏨 Hôtels trouvés pour vous:",
  },
  es: {
    greeting: "¡Hola! Soy Fastamor AI ✈️ ¿A dónde quieres viajar?",
    found: (o: string, d: string, date: string) => `✨ ¡Encontré vuelos de ${o} a ${d} el ${date}!`,
    needMore: "Por favor dime tu ciudad de origen y destino 🌍",
    noResults: "Aquí están las mejores opciones que encontré 👇",
    thinking: "Buscando las mejores ofertas... 🔍",
    hotels: "🏨 Hoteles encontrados para ti:",
  },
};

// ═══════════════════════════════════════════════════════
// 5️⃣ MAIN ENDPOINT - باستخدام travelParser
// ═══════════════════════════════════════════════════════
router.post("/chat", async (req, res) => {
  try {
    const { messages = [], service = "flight" } = req.body;
    const lastMsg = messages[messages.length - 1]?.content || "";

    // ✅ كشف اللغة تلقائياً
    const detectedLang = detectLanguage(lastMsg);
    const lang = (detectedLang || req.body.lang || "en") as "ar" | "en" | "fr" | "es";
    const templates = TEMPLATES[lang] || TEMPLATES.en;

    console.log(`[chat] lang=${lang} | msg="${lastMsg.substring(0, 40)}..."`);

    // ── المستوى 1: تحليل الرسالة باستخدام travelParser (أقل من 1ms!) ──
    const result = travelParser(lastMsg);
    
    console.log(`🎯 Travel Parser Result:`, result);

    // ── المستوى 2: إذا وجدنا رحلة، نبحث عنها ──
    if (result.found && result.intent === "search_flight") {
      const cacheKey = `flights:${result.origin}:${result.destination}:${result.departDate}`;
      const [flights, affiliateLinks, agencies] = await Promise.all([
        getCachedOrFetch(cacheKey, () =>
          searchFlights(result.origin, result.destination, result.departDate), 1800),
        Promise.resolve(buildAffiliateLinks(
          result.origin, result.destination,
          result.departDate, "", result.passengers.toString()
        )),
        Promise.resolve(findAgenciesForRoute(result.origin, result.destination).slice(0, 3))
      ]);

      console.log(`✅ Found flights ${result.origin}→${result.destination}: ${flights?.length || 0} results`);

      return res.json({
        content: flights?.length
          ? templates.found(result.origin, result.destination, result.departDate)
          : templates.noResults,
        affiliateLinks,
        flights: flights || [],
        hotels: searchHotels({ cityIata: result.destination, limit: 3 }),
        agencies,
        destination: findDestination(result.destination),
        shouldSearch: true,
        lang,
        params: {
          originIata: result.origin,
          destIata: result.destination,
          departDate: result.departDate,
          returnDate: "",
          adults: result.passengers.toString(),
        }
      });
    }

    // ── المستوى 3: إذا كان intent آخر (فنادق، عروض، إلخ) ──
    if (result.intent === "search_hotel" && result.destination) {
      const hotels = searchHotels({ cityIata: result.destination, limit: 5 });
      return res.json({
        content: templates.hotels,
        hotels,
        destination: findDestination(result.destination),
        shouldSearch: true,
        lang,
      });
    }

    if (result.intent === "offers") {
      const currentOffers = getCurrentOffers();
      if (currentOffers.length > 0) {
        const offersText = currentOffers
          .map(o => formatSeasonalOffer(o, lang))
          .join("\n\n---\n\n");
        return res.json({
          content: offersText,
          shouldSearch: false,
          lang,
        });
      }
    }

    if (result.intent === "destination_info" && result.destination) {
      const dest = findDestination(result.destination);
      if (dest) {
        return res.json({
          content: formatDestinationInfo(dest, lang),
          shouldSearch: false,
          lang,
        });
      }
    }

    if (result.intent === "greeting") {
      return res.json({
        content: templates.greeting,
        shouldSearch: false,
        lang,
      });
    }

    // ── المستوى 4: إذا لم يفهم، نستخدم الردود الجاهزة ──
    const readyResponse = findReadyResponse(lastMsg, lang);
    if (readyResponse) {
      return res.json({
        content: readyResponse.response,
        shouldSearch: false,
        lang,
        params: {}
      });
    }

    // ── المستوى 5: ترحيب افتراضي ──
    return res.json({
      content: templates.needMore,
      affiliateLinks: [],
      flights: [],
      hotels: [],
      agencies: [],
      destination: null,
      shouldSearch: false,
      lang,
      params: {}
    });

  } catch (err: any) {
    console.error("[pyramic-chat] Error:", err.message);
    res.json({
      content: "✨ I'm here to help! Tell me where you want to go.",
      affiliateLinks: [],
      flights: [],
      hotels: [],
      agencies: [],
      destination: null,
      shouldSearch: false,
      lang: "en",
      params: {}
    });
  }
});

export default router;