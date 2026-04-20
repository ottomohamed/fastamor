// api/affiliate.js
// Converts any travel URL to a Travelpayouts affiliate link

const TOKEN = process.env.TRAVELPAYOUTS_TOKEN || '48076067aa7fe645d28373eb715a346b';
const MARKER = process.env.TRAVELPAYOUTS_MARKER || '709105';
const TRS = process.env.TRAVELPAYOUTS_TRS || '514622';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { urls } = req.body;
  if (!urls?.length) return res.status(400).json({ error: 'urls array required' });

  try {
    const response = await fetch('https://api.travelpayouts.com/links/v1/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': TOKEN,
      },
      body: JSON.stringify({
        trs: Number(TRS),
        marker: Number(MARKER),
        shorten: true,
        links: urls.slice(0, 10).map(url => ({ url })),
      }),
    });

    const data = await response.json();

    if (data.code === 'success') {
      const converted = data.result.links.map(l => ({
        original: l.url,
        affiliate: l.code === 'success' ? l.partner_url : l.url,
        success: l.code === 'success',
      }));
      return res.json({ success: true, links: converted });
    }

    return res.json({ success: false, error: data });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
