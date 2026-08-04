import { useEffect } from "react";
import { Avatar } from "../components/Avatar";
import { Phone, PhoneOff, Video, ChatBubble } from "../icons";

export function IncomingCall({
  name,
  type,
  avatarColor,
  avatarText,
  onAccept,
  onDecline,
}: {
  name: string;
  type: "voice" | "video";
  avatarColor: string;
  avatarText: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  // Auto-decline after 25s if no action
  useEffect(() => {
    const t = setTimeout(onDecline, 25000);
    return () => clearTimeout(t);
  }, [onDecline]);

  return (
    <div className="absolute inset-0 z-[55] flex flex-col text-white theme-keep-white"
      style={{ background: "linear-gradient(160deg, #064e3b 0%, #0b141a 100%)" }}>
      <div className="flex flex-col items-center pt-16">
        <div className="text-xs text-emerald-300">🔒 End-to-end encrypted</div>
        <div className="mt-1 text-sm text-zinc-300">
          Incoming Chatsapp {type} call
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
          <Avatar color={avatarColor} text={avatarText} size="2xl" />
        </div>
        <div className="text-3xl font-light mt-4">{name}</div>
        <div className="text-zinc-300 text-sm">Ringing…</div>
      </div>

      <div className="px-8 pb-12 flex items-center justify-around">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDecline}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
          <span className="text-xs">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDecline}
            className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ChatBubble className="w-6 h-6" />
          </button>
          <span className="text-xs">Message</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAccept}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center"
          >
            {type === "video" ? <Video className="w-7 h-7 text-[#111b21]" /> : <Phone className="w-7 h-7 text-[#111b21]" />}
          </button>
          <span className="text-xs">Accept</span>
        </div>
      </div>
    </div>
  );
}
