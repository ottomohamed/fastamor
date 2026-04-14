// ═══════════════════════════════════════════════════════
// قاعدة الردود الجاهزة - Fastamor AI
// 4 لغات: العربية، الإنجليزية، الفرنسية، الإسبانية
// لا تستهلك AI أبداً
// ═══════════════════════════════════════════════════════

export interface ReadyResponse {
  patterns: string[];       // الكلمات التي تطلق هذا الرد
  response: string;         // الرد الجاهز
  action?: "search_flight" | "search_hotel" | "search_transfer" | "show_tips" | "none";
  params?: Record<string, string>;
}

export interface LanguageResponses {
  greeting: ReadyResponse[];
  flight: ReadyResponse[];
  hotel: ReadyResponse[];
  transfer: ReadyResponse[];
  tips: ReadyResponse[];
  price: ReadyResponse[];
  visa: ReadyResponse[];
  weather: ReadyResponse[];
  luggage: ReadyResponse[];
  fallback: ReadyResponse[];
  goodbye: ReadyResponse[];
}

// ═══════════════════════════════════════════════════════
// العربية
// ═══════════════════════════════════════════════════════
export const AR: LanguageResponses = {
  greeting: [
    {
      patterns: ["مرحبا", "مرحباً", "السلام عليكم", "هلا", "أهلا", "اهلا", "صباح الخير", "مساء الخير", "hi", "hello"],
      response: "أهلاً وسهلاً! 👋 أنا مساعدك للسفر في Fastamor.\n\nيمكنني مساعدتك في:\n✈️ البحث عن أرخص رحلات\n🏨 حجز الفنادق\n🚗 خدمات النقل\n\nإلى أين تريد السفر؟",
      action: "none"
    }
  ],

  flight: [
    {
      patterns: ["أرخص رحلة", "ارخص رحلة", "أقل سعر", "اقل سعر", "cheapest", "رخيص", "بأقل تكلفة"],
      response: "💡 للحصول على أرخص الرحلات:\n\n• احجز قبل 6-8 أسابيع\n• السفر الثلاثاء والأربعاء أرخص\n• تجنب المواسم (يوليو، أغسطس، ديسمبر)\n• جرب تواريخ مرنة\n\nمن أي مدينة وإلى أين؟",
      action: "none"
    },
    {
      patterns: ["رحلة مباشرة", "بدون توقف", "direct flight", "non stop"],
      response: "✈️ تبحث عن رحلة مباشرة!\n\nالرحلات المباشرة عادةً أغلى بـ 20-40%.\n\nأخبرني:\n• مدينة المغادرة؟\n• الوجهة؟\n• تاريخ السفر؟",
      action: "search_flight"
    },
    {
      patterns: ["رحلة ذهاب وعودة", "ذهاب وإياب", "round trip", "aller retour"],
      response: "🔄 رحلة ذهاب وعودة - خيار ذكي!\n\nعادةً أوفر من تذكرتين منفصلتين.\n\nأخبرني:\n• مدينة الانطلاق؟\n• الوجهة؟\n• تاريخ الذهاب والعودة؟",
      action: "search_flight"
    },
    {
      patterns: ["رحلة عائلية", "عائلة", "أطفال", "family", "kids", "children"],
      response: "👨‍👩‍👧‍👦 رحلة عائلية رائعة!\n\n💡 نصائح للعائلات:\n• احجز مقاعد متجاورة مبكراً\n• الأطفال أقل من 2 سنة مجاناً\n• اختار وجهات صديقة للأطفال\n\nكم عدد أفراد العائلة؟ وإلى أين؟",
      action: "search_flight"
    },
    {
      patterns: ["أفضل شركة طيران", "افضل شركة طيران", "best airline", "شركة موثوقة"],
      response: "✈️ أفضل شركات الطيران حسب المنطقة:\n\n🌍 أوروبا: Iberia, Vueling, Ryanair, EasyJet\n🌏 الخليج: Emirates, Qatar Airways, Etihad\n🌎 أمريكا: Delta, United, American\n🌐 الشرق الأوسط: Royal Air Maroc, Turkish\n\nما هي وجهتك؟",
      action: "none"
    },
    {
      patterns: ["كيف أحجز تذكرة", "كيف احجز", "طريقة الحجز", "how to book"],
      response: "📱 طريقة الحجز مع Fastamor:\n\n1️⃣ أخبرني وجهتك وتاريخ السفر\n2️⃣ سأبحث لك عن أفضل الأسعار\n3️⃣ اختر من الروابط المعروضة\n4️⃣ أكمل الحجز على الموقع المختار\n\nإلى أين تريد السفر؟",
      action: "none"
    },
    {
      patterns: ["هل يمكن تغيير الحجز", "تغيير التذكرة", "الغاء الحجز", "إلغاء", "refund", "استرداد"],
      response: "🔄 سياسة التغيير والإلغاء:\n\n• تعتمد على نوع التذكرة\n• التذاكر المرنة: قابلة للتغيير\n• التذاكر الرخيصة: غير قابلة للاسترداد غالباً\n• احتفظ دائماً بتأمين السفر\n\n💡 أنصحك بشراء تأمين سفر مع كل رحلة!",
      action: "none"
    },
    {
      patterns: ["وزن الأمتعة", "الأمتعة", "baggage", "luggage", "حقيبة"],
      response: "🧳 معلومات الأمتعة:\n\n✈️ اقتصادي عادةً:\n• حقيبة يد: 7-10 كغ\n• حقيبة مسجلة: 20-23 كغ (إضافية)\n\n💺 بزنس كلاس:\n• 2-3 حقائب مسجلة\n\n💡 تحقق من سياسة الشركة قبل السفر!",
      action: "none"
    }
  ],

  hotel: [
    {
      patterns: ["فندق رخيص", "فندق اقتصادي", "اقل سعر فندق", "cheap hotel", "budget hotel"],
      response: "🏨 للعثور على أرخص الفنادق:\n\n• احجز مباشرة من الموقع الرسمي أحياناً أوفر\n• جرب Booking.com وHotels.com\n• اختار الدفع عند الوصول\n• تجنب المواسم السياحية\n\nفي أي مدينة وما هي تواريخ الإقامة؟",
      action: "search_hotel"
    },
    {
      patterns: ["فندق 5 نجوم", "فندق فاخر", "luxury hotel", "5 star"],
      response: "⭐⭐⭐⭐⭐ تبحث عن الفخامة!\n\nأشهر الفنادق الفاخرة:\n• Marriott, Hilton, Four Seasons\n• Ritz Carlton, Mandarin Oriental\n• Jumeirah (دبي), Burj Al Arab\n\nفي أي مدينة تريد الإقامة؟",
      action: "search_hotel"
    },
    {
      patterns: ["شقة فندقية", "airbnb", "شقة للإيجار", "apartment"],
      response: "🏠 الشقق الفندقية خيار ممتاز للعائلات!\n\nمزايا الشقق:\n• مطبخ للطهي = توفير في المصاريف\n• مساحة أكبر\n• أسعار أفضل للإقامة الطويلة\n\nاستخدم Airbnb أو Booking للشقق.\nفي أي مدينة؟",
      action: "none"
    },
    {
      patterns: ["فندق قريب من المطار", "قرب المطار", "airport hotel"],
      response: "✈️ فندق قرب المطار - خيار ذكي للعبور!\n\n💡 نصيحة:\n• احجز في الاتجاه المعاكس (أقل سعراً)\n• بعض الفنادق توفر شاتل مجاني\n• تحقق من المسافة بالدقائق وليس الكيلومترات\n\nما هو المطار؟",
      action: "search_hotel"
    }
  ],

  transfer: [
    {
      patterns: ["تاكسي", "نقل من المطار", "transfer", "كيف أصل", "مواصلات"],
      response: "🚗 خيارات النقل من المطار:\n\n1️⃣ تاكسي رسمي - آمن لكن أغلى\n2️⃣ Uber/Careem - أرخص وموثوق\n3️⃣ باص المطار - الأرخص\n4️⃣ قطار (في بعض المدن) - الأسرع\n5️⃣ تأجير سيارة - للرحلات الطويلة\n\nأي مطار؟",
      action: "none"
    },
    {
      patterns: ["تأجير سيارة", "car rental", "استئجار سيارة"],
      response: "🚗 تأجير السيارات:\n\nأشهر شركات:\n• Hertz, Europcar, Avis\n• Sixt, Budget, Enterprise\n\n💡 نصائح:\n• احجز مسبقاً = أسعار أفضل\n• تحقق من التأمين\n• اقرأ شروط الوقود\n\nفي أي مدينة وكم يوماً؟",
      action: "none"
    }
  ],

  tips: [
    {
      patterns: ["نصائح للسفر", "نصيحة", "tips", "travel tips", "أول مرة"],
      response: "💡 نصائح ذهبية للمسافر:\n\n📋 قبل السفر:\n• احتفظ بنسخة من جواز السفر\n• اشتري تأمين سفر\n• أخطر البنك بسفرك\n\n✈️ في المطار:\n• وصل قبل 3 ساعات دولي / ساعتين محلي\n• وزن حقائبك مسبقاً\n\n🌍 في الوجهة:\n• تعلم كلمات بسيطة باللغة المحلية\n• احتفظ بمبلغ نقدي صغير",
      action: "none"
    },
    {
      patterns: ["أفضل وقت للسفر", "موسم السياحة", "best time to visit"],
      response: "📅 أفضل مواسم السفر:\n\n🌞 الصيف (يونيو-أغسطس):\n• أوروبا الشمالية ممتازة\n• تجنب جنوب أوروبا (حر شديد)\n\n🍂 الخريف (سبتمبر-نوفمبر):\n• الأفضل في أوروبا وآسيا\n• أسعار معقولة\n\n❄️ الشتاء (ديسمبر-فبراير):\n• مثالي للمناطق الاستوائية\n• الخليج والمغرب رائعان\n\nإلى أين تريد السفر؟",
      action: "none"
    }
  ],

  price: [
    {
      patterns: ["كم سعر", "كم التكلفة", "how much", "prix", "precio", "ثمن", "تكلفة"],
      response: "💰 الأسعار تتفاوت كثيراً!\n\nأخبرني:\n• من أين إلى أين؟\n• تاريخ السفر؟\n• عدد المسافرين؟\n\nسأبحث لك عن أدق الأسعار في الوقت الفعلي 🔍",
      action: "search_flight"
    },
    {
      patterns: ["ميزانية محدودة", "بميزانية", "budget", "مصروف محدود"],
      response: "💡 السفر بميزانية محدودة - ممكن!\n\n✅ وفر على الطيران:\n• تواريخ مرنة\n• رحلات مع توقف\n• حجز مبكر\n\n✅ وفر على الإقامة:\n• Hostel أو Airbnb\n• مناطق بعيدة عن المركز\n• طبخ بدل المطاعم\n\nما هي ميزانيتك وإلى أين؟",
      action: "none"
    }
  ],

  visa: [
    {
      patterns: ["فيزا", "تأشيرة", "visa", "وثائق السفر", "جواز سفر"],
      response: "🛂 معلومات الفيزا:\n\n⚠️ تختلف حسب جنسيتك والوجهة!\n\n🌍 مواقع مفيدة:\n• iVisa.com - طلب فيزا أونلاين\n• VisaHQ - معلومات شاملة\n• سفارة البلد المقصود\n\n💡 تحقق دائماً قبل 3 أشهر من السفر!\n\nما هي جنسيتك وإلى أين تسافر؟",
      action: "none"
    }
  ],

  weather: [
    {
      patterns: ["الطقس", "درجة الحرارة", "weather", "clima", "متى أسافر", "حرارة"],
      response: "🌤️ للاطلاع على طقس وجهتك:\n\n• Weather.com\n• AccuWeather.com\n• Google: 'طقس [اسم المدينة]'\n\n💡 أفضل درجة حرارة للسياحة: 18-25°C\n\nإلى أين تريد السفر وفي أي شهر؟",
      action: "none"
    }
  ],

  luggage: [
    {
      patterns: ["ماذا أحمل", "ماذا أضع في الحقيبة", "packing", "قائمة الحقيبة"],
      response: "🧳 قائمة الحقيبة الأساسية:\n\n📄 وثائق:\n• جواز سفر + نسخة\n• تذكرة الطيران\n• تأمين السفر\n• بطاقة الفندق\n\n👕 ملابس:\n• قاعدة 3-2-1 (3 قمصان، 2 بناطيل، 1 جاكيت)\n\n💊 صحة:\n• أدوية ضرورية\n• واقي شمس\n• مسكن للألم\n\n🔌 تقنية:\n• محول كهربائي\n• بطارية احتياطية",
      action: "none"
    }
  ],

  fallback: [
    {
      patterns: [],
      response: "🤔 لم أفهم سؤالك جيداً!\n\nيمكنني مساعدتك في:\n✈️ البحث عن رحلات\n🏨 حجز الفنادق\n💡 نصائح السفر\n🛂 معلومات الفيزا\n\nأخبرني: إلى أين تريد السفر؟",
      action: "none"
    }
  ],

  goodbye: [
    {
      patterns: ["شكرا", "شكراً", "مع السلامة", "وداعاً", "bye", "thanks", "thank you", "merci", "gracias"],
      response: "😊 شكراً لاستخدامك Fastamor!\n\nرحلة موفقة وآمنة ✈️\nنتمنى لك تجربة سفر لا تُنسى! 🌍\n\nعد إلينا في أي وقت تريد السفر 🙌",
      action: "none"
    }
  ]
};

// ═══════════════════════════════════════════════════════
// الإنجليزية
// ═══════════════════════════════════════════════════════
export const EN: LanguageResponses = {
  greeting: [
    {
      patterns: ["hi", "hello", "hey", "good morning", "good evening", "start", "help"],
      response: "Welcome to Fastamor! 👋 I'm your personal travel assistant.\n\nI can help you with:\n✈️ Finding cheapest flights\n🏨 Booking hotels\n🚗 Airport transfers\n\nWhere would you like to travel?",
      action: "none"
    }
  ],

  flight: [
    {
      patterns: ["cheapest flight", "lowest price", "best deal", "cheap ticket", "budget flight"],
      response: "💡 Tips to find the cheapest flights:\n\n• Book 6-8 weeks in advance\n• Fly Tuesday or Wednesday\n• Avoid peak seasons (July, August, December)\n• Use flexible dates\n• Consider connecting flights\n\nWhere are you flying from and to?",
      action: "none"
    },
    {
      patterns: ["direct flight", "nonstop", "non-stop", "no layover"],
      response: "✈️ Looking for a direct flight!\n\nDirect flights are usually 20-40% more expensive.\n\nTell me:\n• Departure city?\n• Destination?\n• Travel date?",
      action: "search_flight"
    },
    {
      patterns: ["round trip", "return flight", "both ways", "return ticket"],
      response: "🔄 Round trip - smart choice!\n\nUsually cheaper than two separate tickets.\n\nTell me:\n• Departure city?\n• Destination?\n• Outbound and return dates?",
      action: "search_flight"
    },
    {
      patterns: ["family trip", "family flight", "kids", "children", "with family"],
      response: "👨‍👩‍👧‍👦 Family travel - wonderful!\n\n💡 Family travel tips:\n• Book adjacent seats early\n• Children under 2 fly free (lap infant)\n• Choose family-friendly destinations\n• Consider airlines with good family policies\n\nHow many people and where to?",
      action: "search_flight"
    },
    {
      patterns: ["best airline", "reliable airline", "which airline", "top airline"],
      response: "✈️ Best airlines by region:\n\n🌍 Europe: Iberia, British Airways, Lufthansa, KLM\n🌏 Middle East: Emirates, Qatar Airways, Etihad\n🌎 Americas: Delta, United, LATAM\n🌐 Budget: Ryanair, EasyJet, Vueling\n\nWhat's your destination?",
      action: "none"
    },
    {
      patterns: ["cancel", "refund", "change booking", "modify ticket"],
      response: "🔄 Cancellation & Change Policy:\n\n• Depends on ticket type purchased\n• Flexible tickets: fully changeable\n• Basic/Budget tickets: usually non-refundable\n• Travel insurance covers most emergencies\n\n💡 Always buy travel insurance!",
      action: "none"
    },
    {
      patterns: ["baggage", "luggage", "bag allowance", "suitcase", "carry on"],
      response: "🧳 Baggage allowance guide:\n\n✈️ Economy class:\n• Carry-on: 7-10 kg\n• Checked bag: 20-23 kg (may cost extra)\n\n💺 Business class:\n• 2-3 checked bags included\n\n💡 Check your airline's policy before flying!",
      action: "none"
    }
  ],

  hotel: [
    {
      patterns: ["cheap hotel", "budget hotel", "affordable hotel", "inexpensive accommodation"],
      response: "🏨 Finding cheap hotels:\n\n• Compare on Booking.com & Hotels.com\n• Book directly (sometimes cheaper)\n• Choose pay-at-property option\n• Stay slightly outside city center\n• Travel in shoulder season\n\nWhich city and what dates?",
      action: "search_hotel"
    },
    {
      patterns: ["luxury hotel", "5 star hotel", "best hotel", "top hotel"],
      response: "⭐⭐⭐⭐⭐ Looking for luxury!\n\nTop luxury brands:\n• Four Seasons, Ritz-Carlton\n• Mandarin Oriental, Aman\n• Jumeirah, Burj Al Arab (Dubai)\n• Peninsula, Waldorf Astoria\n\nWhich city?",
      action: "search_hotel"
    },
    {
      patterns: ["airbnb", "apartment", "vacation rental", "holiday home"],
      response: "🏠 Vacation rentals - great for families!\n\nBenefits:\n• Kitchen to cook = save money\n• More space and privacy\n• Better for longer stays\n• Local experience\n\nCheck Airbnb or Vrbo.\nWhich city?",
      action: "none"
    }
  ],

  transfer: [
    {
      patterns: ["airport transfer", "taxi from airport", "how to get to", "transportation", "shuttle"],
      response: "🚗 Airport transportation options:\n\n1️⃣ Official taxi - safe but pricier\n2️⃣ Uber/Bolt - cheaper and reliable\n3️⃣ Airport bus - most affordable\n4️⃣ Metro/Train - fastest (some cities)\n5️⃣ Car rental - for longer stays\n\nWhich airport?",
      action: "none"
    },
    {
      patterns: ["car rental", "rent a car", "hire a car"],
      response: "🚗 Car Rental Guide:\n\nTop companies:\n• Hertz, Europcar, Avis\n• Sixt, Budget, Enterprise\n\n💡 Tips:\n• Book in advance = better prices\n• Check insurance coverage\n• Read fuel policy carefully\n• Check for hidden fees\n\nWhich city and how many days?",
      action: "none"
    }
  ],

  tips: [
    {
      patterns: ["travel tips", "first time", "advice", "suggestions", "recommend"],
      response: "💡 Golden travel tips:\n\n📋 Before you go:\n• Copy your passport\n• Buy travel insurance\n• Notify your bank\n• Download offline maps\n\n✈️ At the airport:\n• Arrive 3hrs early (international)\n• Weigh bags beforehand\n\n🌍 At your destination:\n• Learn basic local phrases\n• Keep some cash\n• Share your itinerary with someone",
      action: "none"
    },
    {
      patterns: ["best time to visit", "when to travel", "best season", "peak season"],
      response: "📅 Best travel seasons:\n\n🌞 Summer (Jun-Aug):\n• Great for Northern Europe\n• Avoid Southern Europe (too hot)\n\n🍂 Autumn (Sep-Nov):\n• Best for Europe & Asia\n• Great prices\n\n❄️ Winter (Dec-Feb):\n• Perfect for tropical destinations\n• Gulf & Morocco shine\n\n🌸 Spring (Mar-May):\n• Ideal almost everywhere!\n\nWhere are you headed?",
      action: "none"
    }
  ],

  price: [
    {
      patterns: ["how much", "what's the price", "cost", "fare", "price"],
      response: "💰 Prices vary a lot!\n\nTell me:\n• Where from and where to?\n• Travel date?\n• Number of passengers?\n\nI'll search real-time prices for you! 🔍",
      action: "search_flight"
    },
    {
      patterns: ["on a budget", "limited budget", "save money", "travel cheap"],
      response: "💡 Travel on a budget - totally possible!\n\n✅ Save on flights:\n• Be flexible with dates\n• Consider connecting flights\n• Book early\n\n✅ Save on accommodation:\n• Hostels or Airbnb\n• Stay outside city center\n• Cook instead of eating out\n\nWhat's your budget and destination?",
      action: "none"
    }
  ],

  visa: [
    {
      patterns: ["visa", "passport", "entry requirements", "travel documents", "do i need a visa"],
      response: "🛂 Visa Information:\n\n⚠️ Requirements vary by nationality and destination!\n\n🌍 Useful resources:\n• iVisa.com - apply online\n• VisaHQ - comprehensive info\n• IATA Travel Centre\n• Embassy website\n\n💡 Always check 3 months before travel!\n\nWhat's your nationality and where are you going?",
      action: "none"
    }
  ],

  weather: [
    {
      patterns: ["weather", "temperature", "climate", "what to wear", "hot or cold"],
      response: "🌤️ Check weather for your destination:\n\n• Weather.com\n• AccuWeather.com\n• Google: 'weather [city name]'\n\n💡 Best tourist temperature: 18-25°C\n\nWhere are you going and in which month?",
      action: "none"
    }
  ],

  luggage: [
    {
      patterns: ["what to pack", "packing list", "what to bring", "packing tips"],
      response: "🧳 Essential packing list:\n\n📄 Documents:\n• Passport + copy\n• Flight ticket\n• Travel insurance\n• Hotel confirmation\n\n👕 Clothes:\n• 3-2-1 rule: 3 tops, 2 bottoms, 1 jacket\n\n💊 Health:\n• Personal medications\n• Sunscreen\n• Pain reliever\n\n🔌 Tech:\n• Power adapter\n• Portable charger\n• Earphones",
      action: "none"
    }
  ],

  fallback: [
    {
      patterns: [],
      response: "🤔 I didn't quite understand that!\n\nI can help you with:\n✈️ Finding flights\n🏨 Booking hotels\n💡 Travel tips\n🛂 Visa information\n\nTell me: Where would you like to travel?",
      action: "none"
    }
  ],

  goodbye: [
    {
      patterns: ["thank you", "thanks", "bye", "goodbye", "see you", "that's all"],
      response: "😊 Thank you for using Fastamor!\n\nHave an amazing trip! ✈️\nWishing you safe and memorable travels! 🌍\n\nCome back anytime you need travel help! 🙌",
      action: "none"
    }
  ]
};

// ═══════════════════════════════════════════════════════
// الفرنسية
// ═══════════════════════════════════════════════════════
export const FR: LanguageResponses = {
  greeting: [
    {
      patterns: ["bonjour", "salut", "bonsoir", "bonne nuit", "coucou", "allo", "hello"],
      response: "Bienvenue sur Fastamor! 👋 Je suis votre assistant voyage personnel.\n\nJe peux vous aider avec:\n✈️ Trouver les vols les moins chers\n🏨 Réserver des hôtels\n🚗 Transferts aéroport\n\nOù souhaitez-vous voyager?",
      action: "none"
    }
  ],

  flight: [
    {
      patterns: ["vol pas cher", "billet moins cher", "meilleur prix", "promotion vol", "vols économiques"],
      response: "💡 Astuces pour les vols pas chers:\n\n• Réservez 6-8 semaines à l'avance\n• Voyagez mardi ou mercredi\n• Évitez les saisons de pointe\n• Utilisez des dates flexibles\n• Considérez les vols avec escale\n\nD'où partez-vous et quelle est votre destination?",
      action: "none"
    },
    {
      patterns: ["vol direct", "sans escale", "direct"],
      response: "✈️ Vous recherchez un vol direct!\n\nLes vols directs coûtent généralement 20-40% de plus.\n\nDites-moi:\n• Ville de départ?\n• Destination?\n• Date de voyage?",
      action: "search_flight"
    },
    {
      patterns: ["aller retour", "vol aller-retour", "retour"],
      response: "🔄 Aller-retour - choix intelligent!\n\nGénéralement moins cher que deux billets séparés.\n\nDites-moi:\n• Ville de départ?\n• Destination?\n• Dates aller et retour?",
      action: "search_flight"
    },
    {
      patterns: ["voyage en famille", "enfants", "famille", "bébé"],
      response: "👨‍👩‍👧‍👦 Voyage en famille - magnifique!\n\n💡 Conseils famille:\n• Réservez des sièges adjacents tôt\n• Les enfants de moins de 2 ans volent gratuitement (sur les genoux)\n• Choisissez des destinations familiales\n\nCombien de personnes et où?",
      action: "search_flight"
    },
    {
      patterns: ["annulation", "remboursement", "modifier vol", "changer billet"],
      response: "🔄 Politique d'annulation:\n\n• Dépend du type de billet\n• Billets flexibles: modifiables\n• Billets basiques: souvent non remboursables\n• L'assurance voyage couvre les urgences\n\n💡 Souscrivez toujours une assurance voyage!",
      action: "none"
    },
    {
      patterns: ["bagages", "valise", "bagage cabine", "franchise bagages"],
      response: "🧳 Guide des bagages:\n\n✈️ Classe économique:\n• Bagage cabine: 7-10 kg\n• Bagage en soute: 20-23 kg (parfois payant)\n\n💺 Classe affaires:\n• 2-3 bagages en soute inclus\n\n💡 Vérifiez la politique de votre compagnie avant!",
      action: "none"
    }
  ],

  hotel: [
    {
      patterns: ["hôtel pas cher", "hébergement économique", "hotel budget"],
      response: "🏨 Trouver des hôtels pas chers:\n\n• Comparez sur Booking.com et Hotels.com\n• Réservez directement (parfois moins cher)\n• Choisissez le paiement sur place\n• Restez légèrement hors du centre\n\nQuelle ville et quelles dates?",
      action: "search_hotel"
    },
    {
      patterns: ["hôtel luxe", "5 étoiles", "palace", "grand hôtel"],
      response: "⭐⭐⭐⭐⭐ Vous cherchez le luxe!\n\nMeilleures marques:\n• Four Seasons, Ritz-Carlton\n• Mandarin Oriental, Aman\n• Sofitel, Accor Luxury\n• Jumeirah (Dubaï)\n\nQuelle ville?",
      action: "search_hotel"
    },
    {
      patterns: ["airbnb", "appartement", "location vacances", "logement"],
      response: "🏠 Locations de vacances - idéal pour les familles!\n\nAvantages:\n• Cuisine = économies sur les repas\n• Plus d'espace\n• Expérience locale\n• Idéal pour les longs séjours\n\nConsultez Airbnb ou Booking.\nQuelle ville?",
      action: "none"
    }
  ],

  transfer: [
    {
      patterns: ["transfert aéroport", "taxi aéroport", "navette", "transport"],
      response: "🚗 Options de transport depuis l'aéroport:\n\n1️⃣ Taxi officiel - sûr mais plus cher\n2️⃣ Uber/Bolt - moins cher et fiable\n3️⃣ Bus aéroport - le plus économique\n4️⃣ Métro/Train - le plus rapide\n5️⃣ Location de voiture - pour les longs séjours\n\nQuel aéroport?",
      action: "none"
    },
    {
      patterns: ["location voiture", "voiture de location", "louer voiture"],
      response: "🚗 Location de voiture:\n\nPrincipales compagnies:\n• Hertz, Europcar, Avis\n• Sixt, Budget, Enterprise\n\n💡 Conseils:\n• Réservez à l'avance = meilleurs prix\n• Vérifiez l'assurance\n• Lisez la politique carburant\n\nQuelle ville et combien de jours?",
      action: "none"
    }
  ],

  tips: [
    {
      patterns: ["conseils voyage", "astuces", "première fois", "recommandations"],
      response: "💡 Conseils voyage indispensables:\n\n📋 Avant de partir:\n• Photocopiez votre passeport\n• Souscrivez une assurance voyage\n• Prévenez votre banque\n• Téléchargez des cartes hors ligne\n\n✈️ À l'aéroport:\n• Arrivez 3h avant (international)\n• Pesez vos bagages\n\n🌍 Sur place:\n• Apprenez quelques mots locaux\n• Gardez de l'argent liquide",
      action: "none"
    },
    {
      patterns: ["meilleure période", "quand voyager", "haute saison", "basse saison"],
      response: "📅 Meilleures périodes de voyage:\n\n🌞 Été (juin-août):\n• Parfait pour l'Europe du Nord\n• Évitez l'Europe du Sud (trop chaud)\n\n🍂 Automne (sept-nov):\n• Idéal pour l'Europe et l'Asie\n• Prix abordables\n\n❄️ Hiver (déc-fév):\n• Parfait pour les destinations tropicales\n• Maghreb et Golfe au top\n\nOù souhaitez-vous aller?",
      action: "none"
    }
  ],

  price: [
    {
      patterns: ["combien ça coûte", "quel prix", "tarif", "coût", "prix"],
      response: "💰 Les prix varient beaucoup!\n\nDites-moi:\n• D'où et vers où?\n• Date de voyage?\n• Nombre de passagers?\n\nJe chercherai les prix en temps réel! 🔍",
      action: "search_flight"
    },
    {
      patterns: ["petit budget", "économiser", "voyage pas cher", "budget limité"],
      response: "💡 Voyager avec un petit budget - c'est possible!\n\n✅ Économiser sur les vols:\n• Dates flexibles\n• Vols avec escale\n• Réservation anticipée\n\n✅ Économiser sur l'hébergement:\n• Auberges de jeunesse ou Airbnb\n• Quartiers moins centraux\n• Cuisiner soi-même\n\nQuel est votre budget et votre destination?",
      action: "none"
    }
  ],

  visa: [
    {
      patterns: ["visa", "passeport", "conditions d'entrée", "documents voyage", "faut-il un visa"],
      response: "🛂 Informations Visa:\n\n⚠️ Les exigences varient selon nationalité et destination!\n\n🌍 Ressources utiles:\n• iVisa.com - demande en ligne\n• VisaHQ - informations complètes\n• Site de l'ambassade\n\n💡 Vérifiez toujours 3 mois avant le voyage!\n\nQuelle est votre nationalité et votre destination?",
      action: "none"
    }
  ],

  weather: [
    {
      patterns: ["météo", "température", "climat", "temps qu'il fait", "chaud ou froid"],
      response: "🌤️ Météo de votre destination:\n\n• Weather.com\n• AccuWeather.com\n• Google: 'météo [nom de la ville]'\n\n💡 Température idéale pour le tourisme: 18-25°C\n\nOù allez-vous et en quel mois?",
      action: "none"
    }
  ],

  luggage: [
    {
      patterns: ["quoi mettre dans valise", "liste bagages", "que prendre", "préparer valise"],
      response: "🧳 Liste essentielle de voyage:\n\n📄 Documents:\n• Passeport + copie\n• Billet d'avion\n• Assurance voyage\n• Confirmation hôtel\n\n👕 Vêtements:\n• Règle 3-2-1: 3 hauts, 2 bas, 1 veste\n\n💊 Santé:\n• Médicaments personnels\n• Crème solaire\n• Antidouleur\n\n🔌 Tech:\n• Adaptateur électrique\n• Chargeur portable",
      action: "none"
    }
  ],

  fallback: [
    {
      patterns: [],
      response: "🤔 Je n'ai pas bien compris!\n\nJe peux vous aider avec:\n✈️ Trouver des vols\n🏨 Réserver des hôtels\n💡 Conseils voyage\n🛂 Informations visa\n\nDites-moi: Où voulez-vous voyager?",
      action: "none"
    }
  ],

  goodbye: [
    {
      patterns: ["merci", "au revoir", "à bientôt", "bonne journée", "ciao", "bye"],
      response: "😊 Merci d'avoir utilisé Fastamor!\n\nBon voyage! ✈️\nNous vous souhaitons un voyage inoubliable! 🌍\n\nRevenez nous voir quand vous planifiez votre prochain voyage! 🙌",
      action: "none"
    }
  ]
};

// ═══════════════════════════════════════════════════════
// الإسبانية
// ═══════════════════════════════════════════════════════
export const ES: LanguageResponses = {
  greeting: [
    {
      patterns: ["hola", "buenos días", "buenas tardes", "buenas noches", "buenas", "saludos"],
      response: "¡Bienvenido a Fastamor! 👋 Soy tu asistente de viajes personal.\n\nPuedo ayudarte con:\n✈️ Encontrar los vuelos más baratos\n🏨 Reservar hoteles\n🚗 Traslados al aeropuerto\n\n¿A dónde quieres viajar?",
      action: "none"
    }
  ],

  flight: [
    {
      patterns: ["vuelo barato", "billete económico", "mejor precio vuelo", "oferta vuelo", "vuelo low cost"],
      response: "💡 Consejos para encontrar vuelos baratos:\n\n• Reserva con 6-8 semanas de antelación\n• Vuela martes o miércoles\n• Evita temporadas altas\n• Usa fechas flexibles\n• Considera vuelos con escala\n\n¿De dónde sales y cuál es tu destino?",
      action: "none"
    },
    {
      patterns: ["vuelo directo", "sin escalas", "directo"],
      response: "✈️ ¡Buscas un vuelo directo!\n\nLos vuelos directos suelen costar un 20-40% más.\n\nDime:\n• ¿Ciudad de salida?\n• ¿Destino?\n• ¿Fecha de viaje?",
      action: "search_flight"
    },
    {
      patterns: ["ida y vuelta", "vuelo de vuelta", "regreso"],
      response: "🔄 Ida y vuelta - ¡elección inteligente!\n\nGeneralmente más barato que dos billetes separados.\n\nDime:\n• ¿Ciudad de salida?\n• ¿Destino?\n• ¿Fechas de ida y vuelta?",
      action: "search_flight"
    },
    {
      patterns: ["viaje familiar", "niños", "familia", "bebé", "con niños"],
      response: "👨‍👩‍👧‍👦 ¡Viaje familiar - maravilloso!\n\n💡 Consejos para familias:\n• Reserva asientos contiguos con antelación\n• Niños menores de 2 años vuelan gratis (en brazos)\n• Elige destinos aptos para niños\n\n¿Cuántas personas y a dónde?",
      action: "search_flight"
    },
    {
      patterns: ["cancelar", "reembolso", "cambiar vuelo", "modificar billete"],
      response: "🔄 Política de cancelación:\n\n• Depende del tipo de billete\n• Billetes flexibles: se pueden cambiar\n• Billetes básicos: generalmente no reembolsables\n• El seguro de viaje cubre emergencias\n\n💡 ¡Siempre compra seguro de viaje!",
      action: "none"
    },
    {
      patterns: ["equipaje", "maleta", "bulto de mano", "franquicia equipaje"],
      response: "🧳 Guía de equipaje:\n\n✈️ Clase turista:\n• Equipaje de mano: 7-10 kg\n• Maleta facturada: 20-23 kg (a veces de pago)\n\n💺 Clase business:\n• 2-3 maletas facturadas incluidas\n\n💡 ¡Consulta la política de tu aerolínea!",
      action: "none"
    }
  ],

  hotel: [
    {
      patterns: ["hotel barato", "alojamiento económico", "hotel budget", "hostal"],
      response: "🏨 Encontrar hoteles baratos:\n\n• Compara en Booking.com y Hotels.com\n• Reserva directamente (a veces más barato)\n• Elige pago en el hotel\n• Alójate algo fuera del centro\n\n¿Qué ciudad y qué fechas?",
      action: "search_hotel"
    },
    {
      patterns: ["hotel de lujo", "5 estrellas", "hotel premium", "resort"],
      response: "⭐⭐⭐⭐⭐ ¡Buscas lujo!\n\nMejores marcas:\n• Four Seasons, Ritz-Carlton\n• Mandarin Oriental, Aman\n• Jumeirah (Dubái)\n• Meliá, NH Hotels\n\n¿Qué ciudad?",
      action: "search_hotel"
    },
    {
      patterns: ["airbnb", "apartamento", "alquiler vacacional", "piso"],
      response: "🏠 Alquileres vacacionales - ¡ideales para familias!\n\nVentajas:\n• Cocina = ahorro en comidas\n• Más espacio y privacidad\n• Experiencia local\n• Ideal para estancias largas\n\nConsulta Airbnb o Booking.\n¿Qué ciudad?",
      action: "none"
    }
  ],

  transfer: [
    {
      patterns: ["traslado aeropuerto", "taxi aeropuerto", "lanzadera", "transporte", "cómo llegar"],
      response: "🚗 Opciones de transporte desde el aeropuerto:\n\n1️⃣ Taxi oficial - seguro pero más caro\n2️⃣ Uber/Cabify - más barato y fiable\n3️⃣ Autobús aeropuerto - más económico\n4️⃣ Metro/Tren - más rápido\n5️⃣ Alquiler de coche - para estancias largas\n\n¿Qué aeropuerto?",
      action: "none"
    },
    {
      patterns: ["alquiler coche", "alquilar coche", "rent a car"],
      response: "🚗 Alquiler de coches:\n\nPrincipales compañías:\n• Hertz, Europcar, Avis\n• Sixt, Budget, Enterprise\n\n💡 Consejos:\n• Reserva con antelación = mejores precios\n• Verifica el seguro\n• Lee la política de combustible\n\n¿Qué ciudad y cuántos días?",
      action: "none"
    }
  ],

  tips: [
    {
      patterns: ["consejos de viaje", "primera vez", "recomendaciones", "trucos viaje"],
      response: "💡 Consejos de viaje esenciales:\n\n📋 Antes de salir:\n• Fotocopia tu pasaporte\n• Contrata seguro de viaje\n• Avisa a tu banco\n• Descarga mapas offline\n\n✈️ En el aeropuerto:\n• Llega 3h antes (internacional)\n• Pesa el equipaje en casa\n\n🌍 En el destino:\n• Aprende frases básicas locales\n• Lleva algo de efectivo",
      action: "none"
    },
    {
      patterns: ["mejor época para viajar", "cuándo viajar", "temporada alta", "temporada baja"],
      response: "📅 Mejores épocas para viajar:\n\n🌞 Verano (jun-ago):\n• Ideal para Europa del Norte\n• Evita Europa del Sur (demasiado calor)\n\n🍂 Otoño (sep-nov):\n• Perfecto para Europa y Asia\n• Buenos precios\n\n❄️ Invierno (dic-feb):\n• Ideal para destinos tropicales\n• Marruecos y el Golfo en su mejor momento\n\n¿A dónde quieres ir?",
      action: "none"
    }
  ],

  price: [
    {
      patterns: ["cuánto cuesta", "qué precio tiene", "precio", "coste", "tarifa"],
      response: "💰 ¡Los precios varían mucho!\n\nDime:\n• ¿De dónde y a dónde?\n• ¿Fecha de viaje?\n• ¿Número de pasajeros?\n\n¡Buscaré precios en tiempo real! 🔍",
      action: "search_flight"
    },
    {
      patterns: ["presupuesto limitado", "ahorrar", "viaje barato", "poco dinero"],
      response: "💡 ¡Viajar con presupuesto limitado - es posible!\n\n✅ Ahorrar en vuelos:\n• Fechas flexibles\n• Vuelos con escala\n• Reserva anticipada\n\n✅ Ahorrar en alojamiento:\n• Hostales o Airbnb\n• Zonas menos céntricas\n• Cocinar en vez de comer fuera\n\n¿Cuál es tu presupuesto y destino?",
      action: "none"
    }
  ],

  visa: [
    {
      patterns: ["visado", "visa", "pasaporte", "requisitos entrada", "documentos viaje"],
      response: "🛂 Información sobre visados:\n\n⚠️ Los requisitos varían según nacionalidad y destino!\n\n🌍 Recursos útiles:\n• iVisa.com - solicitud online\n• VisaHQ - información completa\n• Web de la embajada\n\n💡 ¡Comprueba siempre 3 meses antes del viaje!\n\n¿Cuál es tu nacionalidad y destino?",
      action: "none"
    }
  ],

  weather: [
    {
      patterns: ["tiempo", "temperatura", "clima", "hace calor", "hace frío", "qué ropa llevar"],
      response: "🌤️ Consulta el tiempo en tu destino:\n\n• Weather.com\n• AccuWeather.com\n• Google: 'tiempo en [nombre de ciudad]'\n\n💡 Temperatura ideal para turismo: 18-25°C\n\n¿A dónde vas y en qué mes?",
      action: "none"
    }
  ],

  luggage: [
    {
      patterns: ["qué llevar en la maleta", "lista equipaje", "qué meter en maleta", "preparar maleta"],
      response: "🧳 Lista esencial de viaje:\n\n📄 Documentos:\n• Pasaporte + copia\n• Billete de avión\n• Seguro de viaje\n• Confirmación hotel\n\n👕 Ropa:\n• Regla 3-2-1: 3 camisetas, 2 pantalones, 1 chaqueta\n\n💊 Salud:\n• Medicamentos personales\n• Protector solar\n• Analgésico\n\n🔌 Tecnología:\n• Adaptador de corriente\n• Cargador portátil",
      action: "none"
    }
  ],

  fallback: [
    {
      patterns: [],
      response: "🤔 ¡No he entendido bien!\n\nPuedo ayudarte con:\n✈️ Encontrar vuelos\n🏨 Reservar hoteles\n💡 Consejos de viaje\n🛂 Información sobre visados\n\nDime: ¿A dónde quieres viajar?",
      action: "none"
    }
  ],

  goodbye: [
    {
      patterns: ["gracias", "hasta luego", "adiós", "nos vemos", "bye", "chao"],
      response: "😊 ¡Gracias por usar Fastamor!\n\n¡Buen viaje! ✈️\n¡Te deseamos una experiencia de viaje inolvidable! 🌍\n\n¡Vuelve cuando planees tu próximo viaje! 🙌",
      action: "none"
    }
  ]
};

// ═══════════════════════════════════════════════════════
// دالة المطابقة الرئيسية - تعمل بدون AI
// ═══════════════════════════════════════════════════════
const LANGUAGE_MAP = { ar: AR, en: EN, fr: FR, es: ES };

export function findReadyResponse(
  message: string,
  lang: "ar" | "en" | "fr" | "es" = "en"
): ReadyResponse | null {
  const responses = LANGUAGE_MAP[lang] || EN;
  const msgLower = message.toLowerCase().trim();

  // ترتيب البحث حسب الأولوية
  const categories: (keyof LanguageResponses)[] = [
    "goodbye", "greeting", "flight", "hotel",
    "transfer", "tips", "price", "visa",
    "weather", "luggage"
  ];

  for (const category of categories) {
    const categoryResponses = responses[category] as ReadyResponse[];
    for (const item of categoryResponses) {
      for (const pattern of item.patterns) {
        if (msgLower.includes(pattern.toLowerCase()) || message.includes(pattern)) {
          return item;
        }
      }
    }
  }

  // إذا لم يجد شيئاً، أعد الـ fallback
  const fallback = responses.fallback as ReadyResponse[];
  return fallback[0] || null;
}

// ═══════════════════════════════════════════════════════
// دالة كشف اللغة التلقائي
// ═══════════════════════════════════════════════════════
export function detectLanguage(text: string): "ar" | "en" | "fr" | "es" {
  // كشف العربية
  if (/[\u0600-\u06FF]/.test(text)) return "ar";

  const lower = text.toLowerCase();

  // كشف الفرنسية
  const frWords = ["bonjour", "merci", "oui", "non", "je", "vous", "nous", "est", "sont", "avec", "pour", "dans", "sur", "vol", "hôtel", "billet", "prix"];
  const frCount = frWords.filter(w => lower.includes(w)).length;

  // كشف الإسبانية
  const esWords = ["hola", "gracias", "sí", "no", "yo", "usted", "nosotros", "está", "son", "con", "para", "en", "vuelo", "hotel", "billete", "precio", "buenos"];
  const esCount = esWords.filter(w => lower.includes(w)).length;

  if (frCount > esCount && frCount > 0) return "fr";
  if (esCount > frCount && esCount > 0) return "es";

  return "en";
}