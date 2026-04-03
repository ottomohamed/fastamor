import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN = process.env.TP_API_TOKEN || '517b9f43b0fa448681c25b90fda7cf73';
const MARKER = process.env.TP_MARKER || '709105';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { origin, destination, date, returnDate, passengers = 1, currency = 'usd' } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Missing: origin, destination, date' });
  }

  try {
    const dep = date.slice(0, 7); // YYYY-MM
    let url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&departure_at=${date}&currency=${currency}&sorting=price&limit=10&token=${TOKEN}`;
    if (returnDate) url += `&return_at=${returnDate}`;

    const apiRes = await fetch(url);
    const data = await apiRes.json();

    if (!data.success || !data.data?.length) {
      // جرب بدون تاريخ محدد
      const url2 = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin.toUpperCase()}&destination=${destination.toUpperCase()}&departure_at=${dep}&currency=${currency}&sorting=price&limit=10&token=${TOKEN}`;
      const res2 = await fetch(url2);
      const data2 = await res2.json();
      if (!data2.success || !data2.data?.length) {
        return res.status(200).json({ flights: [], message: 'No flights found' });
      }
      return res.status(200).json({ flights: formatFlights(data2.data, origin, destination, currency, MARKER) });
    }

    return res.status(200).json({ flights: formatFlights(data.data, origin, destination, currency, MARKER) });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

function formatFlights(data: any[], origin: string, destination: string, currency: string, marker: string) {
  return data.map((f: any) => {
    const bookingUrl = `https://www.aviasales.com${f.link}&marker=${marker}`;
    const hours = Math.floor(f.duration_to / 60);
    const mins = f.duration_to % 60;
    const stops = f.transfers === 0 ? 'Direct' : `${f.transfers} stop${f.transfers > 1 ? 's' : ''}`;
    const depTime = f.departure_at ? new Date(f.departure_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }) : '';

    return {
      id: f.flight_number + f.departure_at,
      airline: f.airline,
      airline_logo: `http://img.wway.io/pics/root/${f.airline}@png?exar=1&rs=fit:80:40`,
      origin: f.origin || origin.toUpperCase(),
      destination: f.destination || destination.toUpperCase(),
      origin_airport: f.origin_airport,
      destination_airport: f.destination_airport,
      departure_at: f.departure_at,
      departure_time: depTime,
      duration: `${hours}h ${mins}m`,
      stops,
      price: f.price,
      currency: currency.toUpperCase(),
      gate: f.gate,
      booking_url: bookingUrl,
    };
  }).sort((a: any, b: any) => a.price - b.price);
}
