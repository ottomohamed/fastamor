import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '517b9f43b0fa448681c25b90fda7cf73';
const MARKER = process.env.TRAVELPAYOUTS_MARKER || '709105';

function getAirlineLogo(iata: string): string {
  return `https://pics.avs.io/64/64/${iata}.png`;
}

function formatDuration(minutes: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}

function buildBookingUrl(link: string, origin: string, destination: string): string {
  if (link) return `https://www.aviasales.com${link}&marker=${MARKER}`;
  return `https://www.aviasales.com/search/${origin}1${destination}1?marker=${MARKER}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { origin, destination, date } = req.body || {};

  if (!destination) {
    return res.status(400).json({ error: 'Destination required', flights: [] });
  }

  // Try multiple markets to find cached data
  const markets = ['us', 'gb', 'ru', 'ae'];
  const dateParam = date && date !== 'any' ? `&departure_at=${date.slice(0, 7)}` : '';
  const originParam = origin ? `&origin=${origin}` : '';

  for (const market of markets) {
    try {
      const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?destination=${destination}${originParam}${dateParam}&currency=usd&sorting=price&direct=false&limit=10&one_way=true&market=${market}&token=${TOKEN}`;

      const response = await fetch(url, {
        headers: { 'X-Access-Token': TOKEN },
      });

      if (!response.ok) continue;

      const data = await response.json();

      if (!data.success || !data.data || data.data.length === 0) continue;

      const flights = data.data.slice(0, 8).map((f: any, i: number) => ({
        id: `flight_${i}`,
        airline: f.airline || 'Unknown',
        airline_logo: getAirlineLogo(f.airline || 'XX'),
        origin: f.origin || origin || '',
        destination: f.destination || destination,
        departure_time: f.departure_at
          ? new Date(f.departure_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '',
        duration: formatDuration(f.duration_to || f.duration || 0),
        stops: f.transfers === 0 ? 'Direct' : `${f.transfers} stop${f.transfers > 1 ? 's' : ''}`,
        price: f.price || 0,
        currency: 'USD',
        booking_url: buildBookingUrl(f.link || '', f.origin || origin, f.destination || destination),
        gate: f.destination_airport || destination,
      }));

      return res.status(200).json({ flights, success: true, market });

    } catch (e) {
      continue;
    }
  }

  // All markets failed — return affiliate deep link
  const searchUrl = origin
    ? `https://www.aviasales.com/search/${origin}1${destination}1?marker=${MARKER}`
    : `https://aviasales.tpx.gr/yQxrYmk7`;

  return res.status(200).json({
    flights: [],
    fallback_url: searchUrl,
    message: 'No cached data, use direct link',
  });
}
