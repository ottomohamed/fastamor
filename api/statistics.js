// api/statistics.js
export default async function handler(req, res) {
  // ??????? CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const token = process.env.TRAVELPAYOUTS_TOKEN;
    const { date_from = "2026-04-01", date_to, campaign_id = 100 } = req.body;
    
    if (!token) {
      return res.status(500).json({ error: 'API token not configured' });
    }
    
    const endDate = date_to || new Date().toISOString().split('T')[0];
    
    const requestBody = {
      fields: ["action_id", "sub_id", "price_usd", "paid_profit_usd", "state", "date", "created_at"],
      filters: [
        { field: "date", op: "ge", value: date_from },
        { field: "date", op: "le", value: endDate },
        { field: "campaign_id", op: "eq", value: campaign_id }
      ],
      sort: [{ field: "date", order: "desc" }],
      offset: 0,
      limit: 100
    };
    
    const response = await fetch('https://api.travelpayouts.com/statistics/v1/execute_query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': token
      },
      body: JSON.stringify(requestBody)
    });
    
    const data = await response.json();
    
    let totalProfit = 0;
    let paidBookings = 0;
    
    if (data.results) {
      paidBookings = data.results.filter(r => r.state === 'paid').length;
      totalProfit = data.results
        .filter(r => r.state === 'paid')
        .reduce((sum, r) => sum + (parseFloat(r.paid_profit_usd) || 0), 0);
    }
    
    return res.json({
      success: true,
      stats: {
        total_bookings: data.results?.length || 0,
        paid_bookings: paidBookings,
        total_profit_usd: totalProfit.toFixed(2),
        period: { from: date_from, to: endDate }
      },
      bookings: data.results || []
    });
    
  } catch (error) {
    console.error('Statistics API error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
