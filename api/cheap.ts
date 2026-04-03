import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN = process.env.TP_API_TOKEN!;
const MARKER = process.env.TP_MARKER!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { 
    origin, 
    destination, 
    currency = 'USD', 
    limit = 10,
    month
  } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Missing: origin, destination' });
  }

  try {
    let departureDate = month as string;
    if (!departureDate) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      departureDate = date.toISOString().split('T')[0].slice(0, 7);
    }

    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates`;
    const params = new URLSearchParams({
      origin: origin.toString().toUpperCase(),
      destination: destination.toString().toUpperCase(),
      departure_at: departureDate,
      currency: currency.toString().toLowerCase(),
      sorting: 'price',
      limit: limit.toString(),
      token: TOKEN,
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (!data.success || !data.data?.length) {
      return res.status(200).json({ 
        success: true,
        flights: [], 
        message: 'No cheap flights found',
      });
    }

    const flights = data.data.map((flight: any) => {
      const hours = Math.floor(flight.duration_to / 60);
      const minutes = flight.duration_to % 60;
      const stopsText = flight.transfers === 0 
        ? 'Direct' 
        : flight.transfers === 1 
          ? '1 stop' 
          : `${flight.transfers} stops`;

      return {
        id: `${flight.airline}_${flight.flight_number}_${flight.departure_at}`,
        airline: flight.airline,
        airline_logo: `http://img.wway.io/pics/root/${flight.airline}@png?exar=1&rs=fit:80:40`,
        flight_number: flight.flight_number,
        origin: flight.origin || origin.toString().toUpperCase(),
        destination: flight.destination || destination.toString().toUpperCase(),
        departure_at: flight.departure_at,
        duration: `${hours}h ${minutes}m`,
        stops: stopsText,
        price: flight.price,
        currency: currency.toString().toUpperCase(),
        booking_url: `https://www.aviasales.com${flight.link}&marker=${MARKER}`,
      };
    });

    flights.sort((a: any, b: any) => a.price - b.price);

    return res.status(200).json({ 
      success: true,
      flights: flights,
      total: flights.length,
    });

  } catch (error: any) {
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}
