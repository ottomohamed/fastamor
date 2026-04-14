// ═══════════════════════════════════════════════════════
// Fastamor AI - قواعد البيانات الأساسية
// 1. FAQ - الأسئلة الشائعة
// 2. العروض والمواسم
// 3. Affiliate Partners
// ═══════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
// 1. قاعدة FAQ - الأسئلة الشائعة بـ 4 لغات
// ══════════════════════════════════════════════════════

export interface FAQ {
  id: string;
  patterns: string[];
  answer: { ar: string; en: string; fr: string; es: string };
  category: "visa" | "baggage" | "booking" | "payment" | "airport" | "health" | "insurance" | "general";
  tags: string[];
}

export const FAQ_DB: FAQ[] = [

  // ══════════ VISA / التأشيرة ══════════
  {
    id: "faq-visa-001",
    patterns: [
      "هل أحتاج فيزا", "هل احتاج فيزا", "تأشيرة", "فيزا للمغاربة", "فيزا للجزائريين",
      "فيزا للتونسيين", "فيزا للسعوديين", "do i need a visa", "visa required",
      "visa obligatoire", "faut-il un visa", "necesito visado", "visado obligatorio"
    ],
    answer: {
      ar: `🛂 **معلومات التأشيرة:**

متطلبات الفيزا تختلف حسب **جنسيتك والوجهة**.

📋 **وجهات بدون فيزا للعرب:**
• تركيا 🇹🇷 - بدون فيزا لمعظم الجنسيات العربية
• المالديف 🇲🇻 - دخول مجاني
• جورجيا 🇬🇪 - بدون فيزا
• الأردن 🇯🇴، المغرب 🇲🇦 - دخول متبادل لكثير من الدول

🌐 **للتحقق من فيزا وجهتك:**
• iVisa.com - طلب أونلاين
• visahq.com - معلومات شاملة
• موقع السفارة مباشرة

⚠️ تحقق دائماً قبل **3 أشهر** من موعد السفر!`,
      en: `🛂 **Visa Information:**

Visa requirements depend on **your nationality and destination**.

📋 **Visa-free popular destinations:**
• Turkey 🇹🇷 - visa-free for many nationalities
• Maldives 🇲🇻 - free entry
• Georgia 🇬🇪 - visa-free
• Thailand 🇹🇭 - 30 days free on arrival
• UAE 🇦🇪 - many nationalities get visa on arrival

🌐 **Check your visa requirements:**
• iVisa.com - apply online
• visahq.com - comprehensive info
• Your destination's embassy website

⚠️ Always check **3 months** before travel!`,
      fr: `🛂 **Informations Visa:**

Les exigences de visa dépendent de **votre nationalité et destination**.

📋 **Destinations sans visa populaires:**
• Turquie 🇹🇷 - sans visa pour beaucoup
• Maldives 🇲🇻 - entrée gratuite
• Géorgie 🇬🇪 - sans visa
• Thaïlande 🇹🇭 - 30 jours à l'arrivée
• Maroc 🇲🇦 - sans visa pour les Européens

🌐 **Vérifiez vos exigences:**
• iVisa.com - demande en ligne
• visahq.com - infos complètes

⚠️ Vérifiez toujours **3 mois** avant le voyage!`,
      es: `🛂 **Información de Visado:**

Los requisitos de visado dependen de **tu nacionalidad y destino**.

📋 **Destinos sin visado populares:**
• Turquía 🇹🇷 - sin visado para muchos
• Maldivas 🇲🇻 - entrada gratuita
• Georgia 🇬🇪 - sin visado
• Tailandia 🇹🇭 - 30 días a la llegada
• México 🇲🇽 - sin visado para europeos

🌐 **Verifica tus requisitos:**
• iVisa.com - solicitud online
• visahq.com - info completa

⚠️ ¡Siempre verifica **3 meses** antes del viaje!`
    },
    category: "visa",
    tags: ["visa", "tashira", "entry", "passport", "documents"]
  },

  // ══════════ BAGGAGE / الأمتعة ══════════
  {
    id: "faq-bag-001",
    patterns: [
      "وزن الأمتعة", "وزن الحقيبة", "كم وزن", "حقيبة اليد", "baggage allowance",
      "luggage weight", "hand luggage", "carry on weight", "poids bagages",
      "franchise bagage", "peso equipaje", "equipaje de mano", "كم كيلو"
    ],
    answer: {
      ar: `🧳 **وزن الأمتعة المسموح به:**

✈️ **الدرجة الاقتصادية (Economy):**
| الشركة | حقيبة يد | حقيبة مسجلة |
|--------|----------|-------------|
| الخطوط المغربية | 10 كغ | 23 كغ |
| طيران المغرب | 10 كغ | 23 كغ |
| Emirates | 7 كغ | 25-35 كغ |
| Turkish Airlines | 8 كغ | 23 كغ |
| Ryanair | 10 كغ | 20 كغ (مدفوع) |
| EasyJet | 15 كغ | 23 كغ (مدفوع) |

💺 **الدرجة التجارية (Business):** عادة 2-3 حقائب مسجلة

⚠️ **نصيحة:** زن حقائبك قبل المطار لتجنب رسوم الوزن الزائد!`,
      en: `🧳 **Baggage Allowance Guide:**

✈️ **Economy Class:**
| Airline | Carry-on | Checked Bag |
|---------|----------|-------------|
| Emirates | 7 kg | 25-35 kg |
| Turkish Airlines | 8 kg | 23 kg |
| British Airways | 23 kg | 23 kg |
| Ryanair | 10 kg | 20 kg (paid) |
| EasyJet | 15 kg | 23 kg (paid) |
| Lufthansa | 8 kg | 23 kg |

💺 **Business Class:** Usually 2-3 checked bags included

⚠️ **Tip:** Weigh your bags before the airport to avoid excess fees!`,
      fr: `🧳 **Guide des Franchises Bagages:**

✈️ **Classe Économique:**
| Compagnie | Cabine | Soute |
|-----------|--------|-------|
| Air France | 12 kg | 23 kg |
| Turkish Airlines | 8 kg | 23 kg |
| Ryanair | 10 kg | 20 kg (payant) |
| EasyJet | 15 kg | 23 kg (payant) |
| Royal Air Maroc | 10 kg | 23 kg |

💺 **Classe Affaires:** Généralement 2-3 bagages inclus

⚠️ **Conseil:** Pesez vos bagages avant l'aéroport!`,
      es: `🧳 **Guía de Franquicia de Equipaje:**

✈️ **Clase Turista:**
| Aerolínea | Cabina | Facturado |
|-----------|--------|-----------|
| Iberia | 10 kg | 23 kg |
| Vueling | 10 kg | 23 kg |
| Ryanair | 10 kg | 20 kg (pago) |
| Turkish Airlines | 8 kg | 23 kg |
| Emirates | 7 kg | 25-35 kg |

💺 **Clase Business:** Normalmente 2-3 maletas incluidas

⚠️ **Consejo:** ¡Pesa tu equipaje antes del aeropuerto!`
    },
    category: "baggage",
    tags: ["baggage", "luggage", "weight", "carry-on", "suitcase"]
  },

  // ══════════ AIRPORT / المطار ══════════
  {
    id: "faq-airport-001",
    patterns: [
      "متى أذهب للمطار", "كم ساعة قبل", "وقت الوصول للمطار", "when to arrive airport",
      "how early airport", "combien de temps avant", "cuánto tiempo antes aeropuerto",
      "check in online", "تسجيل الدخول", "بوردينج باس"
    ],
    answer: {
      ar: `✈️ **متى تصل للمطار؟**

🌍 **رحلات دولية:**
• وصل قبل **3 ساعات** على الأقل
• تحقق من الإجراءات الأمنية في وجهتك

🏠 **رحلات داخلية:**
• وصل قبل **2 ساعة** على الأقل

📱 **Check-in أونلاين:**
• افتح عادة قبل 24-48 ساعة من الرحلة
• يوفر عليك الوقت في المطار
• اطبع البطاقة أو احفظها على هاتفك

⚠️ **في حالة ازدحام المطارات (صيف/أعياد):**
• أضف ساعة إضافية للأمان`,
      en: `✈️ **When to Arrive at the Airport?**

🌍 **International flights:**
• Arrive at least **3 hours** before departure
• Check security requirements at your destination

🏠 **Domestic flights:**
• Arrive at least **2 hours** before departure

📱 **Online Check-in:**
• Usually opens 24-48 hours before flight
• Saves time at the airport
• Print or save boarding pass on your phone

⚠️ **During busy periods (summer/holidays):**
• Add an extra hour to be safe`,
      fr: `✈️ **Quand Arriver à l'Aéroport?**

🌍 **Vols internationaux:**
• Arrivez au moins **3 heures** avant
• Vérifiez les exigences de sécurité

🏠 **Vols domestiques:**
• Arrivez au moins **2 heures** avant

📱 **Check-in en ligne:**
• S'ouvre généralement 24-48h avant le vol
• Économise du temps à l'aéroport
• Imprimez ou sauvegardez sur téléphone

⚠️ **Périodes chargées (été/fêtes):**
• Ajoutez une heure supplémentaire`,
      es: `✈️ **¿Cuándo Llegar al Aeropuerto?**

🌍 **Vuelos internacionales:**
• Llega al menos **3 horas** antes
• Verifica los requisitos de seguridad

🏠 **Vuelos nacionales:**
• Llega al menos **2 horas** antes

📱 **Check-in online:**
• Suele abrir 24-48 horas antes del vuelo
• Ahorra tiempo en el aeropuerto
• Imprime o guarda el boarding pass

⚠️ **Períodos de alta demanda (verano/fiestas):**
• Añade una hora extra por seguridad`
    },
    category: "airport",
    tags: ["airport", "checkin", "boarding", "time", "arrival"]
  },

  // ══════════ INSURANCE / التأمين ══════════
  {
    id: "faq-insurance-001",
    patterns: [
      "تأمين سفر", "هل أحتاج تأمين", "travel insurance", "assurance voyage",
      "seguro de viaje", "insurance required", "do i need insurance",
      "طوارئ طبية", "medical emergency abroad"
    ],
    answer: {
      ar: `🛡️ **تأمين السفر - ضروري جداً!**

✅ **ماذا يغطي التأمين الجيد؟**
• طوارئ طبية في الخارج (الأهم!)
• إلغاء الرحلة
• ضياع الأمتعة
• تأخير الرحلة
• حوادث وإصابات

💰 **متوسط التكلفة:**
• رحلة قصيرة (1-2 أسبوع): $20-50
• رحلة طويلة (شهر+): $50-150

🌐 **أفضل مواقع التأمين:**
• [World Nomads](https://worldnomads.com) - للمسافرين الشباب
• [SafetyWing](https://safetywing.com) - أرخص الأسعار
• [Allianz Travel](https://allianztravelinsurance.com) - الأكثر شمولاً

⚠️ **ملاحظة:** بعض دول شنغن تشترط تأمين بحد أدنى 30,000 يورو!`,
      en: `🛡️ **Travel Insurance - Highly Recommended!**

✅ **What good insurance covers:**
• Medical emergencies abroad (most important!)
• Trip cancellation
• Lost luggage
• Flight delays
• Accidents and injuries

💰 **Average cost:**
• Short trip (1-2 weeks): $20-50
• Long trip (1+ month): $50-150

🌐 **Best insurance sites:**
• [World Nomads](https://worldnomads.com) - great for travelers
• [SafetyWing](https://safetywing.com) - most affordable
• [Allianz Travel](https://allianztravelinsurance.com) - most comprehensive

⚠️ **Note:** Schengen visa requires minimum €30,000 medical coverage!`,
      fr: `🛡️ **Assurance Voyage - Fortement Recommandée!**

✅ **Ce que couvre une bonne assurance:**
• Urgences médicales à l'étranger (le plus important!)
• Annulation de voyage
• Perte de bagages
• Retard de vol
• Accidents et blessures

💰 **Coût moyen:**
• Court séjour (1-2 semaines): 20-50€
• Long séjour (1+ mois): 50-150€

🌐 **Meilleurs sites:**
• [World Nomads](https://worldnomads.com)
• [SafetyWing](https://safetywing.com)
• [AXA Assistance](https://axa-assistance.fr)

⚠️ **Note:** Le visa Schengen exige une couverture médicale min. 30.000€!`,
      es: `🛡️ **Seguro de Viaje - ¡Muy Recomendado!**

✅ **Qué cubre un buen seguro:**
• Emergencias médicas en el extranjero (¡lo más importante!)
• Cancelación de viaje
• Pérdida de equipaje
• Retrasos de vuelo
• Accidentes y lesiones

💰 **Coste medio:**
• Viaje corto (1-2 semanas): 20-50€
• Viaje largo (1+ mes): 50-150€

🌐 **Mejores sitios:**
• [World Nomads](https://worldnomads.com)
• [SafetyWing](https://safetywing.com)
• [Allianz Travel](https://allianztravelinsurance.com)

⚠️ **Nota:** ¡El visado Schengen requiere cobertura médica mínima de 30.000€!`
    },
    category: "insurance",
    tags: ["insurance", "taamin", "medical", "emergency", "schengen"]
  },

  // ══════════ PAYMENT / الدفع ══════════
  {
    id: "faq-payment-001",
    patterns: [
      "كيف أدفع", "طرق الدفع", "بطاقة بنكية", "paypal", "how to pay",
      "payment methods", "comment payer", "moyens de paiement",
      "cómo pagar", "métodos de pago", "دفع أونلاين", "هل الدفع آمن"
    ],
    answer: {
      ar: `💳 **طرق الدفع المقبولة:**

✅ **بطاقات مقبولة:**
• Visa ✓
• Mastercard ✓
• American Express ✓
• Maestro ✓

📱 **دفع رقمي:**
• PayPal
• Apple Pay
• Google Pay

🔒 **الأمان:**
• جميع المعاملات مشفرة SSL
• لا نحتفظ ببيانات بطاقتك
• نستخدم بوابات دفع موثوقة (Stripe)

💡 **نصيحة:** استخدم بطاقة بدون رسوم عملة أجنبية للسفر الدولي`,
      en: `💳 **Accepted Payment Methods:**

✅ **Cards accepted:**
• Visa ✓
• Mastercard ✓
• American Express ✓
• Maestro ✓

📱 **Digital payment:**
• PayPal
• Apple Pay
• Google Pay

🔒 **Security:**
• All transactions SSL encrypted
• We don't store your card data
• Trusted payment gateways (Stripe)

💡 **Tip:** Use a no-foreign-fee card for international travel`,
      fr: `💳 **Moyens de Paiement Acceptés:**

✅ **Cartes acceptées:**
• Visa ✓
• Mastercard ✓
• American Express ✓
• Maestro ✓

📱 **Paiement digital:**
• PayPal
• Apple Pay
• Google Pay

🔒 **Sécurité:**
• Toutes transactions chiffrées SSL
• Nous ne stockons pas vos données bancaires
• Passerelles de paiement fiables (Stripe)

💡 **Conseil:** Utilisez une carte sans frais de change`,
      es: `💳 **Métodos de Pago Aceptados:**

✅ **Tarjetas aceptadas:**
• Visa ✓
• Mastercard ✓
• American Express ✓
• Maestro ✓

📱 **Pago digital:**
• PayPal
• Apple Pay
• Google Pay

🔒 **Seguridad:**
• Todas las transacciones cifradas SSL
• No almacenamos datos de tu tarjeta
• Pasarelas de pago confiables (Stripe)

💡 **Consejo:** Usa una tarjeta sin comisiones por divisa extranjera`
    },
    category: "payment",
    tags: ["payment", "card", "visa", "mastercard", "paypal", "secure"]
  },

  // ══════════ HEALTH / الصحة ══════════
  {
    id: "faq-health-001",
    patterns: [
      "لقاحات", "تطعيمات", "vaccines required", "vaccins obligatoires",
      "vacunas obligatorias", "health requirements", "متطلبات صحية",
      "covid", "كوفيد", "pcr test", "اختبار كورونا"
    ],
    answer: {
      ar: `💉 **المتطلبات الصحية للسفر:**

🌍 **لقاحات موصى بها عموماً:**
• الحصبة والنكاف والحصبة الألمانية (MMR)
• التيتانوس
• التهاب الكبد A و B
• الإنفلونزا الموسمية

🌏 **وجهات تحتاج لقاحات خاصة:**
• أفريقيا جنوب الصحراء: الملاريا + الحمى الصفراء
• الهند / جنوب آسيا: التيفوئيد
• أمريكا الجنوبية: الحمى الصفراء

🌐 **تحقق من متطلبات وجهتك:**
• [IAMAT](https://iamat.org) - معلومات طبية للمسافرين
• [CDC Travel Health](https://cdc.gov/travel) - توصيات أمريكية
• موقع وزارة الصحة في بلدك

⚠️ **راجع طبيبك قبل 6-8 أسابيع من السفر!**`,
      en: `💉 **Health Requirements for Travel:**

🌍 **Generally recommended vaccines:**
• MMR (Measles, Mumps, Rubella)
• Tetanus
• Hepatitis A & B
• Seasonal flu

🌏 **Destinations with special requirements:**
• Sub-Saharan Africa: Malaria + Yellow Fever
• India / South Asia: Typhoid
• South America: Yellow Fever

🌐 **Check your destination requirements:**
• [IAMAT](https://iamat.org) - medical info for travelers
• [CDC Travel Health](https://cdc.gov/travel)
• Your country's health ministry website

⚠️ **Consult your doctor 6-8 weeks before travel!**`,
      fr: `💉 **Exigences Sanitaires pour Voyager:**

🌍 **Vaccins généralement recommandés:**
• ROR (Rougeole, Oreillons, Rubéole)
• Tétanos
• Hépatites A & B
• Grippe saisonnière

🌏 **Destinations avec exigences spéciales:**
• Afrique subsaharienne: Paludisme + Fièvre jaune
• Inde / Asie du Sud: Typhoïde
• Amérique du Sud: Fièvre jaune

🌐 **Vérifiez les exigences:**
• [IAMAT](https://iamat.org)
• [CDC Travel Health](https://cdc.gov/travel)
• Ministère de la Santé français

⚠️ **Consultez votre médecin 6-8 semaines avant!**`,
      es: `💉 **Requisitos de Salud para Viajar:**

🌍 **Vacunas generalmente recomendadas:**
• Triple vírica (sarampión, paperas, rubéola)
• Tétanos
• Hepatitis A y B
• Gripe estacional

🌏 **Destinos con requisitos especiales:**
• África subsahariana: Malaria + Fiebre amarilla
• India / Sur de Asia: Tifoidea
• América del Sur: Fiebre amarilla

🌐 **Verifica los requisitos:**
• [IAMAT](https://iamat.org)
• [CDC Travel Health](https://cdc.gov/travel)
• Ministerio de Sanidad

⚠️ **¡Consulta a tu médico 6-8 semanas antes del viaje!**`
    },
    category: "health",
    tags: ["health", "vaccine", "covid", "malaria", "medical", "requirements"]
  },

  // ══════════ BOOKING / الحجز ══════════
  {
    id: "faq-booking-001",
    patterns: [
      "أفضل وقت للحجز", "متى أحجز", "when to book", "quand réserver",
      "cuándo reservar", "book early", "last minute", "احجز مبكراً",
      "حجز مبكر", "آخر لحظة"
    ],
    answer: {
      ar: `📅 **أفضل وقت للحجز:**

✈️ **رحلات الطيران:**
| الوجهة | أفضل وقت للحجز |
|--------|----------------|
| أوروبا | قبل 6-8 أسابيع |
| أمريكا | قبل 2-3 أشهر |
| آسيا | قبل 2-3 أشهر |
| رحلات محلية | قبل 3-4 أسابيع |

🏨 **الفنادق:**
• احجز مبكراً في المواسم السياحية
• آخر لحظة قد يكون أرخص خارج المواسم

📊 **أرخص أيام الأسبوع للسفر:**
• الثلاثاء والأربعاء ← أرخص أيام
• الجمعة والأحد ← أغلى أيام

💡 **نصيحة ذهبية:** اضبط تنبيه سعري على Google Flights!`,
      en: `📅 **Best Time to Book:**

✈️ **Flights:**
| Destination | Best booking time |
|-------------|-------------------|
| Europe | 6-8 weeks ahead |
| Americas | 2-3 months ahead |
| Asia | 2-3 months ahead |
| Domestic | 3-4 weeks ahead |

🏨 **Hotels:**
• Book early during peak tourist seasons
• Last minute can be cheaper off-season

📊 **Cheapest days to fly:**
• Tuesday & Wednesday ← cheapest
• Friday & Sunday ← most expensive

💡 **Golden tip:** Set a price alert on Google Flights!`,
      fr: `📅 **Meilleur Moment pour Réserver:**

✈️ **Vols:**
| Destination | Meilleur délai |
|-------------|----------------|
| Europe | 6-8 semaines avant |
| Amériques | 2-3 mois avant |
| Asie | 2-3 mois avant |
| Domestique | 3-4 semaines avant |

🏨 **Hôtels:**
• Réservez tôt en haute saison
• Dernière minute peut être moins cher hors saison

📊 **Jours les moins chers:**
• Mardi & Mercredi ← moins chers
• Vendredi & Dimanche ← plus chers

💡 **Conseil d'or:** Activez une alerte prix sur Google Flights!`,
      es: `📅 **Mejor Momento para Reservar:**

✈️ **Vuelos:**
| Destino | Mejor momento |
|---------|---------------|
| Europa | 6-8 semanas antes |
| Américas | 2-3 meses antes |
| Asia | 2-3 meses antes |
| Doméstico | 3-4 semanas antes |

🏨 **Hoteles:**
• Reserva con anticipación en temporada alta
• Última hora puede ser más barato fuera de temporada

📊 **Días más baratos para volar:**
• Martes y Miércoles ← más baratos
• Viernes y Domingo ← más caros

💡 **Consejo de oro:** ¡Activa una alerta de precio en Google Flights!`
    },
    category: "booking",
    tags: ["booking", "when", "early", "last-minute", "cheapest-day"]
  },
];

// ══════════════════════════════════════════════════════
// 2. قاعدة العروض والمواسم
// ══════════════════════════════════════════════════════

export interface SeasonalOffer {
  id: string;
  name: { ar: string; en: string; fr: string; es: string };
  description: { ar: string; en: string; fr: string; es: string };
  months: number[]; // 1-12
  destinations: string[]; // IATA codes
  discountRange: string; // "20-40%"
  tags: string[];
  bookingLinks: { name: string; url: string; icon: string }[];
}

export const SEASONAL_OFFERS: SeasonalOffer[] = [
  {
    id: "offer-ramadan",
    name: {
      ar: "عروض رمضان والعيد",
      en: "Ramadan & Eid Special Offers",
      fr: "Offres Spéciales Ramadan et Aïd",
      es: "Ofertas Especiales Ramadán y Eid"
    },
    description: {
      ar: "🌙 عروض خاصة لموسم رمضان والعيد على رحلات الشرق الأوسط وشمال أفريقيا. احجز مبكراً للحصول على أفضل الأسعار قبل ارتفاعها!",
      en: "🌙 Special deals for Ramadan and Eid season on Middle East and North Africa flights. Book early before prices rise!",
      fr: "🌙 Offres spéciales pour le Ramadan et l'Aïd sur les vols Moyen-Orient et Afrique du Nord. Réservez tôt!",
      es: "🌙 Ofertas especiales para la temporada de Ramadán y Eid en vuelos a Oriente Medio y Norte de África."
    },
    months: [3, 4],
    destinations: ["DXB", "RUH", "JED", "CAI", "CMN", "ALG", "TUN", "AMM", "BEY", "DOH"],
    discountRange: "10-25%",
    tags: ["ramadan", "eid", "middle-east", "north-africa", "religious"],
    bookingLinks: [
      { name: "Aviasales", url: "https://www.aviasales.com/?marker=709105", icon: "✈️" },
      { name: "Booking.com", url: "https://www.booking.com", icon: "🏨" }
    ]
  },
  {
    id: "offer-summer-europe",
    name: {
      ar: "عروض صيف أوروبا",
      en: "European Summer Deals",
      fr: "Offres Été Européen",
      es: "Ofertas Verano Europeo"
    },
    description: {
      ar: "☀️ أفضل عروض رحلات أوروبا في الصيف! برشلونة، باريس، روما، أمستردام بأسعار تنافسية. احجز قبل 8 أسابيع للحصول على أفضل الأسعار.",
      en: "☀️ Best European summer flight deals! Barcelona, Paris, Rome, Amsterdam at competitive prices. Book 8 weeks ahead for best prices.",
      fr: "☀️ Meilleures offres de vols en Europe cet été! Barcelone, Paris, Rome, Amsterdam à prix compétitifs.",
      es: "☀️ ¡Las mejores ofertas de vuelos europeos en verano! Barcelona, París, Roma, Ámsterdam a precios competitivos."
    },
    months: [6, 7, 8],
    destinations: ["BCN", "CDG", "FCO", "AMS", "MAD", "LHR", "BER", "VIE", "LIS", "ATH"],
    discountRange: "15-35%",
    tags: ["summer", "europe", "beach", "culture", "city-break"],
    bookingLinks: [
      { name: "Aviasales", url: "https://www.aviasales.com/?marker=709105", icon: "✈️" },
      { name: "Expedia", url: "https://www.expedia.com", icon: "🌍" },
      { name: "Booking.com", url: "https://www.booking.com", icon: "🏨" }
    ]
  },
  {
    id: "offer-winter-sun",
    name: {
      ar: "شمس الشتاء - وجهات دافئة",
      en: "Winter Sun Destinations",
      fr: "Soleil d'Hiver - Destinations Chaudes",
      es: "Sol de Invierno - Destinos Cálidos"
    },
    description: {
      ar: "❄️→☀️ اهرب من البرد! دبي، مراكش، تونس، تايلاند، المالديف في الشتاء بأسعار رائعة. الشتاء هو الموسم المثالي لهذه الوجهات!",
      en: "❄️→☀️ Escape the cold! Dubai, Marrakech, Tunisia, Thailand, Maldives in winter at great prices. Winter is peak season for these destinations!",
      fr: "❄️→☀️ Fuyez le froid! Dubaï, Marrakech, Tunisie, Thaïlande, Maldives en hiver à super prix.",
      es: "❄️→☀️ ¡Escapa del frío! Dubái, Marrakech, Túnez, Tailandia, Maldivas en invierno a precios geniales."
    },
    months: [11, 12, 1, 2],
    destinations: ["DXB", "RAK", "TUN", "BKK", "MLE", "CMN", "AGP", "TFS", "LPA", "HKT"],
    discountRange: "20-40%",
    tags: ["winter", "sun", "warm", "beach", "escape"],
    bookingLinks: [
      { name: "Aviasales", url: "https://www.aviasales.com/?marker=709105", icon: "✈️" },
      { name: "Booking.com", url: "https://www.booking.com", icon: "🏨" }
    ]
  },
  {
    id: "offer-black-friday",
    name: {
      ar: "بلاك فرايدي - عروض الطيران",
      en: "Black Friday Flight Deals",
      fr: "Black Friday - Offres Vols",
      es: "Black Friday - Ofertas de Vuelos"
    },
    description: {
      ar: "🛍️ أفضل عروض الطيران في السنة! خلال أسبوع بلاك فرايدي تصل الخصومات لـ 50% على رحلات عالمية. لا تفوت الفرصة!",
      en: "🛍️ Best flight deals of the year! During Black Friday week discounts reach 50% on worldwide flights. Don't miss it!",
      fr: "🛍️ Meilleures offres vols de l'année! Pendant la semaine du Black Friday, réductions jusqu'à 50%.",
      es: "🛍️ ¡Las mejores ofertas de vuelos del año! Durante la semana del Black Friday, descuentos de hasta el 50%."
    },
    months: [11],
    destinations: ["JFK", "LAX", "LHR", "CDG", "DXB", "BKK", "SIN", "NRT", "SYD"],
    discountRange: "30-50%",
    tags: ["black-friday", "discount", "worldwide", "sale"],
    bookingLinks: [
      { name: "Aviasales", url: "https://www.aviasales.com/?marker=709105", icon: "✈️" },
      { name: "Expedia", url: "https://www.expedia.com", icon: "🌍" },
      { name: "Booking.com", url: "https://www.booking.com", icon: "🏨" }
    ]
  },
  {
    id: "offer-spring-break",
    name: {
      ar: "عطلة الربيع",
      en: "Spring Break Deals",
      fr: "Offres Vacances de Printemps",
      es: "Ofertas Vacaciones de Primavera"
    },
    description: {
      ar: "🌸 الربيع هو أجمل وقت للسفر! باريس بازهارها، إسبانيا بطقسها المعتدل، المغرب بجوه الرائع. احجز الآن بأسعار قبل الصيف!",
      en: "🌸 Spring is the best time to travel! Paris in bloom, Spain's mild weather, Morocco's perfect climate. Book now at pre-summer prices!",
      fr: "🌸 Le printemps est la meilleure période pour voyager! Paris en fleurs, l'Espagne au temps doux.",
      es: "🌸 ¡La primavera es el mejor momento para viajar! París en flor, España con clima suave, Marruecos perfecto."
    },
    months: [3, 4, 5],
    destinations: ["CDG", "BCN", "MAD", "FCO", "LIS", "ATH", "RAK", "CMN", "IST", "AMS"],
    discountRange: "15-30%",
    tags: ["spring", "culture", "europe", "mild-weather"],
    bookingLinks: [
      { name: "Aviasales", url: "https://www.aviasales.com/?marker=709105", icon: "✈️" },
      { name: "Booking.com", url: "https://www.booking.com", icon: "🏨" }
    ]
  }
];

// ══════════════════════════════════════════════════════
// 3. قاعدة Affiliate Partners
// ══════════════════════════════════════════════════════

export interface AffiliatePartner {
  id: string;
  name: string;
  category: "flight" | "hotel" | "car" | "insurance" | "tour" | "transfer";
  commissionRate: number; // نسبة مئوية
  cookieDays: number;
  baseUrl: string;
  affiliateParam: string;
  affiliateId: string;
  description: { ar: string; en: string; fr: string; es: string };
  logo: string;
  priority: number; // 1 = الأعلى أولوية
}

export const AFFILIATE_PARTNERS: AffiliatePartner[] = [
  // ══════ FLIGHTS ══════
  {
    id: "aviasales",
    name: "Aviasales",
    category: "flight",
    commissionRate: 1.8,
    cookieDays: 30,
    baseUrl: "https://www.aviasales.com",
    affiliateParam: "marker",
    affiliateId: "709105",
    description: {
      ar: "محرك بحث الطيران الأفضل - يقارن مئات الشركات",
      en: "Best flight search engine - compares hundreds of airlines",
      fr: "Meilleur moteur de recherche de vols - compare des centaines de compagnies",
      es: "Mejor buscador de vuelos - compara cientos de aerolíneas"
    },
    logo: "✈️",
    priority: 1
  },
  {
    id: "skyscanner",
    name: "Skyscanner",
    category: "flight",
    commissionRate: 1.5,
    cookieDays: 30,
    baseUrl: "https://www.skyscanner.com",
    affiliateParam: "associateId",
    affiliateId: "fastamor_skyscanner",
    description: {
      ar: "مقارنة أسعار الطيران العالمية",
      en: "Global flight price comparison",
      fr: "Comparaison de prix de vols mondiale",
      es: "Comparación de precios de vuelos mundial"
    },
    logo: "🔍",
    priority: 2
  },
  {
    id: "kiwi",
    name: "Kiwi.com",
    category: "flight",
    commissionRate: 2.0,
    cookieDays: 30,
    baseUrl: "https://www.kiwi.com",
    affiliateParam: "affiliate_id",
    affiliateId: "fastamor_kiwi",
    description: {
      ar: "متخصص في إيجاد أرخص رحلات متعددة المحطات",
      en: "Specialist in finding cheapest multi-stop routes",
      fr: "Spécialiste des itinéraires multi-escales les moins chers",
      es: "Especialista en encontrar las rutas más baratas con múltiples paradas"
    },
    logo: "🥝",
    priority: 3
  },

  // ══════ HOTELS ══════
  {
    id: "booking",
    name: "Booking.com",
    category: "hotel",
    commissionRate: 4.0,
    cookieDays: 30,
    baseUrl: "https://www.booking.com",
    affiliateParam: "aid",
    affiliateId: "fastamor_booking",
    description: {
      ar: "أكبر موقع حجز فنادق في العالم - أكثر من 28 مليون إقامة",
      en: "World's largest hotel booking site - 28M+ accommodations",
      fr: "Plus grand site de réservation d'hôtels - 28M+ hébergements",
      es: "Mayor sitio de reserva de hoteles - 28M+ alojamientos"
    },
    logo: "🏨",
    priority: 1
  },
  {
    id: "hotels",
    name: "Hotels.com",
    category: "hotel",
    commissionRate: 5.0,
    cookieDays: 7,
    baseUrl: "https://www.hotels.com",
    affiliateParam: "pos",
    affiliateId: "fastamor_hotels",
    description: {
      ar: "احجز 10 ليالي واحصل على ليلة مجانية",
      en: "Book 10 nights get 1 night free reward program",
      fr: "Réservez 10 nuits et obtenez 1 nuit gratuite",
      es: "Reserva 10 noches y obtén 1 noche gratis"
    },
    logo: "⭐",
    priority: 2
  },
  {
    id: "expedia",
    name: "Expedia",
    category: "hotel",
    commissionRate: 3.5,
    cookieDays: 7,
    baseUrl: "https://www.expedia.com",
    affiliateParam: "affcid",
    affiliateId: "fastamor_expedia",
    description: {
      ar: "باقات رحلات شاملة - طيران + فندق بسعر واحد",
      en: "Complete travel packages - flight + hotel combined",
      fr: "Packages voyage complets - vol + hôtel combinés",
      es: "Paquetes de viaje completos - vuelo + hotel combinados"
    },
    logo: "🌍",
    priority: 3
  },
  {
    id: "airbnb",
    name: "Airbnb",
    category: "hotel",
    commissionRate: 3.0,
    cookieDays: 30,
    baseUrl: "https://www.airbnb.com",
    affiliateParam: "af",
    affiliateId: "fastamor_airbnb",
    description: {
      ar: "شقق وبيوت فريدة للإيجار - تجربة محلية أصيلة",
      en: "Unique apartments and houses for rent - authentic local experience",
      fr: "Appartements et maisons uniques à louer - expérience locale authentique",
      es: "Apartamentos y casas únicas de alquiler - experiencia local auténtica"
    },
    logo: "🏠",
    priority: 4
  },

  // ══════ CAR RENTAL ══════
  {
    id: "rentalcars",
    name: "RentalCars.com",
    category: "car",
    commissionRate: 8.0,
    cookieDays: 30,
    baseUrl: "https://www.rentalcars.com",
    affiliateParam: "affiliateCode",
    affiliateId: "fastamor_cars",
    description: {
      ar: "مقارنة أسعار تأجير السيارات العالمية",
      en: "Global car rental price comparison",
      fr: "Comparaison prix location voiture mondiale",
      es: "Comparación de precios de alquiler de coches mundial"
    },
    logo: "🚗",
    priority: 1
  },

  // ══════ INSURANCE ══════
  {
    id: "worldnomads",
    name: "World Nomads",
    category: "insurance",
    commissionRate: 10.0,
    cookieDays: 60,
    baseUrl: "https://www.worldnomads.com",
    affiliateParam: "affiliate",
    affiliateId: "fastamor_nomads",
    description: {
      ar: "تأمين سفر موثوق للمسافرين المغامرين",
      en: "Trusted travel insurance for adventurous travelers",
      fr: "Assurance voyage fiable pour les voyageurs aventureux",
      es: "Seguro de viaje de confianza para viajeros aventureros"
    },
    logo: "🛡️",
    priority: 1
  },
  {
    id: "safetywing",
    name: "SafetyWing",
    category: "insurance",
    commissionRate: 10.0,
    cookieDays: 30,
    baseUrl: "https://safetywing.com",
    affiliateParam: "referral_code",
    affiliateId: "fastamor_safety",
    description: {
      ar: "أرخص تأمين سفر للرحالة والمسافرين الدائمين",
      en: "Most affordable travel insurance for nomads and frequent travelers",
      fr: "Assurance voyage la moins chère pour nomades et voyageurs fréquents",
      es: "Seguro de viaje más asequible para nómadas y viajeros frecuentes"
    },
    logo: "🌐",
    priority: 2
  },

  // ══════ TOURS / ACTIVITIES ══════
  {
    id: "getyourguide",
    name: "GetYourGuide",
    category: "tour",
    commissionRate: 8.0,
    cookieDays: 30,
    baseUrl: "https://www.getyourguide.com",
    affiliateParam: "partner_id",
    affiliateId: "fastamor_gyg",
    description: {
      ar: "أفضل جولات وأنشطة سياحية في كل مكان",
      en: "Best tours and tourist activities everywhere",
      fr: "Meilleures visites guidées et activités touristiques partout",
      es: "Las mejores excursiones y actividades turísticas en todas partes"
    },
    logo: "🎭",
    priority: 1
  },
  {
    id: "viator",
    name: "Viator",
    category: "tour",
    commissionRate: 8.0,
    cookieDays: 30,
    baseUrl: "https://www.viator.com",
    affiliateParam: "pid",
    affiliateId: "fastamor_viator",
    description: {
      ar: "أكثر من 300,000 تجربة سياحية حول العالم",
      en: "300,000+ travel experiences worldwide",
      fr: "Plus de 300 000 expériences de voyage dans le monde",
      es: "Más de 300,000 experiencias de viaje en todo el mundo"
    },
    logo: "🗺️",
    priority: 2
  }
];

// ══════════════════════════════════════════════════════
// دوال الاستخدام
// ══════════════════════════════════════════════════════

// بحث في FAQ
export function findFAQ(message: string, lang: "ar" | "en" | "fr" | "es" = "en"): FAQ | null {
  const msgLower = message.toLowerCase();
  for (const faq of FAQ_DB) {
    for (const pattern of faq.patterns) {
      if (msgLower.includes(pattern.toLowerCase()) || message.includes(pattern)) {
        return faq;
      }
    }
  }
  return null;
}

// الحصول على عروض الشهر الحالي
export function getCurrentOffers(): SeasonalOffer[] {
  const currentMonth = new Date().getMonth() + 1;
  return SEASONAL_OFFERS.filter(offer => offer.months.includes(currentMonth));
}

// بناء رابط affiliate
export function buildAffiliateUrl(
  partnerId: string,
  params: Record<string, string> = {}
): string {
  const partner = AFFILIATE_PARTNERS.find(p => p.id === partnerId);
  if (!partner) return "";

  const url = new URL(partner.baseUrl);
  url.searchParams.set(partner.affiliateParam, partner.affiliateId);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}

// الحصول على أفضل شركاء حسب الفئة
export function getPartnersByCategory(
  category: AffiliatePartner["category"]
): AffiliatePartner[] {
  return AFFILIATE_PARTNERS
    .filter(p => p.category === category)
    .sort((a, b) => a.priority - b.priority);
}

// تنسيق عرض العروض الموسمية
export function formatSeasonalOffer(
  offer: SeasonalOffer,
  lang: "ar" | "en" | "fr" | "es"
): string {
  const name = offer.name[lang];
  const desc = offer.description[lang];
  const links = offer.bookingLinks
    .map(l => `[${l.icon} ${l.name}](${l.url})`)
    .join(" | ");

  return `🎯 **${name}**\n${desc}\n\n💰 خصم: ${offer.discountRange}\n🔗 ${links}`;
}

// إحصائيات سريعة
export const DB_STATS = {
  totalFAQs: FAQ_DB.length,
  totalOffers: SEASONAL_OFFERS.length,
  totalPartners: AFFILIATE_PARTNERS.length,
  categories: {
    faq: [...new Set(FAQ_DB.map(f => f.category))],
    partners: [...new Set(AFFILIATE_PARTNERS.map(p => p.category))]
  }
};