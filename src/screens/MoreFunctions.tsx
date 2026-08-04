import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, X, Check, Cake, AlertTriangle, PackageCheck, Clock, Bell, Plus, Trash,
  Volume, ShoppingBag, Send, Sparkles, Hash, Megaphone, ChevronRight,
  Bold, Italic, Strikethrough, Code, Link
} from "../icons";
import { Toggle } from "./SubSettings";
import { wallpaperOptions } from "../wallpapers";

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

// Mute duration picker
export function MuteDurationPicker({
  chatId,
  onClose,
}: {
  chatId: string;
  onClose: () => void;
}) {
  const { dispatch } = useStore();
  const opts = [
    { label: "8 hours", duration: "8h" },
    { label: "1 week", duration: "1w" },
    { label: "Always", duration: "always" },
  ];
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
      <div className="bg-[#202c33] w-full rounded-t-2xl text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#222d34]">
          <h2 className="text-lg font-medium">Mute notifications</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {opts.map((o) => (
          <button
            key={o.duration}
            onClick={() => {
              dispatch({ type: "MUTE_CHAT", chatId });
              onClose();
            }}
            className="w-full py-3 px-4 hover:bg-white/5 text-left flex items-center justify-between"
          >
            <span>{o.label}</span>
            <Volume className="w-4 h-4 text-[#8696a0]" />
          </button>
        ))}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 text-emerald-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Group invite link
export function GroupInviteLink({
  chat,
  onBack,
}: {
  chat: { id: string; name: string };
  onBack: () => void;
}) {
  const link = `https://chat.whatsapp.com/${chat.id.padStart(20, "X").toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Invite to group via link" onBack={onBack} sub={chat.name} />
      <div className="flex-1 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
            <Link className="w-6 h-6 text-[#111b21]" />
          </div>
          <div className="flex-1">
            <div className="font-medium">{chat.name}</div>
            <div className="text-xs text-[#8696a0]">Group invite link</div>
          </div>
        </div>
        <div className="bg-[#202c33] rounded-lg p-3 mb-4 break-all text-emerald-400 text-sm">
          {link}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copy}
            className="bg-emerald-500 text-[#111b21] py-2 rounded-full font-medium text-sm"
          >
            {copied ? "Copied ✓" : "Copy link"}
          </button>
          <button className="bg-[#202c33] text-emerald-400 py-2 rounded-full font-medium text-sm">
            Share link
          </button>
          <button className="bg-[#202c33] text-emerald-400 py-2 rounded-full font-medium text-sm">
            Send via Chatsapp
          </button>
          <button className="bg-[#202c33] text-red-400 py-2 rounded-full font-medium text-sm">
            Reset link
          </button>
        </div>
        <p className="text-xs text-[#8696a0] mt-4">
          Anyone with Chatsapp can use this link to join your group. Only share it with people you trust.
        </p>
      </div>
    </div>
  );
}

// Chat theme picker (per-chat wallpaper)
export function ChatThemePicker({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const current = state.chatThemes[chatId] || state.settings.wallpaper;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Chat wallpaper" onBack={onBack} sub="Just for this chat" />
      <div className="p-4">
        <p className="text-sm text-[#8696a0] mb-3">
          This wallpaper will only apply to this chat.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {wallpaperOptions.map((opt) => {
            const selected = current === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => dispatch({ type: "SET_CHAT_THEME", chatId, wallpaper: opt.id })}
                className={`aspect-[3/5] rounded-xl ${opt.preview} border-2 ${selected ? "border-emerald-500" : "border-transparent"} flex items-end justify-center pb-2`}
              >
                <span className="text-xs text-white bg-black/40 px-2 py-0.5 rounded">{opt.name}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            dispatch({ type: "SET_CHAT_THEME", chatId, wallpaper: state.settings.wallpaper });
            onBack();
          }}
          className="mt-4 text-sm text-emerald-400"
        >
          Reset to default
        </button>
      </div>
    </div>
  );
}

// Order history
export function OrderHistory({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const orders = state.orders;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Order history" onBack={onBack} sub={`${orders.length} order${orders.length !== 1 ? "s" : ""}`} />
      <div className="flex-1 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <ShoppingBag className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders yet</p>
          </div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="px-4 py-3 border-b border-[#222d34]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#8696a0]">Order #{o.id.slice(-6).toUpperCase()}</span>
                <span className="text-xs text-emerald-400">${o.total.toFixed(2)}</span>
              </div>
              <div className="text-xs text-[#8696a0] mb-2">
                {new Date(o.date).toLocaleString()}
              </div>
              <div className="flex gap-2 overflow-x-auto mb-2">
                {o.items.map((it, i) => (
                  <div key={i} className="shrink-0 bg-[#202c33] rounded px-2 py-1 text-xs flex items-center gap-1">
                    {it.emoji} {it.name} ×{it.qty}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  o.status === "delivered" ? "bg-emerald-500/20 text-emerald-400" :
                  o.status === "shipped" ? "bg-blue-500/20 text-blue-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {o.status === "placed" ? "📦 Placed" : o.status === "shipped" ? "🚚 Shipped" : "✓ Delivered"}
                </span>
                {o.status !== "delivered" && (
                  <button
                    onClick={() => dispatch({
                      type: "UPDATE_ORDER_STATUS",
                      id: o.id,
                      status: o.status === "placed" ? "shipped" : "delivered",
                    })}
                    className="text-xs text-emerald-400 ml-auto"
                  >
                    Mark as {o.status === "placed" ? "shipped" : "delivered"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Reaction details (who reacted)
export function ReactionDetails({
  reactions,
  onClose,
}: {
  reactions: { emoji: string; by: string }[];
  onClose: () => void;
}) {
  const grouped = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.by);
    return acc;
  }, {} as Record<string, string[]>);
  const [tab, setTab] = useState<string>("all");
  const tabs = ["all", ...Object.keys(grouped)];

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
      <div className="bg-[#202c33] w-full rounded-t-2xl text-white max-h-[60%] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center p-2 border-b border-[#222d34] overflow-x-auto">
          <button onClick={onClose} className="p-2"><X className="w-5 h-5" /></button>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-3 py-1.5 text-sm rounded-full mx-1 ${tab === t ? "bg-emerald-500/20 text-emerald-400" : "text-[#aebac1]"}`}
            >
              {t === "all" ? `All ${reactions.length}` : `${t} ${grouped[t].length}`}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {(tab === "all" ? reactions : reactions.filter((r) => r.emoji === tab)).map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5">
              <Avatar color="bg-zinc-600" text={r.by.slice(0, 2).toUpperCase()} size="sm" />
              <div className="flex-1 text-sm">{r.by}</div>
              <span className="text-xl">{r.emoji}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reminders list / add
export function Reminders({
  onBack,
  onOpenChat,
}: {
  onBack: () => void;
  onOpenChat: (id: string) => void;
}) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [chatId, setChatId] = useState(state.chats[0]?.id || "");
  const [text, setText] = useState("");
  const [date, setDate] = useState("");

  const upcoming = state.reminders.filter((r) => !r.done).sort((a, b) => a.date - b.date);
  const done = state.reminders.filter((r) => r.done);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Reminders" onBack={onBack} sub={`${upcoming.length} upcoming`} action={
        <button onClick={() => setAdding(true)} className="p-2 text-emerald-400">
          <Plus className="w-5 h-5" />
        </button>
      } />
      <div className="flex-1 overflow-y-auto">
        {upcoming.length === 0 && done.length === 0 && (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <Bell className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No reminders yet</p>
            <button onClick={() => setAdding(true)} className="mt-3 text-emerald-400">
              Add one
            </button>
          </div>
        )}
        {upcoming.length > 0 && (
          <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Upcoming</h3>
        )}
        {upcoming.map((r) => {
          const c = state.chats.find((x) => x.id === r.chatId);
          return (
            <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
              <button
                onClick={() => dispatch({ type: "TOGGLE_REMINDER", id: r.id })}
                className="w-5 h-5 rounded border-2 border-[#8696a0]"
              />
              <button onClick={() => onOpenChat(r.chatId)} className="flex-1 text-left">
                <div className="text-sm">{r.text}</div>
                <div className="text-xs text-[#8696a0]">{c?.name} · {new Date(r.date).toLocaleString()}</div>
              </button>
              <button onClick={() => dispatch({ type: "DELETE_REMINDER", id: r.id })} className="p-2 text-red-400">
                <Trash className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        {done.length > 0 && (
          <>
            <h3 className="text-xs uppercase text-[#8696a0] px-4 pt-3 pb-1">Done</h3>
            {done.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 opacity-60">
                <button
                  onClick={() => dispatch({ type: "TOGGLE_REMINDER", id: r.id })}
                  className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </button>
                <div className="flex-1 text-sm line-through text-[#8696a0]">{r.text}</div>
                <button onClick={() => dispatch({ type: "DELETE_REMINDER", id: r.id })} className="p-2 text-red-400">
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {adding && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={() => setAdding(false)}>
          <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">New reminder</h2>
              <button onClick={() => setAdding(false)}><X className="w-5 h-5" /></button>
            </div>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What to remember?"
              className="w-full bg-[#111b21] rounded p-2 outline-none mb-2"
            />
            <select
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              className="w-full bg-[#111b21] rounded p-2 outline-none mb-2"
            >
              {state.chats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input
              type="datetime-local"
              value={date}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#111b21] rounded p-2 outline-none mb-3"
            />
            <button
              onClick={() => {
                if (!text.trim() || !date || !chatId) return;
                // Do not allow past dates
                if (new Date(date).getTime() < Date.now()) {
                  alert("Please pick a future date & time for the reminder.");
                  return;
                }
                dispatch({
                  type: "ADD_REMINDER",
                  reminder: {
                    id: "rem" + Date.now(),
                    chatId,
                    text: text.trim(),
                    date: new Date(date).getTime(),
                    done: false,
                  },
                });
                setText("");
                setDate("");
                setAdding(false);
              }}
              disabled={!text.trim() || !date}
              className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
            >
              Add reminder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Birthdays / upcoming
export function Birthdays({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [date, setDate] = useState("");

  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const todayBirthdays = Object.entries(state.birthdays)
    .filter(([_, d]) => d === monthDay)
    .map(([cid]) => state.chats.find((c) => c.id === cid))
    .filter(Boolean);

  const upcoming = Object.entries(state.birthdays)
    .filter(([_, d]) => d !== monthDay)
    .sort(([_, a], [__, b]) => a.localeCompare(b));

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Birthdays" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {todayBirthdays.length > 0 && (
          <>
            <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">🎉 Today</h3>
            {todayBirthdays.map((c) => (
              <div key={c!.id} className="flex items-center gap-3 px-3 py-2.5 bg-emerald-500/10">
                <Avatar color={c!.avatarColor} text={c!.avatarText} />
                <div className="flex-1">
                  <div className="font-medium">{c!.name}</div>
                  <div className="text-xs text-emerald-400">🎂 Birthday today!</div>
                </div>
              </div>
            ))}
          </>
        )}
        <h3 className="text-xs uppercase text-[#8696a0] px-4 pt-3 pb-1">Saved birthdays</h3>
        {upcoming.length === 0 && todayBirthdays.length === 0 && (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <Cake className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No birthdays saved yet.</p>
          </div>
        )}
        {upcoming.map(([cid, d]) => {
          const c = state.chats.find((x) => x.id === cid);
          if (!c) return null;
          return (
            <div key={cid} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar color={c.avatarColor} text={c.avatarText} />
              <div className="flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-[#8696a0]">{d.split("-").reverse().join("/")}</div>
              </div>
              <button
                onClick={() => { setAddingFor(cid); setDate(""); }}
                className="text-xs text-emerald-400"
              >Edit</button>
            </div>
          );
        })}
        <h3 className="text-xs uppercase text-[#8696a0] px-4 pt-3 pb-1">Add birthday</h3>
        {state.chats.filter((c) => !c.isGroup && !state.birthdays[c.id]).slice(0, 5).map((c) => (
          <button
            key={c.id}
            onClick={() => { setAddingFor(c.id); setDate(""); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
          >
            <Avatar color={c.avatarColor} text={c.avatarText} />
            <div className="flex-1 text-sm font-medium">{c.name}</div>
            <Plus className="w-4 h-4 text-emerald-400" />
          </button>
        ))}
      </div>

      {addingFor && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={() => setAddingFor(null)}>
          <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium mb-3">
              Birthday for {state.chats.find((c) => c.id === addingFor)?.name}
            </h2>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#111b21] rounded p-2 outline-none mb-3"
            />
            <button
              onClick={() => {
                if (date) {
                  const d = new Date(date);
                  const md = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                  dispatch({ type: "SET_BIRTHDAY", chatId: addingFor, date: md });
                  setAddingFor(null);
                }
              }}
              disabled={!date}
              className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Spam report flow
export function SpamReport({
  chat,
  onBack,
}: {
  chat: { id: string; name: string; avatarColor: string; avatarText: string };
  onBack: () => void;
}) {
  const { dispatch } = useStore();
  const [reasons, setReasons] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const opts = [
    "Sending spam or scam messages",
    "Pretending to be someone else",
    "Inappropriate content",
    "Harassment or bullying",
    "Sharing my personal info",
    "Other",
  ];

  if (submitted) {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-[#111b21]" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Report submitted</h2>
        <p className="text-sm text-[#8696a0]">
          Thanks for helping keep Chatsapp safe. We'll review the report and take action if needed.
        </p>
        <button onClick={onBack} className="mt-6 bg-emerald-500 text-[#111b21] px-6 py-2 rounded-full font-medium">
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Report spam" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-3 mb-4 p-3 bg-red-500/10 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div className="text-sm">
            <div className="font-medium">Report {chat.name}</div>
            <div className="text-xs text-[#8696a0]">The last 5 messages will be sent to Chatsapp.</div>
          </div>
        </div>
        <h3 className="text-xs uppercase text-emerald-400 mb-2">Why are you reporting?</h3>
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => setReasons((r) => r.includes(o) ? r.filter((x) => x !== o) : [...r, o])}
            className="w-full flex items-center gap-3 py-2.5 hover:bg-white/5 rounded text-left"
          >
            <div className={`w-5 h-5 rounded border-2 ${reasons.includes(o) ? "bg-emerald-500 border-emerald-500" : "border-zinc-500"} flex items-center justify-center`}>
              {reasons.includes(o) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-sm">{o}</span>
          </button>
        ))}
        <button
          onClick={() => {
            dispatch({ type: "REPORT_SPAM", chatId: chat.id });
            dispatch({ type: "BLOCK_CONTACT", chatId: chat.id });
            setSubmitted(true);
          }}
          disabled={reasons.length === 0}
          className="w-full mt-6 bg-red-600 disabled:opacity-40 text-white py-3 rounded-full font-semibold"
        >
          Report and block
        </button>
      </div>
    </div>
  );
}

// Out-of-office settings
export function OutOfOffice({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [msg, setMsg] = useState(state.outOfOffice.message);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Out of office" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium">Auto-reply</div>
            <div className="text-xs text-[#8696a0]">Reply automatically when offline</div>
          </div>
          <Toggle
            on={state.outOfOffice.enabled}
            onChange={(v) => dispatch({ type: "UPDATE_OOO", updates: { enabled: v } })}
          />
        </div>
        <h3 className="text-xs uppercase text-emerald-400 mb-2">Message</h3>
        <textarea
          value={msg}
          onChange={(e) => {
            setMsg(e.target.value);
            dispatch({ type: "UPDATE_OOO", updates: { message: e.target.value } });
          }}
          rows={5}
          className="w-full bg-[#202c33] rounded p-3 text-sm outline-none resize-none"
          placeholder="I'm currently away…"
        />
        <p className="text-xs text-[#8696a0] mt-3">
          🔒 Auto-replies are sent on your behalf. They count as messages from you.
        </p>
      </div>
    </div>
  );
}

// Channel creation flow
export function CreateChannel({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [emoji, setEmoji] = useState("📢");
  const emojis = ["📢","📣","🎙️","📡","📺","🎬","🎵","💼","🏠","📚","🛍️","🎮","⚽","🍕","✈️","💡","🚀","🎨"];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Create channel" onBack={onBack} action={
        <button
          onClick={() => name.trim() && onCreated()}
          disabled={!name.trim()}
          className="text-emerald-400 font-medium px-3 disabled:opacity-40"
        >
          Create
        </button>
      } />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-5xl">
            {emoji}
          </div>
        </div>
        <h3 className="text-xs uppercase text-emerald-400 mb-2">Channel icon</h3>
        <div className="grid grid-cols-9 gap-1 mb-4">
          {emojis.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`text-2xl p-2 rounded ${emoji === e ? "bg-emerald-500/30" : "hover:bg-white/5"}`}
            >{e}</button>
          ))}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Channel name"
          className="w-full bg-[#202c33] rounded p-3 outline-none mb-3"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full bg-[#202c33] rounded p-3 outline-none text-sm resize-none mb-3"
        />
        <div className="bg-[#202c33] rounded p-3 text-xs text-[#8696a0]">
          <div className="font-medium text-white mb-1">Channel guidelines</div>
          • One-way broadcast to followers<br />
          • Followers can react and view but cannot reply<br />
          • Verify your identity to get a verified badge
        </div>
      </div>
    </div>
  );
}

// Formatting toolbar — to be inserted above text input
export function FormattingBar({
  onApply,
}: {
  onApply: (style: "bold" | "italic" | "strike" | "code" | "monospace") => void;
}) {
  return (
    <div className="flex gap-1 px-3 py-1 bg-[#202c33] border-t border-[#222d34]">
      <button onClick={() => onApply("bold")} className="p-1.5 hover:bg-white/10 rounded text-white" title="Bold *text*">
        <Bold className="w-4 h-4" />
      </button>
      <button onClick={() => onApply("italic")} className="p-1.5 hover:bg-white/10 rounded text-white" title="Italic _text_">
        <Italic className="w-4 h-4" />
      </button>
      <button onClick={() => onApply("strike")} className="p-1.5 hover:bg-white/10 rounded text-white" title="Strikethrough ~text~">
        <Strikethrough className="w-4 h-4" />
      </button>
      <button onClick={() => onApply("code")} className="p-1.5 hover:bg-white/10 rounded text-white" title="Inline code `text`">
        <Code className="w-4 h-4" />
      </button>
      <button onClick={() => onApply("monospace")} className="p-1.5 hover:bg-white/10 rounded text-white text-xs font-mono" title="Code block ```text```">
        {"{ }"}
      </button>
    </div>
  );
}

// Multiple AI personas selector for Meta AI
export function AIPersonaPicker({
  current,
  onPick,
  onClose,
}: {
  current: string;
  onPick: (id: string) => void;
  onClose: () => void;
}) {
  const personas = [
    { id: "default", name: "Meta AI", emoji: "✨", desc: "Your general assistant" },
    { id: "chef", name: "Chef Marco", emoji: "👨‍🍳", desc: "Recipes and meal planning" },
    { id: "coach", name: "Coach Sam", emoji: "💪", desc: "Fitness and motivation" },
    { id: "writer", name: "Wordsmith", emoji: "✍️", desc: "Writing and editing help" },
    { id: "therapist", name: "Listener", emoji: "🧘", desc: "A friendly ear" },
    { id: "coder", name: "Dev Helper", emoji: "💻", desc: "Programming questions" },
    { id: "traveler", name: "Globe", emoji: "✈️", desc: "Travel planning" },
    { id: "tutor", name: "Tutor", emoji: "📚", desc: "Learn anything" },
  ];

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
      <div className="bg-[#202c33] w-full rounded-t-2xl text-white max-h-[70%] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#222d34]">
          <h2 className="text-lg font-medium">Choose AI persona</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => { onPick(p.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left ${current === p.id ? "bg-emerald-500/10" : ""}`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                {p.emoji}
              </div>
              <div className="flex-1">
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-[#8696a0]">{p.desc}</div>
              </div>
              {current === p.id && <Check className="w-5 h-5 text-emerald-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Group description (read-only) as overlay when chat header tapped
export function GroupDescriptionPopup({
  name,
  about,
  members,
  onClose,
}: {
  name: string;
  about: string;
  members?: string[];
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#202c33] rounded-2xl p-5 max-w-xs w-full text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium flex-1">{name}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="text-xs text-[#8696a0] mb-1">Description</div>
        <div className="text-sm mb-4">{about || "No description"}</div>
        {members && (
          <>
            <div className="text-xs text-[#8696a0] mb-1">{members.length} members</div>
            <div className="flex flex-wrap gap-2">
              {members.slice(0, 8).map((m) => (
                <span key={m} className="text-xs bg-white/5 px-2 py-1 rounded-full">{m}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Suppress unused
export const _u = { Sparkles, Hash, Megaphone, ChevronRight, PackageCheck, Send, Clock };
