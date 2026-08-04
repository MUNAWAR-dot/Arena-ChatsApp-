import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, Search, Forward as ForwardIcon } from "../icons";
import type { Message } from "../data";

export function ForwardScreen({
  message,
  onBack,
  onForwarded,
  onForwardToStatus,
}: {
  message: Message;
  onBack: () => void;
  onForwarded: () => void;
  onForwardToStatus?: (text: string) => void;
}) {
  const { state, dispatch } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const chats = state.chats.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const send = () => {
    selected.forEach((cid) => {
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      dispatch({
        type: "SEND_MESSAGE",
        chatId: cid,
        message: {
          ...message,
          id: "f" + Date.now() + Math.random(),
          time,
          sent: true,
          status: "sent",
          forwarded: true,
          forwardCount: (message.forwardCount || 0) + 1,
          reply: undefined, // forwarded msgs don't carry reply context
          reactions: [],
          pinned: false,
        },
      });
    });
    onForwarded();
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="font-medium">Forward to</div>
          <div className="text-xs text-[#8696a0]">{selected.length} selected</div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10"><Search className="w-5 h-5" /></button>
      </header>
      <div className="px-3 pb-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full bg-[#202c33] rounded-full px-4 py-2 text-sm outline-none placeholder:text-[#8696a0]"
        />
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        {message.text && onForwardToStatus && (
          <button
            onClick={() => onForwardToStatus(message.text)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left border-b border-[#222d34]"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-2xl">
              ◯
            </div>
            <div className="flex-1">
              <div className="font-medium">My status</div>
              <div className="text-xs text-[#8696a0]">Share to status</div>
            </div>
          </button>
        )}
        {chats.map((c) => {
          const isSel = selected.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
            >
              <div className="relative">
                <Avatar color={c.avatarColor} text={c.avatarText} />
                {isSel && (
                  <span className="absolute bottom-0 right-0 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#111b21] text-[#111b21] text-xs">✓</span>
                )}
              </div>
              <div className="font-medium">{c.name}</div>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <button
          onClick={send}
          className="absolute bottom-6 right-4 bg-emerald-500 text-[#111b21] rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
        >
          <ForwardIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
