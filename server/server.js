import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const TOKEN = '48076067aa7fe645d28373eb715a346b';
const MARKER = '709105';  // رقم الإحالة الخاص بك

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/flights/search', async (req, res) => {
  const { origin, destination, date } = req.body;
  
  console.log(` Searching: ${origin}  ${destination} for ${date}`);
  
  try {
    const month = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${month}&currency=usd&limit=20&token=${TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const flights = data.data.map((flight, idx) => {
        // بناء رابط الحجز مع إضافة marker
        let bookingUrl = '';
        
        if (flight.link) {
          // إضافة marker إلى الرابط المباشر
          const separator = flight.link.includes('?') ? '&' : '?';
          bookingUrl = `https://www.aviasales.com${flight.link}${separator}marker=${MARKER}`;
        } else {
          // رابط احتياطي مع marker
          bookingUrl = `https://www.aviasales.com/search/${origin}${destination}${month}?marker=${MARKER}`;
        }
        
        // رابط الإحالة الرئيسي (آمن)
        const affiliateUrl = `https://aviasales.tpx.gr/yQxrYmk7?origin=${flight.origin}&destination=${flight.destination}&departure_date=${flight.departure_at?.split('T')[0] || month}&marker=${MARKER}`;
        
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
          affiliate_url: affiliateUrl,
          gate: 'aviasales'
        };
      });
      
      console.log(` Found ${flights.length} flights`);
      return res.json({ success: true, flights, count: flights.length });
    }
    
    return res.json({ success: false, flights: [], message: 'No flights found' });
    
  } catch (error) {
    console.error(' Flight search error:', error);
    return res.status(500).json({ success: false, error: error.message, flights: [] });
  }
});

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

app.listen(PORT, () => {
  console.log(`\n Fastamor API Server running on http://localhost:${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` Flights: POST to http://localhost:${PORT}/api/flights/search`);
  console.log(` Marker: ${MARKER}\n`);
});
