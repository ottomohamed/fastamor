// api/flights/search.js
export default async function handler(req, res) {
  // إعدادات CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { origin, destination, date } = req.body;
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    const marker = process.env.TRAVELPAYOUTS_MARKER;
    
    if (!token) {
      return res.status(500).json({ error: 'API token not configured' });
    }
    
    const month = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${month}&currency=usd&limit=20&token=${token}`;
    
    console.log(` Fetching flights: ${origin}  ${destination} for ${month}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const flights = data.data.map((flight, idx) => ({
        id: `${flight.airline}_${idx}`,
        airline: flight.airline,
        airline_logo: `https://pics.avs.io/200/200/${flight.airline}.png`,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_at,
        duration: flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A',
        stops: flight.transfers === 0 ? 'Direct' : `${flight.transfers} stop(s)`,
        price: flight.price,
        currency: 'USD',
        booking_url: `https://www.aviasales.com/search/${flight.origin}${flight.destination}${month}?marker=${marker || ''}`,
        gate: 'aviasales'
      }));
      
      return res.json({ success: true, flights, count: flights.length });
    }
    
    return res.json({ success: false, flights: [], message: 'No flights found' });
    
  } catch (error) {
    console.error('Flight search error:', error);
    return res.status(500).json({ success: false, error: error.message, flights: [] });
  }
}
