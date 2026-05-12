import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { matcherApi } from '../api/matcher.api.js';

const SUGGESTIONS = [
  'Can I donate? I donated 60 days ago.',
  'Am I eligible at age 17?',
  'I had a tattoo last month — can I donate?',
  'How often can I donate blood?',
];

export default function EligibilityChat() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hi! I'm JEEVANLINK's eligibility assistant. Ask me anything about whether you can donate blood — age, gap between donations, recent illness, etc.",
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (text) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: value }]);
    setBusy(true);
    try {
      const res = await matcherApi.chat(value);
      setMessages((m) => [...m, { role: 'bot', text: res.response }]);
    } catch (e) {
      toast.error('AI unavailable. Please try again.');
      setMessages((m) => [
        ...m,
        { role: 'bot', text: 'Sorry, I could not reach the AI right now. Please consult your nearest blood bank.' },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Eligibility Assistant</h1>
          <p className="text-sm text-ink-500">AI-powered. Ask freely about donating blood.</p>
        </div>
      </div>

      <div className="card-elev overflow-hidden">
        <div className="h-[60vh] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-brand-50/30">
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}
          {busy && <BotTyping />}
          <div ref={endRef} />
        </div>

        <div className="border-t border-ink-200 p-4 bg-white">
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full bg-ink-100 hover:bg-ink-200 text-ink-700 text-xs font-medium px-3 py-1.5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-end gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="input"
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-primary">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }) {
  const isBot = msg.role === 'bot';
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div
        className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isBot
            ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
            : 'bg-ink-200 text-ink-700'
        }`}
      >
        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isBot
            ? 'bg-white border border-ink-200 text-ink-800 rounded-tl-sm'
            : 'bg-brand-600 text-white rounded-tr-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{msg.text}</p>
      </div>
    </div>
  );
}

function BotTyping() {
  return (
    <div className="flex gap-3">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-white border border-ink-200 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
        <span className="h-2 w-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 bg-ink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
