import { useState, useCallback, useRef } from 'react';
import { trackSearch } from '@/lib/tracking';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export type AffiliateLink = {
  name: string;
  desc: string;
  url: string;
  icon: string;
};

export function useFastamorChat(service: string, lang: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchAnim, setShowSearchAnim] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [dynamicLinks, setDynamicLinks] = useState<AffiliateLink[]>([]);

  // useRef to always have the latest messages without stale closure issues
  const messagesRef = useRef<Message[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return;

    const newMsg: Message = { role: 'user', content };
    const updatedHistory = [...messagesRef.current, newMsg];
    messagesRef.current = updatedHistory;
    setMessages([...updatedHistory]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedHistory, service, lang })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const replyText: string = data.content || '';
      const links: AffiliateLink[] = data.affiliateLinks || [];
      const shouldSearch: boolean = data.shouldSearch || false;

      if (!replyText) throw new Error('Empty response');

      const withReply = [...updatedHistory, { role: 'assistant' as const, content: replyText }];
      messagesRef.current = withReply;
      setMessages([...withReply]);
      setIsTyping(false);

      if (shouldSearch) {
        setShowSearchAnim(true);
        setTimeout(() => {
          setShowSearchAnim(false);
          setHasResults(true);
          if (links.length > 0) setDynamicLinks(links);
          trackSearch();
        }, 3000);
      }
    } catch (err) {
      const fallbacks: Record<string, string> = {
        en: "Sorry, I'm having trouble connecting. Please try again. 🔄",
        ar: "عذراً، أواجه مشكلة في الاتصال. يرجى المحاولة مجدداً. 🔄",
        fr: "Désolé, problème de connexion. Veuillez réessayer. 🔄",
        es: "Lo siento, problema de conexión. Inténtalo de nuevo. 🔄"
      };
      const errMsg = fallbacks[lang] || fallbacks.en;
      const withErr = [...updatedHistory, { role: 'assistant' as const, content: errMsg }];
      messagesRef.current = withErr;
      setMessages([...withErr]);
      setIsTyping(false);
    }
  }, [isTyping, service, lang]);

  const clearChat = useCallback((greeting?: string) => {
    const initial: Message[] = greeting ? [{ role: 'assistant', content: greeting }] : [];
    messagesRef.current = initial;
    setMessages([...initial]);
    setHasResults(false);
    setShowSearchAnim(false);
    setDynamicLinks([]);
  }, []);

  return { messages, isTyping, showSearchAnim, hasResults, dynamicLinks, sendMessage, clearChat };
}

export function detectService(text: string): string {
  const l = text.toLowerCase();
  if (/train|قطار|tren|zug/.test(l)) return "train";
  if (/bus|coach|حافلة|باص|autobus/.test(l)) return "bus";
  if (/hotel|stay|hostel|فندق|إقامة|alojamiento/.test(l)) return "hotel";
  if (/taxi|transfer|car|تاكسي|سيارة|coche/.test(l)) return "taxi";
  if (/tour|experience|activity|جولة|تجربة|actividad/.test(l)) return "experience";
  return "flight";
}
