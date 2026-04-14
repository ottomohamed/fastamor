// ═══════════════════════════════════════════════════════
// Fastamor - قاعدة بيانات الوكالات السياحية
// أوروبا الغربية + بريطانيا + أمريكا + كندا + الخليج
// التركيز على الرحلات الجماعية والعملاء الأثرياء
// ═══════════════════════════════════════════════════════

export interface Agency {
  id: string;
  name: string;
  nameAr?: string;
  country: string;
  city: string;
  language: string[];
  speciality: string[];
  groupCapacity: { min: number; max: number };
  priceRange: "midrange" | "luxury" | "ultra-luxury";
  destinations: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
    whatsapp?: string;
  };
  commission: {
    typical: number;
    negotiable: boolean;
  };
  rating: number;
  notes: string;
  tags: string[];
}

export const AGENCIES_DB: Agency[] = [

  // ════════════════════════════════════════════════
  // 🇪🇸 إسبانيا
  // ════════════════════════════════════════════════
  {
    id: "es-001",
    name: "Viajes El Corte Inglés",
    country: "Spain", city: "Madrid",
    language: ["Spanish", "English", "Arabic"],
    speciality: ["group-tours", "luxury", "halal-travel", "Morocco", "Turkey"],
    groupCapacity: { min: 10, max: 100 },
    priceRange: "luxury",
    destinations: ["MAD→RAK", "MAD→IST", "MAD→DXB", "MAD→CAI"],
    contact: {
      phone: "+34-902-400-222",
      email: "grupos@viajeselcorteingles.es",
      website: "https://viajeselcorteingles.es",
    },
    commission: { typical: 20, negotiable: true },
    rating: 9.0,
    notes: "أكبر وكالة سفر في إسبانيا. جالية عربية كبيرة في مدريد. مثالية للرحلات الجماعية الفاخرة.",
    tags: ["top-partner", "arabic-speaking", "group", "luxury", "spain"]
  },
  {
    id: "es-002",
    name: "Halcon Viajes",
    country: "Spain", city: "Barcelona",
    language: ["Spanish", "Catalan", "English"],
    speciality: ["group-tours", "Morocco", "Middle-East", "Hajj-Umrah"],
    groupCapacity: { min: 15, max: 80 },
    priceRange: "midrange",
    destinations: ["BCN→RAK", "BCN→TUN", "BCN→DXB", "BCN→IST"],
    contact: {
      phone: "+34-902-300-600",
      email: "grupos@halconviajes.com",
      website: "https://halconviajes.com",
    },
    commission: { typical: 22, negotiable: true },
    rating: 8.7,
    notes: "شبكة واسعة في كتالونيا. تجربة طويلة مع الجاليات العربية.",
    tags: ["group", "barcelona", "morocco", "spain"]
  },
  {
    id: "es-003",
    name: "Travelplan España",
    country: "Spain", city: "Seville",
    language: ["Spanish", "Arabic", "French"],
    speciality: ["Morocco", "group-tours", "halal-travel", "cultural"],
    groupCapacity: { min: 20, max: 54 },
    priceRange: "midrange",
    destinations: ["SVQ→RAK", "SVQ→CMN", "SVQ→TNG"],
    contact: {
      phone: "+34-954-221-100",
      email: "info@travelplanespana.com",
      website: "https://travelplanespana.com",
      whatsapp: "+34-600-123-456"
    },
    commission: { typical: 25, negotiable: true },
    rating: 8.5,
    notes: "إشبيلية قريبة من المغرب - رحلات حافلات مباشرة. مثالية لنموذج Fastamor.",
    tags: ["bus-tours", "morocco", "seville", "arabic-speaking", "priority"]
  },

  // ════════════════════════════════════════════════
  // 🇫🇷 فرنسا
  // ════════════════════════════════════════════════
  {
    id: "fr-001",
    name: "Nouvelles Frontières",
    country: "France", city: "Paris",
    language: ["French", "Arabic", "English"],
    speciality: ["group-tours", "luxury", "North-Africa", "Middle-East"],
    groupCapacity: { min: 10, max: 100 },
    priceRange: "luxury",
    destinations: ["CDG→RAK", "CDG→TUN", "CDG→DXB", "CDG→CAI", "CDG→IST"],
    contact: {
      phone: "+33-825-000-825",
      email: "groupes@nouvelles-frontieres.fr",
      website: "https://nouvelles-frontieres.fr",
    },
    commission: { typical: 20, negotiable: true },
    rating: 9.1,
    notes: "الجالية المغاربية في فرنسا ضخمة جداً - 5 مليون شخص. سوق هائل.",
    tags: ["top-partner", "france", "north-africa", "arabic-speaking", "luxury"]
  },
  {
    id: "fr-002",
    name: "Voyages SNCF Tours",
    country: "France", city: "Lyon",
    language: ["French", "Arabic"],
    speciality: ["group-tours", "halal-travel", "Morocco", "Tunisia", "Turkey"],
    groupCapacity: { min: 20, max: 60 },
    priceRange: "midrange",
    destinations: ["LYS→RAK", "LYS→TUN", "LYS→IST"],
    contact: {
      phone: "+33-472-563-456",
      email: "groupes@voyages-sncf-tours.fr",
      website: "https://voyages-sncf-tours.fr",
      whatsapp: "+33-600-234-567"
    },
    commission: { typical: 23, negotiable: true },
    rating: 8.6,
    notes: "ليون ثاني أكبر تجمع للجالية العربية في فرنسا بعد باريس.",
    tags: ["group", "halal", "france", "lyon", "north-africa"]
  },
  {
    id: "fr-003",
    name: "Marmara Voyages",
    country: "France", city: "Marseille",
    language: ["French", "Arabic", "Berber"],
    speciality: ["Morocco", "Algeria", "Tunisia", "group-tours", "family"],
    groupCapacity: { min: 15, max: 54 },
    priceRange: "midrange",
    destinations: ["MRS→RAK", "MRS→ALG", "MRS→TUN", "MRS→CMN"],
    contact: {
      phone: "+33-491-000-123",
      email: "groupes@marmara.fr",
      website: "https://marmara.fr",
      whatsapp: "+33-600-345-678"
    },
    commission: { typical: 28, negotiable: true },
    rating: 8.8,
    notes: "مرسيليا = أكبر جالية مغاربية في أوروبا. عمولة أعلى لأن السوق تنافسي.",
    tags: ["priority", "marseille", "north-africa", "arabic-speaking", "bus-tours"]
  },

  // ════════════════════════════════════════════════
  // 🇩🇪 ألمانيا
  // ════════════════════════════════════════════════
  {
    id: "de-001",
    name: "TUI Deutschland",
    country: "Germany", city: "Hannover",
    language: ["German", "English", "Turkish", "Arabic"],
    speciality: ["group-tours", "luxury", "Turkey", "Morocco", "Egypt"],
    groupCapacity: { min: 10, max: 150 },
    priceRange: "luxury",
    destinations: ["FRA→IST", "FRA→DXB", "FRA→CAI", "FRA→RAK", "MUC→IST"],
    contact: {
      phone: "+49-511-567-0",
      email: "groups@tui.de",
      website: "https://tui.com/de",
    },
    commission: { typical: 18, negotiable: true },
    rating: 9.2,
    notes: "أكبر مجموعة سياحية في العالم. 4 مليون مسلم في ألمانيا. سوق ضخم.",
    tags: ["top-partner", "germany", "luxury", "global", "group"]
  },
  {
    id: "de-002",
    name: "Dertour GmbH",
    country: "Germany", city: "Frankfurt",
    language: ["German", "English", "Arabic"],
    speciality: ["luxury", "Middle-East", "Turkey", "group-tours"],
    groupCapacity: { min: 10, max: 80 },
    priceRange: "luxury",
    destinations: ["FRA→DXB", "FRA→DOH", "FRA→IST", "FRA→CAI"],
    contact: {
      phone: "+49-69-9588-0",
      email: "groups@dertour.de",
      website: "https://dertour.de",
    },
    commission: { typical: 20, negotiable: true },
    rating: 9.0,
    notes: "متخصص في الرحلات الفاخرة. الجالية التركية والعربية في فرانكفورت كبيرة.",
    tags: ["luxury", "germany", "middle-east", "group"]
  },
  {
    id: "de-003",
    name: "Öger Tours",
    country: "Germany", city: "Hamburg",
    language: ["German", "Turkish", "Arabic"],
    speciality: ["Turkey", "halal-travel", "group-tours", "family"],
    groupCapacity: { min: 20, max: 54 },
    priceRange: "midrange",
    destinations: ["HAM→IST", "HAM→AYT", "HAM→DXB"],
    contact: {
      phone: "+49-40-307-0",
      email: "gruppen@oeger.de",
      website: "https://oeger.de",
      whatsapp: "+49-150-123-4567"
    },
    commission: { typical: 25, negotiable: true },
    rating: 8.7,
    notes: "متخصص في الجالية التركية. نموذج مثالي لـ Fastamor مع الجاليات.",
    tags: ["turkish-speaking", "halal", "germany", "group", "bus-tours"]
  },

  // ════════════════════════════════════════════════
  // 🇮🇹 إيطاليا
  // ════════════════════════════════════════════════
  {
    id: "it-001",
    name: "Alpitour World",
    country: "Italy", city: "Turin",
    language: ["Italian", "English", "Arabic"],
    speciality: ["luxury", "group-tours", "Tunisia", "Morocco", "Egypt"],
    groupCapacity: { min: 10, max: 100 },
    priceRange: "luxury",
    destinations: ["FCO→TUN", "FCO→RAK", "FCO→CAI", "MXP→IST"],
    contact: {
      phone: "+39-011-019-0000",
      email: "gruppi@alpitour.it",
      website: "https://alpitour.it",
    },
    commission: { typical: 22, negotiable: true },
    rating: 8.9,
    notes: "أكبر مجموعة سياحية إيطالية. تونس والمغرب وجهات مفضلة للإيطاليين.",
    tags: ["italy", "luxury", "north-africa", "group"]
  },
  {
    id: "it-002",
    name: "Veratour",
    country: "Italy", city: "Rome",
    language: ["Italian", "Arabic", "English"],
    speciality: ["Tunisia", "Egypt", "Morocco", "group-tours", "beach"],
    groupCapacity: { min: 20, max: 60 },
    priceRange: "midrange",
    destinations: ["FCO→TUN", "FCO→HRG", "FCO→RAK"],
    contact: {
      phone: "+39-06-4550-5000",
      email: "gruppi@veratour.it",
      website: "https://veratour.it",
      whatsapp: "+39-320-123-4567"
    },
    commission: { typical: 25, negotiable: true },
    rating: 8.5,
    notes: "متخصص في شمال أفريقيا. مثالي لرحلات الشاطئ الجماعية.",
    tags: ["italy", "north-africa", "beach", "group", "bus-tours"]
  },

  // ════════════════════════════════════════════════
  // 🇳🇱 هولندا
  // ════════════════════════════════════════════════
  {
    id: "nl-001",
    name: "TUI Nederland",
    country: "Netherlands", city: "Amsterdam",
    language: ["Dutch", "English", "Arabic", "Turkish"],
    speciality: ["group-tours", "Turkey", "Morocco", "luxury"],
    groupCapacity: { min: 10, max: 100 },
    priceRange: "luxury",
    destinations: ["AMS→IST", "AMS→DXB", "AMS→RAK", "AMS→TUN"],
    contact: {
      phone: "+31-70-310-6000",
      email: "groups@tui.nl",
      website: "https://tui.nl",
    },
    commission: { typical: 20, negotiable: true },
    rating: 9.0,
    notes: "جالية مغربية وتركية كبيرة في هولندا. سوق ممتاز.",
    tags: ["netherlands", "luxury", "arabic-speaking", "group"]
  },

  // ════════════════════════════════════════════════
  // 🇧🇪 بلجيكا
  // ════════════════════════════════════════════════
  {
    id: "be-001",
    name: "TUI Belgium",
    country: "Belgium", city: "Brussels",
    language: ["French", "Dutch", "Arabic"],
    speciality: ["Morocco", "Turkey", "Egypt", "group-tours"],
    groupCapacity: { min: 10, max: 80 },
    priceRange: "midrange",
    destinations: ["BRU→RAK", "BRU→IST", "BRU→TUN", "BRU→DXB"],
    contact: {
      phone: "+32-2-717-8600",
      email: "groups@tui.be",
      website: "https://tui.be",
      whatsapp: "+32-470-123-456"
    },
    commission: { typical: 22, negotiable: true },
    rating: 8.8,
    notes: "بروكسل = ثاني أكبر جالية مغربية في أوروبا بعد فرنسا.",
    tags: ["belgium", "morocco", "arabic-speaking", "priority", "group"]
  },

  // ════════════════════════════════════════════════
  // 🇨🇭 سويسرا
  // ════════════════════════════════════════════════
  {
    id: "ch-001",
    name: "Kuoni Switzerland",
    country: "Switzerland", city: "Zurich",
    language: ["German", "French", "English", "Arabic"],
    speciality: ["ultra-luxury", "group-tours", "Middle-East", "Maldives"],
    groupCapacity: { min: 8, max: 40 },
    priceRange: "ultra-luxury",
    destinations: ["ZRH→DXB", "ZRH→DOH", "ZRH→MLE", "ZRH→IST"],
    contact: {
      phone: "+41-44-277-4444",
      email: "groups@kuoni.ch",
      website: "https://kuoni.ch",
    },
    commission: { typical: 18, negotiable: false },
    rating: 9.5,
    notes: "سويسرا = أغنى عملاء في العالم. عمولة أقل لكن الأرقام ضخمة جداً.",
    tags: ["ultra-luxury", "switzerland", "vip", "high-value"]
  },

  // ════════════════════════════════════════════════
  // 🇬🇧 بريطانيا
  // ════════════════════════════════════════════════
  {
    id: "gb-001",
    name: "TUI UK",
    country: "UK", city: "London",
    language: ["English", "Arabic", "Urdu"],
    speciality: ["group-tours", "luxury", "Middle-East", "Turkey", "Morocco"],
    groupCapacity: { min: 10, max: 150 },
    priceRange: "luxury",
    destinations: ["LHR→DXB", "LHR→IST", "LHR→RAK", "LHR→CAI", "LHR→DOH"],
    contact: {
      phone: "+44-203-451-2688",
      email: "groups@tui.co.uk",
      website: "https://tui.co.uk",
    },
    commission: { typical: 20, negotiable: true },
    rating: 9.1,
    notes: "3 مليون مسلم في بريطانيا. سوق الحلال والرحلات الإسلامية ضخم جداً.",
    tags: ["top-partner", "uk", "halal", "luxury", "arabic-speaking"]
  },
  {
    id: "gb-002",
    name: "Inspiratour",
    country: "UK", city: "London",
    language: ["English", "Arabic", "Urdu", "Farsi"],
    speciality: ["halal-travel", "Umrah", "group-tours", "Muslim-friendly"],
    groupCapacity: { min: 15, max: 54 },
    priceRange: "midrange",
    destinations: ["LHR→JED", "LHR→MED", "LHR→IST", "LHR→DXB", "LHR→RAK"],
    contact: {
      phone: "+44-207-375-0000",
      email: "groups@inspiratour.co.uk",
      website: "https://inspiratour.co.uk",
      whatsapp: "+44-7700-123456"
    },
    commission: { typical: 25, negotiable: true },
    rating: 9.0,
    notes: "متخصص في السياحة الإسلامية. العمرة والحج والوجهات الحلال. سوق مربح جداً.",
    tags: ["priority", "halal", "umrah", "uk", "muslim-friendly", "arabic-speaking"]
  },
  {
    id: "gb-003",
    name: "Cosmos Tours",
    country: "UK", city: "Manchester",
    language: ["English", "Arabic"],
    speciality: ["group-tours", "Europe", "Middle-East", "affordable-luxury"],
    groupCapacity: { min: 20, max: 60 },
    priceRange: "midrange",
    destinations: ["MAN→IST", "MAN→DXB", "MAN→CAI", "MAN→RAK"],
    contact: {
      phone: "+44-161-480-5799",
      email: "groups@cosmos.co.uk",
      website: "https://cosmos.co.uk",
    },
    commission: { typical: 22, negotiable: true },
    rating: 8.7,
    notes: "مانشستر = أكبر جالية عربية خارج لندن في بريطانيا.",
    tags: ["uk", "manchester", "group", "middle-east"]
  },
  {
    id: "gb-004",
    name: "Barrhead Travel",
    country: "UK", city: "Glasgow",
    language: ["English", "Arabic"],
    speciality: ["luxury", "group-tours", "family", "Middle-East"],
    groupCapacity: { min: 10, max: 50 },
    priceRange: "luxury",
    destinations: ["GLA→DXB", "GLA→IST", "GLA→RAK"],
    contact: {
      phone: "+44-141-222-3000",
      email: "groups@barrheadtravel.co.uk",
      website: "https://barrheadtravel.co.uk",
    },
    commission: { typical: 20, negotiable: true },
    rating: 8.8,
    notes: "أفضل وكالة في اسكتلندا. جالية باكستانية وعربية كبيرة في غلاسكو.",
    tags: ["uk", "scotland", "luxury", "group"]
  },

  // ════════════════════════════════════════════════
  // 🇺🇸 الولايات المتحدة
  // ════════════════════════════════════════════════
  {
    id: "us-001",
    name: "American Express Travel",
    country: "USA", city: "New York",
    language: ["English", "Arabic", "Spanish"],
    speciality: ["ultra-luxury", "group-tours", "corporate", "Middle-East"],
    groupCapacity: { min: 10, max: 200 },
    priceRange: "ultra-luxury",
    destinations: ["JFK→DXB", "JFK→DOH", "JFK→IST", "JFK→CAI", "LAX→DXB"],
    contact: {
      phone: "+1-800-297-2977",
      email: "groups@amextravel.com",
      website: "https://travel.americanexpress.com",
    },
    commission: { typical: 15, negotiable: false },
    rating: 9.3,
    notes: "عملاء Amex = أغنى فئة في أمريكا. عمولة أقل لكن الأرقام ضخمة جداً.",
    tags: ["ultra-luxury", "usa", "vip", "corporate", "high-value"]
  },
  {
    id: "us-002",
    name: "Dar Al Hijra Travel",
    country: "USA", city: "Dearborn",
    language: ["Arabic", "English"],
    speciality: ["halal-travel", "Umrah", "Hajj", "group-tours", "Muslim-friendly"],
    groupCapacity: { min: 20, max: 100 },
    priceRange: "midrange",
    destinations: ["DTW→JED", "DTW→IST", "DTW→DXB", "DTW→CAI", "DTW→RAK"],
    contact: {
      phone: "+1-313-562-0000",
      email: "groups@daralhijra.com",
      website: "https://daralhijra.com",
      whatsapp: "+1-313-562-0001"
    },
    commission: { typical: 28, negotiable: true },
    rating: 9.2,
    notes: "ديربورن = أكبر تجمع عربي في أمريكا. متخصص في السياحة الإسلامية. شريك مثالي.",
    tags: ["priority", "arabic-speaking", "halal", "umrah", "usa", "top-partner"]
  },
  {
    id: "us-003",
    name: "Nawafir Travel",
    country: "USA", city: "Los Angeles",
    language: ["Arabic", "English", "Farsi"],
    speciality: ["halal-travel", "group-tours", "Middle-East", "Morocco"],
    groupCapacity: { min: 15, max: 54 },
    priceRange: "midrange",
    destinations: ["LAX→DXB", "LAX→RAK", "LAX→IST", "LAX→JED"],
    contact: {
      phone: "+1-310-000-1234",
      email: "groups@nawafirtravel.com",
      website: "https://nawafirtravel.com",
      whatsapp: "+1-310-000-1235"
    },
    commission: { typical: 26, negotiable: true },
    rating: 8.9,
    notes: "لوس أنجلوس = جالية عربية وإيرانية ضخمة. سوق الحلال نامٍ بسرعة.",
    tags: ["priority", "arabic-speaking", "halal", "usa", "group"]
  },
  {
    id: "us-004",
    name: "Liberty Travel",
    country: "USA", city: "Chicago",
    language: ["English", "Arabic"],
    speciality: ["group-tours", "luxury", "Europe", "Middle-East"],
    groupCapacity: { min: 10, max: 80 },
    priceRange: "luxury",
    destinations: ["ORD→DXB", "ORD→IST", "ORD→CDG", "ORD→FCO"],
    contact: {
      phone: "+1-312-000-5678",
      email: "groups@libertytravel.com",
      website: "https://libertytravel.com",
    },
    commission: { typical: 20, negotiable: true },
    rating: 8.7,
    notes: "شيكاغو = جالية عربية وفلسطينية كبيرة. سوق ممتاز.",
    tags: ["usa", "chicago", "luxury", "group"]
  },
  {
    id: "us-005",
    name: "Andalus Travel",
    country: "USA", city: "Houston",
    language: ["Arabic", "English"],
    speciality: ["halal-travel", "group-tours", "Umrah", "Morocco", "Turkey"],
    groupCapacity: { min: 20, max: 54 },
    priceRange: "midrange",
    destinations: ["IAH→JED", "IAH→IST", "IAH→RAK", "IAH→DXB"],
    contact: {
      phone: "+1-713-000-9012",
      email: "groups@andalustravel.com",
      website: "https://andalustravel.com",
      whatsapp: "+1-713-000-9013"
    },
    commission: { typical: 27, negotiable: true },
    rating: 8.8,
    notes: "هيوستن = أكبر جالية عربية في جنوب أمريكا. نامية بسرعة.",
    tags: ["priority", "arabic-speaking", "halal", "usa", "group"]
  },

  // ════════════════════════════════════════════════
  // 🇨🇦 كندا
  // ════════════════════════════════════════════════
  {
    id: "ca-001",
    name: "Sunwing Travel Group",
    country: "Canada", city: "Toronto",
    language: ["English", "French", "Arabic"],
    speciality: ["group-tours", "luxury", "Middle-East", "Morocco"],
    groupCapacity: { min: 10, max: 150 },
    priceRange: "luxury",
    destinations: ["YYZ→DXB", "YYZ→IST", "YYZ→RAK", "YYZ→CAI"],
    contact: {
      phone: "+1-877-786-9464",
      email: "groups@sunwing.ca",
      website: "https://sunwing.ca",
    },
    commission: { typical: 20, negotiable: true },
    rating: 9.0,
    notes: "أكبر مجموعة سياحية في كندا. مليون عربي في تورنتو وضواحيها.",
    tags: ["canada", "luxury", "group", "arabic-speaking"]
  },
  {
    id: "ca-002",
    name: "Alhijaz Travel Canada",
    country: "Canada", city: "Toronto",
    language: ["Arabic", "English", "Urdu"],
    speciality: ["halal-travel", "Umrah", "Hajj", "group-tours"],
    groupCapacity: { min: 20, max: 100 },
    priceRange: "midrange",
    destinations: ["YYZ→JED", "YYZ→MED", "YYZ→IST", "YYZ→DXB"],
    contact: {
      phone: "+1-416-000-3456",
      email: "groups@alhijazcanada.com",
      website: "https://alhijazcanada.com",
      whatsapp: "+1-416-000-3457"
    },
    commission: { typical: 28, negotiable: true },
    rating: 9.1,
    notes: "متخصص في السياحة الإسلامية في كندا. شريك استراتيجي مثالي.",
    tags: ["priority", "arabic-speaking", "halal", "umrah", "canada", "top-partner"]
  },
  {
    id: "ca-003",
    name: "Marlin Travel",
    country: "Canada", city: "Montreal",
    language: ["French", "English", "Arabic"],
    speciality: ["group-tours", "Morocco", "Tunisia", "luxury"],
    groupCapacity: { min: 15, max: 60 },
    priceRange: "midrange",
    destinations: ["YUL→RAK", "YUL→TUN", "YUL→DXB", "YUL→IST"],
    contact: {
      phone: "+1-514-000-7890",
      email: "groupes@marlintravel.ca",
      website: "https://marlintravel.ca",
      whatsapp: "+1-514-000-7891"
    },
    commission: { typical: 24, negotiable: true },
    rating: 8.7,
    notes: "مونتريال = جالية مغاربية كبيرة ناطقة بالفرنسية. سوق مثالي.",
    tags: ["canada", "montreal", "french", "north-africa", "arabic-speaking"]
  },

  // ════════════════════════════════════════════════
  // 🇦🇪 الإمارات
  // ════════════════════════════════════════════════
  {
    id: "ae-001",
    name: "dnata Travel",
    country: "UAE", city: "Dubai",
    language: ["Arabic", "English", "Hindi", "Urdu"],
    speciality: ["ultra-luxury", "group-tours", "global", "corporate"],
    groupCapacity: { min: 10, max: 200 },
    priceRange: "ultra-luxury",
    destinations: ["DXB→LHR", "DXB→CDG", "DXB→JFK", "DXB→NRT", "DXB→SIN"],
    contact: {
      phone: "+971-4-316-6666",
      email: "groups@dnata.com",
      website: "https://dnata.com",
    },
    commission: { typical: 15, negotiable: true },
    rating: 9.4,
    notes: "ذراع السياحة لمجموعة الإمارات. عملاء من النخبة العالمية. أرقام ضخمة جداً.",
    tags: ["ultra-luxury", "uae", "global", "corporate", "top-partner"]
  },
  {
    id: "ae-002",
    name: "Al Tayyar Travel UAE",
    country: "UAE", city: "Dubai",
    language: ["Arabic", "English"],
    speciality: ["group-tours", "luxury", "Europe", "Asia", "Umrah"],
    groupCapacity: { min: 15, max: 100 },
    priceRange: "luxury",
    destinations: ["DXB→CDG", "DXB→BCN", "DXB→LHR", "DXB→IST", "DXB→JED"],
    contact: {
      phone: "+971-4-295-5555",
      email: "groups@altayyar.ae",
      website: "https://altayyar.ae",
      whatsapp: "+971-50-123-4567"
    },
    commission: { typical: 22, negotiable: true },
    rating: 9.1,
    notes: "أكبر وكالة سعودية موجودة في الإمارات. شبكة ضخمة في الخليج.",
    tags: ["priority", "uae", "arabic-speaking", "luxury", "group", "umrah"]
  },
  {
    id: "ae-003",
    name: "Orient Tours Dubai",
    country: "UAE", city: "Dubai",
    language: ["Arabic", "English", "Russian"],
    speciality: ["luxury", "group-tours", "Europe", "Asia", "safari"],
    groupCapacity: { min: 10, max: 60 },
    priceRange: "luxury",
    destinations: ["DXB→CDG", "DXB→FCO", "DXB→BCN", "DXB→BKK", "DXB→SIN"],
    contact: {
      phone: "+971-4-282-8238",
      email: "groups@orienttours.ae",
      website: "https://orienttours.ae",
    },
    commission: { typical: 20, negotiable: true },
    rating: 9.0,
    tags: ["uae", "luxury", "europe", "asia", "group"]
  },

  // ════════════════════════════════════════════════
  // 🇸🇦 السعودية
  // ════════════════════════════════════════════════
  {
    id: "sa-001",
    name: "Al Tayyar Travel Group",
    country: "Saudi Arabia", city: "Riyadh",
    language: ["Arabic", "English"],
    speciality: ["group-tours", "luxury", "Umrah", "Europe", "Asia"],
    groupCapacity: { min: 20, max: 200 },
    priceRange: "luxury",
    destinations: ["RUH→LHR", "RUH→CDG", "RUH→BCN", "RUH→IST", "RUH→BKK"],
    contact: {
      phone: "+966-11-465-5555",
      email: "groups@altayyar.com.sa",
      website: "https://altayyar.com.sa",
      whatsapp: "+966-50-123-4567"
    },
    commission: { typical: 20, negotiable: true },
    rating: 9.2,
    notes: "أكبر وكالة سياحية في السعودية والشرق الأوسط. شريك استراتيجي بامتياز.",
    tags: ["top-partner", "saudi", "arabic-speaking", "luxury", "group", "umrah"]
  },
  {
    id: "sa-002",
    name: "Bein Al Haramain",
    country: "Saudi Arabia", city: "Jeddah",
    language: ["Arabic", "English", "Urdu"],
    speciality: ["Umrah", "Hajj", "group-tours", "religious-tourism"],
    groupCapacity: { min: 30, max: 500 },
    priceRange: "midrange",
    destinations: ["JED→LHR", "JED→CDG", "JED→KUL", "JED→IST"],
    contact: {
      phone: "+966-12-653-0000",
      email: "groups@beinharamain.com",
      website: "https://beinharamain.com",
      whatsapp: "+966-55-123-4567"
    },
    commission: { typical: 25, negotiable: true },
    rating: 9.0,
    notes: "متخصص في الحج والعمرة. ملايين الحجاج سنوياً. سوق لا ينضب.",
    tags: ["saudi", "umrah", "hajj", "religious", "arabic-speaking", "group"]
  },
  {
    id: "sa-003",
    name: "Seera Group",
    country: "Saudi Arabia", city: "Riyadh",
    language: ["Arabic", "English"],
    speciality: ["luxury", "group-tours", "Europe", "Asia", "corporate"],
    groupCapacity: { min: 10, max: 100 },
    priceRange: "luxury",
    destinations: ["RUH→LHR", "RUH→CDG", "RUH→NRT", "RUH→SIN", "RUH→MLE"],
    contact: {
      phone: "+966-11-000-1234",
      email: "groups@seera.sa",
      website: "https://seera.sa",
    },
    commission: { typical: 18, negotiable: true },
    rating: 9.1,
    notes: "مجموعة Seera المدرجة في السوق السعودية. عملاء من النخبة.",
    tags: ["saudi", "luxury", "corporate", "group", "high-value"]
  },

  // ════════════════════════════════════════════════
  // 🇶🇦 قطر
  // ════════════════════════════════════════════════
  {
    id: "qa-001",
    name: "Qatar Airways Holidays",
    country: "Qatar", city: "Doha",
    language: ["Arabic", "English"],
    speciality: ["ultra-luxury", "group-tours", "global", "business"],
    groupCapacity: { min: 10, max: 200 },
    priceRange: "ultra-luxury",
    destinations: ["DOH→LHR", "DOH→CDG", "DOH→JFK", "DOH→NRT", "DOH→SIN"],
    contact: {
      phone: "+974-4023-0000",
      email: "holidays@qatarairways.com.qa",
      website: "https://qatarairwaysholidays.com",
    },
    commission: { typical: 15, negotiable: false },
    rating: 9.5,
    notes: "ذراع السياحة لأفضل شركة طيران في العالم. عملاء من أعلى فئة.",
    tags: ["ultra-luxury", "qatar", "global", "corporate", "top-partner"]
  },
  {
    id: "qa-002",
    name: "Al Maha Travel Qatar",
    country: "Qatar", city: "Doha",
    language: ["Arabic", "English"],
    speciality: ["group-tours", "luxury", "Europe", "Asia", "family"],
    groupCapacity: { min: 15, max: 80 },
    priceRange: "luxury",
    destinations: ["DOH→LHR", "DOH→CDG", "DOH→BCN", "DOH→BKK", "DOH→IST"],
    contact: {
      phone: "+974-4432-0000",
      email: "groups@almahatravel.qa",
      website: "https://almahatravel.qa",
      whatsapp: "+974-5555-1234"
    },
    commission: { typical: 22, negotiable: true },
    rating: 9.0,
    tags: ["qatar", "luxury", "arabic-speaking", "group"]
  },

  // ════════════════════════════════════════════════
  // 🇰🇼 الكويت
  // ════════════════════════════════════════════════
  {
    id: "kw-001",
    name: "Al Ahmadi Travel Kuwait",
    country: "Kuwait", city: "Kuwait City",
    language: ["Arabic", "English"],
    speciality: ["luxury", "group-tours", "Europe", "Asia", "family"],
    groupCapacity: { min: 15, max: 80 },
    priceRange: "luxury",
    destinations: ["KWI→LHR", "KWI→CDG", "KWI→IST", "KWI→BKK", "KWI→MLE"],
    contact: {
      phone: "+965-2240-0000",
      email: "groups@alahmadi.com.kw",
      website: "https://alahmadi.com.kw",
      whatsapp: "+965-9999-1234"
    },
    commission: { typical: 23, negotiable: true },
    rating: 8.9,
    notes: "الكويت = أعلى دخل فردي في الخليج. عملاء يبحثون عن الفخامة.",
    tags: ["kuwait", "luxury", "arabic-speaking", "group", "high-value"]
  },

  // ════════════════════════════════════════════════
  // 🇧🇭 البحرين
  // ════════════════════════════════════════════════
  {
    id: "bh-001",
    name: "Gulf Air Holidays",
    country: "Bahrain", city: "Manama",
    language: ["Arabic", "English"],
    speciality: ["luxury", "group-tours", "Europe", "Asia"],
    groupCapacity: { min: 10, max: 60 },
    priceRange: "luxury",
    destinations: ["BAH→LHR", "BAH→CDG", "BAH→IST", "BAH→BKK"],
    contact: {
      phone: "+973-1733-0000",
      email: "holidays@gulfair.com",
      website: "https://gulfairholidays.com",
    },
    commission: { typical: 20, negotiable: true },
    rating: 8.8,
    tags: ["bahrain", "luxury", "arabic-speaking", "group"]
  },

  // ════════════════════════════════════════════════
  // 🇴🇲 عُمان
  // ════════════════════════════════════════════════
  {
    id: "om-001",
    name: "Zahara Tours Oman",
    country: "Oman", city: "Muscat",
    language: ["Arabic", "English"],
    speciality: ["luxury", "group-tours", "Europe", "Asia", "adventure"],
    groupCapacity: { min: 10, max: 50 },
    priceRange: "luxury",
    destinations: ["MCT→LHR", "MCT→CDG", "MCT→IST", "MCT→BKK", "MCT→MLE"],
    contact: {
      phone: "+968-2459-0000",
      email: "groups@zaharatours.om",
      website: "https://zaharatours.om",
      whatsapp: "+968-9999-1234"
    },
    commission: { typical: 22, negotiable: true },
    rating: 8.9,
    tags: ["oman", "luxury", "arabic-speaking", "group", "adventure"]
  },

  // ════════════════════════════════════════════════
  // 🇵🇹 البرتغال
  // ════════════════════════════════════════════════
  {
    id: "pt-001",
    name: "Abreu Travel",
    country: "Portugal", city: "Lisbon",
    language: ["Portuguese", "Spanish", "Arabic", "English"],
    speciality: ["group-tours", "Morocco", "Middle-East", "luxury"],
    groupCapacity: { min: 15, max: 80 },
    priceRange: "midrange",
    destinations: ["LIS→RAK", "LIS→CMN", "LIS→DXB", "LIS→IST"],
    contact: {
      phone: "+351-21-415-5555",
      email: "grupos@abreu.pt",
      website: "https://abreu.pt",
    },
    commission: { typical: 23, negotiable: true },
    rating: 8.7,
    notes: "أقدم وكالة سياحية في العالم. البرتغال قريبة من المغرب جغرافياً.",
    tags: ["portugal", "morocco", "group", "historic"]
  },
];

// ══════════════════════════════════════════════════════
// دوال البحث والتحليل
// ══════════════════════════════════════════════════════

// أفضل الشركاء للمسار المحدد
export function findAgenciesForRoute(
  fromIata: string,
  toIata: string
): Agency[] {
  const route = `${fromIata}→${toIata}`;
  return AGENCIES_DB
    .filter(a => a.destinations.some(d =>
      d.includes(fromIata) || d.includes(toIata)
    ))
    .sort((a, b) => b.commission.typical - a.commission.typical);
}

// الوكالات حسب الدولة
export function getAgenciesByCountry(country: string): Agency[] {
  return AGENCIES_DB
    .filter(a => a.country.toLowerCase().includes(country.toLowerCase()))
    .sort((a, b) => b.rating - a.rating);
}

// الوكالات الناطقة بالعربية
export function getArabicSpeakingAgencies(): Agency[] {
  return AGENCIES_DB
    .filter(a => a.language.includes("Arabic"))
    .sort((a, b) => b.commission.typical - a.commission.typical);
}

// الوكالات ذات الأولوية
export function getPriorityAgencies(): Agency[] {
  return AGENCIES_DB
    .filter(a => a.tags.includes("priority") || a.tags.includes("top-partner"))
    .sort((a, b) => b.commission.typical - a.commission.typical);
}

// الوكالات المتخصصة في الحلال
export function getHalalSpecialistAgencies(): Agency[] {
  return AGENCIES_DB
    .filter(a =>
      a.tags.includes("halal") ||
      a.tags.includes("umrah") ||
      a.speciality.includes("halal-travel")
    )
    .sort((a, b) => b.rating - a.rating);
}

// حساب العمولة المتوقعة
export function calculateCommission(
  agencyId: string,
  passengers: number,
  pricePerPerson: number
): { gross: number; commission: number; net: number } {
  const agency = AGENCIES_DB.find(a => a.id === agencyId);
  if (!agency) return { gross: 0, commission: 0, net: 0 };

  const gross = passengers * pricePerPerson;
  const commission = gross * (agency.commission.typical / 100);
  const net = gross - commission;

  return { gross, commission, net };
}

// إحصائيات قاعدة البيانات
export const AGENCY_STATS = {
  total: AGENCIES_DB.length,
  byCountry: AGENCIES_DB.reduce((acc, a) => {
    acc[a.country] = (acc[a.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  byPriceRange: AGENCIES_DB.reduce((acc, a) => {
    acc[a.priceRange] = (acc[a.priceRange] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  arabicSpeaking: AGENCIES_DB.filter(a => a.language.includes("Arabic")).length,
  halalSpecialist: AGENCIES_DB.filter(a => a.tags.includes("halal")).length,
  topPartners: AGENCIES_DB.filter(a => a.tags.includes("top-partner")).length,
  avgCommission: Math.round(
    AGENCIES_DB.reduce((sum, a) => sum + a.commission.typical, 0) / AGENCIES_DB.length
  )
};