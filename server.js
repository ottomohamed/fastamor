import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const TOKEN = process.env.TP_API_TOKEN || process.env.AVIASALES_TOKEN;
const MARKER = process.env.TP_MARKER || process.env.AVIASALES_MARKER;

function generateSignature(token, marker, params) {
  const sortedKeys = Object.keys(params).sort();
  const values = [token, marker];
  for (const key of sortedKeys) {
    let value = params[key];
    if (typeof value === 'object') value = JSON.stringify(value);
    values.push(String(value));
  }
  return crypto.createHash('md5').update(values.join(':')).digest('hex');
}

// Cheap API
app.get('/api/cheap', async (req, res) => {
  try {
    const { origin, destination, currency = 'USD', limit = 10, month } = req.query;
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Missing: origin, destination' });
    }
    
    let departureDate = month;
    if (!departureDate) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      departureDate = date.toISOString().split('T')[0].slice(0, 7);
    }
    
    const url = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
    const params = new URLSearchParams({
      origin: origin.toString().toUpperCase(),
      destination: destination.toString().toUpperCase(),
      departure_at: departureDate,
      currency: currency.toString().toLowerCase(),
      sorting: 'price',
      limit: limit.toString(),
      token: TOKEN,
    });
    
    const response = await fetch(url + '?' + params);
    const data = await response.json();
    
    if (!data.success || !data.data || data.data.length === 0) {
      return res.status(200).json({ success: true, flights: [] });
    }
    
    const flights = data.data.map(function(flight) {
      return {
        id: flight.airline + '_' + flight.flight_number + '_' + flight.departure_at,
        airline: flight.airline,
        airline_logo: 'http://img.wway.io/pics/root/' + flight.airline + '@png?exar=1&rs=fit:80:40',
        flight_number: flight.flight_number,
        origin: flight.origin || origin.toString().toUpperCase(),
        destination: flight.destination || destination.toString().toUpperCase(),
        departure_at: flight.departure_at,
        duration: Math.floor(flight.duration_to / 60) + 'h ' + (flight.duration_to % 60) + 'm',
        stops: flight.transfers === 0 ? 'Direct' : (flight.transfers === 1 ? '1 stop' : flight.transfers + ' stops'),
        price: flight.price,
        currency: currency.toString().toUpperCase(),
        booking_url: 'https://www.aviasales.com' + flight.link + '&marker=' + MARKER,
      };
    });
    
    flights.sort(function(a, b) { return a.price - b.price; });
    res.json({ success: true, flights: flights, total: flights.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Flights API
app.post('/api/flights', async (req, res) => {
  try {
    const { origin, destination, date, returnDate, currency = 'USD' } = req.body;
    if (!origin || !destination || !date) {
      return res.status(400).json({ error: 'Missing: origin, destination, date' });
    }
    
    let url = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates?';
    url = url + 'origin=' + origin.toUpperCase();
    url = url + '&destination=' + destination.toUpperCase();
    url = url + '&departure_at=' + date;
    url = url + '&currency=' + currency.toLowerCase();
    url = url + '&sorting=price';
    url = url + '&limit=20';
    url = url + '&token=' + TOKEN;
    
    if (returnDate) url = url + '&return_at=' + returnDate;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.success || !data.data || data.data.length === 0) {
      return res.status(200).json({ flights: [] });
    }
    
    const flights = data.data.map(function(flight) {
      return {
        id: flight.airline + '_' + flight.flight_number + '_' + flight.departure_at,
        airline: flight.airline,
        airline_logo: 'http://img.wway.io/pics/root/' + flight.airline + '@png?exar=1&rs=fit:80:40',
        origin: flight.origin || origin.toUpperCase(),
        destination: flight.destination || destination.toUpperCase(),
        departure_at: flight.departure_at,
        duration: Math.floor(flight.duration_to / 60) + 'h ' + (flight.duration_to % 60) + 'm',
        stops: flight.transfers === 0 ? 'Direct' : (flight.transfers === 1 ? '1 stop' : flight.transfers + ' stops'),
        price: flight.price,
        currency: currency.toUpperCase(),
        booking_url: 'https://www.aviasales.com' + flight.link + '&marker=' + MARKER,
      };
    });
    
    flights.sort(function(a, b) { return a.price - b.price; });
    res.json({ flights: flights, total: flights.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search API
app.post('/api/search', async (req, res) => {
  try {
    const { origin, destination, date, returnDate, passengers = 1, currency = 'USD', locale = 'en' } = req.body;
    if (!origin || !destination || !date) {
      return res.status(400).json({ error: 'Missing: origin, destination, date' });
    }
    
    const userIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : '8.8.8.8';
    const directions = [{ origin: origin.toUpperCase(), destination: destination.toUpperCase(), date: date }];
    if (returnDate) {
      directions.push({ origin: destination.toUpperCase(), destination: origin.toUpperCase(), date: returnDate });
    }
    
    const searchParams = {
      marker: MARKER,
      locale: locale,
      currency_code: currency,
      market_code: 'us',
      search_params: {
        trip_class: 'Y',
        passengers: { adults: Number(passengers), children: 0, infants: 0 },
        directions: directions,
      },
    };
    
    const signature = generateSignature(TOKEN, MARKER, searchParams);
    
    const startRes = await fetch('https://tickets-api.travelpayouts.com/search/affiliate/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-real-host': 'fastamor.com',
        'x-user-ip': userIp,
        'x-signature': signature,
        'x-affiliate-user-id': TOKEN,
      },
      body: JSON.stringify({ ...searchParams, signature: signature }),
    });
    
    if (!startRes.ok) {
      const err = await startRes.text();
      return res.status(startRes.status).json({ error: 'Search start failed', details: err });
    }
    
    const startData = await startRes.json();
    res.json({ success: true, search_id: startData.search_id, results_url: startData.results_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Book API
app.post('/api/book', async (req, res) => {
  try {
    const { search_id, results_url, proposal_id } = req.body;
    if (!search_id || !results_url || !proposal_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const userIp = req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0] : '8.8.8.8';
    
    const clickRes = await fetch('https://' + results_url + '/searches/' + search_id + '/clicks/' + proposal_id, {
      method: 'GET',
      headers: {
        'x-real-host': 'fastamor.com',
        'x-user-ip': userIp,
        'x-affiliate-user-id': TOKEN,
        'marker': MARKER,
      },
    });
    
    if (!clickRes.ok) {
      return res.status(clickRes.status).json({ error: 'Failed to get booking link' });
    }
    
    const data = await clickRes.json();
    res.json({ url: data.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, lang } = req.body;
    const apiKey = process.env.ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not set' });
    }
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: 'You are a travel assistant. Respond in ' + (lang || 'en') + '. Keep answers short.',
        messages: messages,
      }),
    });
    
    const data = await response.json();
    const replyText = data.content && data.content[0] ? data.content[0].text : 'No response';
    res.json({ reply: replyText });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, function() {
  console.log(' Server running on port ' + PORT);
  console.log('   GET  /api/cheap');
  console.log('   POST /api/flights');
  console.log('   POST /api/search');
  console.log('   POST /api/book');
  console.log('   POST /api/chat');
  console.log('   GET  /api/health');
});
