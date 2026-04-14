import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

const TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '517b9f43b0fa448681c25b90fda7cf73';
const MARKER = process.env.TRAVELPAYOUTS_MARKER || '709105';
const HOST = 'fastamor.com';

function getAirlineLogo(iata: string): string {
  return `https://pics.avs.io/64/64/${iata}.png`;
}

function formatDuration(minutes: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function buildBookingUrl(link: string, origin: string, destination: string, date: string): string {
  if (link) return `https://www.aviasales.com${link}&marker=${MARKER}`;
  const d = date ? date.replace(/-/g, '').slice(2, 8) : '';
  return `https://www.aviasales.com/search/${origin}${d}${destination}1?marker=${MARKER}`;
}

// ── Create signature for real-time search API
function createSignature(params: {
  host: string;
  locale: string;
  marker: string;
  adults: number;
  children: number;
  infants: number;
  date: string;
  destination: string;
  origin: string;
  trip_class: string;
  user_ip: string;
}): string {
  const values = [
    TOKEN,
    params.host,
    params.locale,
    params.marker,
    params.adults,
    params.children,
    params.infants,
    params.date,
    params.destination,
    params.origin,
    params.trip_class,
    params.user_ip,
  ].join(':');
  return crypto.createHash('md5').update(values).digest('hex');
}

// ── Method 1: Cache-based API (fast, no signature needed)
async function searchFromCache(origin: string, destination: string, date: string) {
  const markets = ['us', 'gb', 'ae', 'ru', 'fr'];
  const dateParam = date && date !== 'any' ? `&departure_at=${date.slice(0, 7)}` : '';
  const originParam = origin ? `&origin=${origin}` : '';

  for (const market of markets) {
    try {
      const url = `https://api.travelpayouts.com/aviasales/v3/prices_for_dates?destination=${destination}${originParam}${dateParam}&currency=usd&sorting=price&direct=false&limit=10&one_way=true&market=${market}&token=${TOKEN}`;
      const response = await fetch(url, { headers: { 'X-Access-Token': TOKEN } });
      if (!response.ok) continue;
      const data = await response.json();
      if (!data.success || !data.data?.length) continue;

      return data.data.slice(0, 8).map((f: any, i: number) => ({
        id: `cache_${i}`,
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
        booking_url: buildBookingUrl(f.link || '', f.origin || origin, f.destination || destination, f.departure_at || date),
        gate: f.destination_airport || destination,
      }));
    } catch { continue; }
  }
  return null;
}

// ── Method 2: Real-time Search API (live results)
async function searchRealtime(origin: string, destination: string, date: string, userIp: string) {
  const travelDate = date && date !== 'any' ? date : (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  })();

  const sigParams = {
    host: HOST,
    locale: 'en',
    marker: MARKER,
    adults: 1,
    children: 0,
    infants: 0,
    date: travelDate,
    destination,
    origin,
    trip_class: 'Y',
    user_ip: userIp,
  };

  const signature = createSignature(sigParams);

  // Step 1: Initialize search
  const initResponse = await fetch('https://api.travelpayouts.com/v1/flight_search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signature,
      marker: MARKER,
      host: HOST,
      user_ip: userIp,
      locale: 'en',
      trip_class: 'Y',
      passengers: { adults: 1, children: 0, infants: 0 },
      segments: [{ origin, destination, date: travelDate }],
    }),
  });

  if (!initResponse.ok) return null;
  const initData = await initResponse.json();
  const searchId = initData.search_id;
  if (!searchId) return null;

  // Step 2: Poll results (max 4 attempts, 2s apart)
  let proposals: any[] = [];
  let currencyRates: any = {};

  for (let attempt = 0; attempt < 4; attempt++) {
    await new Promise(r => setTimeout(r, attempt === 0 ? 3000 : 2000));

    const resultsResponse = await fetch(
      `https://api.travelpayouts.com/v1/flight_search_results?uuid=${searchId}`,
      { headers: { 'Accept-Encoding': 'gzip, deflate' } }
    );

    if (!resultsResponse.ok) continue;

    const chunks = await resultsResponse.json();
    if (!Array.isArray(chunks)) continue;

    for (const chunk of chunks) {
      if (chunk.proposals) proposals.push(...chunk.proposals);
      if (chunk.currency_rates) currencyRates = chunk.currency_rates;
      // Last chunk has only search_id — search complete
      if (Object.keys(chunk).length === 1 && chunk.search_id) break;
    }

    if (proposals.length > 0) break;
  }

  if (!proposals.length) return null;

  // Convert prices to USD
  const rubToUsd = currencyRates?.usd || 0.011;

  return proposals.slice(0, 10).map((p: any, i: number) => {
    const firstSegment = p.segment?.[0];
    const firstFlight = firstSegment?.flight?.[0];
    const lastFlight = firstSegment?.flight?.[firstSegment.flight.length - 1];

    // Get price from terms
    const termKey = Object.keys(p.terms || {})[0];
    const term = p.terms?.[termKey];
    const priceRaw = term?.price || 0;
    const priceCurrency = term?.currency || 'rub';
    const priceUsd = priceCurrency === 'usd' ? priceRaw : Math.round(priceRaw * rubToUsd);

    const airline = p.carriers?.[0] || firstFlight?.marketing_carrier || 'Unknown';
    const stops = p.max_stops || 0;
    const totalDuration = p.total_duration || 0;

    return {
      id: `rt_${i}`,
      airline,
      airline_logo: getAirlineLogo(airline),
      origin: firstFlight?.departure || origin,
      destination: lastFlight?.arrival || destination,
      departure_time: firstFlight?.departure_time || '',
      duration: formatDuration(totalDuration),
      stops: stops === 0 ? 'Direct' : `${stops} stop${stops > 1 ? 's' : ''}`,
      price: priceUsd,
      currency: 'USD',
      booking_url: `https://www.aviasales.com/search/${origin}${travelDate.replace(/-/g, '').slice(2, 8)}${destination}1?marker=${MARKER}`,
      gate: lastFlight?.arrival || destination,
      sign: p.sign,
      search_id: searchId,
    };
  }).sort((a: any, b: any) => a.price - b.price);
}

// ── Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { origin, destination, date } = req.body || {};
  if (!destination) return res.status(400).json({ error: 'Destination required', flights: [] });

  const userIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || '127.0.0.1';

  // Try cache first (fast)
  const cacheFlights = await searchFromCache(origin, destination, date);
  if (cacheFlights?.length) {
    return res.status(200).json({ flights: cacheFlights, success: true, source: 'cache' });
  }

  // Fallback: real-time search (slower but always has results)
  if (origin && destination) {
    try {
      const realtimeFlights = await searchRealtime(origin, destination, date, userIp);
      if (realtimeFlights?.length) {
        return res.status(200).json({ flights: realtimeFlights, success: true, source: 'realtime' });
      }
    } catch (e) {
      console.error('Realtime search error:', e);
    }
  }

  // Final fallback: affiliate link
  return res.status(200).json({
    flights: [],
    fallback_url: origin
      ? `https://www.aviasales.com/search/${origin}1${destination}1?marker=${MARKER}`
      : `https://aviasales.tpx.gr/yQxrYmk7`,
    message: 'No flights found',
  });
}
