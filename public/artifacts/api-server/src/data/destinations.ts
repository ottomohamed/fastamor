// ═══════════════════════════════════════════════════════
// Fastamor AI - قواعد البيانات الأولوية القصوى
// 1. الوجهات السياحية
// 2. شركات الطيران
// ═══════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
// 1. قاعدة الوجهات السياحية
// ══════════════════════════════════════════════════════

export interface Destination {
  iata: string;
  city: { ar: string; en: string; fr: string; es: string };
  country: { ar: string; en: string; fr: string; es: string };
  continent: "europe" | "asia" | "africa" | "americas" | "oceania" | "middle-east";
  timezone: string;
  currency: { code: string; symbol: string; name: string };
  language: string;
  bestMonths: number[];
  avoidMonths: number[];
  budgetPerDay: { budget: number; midrange: number; luxury: number; currency: "USD" };
  overview: { ar: string; en: string; fr: string; es: string };
  topAttractions: { ar: string; en: string; fr: string; es: string }[];
  foodTips: { ar: string; en: string; fr: string; es: string };
  transportTips: { ar: string; en: string; fr: string; es: string };
  safetyRating: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  visaInfo: { ar: string; en: string; fr: string; es: string };
}

export const DESTINATIONS_DB: Destination[] = [

  // ══════════════════════════════════════
  // دبي
  // ══════════════════════════════════════
  {
    iata: "DXB",
    city: { ar: "دبي", en: "Dubai", fr: "Dubaï", es: "Dubái" },
    country: { ar: "الإمارات", en: "UAE", fr: "Émirats Arabes Unis", es: "Emiratos Árabes Unidos" },
    continent: "middle-east",
    timezone: "UTC+4",
    currency: { code: "AED", symbol: "د.إ", name: "Dirham" },
    language: "Arabic / English",
    bestMonths: [10, 11, 12, 1, 2, 3],
    avoidMonths: [6, 7, 8],
    budgetPerDay: { budget: 100, midrange: 250, luxury: 600, currency: "USD" },
    overview: {
      ar: "مدينة المستقبل! دبي تجمع بين التراث العربي والحداثة المطلقة. برج خليفة، دبي مول، شواطئ ذهبية، وتسوق لا نهاية له.",
      en: "City of the future! Dubai blends Arab heritage with absolute modernity. Burj Khalifa, Dubai Mall, golden beaches, and endless shopping.",
      fr: "La ville du futur! Dubaï mélange patrimoine arabe et modernité absolue. Burj Khalifa, Dubai Mall, plages dorées et shopping infini.",
      es: "¡La ciudad del futuro! Dubái combina herencia árabe y modernidad absoluta. Burj Khalifa, Dubai Mall, playas doradas y compras sin fin."
    },
    topAttractions: [
      {
        ar: "برج خليفة - أطول مبنى في العالم (828م)",
        en: "Burj Khalifa - World's tallest building (828m)",
        fr: "Burj Khalifa - Plus haut bâtiment du monde (828m)",
        es: "Burj Khalifa - El edificio más alto del mundo (828m)"
      },
      {
        ar: "دبي مول - أكبر مركز تسوق في العالم",
        en: "Dubai Mall - World's largest shopping mall",
        fr: "Dubai Mall - Plus grand centre commercial au monde",
        es: "Dubai Mall - Centro comercial más grande del mundo"
      },
      {
        ar: "نخلة جميرا - الجزيرة الاصطناعية الأشهر",
        en: "Palm Jumeirah - Most famous artificial island",
        fr: "Palm Jumeirah - L'île artificielle la plus célèbre",
        es: "Palm Jumeirah - La isla artificial más famosa"
      },
      {
        ar: "صحراء دبي - سفاري وتجربة البدو الأصيلة",
        en: "Dubai Desert Safari - Bedouin experience",
        fr: "Safari Désert de Dubaï - Expérience bédouine",
        es: "Safari Desierto de Dubái - Experiencia beduina"
      },
      {
        ar: "الخور القديم وسوق الذهب والتوابل",
        en: "Old Dubai Creek, Gold & Spice Souks",
        fr: "Vieux Dubaï, Souks de l'Or et des Épices",
        es: "Crique Antiguo de Dubái, Zocos del Oro y las Especias"
      }
    ],
    foodTips: {
      ar: "جرب: شاورما الشرق الأوسط، أكلات إماراتية أصيلة، مطاعم عالمية راقية. متوسط وجبة: 10-15$ (اقتصادي) إلى 50-100$ (فاخر)",
      en: "Try: Middle Eastern shawarma, authentic Emirati cuisine, world-class restaurants. Avg meal: $10-15 (budget) to $50-100 (luxury)",
      fr: "Essayez: Chawarma du Moyen-Orient, cuisine émiratie authentique, restaurants de classe mondiale. Repas moyen: 10-15$ (économique) à 50-100$ (luxe)",
      es: "Prueba: Shawarma de Oriente Medio, cocina emiratí auténtica, restaurantes de clase mundial. Comida media: $10-15 (económico) a $50-100 (lujo)"
    },
    transportTips: {
      ar: "المترو: أرخص وسيلة (2-8 درهم). تاكسي: آمن ومعقول السعر. Uber متاح. استئجار سيارة موصى به لاستكشاف خارج المدينة.",
      en: "Metro: cheapest option (2-8 AED). Taxi: safe and reasonable. Uber available. Car rental recommended for exploring outside the city.",
      fr: "Métro: option la moins chère (2-8 AED). Taxi: sûr et raisonnable. Uber disponible. Location de voiture recommandée hors ville.",
      es: "Metro: opción más barata (2-8 AED). Taxi: seguro y razonable. Uber disponible. Alquiler de coche recomendado fuera de la ciudad."
    },
    safetyRating: 5,
    tags: ["luxury", "shopping", "beach", "desert", "modern", "family", "honeymoon"],
    visaInfo: {
      ar: "معظم الجنسيات العربية والأوروبية تحصل على فيزا عند الوصول أو بدون فيزا. تحقق من موقع الهجرة الإماراتية.",
      en: "Most nationalities get visa on arrival or visa-free. Check UAE immigration website.",
      fr: "La plupart des nationalités obtiennent un visa à l'arrivée ou sans visa. Vérifiez le site immigration des EAU.",
      es: "La mayoría de nacionalidades obtienen visa a la llegada o sin visa. Consulta el sitio de inmigración de los EAU."
    }
  },

  // ══════════════════════════════════════
  // باريس
  // ══════════════════════════════════════
  {
    iata: "CDG",
    city: { ar: "باريس", en: "Paris", fr: "Paris", es: "París" },
    country: { ar: "فرنسا", en: "France", fr: "France", es: "Francia" },
    continent: "europe",
    timezone: "UTC+1",
    currency: { code: "EUR", symbol: "€", name: "Euro" },
    language: "French",
    bestMonths: [4, 5, 6, 9, 10],
    avoidMonths: [7, 8],
    budgetPerDay: { budget: 80, midrange: 200, luxury: 500, currency: "USD" },
    overview: {
      ar: "مدينة النور والحب! باريس عاصمة الفن والأزياء والطعام الراقي. من برج إيفل إلى متحف اللوفر، كل شارع فيها تحفة فنية.",
      en: "City of Light and Love! Paris is the capital of art, fashion and fine dining. From the Eiffel Tower to the Louvre, every street is a masterpiece.",
      fr: "La Ville Lumière! Paris est la capitale de l'art, de la mode et de la gastronomie. De la Tour Eiffel au Louvre, chaque rue est un chef-d'œuvre.",
      es: "¡La Ciudad de la Luz y el Amor! París es la capital del arte, la moda y la gastronomía. Desde la Torre Eiffel hasta el Louvre, cada calle es una obra maestra."
    },
    topAttractions: [
      {
        ar: "برج إيفل - رمز فرنسا الأبدي",
        en: "Eiffel Tower - France's eternal symbol",
        fr: "Tour Eiffel - Le symbole éternel de la France",
        es: "Torre Eiffel - El símbolo eterno de Francia"
      },
      {
        ar: "متحف اللوفر - أكبر متحف في العالم",
        en: "Louvre Museum - World's largest museum",
        fr: "Musée du Louvre - Plus grand musée au monde",
        es: "Museo del Louvre - El museo más grande del mundo"
      },
      {
        ar: "قوس النصر وشانزيليزيه",
        en: "Arc de Triomphe & Champs-Élysées",
        fr: "Arc de Triomphe et Champs-Élysées",
        es: "Arco del Triunfo y Campos Elíseos"
      },
      {
        ar: "كاتدرائية نوتردام",
        en: "Notre-Dame Cathedral",
        fr: "Cathédrale Notre-Dame",
        es: "Catedral de Notre-Dame"
      },
      {
        ar: "متحف أورسيه وحديقة تويلري",
        en: "Musée d'Orsay & Tuileries Garden",
        fr: "Musée d'Orsay et Jardin des Tuileries",
        es: "Museo de Orsay y Jardín de las Tullerías"
      }
    ],
    foodTips: {
      ar: "لا تفوت: الكرواسون الصباحي، الكريب، الجبن الفرنسي، البيسترو الباريسي. وجبة بسيطة: 15-20€، مطعم جيد: 30-50€",
      en: "Don't miss: morning croissant, crêpes, French cheese, Parisian bistro. Simple meal: €15-20, good restaurant: €30-50",
      fr: "Ne manquez pas: croissant du matin, crêpes, fromage français, bistro parisien. Repas simple: 15-20€, bon restaurant: 30-50€",
      es: "No te pierdas: croissant mañanero, crêpes, queso francés, bistró parisino. Comida simple: 15-20€, buen restaurante: 30-50€"
    },
    transportTips: {
      ar: "المترو: أفضل وسيلة (1.90€ للتذكرة). بطاقة Navigo الأسبوعية: 30€ للتنقل غير المحدود. تجنب التاكسي في أوقات الذروة.",
      en: "Metro: best option (€1.90/ticket). Weekly Navigo card: €30 for unlimited travel. Avoid taxis during rush hour.",
      fr: "Métro: meilleure option (1,90€/ticket). Carte Navigo hebdomadaire: 30€ illimité. Évitez les taxis aux heures de pointe.",
      es: "Metro: mejor opción (1,90€/billete). Tarjeta Navigo semanal: 30€ ilimitado. Evita taxis en hora punta."
    },
    safetyRating: 4,
    tags: ["romantic", "culture", "art", "fashion", "food", "history", "honeymoon"],
    visaInfo: {
      ar: "منطقة شنغن: تحتاج فيزا شنغن إذا لم تكن حاملاً جواز سفر أوروبي. تأمين طبي 30,000€ إلزامي.",
      en: "Schengen zone: Schengen visa required if not EU passport holder. €30,000 medical insurance mandatory.",
      fr: "Zone Schengen: visa Schengen requis si non-européen. Assurance médicale 30 000€ obligatoire.",
      es: "Zona Schengen: se requiere visado Schengen si no es pasaporte de la UE. Seguro médico de 30.000€ obligatorio."
    }
  },

  // ══════════════════════════════════════
  // إسطنبول
  // ══════════════════════════════════════
  {
    iata: "IST",
    city: { ar: "إسطنبول", en: "Istanbul", fr: "Istanbul", es: "Estambul" },
    country: { ar: "تركيا", en: "Turkey", fr: "Turquie", es: "Turquía" },
    continent: "europe",
    timezone: "UTC+3",
    currency: { code: "TRY", symbol: "₺", name: "Lira Turca" },
    language: "Turkish",
    bestMonths: [4, 5, 9, 10, 11],
    avoidMonths: [7, 8],
    budgetPerDay: { budget: 40, midrange: 100, luxury: 300, currency: "USD" },
    overview: {
      ar: "المدينة الوحيدة في العالم على قارتين! إسطنبول تجمع بين الحضارة الإسلامية والبيزنطية والعثمانية. تاريخ لا نهاية له، طعام لذيذ، وأسعار رائعة!",
      en: "The only city in the world on two continents! Istanbul blends Islamic, Byzantine and Ottoman civilizations. Endless history, delicious food, amazing prices!",
      fr: "La seule ville au monde sur deux continents! Istanbul mélange civilisations islamique, byzantine et ottomane. Histoire infinie, nourriture délicieuse, prix incroyables!",
      es: "¡La única ciudad del mundo en dos continentes! Estambul combina civilizaciones islámica, bizantina y otomana. Historia infinita, comida deliciosa, ¡precios increíbles!"
    },
    topAttractions: [
      {
        ar: "آيا صوفيا - تحفة معمارية بيزنطية تحولت لمسجد",
        en: "Hagia Sophia - Byzantine masterpiece turned mosque",
        fr: "Sainte-Sophie - Chef-d'œuvre byzantin devenu mosquée",
        es: "Santa Sofía - Obra maestra bizantina convertida en mezquita"
      },
      {
        ar: "المسجد الأزرق - شاهد على عظمة العمارة العثمانية",
        en: "Blue Mosque - Testament to Ottoman architectural greatness",
        fr: "Mosquée Bleue - Témoin de la grandeur architecturale ottomane",
        es: "Mezquita Azul - Testigo de la grandeza arquitectónica otomana"
      },
      {
        ar: "قصر توبقابي - عاصمة الإمبراطورية العثمانية",
        en: "Topkapi Palace - Capital of the Ottoman Empire",
        fr: "Palais de Topkapi - Capitale de l'Empire Ottoman",
        es: "Palacio de Topkapi - Capital del Imperio Otomano"
      },
      {
        ar: "البازار الكبير - أقدم سوق مسقوف في العالم",
        en: "Grand Bazaar - Oldest covered market in the world",
        fr: "Grand Bazar - Le plus ancien marché couvert au monde",
        es: "Gran Bazar - El mercado cubierto más antiguo del mundo"
      },
      {
        ar: "رحلة بحرية في مضيق البوسفور",
        en: "Bosphorus boat cruise",
        fr: "Croisière sur le Bosphore",
        es: "Crucero por el Bósforo"
      }
    ],
    foodTips: {
      ar: "لا تفوت: الكباب، البوريك، البقلاوة، الشاي التركي، القهوة التركية. وجبة شعبية: 5-10$، مطعم جيد: 15-30$",
      en: "Don't miss: kebab, börek, baklava, Turkish tea, Turkish coffee. Street food: $5-10, good restaurant: $15-30",
      fr: "Ne manquez pas: kebab, börek, baklava, thé turc, café turc. Repas de rue: 5-10$, bon restaurant: 15-30$",
      es: "No te pierdas: kebab, börek, baklava, té turco, café turco. Comida callejera: $5-10, buen restaurante: $15-30"
    },
    transportTips: {
      ar: "بطاقة Istanbulkart: ضرورية للمترو والترام والباص. رحلة واحدة: 1$ تقريباً. الترام T1 يغطي معظم المعالم السياحية.",
      en: "Istanbulkart: essential for metro, tram and bus. Single ride: ~$1. Tram T1 covers most tourist attractions.",
      fr: "Istanbulkart: indispensable pour métro, tram et bus. Trajet simple: ~1$. Le tram T1 couvre la plupart des attractions.",
      es: "Istanbulkart: esencial para metro, tranvía y autobús. Viaje sencillo: ~$1. El tranvía T1 cubre la mayoría de atracciones."
    },
    safetyRating: 4,
    tags: ["history", "culture", "food", "affordable", "shopping", "religious", "honeymoon"],
    visaInfo: {
      ar: "معظم الجنسيات العربية تدخل بدون فيزا أو بفيزا إلكترونية سهلة على evisa.gov.tr",
      en: "Most nationalities enter visa-free or with easy e-visa at evisa.gov.tr",
      fr: "La plupart des nationalités entrent sans visa ou avec un e-visa facile sur evisa.gov.tr",
      es: "La mayoría de nacionalidades entran sin visado o con e-visa fácil en evisa.gov.tr"
    }
  },

  // ══════════════════════════════════════
  // مراكش
  // ══════════════════════════════════════
  {
    iata: "RAK",
    city: { ar: "مراكش", en: "Marrakech", fr: "Marrakech", es: "Marrakech" },
    country: { ar: "المغرب", en: "Morocco", fr: "Maroc", es: "Marruecos" },
    continent: "africa",
    timezone: "UTC+1",
    currency: { code: "MAD", symbol: "د.م.", name: "Dirham Marroquí" },
    language: "Arabic / French / Berber",
    bestMonths: [3, 4, 10, 11, 12],
    avoidMonths: [7, 8],
    budgetPerDay: { budget: 30, midrange: 80, luxury: 250, currency: "USD" },
    overview: {
      ar: "المدينة الحمراء الساحرة! مراكش تسحرك بألوانها ورائحة توابلها وأزقة مدينتها العتيقة. ساحة جامع الفنا، الرياضات الرائعة، والأسواق التي لا تنتهي.",
      en: "The enchanting Red City! Marrakech captivates with its colors, spice aromas and ancient medina alleys. Jemaa el-Fna square, stunning riads, endless markets.",
      fr: "L'enchanteresse Ville Rouge! Marrakech envoûte avec ses couleurs, arômes d'épices et ruelles de la médina antique. Place Jemaa el-Fna, riads magnifiques, marchés infinis.",
      es: "¡La encantadora Ciudad Roja! Marrakech cautiva con sus colores, aromas de especias y callejones de la medina antigua. Plaza Jemaa el-Fna, riads magníficos, mercados infinitos."
    },
    topAttractions: [
      {
        ar: "ساحة جامع الفنا - أشهر ساحة في أفريقيا",
        en: "Jemaa el-Fna Square - Africa's most famous square",
        fr: "Place Jemaa el-Fna - La place la plus célèbre d'Afrique",
        es: "Plaza Jemaa el-Fna - La plaza más famosa de África"
      },
      {
        ar: "حدائق المجورل (جنة يسلوف) - واحة خضراء وسط الصحراء",
        en: "Majorelle Garden - Green oasis in the desert",
        fr: "Jardin Majorelle - Oasis verte dans le désert",
        es: "Jardín Majorelle - Oasis verde en el desierto"
      },
      {
        ar: "قصر الباهية - روعة الفن الأندلسي المغربي",
        en: "Bahia Palace - Splendor of Moroccan Andalusian art",
        fr: "Palais Bahia - Splendeur de l'art andalou-marocain",
        es: "Palacio Bahia - Esplendor del arte andaluz-marroquí"
      },
      {
        ar: "أسواق المدينة القديمة - تسوق تقليدي لا يُنسى",
        en: "Old Medina Souks - Unforgettable traditional shopping",
        fr: "Souks de la Vieille Médina - Shopping traditionnel inoubliable",
        es: "Zocos de la Medina Antigua - Compras tradicionales inolvidables"
      },
      {
        ar: "رحلة يوم إلى صحراء أوريكا أو جبال الأطلس",
        en: "Day trip to Ourika Desert or Atlas Mountains",
        fr: "Excursion à la désert d'Ourika ou les montagnes de l'Atlas",
        es: "Excursión de un día al desierto de Ourika o las montañas del Atlas"
      }
    ],
    foodTips: {
      ar: "لا تفوت: الطاجين، الكسكس، البسطيلة، الحريرة، الشاي بالنعناع. وجبة شعبية: 3-8$، مطعم جيد: 15-30$",
      en: "Don't miss: tagine, couscous, pastilla, harira, mint tea. Street food: $3-8, good restaurant: $15-30",
      fr: "Ne manquez pas: tajine, couscous, pastilla, harira, thé à la menthe. Rue: 3-8$, bon restaurant: 15-30$",
      es: "No te pierdas: tagine, cuscús, pastela, harira, té de menta. Comida callejera: $3-8, buen restaurante: $15-30"
    },
    transportTips: {
      ar: "المدينة القديمة: المشي أفضل خيار (السيارات محظورة في بعض الأزقة). تاكسي حمراء: رخيصة جداً (2-5$). توك توك للزيارات القريبة.",
      en: "Old Medina: walking is best (cars banned in some alleys). Red taxis: very cheap ($2-5). Tuk-tuk for nearby visits.",
      fr: "Vieille Médina: marche la meilleure option (voitures interdites). Taxis rouges: très bon marché (2-5$). Tuk-tuk pour visites proches.",
      es: "Medina Antigua: caminar es mejor (coches prohibidos en algunos callejones). Taxis rojos: muy baratos ($2-5). Tuk-tuk para visitas cercanas."
    },
    safetyRating: 4,
    tags: ["culture", "affordable", "food", "history", "shopping", "desert", "adventure"],
    visaInfo: {
      ar: "معظم الجنسيات الأوروبية والعربية تدخل بدون فيزا لمدة 90 يوماً.",
      en: "Most European and Arab nationalities enter visa-free for 90 days.",
      fr: "La plupart des nationalités européennes et arabes entrent sans visa pour 90 jours.",
      es: "La mayoría de las nacionalidades europeas y árabes entran sin visado por 90 días."
    }
  },

  // ══════════════════════════════════════
  // برشلونة
  // ══════════════════════════════════════
  {
    iata: "BCN",
    city: { ar: "برشلونة", en: "Barcelona", fr: "Barcelone", es: "Barcelona" },
    country: { ar: "إسبانيا", en: "Spain", fr: "Espagne", es: "España" },
    continent: "europe",
    timezone: "UTC+1",
    currency: { code: "EUR", symbol: "€", name: "Euro" },
    language: "Spanish / Catalan",
    bestMonths: [4, 5, 6, 9, 10],
    avoidMonths: [7, 8],
    budgetPerDay: { budget: 60, midrange: 150, luxury: 400, currency: "USD" },
    overview: {
      ar: "المدينة التي تجمع الشمس والبحر والفن! برشلونة فريدة من نوعها: معمار غاودي الساحر، شواطئ المتوسط الرائعة، حياة ليلية لا تنام، وطعام لا يُنسى.",
      en: "The city that combines sun, sea and art! Barcelona is unique: enchanting Gaudí architecture, stunning Mediterranean beaches, nightlife that never sleeps, unforgettable food.",
      fr: "La ville qui combine soleil, mer et art! Barcelone est unique: architecture enchanteresse de Gaudí, plages méditerranéennes époustouflantes, vie nocturne infinie.",
      es: "¡La ciudad que combina sol, mar y arte! Barcelona es única: encantadora arquitectura de Gaudí, impresionantes playas mediterráneas, vida nocturna sin fin."
    },
    topAttractions: [
      {
        ar: "كنيسة ساغرادا فاميليا - أيقونة غاودي الخالدة",
        en: "Sagrada Família - Gaudí's eternal masterpiece",
        fr: "Sagrada Família - Le chef-d'œuvre éternel de Gaudí",
        es: "Sagrada Família - La obra maestra eterna de Gaudí"
      },
      {
        ar: "لاس رامبلاس - الشارع الأشهر في إسبانيا",
        en: "Las Ramblas - Spain's most famous street",
        fr: "Las Ramblas - La rue la plus célèbre d'Espagne",
        es: "Las Ramblas - La calle más famosa de España"
      },
      {
        ar: "حديقة غيل - سحر غاودي في الطبيعة",
        en: "Park Güell - Gaudí's magic in nature",
        fr: "Parc Güell - La magie de Gaudí dans la nature",
        es: "Parque Güell - La magia de Gaudí en la naturaleza"
      },
      {
        ar: "شاطئ برشلوناتا - أجمل شاطئ في المدينة",
        en: "Barceloneta Beach - City's most beautiful beach",
        fr: "Plage de la Barceloneta - La plus belle plage de la ville",
        es: "Playa de la Barceloneta - La playa más hermosa de la ciudad"
      },
      {
        ar: "حي القوطي - قلب برشلونة التاريخي",
        en: "Gothic Quarter - Barcelona's historic heart",
        fr: "Quartier Gothique - Le cœur historique de Barcelone",
        es: "Barrio Gótico - El corazón histórico de Barcelona"
      }
    ],
    foodTips: {
      ar: "لا تفوت: التاباس، البايا، كروكيتاس، البان كون توماتي. وجبة شعبية: 10-15€، مطعم جيد: 25-50€. تجنب المطاعم على اللاس رامبلاس (سياحية وغالية)!",
      en: "Don't miss: tapas, paella, croquetas, pan con tomate. Budget meal: €10-15, good restaurant: €25-50. Avoid restaurants on Las Ramblas (touristy and overpriced)!",
      fr: "Ne manquez pas: tapas, paëlla, croquetas, pan con tomate. Repas économique: 10-15€, bon restaurant: 25-50€. Évitez les restaurants de Las Ramblas!",
      es: "No te pierdas: tapas, paella, croquetas, pan con tomate. Comida económica: 10-15€, buen restaurante: 25-50€. ¡Evita restaurantes en Las Ramblas!"
    },
    transportTips: {
      ar: "T-Casual: 10 رحلات بـ 11.35€ للمترو والباص. مثالية للزيارات القصيرة. الدراجة: خيار رائع في الصيف. المشي: في الحي القوطي ضروري.",
      en: "T-Casual: 10 trips for €11.35 on metro and bus. Perfect for short visits. Bicycle: great summer option. Walking: essential in Gothic Quarter.",
      fr: "T-Casual: 10 trajets pour 11,35€ métro et bus. Parfait pour visites courtes. Vélo: super en été. Marche: essentielle dans le Quartier Gothique.",
      es: "T-Casual: 10 viajes por 11,35€ en metro y autobús. Perfecto para visitas cortas. Bicicleta: genial en verano. Caminar: esencial en el Barrio Gótico."
    },
    safetyRating: 4,
    tags: ["beach", "culture", "nightlife", "food", "architecture", "modern", "art"],
    visaInfo: {
      ar: "منطقة شنغن: فيزا شنغن مطلوبة لغير الأوروبيين. تأمين طبي 30,000€ إلزامي.",
      en: "Schengen zone: Schengen visa required for non-EU. €30,000 medical insurance mandatory.",
      fr: "Zone Schengen: visa Schengen requis hors UE. Assurance médicale 30 000€ obligatoire.",
      es: "Zona Schengen: visado Schengen requerido fuera de la UE. Seguro médico de 30.000€ obligatorio."
    }
  },

  // ══════════════════════════════════════
  // بانكوك
  // ══════════════════════════════════════
  {
    iata: "BKK",
    city: { ar: "بانكوك", en: "Bangkok", fr: "Bangkok", es: "Bangkok" },
    country: { ar: "تايلاند", en: "Thailand", fr: "Thaïlande", es: "Tailandia" },
    continent: "asia",
    timezone: "UTC+7",
    currency: { code: "THB", symbol: "฿", name: "Baht" },
    language: "Thai",
    bestMonths: [11, 12, 1, 2, 3],
    avoidMonths: [5, 6, 7, 8, 9, 10],
    budgetPerDay: { budget: 30, midrange: 80, luxury: 250, currency: "USD" },
    overview: {
      ar: "مدينة المعابد والشوارع النابضة بالحياة! بانكوك توفر كل شيء: معابد ذهبية رائعة، أكل شارع لذيذ ورخيص، حياة ليلية أسطورية، وتسوق لا نهاية له.",
      en: "City of temples and vibrant streets! Bangkok offers everything: magnificent golden temples, delicious cheap street food, legendary nightlife, endless shopping.",
      fr: "Ville des temples et des rues animées! Bangkok offre tout: temples dorés magnifiques, street food délicieuse et bon marché, vie nocturne légendaire.",
      es: "¡Ciudad de templos y calles vibrantes! Bangkok lo ofrece todo: magníficos templos dorados, comida callejera deliciosa y barata, vida nocturna legendaria."
    },
    topAttractions: [
      {
        ar: "معبد الفجر (وات أرون) - الأجمل على ضفاف نهر تشاو فرايا",
        en: "Wat Arun (Temple of Dawn) - Most beautiful on Chao Phraya river",
        fr: "Wat Arun (Temple de l'Aube) - Le plus beau sur le Chao Phraya",
        es: "Wat Arun (Templo del Amanecer) - El más hermoso en el río Chao Phraya"
      },
      {
        ar: "معبد الزمرد (وات فرا كايو) - أقدس مكان في تايلاند",
        en: "Emerald Buddha Temple (Wat Phra Kaew) - Thailand's holiest site",
        fr: "Temple du Bouddha d'Émeraude - Le site le plus sacré de Thaïlande",
        es: "Templo del Buda de Esmeralda - El lugar más sagrado de Tailandia"
      },
      {
        ar: "سوق تشاتوشاك - أكبر سوق للبضائع المستعملة في العالم",
        en: "Chatuchak Weekend Market - World's largest weekend market",
        fr: "Marché du Week-end de Chatuchak - Plus grand marché du week-end au monde",
        es: "Mercado de Fin de Semana Chatuchak - El mercado de fin de semana más grande del mundo"
      },
      {
        ar: "خيانفا رود - سوق الشارع الأسطوري",
        en: "Khao San Road - Legendary backpacker street",
        fr: "Khao San Road - La rue légendaire des routards",
        es: "Khao San Road - La calle legendaria de los mochileros"
      },
      {
        ar: "رحلة نهرية إلى أيوثايا - عاصمة المملكة القديمة",
        en: "River trip to Ayutthaya - Ancient kingdom capital",
        fr: "Excursion fluviale à Ayutthaya - Capitale de l'ancien royaume",
        es: "Viaje en barco a Ayutthaya - Capital del antiguo reino"
      }
    ],
    foodTips: {
      ar: "الجنة الغذائية! لا تفوت: باد تاي، توم يام، مانجو ستيكي رايس، أكل الشارع. وجبة شارع: 1-3$، مطعم جيد: 8-20$",
      en: "Food paradise! Don't miss: pad thai, tom yam, mango sticky rice, street food. Street meal: $1-3, good restaurant: $8-20",
      fr: "Paradis gastronomique! Ne manquez pas: pad thaï, tom yam, riz gluant à la mangue, street food. Repas de rue: 1-3$, bon restaurant: 8-20$",
      es: "¡Paraíso gastronómico! No te pierdas: pad thai, tom yam, arroz glutinoso con mango, comida callejera. Comida callejera: $1-3, buen restaurante: $8-20"
    },
    transportTips: {
      ar: "BTS Skytrain + MRT: أفضل وسيلة لتجنب الازدحام. تاكسي: رخيص جداً (2-5$). Grab (أوبر تايلاند): موصى به. تك تك: للتجربة السياحية فقط.",
      en: "BTS Skytrain + MRT: best to avoid traffic. Taxi: very cheap ($2-5). Grab (Thai Uber): recommended. Tuk-tuk: for tourist experience only.",
      fr: "BTS Skytrain + MRT: meilleur pour éviter la circulation. Taxi: très bon marché (2-5$). Grab recommandé. Tuk-tuk: pour l'expérience touristique seulement.",
      es: "BTS Skytrain + MRT: mejor para evitar el tráfico. Taxi: muy barato ($2-5). Grab recomendado. Tuk-tuk: solo para experiencia turística."
    },
    safetyRating: 4,
    tags: ["affordable", "food", "temples", "nightlife", "shopping", "culture", "beach-nearby"],
    visaInfo: {
      ar: "30 يوماً مجاناً عند الوصول لمعظم الجنسيات. تمديد 30 يوماً إضافية ممكن من داخل البلاد.",
      en: "30 days visa-free on arrival for most nationalities. 30-day extension possible from inside the country.",
      fr: "30 jours sans visa à l'arrivée pour la plupart. Extension de 30 jours possible depuis l'intérieur.",
      es: "30 días sin visado a la llegada para la mayoría. Extensión de 30 días posible desde dentro del país."
    }
  },

  // ══════════════════════════════════════
  // نيويورك
  // ══════════════════════════════════════
  {
    iata: "JFK",
    city: { ar: "نيويورك", en: "New York", fr: "New York", es: "Nueva York" },
    country: { ar: "الولايات المتحدة", en: "USA", fr: "États-Unis", es: "Estados Unidos" },
    continent: "americas",
    timezone: "UTC-5",
    currency: { code: "USD", symbol: "$", name: "Dollar" },
    language: "English",
    bestMonths: [4, 5, 6, 9, 10],
    avoidMonths: [1, 2],
    budgetPerDay: { budget: 120, midrange: 300, luxury: 800, currency: "USD" },
    overview: {
      ar: "المدينة التي لا تنام! نيويورك أيقونة العالم: تمثال الحرية، سنترال بارك، برودواي، وسط المدينة المضيء. تجربة لا تُنسى في عاصمة العالم غير الرسمية.",
      en: "The city that never sleeps! New York is a world icon: Statue of Liberty, Central Park, Broadway, glittering Midtown. Unforgettable experience in the world's unofficial capital.",
      fr: "La ville qui ne dort jamais! New York est une icône mondiale: Statue de la Liberté, Central Park, Broadway, Midtown brillant. Expérience inoubliable.",
      es: "¡La ciudad que nunca duerme! Nueva York es un ícono mundial: Estatua de la Libertad, Central Park, Broadway, Midtown brillante. Experiencia inolvidable."
    },
    topAttractions: [
      {
        ar: "تمثال الحرية وجزيرة إليس - رمز أمريكا الأبدي",
        en: "Statue of Liberty & Ellis Island - America's eternal symbol",
        fr: "Statue de la Liberté et Ellis Island - Symbole éternel de l'Amérique",
        es: "Estatua de la Libertad e Isla Ellis - Símbolo eterno de América"
      },
      {
        ar: "سنترال بارك - الرئة الخضراء لنيويورك",
        en: "Central Park - New York's green lung",
        fr: "Central Park - Le poumon vert de New York",
        es: "Central Park - El pulmón verde de Nueva York"
      },
      {
        ar: "تايمز سكوير - قلب المدينة النابض بالحياة",
        en: "Times Square - The city's vibrant heart",
        fr: "Times Square - Le cœur animé de la ville",
        es: "Times Square - El corazón vibrante de la ciudad"
      },
      {
        ar: "متحف المتروبوليتان - أحد أعظم متاحف العالم",
        en: "Metropolitan Museum - One of the world's greatest museums",
        fr: "Metropolitan Museum - L'un des plus grands musées au monde",
        es: "Museo Metropolitano - Uno de los mejores museos del mundo"
      },
      {
        ar: "جسر بروكلين - رمز هندسي وإطلالة خيالية",
        en: "Brooklyn Bridge - Engineering icon with dream views",
        fr: "Pont de Brooklyn - Icône architecturale et vues de rêve",
        es: "Puente de Brooklyn - Icono de ingeniería con vistas de ensueño"
      }
    ],
    foodTips: {
      ar: "لا تفوت: البيتزا بالشريحة، الهوت دوج، بيغل بالسلمون، أكل الشارع العالمي. وجبة بسيطة: 10-20$، مطعم جيد: 30-80$",
      en: "Don't miss: pizza by the slice, hot dog, bagel with lox, global street food. Simple meal: $10-20, good restaurant: $30-80",
      fr: "Ne manquez pas: pizza à la part, hot dog, bagel au saumon, street food mondiale. Repas simple: 10-20$, bon restaurant: 30-80$",
      es: "No te pierdas: pizza por porción, hot dog, bagel con salmón, comida callejera mundial. Comida simple: $10-20, buen restaurante: $30-80"
    },
    transportTips: {
      ar: "المترو: 2.90$ للرحلة أو بطاقة أسبوعية 34$. يعمل 24/7. تجنب التاكسي في ساعات الذروة. المشي: أفضل طريقة لاستكشاف مانهاتن.",
      en: "Subway: $2.90/ride or weekly card $34. Runs 24/7. Avoid taxis in rush hour. Walking: best way to explore Manhattan.",
      fr: "Métro: 2,90$/trajet ou carte hebdomadaire 34$. Fonctionne 24h/24. Évitez les taxis aux heures de pointe. Marche: meilleure façon d'explorer Manhattan.",
      es: "Metro: $2,90/viaje o tarjeta semanal $34. Funciona 24/7. Evita taxis en hora punta. Caminar: la mejor manera de explorar Manhattan."
    },
    safetyRating: 4,
    tags: ["iconic", "culture", "shopping", "nightlife", "food", "art", "business"],
    visaInfo: {
      ar: "معظم الجنسيات تحتاج ESTA (14$) أو فيزا B1/B2 (185$). تقدم قبل 3 أشهر على الأقل.",
      en: "Most nationalities need ESTA ($14) or B1/B2 visa ($185). Apply at least 3 months in advance.",
      fr: "La plupart des nationalités ont besoin d'ESTA (14$) ou visa B1/B2 (185$). Demandez au moins 3 mois à l'avance.",
      es: "La mayoría de nacionalidades necesitan ESTA ($14) o visa B1/B2 ($185). Solicita con al menos 3 meses de antelación."
    }
  },
];

// ══════════════════════════════════════════════════════
// 2. قاعدة شركات الطيران
// ══════════════════════════════════════════════════════

export interface Airline {
  iata: string;
  icao: string;
  name: string;
  nameAr: string;
  country: string;
  hub: string;
  class: "budget" | "standard" | "premium" | "luxury";
  baggagePolicy: {
    carryOn: { weight: number; dimensions: string };
    checked: { weight: number; included: boolean; price?: string };
    business?: { weight: number; pieces: number };
  };
  cancellationPolicy: { ar: string; en: string };
  rating: number;
  website: string;
  callCenter: string;
  tags: string[];
}

export const AIRLINES_DB: Airline[] = [
  // ══════ الخليج والشرق الأوسط ══════
  {
    iata: "EK", icao: "UAE",
    name: "Emirates", nameAr: "طيران الإمارات",
    country: "UAE", hub: "DXB",
    class: "luxury",
    baggagePolicy: {
      carryOn: { weight: 7, dimensions: "55x38x20cm" },
      checked: { weight: 25, included: true },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "تذاكر Flex قابلة للاسترداد الكامل. Economy قابلة للتغيير برسوم 200$",
      en: "Flex tickets fully refundable. Economy changeable with $200 fee"
    },
    rating: 9.2,
    website: "https://www.emirates.com",
    callCenter: "+971-600-555-555",
    tags: ["luxury", "long-haul", "premium", "middle-east", "global"]
  },
  {
    iata: "QR", icao: "QTR",
    name: "Qatar Airways", nameAr: "الخطوط الجوية القطرية",
    country: "Qatar", hub: "DOH",
    class: "luxury",
    baggagePolicy: {
      carryOn: { weight: 7, dimensions: "50x37x25cm" },
      checked: { weight: 23, included: true },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "سياسة مرنة للغاية. تغيير مجاني للرحلات المتأثرة",
      en: "Very flexible policy. Free changes for affected flights"
    },
    rating: 9.4,
    website: "https://www.qatarairways.com",
    callCenter: "+974-4023-0000",
    tags: ["luxury", "long-haul", "award-winning", "middle-east"]
  },
  {
    iata: "EY", icao: "ETD",
    name: "Etihad Airways", nameAr: "الاتحاد للطيران",
    country: "UAE", hub: "AUH",
    class: "premium",
    baggagePolicy: {
      carryOn: { weight: 7, dimensions: "50x40x25cm" },
      checked: { weight: 23, included: true },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "تعتمد على نوع التذكرة. Economy Light غير قابلة للاسترداد",
      en: "Depends on ticket type. Economy Light non-refundable"
    },
    rating: 8.8,
    website: "https://www.etihad.com",
    callCenter: "+971-2-511-0000",
    tags: ["premium", "long-haul", "middle-east"]
  },
  {
    iata: "TK", icao: "THY",
    name: "Turkish Airlines", nameAr: "الخطوط الجوية التركية",
    country: "Turkey", hub: "IST",
    class: "premium",
    baggagePolicy: {
      carryOn: { weight: 8, dimensions: "55x40x23cm" },
      checked: { weight: 23, included: true },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "قابلة للتغيير برسوم. استرداد جزئي حسب نوع التذكرة",
      en: "Changeable with fees. Partial refund based on ticket type"
    },
    rating: 8.7,
    website: "https://www.turkishairlines.com",
    callCenter: "+90-212-444-0849",
    tags: ["premium", "global", "europe", "middle-east", "affordable-luxury"]
  },

  // ══════ أوروبا ══════
  {
    iata: "BA", icao: "BAW",
    name: "British Airways", nameAr: "الخطوط الجوية البريطانية",
    country: "UK", hub: "LHR",
    class: "premium",
    baggagePolicy: {
      carryOn: { weight: 23, dimensions: "56x45x25cm" },
      checked: { weight: 23, included: false, price: "from £60" },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "تذاكر Basic غير قابلة للاسترداد. Plus و Flex قابلة للتغيير",
      en: "Basic tickets non-refundable. Plus and Flex changeable"
    },
    rating: 8.3,
    website: "https://www.britishairways.com",
    callCenter: "+44-344-493-0787",
    tags: ["premium", "europe", "transatlantic", "classic"]
  },
  {
    iata: "AF", icao: "AFR",
    name: "Air France", nameAr: "إير فرانس",
    country: "France", hub: "CDG",
    class: "premium",
    baggagePolicy: {
      carryOn: { weight: 12, dimensions: "55x35x25cm" },
      checked: { weight: 23, included: false, price: "from €30" },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "Light غير قابلة للاسترداد. Standard قابلة للتغيير برسوم",
      en: "Light non-refundable. Standard changeable with fees"
    },
    rating: 8.2,
    website: "https://www.airfrance.com",
    callCenter: "+33-892-702-654",
    tags: ["premium", "europe", "transatlantic", "french"]
  },
  {
    iata: "LH", icao: "DLH",
    name: "Lufthansa", nameAr: "لوفتهانزا",
    country: "Germany", hub: "FRA",
    class: "premium",
    baggagePolicy: {
      carryOn: { weight: 8, dimensions: "55x40x23cm" },
      checked: { weight: 23, included: false, price: "from €30" },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "Light غير قابلة للاسترداد. Flex قابلة للاسترداد الكامل",
      en: "Light non-refundable. Flex fully refundable"
    },
    rating: 8.4,
    website: "https://www.lufthansa.com",
    callCenter: "+49-69-86-799-799",
    tags: ["premium", "europe", "reliable", "german"]
  },
  {
    iata: "IB", icao: "IBE",
    name: "Iberia", nameAr: "إيبيريا",
    country: "Spain", hub: "MAD",
    class: "standard",
    baggagePolicy: {
      carryOn: { weight: 10, dimensions: "56x45x25cm" },
      checked: { weight: 23, included: false, price: "from €25" },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "Básico غير قابل للاسترداد. Óptimo قابل للتغيير",
      en: "Básico non-refundable. Óptimo changeable"
    },
    rating: 8.0,
    website: "https://www.iberia.com",
    callCenter: "+34-901-111-500",
    tags: ["standard", "europe", "spain", "latin-america"]
  },

  // ══════ البجت / الاقتصادية ══════
  {
    iata: "FR", icao: "RYR",
    name: "Ryanair", nameAr: "رايان إير",
    country: "Ireland", hub: "DUB",
    class: "budget",
    baggagePolicy: {
      carryOn: { weight: 10, dimensions: "40x20x25cm" },
      checked: { weight: 20, included: false, price: "from €10" },
    },
    cancellationPolicy: {
      ar: "⚠️ غير قابلة للاسترداد في الغالب! تأمين سفر ضروري. تغيير: 45-115€",
      en: "⚠️ Usually non-refundable! Travel insurance essential. Change fee: €45-115"
    },
    rating: 7.2,
    website: "https://www.ryanair.com",
    callCenter: "+44-1279-358-395",
    tags: ["budget", "europe", "low-cost", "no-frills"]
  },
  {
    iata: "U2", icao: "EZY",
    name: "EasyJet", nameAr: "إيزي جيت",
    country: "UK", hub: "LTN",
    class: "budget",
    baggagePolicy: {
      carryOn: { weight: 15, dimensions: "56x45x25cm" },
      checked: { weight: 23, included: false, price: "from £17" },
    },
    cancellationPolicy: {
      ar: "غير قابلة للاسترداد. تغيير رحلة: 33-49€. Flex قابلة للتغيير مجاناً",
      en: "Non-refundable. Flight change: €33-49. Flex changeable for free"
    },
    rating: 7.5,
    website: "https://www.easyjet.com",
    callCenter: "+44-330-365-5000",
    tags: ["budget", "europe", "low-cost"]
  },
  {
    iata: "VY", icao: "VLG",
    name: "Vueling", nameAr: "فويلينغ",
    country: "Spain", hub: "BCN",
    class: "budget",
    baggagePolicy: {
      carryOn: { weight: 10, dimensions: "55x40x20cm" },
      checked: { weight: 23, included: false, price: "from €20" },
    },
    cancellationPolicy: {
      ar: "Basic غير قابلة للاسترداد. Optima قابلة للتغيير",
      en: "Basic non-refundable. Optima changeable"
    },
    rating: 7.6,
    website: "https://www.vueling.com",
    callCenter: "+34-931-51-81-58",
    tags: ["budget", "spain", "europe", "low-cost"]
  },

  // ══════ المغرب والجزائر وتونس ══════
  {
    iata: "AT", icao: "RAM",
    name: "Royal Air Maroc", nameAr: "الخطوط الملكية المغربية",
    country: "Morocco", hub: "CMN",
    class: "standard",
    baggagePolicy: {
      carryOn: { weight: 10, dimensions: "55x40x20cm" },
      checked: { weight: 23, included: true },
      business: { weight: 32, pieces: 2 }
    },
    cancellationPolicy: {
      ar: "تعتمد على التعرفة. Eco قابلة للتغيير برسوم. Flex قابلة للاسترداد",
      en: "Depends on fare. Eco changeable with fees. Flex refundable"
    },
    rating: 7.8,
    website: "https://www.royalairmaroc.com",
    callCenter: "+212-89-000-800",
    tags: ["standard", "morocco", "africa", "europe"]
  },
  {
    iata: "AH", icao: "DAH",
    name: "Air Algérie", nameAr: "الجوية الجزائرية",
    country: "Algeria", hub: "ALG",
    class: "standard",
    baggagePolicy: {
      carryOn: { weight: 10, dimensions: "55x35x25cm" },
      checked: { weight: 23, included: true },
    },
    cancellationPolicy: {
      ar: "استرداد جزئي حسب موعد الإلغاء. تواصل مع مكتب المبيعات",
      en: "Partial refund based on cancellation date. Contact sales office"
    },
    rating: 6.8,
    website: "https://www.airalgerie.dz",
    callCenter: "+213-21-74-24-28",
    tags: ["standard", "algeria", "africa", "france"]
  },
  {
    iata: "TU", icao: "TAR",
    name: "Tunisair", nameAr: "الخطوط التونسية",
    country: "Tunisia", hub: "TUN",
    class: "standard",
    baggagePolicy: {
      carryOn: { weight: 10, dimensions: "55x35x25cm" },
      checked: { weight: 23, included: true },
    },
    cancellationPolicy: {
      ar: "رسوم إلغاء تتراوح 20-100% حسب التعرفة والموعد",
      en: "Cancellation fees range 20-100% based on fare and timing"
    },
    rating: 7.0,
    website: "https://www.tunisair.com",
    callCenter: "+216-70-837-000",
    tags: ["standard", "tunisia", "africa", "europe"]
  },
];

// ══════════════════════════════════════════════════════
// دوال البحث
// ══════════════════════════════════════════════════════

// البحث عن وجهة
export function findDestination(query: string): Destination | null {
  const q = query.toLowerCase().trim();
  return DESTINATIONS_DB.find(d =>
    d.iata.toLowerCase() === q ||
    d.city.en.toLowerCase().includes(q) ||
    d.city.ar.includes(query) ||
    d.city.fr.toLowerCase().includes(q) ||
    d.city.es.toLowerCase().includes(q)
  ) || null;
}

// الوجهات الأرخص حسب الميزانية اليومية
export function getDestinationsByBudget(maxDailyBudget: number): Destination[] {
  return DESTINATIONS_DB
    .filter(d => d.budgetPerDay.budget <= maxDailyBudget)
    .sort((a, b) => a.budgetPerDay.budget - b.budgetPerDay.budget);
}

// الوجهات المناسبة لهذا الشهر
export function getBestDestinationsNow(): Destination[] {
  const month = new Date().getMonth() + 1;
  return DESTINATIONS_DB.filter(d => d.bestMonths.includes(month));
}

// معلومات شركة الطيران
export function findAirline(query: string): Airline | null {
  const q = query.toLowerCase().trim();
  return AIRLINES_DB.find(a =>
    a.iata.toLowerCase() === q ||
    a.name.toLowerCase().includes(q) ||
    a.nameAr.includes(query)
  ) || null;
}

// تنسيق معلومات الوجهة
export function formatDestinationInfo(dest: Destination, lang: "ar" | "en" | "fr" | "es"): string {
  const city = dest.city[lang];
  const country = dest.country[lang];
  const overview = dest.overview[lang];
  const food = dest.foodTips[lang];
  const transport = dest.transportTips[lang];
  const visa = dest.visaInfo[lang];
  const safety = "⭐".repeat(dest.safetyRating);

  const attractions = dest.topAttractions
    .slice(0, 3)
    .map(a => `• ${a[lang]}`)
    .join("\n");

  const bestMonthNames = {
    ar: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
    en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    fr: ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"],
    es: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
  };

  const months = dest.bestMonths.map(m => bestMonthNames[lang][m-1]).join(", ");

  const labels = {
    ar: { attractions: "أبرز المعالم", food: "الطعام", transport: "التنقل", visa: "الفيزا", budget: "الميزانية اليومية", safety: "الأمان", bestTime: "أفضل وقت" },
    en: { attractions: "Top Attractions", food: "Food", transport: "Transport", visa: "Visa", budget: "Daily Budget", safety: "Safety", bestTime: "Best Time" },
    fr: { attractions: "Principales Attractions", food: "Gastronomie", transport: "Transport", visa: "Visa", budget: "Budget Journalier", safety: "Sécurité", bestTime: "Meilleure Période" },
    es: { attractions: "Principales Atracciones", food: "Gastronomía", transport: "Transporte", visa: "Visado", budget: "Presupuesto Diario", safety: "Seguridad", bestTime: "Mejor Época" }
  };

  const l = labels[lang];

  return `🌍 **${city}, ${country}** (${dest.iata})

${overview}

🏛️ **${l.attractions}:**
${attractions}

🍽️ **${l.food}:**
${food}

🚇 **${l.transport}:**
${transport}

📅 **${l.bestTime}:** ${months}
🛡️ **${l.safety}:** ${safety}
💰 **${l.budget}:** $${dest.budgetPerDay.budget} (budget) / $${dest.budgetPerDay.midrange} (midrange) / $${dest.budgetPerDay.luxury} (luxury)
🛂 **${l.visa}:** ${visa}`;
}

// تنسيق معلومات الأمتعة لشركة طيران
export function formatAirlineBaggage(airline: Airline, lang: "ar" | "en" | "fr" | "es"): string {
  const labels = {
    ar: { carryOn: "حقيبة يد", checked: "حقيبة مسجلة", business: "درجة أعمال", included: "مشمولة", extra: "إضافية", cancel: "الإلغاء" },
    en: { carryOn: "Carry-on", checked: "Checked bag", business: "Business class", included: "Included", extra: "Extra charge", cancel: "Cancellation" },
    fr: { carryOn: "Bagage cabine", checked: "Bagage en soute", business: "Classe affaires", included: "Inclus", extra: "Supplément", cancel: "Annulation" },
    es: { carryOn: "Equipaje de mano", checked: "Maleta facturada", business: "Clase business", included: "Incluida", extra: "Cargo extra", cancel: "Cancelación" }
  };

  const l = labels[lang];
  const checkedStatus = airline.baggagePolicy.checked.included
    ? l.included
    : `${l.extra}: ${airline.baggagePolicy.checked.price}`;

  let result = `✈️ **${airline.nameAr} (${airline.iata})**\n\n`;
  result += `🎒 **${l.carryOn}:** ${airline.baggagePolicy.carryOn.weight}kg (${airline.baggagePolicy.carryOn.dimensions})\n`;
  result += `🧳 **${l.checked}:** ${airline.baggagePolicy.checked.weight}kg - ${checkedStatus}\n`;

  if (airline.baggagePolicy.business) {
    result += `💺 **${l.business}:** ${airline.baggagePolicy.business.weight}kg × ${airline.baggagePolicy.business.pieces}\n`;
  }

  result += `\n❌ **${l.cancel}:** ${airline.cancellationPolicy[lang]}`;
  return result;
}

// إحصائيات
export const DESTINATIONS_STATS = {
  total: DESTINATIONS_DB.length,
  byContinent: DESTINATIONS_DB.reduce((acc, d) => {
    acc[d.continent] = (acc[d.continent] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
};

export const AIRLINES_STATS = {
  total: AIRLINES_DB.length,
  byClass: AIRLINES_DB.reduce((acc, a) => {
    acc[a.class] = (acc[a.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
};