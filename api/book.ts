import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN = process.env.TP_API_TOKEN!;
const MARKER = process.env.TP_MARKER!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { search_id, results_url, proposal_id } = req.body;

  if (!search_id || !results_url || !proposal_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const userIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '1.1.1.1';

  try {
    const clickRes = await fetch(
      `${results_url}/searches/${search_id}/clicks/${proposal_id}`,
      {
        method: 'GET',
        headers: {
          'x-real-host': 'fastamor.com',
          'x-user-ip': userIp,
          'x-affiliate-user-id': TOKEN,
          'marker': MARKER,
        },
      }
    );

    if (!clickRes.ok) {
      const err = await clickRes.text();
      return res.status(clickRes.status).json({ error: 'Failed to get booking link', details: err });
    }

    const data = await clickRes.json();
    return res.status(200).json({ url: data.url });

  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
