import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, Mic, MicOff, Send, Volume2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMyBookings } from '../services/api';
import { Booking } from '../types';
import { translateBookingStatus } from '../i18n/status';

type SpeechRecognitionResult = { transcript: string };
type SpeechRecognitionEvent = { results: ArrayLike<ArrayLike<SpeechRecognitionResult>> };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const copy = {
  en: { title: 'Kisan assistant', languages: 'English · हिंदी · मराठी', close: 'Close assistant', readAloud: 'Read response aloud', send: 'Send question', stop: 'Stop listening', intro: 'Ask me to find your token, check a booking, or start a new booking.', placeholder: 'Type a question…', listen: 'Speak', listening: 'Listening…', unsupported: 'Voice input is not available in this browser. You can type your question instead.', failed: 'I could not hear that clearly. Please try again or type your question.', booking: 'Opening the booking process.', noBooking: 'I could not find a booking yet. Would you like to start one?', bookingFound: (b: Booking, status: string) => `Your latest booking is ${status}. ${b.date ? `It is for ${b.date}` : ''} ${b.timeSlot ? `at ${b.timeSlot}` : ''}.`, token: (b: Booking) => b.digitalToken ? `Your token is ${b.digitalToken}. Keep it ready when you visit the procurement center.` : 'Your latest booking does not have a token yet.', help: 'You can ask: “show my token”, “check my booking”, or “book a slot”.', error: 'I could not load your booking right now. Please try again.',
  },
  hi: { title: 'किसान सहायक', languages: 'English · हिंदी · मराठी', close: 'सहायक बंद करें', readAloud: 'जवाब सुनें', send: 'सवाल भेजें', stop: 'सुनना बंद करें', intro: 'अपना टोकन पूछें, बुकिंग की स्थिति जानें या नई बुकिंग शुरू करें।', placeholder: 'अपना सवाल लिखें…', listen: 'बोलें', listening: 'सुन रहा है…', unsupported: 'इस ब्राउज़र में आवाज़ से सवाल उपलब्ध नहीं है। आप सवाल लिख सकते हैं।', failed: 'आवाज़ साफ़ सुनाई नहीं दी। फिर से बोलें या सवाल लिखें।', booking: 'बुकिंग प्रक्रिया खोल रहा हूँ।', noBooking: 'अभी कोई बुकिंग नहीं मिली। क्या आप नई बुकिंग करना चाहेंगे?', bookingFound: (b: Booking, status: string) => `आपकी नई बुकिंग ${status} है। ${b.date ? `${b.date} को` : ''} ${b.timeSlot ? `${b.timeSlot} बजे` : ''}।`, token: (b: Booking) => b.digitalToken ? `आपका टोकन ${b.digitalToken} है। केंद्र जाते समय इसे तैयार रखें।` : 'आपकी नई बुकिंग का टोकन अभी उपलब्ध नहीं है।', help: 'पूछें: मेरा टोकन दिखाएँ, बुकिंग की स्थिति बताएँ, या स्लॉट बुक करें।', error: 'अभी बुकिंग की जानकारी नहीं मिल सकी। कृपया फिर कोशिश करें।',
  },
  mr: { title: 'किसान सहाय्यक', languages: 'English · हिंदी · मराठी', close: 'सहाय्यक बंद करा', readAloud: 'उत्तर ऐका', send: 'प्रश्न पाठवा', stop: 'ऐकणे थांबवा', intro: 'तुमचा टोकन विचारा, बुकिंगची स्थिती तपासा किंवा नवीन बुकिंग सुरू करा.', placeholder: 'तुमचा प्रश्न लिहा…', listen: 'बोला', listening: 'ऐकत आहे…', unsupported: 'या ब्राउझरमध्ये आवाजाची सुविधा उपलब्ध नाही. तुम्ही प्रश्न टाइप करू शकता.', failed: 'आवाज स्पष्ट ऐकू आला नाही. पुन्हा बोला किंवा प्रश्न टाइप करा.', booking: 'बुकिंग प्रक्रिया उघडत आहे.', noBooking: 'अद्याप बुकिंग सापडले नाही. नवीन बुकिंग सुरू करू का?', bookingFound: (b: Booking, status: string) => `तुमची नवीन बुकिंग ${status} आहे. ${b.date ? `${b.date} रोजी` : ''} ${b.timeSlot ? `${b.timeSlot} वाजता` : ''}.`, token: (b: Booking) => b.digitalToken ? `तुमचा टोकन ${b.digitalToken} आहे. केंद्रात जाताना तो तयार ठेवा.` : 'तुमच्या नवीन बुकिंगचा टोकन अजून उपलब्ध नाही.', help: 'विचारा: माझा टोकन दाखवा, बुकिंग तपासा किंवा स्लॉट बुक करा.', error: 'आत्ता बुकिंगची माहिती मिळाली नाही. पुन्हा प्रयत्न करा.',
  },
};

const voiceLocales: Record<string, string> = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
const SpeechRecognition = typeof window === 'undefined' ? undefined : (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const VoiceAssistant: React.FC = () => {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const lang = (i18n.language || 'en').slice(0, 2) as keyof typeof copy;
  const words = copy[lang] || copy.en;
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ from: 'assistant' | 'farmer'; text: string }[]>([]);
  const recognition = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    window.addEventListener('kisanqueue:open-assistant', openAssistant);
    return () => {
      window.removeEventListener('kisanqueue:open-assistant', openAssistant);
      recognition.current?.stop();
    };
  }, []);

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLocales[lang] || voiceLocales.en;
    window.speechSynthesis.speak(utterance);
  };

  const reply = (text: string) => {
    setMessages((items) => [...items, { from: 'assistant', text }]);
    speak(text);
  };

  const handleQuestion = async (question: string) => {
    const value = question.trim();
    if (!value || busy) return;
    setMessages((items) => [...items, { from: 'farmer', text: value }]);
    setInput('');
    const normalized = value.toLocaleLowerCase();
    const wantsBooking = /book (a |new |my )?(slot|booking)|start booking|new booking|slot book|बुक करें|बुकिंग करें|नई बुकिंग|नवीन बुकिंग|बुकिंग सुरू|नोंदणी करा/.test(normalized);
    if (wantsBooking) {
      reply(words.booking);
      window.setTimeout(() => navigate('/select-location'), 350);
      return;
    }
    const wantsToken = /token|टोकन/.test(normalized);
    const wantsStatus = /status|booking|बुकिंग|स्थिति|स्थिती|टोकन/.test(normalized);
    if (wantsToken || wantsStatus) {
      setBusy(true);
      try {
        const bookings = await getMyBookings();
        const latest = bookings[0];
        if (!latest) reply(words.noBooking);
        else {
          reply(wantsToken ? words.token(latest) : words.bookingFound(latest, translateBookingStatus(latest.status, t)));
          if (wantsToken && latest.digitalToken) window.setTimeout(() => navigate(`/token/${encodeURIComponent(latest.id)}`), 700);
        }
      } catch { reply(words.error); }
      finally { setBusy(false); }
      return;
    }
    reply(words.help);
  };

  const startListening = () => {
    if (!SpeechRecognition) { reply(words.unsupported); return; }
    recognition.current?.stop();
    const current = new SpeechRecognition() as SpeechRecognitionLike;
    recognition.current = current;
    current.lang = voiceLocales[lang] || voiceLocales.en;
    current.continuous = false;
    current.interimResults = false;
    current.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      setListening(false);
      if (transcript) void handleQuestion(transcript);
      else reply(words.failed);
    };
    current.onerror = () => { setListening(false); reply(words.failed); };
    current.onend = () => setListening(false);
    setListening(true);
    try { current.start(); } catch { setListening(false); reply(words.failed); }
  };

  const submit = (event: FormEvent) => { event.preventDefault(); void handleQuestion(input); };

  return (
    <div className="fixed bottom-[5.25rem] right-4 z-50 sm:right-[max(calc((100vw-28rem)/2+1rem),1rem)]">
      {open && <section aria-label={words.title} className="mb-3 flex h-[min(30rem,70vh)] w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl">
        <header className="flex items-center justify-between bg-emerald-800 px-4 py-3 text-white">
          <div className="flex items-center gap-2"><span className="rounded-full bg-white/15 p-2"><Bot className="h-5 w-5" /></span><div><h2 className="font-bold">{words.title}</h2><p className="text-xs text-emerald-100">{words.languages}</p></div></div>
          <button aria-label={words.close} onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/15"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3" aria-live="polite">
          {messages.length === 0 && <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white p-3 text-sm text-slate-700 shadow-sm">{words.intro}</div>}
          {messages.map((message, index) => <div key={`${index}-${message.from}`} className={`max-w-[90%] rounded-2xl p-3 text-sm ${message.from === 'farmer' ? 'ml-auto rounded-tr-sm bg-emerald-700 text-white' : 'rounded-tl-sm bg-white text-slate-700 shadow-sm'}`}>
            {message.text}{message.from === 'assistant' && 'speechSynthesis' in window && <button aria-label={words.readAloud} onClick={() => speak(message.text)} className="ml-2 inline-flex align-middle text-emerald-700"><Volume2 className="h-4 w-4" /></button>}
          </div>)}
          {busy && <p className="text-xs text-slate-500">…</p>}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
          <button type="button" onClick={listening ? () => recognition.current?.stop() : startListening} aria-label={listening ? words.stop : words.listen} className={`rounded-full p-3 ${listening ? 'animate-pulse bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-800'}`}>
            {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder={listening ? words.listening : words.placeholder} aria-label={words.placeholder} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-600" />
          <button type="submit" disabled={!input.trim() || busy} aria-label={words.send} className="rounded-full bg-emerald-700 p-3 text-white disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </form>
      </section>}
      <button onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={words.title} className="ml-auto flex items-center gap-2 rounded-full bg-emerald-800 px-4 py-3 font-bold text-white shadow-lg transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-200">
        {open ? <X className="h-5 w-5" /> : <Mic className="h-5 w-5" />}<span className="text-sm">{words.title}</span>
      </button>
    </div>
  );
};
