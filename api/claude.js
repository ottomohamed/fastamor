import { applyCors, rateLimited } from './_lib/guard.js';
import { getSystemPrompt } from './_lib/prompt.js';

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_MESSAGES = 20;
const MAX_CHARS_PER_MESSAGE = 2000;
const ALLOWED_LANGS = ['en', 'ar', 'fr', 'es'];

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();
  if (rateLimited(req, { limit: 15, windowMs: 60_000 })) {
    return res.status(429).json({ error: 'Too many requests, please slow down.' });
  }

  const apiKey = process.env.ANTHROPIC_KEY || process.env.VITE_ANTHROPIC_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Assistant not configured' });

  try {
    const body = req.body || {};
    const lang = ALLOWED_LANGS.includes(body.lang) ? body.lang : 'en';
    const service = typeof body.service === 'string' ? body.service.slice(0, 40) : '';

    const messages = (Array.isArray(body.messages) ? body.messages : [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-MAX_MESSAGES)
      .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS_PER_MESSAGE) }));

    if (!messages.length || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'A user message is required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        system: getSystemPrompt(lang, service),
        messages,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('[claude] upstream error', response.status, data?.error?.type);
      return res.status(502).json({ error: 'Assistant temporarily unavailable' });
    }
    return res.status(200).json({ content: data.content });
  } catch (e) {
    console.error('[claude] error', e);
    return res.status(500).json({ error: 'Assistant error' });
  }
}
