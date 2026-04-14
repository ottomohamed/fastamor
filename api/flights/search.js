// api/flights/search.js
// ?????? ?????? ???????
const TOKEN = '48076067aa7fe645d28373eb715a346b';
const MARKER = '709105';

export default async function handler(req, res) {
  // ??????? CORS
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
    
    console.log(` Searching: ${origin}  ${destination} for ${date}`);
    
    const month = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${month}&currency=usd&limit=20&token=${TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const flights = data.data.map((flight, idx) => {
        // ???? ???? ????? ?? ????? marker
        let bookingUrl = '';
        if (flight.link) {
          const separator = flight.link.includes('?') ? '&' : '?';
          bookingUrl = `https://www.aviasales.com${flight.link}${separator}marker=${MARKER}`;
        } else {
          bookingUrl = `https://www.aviasales.com/search/${origin}${destination}${month}?marker=${MARKER}`;
        }
        
        return {
          id: `${flight.airline}_${idx}`,
          airline: flight.airline,
          airline_name: getAirlineName(flight.airline),
          airline_logo: `https://pics.avs.io/200/200/${flight.airline}.png`,
          origin: flight.origin,
          destination: flight.destination,
          departure_time: flight.departure_at,
          duration: flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A',
          stops: flight.transfers === 0 ? 'Direct' : `${flight.transfers} stop(s)`,
          price: flight.price,
          currency: 'USD',
          booking_url: bookingUrl,
          gate: 'aviasales'
        };
      });
      
      return res.json({ success: true, flights, count: flights.length });
    }
    
    return res.json({ success: false, flights: [], message: 'No flights found' });
    
  } catch (error) {
    console.error('Flight search error:', error);
    return res.status(500).json({ success: false, error: error.message, flights: [] });
  }
}

function getAirlineName(code) {
  const airlines = {
    'AA': 'American Airlines', 'UA': 'United Airlines', 'DL': 'Delta Air Lines',
    'AF': 'Air France', 'LH': 'Lufthansa', 'BA': 'British Airways',
    'EK': 'Emirates', 'QR': 'Qatar Airways', 'TK': 'Turkish Airlines',
    'EY': 'Etihad', 'MS': 'EgyptAir', 'SV': 'Saudia',
    'FZ': 'flydubai', 'G9': 'Air Arabia', 'GF': 'Gulf Air'
  };
  return airlines[code] || code;
}
