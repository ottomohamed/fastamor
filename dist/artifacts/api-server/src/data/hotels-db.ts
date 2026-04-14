// ═══════════════════════════════════════════════════════
// قاعدة بيانات الفنادق - Fastamor AI
// أشهر الوجهات السياحية العالمية
// بدون AI - روابط حجز مباشرة
// ═══════════════════════════════════════════════════════

export interface Hotel {
  id: string;
  name: string;
  city: string;
  cityIata: string;
  country: string;
  stars: 1 | 2 | 3 | 4 | 5;
  category: "budget" | "midrange" | "luxury" | "resort" | "boutique";
  pricePerNight: { min: number; max: number; currency: "USD" };
  rating: number; // من 10
  highlights: { ar: string; en: string; fr: string; es: string };
  amenities: string[];
  bookingUrl: string;
  hotelsUrl: string;
  expediaUrl: string;
  image?: string;
  tags: string[];
}

// ═══════════════════════════════════════════════════════
// دالة بناء روابط الحجز
// ═══════════════════════════════════════════════════════
function bookingLink(city: string, checkIn = "", checkOut = "", adults = "2"): string {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=${adults}&no_rooms=1`;
}

function hotelsLink(city: string, checkIn = "", checkOut = ""): string {
  return `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(city)}&q-check-in=${checkIn}&q-check-out=${checkOut}&q-rooms=1&q-room-0-adults=2`;
}

function expediaLink(city: string, checkIn = "", checkOut = ""): string {
  return `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(city)}&startDate=${checkIn}&endDate=${checkOut}&adults=2`;
}

// ═══════════════════════════════════════════════════════
// قاعدة البيانات الرئيسية
// ═══════════════════════════════════════════════════════
export const HOTELS_DB: Hotel[] = [

  // ══════════════════════════════════════════
  // دبي - Dubai
  // ══════════════════════════════════════════
  {
    id: "dxb-001",
    name: "Burj Al Arab Jumeirah",
    city: "Dubai", cityIata: "DXB", country: "UAE",
    stars: 5, category: "luxury",
    pricePerNight: { min: 1500, max: 5000, currency: "USD" },
    rating: 9.5,
    highlights: {
      ar: "أفخم فندق في العالم على شكل شراع، خدمة استثنائية وإطلالة بحرية لا تُنسى",
      en: "World's most luxurious hotel shaped like a sail, exceptional service and unforgettable sea views",
      fr: "L'hôtel le plus luxueux au monde en forme de voile, service exceptionnel et vues mer inoubliables",
      es: "El hotel más lujoso del mundo con forma de vela, servicio excepcional y vistas al mar inolvidables"
    },
    amenities: ["pool", "spa", "beach", "butler", "helipad", "michelin-restaurant"],
    bookingUrl: bookingLink("Burj Al Arab Dubai"),
    hotelsUrl: hotelsLink("Dubai"),
    expediaUrl: expediaLink("Dubai"),
    tags: ["luxury", "iconic", "beach", "honeymoon", "dubai"]
  },
  {
    id: "dxb-002",
    name: "Atlantis The Palm",
    city: "Dubai", cityIata: "DXB", country: "UAE",
    stars: 5, category: "resort",
    pricePerNight: { min: 400, max: 1200, currency: "USD" },
    rating: 8.8,
    highlights: {
      ar: "منتجع عائلي استثنائي على نخلة جميرا مع أكبر حديقة مائية في الشرق الأوسط",
      en: "Exceptional family resort on Palm Jumeirah with the largest water park in the Middle East",
      fr: "Resort familial exceptionnel sur Palm Jumeirah avec le plus grand parc aquatique du Moyen-Orient",
      es: "Resort familiar excepcional en Palm Jumeirah con el parque acuático más grande del Medio Oriente"
    },
    amenities: ["waterpark", "pool", "beach", "kids-club", "casino", "spa", "aquarium"],
    bookingUrl: bookingLink("Atlantis The Palm Dubai"),
    hotelsUrl: hotelsLink("Dubai Palm Jumeirah"),
    expediaUrl: expediaLink("Dubai"),
    tags: ["family", "resort", "waterpark", "beach", "dubai"]
  },
  {
    id: "dxb-003",
    name: "Address Downtown Dubai",
    city: "Dubai", cityIata: "DXB", country: "UAE",
    stars: 5, category: "luxury",
    pricePerNight: { min: 300, max: 800, currency: "USD" },
    rating: 9.1,
    highlights: {
      ar: "في قلب دبي مع إطلالة مباشرة على برج خليفة ونافورة دبي الراقصة",
      en: "In the heart of Dubai with direct views of Burj Khalifa and Dubai Fountain",
      fr: "Au cœur de Dubaï avec vue directe sur le Burj Khalifa et la fontaine de Dubaï",
      es: "En el corazón de Dubái con vistas directas al Burj Khalifa y la Fuente de Dubái"
    },
    amenities: ["pool", "spa", "gym", "restaurant", "burj-khalifa-view", "mall-access"],
    bookingUrl: bookingLink("Address Downtown Dubai"),
    hotelsUrl: hotelsLink("Dubai Downtown"),
    expediaUrl: expediaLink("Dubai Downtown"),
    tags: ["luxury", "central", "burj-khalifa-view", "business", "dubai"]
  },
  {
    id: "dxb-004",
    name: "Premier Inn Dubai Airport",
    city: "Dubai", cityIata: "DXB", country: "UAE",
    stars: 3, category: "budget",
    pricePerNight: { min: 60, max: 120, currency: "USD" },
    rating: 8.2,
    highlights: {
      ar: "فندق اقتصادي ممتاز قريب من المطار، مثالي للعبور أو الزيارات القصيرة",
      en: "Excellent budget hotel near airport, ideal for transit or short visits",
      fr: "Excellent hôtel économique près de l'aéroport, idéal pour les escales ou les courtes visites",
      es: "Excelente hotel económico cerca del aeropuerto, ideal para escalas o visitas cortas"
    },
    amenities: ["pool", "gym", "restaurant", "airport-shuttle", "wifi"],
    bookingUrl: bookingLink("Premier Inn Dubai Airport"),
    hotelsUrl: hotelsLink("Dubai Airport"),
    expediaUrl: expediaLink("Dubai Airport"),
    tags: ["budget", "airport", "transit", "dubai"]
  },

  // ══════════════════════════════════════════
  // باريس - Paris
  // ══════════════════════════════════════════
  {
    id: "cdg-001",
    name: "Hôtel Ritz Paris",
    city: "Paris", cityIata: "CDG", country: "France",
    stars: 5, category: "luxury",
    pricePerNight: { min: 1200, max: 4000, currency: "USD" },
    rating: 9.4,
    highlights: {
      ar: "أسطورة الفنادق الباريسية في قلب Place Vendôme، الفخامة الفرنسية بأجمل صورها",
      en: "Legendary Parisian hotel in the heart of Place Vendôme, French luxury at its finest",
      fr: "L'hôtel légendaire parisien au cœur de la Place Vendôme, le luxe français dans toute sa splendeur",
      es: "El legendario hotel parisino en el corazón de la Place Vendôme, el lujo francés en su máxima expresión"
    },
    amenities: ["spa", "pool", "michelin-restaurant", "bar", "concierge", "butler"],
    bookingUrl: bookingLink("Ritz Paris"),
    hotelsUrl: hotelsLink("Paris Vendome"),
    expediaUrl: expediaLink("Paris"),
    tags: ["luxury", "iconic", "historic", "paris", "honeymoon"]
  },
  {
    id: "cdg-002",
    name: "Le Marais Boutique Hotel",
    city: "Paris", cityIata: "CDG", country: "France",
    stars: 4, category: "boutique",
    pricePerNight: { min: 180, max: 350, currency: "USD" },
    rating: 8.9,
    highlights: {
      ar: "فندق بوتيك ساحر في حي لو ماريه العريق، قريب من المتاحف والمطاعم الأفضل",
      en: "Charming boutique hotel in historic Le Marais district, close to museums and best restaurants",
      fr: "Charmant hôtel boutique dans le quartier historique du Marais, proche des musées et des meilleurs restaurants",
      es: "Encantador hotel boutique en el histórico barrio Le Marais, cerca de museos y los mejores restaurantes"
    },
    amenities: ["bar", "concierge", "wifi", "breakfast"],
    bookingUrl: bookingLink("Hotel Le Marais Paris"),
    hotelsUrl: hotelsLink("Paris Le Marais"),
    expediaUrl: expediaLink("Paris Marais"),
    tags: ["boutique", "central", "romantic", "paris", "culture"]
  },
  {
    id: "cdg-003",
    name: "ibis Paris Gare du Nord",
    city: "Paris", cityIata: "CDG", country: "France",
    stars: 2, category: "budget",
    pricePerNight: { min: 70, max: 140, currency: "USD" },
    rating: 7.8,
    highlights: {
      ar: "فندق اقتصادي مريح بالقرب من محطة القطار الشمالية، سهولة التنقل في كل أنحاء باريس",
      en: "Comfortable budget hotel near Gare du Nord station, easy access to all of Paris",
      fr: "Hôtel économique confortable près de la Gare du Nord, accès facile à tout Paris",
      es: "Hotel económico confortable cerca de la Estación del Norte, fácil acceso a todo París"
    },
    amenities: ["wifi", "restaurant", "bar", "metro-access"],
    bookingUrl: bookingLink("ibis Paris Gare du Nord"),
    hotelsUrl: hotelsLink("Paris Gare du Nord"),
    expediaUrl: expediaLink("Paris"),
    tags: ["budget", "central", "transport", "paris"]
  },

  // ══════════════════════════════════════════
  // لندن - London
  // ══════════════════════════════════════════
  {
    id: "lhr-001",
    name: "The Savoy",
    city: "London", cityIata: "LHR", country: "UK",
    stars: 5, category: "luxury",
    pricePerNight: { min: 700, max: 2500, currency: "USD" },
    rating: 9.3,
    highlights: {
      ar: "أيقونة الفنادق اللندنية منذ 1889، على ضفاف نهر التايمز مع إطلالات بانورامية رائعة",
      en: "London's iconic hotel since 1889, on the Thames with stunning panoramic views",
      fr: "L'hôtel iconique de Londres depuis 1889, sur la Tamise avec de superbes vues panoramiques",
      es: "El hotel icónico de Londres desde 1889, a orillas del Támesis con impresionantes vistas panorámicas"
    },
    amenities: ["spa", "pool", "michelin-restaurant", "bar", "theater-access", "butler"],
    bookingUrl: bookingLink("The Savoy London"),
    hotelsUrl: hotelsLink("London West End"),
    expediaUrl: expediaLink("London"),
    tags: ["luxury", "iconic", "historic", "london", "thames-view"]
  },
  {
    id: "lhr-002",
    name: "Premier Inn London City",
    city: "London", cityIata: "LHR", country: "UK",
    stars: 3, category: "budget",
    pricePerNight: { min: 100, max: 200, currency: "USD" },
    rating: 8.4,
    highlights: {
      ar: "أفضل قيمة في لندن، موقع مركزي ممتاز وغرف نظيفة ومريحة",
      en: "Best value in London, excellent central location and clean comfortable rooms",
      fr: "Meilleur rapport qualité-prix à Londres, excellent emplacement central et chambres propres et confortables",
      es: "La mejor relación calidad-precio en Londres, excelente ubicación central y habitaciones limpias y cómodas"
    },
    amenities: ["wifi", "restaurant", "bar", "tube-access"],
    bookingUrl: bookingLink("Premier Inn London City"),
    hotelsUrl: hotelsLink("London City"),
    expediaUrl: expediaLink("London"),
    tags: ["budget", "central", "transport", "london"]
  },

  // ══════════════════════════════════════════
  // مراكش - Marrakech
  // ══════════════════════════════════════════
  {
    id: "rak-001",
    name: "La Mamounia",
    city: "Marrakech", cityIata: "RAK", country: "Morocco",
    stars: 5, category: "luxury",
    pricePerNight: { min: 500, max: 2000, currency: "USD" },
    rating: 9.6,
    highlights: {
      ar: "أسطورة الفنادق المغربية منذ 1923، حدائق فارهة وسبا استثنائي وتصميم أندلسي ساحر",
      en: "Moroccan hotel legend since 1923, lush gardens, exceptional spa and enchanting Andalusian design",
      fr: "Légende hôtelière marocaine depuis 1923, jardins luxuriants, spa exceptionnel et design andalou enchanteur",
      es: "Leyenda hotelera marroquí desde 1923, exuberantes jardines, spa excepcional y encantador diseño andaluz"
    },
    amenities: ["pool", "spa", "garden", "restaurant", "hammam", "tennis", "casino"],
    bookingUrl: bookingLink("La Mamounia Marrakech"),
    hotelsUrl: hotelsLink("Marrakech"),
    expediaUrl: expediaLink("Marrakech"),
    tags: ["luxury", "iconic", "historic", "marrakech", "garden", "honeymoon"]
  },
  {
    id: "rak-002",
    name: "Riad Yasmine",
    city: "Marrakech", cityIata: "RAK", country: "Morocco",
    stars: 4, category: "boutique",
    pricePerNight: { min: 120, max: 280, currency: "USD" },
    rating: 9.2,
    highlights: {
      ar: "رياض تقليدي ساحر في قلب المدينة القديمة، حمام سباحة لا يُنسى وأجواء مغربية أصيلة",
      en: "Charming traditional riad in the heart of the old medina, unforgettable pool and authentic Moroccan atmosphere",
      fr: "Charmant riad traditionnel au cœur de la vieille médina, piscine inoubliable et atmosphère marocaine authentique",
      es: "Encantador riad tradicional en el corazón de la medina antigua, piscina inolvidable y atmósfera marroquí auténtica"
    },
    amenities: ["pool", "hammam", "rooftop", "breakfast", "concierge"],
    bookingUrl: bookingLink("Riad Yasmine Marrakech"),
    hotelsUrl: hotelsLink("Marrakech Medina"),
    expediaUrl: expediaLink("Marrakech"),
    tags: ["boutique", "riad", "authentic", "marrakech", "romantic", "medina"]
  },
  {
    id: "rak-003",
    name: "Ibis Marrakech Centre",
    city: "Marrakech", cityIata: "RAK", country: "Morocco",
    stars: 3, category: "budget",
    pricePerNight: { min: 45, max: 90, currency: "USD" },
    rating: 7.9,
    highlights: {
      ar: "فندق اقتصادي مريح في وسط مراكش، قريب من جامع الفنا والأسواق الشهيرة",
      en: "Comfortable budget hotel in central Marrakech, close to Jemaa el-Fna and famous souks",
      fr: "Hôtel économique confortable au centre de Marrakech, proche de la place Jemaa el-Fna et des souks",
      es: "Hotel económico confortable en el centro de Marrakech, cerca de la plaza Jemaa el-Fna y los zocos"
    },
    amenities: ["pool", "restaurant", "bar", "wifi", "parking"],
    bookingUrl: bookingLink("ibis Marrakech Centre"),
    hotelsUrl: hotelsLink("Marrakech Centre"),
    expediaUrl: expediaLink("Marrakech"),
    tags: ["budget", "central", "marrakech"]
  },

  // ══════════════════════════════════════════
  // إسطنبول - Istanbul
  // ══════════════════════════════════════════
  {
    id: "ist-001",
    name: "Four Seasons Istanbul at Sultanahmet",
    city: "Istanbul", cityIata: "IST", country: "Turkey",
    stars: 5, category: "luxury",
    pricePerNight: { min: 600, max: 1800, currency: "USD" },
    rating: 9.5,
    highlights: {
      ar: "فندق فاخر في قلب إسطنبول التاريخية، مع إطلالة مذهلة على آيا صوفيا والمسجد الأزرق",
      en: "Luxury hotel in historic Istanbul with stunning views of Hagia Sophia and Blue Mosque",
      fr: "Hôtel de luxe au cœur d'Istanbul historique avec des vues époustouflantes sur Sainte-Sophie et la Mosquée Bleue",
      es: "Hotel de lujo en el histórico Estambul con impresionantes vistas de Hagia Sophia y la Mezquita Azul"
    },
    amenities: ["spa", "pool", "restaurant", "bar", "historic-views", "butler"],
    bookingUrl: bookingLink("Four Seasons Istanbul Sultanahmet"),
    hotelsUrl: hotelsLink("Istanbul Sultanahmet"),
    expediaUrl: expediaLink("Istanbul"),
    tags: ["luxury", "historic", "istanbul", "hagia-sophia-view", "honeymoon"]
  },
  {
    id: "ist-002",
    name: "Ciragan Palace Kempinski",
    city: "Istanbul", cityIata: "IST", country: "Turkey",
    stars: 5, category: "luxury",
    pricePerNight: { min: 500, max: 1500, currency: "USD" },
    rating: 9.3,
    highlights: {
      ar: "قصر عثماني تاريخي على ضفاف البوسفور، تجربة ملكية لا مثيل لها في إسطنبول",
      en: "Historic Ottoman palace on the Bosphorus shores, an unparalleled royal experience in Istanbul",
      fr: "Palais ottoman historique sur les rives du Bosphore, une expérience royale sans égale à Istanbul",
      es: "Palacio otomano histórico a orillas del Bósforo, una experiencia real sin igual en Estambul"
    },
    amenities: ["pool", "spa", "bosphorus-view", "restaurant", "bar", "hammam"],
    bookingUrl: bookingLink("Ciragan Palace Kempinski Istanbul"),
    hotelsUrl: hotelsLink("Istanbul Bosphorus"),
    expediaUrl: expediaLink("Istanbul"),
    tags: ["luxury", "palace", "bosphorus-view", "istanbul", "historic"]
  },
  {
    id: "ist-003",
    name: "Grand Bazaar Boutique Hotel",
    city: "Istanbul", cityIata: "IST", country: "Turkey",
    stars: 3, category: "boutique",
    pricePerNight: { min: 80, max: 160, currency: "USD" },
    rating: 8.6,
    highlights: {
      ar: "فندق بوتيك دافئ بالقرب من البازار الكبير والمواقع التاريخية الرئيسية",
      en: "Warm boutique hotel near the Grand Bazaar and main historical sites",
      fr: "Chaleureux hôtel boutique près du Grand Bazar et des principaux sites historiques",
      es: "Cálido hotel boutique cerca del Gran Bazar y los principales sitios históricos"
    },
    amenities: ["rooftop", "breakfast", "wifi", "concierge"],
    bookingUrl: bookingLink("Hotel Grand Bazaar Istanbul"),
    hotelsUrl: hotelsLink("Istanbul Old City"),
    expediaUrl: expediaLink("Istanbul"),
    tags: ["boutique", "central", "historic", "istanbul", "budget-friendly"]
  },

  // ══════════════════════════════════════════
  // برشلونة - Barcelona
  // ══════════════════════════════════════════
  {
    id: "bcn-001",
    name: "Hotel Arts Barcelona",
    city: "Barcelona", cityIata: "BCN", country: "Spain",
    stars: 5, category: "luxury",
    pricePerNight: { min: 400, max: 1200, currency: "USD" },
    rating: 9.1,
    highlights: {
      ar: "ناطحة سحاب فاخرة على شاطئ برشلونة مع إطلالة بانورامية على البحر المتوسط",
      en: "Luxury skyscraper on Barcelona beach with panoramic views of the Mediterranean",
      fr: "Gratte-ciel de luxe sur la plage de Barcelone avec vue panoramique sur la Méditerranée",
      es: "Rascacielos de lujo en la playa de Barcelona con vistas panorámicas al Mediterráneo"
    },
    amenities: ["pool", "spa", "beach", "michelin-restaurant", "bar", "gym"],
    bookingUrl: bookingLink("Hotel Arts Barcelona"),
    hotelsUrl: hotelsLink("Barcelona Barceloneta"),
    expediaUrl: expediaLink("Barcelona"),
    tags: ["luxury", "beach", "sea-view", "barcelona", "modern"]
  },
  {
    id: "bcn-002",
    name: "Casa Camper Barcelona",
    city: "Barcelona", cityIata: "BCN", country: "Spain",
    stars: 4, category: "boutique",
    pricePerNight: { min: 200, max: 400, currency: "USD" },
    rating: 8.8,
    highlights: {
      ar: "فندق بوتيك عصري في حي الرامبلا الشهير، تصميم مبتكر وموقع لا يُضاهى",
      en: "Modern boutique hotel in the famous La Rambla district, innovative design and unbeatable location",
      fr: "Hôtel boutique moderne dans le célèbre quartier de La Rambla, design innovant et emplacement imbattable",
      es: "Hotel boutique moderno en el famoso barrio de La Rambla, diseño innovador y ubicación inmejorable"
    },
    amenities: ["restaurant", "bar", "wifi", "concierge", "free-snacks-24h"],
    bookingUrl: bookingLink("Casa Camper Barcelona"),
    hotelsUrl: hotelsLink("Barcelona Ramblas"),
    expediaUrl: expediaLink("Barcelona"),
    tags: ["boutique", "design", "central", "barcelona", "ramblas"]
  },
  {
    id: "bcn-003",
    name: "Generator Barcelona",
    city: "Barcelona", cityIata: "BCN", country: "Spain",
    stars: 2, category: "budget",
    pricePerNight: { min: 30, max: 100, currency: "USD" },
    rating: 8.3,
    highlights: {
      ar: "هوستيل عصري ومريح للمسافرين الشباب في قلب برشلونة، أجواء اجتماعية رائعة",
      en: "Modern and comfortable hostel for young travelers in the heart of Barcelona, great social atmosphere",
      fr: "Auberge moderne et confortable pour jeunes voyageurs au cœur de Barcelone, super ambiance sociale",
      es: "Hostal moderno y cómodo para jóvenes viajeros en el corazón de Barcelona, genial ambiente social"
    },
    amenities: ["bar", "wifi", "lounge", "rooftop", "shared-kitchen"],
    bookingUrl: bookingLink("Generator Hostel Barcelona"),
    hotelsUrl: hotelsLink("Barcelona"),
    expediaUrl: expediaLink("Barcelona"),
    tags: ["budget", "hostel", "young", "social", "barcelona"]
  },

  // ══════════════════════════════════════════
  // روما - Rome
  // ══════════════════════════════════════════
  {
    id: "fco-001",
    name: "Hotel de Russie",
    city: "Rome", cityIata: "FCO", country: "Italy",
    stars: 5, category: "luxury",
    pricePerNight: { min: 700, max: 2000, currency: "USD" },
    rating: 9.4,
    highlights: {
      ar: "جوهرة روما الفاخرة بالقرب من ساحة الشعب، حديقة سرية ساحرة وسبا استثنائي",
      en: "Rome's luxurious gem near Piazza del Popolo, enchanting secret garden and exceptional spa",
      fr: "Joyau luxueux de Rome près de la Piazza del Popolo, jardin secret enchanteur et spa exceptionnel",
      es: "Joya lujosa de Roma cerca de la Piazza del Popolo, encantador jardín secreto y spa excepcional"
    },
    amenities: ["garden", "spa", "pool", "restaurant", "bar", "butler"],
    bookingUrl: bookingLink("Hotel de Russie Rome"),
    hotelsUrl: hotelsLink("Rome Centro"),
    expediaUrl: expediaLink("Rome"),
    tags: ["luxury", "iconic", "rome", "garden", "honeymoon", "historic"]
  },
  {
    id: "fco-002",
    name: "The Inn at the Roman Forum",
    city: "Rome", cityIata: "FCO", country: "Italy",
    stars: 4, category: "boutique",
    pricePerNight: { min: 250, max: 500, currency: "USD" },
    rating: 9.0,
    highlights: {
      ar: "فندق بوتيك فريد بجانب المنتدى الروماني، يمكنك مشاهدة الآثار القديمة من غرفتك",
      en: "Unique boutique hotel next to the Roman Forum, you can see ancient ruins from your room",
      fr: "Hôtel boutique unique à côté du Forum Romain, vous pouvez voir les ruines antiques depuis votre chambre",
      es: "Único hotel boutique junto al Foro Romano, puedes ver las ruinas antiguas desde tu habitación"
    },
    amenities: ["rooftop", "breakfast", "wifi", "concierge", "historic-views"],
    bookingUrl: bookingLink("The Inn at Roman Forum Rome"),
    hotelsUrl: hotelsLink("Rome Forum"),
    expediaUrl: expediaLink("Rome"),
    tags: ["boutique", "historic", "rome", "ruins-view", "romantic"]
  },

  // ══════════════════════════════════════════
  // بانكوك - Bangkok
  // ══════════════════════════════════════════
  {
    id: "bkk-001",
    name: "Mandarin Oriental Bangkok",
    city: "Bangkok", cityIata: "BKK", country: "Thailand",
    stars: 5, category: "luxury",
    pricePerNight: { min: 400, max: 1200, currency: "USD" },
    rating: 9.5,
    highlights: {
      ar: "أقدم وأرقى فنادق بانكوك على ضفاف نهر تشاو فرايا، تاريخ عريق وخدمة لا تُنسى",
      en: "Bangkok's oldest and most prestigious hotel on the Chao Phraya River, rich history and unforgettable service",
      fr: "L'hôtel le plus ancien et le plus prestigieux de Bangkok sur le fleuve Chao Phraya, histoire riche et service inoubliable",
      es: "El hotel más antiguo y prestigioso de Bangkok a orillas del río Chao Phraya, rica historia y servicio inolvidable"
    },
    amenities: ["pool", "spa", "river-view", "michelin-restaurant", "bar", "boat-shuttle"],
    bookingUrl: bookingLink("Mandarin Oriental Bangkok"),
    hotelsUrl: hotelsLink("Bangkok Riverside"),
    expediaUrl: expediaLink("Bangkok"),
    tags: ["luxury", "iconic", "historic", "bangkok", "river-view", "honeymoon"]
  },
  {
    id: "bkk-002",
    name: "ibis Bangkok Sukhumvit",
    city: "Bangkok", cityIata: "BKK", country: "Thailand",
    stars: 3, category: "budget",
    pricePerNight: { min: 40, max: 90, currency: "USD" },
    rating: 8.3,
    highlights: {
      ar: "فندق اقتصادي ممتاز في حي سوكومفيت النابض بالحياة، قريب من المترو والمطاعم",
      en: "Excellent budget hotel in vibrant Sukhumvit district, close to BTS metro and restaurants",
      fr: "Excellent hôtel économique dans le quartier animé de Sukhumvit, proche du BTS et des restaurants",
      es: "Excelente hotel económico en el animado distrito de Sukhumvit, cerca del BTS y restaurantes"
    },
    amenities: ["pool", "restaurant", "bar", "bts-access", "wifi"],
    bookingUrl: bookingLink("ibis Bangkok Sukhumvit"),
    hotelsUrl: hotelsLink("Bangkok Sukhumvit"),
    expediaUrl: expediaLink("Bangkok"),
    tags: ["budget", "central", "transport", "bangkok", "nightlife"]
  },

  // ══════════════════════════════════════════
  // القاهرة - Cairo
  // ══════════════════════════════════════════
  {
    id: "cai-001",
    name: "Four Seasons Cairo at The First Residence",
    city: "Cairo", cityIata: "CAI", country: "Egypt",
    stars: 5, category: "luxury",
    pricePerNight: { min: 300, max: 800, currency: "USD" },
    rating: 9.2,
    highlights: {
      ar: "فندق فاخر على ضفاف النيل مع إطلالة على الأهرامات، أفضل فندق في القاهرة",
      en: "Luxury hotel on the Nile banks with pyramid views, the best hotel in Cairo",
      fr: "Hôtel de luxe sur les rives du Nil avec vue sur les pyramides, le meilleur hôtel du Caire",
      es: "Hotel de lujo a orillas del Nilo con vistas a las pirámides, el mejor hotel de El Cairo"
    },
    amenities: ["pool", "spa", "nile-view", "pyramid-view", "restaurant", "bar"],
    bookingUrl: bookingLink("Four Seasons Cairo First Residence"),
    hotelsUrl: hotelsLink("Cairo Giza"),
    expediaUrl: expediaLink("Cairo"),
    tags: ["luxury", "nile-view", "pyramid-view", "cairo", "historic"]
  },
  {
    id: "cai-002",
    name: "Kempinski Nile Hotel Cairo",
    city: "Cairo", cityIata: "CAI", country: "Egypt",
    stars: 5, category: "luxury",
    pricePerNight: { min: 200, max: 500, currency: "USD" },
    rating: 8.9,
    highlights: {
      ar: "فندق عصري فاخر في قلب القاهرة على كورنيش النيل، مطاعم متنوعة وسبا راقي",
      en: "Modern luxury hotel in the heart of Cairo on the Nile Corniche, diverse restaurants and upscale spa",
      fr: "Hôtel de luxe moderne au cœur du Caire sur la Corniche du Nil, restaurants variés et spa haut de gamme",
      es: "Hotel moderno de lujo en el corazón de El Cairo en la Corniche del Nilo, restaurantes variados y spa de lujo"
    },
    amenities: ["pool", "spa", "nile-view", "restaurant", "bar", "gym"],
    bookingUrl: bookingLink("Kempinski Nile Hotel Cairo"),
    hotelsUrl: hotelsLink("Cairo Nile"),
    expediaUrl: expediaLink("Cairo"),
    tags: ["luxury", "nile-view", "cairo", "modern", "business"]
  },

  // ══════════════════════════════════════════
  // نيويورك - New York
  // ══════════════════════════════════════════
  {
    id: "jfk-001",
    name: "The Plaza Hotel",
    city: "New York", cityIata: "JFK", country: "USA",
    stars: 5, category: "luxury",
    pricePerNight: { min: 800, max: 3000, currency: "USD" },
    rating: 9.3,
    highlights: {
      ar: "أيقونة نيويورك الأسطورية على حافة Central Park، الفخامة الأمريكية في أجمل صورها",
      en: "New York's legendary icon on the edge of Central Park, American luxury at its finest",
      fr: "L'icône légendaire de New York en bordure de Central Park, le luxe américain dans toute sa splendeur",
      es: "El ícono legendario de Nueva York en el borde de Central Park, el lujo americano en su máxima expresión"
    },
    amenities: ["spa", "pool", "michelin-restaurant", "bar", "central-park-view", "butler"],
    bookingUrl: bookingLink("The Plaza Hotel New York"),
    hotelsUrl: hotelsLink("New York Midtown"),
    expediaUrl: expediaLink("New York"),
    tags: ["luxury", "iconic", "historic", "new-york", "central-park", "honeymoon"]
  },
  {
    id: "jfk-002",
    name: "Pod 51 Hotel",
    city: "New York", cityIata: "JFK", country: "USA",
    stars: 2, category: "budget",
    pricePerNight: { min: 100, max: 200, currency: "USD" },
    rating: 8.1,
    highlights: {
      ar: "فندق اقتصادي ذكي في وسط مانهاتن، غرف مدمجة أنيقة بأسعار معقولة لمدينة نيويورك",
      en: "Smart budget hotel in midtown Manhattan, stylish compact rooms at reasonable NYC prices",
      fr: "Hôtel économique intelligent à Midtown Manhattan, chambres compactes stylées à des prix raisonnables pour NYC",
      es: "Hotel económico inteligente en Midtown Manhattan, habitaciones compactas y elegantes a precios razonables para NYC"
    },
    amenities: ["wifi", "rooftop-bar", "restaurant", "subway-access"],
    bookingUrl: bookingLink("Pod 51 Hotel New York"),
    hotelsUrl: hotelsLink("New York Manhattan"),
    expediaUrl: expediaLink("New York"),
    tags: ["budget", "central", "smart", "new-york", "midtown"]
  },

  // ══════════════════════════════════════════
  // بالي - Bali
  // ══════════════════════════════════════════
  {
    id: "dps-001",
    name: "Four Seasons Bali at Sayan",
    city: "Bali", cityIata: "DPS", country: "Indonesia",
    stars: 5, category: "resort",
    pricePerNight: { min: 700, max: 2000, currency: "USD" },
    rating: 9.7,
    highlights: {
      ar: "المنتجع الأكثر رومانسية في العالم في قلب الغابة المطيرة بوادي أوبود الساحر",
      en: "The world's most romantic resort in the heart of the rainforest in enchanting Ubud Valley",
      fr: "Le resort le plus romantique au monde au cœur de la forêt tropicale dans l'enchanteur Vallée d'Ubud",
      es: "El resort más romántico del mundo en el corazón de la selva tropical en el encantador Valle de Ubud"
    },
    amenities: ["infinity-pool", "spa", "yoga", "jungle-view", "restaurant", "butler"],
    bookingUrl: bookingLink("Four Seasons Bali Sayan Ubud"),
    hotelsUrl: hotelsLink("Bali Ubud"),
    expediaUrl: expediaLink("Bali Ubud"),
    tags: ["luxury", "romantic", "jungle", "bali", "honeymoon", "wellness"]
  },
  {
    id: "dps-002",
    name: "Kuta Beach Club Hotel",
    city: "Bali", cityIata: "DPS", country: "Indonesia",
    stars: 3, category: "budget",
    pricePerNight: { min: 40, max: 90, currency: "USD" },
    rating: 8.0,
    highlights: {
      ar: "فندق اقتصادي مريح على شاطئ كوتا الشهير، قريب من المتاجر والمطاعم والحياة الليلية",
      en: "Comfortable budget hotel on famous Kuta Beach, close to shops, restaurants and nightlife",
      fr: "Hôtel économique confortable sur la célèbre plage de Kuta, proche des boutiques, restaurants et vie nocturne",
      es: "Hotel económico confortable en la famosa Playa de Kuta, cerca de tiendas, restaurantes y vida nocturna"
    },
    amenities: ["pool", "restaurant", "bar", "beach-access", "wifi"],
    bookingUrl: bookingLink("Hotel Kuta Beach Bali"),
    hotelsUrl: hotelsLink("Bali Kuta"),
    expediaUrl: expediaLink("Bali"),
    tags: ["budget", "beach", "bali", "nightlife", "surfing"]
  },

  // ══════════════════════════════════════════
  // الدوحة - Doha
  // ══════════════════════════════════════════
  {
    id: "doh-001",
    name: "Mandarin Oriental Doha",
    city: "Doha", cityIata: "DOH", country: "Qatar",
    stars: 5, category: "luxury",
    pricePerNight: { min: 400, max: 1000, currency: "USD" },
    rating: 9.3,
    highlights: {
      ar: "فندق فاخر في قلب مشيرب الجديد مع تصميم يجمع التراث القطري والعصرية",
      en: "Luxury hotel in the heart of new Msheireb combining Qatari heritage with modernity",
      fr: "Hôtel de luxe au cœur du nouveau Msheireb alliant patrimoine qatari et modernité",
      es: "Hotel de lujo en el corazón del nuevo Msheireb que combina el patrimonio catarí con la modernidad"
    },
    amenities: ["pool", "spa", "restaurant", "bar", "gym", "concierge"],
    bookingUrl: bookingLink("Mandarin Oriental Doha"),
    hotelsUrl: hotelsLink("Doha"),
    expediaUrl: expediaLink("Doha"),
    tags: ["luxury", "modern", "doha", "business", "qatar"]
  },

  // ══════════════════════════════════════════
  // سنغافورة - Singapore
  // ══════════════════════════════════════════
  {
    id: "sin-001",
    name: "Marina Bay Sands",
    city: "Singapore", cityIata: "SIN", country: "Singapore",
    stars: 5, category: "luxury",
    pricePerNight: { min: 500, max: 1500, currency: "USD" },
    rating: 9.2,
    highlights: {
      ar: "الأيقونة المعمارية الأشهر في العالم مع حمام سباحة لا نهائي على السطح بارتفاع 200م",
      en: "The world's most famous architectural icon with an infinity pool 200m above ground",
      fr: "L'icône architecturale la plus célèbre au monde avec une piscine à débordement à 200m de hauteur",
      es: "El ícono arquitectónico más famoso del mundo con piscina infinita a 200m de altura"
    },
    amenities: ["infinity-pool", "casino", "spa", "michelin-restaurant", "shopping", "skypark"],
    bookingUrl: bookingLink("Marina Bay Sands Singapore"),
    hotelsUrl: hotelsLink("Singapore Marina Bay"),
    expediaUrl: expediaLink("Singapore"),
    tags: ["luxury", "iconic", "singapore", "pool", "casino", "skyline-view"]
  },
];

// ═══════════════════════════════════════════════════════
// دوال البحث
// ═══════════════════════════════════════════════════════

export function searchHotels(params: {
  cityIata?: string;
  city?: string;
  category?: Hotel["category"];
  maxPrice?: number;
  minStars?: number;
  tags?: string[];
  limit?: number;
}): Hotel[] {
  let results = [...HOTELS_DB];

  if (params.cityIata) {
    results = results.filter(h =>
      h.cityIata.toUpperCase() === params.cityIata!.toUpperCase()
    );
  }

  if (params.city) {
    results = results.filter(h =>
      h.city.toLowerCase().includes(params.city!.toLowerCase())
    );
  }

  if (params.category) {
    results = results.filter(h => h.category === params.category);
  }

  if (params.maxPrice) {
    results = results.filter(h => h.pricePerNight.min <= params.maxPrice!);
  }

  if (params.minStars) {
    results = results.filter(h => h.stars >= params.minStars!);
  }

  if (params.tags && params.tags.length > 0) {
    results = results.filter(h =>
      params.tags!.some(tag => h.tags.includes(tag))
    );
  }

  results.sort((a, b) => b.rating - a.rating);
  return results.slice(0, params.limit || 5);
}

export function getHotelsByBudget(
  cityIata: string,
  budget: "budget" | "midrange" | "luxury"
): Hotel[] {
  const categoryMap = {
    budget: ["budget"],
    midrange: ["midrange", "boutique"],
    luxury: ["luxury", "resort"]
  };

  return searchHotels({
    cityIata,
    limit: 3
  }).filter(h => categoryMap[budget].includes(h.category));
}

export function formatHotelResponse(hotel: Hotel, lang: "ar" | "en" | "fr" | "es"): string {
  const stars = "⭐".repeat(hotel.stars);
  const highlight = hotel.highlights[lang];
  const price = `$${hotel.pricePerNight.min}-$${hotel.pricePerNight.max}/night`;

  const labels = {
    ar: { book: "احجز الآن", rating: "التقييم", price: "السعر" },
    en: { book: "Book Now", rating: "Rating", price: "Price" },
    fr: { book: "Réserver", rating: "Note", price: "Prix" },
    es: { book: "Reservar", rating: "Calificación", price: "Precio" }
  };

  const l = labels[lang];

  return [
    `🏨 **${hotel.name}** ${stars}`,
    `📍 ${hotel.city}, ${hotel.country}`,
    `⭐ ${l.rating}: ${hotel.rating}/10`,
    `💰 ${l.price}: ${price}`,
    `✨ ${highlight}`,
    `🔗 [Booking.com](${hotel.bookingUrl}) | [Hotels.com](${hotel.hotelsUrl})`
  ].join("\n");
}

// تصدير قائمة المدن المتوفرة
export const AVAILABLE_CITIES = [...new Set(HOTELS_DB.map(h => h.cityIata))];