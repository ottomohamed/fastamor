export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const apiKey = process.env.VITE_ANTHROPIC_KEY || process.env.ANTHROPIC_KEY;
    const body = req.body || {};
    const messages = body.messages || [];
    
    // استخراج آخر رسالة من المستخدم لاستخدامها في البحث
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || "";
    
    // --- ميزة البحث المجاني عبر DuckDuckGo ---
    let webContext = "";
    if (lastUserMessage) {
      try {
        const searchRes = await fetch(https://api.duckduckgo.com/?q=\&format=json&no_html=1);
        const searchData = await searchRes.json();
        
        if (searchData.AbstractText) {
          webContext = "\n\n[Live Web Info]: " + searchData.AbstractText;
        } else if (searchData.RelatedTopics && searchData.RelatedTopics.length > 0) {
          webContext = "\n\n[Live Web Info]: " + searchData.RelatedTopics[0].Text;
        }
      } catch (searchError) {
        console.error("Search failed, proceeding without web data");
      }
    }

    const enhancedSystem = (body.system || '') + 
      "\nYou are a helpful travel assistant. Use the following web information if relevant: " + 
      webContext + 
      "\nFocus on suggesting affiliate links for hotels/flights naturally to help the user book.";

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: messages,
        system: enhancedSystem
      })
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
