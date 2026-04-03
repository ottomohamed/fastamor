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
    return res.status(400).json({ error: 'Missing required fields: search_id, results_url, proposal_id' });
  }

  const userIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || '8.8.8.8';

  try {
    console.log('🔗 Generating booking link:', { search_id, proposal_id });

    // إنشاء رابط الحجز - يتم هذا فقط عند نقر المستخدم على "شراء"
    const clickRes = await fetch(
      `https://${results_url}/searches/${search_id}/clicks/${proposal_id}`,
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
      const errText = await clickRes.text();
      console.error('Failed to get booking link:', clickRes.status, errText);
      return res.status(clickRes.status).json({ 
        error: 'Failed to get booking link', 
        details: errText 
      });
    }

    const data = await clickRes.json();
    
    console.log('✅ Booking link generated successfully');
    
    return res.status(200).json({ 
      success: true,
      url: data.url,
      click_id: data.click_id,
      expire_at: data.expire_at_unix_sec
    });

  } catch (error: any) {
    console.error('❌ Book error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}