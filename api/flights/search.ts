import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { origin, destination, date, direct = false, currency = 'usd' } = req.body;
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    const marker = process.env.TRAVELPAYOUTS_MARKER;
    
    if (!token) {
      return res.status(500).json({ 
        success: false, 
        error: 'API token not configured',
        flights: []
      });
    }
    
    const month = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${month}&currency=${currency}&direct=${direct}&limit=20&token=${token}`;
    
    console.log(` Flight search: ${origin}  ${destination} for ${month}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const flights = data.data.map((flight: any, index: number) => ({
        id: `${flight.airline}_${Date.now()}_${index}`,
        airline: flight.airline,
        airline_name: getAirlineName(flight.airline),
        airline_logo: `https://pics.avs.io/200/200/${flight.airline}.png`,
        origin: flight.origin,
        destination: flight.destination,
        departure_time: flight.departure_at,
        price: flight.price,
        currency: currency.toUpperCase(),
        stops: flight.transfers === 0 ? 'Direct' : `${flight.transfers} stop(s)`,
        duration: flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A',
        booking_url: `https://www.aviasales.com/search/${flight.origin}${flight.destination}${month}?marker=${marker || ''}`
      }));
      
      return res.json({ success: true, flights, count: flights.length });
    }
    
    return res.json({ success: false, flights: [], message: 'No flights found' });
    
  } catch (error: any) {
    console.error(' Flight search error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message, 
      flights: [] 
    });
  }
}

function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    'AA': 'American Airlines', 'UA': 'United Airlines', 'DL': 'Delta Air Lines',
    'AF': 'Air France', 'LH': 'Lufthansa', 'BA': 'British Airways',
    'EK': 'Emirates', 'QR': 'Qatar Airways', 'TK': 'Turkish Airlines',
    'EY': 'Etihad', 'MS': 'EgyptAir', 'SV': 'Saudia',
    'RJ': 'Royal Jordanian', 'ME': 'MEA', 'AT': 'Royal Air Maroc',
    'TU': 'Tunisair', 'AH': 'Air Algérie', 'IB': 'Iberia',
    'FR': 'Ryanair', 'U2': 'easyJet', 'W6': 'Wizz Air', 'F3': 'Flyadeal',
    'G9': 'Air Arabia', 'GF': 'Gulf Air'
  };
  return airlines[code] || code;
}
