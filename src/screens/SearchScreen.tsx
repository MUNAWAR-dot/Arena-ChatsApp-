import { useState, useMemo, useEffect } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, Search, X } from "../icons";

export function SearchScreen({
  onBack,
  onOpenChat,
}: {
  onBack: () => void;
  onOpenChat: (chatId: string) => void;
}) {
  const { state, dispatch } = useStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 3) {
        dispatch({ type: "ADD_RECENT_SEARCH", query: query.trim() });
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [query, dispatch]);

  const results = useMemo(() => {
    if (!query.trim()) return { chats: [], messages: [] };
    const q = query.toLowerCase();
    const chats = state.chats.filter((c) => c.name.toLowerCase().includes(q));
    const messages: { chat: typeof state.chats[0]; msg: typeof state.chats[0]["messages"][0] }[] = [];
    state.chats.forEach((c) => {
      c.messages.forEach((m) => {
        if (m.text && m.text.toLowerCase().includes(q)) {
          messages.push({ chat: c, msg: m });
        }
      });
    });
    return { chats, messages };
  }, [query, state.chats]);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-2 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="flex-1 bg-transparent outline-none"
        />
      </header>

      <div className="flex-1 overflow-y-auto">
        {!query.trim() && (
          <>
            {state.recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <h3 className="text-xs uppercase text-emerald-400">Recent searches</h3>
                  <button
                    onClick={() => dispatch({ type: "CLEAR_RECENT_SEARCHES" })}
                    className="text-xs text-[#8696a0]"
                  >
                    Clear all
                  </button>
                </div>
                {state.recentSearches.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuery(q)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#202c33] text-left"
                  >
                    <Search className="w-4 h-4 text-[#8696a0]" />
                    <span className="flex-1">{q}</span>
                    <X className="w-4 h-4 text-[#8696a0]" />
                  </button>
                ))}
              </>
            )}
            <div className="px-4 pt-4">
              <h3 className="text-xs uppercase text-emerald-400 mb-2">Browse by type</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "📷 Photos", q: "photo" },
                  { label: "🎵 Voice", q: "voice" },
                  { label: "📄 Documents", q: "doc" },
                  { label: "🔗 Links", q: "http" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setQuery(item.q)}
                    className="bg-[#202c33] hover:bg-[#2a3942] rounded-lg p-3 text-sm text-left"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {state.recentSearches.length === 0 && (
              <div className="text-center text-sm text-[#8696a0] mt-10 px-6">
                <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                Start typing to search messages, chats, or contacts
              </div>
            )}
          </>
        )}

        {results.chats.length > 0 && (
          <>
            <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Chats</h3>
            {results.chats.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenChat(c.id)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#202c33] text-left"
              >
                <Avatar color={c.avatarColor} text={c.avatarText} />
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-[#8696a0] truncate">{c.about}</div>
                </div>
              </button>
            ))}
          </>
        )}

        {results.messages.length > 0 && (
          <>
            <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">
              Messages ({results.messages.length})
            </h3>
            {results.messages.map(({ chat, msg }) => (
              <button
                key={chat.id + ":" + msg.id}
                onClick={() => onOpenChat(chat.id)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#202c33] text-left"
              >
                <Avatar color={chat.avatarColor} text={chat.avatarText} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium truncate">{chat.name}</span>
                    <span className="text-xs text-[#8696a0] shrink-0 ml-2">{msg.time}</span>
                  </div>
                  <div className="text-sm text-[#8696a0] truncate">
                    <Highlight text={msg.text} q={query} />
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {query.trim() && results.chats.length === 0 && results.messages.length === 0 && (
          <div className="text-center text-sm text-[#8696a0] mt-20">
            No results for "{query}"
          </div>
        )}
      </div>
    </div>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-emerald-500/30 text-emerald-300">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}
