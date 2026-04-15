import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { origin, destination, date } = req.body;
    const TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '48076067aa7fe645d28373eb715a346b';
    const MARKER = process.env.TRAVELPAYOUTS_MARKER || '709105';
    
    const month = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${month}&currency=usd&limit=20&token=${TOKEN}`;
    
    console.log(`Fetching: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const flights = data.data.map((flight: any, idx: number) => ({
        id: `${flight.airline}_${idx}`,
        airline: flight.airline,
        airline_name: flight.airline,
        airline_logo: `https://pics.avs.io/200/200/${flight.airline}.png`,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_at,
        duration: flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A',
        stops: flight.transfers === 0 ? 'Direct' : `${flight.transfers} stop(s)`,
        price: flight.price,
        currency: 'USD',
        booking_url: flight.link ? `https://www.aviasales.com${flight.link}?marker=${MARKER}` : `https://www.aviasales.com/search/${origin}${destination}${month}?marker=${MARKER}`,
        gate: 'aviasales'
      }));
      
      return res.json({ success: true, flights, count: flights.length });
    }
    
    return res.json({ success: false, flights: [], message: 'No flights found' });
    
  } catch (error) {
    console.error('Flight search error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error', flights: [] });
  }
}
