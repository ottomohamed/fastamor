const TOKEN = '48076067aa7fe645d28373eb715a346b';
const MARKER = '709105';

// Estimate max reasonable duration based on distance
function getMaxReasonableDuration(origin, destination) {
  // Short-haul routes (under 2h direct) — reject anything over 8h
  const shortHaul = [
    ['SVQ','TNG'], ['MAD','CMN'], ['MAD','RAK'], ['BCN','CMN'],
    ['LHR','CDG'], ['CDG','AMS'], ['MAD','LIS'], ['BCN','FCO'],
    ['DXB','DOH'], ['DXB','BAH'], ['DXB','KWI'], ['CAI','AMM'],
    ['TUN','RAK'], ['ALG','CMN'], ['TUN','CMN'],
  ];
  
  const pair = [origin, destination].sort().join('-');
  const isShort = shortHaul.some(r => r.sort().join('-') === pair);
  
  if (isShort) return 8 * 60; // max 8 hours for short-haul
  return 24 * 60; // max 24 hours for long-haul
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { origin, destination, date } = req.body;
    if (!origin || !destination) return res.status(400).json({ error: 'origin and destination required', flights: [] });

    const month = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&departure_at=${month}&currency=usd&limit=50&token=${TOKEN}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.success || !data.data?.length) {
      return res.status(200).json({
        flights: [],
        fallback_url: `https://www.aviasales.com/search/${origin}${destination}1?marker=${MARKER}`,
        message: 'No cached flights'
      });
    }

    const maxDuration = getMaxReasonableDuration(origin, destination);

    // Separate direct and indirect
    const direct = data.data.filter(f => f.transfers === 0);
    const indirect = data.data.filter(f => f.transfers > 0 && (f.duration || 999) <= maxDuration / 60);

    // Sort each group by price
    direct.sort((a, b) => a.price - b.price);
    indirect.sort((a, b) => a.price - b.price);

    // Smart selection: prioritize direct, add cheapest indirect as alternatives
    let selected = [];

    if (direct.length > 0) {
      // Show top 5 direct flights
      selected = direct.slice(0, 5);
      // Add 2 cheapest indirect as alternatives (if significantly cheaper)
      const cheapestDirect = direct[0].price;
      const cheaperIndirect = indirect.filter(f => f.price < cheapestDirect * 0.7).slice(0, 2);
      selected = [...selected, ...cheaperIndirect];
    } else {
      // No direct flights — show best indirect, sorted by duration then price
      indirect.sort((a, b) => {
        const durA = a.duration || 999;
        const durB = b.duration || 999;
        if (Math.abs(durA - durB) > 120) return durA - durB; // prefer shorter by >2h
        return a.price - b.price; // else prefer cheaper
      });
      selected = indirect.slice(0, 8);
    }

    const flights = selected.map((flight, idx) => {
      const flightDate = flight.departure_at?.split('T')[0] || '';
      const flightTime = flight.departure_at?.split('T')[1]?.substring(0, 5) || '';
      const durationMin = flight.duration || 0;
      const durationStr = durationMin > 0 ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m` : '';

      let bookingUrl = '';
      if (flight.link) {
        bookingUrl = `https://www.aviasales.com${flight.link}&marker=${MARKER}`;
      } else {
        bookingUrl = `https://www.aviasales.com/search/${origin}${destination}1?marker=${MARKER}`;
      }

      return {
        id: `${flight.airline}_${flightDate}_${idx}`,
        airline: flight.airline,
        airline_logo: `https://pics.avs.io/64/64/${flight.airline}.png`,
        origin: flight.origin || origin,
        destination: flight.destination || destination,
        departure_time: flightTime || flightDate,
        duration: durationStr,
        duration_minutes: durationMin,
        stops: flight.transfers === 0 ? 'Direct' : `${flight.transfers} stop${flight.transfers > 1 ? 's' : ''}`,
        stops_count: flight.transfers || 0,
        price: flight.price,
        currency: 'USD',
        booking_url: bookingUrl,
        gate: flight.destination_airport || destination,
        is_direct: flight.transfers === 0,
      };
    });

    // Final sort: direct first, then by price
    flights.sort((a, b) => {
      if (a.is_direct && !b.is_direct) return -1;
      if (!a.is_direct && b.is_direct) return 1;
      return a.price - b.price;
    });

    const hasDirectFlights = flights.some(f => f.is_direct);

    return res.status(200).json({
      flights,
      count: flights.length,
      has_direct: hasDirectFlights,
      cheapest_direct: direct[0]?.price || null,
      cheapest_overall: flights[0]?.price || null,
      fallback_url: `https://www.aviasales.com/search/${origin}${destination}1?marker=${MARKER}`,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message, flights: [] });
  }
}
