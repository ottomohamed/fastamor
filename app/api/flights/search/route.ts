import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { origin, destination, date } = await request.json();
    
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    const marker = process.env.TRAVELPAYOUTS_MARKER;
    
    if (!token || !marker) {
      return NextResponse.json({ 
        error: 'API configuration missing', 
        flights: [] 
      }, { status: 500 });
    }
    
    // Aviasales API - البحث عن الرحلات
    const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?origin=${origin}&destination=${destination}&depart_date=${date}&currency=USD&token=${token}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      const flights = data.data.slice(0, 5).map((flight: any) => ({
        id: `${flight.airline}_${flight.flight_number || Date.now()}`,
        airline: flight.airline,
        airline_logo: `https://pics.avs.io/200/200/${flight.airline}.png`,
        origin: origin,
        destination: destination,
        departure_time: flight.departure_at || date,
        duration: flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A',
        stops: flight.transfers === 0 ? 'Direct' : `${flight.transfers || 0} stop(s)`,
        price: flight.price,
        currency: 'USD',
        booking_url: `https://www.aviasales.com/search/${origin}${destination}${date}?marker=${marker}`,
        gate: 'aviasales'
      }));
      
      return NextResponse.json({ flights, success: true });
    }
    
    return NextResponse.json({ flights: [], success: false, message: 'No flights found' });
    
  } catch (error) {
    console.error('Flight search error:', error);
    return NextResponse.json({ 
      error: 'Failed to search flights', 
      flights: [] 
    }, { status: 500 });
  }
}
