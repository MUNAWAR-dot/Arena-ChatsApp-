import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles, More, Smile } from "../icons";

type AIMsg = { id: string; sent: boolean; text: string; time: string };

const aiResponses: Record<string, string[]> = {
  hello: ["Hi there! I'm Meta AI. How can I help you today? ✨"],
  hi: ["Hello! How can I assist you?"],
  weather: ["I don't have real-time weather data, but you can check your local forecast app!"],
  joke: ["Why don't scientists trust atoms? Because they make up everything! 😄"],
  recipe: ["Here's a quick recipe idea: One-pot pasta — boil pasta with cherry tomatoes, garlic, basil, olive oil, and a splash of cream. 10 minutes!"],
  poem: ["Roses are red, violets are blue,\nMeta AI is here, just for you. 🌹"],
  story: ["Once upon a time, in a digital realm, there lived a curious AI named Meta. Every day it helped people discover new ideas, solve problems, and laugh together..."],
  default: [
    "That's an interesting question! Let me think about that…",
    "Great question! Here's what I think:",
    "I can help with that. Could you tell me more?",
    "Here's a thought on that topic:",
  ],
};

function aiReply(input: string): string {
  const lower = input.toLowerCase();
  for (const key of Object.keys(aiResponses)) {
    if (key !== "default" && lower.includes(key)) {
      return aiResponses[key][0];
    }
  }
  const def = aiResponses.default;
  return def[Math.floor(Math.random() * def.length)] + " " + generatePadding(input);
}

function generatePadding(input: string): string {
  const words = input.split(/\s+/).slice(0, 3).join(" ");
  return `Regarding "${words}", I'd suggest exploring it further. Is there a specific angle you'd like to focus on?`;
}

const suggestions = [
  "Plan a weekend trip 🧳",
  "Write me a poem",
  "Suggest dinner recipes",
  "Tell me a joke",
  "Explain quantum physics",
  "Write a birthday wish",
];

export function MetaAIChat({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<AIMsg[]>([
    {
      id: "intro",
      sent: false,
      text: "Hi! I'm Meta AI ✨ I'm here to help you with anything — from creative writing to answering questions. What's on your mind?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    if (!t) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { id: "u" + Date.now(), sent: true, text: t, time }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: "a" + Date.now(),
          sent: false,
          text: aiReply(t),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1200 + Math.random() * 800);
  };

  return (
    <div className="flex flex-col h-full"
      style={{ background: "linear-gradient(165deg, #1a0e3d 0%, #0b141a 70%)" }}>
      <header className="flex items-center gap-2 px-2 py-2 bg-black/30 text-white">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-medium">Meta AI</div>
          <div className="text-xs text-white/70">{typing ? "typing…" : "AI assistant"}</div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10"><More className="w-5 h-5" /></button>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="text-center my-2">
          <span className="bg-black/40 text-white/70 text-xs px-3 py-1 rounded-md inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Meta AI · Powered by Llama
          </span>
        </div>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sent ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                m.sent
                  ? "bg-emerald-600 text-white rounded-tr-none"
                  : "bg-white/10 backdrop-blur text-white rounded-tl-none"
              }`}
            >
              {!m.sent && (
                <div className="flex items-center gap-1 text-xs text-purple-300 mb-1">
                  <Sparkles className="w-3 h-3" /> Meta AI
                </div>
              )}
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className="text-[10px] text-white/50 mt-1 text-right">{m.time}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {messages.length <= 1 && (
        <div className="px-3 pb-2">
          <div className="text-xs text-white/60 mb-2">Try asking…</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded-full whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 p-2 bg-black/30">
        <div className="flex-1 bg-white/10 backdrop-blur rounded-3xl flex items-end px-3 py-1.5 gap-2">
          <Smile className="w-5 h-5 text-white/60 mt-2" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Ask Meta AI…"
            className="flex-1 bg-transparent outline-none text-white text-sm resize-none py-1.5 max-h-24 placeholder:text-white/50"
          />
        </div>
        <button
          onClick={() => send()}
          disabled={!input.trim()}
          className="bg-gradient-to-br from-purple-500 to-pink-500 disabled:opacity-50 text-white rounded-full w-11 h-11 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
