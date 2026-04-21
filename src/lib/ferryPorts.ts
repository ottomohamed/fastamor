// src/lib/ferryPorts.ts
// قاعدة بيانات شاملة للموانئ (أوروبا ←→ شمال أفريقيا)

export interface FerryPort {
  name: string;        // الاسم الرسمي (الإنجليزية)
  code: string;        // رمز الميناء
  country: string;     // الدولة
  countryAr: string;   // اسم الدولة بالعربية
  aliases: string[];   // الأسماء البديلة (بما فيها الأخطاء الإملائية)
}

export const FERRY_PORTS: FerryPort[] = [
  // ========== المغرب ==========
  { 
    name: "Tangier", 
    code: "TNG", 
    country: "Morocco", 
    countryAr: "المغرب",
    aliases: ["طنجة", "طنجه", "tanja", "tangier", "tanger", "طنحة"]
  },
  { 
    name: "Tanger Ville", 
    code: "TAV", 
    country: "Morocco", 
    countryAr: "المغرب",
    aliases: ["طنجة المدينة", "طنجه المدينه", "tanger ville", "tangier city", "طنجة مدينه"]
  },
  { 
    name: "Tanger Med", 
    code: "TNM", 
    country: "Morocco", 
    countryAr: "المغرب",
    aliases: ["طنجة المتوسط", "طنجة ميد", "tanger med", "tangier med", "طنجة وسط"]
  },
  { 
    name: "Nador", 
    code: "NDR", 
    country: "Morocco", 
    countryAr: "المغرب",
    aliases: ["الناظور", "الناضور", "ناظور", "nador"]
  },
  { 
    name: "Al Hoceima", 
    code: "AHU", 
    country: "Morocco", 
    countryAr: "المغرب",
    aliases: ["الحسيمة", "حسيمة", "hoceima", "al hoceima"]
  },
  { 
    name: "Casablanca", 
    code: "CAS", 
    country: "Morocco", 
    countryAr: "المغرب",
    aliases: ["الدار البيضاء", "دار البيضاء", "كازا", "casa", "casablanca"]
  },

  // ========== إسبانيا ==========
  { 
    name: "Algeciras", 
    code: "ALG", 
    country: "Spain", 
    countryAr: "إسبانيا",
    aliases: ["الجزيرة الخضراء", "الجزيرة الخظراء", "الخظراء", "الخضراء", "isla verde", "algeciras", "الجزيره الخضراء"]
  },
  { 
    name: "Malaga", 
    code: "MLG", 
    country: "Spain", 
    countryAr: "إسبانيا",
    aliases: ["مالقة", "مالجا", "malaga"]
  },
  { 
    name: "Almeria", 
    code: "LEI", 
    country: "Spain", 
    countryAr: "إسبانيا",
    aliases: ["المرية", "المريا", "almeria"]
  },
  { 
    name: "Barcelona", 
    code: "BCN", 
    country: "Spain", 
    countryAr: "إسبانيا",
    aliases: ["برشلونة", "برشلونه", "barcelona"]
  },
  { 
    name: "Tarifa", 
    code: "TAR", 
    country: "Spain", 
    countryAr: "إسبانيا",
    aliases: ["طريفة", "طريفه", "tarifa"]
  },
  { 
    name: "Ceuta", 
    code: "CEU", 
    country: "Spain", 
    countryAr: "إسبانيا",
    aliases: ["سبتة", "سبتا", "ceuta"]
  },
  { 
    name: "Motril", 
    code: "MOT", 
    country: "Spain", 
    countryAr: "إسبانيا",
    aliases: ["موتريل", "motril"]
  },

  // ========== فرنسا ==========
  { 
    name: "Marseille", 
    code: "MRS", 
    country: "France", 
    countryAr: "فرنسا",
    aliases: ["مرسيليا", "مارسيليا", "marseille"]
  },
  { 
    name: "Sète", 
    code: "SET", 
    country: "France", 
    countryAr: "فرنسا",
    aliases: ["سيت", "sete"]
  },
  { 
    name: "Toulon", 
    code: "TLN", 
    country: "France", 
    countryAr: "فرنسا",
    aliases: ["تولون", "toulon"]
  },

  // ========== إيطاليا ==========
  { 
    name: "Genoa", 
    code: "GOA", 
    country: "Italy", 
    countryAr: "إيطاليا",
    aliases: ["جنوة", "جنوا", "genoa"]
  },
  { 
    name: "Naples", 
    code: "NAP", 
    country: "Italy", 
    countryAr: "إيطاليا",
    aliases: ["نابولي", "napoli", "naples"]
  },
  { 
    name: "Livorno", 
    code: "LIV", 
    country: "Italy", 
    countryAr: "إيطاليا",
    aliases: ["ليفورنو", "livorno"]
  },
  { 
    name: "Trieste", 
    code: "TRI", 
    country: "Italy", 
    countryAr: "إيطاليا",
    aliases: ["تريست", "trieste"]
  },

  // ========== تونس ==========
  { 
    name: "Tunis", 
    code: "TUN", 
    country: "Tunisia", 
    countryAr: "تونس",
    aliases: ["تونس", "tunis"]
  },
  { 
    name: "La Goulette", 
    code: "LAG", 
    country: "Tunisia", 
    countryAr: "تونس",
    aliases: ["حلق الوادي", "la goulette"]
  },
  { 
    name: "Sfax", 
    code: "SFA", 
    country: "Tunisia", 
    countryAr: "تونس",
    aliases: ["صفاقس", "sfax"]
  },
  { 
    name: "Zarzis", 
    code: "ZAR", 
    country: "Tunisia", 
    countryAr: "تونس",
    aliases: ["جرجيس", "zarzis"]
  },

  // ========== الجزائر ==========
  { 
    name: "Algiers", 
    code: "ALG", 
    country: "Algeria", 
    countryAr: "الجزائر",
    aliases: ["الجزائر", "alger", "algiers"]
  },
  { 
    name: "Oran", 
    code: "ORN", 
    country: "Algeria", 
    countryAr: "الجزائر",
    aliases: ["وهران", "oran"]
  },
  { 
    name: "Annaba", 
    code: "AAB", 
    country: "Algeria", 
    countryAr: "الجزائر",
    aliases: ["عنابة", "annaba"]
  },
  { 
    name: "Bejaia", 
    code: "BJA", 
    country: "Algeria", 
    countryAr: "الجزائر",
    aliases: ["بجاية", "bejaia"]
  },
];

// دالة للبحث عن الميناء بأي اسم (حتى مع الأخطاء)
export function findPort(query: string): FerryPort | undefined {
  if (!query) return undefined;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return FERRY_PORTS.find(port => {
    // التحقق من الاسم الرسمي
    if (port.name.toLowerCase() === normalizedQuery) return true;
    // التحقق من الرمز
    if (port.code.toLowerCase() === normalizedQuery) return true;
    // التحقق من الأسماء البديلة
    return port.aliases.some(alias => alias.toLowerCase() === normalizedQuery);
  });
}

// دالة للبحث عن الموانئ في بلد معين
export function findPortsByCountry(country: string): FerryPort[] {
  return FERRY_PORTS.filter(port => port.country.toLowerCase() === country.toLowerCase());
}

// دالة لتصحيح اسم الميناء تلقائياً
export function autoCorrectPortName(input: string): string {
  const found = findPort(input);
  return found ? found.name : input;
}