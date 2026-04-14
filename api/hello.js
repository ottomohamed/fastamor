// api/hello.js
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    message: 'Hello from Vercel API!', 
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
