export const AFFILIATE_LINKS = [
  { name: "Aviasales", url: "https://aviasales.tpx.gr/yQxrYmk7" },
  { name: "Klook", url: "https://klook.tpx.gr/vRUzaJbI" },
  { name: "Sea Radar", url: "https://searadar.tpx.gr/WC89iS5m" },
  { name: "TicketNetwork", url: "https://ticketnetwork.tpx.gr/Nfh474HV" },
  { name: "FlixBus", url: "https://tpx.gr/n6krgEY3" },
  { name: "Tiqets", url: "https://tiqets.tpx.gr/ot4HK9Pf" },
  { name: "GetTransfer", url: "https://gettransfer.tpx.gr/9poAnD5l" },
  { name: "WeGoTrip", url: "https://wegotrip.tpx.gr/DyN0pkVH" },
  { name: "Intui Travel", url: "https://intui.tpx.gr/kguAoKIU" },
  { name: "EconomyBookings", url: "https://economybookings.tpx.gr/ONZ6dOjM" },
  { name: "QEEQ", url: "https://qeeq.tpx.gr/pTbTtERj" },
  { name: "Yesim eSIM", url: "https://yesim.tpx.gr/9gzdax7m" },
  { name: "Kiwi Taxi", url: "https://kiwitaxi.tpx.gr/Y6yrFeYN" },
  { name: "LocalRent", url: "https://localrent.tpx.gr/qr92Puo9" },
  { name: "Compensair", url: "https://compensair.tpx.gr/MGUDRrY2" },
  { name: "AirHelp", url: "https://airhelp.tpx.gr/baeI5YIf" },
];

export const PARTNERS = AFFILIATE_LINKS;

export const SERVICES = {
  flight: {
    id: "flight",
    titleKey: "cheap_flights",
    title: "Flights",
    icon: "Plane",
    links: [
      { name: "Aviasales", url: "https://aviasales.tpx.gr/yQxrYmk7", icon: "✈️", desc: "Best flight deals worldwide" },
    ],
    greetings: {
      en: "Hi! I'm Fastamor. Tell me your origin, destination and travel dates. I'll find the best flights instantly!",
      ar: "مرحبا! أنا Fastamor. أخبرني بمدينة الانطلاق والوجهة وتاريخ السفر. سأجد لك أفضل الرحلات فورا!",
      fr: "Bonjour! Je suis Fastamor. Dites-moi votre origine, destination et dates. je trouverai les meilleurs vols!",
      es: "¡Hola! Soy Fastamor. Dime tu origen, destino y fechas. ¡encontraré los mejores vuelos!"
    }
  },
  hotel: {
    id: "hotel",
    titleKey: "top_hotels",
    title: "Hotels",
    icon: "Building2",
    links: [
      { name: "Intui Travel", url: "https://intui.tpx.gr/kguAoKIU", icon: "🏨", desc: "Best hotel deals worldwide" },
    ],
    greetings: {
      en: "Hi! I'm Fastamor. Tell me your destination and dates. I'll find top hotels for you!",
      ar: "مرحبا! أنا Fastamor. أخبرني بوجهتك والتواريخ. سأجد لك أفضل الفنادق!",
      fr: "Bonjour! Je suis Fastamor. Dites-moi votre destination et vos dates.",
      es: "¡Hola! Soy Fastamor. Dime tu destino y fechas."
    }
  },
  taxi: {
    id: "taxi",
    titleKey: "car_rental",
    title: "Transfers & Cars",
    icon: "Car",
    links: [
      { name: "GetTransfer", url: "https://gettransfer.tpx.gr/9poAnD5l", icon: "🚕", desc: "Airport transfers worldwide" },
      { name: "Kiwi Taxi", url: "https://kiwitaxi.tpx.gr/Y6yrFeYN", icon: "🚖", desc: "Reliable taxi service" },
      { name: "LocalRent", url: "https://localrent.tpx.gr/qr92Puo9", icon: "🚗", desc: "Local car rental" },
      { name: "EconomyBookings", url: "https://economybookings.tpx.gr/ONZ6dOjM", icon: "🚙", desc: "Cheap car rental" },
      { name: "QEEQ", url: "https://qeeq.tpx.gr/pTbTtERj", icon: "🏎️", desc: "Premium car rental" },
    ],
    greetings: {
      en: "Hi! I'm Fastamor. Tell me pickup and destination. I'll find the best transfer!",
      ar: "مرحبا! أنا Fastamor. أخبرني بنقطة الانطلاق والوجهة. سأجد أفضل وسيلة نقل!",
      fr: "Bonjour! Je suis Fastamor. Donnez-moi votre point de départ.",
      es: "¡Hola! Soy Fastamor. Dime el punto de recogida."
    }
  },
  experience: {
    id: "experience",
    titleKey: "experiences",
    title: "Tours & Activities",
    icon: "Ticket",
    links: [
      { name: "Klook", url: "https://klook.tpx.gr/vRUzaJbI", icon: "🎡", desc: "Amazing experiences worldwide" },
      { name: "Tiqets", url: "https://tiqets.tpx.gr/ot4HK9Pf", icon: "🎭", desc: "Museums & attractions" },
      { name: "WeGoTrip", url: "https://wegotrip.tpx.gr/DyN0pkVH", icon: "🗺️", desc: "Audio tours & guides" },
      { name: "Intui Travel", url: "https://intui.tpx.gr/kguAoKIU", icon: "🎟️", desc: "Tours & experiences" },
      { name: "TicketNetwork", url: "https://ticketnetwork.tpx.gr/Nfh474HV", icon: "🎪", desc: "Events & concerts" },
    ],
    greetings: {
      en: "Hi! I'm Fastamor. Tell me which city. I'll find amazing tours and experiences!",
      ar: "مرحبا! أنا Fastamor. أخبرني بالمدينة. سأجد لك أروع الجولات والتجارب!",
      fr: "Bonjour! Je suis Fastamor. Dites-moi la ville.",
      es: "¡Hola! Soy Fastamor. Dime la ciudad."
    }
  },
  bus: {
    id: "bus",
    titleKey: "trains_buses",
    title: "Trains & Buses",
    icon: "Bus",
    links: [
      { name: "FlixBus", url: "https://tpx.gr/n6krgEY3", icon: "🚌", desc: "Cheap bus tickets Europe" },
      { name: "Intui Travel", url: "https://intui.tpx.gr/kguAoKIU", icon: "🚂", desc: "Trains & transport" },
    ],
    greetings: {
      en: "Hi! I'm Fastamor. Tell me your route and date. I'll find the cheapest tickets!",
      ar: "مرحبا! أنا Fastamor. أخبرني بمسارك وتاريخ السفر. سأجد أرخص التذاكر!",
      fr: "Bonjour! Je suis Fastamor. Dites-moi votre trajet.",
      es: "¡Hola! Soy Fastamor. Dime tu ruta."
    }
  },
  cruise: {
    id: "cruise",
    titleKey: "cruises",
    title: "Cruises",
    icon: "Ship",
    links: [
      { name: "Sea Radar", url: "https://searadar.tpx.gr/WC89iS5m", icon: "⛵", desc: "Best cruise deals" },
    ],
    greetings: {
      en: "Hi! I'm Fastamor. Tell me your preferred destination. I'll find the best cruise deals!",
      ar: "مرحبا! أنا Fastamor. أخبرني بوجهتك المفضلة. سأجد أفضل رحلات الكروز!",
      fr: "Bonjour! Je suis Fastamor. Dites-moi votre destination.",
      es: "¡Hola! Soy Fastamor. Dime tu destino preferido."
    }
  }
};

export const I18N = {
  en: {
    home: "Home", discover: "Discover", join: "Start Planning", services: "Book Services",
    flash_sale: "🚀 FLASH SALE: UP TO 50% OFF FLIGHTS & HOTELS — CLICK HERE",
    hero_badge: "✨ Your Personal AI Concierge", hero_title: "Travel With",
    hero_desc: "Skip the endless searching. Tell our AI where you want to go, and instantly get the best prices on flights, hotels, and tours across 200+ providers.",
    hero_btn_start: "Start Exploring", hero_btn_how: "See how it works",
    cheap_flights: "Flights", top_hotels: "Hotels", experiences: "Tours",
    cruises: "Cruises", car_rental: "Transfers", trains_buses: "Trains & Buses",
    luxury_resorts: "Luxury Resorts", book_everything: "Book Everything.",
    itinerary_desc: "Your entire itinerary handled in one smart interface.",
    how_it_works: "How It Works",
    step1_title: "Tell Fastamor", step1_desc: "Just type or speak naturally. 'Find me a cheap flight to Paris next Friday.'",
    step2_title: "AI Searches", step2_desc: "In seconds, we scan 200+ providers to find the hidden gems.",
    step3_title: "Book Direct", step3_desc: "Click the links to book directly. Zero hidden fees from us.",
    placeholder: "Ask anything about your trip...",
    search_flights: "Search Flights", search_hotels: "Search Hotels", search_transfers: "Search Transfers",
    send: "Send", listening: "Listening...", searching: "Searching...",
    results_for: "Results for your request", explore: "Explore Activities",
    deals: "Hot Deals", book_now: "Book Now", trending: "Trending This Hour",
    results: "Results will appear here...", top_picks: "Top Picks for You",
    direct_links: "Direct Booking Links", best_match: "Best Match",
    view_details: "View Details", price: "Price",
    about_us: "About Us", contact_us: "Contact Us", privacy: "Privacy Policy",
    terms: "Terms & Conditions", language: "Language", currency: "Currency",
    rights: "All rights reserved.", powered_by: "Powered by Travelpayouts",
    admin_password_prompt: "Enter Admin Password:", unauthorized: "Unauthorized Access"
  },
  ar: {
    home: "الرئيسية", discover: "اكتشف", join: "ابدأ التخطيط", services: "خدمات الحجز",
    flash_sale: "🚀 عرض حصري: خصم يصل إلى 50% على الرحلات والفنادق — اضغط هنا",
    hero_badge: "✨ مساعدك الشخصي بالذكاء الاصطناعي", hero_title: "سافر مع",
    hero_desc: "توقف عن البحث الطويل. أخبر مساعدنا الذكي أين تريد الذهاب وستحصل فورا على أفضل الأسعار.",
    hero_btn_start: "ابدأ الاستكشاف", hero_btn_how: "شاهد كيف يعمل",
    cheap_flights: "طيران", top_hotels: "فنادق", experiences: "جولات",
    cruises: "كروز", car_rental: "توصيلات", trains_buses: "قطارات وحافلات",
    luxury_resorts: "منتجعات فاخرة", book_everything: "احجز كل شيء.",
    itinerary_desc: "خطط لرحلتك بالكامل من خلال واجهة واحدة ذكية.",
    how_it_works: "كيف يعمل؟",
    step1_title: "تحدث مع فاستامور", step1_desc: "اكتب أو تحدث بشكل طبيعي.",
    step2_title: "البحث الذكي", step2_desc: "في ثوانٍ، نقوم بمسح 200+ مزود خدمة.",
    step3_title: "احجز مباشرة", step3_desc: "اضغط على الروابط للحجز مباشرة.",
    placeholder: "اسأل عن أي شيء يخص رحلتك...",
    search_flights: "البحث عن رحلات", search_hotels: "البحث عن فنادق", search_transfers: "البحث عن نقل",
    send: "إرسال", listening: "جاري الاستماع...", searching: "جاري البحث...",
    results_for: "نتائج طلبك", explore: "استكشف الأنشطة",
    deals: "عروض مميزة", book_now: "احجز الآن", trending: "شائع هذه الساعة",
    results: "ستظهر النتائج هنا...", top_picks: "أفضل التوصيات لك",
    direct_links: "روابط الحجز المباشرة", best_match: "أفضل تطابق",
    view_details: "عرض التفاصيل", price: "السعر",
    about_us: "من نحن", contact_us: "اتصل بنا", privacy: "سياسة الخصوصية",
    terms: "الشروط والأحكام", language: "اللغة", currency: "العملة",
    rights: "جميع الحقوق محفوظة.", powered_by: "بدعم من Travelpayouts",
    admin_password_prompt: "أدخل كلمة مرور المسؤول:", unauthorized: "دخول غير مصرح به"
  },
  fr: {
    home: "Accueil", discover: "Découvrir", join: "Commencer", services: "Services",
    flash_sale: "🚀 VENTE FLASH : JUSQU'À 50% DE RÉDUCTION — CLIQUEZ ICI",
    hero_badge: "✨ Votre Concierge IA Personnel", hero_title: "Voyagez avec",
    hero_desc: "Arrêtez de chercher. Dites à notre IA où vous voulez aller.",
    hero_btn_start: "Commencer", hero_btn_how: "Comment ça marche",
    cheap_flights: "Vols", top_hotels: "Hôtels", experiences: "Tours",
    cruises: "Croisières", car_rental: "Transferts", trains_buses: "Trains & Bus",
    luxury_resorts: "Resorts de Luxe", book_everything: "Réservez Tout.",
    itinerary_desc: "Tout votre itinéraire dans une interface intelligente.",
    how_it_works: "Comment ça marche",
    step1_title: "Dites à Fastamor", step1_desc: "Écrivez ou parlez naturellement.",
    step2_title: "L'IA Recherche", step2_desc: "En secondes, nous scannons 200+ fournisseurs.",
    step3_title: "Réservez Direct", step3_desc: "Cliquez pour réserver directement.",
    placeholder: "Demandez n'importe quoi...",
    search_flights: "Rechercher Vols", search_hotels: "Rechercher Hôtels", search_transfers: "Transferts",
    send: "Envoyer", listening: "Écoute...", searching: "Recherche...",
    results_for: "Résultats", explore: "Explorer",
    deals: "Bons Plans", book_now: "Réserver", trending: "Tendance",
    results: "Les résultats apparaîtront ici...", top_picks: "Nos Meilleurs Choix",
    direct_links: "Liens de Réservation", best_match: "Meilleur Choix",
    view_details: "Voir Détails", price: "Prix",
    about_us: "À Propos", contact_us: "Contactez-nous", privacy: "Confidentialité",
    terms: "Conditions", language: "Langue", currency: "Devise",
    rights: "Tous droits réservés.", powered_by: "Propulsé par Travelpayouts",
    admin_password_prompt: "Mot de passe:", unauthorized: "Accès refusé"
  },
  es: {
    home: "Inicio", discover: "Descubrir", join: "Empezar", services: "Servicios",
    flash_sale: "🚀 VENTA FLASH: HASTA 50% DE DESCUENTO — CLIC AQUÍ",
    hero_badge: "✨ Tu Conserje IA Personal", hero_title: "Viaja con",
    hero_desc: "Deja de buscar. Dile a nuestra IA a dónde quieres ir.",
    hero_btn_start: "Explorar", hero_btn_how: "Cómo funciona",
    cheap_flights: "Vuelos", top_hotels: "Hoteles", experiences: "Tours",
    cruises: "Cruceros", car_rental: "Traslados", trains_buses: "Trenes & Buses",
    luxury_resorts: "Resorts de Lujo", book_everything: "Reserva Todo.",
    itinerary_desc: "Todo tu itinerario en una interfaz inteligente.",
    how_it_works: "Cómo Funciona",
    step1_title: "Dile a Fastamor", step1_desc: "Escribe o habla naturalmente.",
    step2_title: "IA Busca", step2_desc: "En segundos, escaneamos 200+ proveedores.",
    step3_title: "Reserva Directo", step3_desc: "Haz clic para reservar directamente.",
    placeholder: "Pregunta cualquier cosa...",
    search_flights: "Buscar Vuelos", search_hotels: "Buscar Hoteles", search_transfers: "Traslados",
    send: "Enviar", listening: "Escuchando...", searching: "Buscando...",
    results_for: "Resultados", explore: "Explorar",
    deals: "Ofertas", book_now: "Reservar", trending: "Tendencias",
    results: "Los resultados aparecerán aquí...", top_picks: "Mejores Opciones",
    direct_links: "Enlaces Directos", best_match: "Mejor Opción",
    view_details: "Ver Detalles", price: "Precio",
    about_us: "Sobre Nosotros", contact_us: "Contáctenos", privacy: "Privacidad",
    terms: "Términos", language: "Idioma", currency: "Moneda",
    rights: "Todos los derechos reservados.", powered_by: "Desarrollado por Travelpayouts",
    admin_password_prompt: "Contraseña:", unauthorized: "Acceso denegado"
  }
};
