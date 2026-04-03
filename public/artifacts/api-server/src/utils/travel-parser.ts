// travel-parser.ts
// محرك تحليل السفر الذكي - متعدد اللغات، أقل من 1ms

type Intent =
  | "search_flight"
  | "search_hotel"
  | "destination_info"
  | "offers"
  | "greeting"
  | "unknown"

export interface TravelResult {
  intent: Intent
  origin: string
  destination: string
  departDate: string
  passengers: number
  found: boolean
}

// ─────────────────────────────
// IATA DATABASE - موسّعة بـ 4 لغات
// ─────────────────────────────
const IATA_MAP: Record<string,string> = {
  // أوروبا - إنجليزي/فرنسي/إسباني
  "madrid":"MAD", "barcelona":"BCN", "london":"LHR", "paris":"CDG",
  "rome":"FCO", "milan":"MXP", "berlin":"BER", "munich":"MUC",
  "amsterdam":"AMS", "brussels":"BRU", "vienna":"VIE", "zurich":"ZRH",
  "lisbon":"LIS", "lisbonne":"LIS", "lisboa":"LIS",
  "athens":"ATH", "istanbul":"IST", "prague":"PRG", "budapest":"BUD",
  "warsaw":"WAW", "dublin":"DUB", "edinburgh":"EDI", "manchester":"MAN",
  "seville":"SVQ", "sevilla":"SVQ", "valencia":"VLC", "malaga":"AGP",
  "nice":"NCE", "lyon":"LYS", "frankfurt":"FRA", "hamburg":"HAM",
  "stockholm":"ARN", "copenhagen":"CPH", "oslo":"OSL", "helsinki":"HEL",
  "barcelone":"BCN", "vienne":"VIE", "lisbonne":"LIS",

  // أوروبا - عربي
  "مدريد":"MAD", "برشلونة":"BCN", "لندن":"LHR", "باريس":"CDG",
  "روما":"FCO", "ميلان":"MXP", "برلين":"BER", "ميونخ":"MUC",
  "امستردام":"AMS", "بروكسل":"BRU", "فيينا":"VIE", "زيورخ":"ZRH",
  "لشبونه":"LIS", "اثينا":"ATH", "اسطنبول":"IST", "استانبول":"IST",
  "براغ":"PRG", "بودابست":"BUD", "وارسو":"WAW", "دبلن":"DUB",
  "ادنبره":"EDI", "مانشستر":"MAN", "اشبيليه":"SVQ", "فالنسيا":"VLC",
  "مالقه":"AGP", "نيس":"NCE", "ليون":"LYS", "فرانكفورت":"FRA",
  "هامبورغ":"HAM", "ستوكهولم":"ARN", "كوبنهاغن":"CPH", "اوسلو":"OSL",

  // شمال أفريقيا - عربي
  "الرباط":"RBA", "الدار البيضاء":"CMN", "الدارالبيضاء":"CMN",
  "كازابلانكا":"CMN", "مراكش":"RAK", "اكادير":"AGA", "طنجه":"TNG",
  "فاس":"FEZ", "وهران":"ORN", "الجزائر":"ALG", "تونس":"TUN",
  "القاهره":"CAI", "الاسكندريه":"HBE", "شرم الشيخ":"SSH",
  "الغردقه":"HRG", "طرابلس":"TIP",

  // شمال أفريقيا - لاتيني
  "casablanca":"CMN", "marrakech":"RAK", "marrakesh":"RAK",
  "rabat":"RBA", "agadir":"AGA", "tangier":"TNG", "tanger":"TNG",
  "fez":"FEZ", "fes":"FEZ", "oran":"ORN",
  "algiers":"ALG", "alger":"ALG", "tunis":"TUN",
  "cairo":"CAI", "le caire":"CAI", "el cairo":"CAI",
  "alexandria":"HBE", "sharm":"SSH", "hurghada":"HRG",

  // الشرق الأوسط - عربي
  "دبي":"DXB", "ابوظبي":"AUH", "الشارقه":"SHJ",
  "جده":"JED", "الرياض":"RUH", "الدمام":"DMM",
  "المدينه":"MED", "الدوحه":"DOH", "الكويت":"KWI",
  "البحرين":"BAH", "مسقط":"MCT", "عمان":"AMM", "بيروت":"BEY",

  // الشرق الأوسط - إنجليزي
  "dubai":"DXB", "abu dhabi":"AUH", "abudhabi":"AUH",
  "sharjah":"SHJ", "jeddah":"JED", "riyadh":"RUH",
  "dammam":"DMM", "medina":"MED", "doha":"DOH",
  "kuwait":"KWI", "bahrain":"BAH", "muscat":"MCT",
  "amman":"AMM", "beirut":"BEY",

  // آسيا
  "طوكيو":"NRT", "اوساكا":"KIX", "سيول":"ICN",
  "بانكوك":"BKK", "سنغافوره":"SIN", "كوالالمبور":"KUL",
  "بالي":"DPS", "مومباي":"BOM", "دلهي":"DEL",
  "tokyo":"NRT", "osaka":"KIX", "seoul":"ICN",
  "bangkok":"BKK", "singapore":"SIN", "kuala lumpur":"KUL",
  "kualalumpur":"KUL", "bali":"DPS", "mumbai":"BOM", "delhi":"DEL",
  "beijing":"PEK", "shanghai":"PVG", "hong kong":"HKG",

  // أمريكا
  "نيويورك":"JFK", "لوس انجلوس":"LAX", "شيكاغو":"ORD",
  "ميامي":"MIA", "لاس فيغاس":"LAS",
  "new york":"JFK", "newyork":"JFK", "los angeles":"LAX",
  "chicago":"ORD", "miami":"MIA", "las vegas":"LAS",
  "toronto":"YYZ", "vancouver":"YVR", "montreal":"YUL",

  // أستراليا
  "سيدني":"SYD", "ملبورن":"MEL",
  "sydney":"SYD", "melbourne":"MEL", "brisbane":"BNE",
}

// ─────────────────────────────
// NORMALIZE TEXT
// ─────────────────────────────
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[ًٌٍَُِّْ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// ─────────────────────────────
// CITY INDEX - مع دعم العبارات المتعددة الكلمات
// ─────────────────────────────
const CITY_INDEX = new Map<string, string>()
Object.entries(IATA_MAP).forEach(([city, iata]) => {
  CITY_INDEX.set(normalize(city), iata)
})

// ─────────────────────────────
// INTENT DETECTION
// ─────────────────────────────
const INTENTS: Record<Intent, RegExp[]> = {
  search_flight: [
    /flight|ticket|fly|booking/i,
    /رحله|رحلات|طيران|سفر|تذكره|ابحث/i,
    /طائره|اريد السفر/i,
    /من .+ (ال|إلى|الي|الى)/i,
    /to .+|from .+/i,
  ],
  search_hotel: [
    /hotel|stay|hostel|accommodation/i,
    /فندق|اقامه|سكن|حجز فندق/i,
    /hôtel|hébergement/i,
  ],
  destination_info: [
    /visit|tourism|attractions|tell me about|info/i,
    /السياحه|زياره|معالم|اخبرني عن|معلومات/i,
  ],
  offers: [
    /deal|offer|discount|promo|cheap/i,
    /عرض|خصم|تخفيض|رخيص|اقل سعر/i,
    /offre|promotion|pas cher/i,
    /oferta|descuento|barato/i,
  ],
  greeting: [
    /^(hi|hello|hey|good morning|good evening)\b/i,
    /^(مرحبا|السلام|اهلا|صباح|مساء|سلام)\b/i,
    /^(hola|bonjour|salut|bonsoir)\b/i,
  ],
  unknown: [],
}

function detectIntent(text: string): Intent {
  for (const [intent, patterns] of Object.entries(INTENTS)) {
    for (const p of patterns) {
      if (p.test(text)) return intent as Intent
    }
  }
  return "unknown"
}

// ─────────────────────────────
// DATE PARSER
// ─────────────────────────────
function parseDate(text: string): string {
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86400000)
  const nextWeek = new Date(today.getTime() + 7 * 86400000)
  const nextMonth = new Date(today.getTime() + 30 * 86400000)

  if (/tomorrow|غدا|غدً|mañana|demain/i.test(text))
    return tomorrow.toISOString().slice(0, 10)

  if (/next week|الاسبوع القادم|la semaine prochaine/i.test(text))
    return nextWeek.toISOString().slice(0, 10)

  if (/next month|الشهر القادم|le mois prochain/i.test(text))
    return nextMonth.toISOString().slice(0, 10)

  const inDays = text.match(/in\s*(\d+)\s*days|بعد\s*(\d+)\s*ايام/i)
  if (inDays) {
    const days = parseInt(inDays[1] || inDays[2])
    return new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10)
  }

  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/)
  if (iso) return iso[1]

  return tomorrow.toISOString().slice(0, 10)
}

// ─────────────────────────────
// PASSENGERS DETECTION
// ─────────────────────────────
function detectPassengers(text: string): number {
  const m = text.match(/(\d+)\s*(person|adult|passenger|شخص|مسافر|personne|persona)/i)
  if (m) return parseInt(m[1])
  return 1
}

// ─────────────────────────────
// FIX 1: كشف المدن مع دعم العبارات المتعددة الكلمات
// ─────────────────────────────
function detectCities(text: string): { iata: string; index: number }[] {
  const cities: { iata: string; index: number }[] = []
  const normalText = normalize(text)

  // فرز من الأطول للأقصر لتجنب التداخل
  const sortedKeys = Array.from(CITY_INDEX.keys()).sort((a, b) => b.length - a.length)

  for (const key of sortedKeys) {
    const idx = normalText.indexOf(key)
    if (idx !== -1) {
      const iata = CITY_INDEX.get(key)!
      if (!cities.some(c => c.iata === iata)) {
        cities.push({ iata, index: idx })
      }
    }
  }

  // IATA مباشر (3 أحرف كبيرة)
  const iataMatches = text.matchAll(/\b([A-Z]{3})\b/g)
  for (const m of iataMatches) {
    if (!cities.some(c => c.iata === m[1])) {
      cities.push({ iata: m[1], index: m.index! })
    }
  }

  return cities.sort((a, b) => a.index - b.index)
}

// ─────────────────────────────
// FIX 2: FROM/TO بعد normalize (الي بدل إلى)
// ─────────────────────────────
const FROM_WORDS = ["from", "mn", "من", "de", "desde", "depart", "مغادره", "انطلاق"]
const TO_WORDS   = ["to", "الي", "الى", "ali", "vers", "à", "a", "para", "وجهه", "متجه", "نحو"]

function buildRoute(tokens: string[], cities: { iata: string; index: number }[]) {
  let origin = ""
  let destination = ""
  const normalText = tokens.join(" ")

  // FIX 3: بحث بكلمتين متتاليتين (لعبارات مثل "new york")
  tokens.forEach((t, i) => {
    // كلمة واحدة
    if (FROM_WORDS.includes(t)) {
      // جرب كلمة واحدة
      const single = CITY_INDEX.get(normalize(tokens[i + 1] || ""))
      if (single && !origin) { origin = single; return }
      // جرب كلمتين
      const double = CITY_INDEX.get(normalize((tokens[i + 1] || "") + " " + (tokens[i + 2] || "")))
      if (double && !origin) origin = double
    }

    if (TO_WORDS.includes(t)) {
      const single = CITY_INDEX.get(normalize(tokens[i + 1] || ""))
      if (single && !destination) { destination = single; return }
      const double = CITY_INDEX.get(normalize((tokens[i + 1] || "") + " " + (tokens[i + 2] || "")))
      if (double && !destination) destination = double
    }
  })

  // إذا لم نجد من FROM/TO، نأخذ أول مدينتين
  if (!origin && !destination && cities.length >= 2) {
    origin = cities[0].iata
    destination = cities[1].iata
  } else if (!origin && cities.length >= 1 && destination) {
    // وجهة فقط بدون مغادرة
  } else if (cities.length === 1 && !origin && !destination) {
    destination = cities[0].iata
  }

  return { origin, destination }
}

// ─────────────────────────────
// MAIN EXPORT
// ─────────────────────────────
export function travelParser(message: string): TravelResult {
  const normalized = normalize(message)
  const intent = detectIntent(normalized)
  const tokens = normalized.split(/\s+/)
  const cities = detectCities(message) // نمرر النص الأصلي لكشف الأحرف الكبيرة
  const route = buildRoute(tokens, cities)
  const departDate = parseDate(normalized)
  const passengers = detectPassengers(normalized)
  const found = !!(route.origin && route.destination)

  return {
    intent: found ? (intent === "unknown" ? "search_flight" : intent) : intent,
    origin: route.origin,
    destination: route.destination,
    departDate,
    passengers,
    found,
  }
}
