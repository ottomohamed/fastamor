import type { VercelRequest, VercelResponse } from '@vercel/node';

// قاعدة بيانات المدن المبسطة
const CITIES_DB: Record<string, { ar: string[]; en: string[]; code: string }> = {
  'CMN': { ar: ['الدار البيضاء', 'كازابلانكا'], en: ['casablanca'], code: 'CMN' },
  'RAK': { ar: ['مراكش'], en: ['marrakech'], code: 'RAK' },
  'TNG': { ar: ['طنجة'], en: ['tangier', 'tanger'], code: 'TNG' },
  'MAD': { ar: ['مدريد'], en: ['madrid'], code: 'MAD' },
  'BCN': { ar: ['برشلونة'], en: ['barcelona'], code: 'BCN' },
  'CDG': { ar: ['باريس'], en: ['paris'], code: 'CDG' },
  'DXB': { ar: ['دبي'], en: ['dubai'], code: 'DXB' },
  'LHR': { ar: ['لندن'], en: ['london'], code: 'LHR' },
  'RUH': { ar: ['الرياض'], en: ['riyadh'], code: 'RUH' },
  'CAI': { ar: ['القاهرة'], en: ['cairo'], code: 'CAI' },
  'JFK': { ar: ['نيويورك'], en: ['new york'], code: 'JFK' },
  'IST': { ar: ['اسطنبول'], en: ['istanbul'], code: 'IST' },
  'SVQ': { ar: ['اشبيلية', 'إشبيلية'], en: ['seville', 'sevilla'], code: 'SVQ' },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const { name, lang = 'ar' } = req.query;
  
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'City name required' });
  }
  
  const lowerName = name.toLowerCase().trim();
  
  // البحث في قاعدة البيانات
  for (const [code, city] of Object.entries(CITIES_DB)) {
    const searchTerms = [...(city[lang as keyof typeof city] || []), ...city.en];
    for (const term of searchTerms) {
      if (lowerName.includes(term.toLowerCase())) {
        return res.json({ 
          success: true, 
          city: { code, name: city.en[0], country_code: '' }
        });
      }
    }
  }
  
  return res.json({ success: false, city: null });
}
