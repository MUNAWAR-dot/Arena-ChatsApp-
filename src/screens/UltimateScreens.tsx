import { useState } from "react";
import { useStore } from "../store";
import {
  ArrowLeft, X, Check, Plus, Trash, Send,
  Sticker, Search, ChevronRight, Clock, AlertTriangle,
  CalendarClock, Camera, Image as ImageIcon, Megaphone,
  Crown, Shield, FileText, Bell, Volume
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

// Sticker store — browse sticker packs
const STICKER_PACKS = [
  { id: "faces", name: "Faces", desc: "Classic emoji faces", emoji: "😀", count: 24, by: "Chatsapp" },
  { id: "hands", name: "Hands", desc: "Gestures and reactions", emoji: "👋", count: 18, by: "Chatsapp" },
  { id: "hearts", name: "Hearts", desc: "Love and affection", emoji: "❤️", count: 18, by: "Chatsapp" },
  { id: "animals", name: "Animals", desc: "Cute creatures", emoji: "🐶", count: 32, by: "Sticker Studio" },
  { id: "food", name: "Food & Drink", desc: "Delicious treats", emoji: "🍕", count: 28, by: "Sticker Studio" },
  { id: "travel", name: "Travel", desc: "Wanderlust pack", emoji: "✈️", count: 22, by: "Wanderlust Co." },
  { id: "memes", name: "Meme Time", desc: "Internet classics", emoji: "🤣", count: 40, by: "Meme Lab" },
  { id: "festive", name: "Festive 2026", desc: "Holiday celebrations", emoji: "🎉", count: 36, by: "Sticker Studio" },
  { id: "anime", name: "Anime Vibes", desc: "Anime expressions", emoji: "✨", count: 50, by: "Anime+" },
  { id: "kawaii", name: "Kawaii", desc: "Adorable characters", emoji: "🥰", count: 30, by: "Cute Co." },
];

export function StickerStore({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState("");

  const filtered = STICKER_PACKS.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Sticker store" onBack={onBack} sub={`${state.installedStickerPacks.length} installed · ${STICKER_PACKS.length} available`} />
      <div className="px-3 py-2 border-b border-[#222d34]">
        <div className="bg-[#202c33] rounded-full flex items-center gap-2 px-3 py-2">
          <Search className="w-4 h-4 text-[#8696a0]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sticker packs"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#8696a0]"
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X className="w-4 h-4 text-[#8696a0]" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Installed</h3>
        {STICKER_PACKS.filter((p) => state.installedStickerPacks.includes(p.id)).map((p) => (
          <StickerPackRow
            key={p.id}
            pack={p}
            installed
            onAction={() => dispatch({ type: "UNINSTALL_STICKER_PACK", pack: p.id })}
          />
        ))}
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">All packs</h3>
        {filtered.filter((p) => !state.installedStickerPacks.includes(p.id)).map((p) => (
          <StickerPackRow
            key={p.id}
            pack={p}
            installed={false}
            onAction={() => dispatch({ type: "INSTALL_STICKER_PACK", pack: p.id })}
          />
        ))}
        <div className="text-center text-xs text-[#8696a0] py-4">
          More packs coming soon ✨
        </div>
      </div>
    </div>
  );
}

function StickerPackRow({
  pack,
  installed,
  onAction,
}: {
  pack: typeof STICKER_PACKS[number];
  installed: boolean;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] border-b border-[#222d34]">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl">
        {pack.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{pack.name}</div>
        <div className="text-xs text-[#8696a0]">{pack.count} stickers · by {pack.by}</div>
        <div className="text-xs text-[#8696a0]/70 mt-0.5 truncate">{pack.desc}</div>
      </div>
      <button
        onClick={onAction}
        className={`text-xs px-3 py-1.5 rounded-full font-medium ${
          installed
            ? "bg-[#202c33] text-red-400 border border-red-400/30"
            : "bg-emerald-500 text-[#111b21]"
        }`}
      >
        {installed ? "Remove" : "+ Add"}
      </button>
    </div>
  );
}

// Channel admin tools (for own channels)
export function ChannelAdminTools({
  channelName,
  onBack,
}: {
  channelName: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const [composing, setComposing] = useState(false);
  const [postText, setPostText] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");

  const posts = state.channelPosts[channelName] || [];

  const publish = (scheduledFor?: number) => {
    if (!postText.trim()) return;
    dispatch({
      type: "ADD_CHANNEL_POST",
      channelName,
      post: {
        id: "p" + Date.now(),
        text: postText.trim(),
        time: scheduledFor ? "Scheduled" : "Just now",
        views: 0,
        reactions: [],
        scheduledFor,
      },
    });
    setPostText("");
    setComposing(false);
    setScheduling(false);
    setScheduleDate("");
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Manage channel" onBack={onBack} sub={channelName} action={
        <button onClick={() => setComposing(true)} className="p-2 text-emerald-400">
          <Plus className="w-5 h-5" />
        </button>
      } />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 border-b border-[#222d34] grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#202c33] rounded p-3">
            <div className="text-emerald-400 font-bold text-lg">{posts.length}</div>
            <div className="text-xs text-[#8696a0]">Posts</div>
          </div>
          <div className="bg-[#202c33] rounded p-3">
            <div className="text-emerald-400 font-bold text-lg">192M</div>
            <div className="text-xs text-[#8696a0]">Followers</div>
          </div>
          <div className="bg-[#202c33] rounded p-3">
            <div className="text-emerald-400 font-bold text-lg">2.1M</div>
            <div className="text-xs text-[#8696a0]">Avg views</div>
          </div>
        </div>

        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Tools</h3>
        {[
          { icon: <Megaphone className="w-5 h-5 text-orange-400" />, label: "Post update", action: () => setComposing(true) },
          { icon: <CalendarClock className="w-5 h-5 text-blue-400" />, label: "Scheduled posts", sub: `${posts.filter((p) => p.scheduledFor).length} scheduled` },
          { icon: <Crown className="w-5 h-5 text-yellow-400" />, label: "Add admin" },
          { icon: <Shield className="w-5 h-5 text-emerald-400" />, label: "Channel insights" },
          { icon: <Bell className="w-5 h-5 text-cyan-400" />, label: "Notification settings" },
        ].map((it) => (
          <button
            key={it.label}
            onClick={(it as any).action}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] text-left"
          >
            {it.icon}
            <div className="flex-1">
              <div className="font-medium">{it.label}</div>
              {(it as any).sub && <div className="text-xs text-[#8696a0]">{(it as any).sub}</div>}
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        ))}

        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Recent posts</h3>
        {posts.length === 0 ? (
          <div className="text-center text-sm text-[#8696a0] py-8 px-6">
            No posts yet. Tap + to publish your first update.
          </div>
        ) : (
          posts.map((p) => (
            <div key={p.id} className="px-4 py-3 border-b border-[#222d34]">
              <div className="text-sm whitespace-pre-wrap">{p.text}</div>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#8696a0]">
                <span>{p.time}</span>
                <span>· {p.views.toLocaleString()} views</span>
                {p.scheduledFor && <span className="text-blue-400">📅 Scheduled</span>}
                <button
                  onClick={() => dispatch({ type: "DELETE_CHANNEL_POST", channelName, postId: p.id })}
                  className="ml-auto text-red-400 p-1"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {composing && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={() => setComposing(false)}>
          <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">New post</h2>
              <button onClick={() => setComposing(false)}><X className="w-5 h-5" /></button>
            </div>
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's the update?"
              rows={4}
              className="w-full bg-[#111b21] rounded p-3 outline-none text-sm resize-none mb-3"
              autoFocus
            />
            {scheduling && (
              <input
                type="datetime-local"
                value={scheduleDate}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full bg-[#111b21] rounded p-2 outline-none text-sm mb-3"
              />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => publish()}
                disabled={!postText.trim()}
                className="flex-1 bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
              >
                Post now
              </button>
              {!scheduling ? (
                <button
                  onClick={() => setScheduling(true)}
                  className="bg-[#111b21] text-emerald-400 px-4 rounded-full text-sm"
                >
                  📅 Schedule
                </button>
              ) : (
                <button
                  onClick={() => publish(scheduleDate ? new Date(scheduleDate).getTime() : undefined)}
                  disabled={!postText.trim() || !scheduleDate}
                  className="flex-1 bg-blue-600 disabled:opacity-40 text-white py-2 rounded-full font-semibold"
                >
                  Schedule
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Group icon picker (for changing group avatar)
export function GroupIconPicker({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const chat = state.chats.find((c) => c.id === chatId);
  const [color, setColor] = useState(chat?.avatarColor || "bg-emerald-500");
  const [text, setText] = useState(chat?.avatarText || "GR");

  const colors = [
    "bg-pink-500","bg-blue-500","bg-purple-500","bg-orange-500","bg-emerald-500",
    "bg-rose-500","bg-teal-500","bg-indigo-500","bg-fuchsia-500","bg-amber-500",
    "bg-cyan-500","bg-red-500","bg-yellow-500","bg-lime-500",
  ];
  const presetEmojis = ["👨‍👩‍👧‍👦","💼","🎓","⚽","🎵","🍕","✈️","🏠","🎮","💪","🌍","☕","🎨","📚"];

  if (!chat) return null;

  const save = () => {
    // Real reducer action persists the group avatar change
    dispatch({ type: "UPDATE_CHAT_AVATAR", chatId, color, text });
    onBack();
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Change group icon" onBack={onBack} sub={chat.name} action={
        <button onClick={save} className="p-2 text-emerald-400"><Check className="w-5 h-5" /></button>
      } />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center mb-6">
          <div className={`w-32 h-32 rounded-full ${color} flex items-center justify-center text-4xl font-semibold`}>
            {text}
          </div>
        </div>

        <h3 className="text-xs uppercase text-emerald-400 mb-2">Source</h3>
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button className="aspect-square bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex flex-col items-center justify-center gap-1">
            <Camera className="w-6 h-6 text-emerald-400" />
            <span className="text-xs">Camera</span>
          </button>
          <button className="aspect-square bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex flex-col items-center justify-center gap-1">
            <ImageIcon className="w-6 h-6 text-emerald-400" />
            <span className="text-xs">Gallery</span>
          </button>
          <button className="aspect-square bg-[#202c33] hover:bg-[#2a3942] rounded-lg flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">🎨</span>
            <span className="text-xs">Custom</span>
          </button>
        </div>

        <h3 className="text-xs uppercase text-emerald-400 mb-2">Initials</h3>
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 3).toUpperCase())}
          maxLength={3}
          className="w-full bg-[#202c33] rounded-lg px-3 py-2 text-center text-2xl mb-4 outline-none"
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

        <h3 className="text-xs uppercase text-emerald-400 mb-2">Or use an emoji</h3>
        <div className="grid grid-cols-7 gap-2">
          {presetEmojis.map((e) => (
            <button
              key={e}
              onClick={() => setText(e)}
              className="w-10 h-10 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-xl flex items-center justify-center"
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Custom ringtone picker
export function RingtonePicker({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const current = state.customRingtones[chatId] || "Default";
  const ringtones = [
    "Default",
    "Note",
    "Chime",
    "Bubble",
    "Pop",
    "Bell",
    "Buzz",
    "Whistle",
    "Knock",
    "Sparkle",
    "Silent",
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Notification ringtone" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {ringtones.map((r) => (
          <button
            key={r}
            onClick={() => {
              dispatch({ type: "SET_RINGTONE", chatId, ringtone: r });
              onBack();
            }}
            className="w-full flex items-center px-4 py-3 hover:bg-[#202c33] text-left"
          >
            <div className={`w-5 h-5 rounded-full border-2 mr-3 ${current === r ? "border-emerald-500 bg-emerald-500" : "border-zinc-500"}`}>
              {current === r && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[5px]" />}
            </div>
            <Volume className="w-4 h-4 text-[#8696a0] mr-2" />
            <span>{r}</span>
            {r !== "Silent" && r !== "Default" && (
              <span className="ml-auto text-xs text-emerald-400">▶ Preview</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Send-large-file warning modal
export function LargeFileWarning({
  fileName,
  fileSize,
  onConfirm,
  onCancel,
}: {
  fileName: string;
  fileSize: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[#202c33] rounded-2xl p-5 max-w-xs w-full text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center mb-3">
          <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <h2 className="text-lg font-medium text-center mb-2">Large file</h2>
        <p className="text-sm text-[#8696a0] text-center mb-3">
          You're about to send <strong className="text-white">{fileName}</strong>.
        </p>
        <div className="bg-[#111b21] rounded-lg p-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#8696a0]">File size</span>
            <span className="text-yellow-400 font-medium">{fileSize}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-[#8696a0]">Max recommended</span>
            <span>16 MB</span>
          </div>
          <div className="text-xs text-[#8696a0] mt-2">
            ⚠️ This may use significant data on cellular networks.
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 bg-[#111b21] text-white py-2 rounded-full">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 bg-emerald-500 text-[#111b21] py-2 rounded-full font-semibold">
            Send anyway
          </button>
        </div>
      </div>
    </div>
  );
}

// Forward to status modal
export function ForwardToStatus({
  text,
  onClose,
  onPost,
}: {
  text: string;
  onClose: () => void;
  onPost: (caption: string) => void;
}) {
  const [caption, setCaption] = useState(text);
  const [bgIdx, setBgIdx] = useState(0);
  const bgs = [
    "bg-gradient-to-br from-pink-500 to-rose-600",
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-emerald-500 to-teal-600",
    "bg-gradient-to-br from-purple-600 to-fuchsia-600",
    "bg-gradient-to-br from-yellow-500 to-orange-500",
  ];
  return (
    <div className={`absolute inset-0 z-50 flex flex-col text-white theme-keep-white ${bgs[bgIdx]}`}>
      <div className="flex justify-between p-4">
        <button onClick={onClose}><X className="w-6 h-6" /></button>
        <button
          onClick={() => setBgIdx((i) => (i + 1) % bgs.length)}
          className="bg-white/20 px-3 py-1 rounded-full text-sm"
        >
          🎨 Color
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full bg-transparent text-center text-2xl outline-none resize-none placeholder:text-white/60"
          rows={4}
          autoFocus
        />
      </div>
      <div className="p-4 flex justify-end">
        <button
          onClick={() => onPost(caption)}
          disabled={!caption.trim()}
          className="bg-white text-black rounded-full w-14 h-14 flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Disappearing messages countdown bubble (shown next to disappearing msg)
export function DisappearingCountdown({ hours }: { hours: number }) {
  const label = hours === 24 ? "24h" : hours === 168 ? "7d" : hours === 2160 ? "90d" : `${hours}h`;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full ml-1">
      <Clock className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

// "You added X to the group" system messages
export function SystemMessage({ text }: { text: string }) {
  return (
    <div className="text-center my-1">
      <span className="bg-[#182229] text-[#aebac1] text-xs px-3 py-1 rounded-md inline-block">
        {text}
      </span>
    </div>
  );
}

// Suppress unused
export const _u = { Sticker, FileText };
