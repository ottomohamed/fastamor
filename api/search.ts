import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const TOKEN = process.env.TP_API_TOKEN!;
const MARKER = process.env.TP_MARKER!;

// ✅ دالة التوقيع الصحيحة حسب وثائق Aviasales
function generateSignature(token: string, marker: string, params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const values = [token, marker];
  for (const key of sortedKeys) {
    let value = params[key];
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    values.push(String(value));
  }
  return crypto.createHash('md5').update(values.join(':')).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { 
    origin, 
    destination, 
    date, 
    returnDate, 
    passengers = 1, 
    currency = 'USD', 
    locale = 'en',
    trip_class = 'Y'  // Y=Economy, C=Business, F=First
  } = req.body;

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Missing required fields: origin, destination, date' });
  }

  const userIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '8.8.8.8';

  try {
    // بناء directions (يدعم رحلة ذهاب فقط أو ذهاب وعودة)
    const directions: any[] = [
      { origin: origin.toUpperCase(), destination: destination.toUpperCase(), date }
    ];
    
    if (returnDate) {
      directions.push({ 
        origin: destination.toUpperCase(), 
        destination: origin.toUpperCase(), 
        date: returnDate 
      });
    }

    const searchParams = {
      marker: MARKER,
      locale: locale,
      currency_code: currency,
      market_code: 'us',
      search_params: {
        trip_class: trip_class,
        passengers: { 
          adults: Number(passengers), 
          children: 0, 
          infants: 0 
        },
        directions,
      },
    };

    // إنشاء التوقيع
    const signature = generateSignature(TOKEN, MARKER, searchParams);

    console.log('🔍 Starting search:', { origin, destination, date, returnDate });

    // 1. بدء البحث
    const startRes = await fetch('https://tickets-api.travelpayouts.com/search/affiliate/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': 'fastamor.com',
        'x-user-ip': userIp,
        'x-signature': signature,
        'x-affiliate-user-id': TOKEN,
      },
      body: JSON.stringify({ ...searchParams, signature }),
    });

    if (!startRes.ok) {
      const errText = await startRes.text();
      console.error('Start search failed:', startRes.status, errText);
      return res.status(startRes.status).json({ 
        error: 'Search start failed', 
        details: errText,
        status: startRes.status 
      });
    }

    const startData = await startRes.json();
    const { search_id, results_url } = startData;

    if (!search_id) {
      return res.status(400).json({ error: 'No search_id returned', data: startData });
    }

    console.log('✅ Search started:', { search_id, results_url });

    // 2. جلب النتائج (حلقة انتظار حتى تكتمل)
    let isOver = false;
    let lastTimestamp = 0;
    let allTickets: any[] = [];
    let attempts = 0;
    const maxAttempts = 20; // 20 محاولة كحد أقصى (حوالي دقيقة)

    while (!isOver && attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 3000)); // انتظر 3 ثواني بين المحاولات
      attempts++;

      console.log(`📡 Fetching results (attempt ${attempts}/${maxAttempts})...`);

      const resultsRes = await fetch(`https://${results_url}/search/affiliate/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-affiliate-user-id': TOKEN,
        },
        body: JSON.stringify({ 
          search_id, 
          last_update_timestamp: lastTimestamp 
        }),
      });

      if (!resultsRes.ok) {
        console.error('Results fetch failed:', resultsRes.status);
        continue;
      }

      const resultsData = await resultsRes.json();
      lastTimestamp = resultsData.last_update_timestamp || lastTimestamp;
      isOver = resultsData.is_over || false;

      if (resultsData.tickets && resultsData.tickets.length > 0) {
        allTickets = resultsData.tickets;
        console.log(`✈️ Found ${allTickets.length} tickets`);
      }
    }

    // 3. معالجة وتنسيق النتائج
    const formattedFlights: any[] = [];

    for (const ticket of allTickets) {
      for (const proposal of ticket.proposals || []) {
        // البحث عن معلومات الوكالة
        const agent = (resultsData?.agents || []).find((a: any) => a.id === proposal.agent_id);
        
        // استخراج معلومات الرحلات
        const legs: any[] = [];
        for (const segment of ticket.segments || []) {
          for (const flightIndex of segment.flights || []) {
            const leg = resultsData?.flight_legs?.[flightIndex];
            if (leg) {
              legs.push({
                origin: leg.origin,
                destination: leg.destination,
                departure: leg.local_departure_date_time,
                arrival: leg.local_arrival_date_time,
                carrier: leg.operating_carrier_designator?.carrier || leg.operating_carrier_designator,
                flight_number: leg.operating_carrier_designator?.number,
                duration: leg.duration,
              });
            }
          }
        }

        formattedFlights.push({
          id: proposal.id,
          search_id: search_id,
          results_url: results_url,
          price: proposal.price?.amount || 0,
          currency: proposal.price?.currency || currency,
          agent_id: proposal.agent_id,
          agent_name: agent?.label || agent?.gate_name || 'Unknown',
          agent_logo: agent?.id ? `http://img.wway.io/pics/as_gates/${agent.id}@png?exar=1&rs=fit:110:70` : null,
          baggage: proposal.baggage?.count || 0,
          handbags: proposal.handbags?.count || 0,
          trip_class: proposal.trip_class || trip_class,
          legs: legs,
          refundable: proposal.flight_terms?.return_before_flight || false,
          changeable: proposal.flight_terms?.change_before_flight || false,
        });
      }
    }

    // ترتيب حسب السعر (الأرخص أولاً)
    formattedFlights.sort((a, b) => a.price - b.price);

    console.log(`✅ Search complete: ${formattedFlights.length} flights found`);

    return res.status(200).json({
      success: true,
      search_id: search_id,
      results_url: results_url,
      is_over: isOver,
      total: formattedFlights.length,
      flights: formattedFlights.slice(0, 20), // أول 20 نتيجة
    });

  } catch (error: any) {
    console.error('❌ Search error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}