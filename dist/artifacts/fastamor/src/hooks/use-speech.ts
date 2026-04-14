import { useState, useCallback, useEffect } from 'react';

export function useSpeech(lang: string = 'en') {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = false;
      rec.interimResults = false;
      setRecognition(rec);
    } else {
      setSupported(false);
    }
  }, []);

  const listen = useCallback((onResult: (text: string) => void) => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    const langMap: Record<string, string> = { 'en': 'en-US', 'ar': 'ar-SA', 'fr': 'fr-FR', 'es': 'es-ES' };
    recognition.lang = langMap[lang] || 'en-US';
    
    recognition.onresult = (e: any) => {
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
      }
      if (final) onResult(final);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    setIsListening(true);
    recognition.start();
  }, [recognition, isListening, lang]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    const clean = text.replace(/[<>&\[\]]/g, " ").replace(/\s+/g, " ").trim();
    if (!clean || clean.length < 3) return;
    
    const utt = new SpeechSynthesisUtterance(clean);
    const langMap: Record<string, string> = { 'en': 'en-US', 'ar': 'ar-SA', 'fr': 'fr-FR', 'es': 'es-ES' };
    utt.lang = langMap[lang] || 'en-US';
    window.speechSynthesis.speak(utt);
  }, [lang]);

  const cancelSpeech = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  return { isListening, supported, listen, speak, cancelSpeech };
}
