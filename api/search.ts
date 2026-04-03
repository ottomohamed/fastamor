import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const TOKEN = process.env.TP_API_TOKEN!;
const MARKER = process.env.TP_MARKER!;

function createSignature(params: Record<string, string>): string {
  const sorted = Object.keys(params).sort().map(k => params[k]).join(':');
  return crypto.createHash('md5').update(TOKEN + ':' + sorted).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { origin, destination, date, returnDate, passengers = 1, currency = 'USD', locale = 'en' } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Missing required fields: origin, destination, date' });
  }

  const userIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '1.1.1.1';

  try {
    // البناء directions
    const directions: any[] = [{ origin: origin.toUpperCase(), destination: destination.toUpperCase(), date }];
    if (returnDate) {
      directions.push({ origin: destination.toUpperCase(), destination: origin.toUpperCase(), date: returnDate });
    }

    const bodyParams = {
      marker: MARKER,
      locale,
      currency_code: currency,
      market_code: 'us',
      search_params: {
        trip_class: 'Y',
        passengers: { adults: Number(passengers), children: 0, infants: 0 },
        directions,
      },
    };

    // إنشاء signature
    const flatParams: Record<string, string> = {
      marker: MARKER,
      locale,
      currency_code: currency,
      market_code: 'us',
      trip_class: 'Y',
      adults: String(passengers),
      children: '0',
      infants: '0',
    };
    directions.forEach((d, i) => {
      flatParams[`origin_${i}`] = d.origin;
      flatParams[`destination_${i}`] = d.destination;
      flatParams[`date_${i}`] = d.date;
    });

    const signature = createSignature(flatParams);

    // Start Search
    const startRes = await fetch('https://tickets-api.travelpayouts.com/search/affiliate/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': 'fastamor.com',
        'x-user-ip': userIp,
        'x-signature': signature,
        'x-affiliate-user-id': TOKEN,
      },
      body: JSON.stringify({ ...bodyParams, signature }),
    });

    if (!startRes.ok) {
      const err = await startRes.text();
      return res.status(startRes.status).json({ error: 'Search start failed', details: err });
    }

    const { search_id, results_url } = await startRes.json();

    // انتظر 5 ثواني ثم اجلب النتائج
    await new Promise(r => setTimeout(r, 5000));

    const resultsRes = await fetch(`${results_url}/search/affiliate/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': 'fastamor.com',
        'x-user-ip': userIp,
        'x-affiliate-user-id': TOKEN,
      },
      body: JSON.stringify({ search_id, last_update_timestamp: 0 }),
    });

    if (!resultsRes.ok) {
      const err = await resultsRes.text();
      return res.status(resultsRes.status).json({ error: 'Results fetch failed', details: err });
    }

    const results = await resultsRes.json();

    // ترتيب الـ proposals من الأرخص للأغلى
    const tickets = results.tickets || [];
    const proposals: any[] = [];

    tickets.forEach((ticket: any) => {
      (ticket.proposals || []).forEach((p: any) => {
        const agent = results.agents?.find((a: any) => a.id === p.agent_id);
        const legs = ticket.segments?.[0]?.flights?.map((i: number) => results.flight_legs?.[i]) || [];

        proposals.push({
          id: p.id,
          search_id,
          results_url,
          price: p.price?.amount || 0,
          currency: p.price?.currency || currency,
          agent_name: agent?.label || agent?.gate_name || 'Agency',
          agent_id: p.agent_id,
          baggage: p.flight_terms?.baggage?.count || 0,
          trip_class: p.flight_terms?.trip_class || 'Y',
          legs: legs.map((leg: any) => ({
            origin: leg?.origin,
            destination: leg?.destination,
            departure: leg?.local_departure_date_time,
            arrival: leg?.local_arrival_date_time,
            carrier: leg?.operating_carrier_designator?.carrier,
            flight_number: leg?.operating_carrier_designator?.number,
          })),
        });
      });
    });

    // ترتيب من الأرخص للأغلى
    proposals.sort((a, b) => a.price - b.price);

    return res.status(200).json({
      search_id,
      results_url,
      is_over: results.is_over,
      total: proposals.length,
      flights: proposals.slice(0, 10), // أول 10 نتائج
    });

  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
