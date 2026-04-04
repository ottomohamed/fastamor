import { useState, useCallback, useRef } from 'react';

const LANG_MAP: Record<string, string[]> = {
  'ar': ['ar-MA', 'ar-SA', 'ar-EG', 'ar'],  // المغرب أولاً ثم السعودية
  'en': ['en-US', 'en-GB'],
  'fr': ['fr-FR', 'fr-MA'],
  'es': ['es-ES', 'es-MX'],
};

export function useSpeech(lang: string = 'en') {
  const [isListening, setIsListening] = useState(false);
  const [supported] = useState(() => {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  });
  const recognitionRef = useRef<any>(null);

  const listen = useCallback((onResult: (text: string) => void) => {
    if (!supported) {
      alert('Voice recognition not supported in this browser. Try Chrome.');
      return;
    }

    // إيقاف إذا كان يستمع
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    // إنشاء recognition جديد في كل مرة مع اللغة الصحيحة
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SR();

    const langs = LANG_MAP[lang] || LANG_MAP['en'];
    rec.lang = langs[0]; // اللغة الأساسية
    rec.continuous = false;
    rec.interimResults = true; // نتائج مؤقتة لتحسين الدقة
    rec.maxAlternatives = 3; // أكثر من خيار للدقة

    rec.onresult = (e: any) => {
      let final = '';
      let interim = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          // خذ أفضل نتيجة
          final += e.results[i][0].transcript;
        } else {
          interim += e.results[i][0].transcript;
        }
      }

      const result = final || interim;
      if (result.trim()) {
        onResult(result.trim());
        setIsListening(false);
        rec.stop();
      }
    };

    rec.onerror = (e: any) => {
      console.error('Speech error:', e.error);
      setIsListening(false);
      
      // إذا فشل بسبب اللغة جرب اللغة التالية
      if (e.error === 'language-not-supported' && langs.length > 1) {
        const fallbackRec = new SR();
        fallbackRec.lang = langs[1];
        fallbackRec.continuous = false;
        fallbackRec.interimResults = false;
        fallbackRec.onresult = (e2: any) => {
          let text = '';
          for (let i = e2.resultIndex; i < e2.results.length; i++) {
            if (e2.results[i].isFinal) text += e2.results[i][0].transcript;
          }
          if (text) onResult(text.trim());
          setIsListening(false);
        };
        fallbackRec.onerror = () => setIsListening(false);
        fallbackRec.onend = () => setIsListening(false);
        try { fallbackRec.start(); setIsListening(true); } catch {}
      }
    };

    rec.onend = () => setIsListening(false);

    recognitionRef.current = rec;

    try {
      rec.start();
      setIsListening(true);
    } catch (e) {
      setIsListening(false);
    }
  }, [supported, isListening, lang]);

  // Text to Speech محسّن
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const clean = text
      .replace(/[<>&\[\]#*]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean || clean.length < 3) return;

    const utt = new SpeechSynthesisUtterance(clean);
    const langs = LANG_MAP[lang] || LANG_MAP['en'];
    utt.lang = langs[0];
    utt.rate = 0.9;
    utt.pitch = 1;
    utt.volume = 1;

    // اختر أفضل صوت متاح
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      langs.some(l => v.lang.startsWith(l.split('-')[0]))
    );
    if (preferredVoice) utt.voice = preferredVoice;

    window.speechSynthesis.speak(utt);
  }, [lang]);

  const cancelSpeech = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  return { isListening, supported, listen, speak, cancelSpeech };
}
