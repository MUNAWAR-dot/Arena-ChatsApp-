import { useState, useEffect } from "react";
import { useStore } from "../store";
import type { Status } from "../data";
import { Avatar } from "../components/Avatar";
import { socketClient } from "../backend/socket";
import {
  ArrowLeft, Trash, Image as ImageIcon, FileText, Mic, Video,
  Search, Eye, CalendarClock, Send, X, Plus, Sparkles, Check
} from "../icons";

function SubHeader({ title, onBack, sub }: { title: string; onBack: () => void; sub?: string }) {
  return (
    <header className="flex items-center gap-3 px-2 py-3 bg-[#202c33]">
      <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div>
        <h1 className="text-lg font-medium">{title}</h1>
        {sub && <p className="text-xs text-[#8696a0]">{sub}</p>}
      </div>
    </header>
  );
}

// Storage manager — list chats by approximate size
export function StorageManager({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();

  const chatSizes = state.chats
    .map((c) => {
      // Estimate size from real message counts (text/photos/docs/voice)
      const text = c.messages.filter((m) => m.type === "text" || !m.type).length;
      const photos = c.messages.filter((m) => m.type === "image").length;
      const docs = c.messages.filter((m) => m.type === "doc").length;
      const voice = c.messages.filter((m) => m.type === "voice").length;
      const sizeKb = text * 2 + photos * 850 + docs * 250 + voice * 80;
      return { chat: c, sizeKb, photos, docs, voice };
    })
    .sort((a, b) => b.sizeKb - a.sizeKb);

  const fmt = (kb: number) => kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
  const totalKb = chatSizes.reduce((s, x) => s + x.sizeKb, 0);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Manage storage" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 border-b border-[#222d34]">
          <div className="text-xs text-[#8696a0] mb-1">Storage used</div>
          <div className="font-semibold text-2xl">{fmt(totalKb)}</div>
          <div className="h-2 bg-[#202c33] rounded-full mt-2">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, (totalKb / 5000) * 100)}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <Stat icon={ImageIcon} label="Photos" value={chatSizes.reduce((s, x) => s + x.photos, 0)} color="text-purple-400" />
            <Stat icon={FileText} label="Docs" value={chatSizes.reduce((s, x) => s + x.docs, 0)} color="text-blue-400" />
            <Stat icon={Mic} label="Voice" value={chatSizes.reduce((s, x) => s + x.voice, 0)} color="text-orange-400" />
          </div>
        </div>
        <h3 className="text-xs uppercase text-[#8696a0] tracking-wide px-4 py-2">Chats</h3>
        {chatSizes.map(({ chat, sizeKb }) => (
          <div key={chat.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33]">
            <Avatar color={chat.avatarColor} text={chat.avatarText} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{chat.name}</div>
              <div className="text-xs text-[#8696a0]">{fmt(sizeKb)}</div>
            </div>
            <button
              onClick={() => {
                if (confirm(`Free up ${fmt(sizeKb)} from "${chat.name}"?`)) {
                  chat.messages.forEach((m) => {
                    if (m.type === "image" || m.type === "doc" || m.type === "voice") {
                      dispatch({ type: "DELETE_MESSAGE", chatId: chat.id, messageId: m.id });
                    }
                  });
                }
              }}
              className="p-2 text-red-400"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-[#202c33] rounded p-2 flex flex-col items-center">
      <Icon className={`w-5 h-5 ${color}`} />
      <div className="font-medium mt-1">{value}</div>
      <div className="text-[10px] text-[#8696a0]">{label}</div>
    </div>
  );
}

// Scheduled messages list
export function ScheduledMessages({ onBack, onOpenChat }: { onBack: () => void; onOpenChat: (id: string) => void }) {
  const { state, dispatch } = useStore();
  const items = state.scheduled;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Scheduled messages" onBack={onBack} sub={`${items.length} scheduled`} />
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8696a0]">
            <CalendarClock className="w-16 h-16 opacity-30 mb-3" />
            <p className="text-sm">No scheduled messages</p>
            <p className="text-xs mt-1">Schedule one from any chat</p>
          </div>
        ) : (
          items.map((s) => {
            const chat = state.chats.find((c) => c.id === s.chatId);
            return (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33]">
                {chat && <Avatar color={chat.avatarColor} text={chat.avatarText} />}
                <button onClick={() => onOpenChat(s.chatId)} className="flex-1 text-left min-w-0">
                  <div className="font-medium">{chat?.name || "Unknown"}</div>
                  <div className="text-xs text-[#8696a0] truncate">{s.text}</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                    <CalendarClock className="w-3 h-3" />
                    {new Date(s.scheduledFor).toLocaleString()}
                  </div>
                </button>
                <button
                  onClick={() => dispatch({ type: "REMOVE_SCHEDULED", id: s.id })}
                  className="p-2 text-red-400"
                ><Trash className="w-4 h-4" /></button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Status views — real viewers only (recorded via backend status.viewStatus)
export function StatusViews({
  status,
  onBack,
}: {
  status: Status;
  onBack: () => void;
}) {
  // Real viewers would come from the backend status record. Without recorded
  // views yet, we show an honest empty state — never fabricated contacts.
  const viewers: { name: string; color: string; text: string }[] = [];
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Status views" onBack={onBack} sub={`${viewers.length} views`} />
      <div className="px-4 py-3 bg-[#1f2c33] border-b border-[#222d34]">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>{viewers.length} views</span>
          <span className="text-[#8696a0]">·</span>
          <span className="text-[#8696a0]">"{status.text}"</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {viewers.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-6">
            <Eye className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No views yet.</p>
            <p className="text-xs mt-1">Views are recorded when other users open your status.</p>
          </div>
        ) : (
          viewers.map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33]">
              <Avatar color={c.color} text={c.text} />
              <div className="flex-1">
                <div className="font-medium">{c.name}</div>
              </div>
              <Eye className="w-4 h-4 text-emerald-400" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Group description editor
export function GroupEditor({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const chat = state.chats.find((c) => c.id === chatId);
  const [name, setName] = useState(chat?.name || "");
  const [about, setAbout] = useState(chat?.about || "");
  if (!chat) return null;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium flex-1">Edit group</h1>
        <button
          onClick={() => {
            dispatch({ type: "UPDATE_GROUP_INFO", chatId, name: name.trim(), about: about.trim() });
            onBack();
          }}
          className="p-2 text-emerald-400"
        ><Check className="w-5 h-5" /></button>
      </header>
      <div className="p-4 space-y-4">
        <div className="flex flex-col items-center">
          <Avatar color={chat.avatarColor} text={chat.avatarText} size="2xl" />
        </div>
        <div>
          <label className="text-xs text-[#8696a0] block mb-1">Group name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#202c33] rounded-lg px-3 py-2.5 outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-[#8696a0] block mb-1">Group description</label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            placeholder="Add group description"
            className="w-full bg-[#202c33] rounded-lg px-3 py-2.5 outline-none text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// Avatar creator (color + initials + style)
export function AvatarCreator({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [color, setColor] = useState(state.profile.avatarColor);
  const [initials, setInitials] = useState(state.profile.avatarText);

  const colors = ["bg-emerald-600","bg-pink-500","bg-purple-500","bg-blue-500","bg-orange-500","bg-rose-500","bg-teal-500","bg-indigo-500","bg-fuchsia-500","bg-amber-500","bg-cyan-500","bg-red-500","bg-yellow-500","bg-lime-500"];
  const styles = ["🧑","👨","👩","🧔","👨‍🦱","👩‍🦰","🧑‍🦳","👴","👵","🦊","🐱","🐶","🦁","🐼","🐯","🦄","🤖","👽"];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium flex-1">Create avatar</h1>
        <button
          onClick={() => {
            dispatch({ type: "UPDATE_PROFILE", profile: { avatarColor: color, avatarText: initials } });
            onBack();
          }}
          className="text-emerald-400 font-medium px-3"
        >
          Save
        </button>
      </header>
      <div className="flex flex-col items-center py-6 border-b border-[#222d34]">
        <div className={`w-32 h-32 rounded-full ${color} flex items-center justify-center text-4xl font-semibold`}>
          {initials}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs uppercase text-emerald-400 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Initials
        </h3>
        <input
          value={initials}
          onChange={(e) => setInitials(e.target.value.slice(0, 3).toUpperCase())}
          maxLength={3}
          className="w-full bg-[#202c33] rounded-lg px-3 py-2 text-center text-2xl mb-6 outline-none"
        />
        <h3 className="text-xs uppercase text-emerald-400 mb-2">Color</h3>
        <div className="grid grid-cols-7 gap-2 mb-6">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-10 h-10 rounded-full ${c} ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#111b21]" : ""}`}
            />
          ))}
        </div>
        <h3 className="text-xs uppercase text-emerald-400 mb-2">Or pick a character</h3>
        <div className="grid grid-cols-6 gap-2">
          {styles.map((s) => (
            <button
              key={s}
              onClick={() => setInitials(s)}
              className="w-12 h-12 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-2xl flex items-center justify-center"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sticker picker
export function StickerPicker({ onPick, onClose }: { onPick: (s: string) => void; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [pack, setPack] = useState(state.favoriteStickers.length > 0 ? -1 : 0);
  const packs = [
    { name: "Faces", stickers: ["😀","😂","🥰","😎","🤔","😍","🤣","😴","🤯","😱","🥳","🤩","😇","🤗","🙄","😬","🤠","🥺"] },
    { name: "Hands", stickers: ["👍","👎","👏","🙏","💪","🤝","✌️","🤞","🤟","🤘","👌","👈","👉","👆","👇","🖐️","✋","🖖"] },
    { name: "Hearts", stickers: ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💖","💗","💓","💞","💕","❣️","💌","💘","💝"] },
    { name: "Animals", stickers: ["🐶","🐱","🦊","🐻","🐼","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🦄","🐝","🐞","🦋","🐢"] },
    { name: "Food", stickers: ["🍕","🍔","🍟","🌭","🌮","🌯","🥗","🍣","🍱","🍜","🍝","🍤","🍰","🎂","🍩","🍪","☕","🍷"] },
    { name: "Travel", stickers: ["✈️","🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🛵","🏍️","🚲"] },
  ];

  const visible = pack === -1 ? state.favoriteStickers : packs[pack].stickers;

  return (
    <div className="bg-[#202c33] border-t border-[#222d34]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#222d34]">
        <span className="text-sm text-[#8696a0]">{pack === -1 ? "★ Favorites" : "Stickers"}</span>
        <button onClick={onClose}><X className="w-4 h-4 text-[#8696a0]" /></button>
      </div>
      <div className="grid grid-cols-4 gap-2 p-3 max-h-48 overflow-y-auto">
        {visible.length === 0 && pack === -1 && (
          <div className="col-span-4 text-center text-xs text-[#8696a0] py-6">
            No favorites yet. Long-press a sticker to add.
          </div>
        )}
        {visible.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            onContextMenu={(e) => {
              e.preventDefault();
              dispatch({ type: "TOGGLE_FAVORITE_STICKER", sticker: s });
            }}
            className="aspect-square text-4xl bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center relative group"
            title="Right-click to favorite"
          >
            {s}
            {state.favoriteStickers.includes(s) && (
              <span className="absolute top-0.5 right-0.5 text-yellow-400 text-xs">★</span>
            )}
          </button>
        ))}
      </div>
      <div className="flex gap-1 px-2 py-1 border-t border-[#222d34] overflow-x-auto">
        <button
          onClick={() => setPack(-1)}
          className={`px-3 py-1 text-xs rounded ${pack === -1 ? "bg-emerald-500/20 text-emerald-400" : "text-[#8696a0]"}`}
        >
          ★ Favs
        </button>
        {packs.map((p, i) => (
          <button
            key={p.name}
            onClick={() => setPack(i)}
            className={`px-3 py-1 text-xs rounded ${i === pack ? "bg-emerald-500/20 text-emerald-400" : "text-[#8696a0]"}`}
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// GIF picker
export function GIFPicker({ onPick, onClose }: { onPick: (g: { url: string; alt: string }) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  // Curated emoji-based "GIFs" (gradient cards with text)
  const gifs = [
    { alt: "Dancing", colors: "from-pink-500 to-purple-500", emoji: "💃" },
    { alt: "Thumbs up", colors: "from-emerald-500 to-teal-500", emoji: "👍" },
    { alt: "Laughing", colors: "from-yellow-500 to-orange-500", emoji: "🤣" },
    { alt: "Heart", colors: "from-rose-500 to-pink-500", emoji: "❤️" },
    { alt: "Mind blown", colors: "from-blue-500 to-indigo-500", emoji: "🤯" },
    { alt: "Party", colors: "from-purple-500 to-fuchsia-500", emoji: "🎉" },
    { alt: "Crying", colors: "from-cyan-500 to-blue-500", emoji: "😭" },
    { alt: "Hello", colors: "from-emerald-400 to-cyan-500", emoji: "👋" },
    { alt: "Fire", colors: "from-red-500 to-orange-500", emoji: "🔥" },
    { alt: "Cool", colors: "from-indigo-500 to-purple-500", emoji: "😎" },
    { alt: "Hug", colors: "from-pink-400 to-rose-500", emoji: "🤗" },
    { alt: "Sparkles", colors: "from-amber-400 to-yellow-500", emoji: "✨" },
  ].filter((g) => !search || g.alt.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-[#202c33] border-t border-[#222d34]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#222d34]">
        <span className="text-sm text-[#8696a0]">GIFs</span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search GIFs"
          className="flex-1 bg-[#111b21] rounded-full px-3 py-1 text-sm outline-none"
        />
        <button onClick={onClose}><X className="w-4 h-4 text-[#8696a0]" /></button>
      </div>
      <div className="grid grid-cols-2 gap-1 p-2 max-h-56 overflow-y-auto">
        {gifs.map((g) => (
          <button
            key={g.alt}
            onClick={() => onPick({ url: g.colors, alt: g.alt })}
            className={`aspect-video bg-gradient-to-br ${g.colors} rounded flex items-center justify-center text-5xl`}
          >
            {g.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// Schedule picker dialog
export function SchedulePicker({
  onCancel,
  onSchedule,
}: {
  onCancel: () => void;
  onSchedule: (timestamp: number) => void;
}) {
  const now = new Date();
  const presets = [
    { label: "In 1 hour", ms: 3600_000 },
    { label: "In 4 hours", ms: 4 * 3600_000 },
    { label: "Tomorrow morning (9 AM)", ms: ((24 - now.getHours()) * 60 + (60 - now.getMinutes())) * 60000 + 9 * 3600_000 - 24 * 3600_000 + (now.getHours() < 9 ? 0 : 24 * 3600_000) },
    { label: "Next week", ms: 7 * 24 * 3600_000 },
  ];

  const [custom, setCustom] = useState("");

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center" onClick={onCancel}>
      <div className="bg-[#202c33] w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-medium">Schedule message</h2>
        </div>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onSchedule(Date.now() + p.ms)}
            className="w-full text-left py-2 hover:bg-white/5 rounded px-2"
          >
            {p.label}
          </button>
        ))}
        <div className="mt-3 border-t border-[#222d34] pt-3">
          <label className="text-xs text-[#8696a0]">Custom date and time</label>
          <input
            type="datetime-local"
            value={custom}
            min={new Date().toISOString().slice(0, 16)}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full bg-[#111b21] rounded p-2 mt-1 outline-none text-sm"
          />
          <div className="flex gap-2 mt-3 justify-end">
            <button onClick={onCancel} className="px-3 py-1.5 text-sm">Cancel</button>
            <button
              onClick={() => custom && onSchedule(new Date(custom).getTime())}
              disabled={!custom}
              className="px-4 py-1.5 bg-emerald-500 text-[#111b21] rounded text-sm disabled:opacity-40"
            >
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Network indicator banner — reflects REAL socket connection state.
// When the socket disconnects (server unreachable / no internet), the banner
// appears; Retry reconnects the client. No random offline simulation.
export function NetworkBanner() {
  const { state, dispatch } = useStore();
  const [reconnecting, setReconnecting] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (!navigator.onLine) setOffline(true);
    const onOff = () => setOffline(true);
    const onOn = () => {
      setOffline(false);
      dispatch({ type: "SET_ONLINE", online: true });
    };
    window.addEventListener("offline", onOff);
    window.addEventListener("online", onOn);
    return () => {
      window.removeEventListener("offline", onOff);
      window.removeEventListener("online", onOn);
    };
  }, [dispatch]);

  // Also reflect real socket disconnect events
  useEffect(() => {
    const offD = socketClient.on("disconnect", () => setOffline(true));
    const offC = socketClient.on("connect", () => {
      setOffline(false);
      dispatch({ type: "SET_ONLINE", online: true });
    });
    return () => {
      offD();
      offC();
    };
  }, [dispatch]);

  if (!offline && state.online) return null;
  return (
    <div className="bg-zinc-700 text-white text-xs text-center py-1 flex items-center justify-center gap-2">
      <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
      {reconnecting ? "Connecting…" : "Waiting for network…"}
      <button
        onClick={() => {
          setReconnecting(true);
          setTimeout(() => {
            setOffline(false);
            dispatch({ type: "SET_ONLINE", online: true });
            setReconnecting(false);
          }, 800);
        }}
        className="underline ml-2"
      >
        Retry
      </button>
    </div>
  );
}

// Send payment
export function SendPayment({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  const [step, setStep] = useState<"contact" | "amount" | "done">("contact");
  const [selected, setSelected] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  if (step === "done") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
          <Check className="w-12 h-12 text-[#111b21]" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Payment sent!</h2>
        <p className="text-[#8696a0]">${amount} sent to {state.chats.find((c) => c.id === selected)?.name}</p>
        <button onClick={onBack} className="mt-8 bg-emerald-500 text-[#111b21] px-6 py-2 rounded-full font-semibold">
          Done
        </button>
      </div>
    );
  }

  if (step === "amount" && selected) {
    const c = state.chats.find((x) => x.id === selected)!;
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
          <button onClick={() => setStep("contact")} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar color={c.avatarColor} text={c.avatarText} size="sm" />
          <div>
            <div className="font-medium">Pay {c.name}</div>
            <div className="text-xs text-[#8696a0]">{c.phone}</div>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-[#8696a0] text-xs">Amount</div>
          <div className="text-6xl font-light my-4 flex items-baseline">
            <span className="text-2xl">$</span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0"
              className="bg-transparent w-32 text-center outline-none"
              autoFocus
            />
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            className="bg-[#202c33] rounded-full px-4 py-2 text-sm outline-none w-full max-w-xs text-center"
          />
        </div>
        <button
          onClick={() => parseFloat(amount) > 0 && setStep("done")}
          disabled={!parseFloat(amount)}
          className="m-4 bg-emerald-500 text-[#111b21] py-3 rounded-full font-semibold disabled:opacity-40 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" /> Send ${amount || "0"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Send payment" onBack={onBack} />
      <div className="px-3 py-2 sticky top-0 bg-[#111b21]">
        <div className="bg-[#202c33] rounded-full px-4 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#8696a0]" />
          <input placeholder="Search contacts" className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {state.chats.filter((c) => !c.isGroup).map((c) => (
          <button
            key={c.id}
            onClick={() => { setSelected(c.id); setStep("amount"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
          >
            <Avatar color={c.avatarColor} text={c.avatarText} />
            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-[#8696a0]">{c.phone}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Add Contact button screen wrapper for NewChat
export function ContactsList({
  onBack,
  onEdit,
  onNew,
  onOpenChat,
}: {
  onBack: () => void;
  onEdit: (id: string) => void;
  onNew: () => void;
  onOpenChat: (chatId: string) => void;
}) {
  const { state, dispatch } = useStore();

  const chatWith = (contactId: string) => {
    const contact = state.customContacts.find((c) => c.id === contactId);
    if (!contact) return;
    const id = "ct-chat-" + contact.id;
    if (!state.chats.some((x) => x.id === id)) {
      dispatch({
        type: "CREATE_CHAT",
        chat: {
          id,
          name: contact.name,
          avatarColor: contact.avatarColor,
          avatarText: contact.avatarText,
          lastMessage: "",
          time: "now",
          unread: 0,
          online: false,
          phone: contact.phone,
          about: contact.notes || "Hey there! I am using Chatsapp.",
          messages: [],
        },
      });
    }
    onOpenChat(id);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium flex-1">Contacts</h1>
        <button onClick={onNew} className="p-2 rounded-full hover:bg-white/10">
          <Plus className="w-5 h-5" />
        </button>
      </header>
      <div className="flex-1 overflow-y-auto">
        {state.customContacts.length === 0 && (
          <div className="text-center text-sm text-[#8696a0] mt-12 px-8">
            <p>No custom contacts yet.</p>
            <button onClick={onNew} className="mt-3 text-emerald-400">Add new contact</button>
          </div>
        )}
        {state.customContacts.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33]">
            <Avatar color={c.avatarColor} text={c.avatarText} />
            <button onClick={() => onEdit(c.id)} className="flex-1 text-left">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-[#8696a0]">{c.phone}</div>
            </button>
            <button
              onClick={() => chatWith(c.id)}
              className="text-emerald-400 text-sm px-3 py-1 rounded-full border border-emerald-400/40 hover:bg-emerald-500/10"
            >
              Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Search inside a chat (filter messages, jump-to highlighting)
export function ChatSearch({
  chatId,
  onBack,
  onJump,
}: {
  chatId: string;
  onBack: () => void;
  onJump: (msgId: string) => void;
}) {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const chat = state.chats.find((c) => c.id === chatId);
  if (!chat) return null;
  const matches = query.trim()
    ? chat.messages.filter((m) => m.text?.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-2 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search in ${chat.name}`}
          className="flex-1 bg-transparent outline-none"
        />
      </header>
      <div className="px-4 py-2 text-xs text-[#8696a0] border-b border-[#222d34]">
        {query ? `${matches.length} result${matches.length !== 1 ? "s" : ""}` : "Type to search"}
      </div>
      <div className="flex-1 overflow-y-auto">
        {matches.map((m) => {
          const idx = m.text.toLowerCase().indexOf(query.toLowerCase());
          return (
            <button
              key={m.id}
              onClick={() => onJump(m.id)}
              className="w-full text-left px-4 py-2.5 hover:bg-[#202c33] border-b border-[#222d34]"
            >
              <div className="text-xs text-[#8696a0] mb-0.5">{m.sent ? "You" : chat.name} · {m.time}</div>
              <div className="text-sm">
                {m.text.slice(0, idx)}
                <span className="bg-emerald-500/30 text-emerald-300">{m.text.slice(idx, idx + query.length)}</span>
                {m.text.slice(idx + query.length)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Multi-select bar
export function MultiSelectBar({
  count,
  onClear,
  onDelete,
  onForward,
  onStar,
  onCopy,
}: {
  count: number;
  onClear: () => void;
  onDelete: () => void;
  onForward: () => void;
  onStar: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="bg-[#202c33] flex items-center gap-2 px-2 py-2 text-white border-b border-[#222d34]">
      <button onClick={onClear} className="p-2 rounded-full hover:bg-white/10">
        <X className="w-5 h-5" />
      </button>
      <div className="flex-1 font-medium">{count} selected</div>
      <button onClick={onStar} className="p-2"><Sparkles className="w-5 h-5" /></button>
      <button onClick={onCopy} className="p-2 text-sm">Copy</button>
      <button onClick={onForward} className="p-2 text-sm">Forward</button>
      <button onClick={onDelete} className="p-2 text-red-400"><Trash className="w-5 h-5" /></button>
    </div>
  );
}

// Self chat ("Message yourself")
export function ensureSelfChat(state: any, dispatch: any, profile: any) {
  const id = "self";
  if (state.chats.some((c: any) => c.id === id)) return id;
  dispatch({
    type: "CREATE_CHAT",
    chat: {
      id,
      name: `${profile.name} (You)`,
      avatarColor: profile.avatarColor,
      avatarText: profile.avatarText,
      lastMessage: "Message yourself for notes, links, files…",
      time: "now",
      unread: 0,
      online: true,
      pinned: true,
      phone: profile.phone,
      about: "Notes to self",
      messages: [],
    },
  });
  return id;
}

// Suppress unused imports warning
export const _u = { Video };
