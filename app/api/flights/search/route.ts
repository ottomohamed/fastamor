import { NextResponse } from 'next/server';

// Aviasales Data API - ????? ?? ???????
// ???????: https://support.travelpayouts.com/hc/en-us/articles/360021770979

export async function POST(request: Request) {
  try {
    const { origin, destination, date, direct = false, currency = 'usd' } = await request.json();
    
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    const marker = process.env.TRAVELPAYOUTS_MARKER;
    
    if (!token) {
      console.error(' Missing Travelpayouts token');
      return NextResponse.json({ 
        error: 'API configuration missing', 
        flights: [],
        fallbackUrl: 'https://aviasales.tpx.gr/yQxrYmk7'
      }, { status: 500 });
    }
    
    // ????? ??????? ?? YYYY-MM-DD ??? YYYY-MM (API ???? ??? ??? ????? ??????)
    const month = date ? date.substring(0, 7) : new Date().toISOString().substring(0, 7);
    
    // ???? ???? API
    const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
    url.searchParams.append('origin', origin.toUpperCase());
    url.searchParams.append('destination', destination.toUpperCase());
    url.searchParams.append('departure_at', month);
    url.searchParams.append('currency', currency);
    url.searchParams.append('direct', direct ? 'true' : 'false');
    url.searchParams.append('limit', '20');
    url.searchParams.append('token', token);
    
    console.log(` Searching: ${origin}  ${destination} for ${month}`);
    
    const response = await fetch(url.toString(), {
      headers: { 'Accept-Encoding': 'gzip' } // ??? ????????
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
      const flights = data.data.map((flight: any, index: number) => ({
        id: `${flight.airline}_${flight.flight_number}_${index}`,
        airline: flight.airline,
        airline_name: getAirlineName(flight.airline),
        airline_logo: `https://pics.avs.io/200/200/${flight.airline}.png`,
        origin: flight.origin,
        destination: flight.destination,
        origin_airport: flight.origin_airport || flight.origin,
        destination_airport: flight.destination_airport || flight.destination,
        departure_time: formatDateTime(flight.departure_at),
        arrival_time: flight.return_at ? formatDateTime(flight.return_at) : null,
        duration: formatDuration(flight.duration || flight.duration_to),
        stops: flight.transfers === 0 ? 'Direct' : `${flight.transfers || 0} stop(s)`,
        price: flight.price,
        currency: currency.toUpperCase(),
        // ???? ????? ??????? (???? ?? https://www.aviasales.com)
        booking_path: flight.link,
        affiliate_url: `https://aviasales.tpx.gr/yQxrYmk7?origin=${flight.origin}&destination=${flight.destination}&date=${month}`,
        expires_at: flight.expires_at
      }));
      
      console.log(` Found ${flights.length} flights`);
      return NextResponse.json({ 
        success: true, 
        flights,
        count: flights.length,
        source: 'aviasales_cache'
      });
    }
    
    // ??? ?? ???? ?????? ???? ????? ????? ?????
    console.log(' No flights found, returning affiliate links');
    return NextResponse.json({
      success: false,
      flights: [],
      affiliateFallback: {
        name: 'Aviasales',
        url: `https://aviasales.tpx.gr/yQxrYmk7?origin=${origin}&destination=${destination}`,
        message: 'No cached prices found. Search directly on Aviasales.'
      }
    });
    
  } catch (error) {
    console.error(' Flight search error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to search flights',
      flights: [],
      affiliateFallback: {
        name: 'Aviasales',
        url: 'https://aviasales.tpx.gr/yQxrYmk7',
        message: 'Service temporarily unavailable. Book directly through our partner.'
      }
    }, { status: 200 }); // ???? 200 ???? ?? ???? ??? ????????
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
    'FR': 'Ryanair', 'U2': 'easyJet', 'W6': 'Wizz Air',
    'SU': 'Aeroflot', 'PC': 'Pegasus', 'FZ': 'flydubai',
    'G9': 'Air Arabia', 'J9': 'Jazeera Airways', 'KU': 'Kuwait Airways'
  };
  return airlines[code] || code;
}

function formatDateTime(isoString: string): string {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function formatDuration(minutes: number): string {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
