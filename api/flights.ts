import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN = process.env.TP_API_TOKEN || '517b9f43b0fa448681c25b90fda7cf73';
const MARKER = process.env.TP_MARKER || '709105';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { origin, destination, date, returnDate, passengers = 1, currency = 'USD' } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Missing: origin, destination, date' });
  }

  try {
    const depMonth = date.slice(0, 7); // YYYY-MM
    
    // بناء رابط API البيانات
    let url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?`;
    url += `origin=${origin.toUpperCase()}`;
    url += `&destination=${destination.toUpperCase()}`;
    url += `&departure_at=${date}`;
    url += `&currency=${currency.toLowerCase()}`;
    url += `&sorting=price`;
    url += `&limit=20`;
    url += `&token=${TOKEN}`;
    
    if (returnDate) {
      url += `&return_at=${returnDate}`;
    }

    console.log('📡 Fetching flights from Data API:', { origin, destination, date });

    let response = await fetch(url);
    let data = await response.json();

    // إذا لم يتم العثور على نتائج، جرب البحث بالشهر فقط
    if (!data.success || !data.data?.length) {
      console.log('No results for exact date, trying month search...');
      const monthUrl = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?`;
      + `origin=${origin.toUpperCase()}`;
      + `&destination=${destination.toUpperCase()}`;
      + `&departure_at=${depMonth}`;
      + `&currency=${currency.toLowerCase()}`;
      + `&sorting=price`;
      + `&limit=20`;
      + `&token=${TOKEN}`;
      
      response = await fetch(monthUrl);
      data = await response.json();
    }

    if (!data.success || !data.data?.length) {
      return res.status(200).json({ 
        flights: [], 
        message: 'No flights found for this route' 
      });
    }

    // تنسيق النتائج
    const flights = formatFlights(data.data, origin, destination, currency, MARKER);
    
    console.log(`✅ Found ${flights.length} flights`);
    
    return res.status(200).json({ 
      flights: flights,
      total: flights.length,
      source: 'data_api'
    });

  } catch (error: any) {
    console.error('❌ Flights API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function formatFlights(data: any[], origin: string, destination: string, currency: string, marker: string) {
  return data.map((f: any) => {
    // حساب مدة الرحلة
    const hours = Math.floor(f.duration_to / 60);
    const mins = f.duration_to % 60;
    
    // عدد التوقفات
    const stopsText = f.transfers === 0 ? 'Direct' : `${f.transfers} stop${f.transfers > 1 ? 's' : ''}`;
    
    // وقت الإقلاع
    const depTime = f.departure_at 
      ? new Date(f.departure_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
      : '';
    
    // رابط الحجز
    const bookingUrl = `https://www.aviasales.com${f.link}&marker=${marker}`;
    
    // شعار شركة الطيران
    const airlineLogo = `http://img.wway.io/pics/root/${f.airline}@png?exar=1&rs=fit:80:40`;

    return {
      id: `${f.flight_number}_${f.departure_at}`,
      airline: f.airline,
      airline_logo: airlineLogo,
      origin: f.origin || origin.toUpperCase(),
      destination: f.destination || destination.toUpperCase(),
      origin_airport: f.origin_airport || origin.toUpperCase(),
      destination_airport: f.destination_airport || destination.toUpperCase(),
      departure_at: f.departure_at,
      departure_time: depTime,
      duration: `${hours}h ${mins}m`,
      duration_minutes: f.duration_to,
      stops: stopsText,
      transfers: f.transfers,
      price: f.price,
      currency: currency.toUpperCase(),
      gate: f.gate,
      booking_url: bookingUrl,
      airline_code: f.airline,
    };
  }).sort((a: any, b: any) => a.price - b.price);
}