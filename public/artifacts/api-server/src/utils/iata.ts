// قاموس IATA للمدن (محلي - لا يستهلك API)
export const IATA: Record<string, string> = {
  // المدن الأوروبية
  "madrid": "MAD",
  "barcelona": "BCN",
  "london": "LHR",
  "manchester": "MAN",
  "paris": "CDG",
  "rome": "FCO",
  "milan": "MXP",
  "berlin": "BER",
  "munich": "MUC",
  "amsterdam": "AMS",
  "brussels": "BRU",
  "vienna": "VIE",
  "zurich": "ZRH",
  "geneva": "GVA",
  "copenhagen": "CPH",
  "stockholm": "ARN",
  "oslo": "OSL",
  "helsinki": "HEL",
  "warsaw": "WAW",
  "prague": "PRG",
  "budapest": "BUD",
  "dublin": "DUB",
  "lisbon": "LIS",
  "athens": "ATH",
  "istanbul": "IST",
  
  // الشرق الأوسط وشمال أفريقيا
  "dubai": "DXB",
  "jeddah": "JED",
  "riyadh": "RUH",
  "dammam": "DMM",
  "medina": "MED",
  "cairo": "CAI",
  "alexandria": "HBE",
  "casablanca": "CMN",
  "marrakech": "RAK",
  "algiers": "ALG",
  "tunis": "TUN",
  "amman": "AMM",
  "beirut": "BEY",
  "kuwait": "KWI",
  "doha": "DOH",
  "muscat": "MCT",
  "bahrain": "BAH",
  "abudhabi": "AUH",
  "sharjah": "SHJ",
  
  // آسيا
  "tokyo": "NRT",
  "osaka": "KIX",
  "seoul": "ICN",
  "beijing": "PEK",
  "shanghai": "PVG",
  "hongkong": "HKG",
  "bangkok": "BKK",
  "singapore": "SIN",
  "kualalumpur": "KUL",
  "mumbai": "BOM",
  "delhi": "DEL",
  "jakarta": "CGK",
  "manila": "MNL",
  "hochiminh": "SGN",
  
  // أمريكا
  "newyork": "JFK",
  "losangeles": "LAX",
  "chicago": "ORD",
  "miami": "MIA",
  "sanfrancisco": "SFO",
  "toronto": "YYZ",
  "vancouver": "YVR",
  "mexicocity": "MEX",
  
  // أسماء بالعربية
  "دبي": "DXB",
  "جدة": "JED",
  "الرياض": "RUH",
  "القاهرة": "CAI",
  "المدينة": "MED",
  "الدار البيضاء": "CMN",
  "الجزائر": "ALG",
  "تونس": "TUN",
  "عمان": "AMM",
  "بيروت": "BEY",
  "مدريد": "MAD",
  "برشلونة": "BCN",
  "لندن": "LHR",
  "باريس": "CDG",
  "اسطنبول": "IST"
};

/**
 * تحويل اسم مدينة إلى رمز IATA
 * @param city اسم المدينة (أي لغة)
 * @returns رمز IATA أو null إذا لم يوجد
 */
export function resolveCity(city: string): string | null {
  if (!city || city.trim() === "") return null;
  
  // إذا كان بالفعل رمز IATA صحيح (3 أحرف كبيرة)
  if (city.length === 3 && city === city.toUpperCase() && /^[A-Z]{3}$/.test(city)) {
    return city;
  }
  
  // تنظيف النص من المسافات والتحويل إلى lowercase
  const cleanCity = city.toLowerCase().trim().replace(/\s+/g, '');
  
  // البحث في قاموس IATA
  return IATA[cleanCity] || null;
}

/**
 * تحويل اسم مدينة إلى رمز IATA مع fallback
 * @param city اسم المدينة
 * @returns رمز IATA أو أول 3 أحرف من uppercase
 */
export function resolveCityWithFallback(city: string): string {
  const resolved = resolveCity(city);
  if (resolved) return resolved;
  
  // fallback: خذ أول 3 أحرف وحولها إلى uppercase
  return city.toUpperCase().substring(0, 3);
}