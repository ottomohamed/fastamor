// Voice input (speech-to-text) and spoken replies (text-to-speech) using the
// browser's built-in Web Speech API. The engine is isolated here so it can later
// be swapped for a server-side speech service without touching the UI.
import { useCallback, useEffect, useRef, useState } from 'react';

const RECOGNITION_LANG: Record<string, string> = { ar: 'ar-MA', fr: 'fr-FR', en: 'en-US', es: 'es-ES' };
// Voices to try, most preferred first, per language.
const VOICE_LANGS: Record<string, string[]> = {
  ar: ['ar-MA', 'ar-SA', 'ar-EG', 'ar'],
  fr: ['fr-FR', 'fr-CA', 'fr'],
  en: ['en-GB', 'en-US', 'en'],
  es: ['es-ES', 'es-MX', 'es-US', 'es'],
};

type SR = {
  lang: string; interimResults: boolean; continuous: boolean; maxAlternatives: number;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: any) => void) | null; onend: (() => void) | null; onerror: ((e: any) => void) | null;
};

function getRecognitionCtor(): (new () => SR) | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

/** Language of a reply: Arabic script wins, otherwise the page language. */
export function detectTextLang(text: string, fallback: string): string {
  if (/[؀-ۿ]/.test(text)) return 'ar';
  return fallback;
}

/** Remove things that sound bad when read aloud. */
function speakable(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/[*_#`>|]/g, '')
    .replace(/→|←/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useVoice(lang: string, onFinal: (text: string) => void) {
  const Ctor = getRecognitionCtor();
  const canListen = !!Ctor;
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<'denied' | 'nospeech' | null>(null);
  const recRef = useRef<SR | null>(null);
  const finalRef = useRef('');
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  // Some browsers load voices asynchronously.
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (!canSpeak) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener?.('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load);
  }, [canSpeak]);

  // Only speak when the device has a voice for the language; reading Arabic with
  // e.g. a Spanish voice produces gibberish. (Many desktop systems lack Arabic voices.)
  const voiceFor = useCallback(
    (l: string) => {
      const prefs = VOICE_LANGS[l] || [l];
      const norm = (x: string) => x.toLowerCase().replace('_', '-');
      return (
        prefs.map(p => voices.find(v => norm(v.lang) === p.toLowerCase())).find(Boolean) ||
        voices.find(v => norm(v.lang).startsWith(l)) ||
        null
      );
    },
    [voices]
  );
  const hasVoice = canSpeak && !!voiceFor(lang);

  const stopSpeaking = useCallback(() => {
    if (canSpeak) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [canSpeak]);

  const start = useCallback(() => {
    if (!Ctor || listening) return;
    stopSpeaking();
    setError(null);
    finalRef.current = '';
    setInterim('');
    const rec = new Ctor();
    rec.lang = RECOGNITION_LANG[lang] || 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      let fin = '';
      let tmp = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) fin += r[0].transcript;
        else tmp += r[0].transcript;
      }
      if (fin) finalRef.current += fin;
      setInterim((finalRef.current + ' ' + tmp).trim());
    };
    rec.onerror = (e: any) => {
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') setError('denied');
      else if (e?.error === 'no-speech') setError('nospeech');
    };
    rec.onend = () => {
      setListening(false);
      const text = finalRef.current.trim();
      setInterim('');
      if (text) onFinalRef.current(text);
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [Ctor, lang, listening, stopSpeaking]);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const speak = useCallback(
    (text: string, textLang?: string) => {
      if (!canSpeak) return;
      const clean = speakable(text);
      if (!clean) return;
      const l = textLang || detectTextLang(clean, lang);
      const voice = voiceFor(l);
      if (!voice) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = voice.lang;
      u.voice = voice;
      u.rate = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [canSpeak, lang, voiceFor]
  );

  useEffect(() => () => {
    recRef.current?.abort();
    if (canSpeak) window.speechSynthesis.cancel();
  }, [canSpeak]);

  return { canListen, canSpeak: hasVoice, listening, interim, speaking, error, start, stop, speak, stopSpeaking };
}
