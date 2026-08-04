import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, X, Check, Bell, Phone, Video, Send,
  Verified, TrendingUp, Search, Plus
} from "../icons";

function SubHeader({ title, onBack, sub, action }: { title: string; onBack: () => void; sub?: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-center gap-3 px-2 py-3 bg-[#202c33] text-white">
      <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-lg font-medium">{title}</h1>
        {sub && <p className="text-xs text-[#8696a0]">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

// Custom notifications per chat
export function CustomNotifications({
  chatId,
  onBack,
  onPickRingtone,
}: {
  chatId: string;
  onBack: () => void;
  onPickRingtone?: () => void;
}) {
  const { state, dispatch } = useStore();
  const chat = state.chats.find((c) => c.id === chatId);
  const cur = state.customNotifications[chatId] || { tone: "Default", vibration: "Default", popup: false };
  const [enabled, setEnabled] = useState(!!state.customNotifications[chatId]);

  const tones = ["Default", "Note", "Chime", "Pop", "Bubble", "Silent"];
  const vibrations = ["Default", "Short", "Long", "Off"];

  const update = (updates: Partial<typeof cur>) => {
    dispatch({ type: "SET_CUSTOM_NOTIFICATION", chatId, settings: { ...cur, ...updates } });
  };

  if (!chat) return null;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Custom notifications" onBack={onBack} sub={chat.name} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 flex items-center justify-between border-b border-[#222d34]">
          <div>
            <div className="font-medium">Use custom notifications</div>
            <div className="text-xs text-[#8696a0]">Override default settings for this chat</div>
          </div>
          <button
            onClick={() => {
              setEnabled(!enabled);
              if (!enabled) update({});
            }}
            className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? "bg-emerald-500" : "bg-zinc-600"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${enabled ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
        {enabled && (
          <>
            <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Messages</h3>
            <div className="px-4 py-2 text-xs text-[#8696a0]">Notification tone</div>
            <div className="flex gap-2 px-4 mb-2 flex-wrap">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => update({ tone: t })}
                  className={`px-3 py-1 text-sm rounded-full ${cur.tone === t ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            {onPickRingtone && (
              <button onClick={onPickRingtone} className="w-full px-4 py-3 hover:bg-[#202c33] text-left">
                <div className="text-sm font-medium">More tones…</div>
                <div className="text-xs text-[#8696a0]">Browse 11 ringtones</div>
              </button>
            )}
            <div className="px-4 py-2 text-xs text-[#8696a0]">Vibrate</div>
            <div className="flex gap-2 px-4 mb-4 flex-wrap">
              {vibrations.map((v) => (
                <button
                  key={v}
                  onClick={() => update({ vibration: v })}
                  className={`px-3 py-1 text-sm rounded-full ${cur.vibration === v ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="px-4 py-3 flex items-center justify-between border-t border-[#222d34]">
              <div>
                <div className="font-medium">Pop-up notification</div>
                <div className="text-xs text-[#8696a0]">Show banner when message arrives</div>
              </div>
              <button
                onClick={() => update({ popup: !cur.popup })}
                className={`w-11 h-6 rounded-full transition-colors relative ${cur.popup ? "bg-emerald-500" : "bg-zinc-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${cur.popup ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Profile preview popup (peek when long-pressing avatar in chat list)
export function ProfilePeek({
  chat,
  onClose,
  onMessage,
  onCall,
  onVideo,
  onInfo,
}: {
  chat: { id: string; name: string; avatarColor: string; avatarText: string; about?: string; phone?: string; isGroup?: boolean; members?: string[] };
  onClose: () => void;
  onMessage: () => void;
  onCall: () => void;
  onVideo: () => void;
  onInfo: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 animate-fade-in" onClick={onClose}>
      <div className="bg-[#202c33] rounded-2xl overflow-hidden max-w-xs w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Big avatar */}
        <div className={`aspect-square ${chat.avatarColor} flex items-center justify-center text-7xl font-bold text-white`}>
          {chat.avatarText}
        </div>
        <div className="p-4">
          <div className="font-semibold text-lg text-white">{chat.name}</div>
          <div className="text-xs text-[#8696a0]">
            {chat.isGroup ? `${chat.members?.length || 0} members` : (chat.phone || "Hey there!")}
          </div>
          {chat.about && !chat.isGroup && (
            <div className="text-sm text-[#aebac1] mt-2">{chat.about}</div>
          )}
        </div>
        <div className="grid grid-cols-4 border-t border-[#222d34]">
          <button onClick={() => { onClose(); onMessage(); }} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5">
            <Send className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] text-[#aebac1]">Message</span>
          </button>
          <button onClick={() => { onClose(); onCall(); }} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5">
            <Phone className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] text-[#aebac1]">Audio</span>
          </button>
          <button onClick={() => { onClose(); onVideo(); }} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5">
            <Video className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] text-[#aebac1]">Video</span>
          </button>
          <button onClick={() => { onClose(); onInfo(); }} className="py-3 flex flex-col items-center gap-1 hover:bg-white/5">
            <Bell className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] text-[#aebac1]">Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Trending channels (browse all channels)
export function TrendingChannels({
  onBack,
  onOpenChannel,
}: {
  onBack: () => void;
  onOpenChannel: (name: string) => void;
}) {
  const [tab, setTab] = useState<"trending" | "categories">("trending");
  const channels = [
    { name: "Chatsapp", color: "bg-emerald-600", text: "CS", followers: "192M", verified: true, category: "Apps" },
    { name: "Tech News", color: "bg-blue-600", text: "TN", followers: "45M", verified: true, category: "Tech" },
    { name: "Daily Sports", color: "bg-orange-600", text: "DS", followers: "32M", verified: true, category: "Sports" },
    { name: "Music Hub", color: "bg-purple-600", text: "MH", followers: "28M", verified: false, category: "Music" },
    { name: "Foodie", color: "bg-yellow-600", text: "FD", followers: "18M", verified: true, category: "Food" },
    { name: "Travel Diaries", color: "bg-cyan-600", text: "TD", followers: "12M", verified: false, category: "Travel" },
    { name: "Cinema", color: "bg-rose-600", text: "CN", followers: "9M", verified: true, category: "Entertainment" },
    { name: "Wellness", color: "bg-emerald-500", text: "WL", followers: "6M", verified: false, category: "Health" },
  ];

  const categories = [
    { name: "🆕 New", count: 24 },
    { name: "🎵 Music", count: 156 },
    { name: "💼 Business", count: 89 },
    { name: "🎮 Gaming", count: 234 },
    { name: "📚 Education", count: 178 },
    { name: "🍿 Entertainment", count: 312 },
    { name: "🌍 Lifestyle", count: 145 },
    { name: "📺 News", count: 423 },
    { name: "⚽ Sports", count: 267 },
    { name: "💻 Tech", count: 189 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Find channels" onBack={onBack} action={
        <button className="p-2 rounded-full hover:bg-white/10"><Search className="w-5 h-5" /></button>
      } />
      <div className="flex border-b border-[#222d34]">
        <button
          onClick={() => setTab("trending")}
          className={`flex-1 py-3 text-sm font-medium ${tab === "trending" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-[#8696a0]"}`}
        >
          <TrendingUp className="w-4 h-4 inline mr-1" /> Trending
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`flex-1 py-3 text-sm font-medium ${tab === "categories" ? "text-emerald-400 border-b-2 border-emerald-400" : "text-[#8696a0]"}`}
        >
          Categories
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "trending" ? (
          channels.map((ch, i) => (
            <button
              key={ch.name}
              onClick={() => onOpenChannel(ch.name)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
            >
              <div className="text-xs text-[#8696a0] w-6">{i + 1}</div>
              <Avatar color={ch.color} text={ch.text} />
              <div className="flex-1 min-w-0">
                <div className="font-medium flex items-center gap-1">
                  {ch.name}
                  {ch.verified && <Verified className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs text-[#8696a0]">{ch.followers} followers · {ch.category}</div>
              </div>
              <FollowButton />
            </button>
          ))
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className="bg-[#202c33] hover:bg-[#2a3942] rounded-lg p-3 text-left"
              >
                <div className="text-base font-medium">{cat.name}</div>
                <div className="text-xs text-[#8696a0] mt-1">{cat.count} channels</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FollowButton() {
  const [following, setFollowing] = useState(false);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); setFollowing(!following); }}
      className={`text-xs px-3 py-1 rounded-full font-medium ${following ? "bg-[#202c33] text-emerald-400 border border-emerald-400" : "bg-emerald-500 text-[#111b21]"}`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

// "Saved Messages" folder — like Telegram's
export function SavedMessages({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: () => void;
}) {
  const { state } = useStore();
  const selfChat = state.chats.find((c) => c.id === "self");
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Saved messages" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-5xl">📌</span>
        </div>
        <h2 className="text-xl font-semibold mb-2">Saved messages</h2>
        <p className="text-sm text-[#8696a0] mb-6">
          Send messages, photos, links and notes to yourself for safekeeping. Available from any device.
        </p>
        <button
          onClick={onOpen}
          className="bg-emerald-500 text-[#111b21] px-6 py-2 rounded-full font-semibold"
        >
          {selfChat ? "Open chat" : "Start chatting"}
        </button>
      </div>
    </div>
  );
}

// "Chatsapp Updates" official channel from Chatsapp
export function ChatsappUpdates({ onBack }: { onBack: () => void }) {
  const updates = [
    { title: "🎉 New: Schedule messages", body: "You can now schedule messages to be sent at a later time. Find this option in the attach menu.", date: "Today", reactions: 12450 },
    { title: "🔒 End-to-end encrypted backup is here", body: "Add an extra layer of security by encrypting your iCloud backup with a password. Tap to learn more.", date: "Yesterday", reactions: 8932 },
    { title: "✨ Custom AI personas", body: "Meta AI now supports multiple personas — try Chef, Coach, Writer, and more!", date: "2 days ago", reactions: 5621 },
    { title: "📞 Group calls now support 32 people", body: "Bring your whole team or family on one call. End-to-end encrypted.", date: "1 week ago", reactions: 23000 },
    { title: "🎨 Custom chat wallpapers", body: "Set a different wallpaper for each chat. Tap a contact → Chat wallpaper.", date: "2 weeks ago", reactions: 9876 },
  ];
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar color="bg-emerald-600" text="WA" size="sm" />
        <div className="flex-1">
          <div className="font-medium flex items-center gap-1">
            Chatsapp <Verified className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xs text-[#8696a0]">192M followers · Channel</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0b141a]">
        {updates.map((u, i) => (
          <div key={i} className="bg-[#202c33] rounded-lg p-3">
            <div className="font-medium mb-1">{u.title}</div>
            <div className="text-sm text-[#aebac1] mb-2">{u.body}</div>
            <div className="flex items-center gap-3 text-xs text-[#8696a0]">
              <button className="hover:text-emerald-400">👍 {u.reactions.toLocaleString()}</button>
              <span>{u.date}</span>
              <span className="ml-auto">2.{i + 1}M views</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Suppress unused
export const _u = { Plus, Check, X };
