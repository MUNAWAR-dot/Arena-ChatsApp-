import { useEffect, useState } from "react";
import type { Status } from "../data";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { X, More, Smile, Send, Eye } from "../icons";

export function StatusViewer({
  status,
  onClose,
  onViews,
  isMine,
  onNext,
}: {
  status: Status;
  onClose: () => void;
  onViews?: () => void;
  isMine?: boolean;
  onNext?: () => void;
}) {
  const { state, dispatch } = useStore();
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [sentToast, setSentToast] = useState(false);

  useEffect(() => {
    dispatch({ type: "VIEW_STATUS", statusId: status.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-advance progress, then go next
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          onNext?.();
          return 0;
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(id);
  }, [paused, onNext]);

  const sendReply = (text: string) => {
    if (!text.trim()) return;
    const chat = state.chats.find((c) => c.name === status.name);
    if (chat) {
      const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      dispatch({
        type: "SEND_MESSAGE",
        chatId: chat.id,
        message: {
          id: "sr" + Date.now(),
          text: text,
          time,
          sent: true,
          status: "sent",
          reply: { name: status.name, text: `Status: ${status.text}` },
        },
      });
    }
    setReply("");
    setSentToast(true);
    setTimeout(() => setSentToast(false), 1500);
  };

  // Tap anywhere on the screen advances to next status
  const handleTap = () => {
    onNext?.();
  };

  const isPhoto = status.text === "📷" || status.bgColor.includes("photo") || (status as any).isPhoto;

  return (
    <div
      className={`absolute inset-0 z-50 flex flex-col ${status.bgColor} text-white theme-keep-white`}
      onMouseDown={() => setPaused(true)}
      onMouseUp={() => setPaused(false)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onClick={handleTap}
    >
      <div className="px-3 pt-2" onClick={(e) => e.stopPropagation()}>
        <div className="h-0.5 bg-white/30 rounded">
          <div className="h-full bg-white rounded transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Avatar color={status.avatarColor} text={status.avatarText} size="sm" />
          <div className="flex-1">
            <div className="font-medium text-sm">{status.name}</div>
            <div className="text-xs opacity-80">{status.time}</div>
          </div>
          <button className="p-2"><More className="w-5 h-5" /></button>
          <button onClick={onClose} className="p-2"><X className="w-5 h-5" /></button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-6 relative"
        onClick={handleTap}
      >
        {isPhoto ? (
          <div className="w-full max-w-xs aspect-[3/4] rounded-xl bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 flex items-center justify-center relative">
            <span className="text-7xl">🖼️</span>
            <span className="absolute bottom-3 text-sm font-medium px-4 text-center">{status.text === "📷" ? "" : status.text}</span>
          </div>
        ) : (
          <div className="text-3xl font-medium text-center">{status.text}</div>
        )}
      </div>

      {isMine && onViews && (
        <button
          onClick={(e) => { e.stopPropagation(); onViews(); }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="mx-3 mb-2 bg-black/50 backdrop-blur rounded-full px-4 py-2 flex items-center justify-center gap-2 text-sm"
        >
          <Eye className="w-4 h-4" /> View status views
        </button>
      )}

      <div className="p-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 bg-white/20 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2">
          <Smile className="w-5 h-5" />
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendReply(reply); }}
            placeholder="Reply"
            className="flex-1 bg-transparent outline-none placeholder:text-white/70 text-sm"
          />
        </div>
        <button
          onClick={() => sendReply(reply)}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
      {sentToast && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-sm" onClick={(e) => e.stopPropagation()}>
          Reply sent
        </div>
      )}
    </div>
  );
}
