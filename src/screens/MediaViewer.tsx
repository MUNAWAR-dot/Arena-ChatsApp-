import { useState } from "react";
import type { Message } from "../data";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, More, Forward, Star, StarFilled, Trash, Download, Image as ImageIcon, FileText } from "../icons";
import { useStore } from "../store";

export function MediaViewer({
  chatId,
  startMessageId,
  onBack,
  onForward,
}: {
  chatId: string;
  startMessageId: string;
  onBack: () => void;
  onForward: (m: Message) => void;
}) {
  const { state, dispatch } = useStore();
  const chat = state.chats.find((c) => c.id === chatId);
  const mediaMsgs = chat?.messages.filter((m) => m.type === "image" || m.type === "video" || m.type === "doc") || [];
  const startIdx = Math.max(0, mediaMsgs.findIndex((m) => m.id === startMessageId));
  const [idx, setIdx] = useState(startIdx);

  if (!chat || mediaMsgs.length === 0) {
    return (
      <div className="absolute inset-0 z-50 bg-black flex items-center justify-center text-white">
        <button onClick={onBack} className="absolute top-4 left-4 p-2"><ArrowLeft className="w-5 h-5" /></button>
        No media
      </div>
    );
  }

  const m = mediaMsgs[idx];
  const isStarred = state.starred.includes(`${chatId}:${m.id}`);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col text-white">
      <header className="flex items-center gap-3 px-3 py-3 bg-black/70">
        <button onClick={onBack} className="p-2"><ArrowLeft className="w-5 h-5" /></button>
        <Avatar color={chat.avatarColor} text={chat.avatarText} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{m.sent ? "You" : chat.name}</div>
          <div className="text-xs text-white/70">{m.time}</div>
        </div>
        <button className="p-2"><More className="w-5 h-5" /></button>
      </header>

      <div className="flex-1 flex items-center justify-center relative">
        {m.type === "image" && m.media && m.media.startsWith("data:") ? (
          <img src={m.media} alt="" className="max-w-full max-h-full object-contain" />
        ) : m.type === "video" && m.media && m.media.startsWith("data:") ? (
          <video src={m.media} controls autoPlay playsInline className="max-w-full max-h-full" />
        ) : m.type === "image" ? (
          <div className="w-full h-full bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 flex items-center justify-center">
            <ImageIcon className="w-32 h-32 text-white/60" />
          </div>
        ) : (
          <div className="bg-zinc-800 rounded-xl p-8 flex flex-col items-center gap-3">
            <FileText className="w-20 h-20 text-emerald-400" />
            <div className="text-lg">{m.media}</div>
            <div className="text-xs text-white/60">2 pages · PDF · 124 KB</div>
            <button className="bg-emerald-500 text-[#111b21] px-4 py-2 rounded-full mt-2 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        )}
        {idx > 0 && (
          <button
            onClick={() => setIdx(idx - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
          >‹</button>
        )}
        {idx < mediaMsgs.length - 1 && (
          <button
            onClick={() => setIdx(idx + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
          >›</button>
        )}
      </div>

      {m.text && (
        <div className="px-4 py-3 bg-black/70 text-sm">{m.text}</div>
      )}

      <div className="flex justify-around py-3 bg-black/70">
        <button
          onClick={() => dispatch({ type: "STAR_MESSAGE", chatId, messageId: m.id })}
          className="p-2"
        >
          {isStarred ? <StarFilled className="w-5 h-5 text-yellow-400" /> : <Star className="w-5 h-5" />}
        </button>
        <button onClick={() => onForward(m)} className="p-2"><Forward className="w-5 h-5" /></button>
        <button className="p-2"><Download className="w-5 h-5" /></button>
        <button
          onClick={() => {
            if (confirm("Delete this media?")) {
              dispatch({ type: "DELETE_MESSAGE", chatId, messageId: m.id });
              if (mediaMsgs.length === 1) onBack();
              else if (idx >= mediaMsgs.length - 1) setIdx(idx - 1);
            }
          }}
          className="p-2"
        >
          <Trash className="w-5 h-5" />
        </button>
      </div>

      {mediaMsgs.length > 1 && (
        <div className="flex gap-1 overflow-x-auto px-2 py-2 bg-black/80">
          {mediaMsgs.map((mm, i) => (
            <button
              key={mm.id}
              onClick={() => setIdx(i)}
              className={`shrink-0 w-12 h-12 rounded ${
                mm.type === "image"
                  ? "bg-gradient-to-br from-purple-500 to-pink-500"
                  : "bg-zinc-700"
              } ${i === idx ? "ring-2 ring-emerald-400" : ""} flex items-center justify-center`}
            >
              {mm.type === "image" ? <ImageIcon className="w-5 h-5 text-white/70" /> : <FileText className="w-5 h-5 text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
