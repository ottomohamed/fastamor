export const PARTNERS = [
  { name: "Booking.com", url: "https://booking.tpx.gr/pO1xgUOk" },
  { name: "Trip.com", url: "https://trip.tpx.gr/xuZyhawM" },
  { name: "GetYourGuide", url: "https://getyourguide.tpx.gr/N4hqBYBh" },
  { name: "Discover Cars", url: "https://discovercars.tpx.gr/Db7PkpPH" },
  { name: "Klook", url: "https://klook.tpx.gr/maKAx6cu" },
  { name: "Tiqets", url: "https://tiqets.tpx.gr/4XvdA3sA" },
  { name: "Omio", url: "https://omio.tpx.gr/HhKpT0j2" },
  { name: "Hotels.com", url: "https://hotels.tpx.gr/HZcgZ2jB" },
  { name: "Sea Radar", url: "https://searadar.tpx.gr/PdA1Y1ul" },
  { name: "Go City", url: "https://gocity.tpx.gr/mvQ9kUHY" },
  { name: "FlixBus", url: "https://tpx.gr/nd8xOURD" },
  { name: "Expedia", url: "https://expedia.tpx.gr/oZmiqQ00" },
  { name: "Aviasales", url: "https://aviasales.tpx.gr/EDLTCi50" },
];

export const SERVICES = {
  flight: {
    title: "Flights", icon: "Plane",
    greetings: {
      en: "Hi! I'm Fastamor ✈️ Tell me your origin, destination and travel dates — I'll find the best flights instantly!",
      ar: "مرحباً! أنا Fastamor ✈️ أخبرني بمدينة الانطلاق والوجهة وتاريخ السفر — سأجد لك أفضل الرحلات فوراً!",
      fr: "Bonjour! Je suis Fastamor ✈️ Dites-moi votre origine, destination et dates — je trouverai les meilleurs vols!",
      es: "¡Hola! Soy Fastamor ✈️ Dime tu origen, destino y fechas — ¡encontraré los mejores vuelos al instante!"
    }
  },
  hotel: {
    title: "Hotels", icon: "Building2",
    greetings: {
      en: "Hi! I'm Fastamor 🏨 Tell me your destination and dates — I'll find top hotels for you!",
      ar: "مرحباً! أنا Fastamor 🏨 أخبرني بوجهتك والتواريخ — سأجد لك أفضل الفنادق!",
      fr: "Bonjour! Je suis Fastamor 🏨 Dites-moi votre destination et vos dates — je trouverai les meilleurs hôtels!",
      es: "¡Hola! Soy Fastamor 🏨 Dime tu destino y fechas — ¡encontraré los mejores hoteles!"
    }
  },
  taxi: {
    title: "Transfers", icon: "Car",
    greetings: {
      en: "Hi! I'm Fastamor 🚕 Tell me pickup and destination — I'll find the best transfer for you!",
      ar: "مرحباً! أنا Fastamor 🚕 أخبرني بنقطة الانطلاق والوجهة — سأجد أفضل وسيلة نقل!",
      fr: "Bonjour! Je suis Fastamor 🚕 Donnez-me votre point de départ et destination — je trouverai le meilleur transfert!",
      es: "¡Hola! Soy Fastamor 🚕 Dime el punto de recogida y destino — ¡encontraré el mejor traslado!"
    }
  },
  bus: {
    title: "Bus", icon: "Bus",
    greetings: {
      en: "Hi! I'm Fastamor 🚌 Tell me your route and date — I'll find the cheapest bus tickets!",
      ar: "مرحباً! أنا Fastamor 🚌 أخبرني بمسارك وتاريخ السفر — سأجد أرخص تذاكر الحافلات!",
      fr: "Bonjour! Je suis Fastamor 🚌 Dites-moi votre trajet et date — je trouverai les bus les moins chers!",
      es: "¡Hola! Soy Fastamor 🚌 Dime tu ruta y fecha — ¡encontraré los autobuses más baratos!"
    }
  },
  train: {
    title: "Trains", icon: "Train",
    greetings: {
      en: "Hi! I'm Fastamor 🚂 Tell me your route and date — I'll find the best train options!",
      ar: "مرحباً! أنا Fastamor 🚂 أخبرني بمسارك وتاريخ السفر — سأجد أفضل رحلات القطار!",
      fr: "Bonjour! Je suis Fastamor 🚂 Dites-moi votre trajet et date — je trouverai les meilleurs trains!",
      es: "¡Hola! Soy Fastamor 🚂 Dime tu ruta y fecha — ¡encontraré los mejores trenes!"
    }
  },
  experience: {
    title: "Tours", icon: "Ticket",
    greetings: {
      en: "Hi! I'm Fastamor 🗺️ Tell me which city — I'll find amazing tours and experiences!",
      ar: "مرحباً! أنا Fastamor 🗺️ أخبرني بالمدينة — سأجد لك أروع الجولات والتجارب!",
      fr: "Bonjour! Je suis Fastamor 🗺️ Dites-moi la ville — je trouverai les meilleures expériences!",
      es: "¡Hola! Soy Fastamor 🗺️ Dime la ciudad — ¡encontraré los mejores tours y experiencias!"
    }
  }
};

export const MOCK_RESULTS = {
  flight: [
    { name: "Best Available Flight", info: "Searching live prices across 200+ airlines", price: "from $59" },
    { name: "Budget Option", info: "Lowest fare — flexible dates", price: "from $39" },
    { name: "Premium Direct", info: "Direct flight — top airlines", price: "from $149" }
  ],
  hotel: [
    { name: "Top Rated Hotel", info: "Best reviewed in your destination", price: "from $45/nt" },
    { name: "Budget Stay", info: "Clean, affordable & central", price: "from $22/nt" },
    { name: "Luxury Option", info: "5-star experience", price: "from $130/nt" }
  ],
  taxi: [
    { name: "Private Transfer", info: "Direct door-to-door", price: "from $12" },
    { name: "Shared Shuttle", info: "Affordable shared ride", price: "from $6" },
    { name: "Premium Car", info: "Business class comfort", price: "from $30" }
  ],
  bus: [
    { name: "Express Bus", info: "Fastest route available", price: "from $4" },
    { name: "Budget Bus", info: "Most affordable option", price: "from $2" },
    { name: "Comfort Coach", info: "Extra legroom & WiFi", price: "from $10" }
  ],
  train: [
    { name: "High-Speed Train", info: "Fastest rail connection", price: "from $19" },
    { name: "Regional Train", info: "Scenic & affordable", price: "from $9" },
    { name: "First Class", info: "Premium comfort", price: "from $45" }
  ],
  experience: [
    { name: "Top City Tour", info: "Best rated activity in the area", price: "from $15" },
    { name: "Food & Culture", info: "Authentic local experience", price: "from $25" },
    { name: "Adventure Activity", info: "Thrilling & unforgettable", price: "from $35" }
  ]
};

export const AFFILIATE_LINKS = {
  flight: [
    { name: "Aviasales", desc: "Compare 200+ airlines", url: "https://aviasales.tpx.gr/EDLTCi50" },
    { name: "WayAway", desc: "Flights with cashback", url: "https://trip.tpx.gr/xuZyhawM" },
    { name: "Expedia", desc: "Flight + Hotel bundles", url: "https://expedia.tpx.gr/oZmiqQ00" }
  ],
  hotel: [
    { name: "Booking.com", desc: "Largest selection globally", url: "https://booking.tpx.gr/EWmbrXYx" },
    { name: "Trip.com", desc: "Great Asian & Global deals", url: "https://trip.tpx.gr/kxwnTr31" },
    { name: "Hotels.com", desc: "Earn reward nights", url: "https://hotels.tpx.gr/HZcgZ2jB" }
  ],
  taxi: [
    { name: "Discover Cars", desc: "Compare top rentals", url: "https://discovercars.tpx.gr/9pGzpviq" },
    { name: "Klook", desc: "Airport transfers", url: "https://klook.tpx.gr/B3ZUPfZM" }
  ],
  bus: [
    { name: "Omio", desc: "Bus & train routes", url: "https://omio.tpx.gr/HhKpT0j2" },
    { name: "FlixBus", desc: "Europe's largest network", url: "https://tpx.gr/nd8xOURD" }
  ],
  train: [
    { name: "Omio", desc: "Compare all rail options", url: "https://omio.tpx.gr/HhKpT0j2" },
    { name: "12Go", desc: "Best for Asia travel", url: "https://12go.tpx.gr/n1l1Vo8B" }
  ],
  experience: [
    { name: "GetYourGuide", desc: "Top rated local tours", url: "https://getyourguide.tpx.gr/XMdfzvoV" },
    { name: "Klook", desc: "Attractions & theme parks", url: "https://klook.tpx.gr/B3ZUPfZM" },
    { name: "Go City", desc: "City explorer passes", url: "https://gocity.tpx.gr/mvQ9kUHY" }
  ]
};

export const I18N = {
  en: {
    home: "Home",
    discover: "Discover",
    join: "Start Planning",
    placeholder: "Ask anything about your trip...",
    explore: "Explore Activities",
    deals: "Hot Deals",
    book_now: "Book Now",
    trending: "Trending This Hour",
    services: "Book Services",
    results: "Results will appear here...",
    top_picks: "Top Picks for You",
    direct_links: "Direct Booking Links",
    best_match: "Best Match"
  },
  ar: {
    home: "الرئيسية",
    discover: "اكتشف",
    join: "ابدأ التخطيط",
    placeholder: "اسأل عن أي شيء يخص رحلتك...",
    explore: "استكشف الأنشطة",
    deals: "عروض مميزة",
    book_now: "احجز الآن",
    trending: "شائع هذه الساعة",
    services: "احجز خدمات",
    results: "ستظهر النتائج هنا...",
    top_picks: "أفضل التوصيات لك",
    direct_links: "روابط الحجز المباشرة",
    best_match: "أفضل تطابق"
  },
  fr: {
    home: "Accueil",
    discover: "Découvrir",
    join: "Commencer",
    placeholder: "Demandez n'importe quoi...",
    explore: "Explorer",
    deals: "Bons Plans",
    book_now: "Réserver",
    trending: "Tendance Actuelle",
    services: "Services",
    results: "Les résultats apparaîtront ici...",
    top_picks: "Nos Meilleurs Choix",
    direct_links: "Liens de Réservation",
    best_match: "Meilleur Choix"
  },
  es: {
    home: "Inicio",
    discover: "Descubrir",
    join: "Empezar",
    placeholder: "Pregunta cualquier cosa...",
    explore: "Explorar",
    deals: "Ofertas",
    book_now: "Reservar",
    trending: "Tendencias",
    services: "Servicios",
    results: "Los resultados aparecerán aquí...",
    top_picks: "Mejores Opciones",
    direct_links: "Enlaces Directos",
    best_match: "Mejor Opción"
  }
};
