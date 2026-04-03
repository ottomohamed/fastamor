import { Router } from 'express';
import { IATACodesProvider, FlightDataProvider } from '../providers/aviasales';
import { APICache } from '../cache/redis';

const router = Router();

// تهيئة المزودين
const iataProvider = new IATACodesProvider();
const flightsProvider = new FlightDataProvider(
  process.env.AVIASALES_TOKEN || '',
  process.env.AVIASALES_MARKER || ''
);
const cache = new APICache();

// تحميل قاعدة IATA عند بدء التشغيل
iataProvider.loadDatabase();

// ✅ نقطة نهاية البحث عن الرحلات
router.post('/search/flights', async (req, res) => {
  try {
    const { origin, destination, departDate, returnDate } = req.body;

    if (!origin || !destination || !departDate) {
      return res.status(400).json({ 
        error: 'Missing required fields: origin, destination, departDate' 
      });
    }

    // تحويل أسماء المدن إلى رموز IATA
    const originCode = iataProvider.getIATACode(origin);
    const destCode = iataProvider.getIATACode(destination);

    if (!originCode || !destCode) {
      return res.status(400).json({ 
        error: 'Could not resolve city names to IATA codes',
        suggestions: {
          origin: iataProvider.searchCity(origin),
          destination: iataProvider.searchCity(destination)
        }
      });
    }

    // استخدام الكاش لتجنب التكرار
    const cacheKey = `flight:${originCode}:${destCode}:${departDate}`;
    const flights = await cache.getOrFetch(
      cacheKey,
      () => flightsProvider.searchFlights({
        origin: originCode,
        destination: destCode,
        departDate,
        returnDate
      }),
      1800 // 30 دقيقة
    );

    res.json({
      success: true,
      origin: { query: origin, code: originCode },
      destination: { query: destination, code: destCode },
      flights,
      count: flights.length
    });

  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// ✅ نقطة نهاية البحث عن المدن (للإكمال التلقائي)
router.get('/search/cities', async (req, res) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.json([]);
  }

  const results = iataProvider.searchCity(q);
  res.json(results);
});

export default router;