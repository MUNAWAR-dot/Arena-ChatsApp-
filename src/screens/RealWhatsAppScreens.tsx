import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, X, Check, Trash, Mic, Send, Pause, Play, EyeOff, Eye,
  Ghost, Activity, Crown, Users, Smartphone, Pin, Search, ChevronRight, Lock, Headphones, Shield,
  ChatBubble, Edit3, UserPlus, Clock, Phone
} from "../icons";
import { Toggle } from "./SubSettings";

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

// Voice preview (record → preview → send/cancel)
export function VoicePreview({
  onCancel,
  onSend,
}: {
  onCancel: () => void;
  onSend: (duration: string) => void;
}) {
  const [phase, setPhase] = useState<"recording" | "preview">("recording");
  const [seconds, setSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const recordRef = useRef<any>(null);
  const playRef = useRef<any>(null);

  useEffect(() => {
    recordRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(recordRef.current);
  }, []);

  const stopRecording = () => {
    clearInterval(recordRef.current);
    setPhase("preview");
  };

  useEffect(() => {
    if (!playing) return;
    playRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setPlaying(false); return 0; }
        return p + 100 / (seconds * 10);
      });
    }, 100);
    return () => clearInterval(playRef.current);
  }, [playing, seconds]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (phase === "recording") {
    return (
      <div className="bg-[#202c33] mx-2 mb-1 rounded-lg flex items-center gap-3 px-3 py-2">
        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm text-white">{fmt(seconds)}</span>
        <div className="flex-1 flex items-center gap-0.5">
          {Array.from({ length: 24 }, (_, i) => (
            <div
              key={i}
              className="w-0.5 bg-emerald-400 rounded-full animate-pulse"
              style={{ height: `${4 + (i * 11) % 16}px`, animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
        <button onClick={onCancel} className="text-red-400 text-sm">
          <Trash className="w-4 h-4" />
        </button>
        <button onClick={stopRecording} className="bg-emerald-500 text-[#111b21] rounded-full w-9 h-9 flex items-center justify-center">
          <Pause className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Preview phase
  return (
    <div className="bg-[#202c33] mx-2 mb-1 rounded-lg flex items-center gap-3 px-3 py-2">
      <button onClick={onCancel} className="p-1.5 text-red-400">
        <Trash className="w-5 h-5" />
      </button>
      <button onClick={() => setPlaying((p) => !p)} className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>
      <div className="flex-1 h-1 bg-white/20 rounded-full">
        <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>
      <span className="text-xs text-[#8696a0]">{fmt(seconds)}</span>
      <button
        onClick={() => onSend(fmt(seconds))}
        className="bg-emerald-500 text-[#111b21] rounded-full w-9 h-9 flex items-center justify-center"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

// View-once viewer (plays once then disappears)
export function ViewOnceViewer({
  text,
  type,
  onClose,
}: {
  text?: string;
  type?: string;
  onClose: () => void;
}) {
  const [seconds, setSeconds] = useState(15);
  useEffect(() => {
    if (seconds === 0) { onClose(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onClose]);

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col text-white">
      <header className="flex items-center gap-3 px-3 py-3 bg-black/50">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-sm font-medium flex items-center gap-1">
            <Ghost className="w-4 h-4" /> View once
          </div>
          <div className="text-xs text-yellow-400">Disappears in {seconds}s</div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4">
        {type === "image" ? (
          <div className="w-full max-w-sm aspect-square bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 rounded-xl flex items-center justify-center">
            <Eye className="w-20 h-20 text-white/70" />
          </div>
        ) : (
          <div className="text-2xl text-center max-w-xs">{text}</div>
        )}
      </div>
      <div className="text-center text-xs text-[#8696a0] py-3">
        🔒 You can only view this once. It will disappear when you exit.
      </div>
    </div>
  );
}

// Pinned messages list — see all pinned in chat
export function PinnedMessages({
  chatId,
  onBack,
  onJump,
}: {
  chatId: string;
  onBack: () => void;
  onJump: (msgId: string) => void;
}) {
  const { state, dispatch } = useStore();
  const chat = state.chats.find((c) => c.id === chatId);
  if (!chat) return null;
  const pinned = chat.messages.filter((m) => m.pinned);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Pinned messages" onBack={onBack} sub={`${pinned.length} pinned`} />
      <div className="flex-1 overflow-y-auto">
        {pinned.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <Pin className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No pinned messages yet</p>
            <p className="text-xs mt-1">Pin important messages to find them later</p>
          </div>
        ) : (
          pinned.map((m) => (
            <div key={m.id} className="flex items-start gap-3 px-4 py-3 border-b border-[#222d34]">
              <Pin className="w-4 h-4 text-emerald-400 mt-1" />
              <button onClick={() => onJump(m.id)} className="flex-1 text-left">
                <div className="text-xs text-[#8696a0] mb-0.5">
                  {m.sent ? "You" : chat.name} · {m.time}
                </div>
                <div className="text-sm">{m.text || `[${m.type}]`}</div>
              </button>
              <button
                onClick={() => dispatch({ type: "PIN_MESSAGE", chatId, messageId: m.id })}
                className="text-red-400 p-1"
                title="Unpin"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Common groups (between you and a contact)
export function CommonGroups({
  chatId,
  onBack,
  onOpenChat,
}: {
  chatId: string;
  onBack: () => void;
  onOpenChat: (id: string) => void;
}) {
  const { state } = useStore();
  const contact = state.chats.find((c) => c.id === chatId);
  if (!contact) return null;

  // Find groups where contact is a member
  const common = state.chats.filter(
    (c) => c.isGroup && c.members?.includes(contact.name)
  );

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Common groups" onBack={onBack} sub={`${common.length} group${common.length !== 1 ? "s" : ""}`} />
      <div className="flex-1 overflow-y-auto">
        {common.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">You and {contact.name} have no groups in common</p>
          </div>
        ) : (
          common.map((g) => (
            <button
              key={g.id}
              onClick={() => onOpenChat(g.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
            >
              <Avatar color={g.avatarColor} text={g.avatarText} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{g.name}</div>
                <div className="text-xs text-[#8696a0]">{g.members?.length} members</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// Status privacy
export function StatusPrivacy({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [mode, setMode] = useState(state.statusPrivacy.mode);

  const opts = [
    { id: "everyone" as const, label: "Everyone", sub: "Anyone with your number" },
    { id: "contacts" as const, label: "My contacts", sub: "All people in your address book" },
    { id: "contacts_except" as const, label: "My contacts except…", sub: "Hide from selected contacts" },
    { id: "only_share_with" as const, label: "Only share with…", sub: "Only selected contacts" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Status privacy" onBack={onBack} action={
        <button
          onClick={() => {
            dispatch({ type: "SET_STATUS_PRIVACY", privacy: { mode, list: state.statusPrivacy.list } });
            onBack();
          }}
          className="p-2 text-emerald-400"
        ><Check className="w-5 h-5" /></button>
      } />
      <div className="flex-1 overflow-y-auto">
        <p className="text-sm text-[#8696a0] px-4 py-3">
          Choose who can see your status updates. Changes won't affect status updates that you've already sent.
        </p>
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => setMode(o.id)}
            className="w-full flex items-center px-4 py-3 hover:bg-[#202c33] text-left"
          >
            <div className={`w-5 h-5 rounded-full border-2 mr-3 ${mode === o.id ? "border-emerald-500 bg-emerald-500" : "border-zinc-500"}`}>
              {mode === o.id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[5px]" />}
            </div>
            <div>
              <div className="font-medium">{o.label}</div>
              <div className="text-xs text-[#8696a0]">{o.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Mute statuses (silence specific people)
export function MutedStatuses({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const muted = state.chats.filter((c) => state.mutedStatuses.includes(c.id));
  const others = state.chats.filter((c) => !c.isGroup && !state.mutedStatuses.includes(c.id));
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Muted updates" onBack={onBack} sub={`${muted.length} muted`} action={
        <button onClick={() => setAdding(true)} className="p-2 text-emerald-400">
          <EyeOff className="w-5 h-5" />
        </button>
      } />
      <div className="flex-1 overflow-y-auto">
        {muted.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <EyeOff className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No muted status updates</p>
            <p className="text-xs mt-1">Muted updates won't appear in your status list</p>
          </div>
        ) : (
          muted.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33]">
              <Avatar color={c.avatarColor} text={c.avatarText} />
              <div className="flex-1 font-medium">{c.name}</div>
              <button
                onClick={() => dispatch({ type: "TOGGLE_MUTED_STATUS", chatId: c.id })}
                className="text-emerald-400 text-sm"
              >
                Unmute
              </button>
            </div>
          ))
        )}
      </div>

      {adding && (
        <div className="absolute inset-0 z-50 bg-[#111b21] flex flex-col">
          <SubHeader title="Mute updates from…" onBack={() => setAdding(false)} />
          <div className="flex-1 overflow-y-auto">
            {others.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  dispatch({ type: "TOGGLE_MUTED_STATUS", chatId: c.id });
                  setAdding(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
              >
                <Avatar color={c.avatarColor} text={c.avatarText} />
                <div className="flex-1 font-medium">{c.name}</div>
                <EyeOff className="w-5 h-5 text-[#8696a0]" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Active sessions
export function ActiveSessions({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Login activity" onBack={onBack} sub={`${state.sessions.length} session${state.sessions.length !== 1 ? "s" : ""}`} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 text-sm text-[#8696a0]">
          You're logged into Chatsapp on the following devices. Tap a session to end it.
        </div>
        {state.sessions.map((s) => (
          <div key={s.id} className="flex items-start gap-3 px-3 py-3 border-b border-[#222d34]">
            <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {s.device}
                {s.current && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Current</span>}
              </div>
              <div className="text-xs text-[#8696a0]">{s.location}</div>
              <div className="text-xs text-[#8696a0]">
                {s.current ? "Active now" : "Last active: " + new Date(s.loginTime).toLocaleString()}
              </div>
            </div>
            {!s.current && (
              <button
                onClick={() => {
                  if (confirm(`Sign out ${s.device}?`)) {
                    dispatch({ type: "REMOVE_SESSION", id: s.id });
                  }
                }}
                className="text-red-400 text-sm"
              >
                End
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => {
            if (confirm("Sign out from all other devices?")) {
              state.sessions.filter((s) => !s.current).forEach((s) => {
                dispatch({ type: "REMOVE_SESSION", id: s.id });
              });
            }
          }}
          className="w-full text-left px-4 py-3 mt-2 hover:bg-[#202c33] text-red-400"
        >
          End all other sessions
        </button>
      </div>
    </div>
  );
}

// Group permissions
export function GroupPermissionsScreen({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const chat = state.chats.find((c) => c.id === chatId);
  if (!chat) return null;
  const cur = state.groupPermissions[chatId] || {
    whoCanSendMessages: "everyone",
    whoCanEditInfo: "everyone",
    whoCanAddMembers: "everyone",
    approveNewMembers: false,
  };

  const update = (updates: Partial<typeof cur>) => {
    dispatch({ type: "SET_GROUP_PERMISSIONS", chatId, permissions: { ...cur, ...updates } });
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Group settings" onBack={onBack} sub={chat.name} />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Group header card */}
        <div className="px-4 py-4 flex items-center gap-3 border-b border-[#222d34]">
          <Avatar color={chat.avatarColor} text={chat.avatarText} size="lg" />
          <div className="flex-1">
            <div className="font-semibold">{chat.name}</div>
            <div className="text-xs text-[#8696a0] flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-yellow-400" /> You are an admin
            </div>
          </div>
          <div className="bg-emerald-500/10 rounded-full px-3 py-1 text-xs text-emerald-400 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Admin controls
          </div>
        </div>

        {/* Permission sections */}
        <Section title="Send messages" icon={<ChatBubble className="w-3.5 h-3.5" />}>
          {(["everyone", "admins"] as const).map((v) => (
            <OptionRow
              key={v}
              selected={cur.whoCanSendMessages === v}
              label={v === "admins" ? "Only admins" : "All participants"}
              sub={v === "admins" ? "Announcement-only group — members can't post" : "Everyone can send messages"}
              icon={v === "admins" ? <Shield className="w-5 h-5 text-yellow-400" /> : <Users className="w-5 h-5 text-emerald-400" />}
              onClick={() => update({ whoCanSendMessages: v })}
            />
          ))}
        </Section>

        <Section title="Edit group info" icon={<Edit3 className="w-3.5 h-3.5" />}>
          {(["everyone", "admins"] as const).map((v) => (
            <OptionRow
              key={v}
              selected={cur.whoCanEditInfo === v}
              label={v === "admins" ? "Only admins" : "All participants"}
              sub={v === "admins" ? "Only admins can change name, icon & description" : "Everyone can edit group details"}
              icon={v === "admins" ? <Shield className="w-5 h-5 text-yellow-400" /> : <Users className="w-5 h-5 text-emerald-400" />}
              onClick={() => update({ whoCanEditInfo: v })}
            />
          ))}
        </Section>

        <Section title="Add members" icon={<UserPlus className="w-3.5 h-3.5" />}>
          {(["everyone", "admins"] as const).map((v) => (
            <OptionRow
              key={v}
              selected={cur.whoCanAddMembers === v}
              label={v === "admins" ? "Only admins" : "All participants"}
              sub={v === "admins" ? "Members must be added by an admin" : "Anyone can add new members"}
              icon={v === "admins" ? <Shield className="w-5 h-5 text-yellow-400" /> : <Users className="w-5 h-5 text-emerald-400" />}
              onClick={() => update({ whoCanAddMembers: v })}
            />
          ))}
        </Section>

        {/* Approval toggle card */}
        <div className="mx-4 mt-4 bg-[#202c33] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cur.approveNewMembers ? "bg-yellow-500/20" : "bg-emerald-500/20"}`}>
              {cur.approveNewMembers ? (
                <Clock className="w-5 h-5 text-yellow-400" />
              ) : (
                <Check className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Approve new members</div>
              <div className="text-xs text-[#8696a0]">New participants joining via invite link must be approved by an admin</div>
            </div>
            <Toggle on={cur.approveNewMembers} onChange={(v) => update({ approveNewMembers: v })} />
          </div>
          {cur.approveNewMembers && (
            <div className="px-4 pb-3 -mt-1 text-xs text-yellow-400/80 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Anyone with the link can request to join — you'll approve them manually
            </div>
          )}
        </div>

        {/* Info banner */}
        <div className="mx-4 mt-4 bg-[#182229] rounded-xl p-3 text-xs text-[#8696a0] flex items-start gap-2">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>Group settings can only be changed by admins. Members see these settings as read-only.</span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs uppercase text-emerald-400 px-5 pb-2 flex items-center gap-1.5">
        {icon}
        {title}
      </h3>
      <div className="mx-4 bg-[#202c33] rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function OptionRow({
  selected,
  label,
  sub,
  icon,
  onClick,
}: {
  selected: boolean;
  label: string;
  sub: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] text-left border-b border-[#111b21] last:border-0 ${selected ? "bg-emerald-500/5" : ""}`}
    >
      <div className="w-8 h-8 rounded-full bg-[#111b21] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <div className={`font-medium text-sm ${selected ? "text-emerald-300" : ""}`}>{label}</div>
        <div className="text-xs text-[#8696a0]">{sub}</div>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${selected ? "border-emerald-500" : "border-zinc-600"}`}>
        {selected && <div className="w-2 h-2 bg-emerald-500 rounded-full m-auto mt-[5px]" />}
      </div>
    </button>
  );
}

// Vanish mode info / confirmation
export function VanishModeInfo({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const isOn = state.vanishModeChats.includes(chatId);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Vanish mode" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <Ghost className="w-12 h-12 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{isOn ? "Vanish mode is on" : "Turn on vanish mode"}</h2>
        <p className="text-sm text-[#8696a0] mb-6">
          When you turn on vanish mode, new messages sent in this chat will disappear after they're seen.
        </p>
        <div className="bg-[#202c33] rounded-lg p-4 text-left text-xs text-[#aebac1] mb-6">
          <div className="mb-2">📵 Messages disappear after being viewed</div>
          <div className="mb-2">📷 Photos and videos saved to gallery only if you tap to keep</div>
          <div className="mb-2">⚠️ The other person can still take screenshots</div>
          <div>👤 Only affects new messages going forward</div>
        </div>
        <button
          onClick={() => dispatch({ type: "TOGGLE_VANISH_MODE", chatId })}
          className={`w-full py-3 rounded-full font-semibold ${isOn ? "bg-red-500 text-white" : "bg-emerald-500 text-[#111b21]"}`}
        >
          {isOn ? "Turn off vanish mode" : "Turn on vanish mode"}
        </button>
      </div>
    </div>
  );
}

// QR Scanner — decode a real QR (via image upload) or manual phone entry.
// No simulated scans: the user either uploads a QR image or types a phone.
export function QRScanner({
  onBack,
  onScan,
}: {
  onBack: () => void;
  onScan: (data: string) => void;
}) {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [phone, setPhone] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  // Real image-based QR decode would use a decoder lib (e.g. jsQR) against the
  // uploaded frame. Without a camera permission, we accept the file and decode
  // via the browser's BarcodeDetector when available — otherwise prompt manual.
  const handleFile = async (file: File) => {
    if (!file) return;
    try {
      const bd = (window as any).BarcodeDetector;
      if (bd) {
        const bitmap = await createImageBitmap(file);
        const detector = new bd({ formats: ["qr_code"] });
        const codes = await detector.detect(bitmap);
        if (codes && codes.length > 0 && codes[0].rawValue) {
          onScan(codes[0].rawValue);
          return;
        }
      }
    } catch {}
    setMode("manual");
    setError("Couldn't auto-read the QR image. Enter the phone number manually.");
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col text-white">
      <header className="flex items-center gap-3 px-3 py-3 bg-black/70">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
        <h1 className="flex-1 font-medium">Scan QR code</h1>
        <button onClick={() => setMode(mode === "camera" ? "manual" : "camera")} className="text-sm text-emerald-400">
          {mode === "camera" ? "Manual entry" : "Camera"}
        </button>
      </header>

      {mode === "camera" ? (
        <>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-64 h-64 border-2 border-emerald-400 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl" />
              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-bounce" />
            </div>
          </div>
          <div className="text-center text-sm text-white/80 pb-6 px-6">
            Point your camera at a WhatsApp QR code
            <button
              onClick={() => fileRef.current?.click()}
              className="block mx-auto mt-3 bg-emerald-500 text-[#111b21] px-4 py-2 rounded-full text-sm font-medium"
            >
              Upload QR image
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            {error && <p className="text-yellow-400 text-xs mt-3">{error}</p>}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Phone className="w-12 h-12 text-emerald-400 mb-4" />
          <p className="text-sm text-white/70 mb-4">Enter the contact's phone number</p>
          <input
            type="tel"
            autoFocus
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
            placeholder="+1 555 000 0000"
            className="w-full max-w-xs bg-white/10 rounded-full px-4 py-2.5 text-center outline-none placeholder:text-white/40"
          />
          <button
            onClick={() => {
              if (phone.replace(/\D/g, "").length >= 7) onScan(phone);
            }}
            disabled={phone.replace(/\D/g, "").length < 7}
            className="mt-4 bg-emerald-500 disabled:opacity-40 text-[#111b21] px-6 py-2 rounded-full text-sm font-medium"
          >
            Add contact
          </button>
        </div>
      )}
    </div>
  );
}

// Backup encryption password
export function BackupEncryption({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"intro" | "password" | "confirm" | "done">("intro");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  if (step === "done") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="End-to-end encrypted backup" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <Lock className="w-16 h-16 text-emerald-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Backup is encrypted</h2>
          <p className="text-sm text-[#8696a0]">Your password is required to restore from backup.</p>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="End-to-end encrypted backup" onBack={onBack} />
        <div className="flex-1 overflow-y-auto p-6">
          <Lock className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <p className="text-sm text-[#8696a0] mb-4 text-center">
            Add an extra layer of security by encrypting your backup with a password.
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs mb-6">
            ⚠️ If you lose this password, Chatsapp can't help you recover it. Your backup will be lost.
          </div>
          <button
            onClick={() => setStep("password")}
            className="w-full bg-emerald-500 text-[#111b21] py-3 rounded-full font-semibold"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === "password") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Create password" onBack={() => setStep("intro")} />
        <div className="p-6">
          <p className="text-sm text-[#8696a0] mb-4">Choose a password (at least 6 characters)</p>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Password"
            className="w-full bg-[#202c33] rounded p-3 outline-none"
          />
          <button
            onClick={() => setStep("confirm")}
            disabled={pwd.length < 6}
            className="w-full mt-6 bg-emerald-500 disabled:opacity-40 text-[#111b21] py-3 rounded-full font-semibold"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Confirm password" onBack={() => setStep("password")} />
      <div className="p-6">
        <p className="text-sm text-[#8696a0] mb-4">Re-enter your password</p>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="w-full bg-[#202c33] rounded p-3 outline-none"
        />
        {confirm.length >= 6 && confirm !== pwd && (
          <p className="text-red-400 text-sm mt-2">Passwords don't match</p>
        )}
        <button
          onClick={() => setStep("done")}
          disabled={confirm !== pwd || pwd.length < 6}
          className="w-full mt-6 bg-emerald-500 disabled:opacity-40 text-[#111b21] py-3 rounded-full font-semibold"
        >
          Create
        </button>
      </div>
    </div>
  );
}

// Audio room (voice channel) — like a Twitter Space
export function AudioRoom({
  chat,
  onLeave,
}: {
  chat: { name: string; avatarColor: string; avatarText: string; members?: string[] };
  onLeave: () => void;
}) {
  const [muted, setMuted] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [hand, setHand] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const speakers = (chat.members || ["Alex","Maria"]).slice(0, 4);
  const listeners = (chat.members || ["John","Sara","Mike","Lisa","Tom","Emma"]).slice(4, 12);
  const colors = ["bg-pink-500","bg-blue-500","bg-purple-500","bg-orange-500","bg-emerald-500","bg-rose-500","bg-teal-500"];

  return (
    <div className="absolute inset-0 z-50 flex flex-col text-white theme-keep-white"
      style={{ background: "linear-gradient(160deg, #1a0f3d 0%, #0b141a 100%)" }}>
      <header className="flex items-center justify-between px-4 pt-8 pb-2">
        <button onClick={onLeave} className="p-2 bg-white/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-sm font-medium flex items-center justify-center gap-1">
            <Headphones className="w-4 h-4" /> Audio room
          </div>
          <div className="text-xs text-zinc-300">{chat.name} · {fmt(seconds)}</div>
        </div>
        <button className="p-2 bg-white/10 rounded-full">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        <h3 className="text-xs uppercase text-purple-300 mb-2 flex items-center gap-1">
          <Crown className="w-3 h-3" /> Speakers ({speakers.length + 1})
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="flex flex-col items-center gap-1">
            <div className="relative">
              <Avatar color="bg-emerald-600" text="ME" size="lg" ring="active" />
              {muted && (
                <div className="absolute bottom-0 right-0 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center border-2 border-[#0b141a]">
                  <span className="text-xs">🎙️</span>
                </div>
              )}
            </div>
            <div className="text-xs">You</div>
            <Crown className="w-3 h-3 text-yellow-400" />
          </div>
          {speakers.map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className="relative">
                <Avatar color={colors[i]} text={s.slice(0,2).toUpperCase()} size="lg" ring={Math.random() > 0.5 ? "active" : "none"} />
              </div>
              <div className="text-xs">{s}</div>
            </div>
          ))}
        </div>
        <h3 className="text-xs uppercase text-zinc-400 mb-2">Listeners ({listeners.length})</h3>
        <div className="grid grid-cols-4 gap-3">
          {listeners.map((l, i) => (
            <div key={l} className="flex flex-col items-center gap-1">
              <Avatar color={colors[(i + 3) % colors.length]} text={l.slice(0,2).toUpperCase()} />
              <div className="text-[10px]">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-black/40 px-6 py-4 flex items-center justify-around">
        <button
          onClick={() => setHand((h) => !h)}
          className={`flex flex-col items-center gap-1 ${hand ? "text-yellow-400" : "text-white/70"}`}
        >
          <div className={`w-12 h-12 rounded-full ${hand ? "bg-yellow-500/20" : "bg-white/10"} flex items-center justify-center text-xl`}>
            ✋
          </div>
          <span className="text-[10px]">{hand ? "Hand up" : "Raise"}</span>
        </button>
        <button
          onClick={() => setMuted((m) => !m)}
          className={`flex flex-col items-center gap-1 ${muted ? "text-red-400" : "text-emerald-400"}`}
        >
          <div className={`w-14 h-14 rounded-full ${muted ? "bg-red-500/20" : "bg-emerald-500/20"} flex items-center justify-center`}>
            <Mic className="w-6 h-6" />
          </div>
          <span className="text-[10px]">{muted ? "Muted" : "Live"}</span>
        </button>
        <button
          onClick={onLeave}
          className="flex flex-col items-center gap-1 text-red-400"
        >
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-xl">🚪</span>
          </div>
          <span className="text-[10px]">Leave</span>
        </button>
      </div>
    </div>
  );
}

// Suppress unused
export const _u = { Activity, ChevronRight };
