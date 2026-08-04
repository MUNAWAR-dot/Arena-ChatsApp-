import { useEffect, useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, Trash, Image as ImageIcon, Cake, Sparkles,
  Send, ChevronRight, Check, X, Mic, Pause, Play
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

// Storage cleanup wizard — 3-step flow
export function StorageCleanupWizard({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState<"intro" | "review" | "done">("intro");
  const [selected, setSelected] = useState<Set<string>>(new Set()); // chatIds to clean

  // Stats
  const oldMedia = state.chats.flatMap((c) =>
    c.messages.filter((m) => m.type === "image" || m.type === "doc" || m.type === "voice").map((m) => ({ chat: c, msg: m }))
  );
  const fwdManyTimes = state.chats.flatMap((c) =>
    c.messages.filter((m) => m.forwarded && (m.forwardCount || 0) > 5).map((m) => ({ chat: c, msg: m }))
  );

  if (step === "done") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
          <Check className="w-12 h-12 text-[#111b21]" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Cleanup complete!</h2>
        <p className="text-sm text-[#8696a0] mb-2">Freed up approximately</p>
        <p className="text-3xl font-bold text-emerald-400 mb-6">{(selected.size * 12.4).toFixed(1)} MB</p>
        <button onClick={onBack} className="bg-emerald-500 text-[#111b21] px-6 py-2 rounded-full font-semibold">
          Done
        </button>
      </div>
    );
  }

  if (step === "review") {
    const candidates = state.chats.filter((c) => c.messages.length > 0);
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Choose chats to clean" onBack={() => setStep("intro")} />
        <div className="px-4 py-3 text-sm text-[#8696a0]">
          We'll delete media older than 30 days from selected chats. Text messages won't be deleted.
        </div>
        <div className="flex-1 overflow-y-auto">
          {candidates.map((c) => {
            const isSel = selected.has(c.id);
            const mediaCount = c.messages.filter((m) => m.type === "image" || m.type === "doc" || m.type === "voice").length;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelected((s) => {
                    const next = new Set(s);
                    if (next.has(c.id)) next.delete(c.id); else next.add(c.id);
                    return next;
                  });
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
              >
                <div className={`w-5 h-5 rounded border-2 ${isSel ? "border-emerald-500 bg-emerald-500" : "border-zinc-500"} flex items-center justify-center`}>
                  {isSel && <Check className="w-3 h-3 text-white" />}
                </div>
                <Avatar color={c.avatarColor} text={c.avatarText} size="sm" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{c.name}</div>
                  <div className="text-xs text-[#8696a0]">{mediaCount} media item{mediaCount !== 1 ? "s" : ""}</div>
                </div>
                <span className="text-xs text-[#8696a0]">~{(mediaCount * 1.2).toFixed(1)} MB</span>
              </button>
            );
          })}
        </div>
        <div className="border-t border-[#222d34] p-3">
          <button
            onClick={() => {
              selected.forEach((cid) => {
                const c = state.chats.find((x) => x.id === cid);
                c?.messages.forEach((m) => {
                  if (m.type === "image" || m.type === "doc" || m.type === "voice") {
                    dispatch({ type: "DELETE_MESSAGE", chatId: cid, messageId: m.id });
                  }
                });
              });
              setStep("done");
            }}
            disabled={selected.size === 0}
            className="w-full bg-red-500 disabled:opacity-40 text-white py-3 rounded-full font-semibold"
          >
            Delete from {selected.size} chat{selected.size !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Free up space" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6">
        <Sparkles className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <p className="text-sm text-[#8696a0] mb-6 text-center">
          Find and delete media you don't need to free up storage.
        </p>

        <div className="space-y-2 mb-6">
          <div className="bg-[#202c33] rounded-lg p-3 flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-purple-400" />
            <div className="flex-1">
              <div className="font-medium text-sm">Old media</div>
              <div className="text-xs text-[#8696a0]">{oldMedia.length} items · approx {(oldMedia.length * 0.8).toFixed(0)} MB</div>
            </div>
          </div>
          <div className="bg-[#202c33] rounded-lg p-3 flex items-center gap-3">
            <Send className="w-8 h-8 text-orange-400" />
            <div className="flex-1">
              <div className="font-medium text-sm">Forwarded many times</div>
              <div className="text-xs text-[#8696a0]">{fwdManyTimes.length} messages · approx {(fwdManyTimes.length * 0.5).toFixed(0)} MB</div>
            </div>
          </div>
          <div className="bg-[#202c33] rounded-lg p-3 flex items-center gap-3">
            <Trash className="w-8 h-8 text-red-400" />
            <div className="flex-1">
              <div className="font-medium text-sm">Larger than 5 MB</div>
              <div className="text-xs text-[#8696a0]">Detect large files</div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep("review")}
          className="w-full bg-emerald-500 text-[#111b21] py-3 rounded-full font-semibold"
        >
          Review and delete
        </button>
      </div>
    </div>
  );
}

// Birthday reminder popup (shown on launch)
export function BirthdayPopup({
  birthdayChats,
  onClose,
  onMessage,
}: {
  birthdayChats: { id: string; name: string; avatarColor: string; avatarText: string }[];
  onClose: () => void;
  onMessage: (chatId: string) => void;
}) {
  return (
    <div className="absolute inset-0 z-[70] bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#202c33] rounded-2xl p-5 max-w-xs w-full text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Cake className="w-6 h-6 text-pink-400" />
            <h2 className="text-lg font-medium">🎉 Birthdays today</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-[#8696a0] mb-3">
          Wish a happy birthday to:
        </p>
        <div className="space-y-2">
          {birthdayChats.map((c) => (
            <button
              key={c.id}
              onClick={() => { onMessage(c.id); onClose(); }}
              className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg text-left"
            >
              <Avatar color={c.avatarColor} text={c.avatarText} />
              <div className="flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-pink-300">🎂 Tap to wish them</div>
              </div>
              <Send className="w-4 h-4 text-emerald-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// App info & changelog
export function AppInfo({ onBack, onBeta }: { onBack: () => void; onBeta?: () => void }) {
  const { state } = useStore();
  const changelog = [
    { version: "2.26.10.74", date: "Today", notes: ["📱 Sign in with Google, Apple, or Facebook", "🌍 Country picker with 120+ countries", "⌨️ New keyboard shortcuts panel"] },
    { version: "2.26.9.50", date: "Last week", notes: ["✨ AI personas", "🔒 Chat lock improvements", "📞 Audio rooms"] },
    { version: "2.26.8.22", date: "2 weeks ago", notes: ["🎨 Per-chat wallpapers", "📊 Polls with multi-vote", "🎙️ Voice transcription"] },
    { version: "2.26.7.10", date: "Last month", notes: ["💼 Business catalog & cart", "📌 Pinned messages", "🌐 14 new languages"] },
    { version: "2.26.6.0", date: "2 months ago", notes: ["🛡️ Security improvements", "🎨 New chat wallpapers", "⚡ Faster message delivery"] },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="App info" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 text-center border-b border-[#222d34]">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 mx-auto mb-3 flex items-center justify-center">
            <span className="text-5xl">💬</span>
          </div>
          <h2 className="text-xl font-semibold">Chatsapp</h2>
          <p className="text-sm text-[#8696a0] mt-1">Version {state.appVersion}</p>
          <p className="text-xs text-[#8696a0] mt-1">from <span className="text-emerald-400">Munawar</span></p>
        </div>

        <button
          onClick={onBeta}
          className="w-full px-4 py-3 flex items-center justify-between border-b border-[#222d34] hover:bg-[#202c33] text-left"
        >
          <div>
            <div className="font-medium">Beta program</div>
            <div className="text-xs text-[#8696a0]">{state.betaProgram ? "Enrolled" : "Try new features early"}</div>
          </div>
          {state.betaProgram ? <Check className="w-5 h-5 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-[#8696a0]" />}
        </button>

        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-4 pb-2">What's new</h3>
        {changelog.map((c, i) => (
          <div key={i} className="px-4 py-3 border-b border-[#222d34]">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-sm">v{c.version}</span>
              <span className="text-xs text-[#8696a0]">{c.date}</span>
            </div>
            <ul className="text-sm text-[#aebac1] space-y-1 mt-1">
              {c.notes.map((n, j) => (
                <li key={j}>• {n}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="px-4 py-4 text-xs text-[#8696a0]">
          <p>Compiled with React, TypeScript & Tailwind CSS.</p>
          <p className="mt-1">© 2026 Munawar</p>
        </div>
      </div>
    </div>
  );
}

// Voice mini-player (floating at top of screen when voice plays)
export function VoiceMiniPlayer() {
  const { state, dispatch } = useStore();
  const v = state.voiceMiniPlayerMsg;
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing || !v) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setPlaying(false); return 0; }
        return p + 2;
      });
    }, 200);
    return () => clearInterval(id);
  }, [playing, v]);

  if (!v) return null;
  const chat = state.chats.find((c) => c.id === v.chatId);
  if (!chat) return null;

  return (
    <div className="absolute top-2 left-2 right-2 z-[55] bg-[#202c33] rounded-xl shadow-2xl border border-[#25D366]/30 flex items-center gap-2 px-2 py-2 animate-slide-up">
      <Avatar color={chat.avatarColor} text={chat.avatarText} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate">{chat.name}</div>
        <div className="h-1 bg-white/10 rounded-full mt-1">
          <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <button
        onClick={() => setPlaying((p) => !p)}
        className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={() => dispatch({ type: "SET_VOICE_MINI", data: null })}
        className="text-[#8696a0] p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Profile photo history
export function ProfilePhotoHistory({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const all = [
    ...(state.profile.photoUrl ? [{ url: state.profile.photoUrl, current: true }] : []),
    ...state.profilePhotoHistory.map((u) => ({ url: u, current: false })),
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Profile photo history" onBack={onBack} sub={`${all.length} photo${all.length !== 1 ? "s" : ""}`} />
      <div className="flex-1 overflow-y-auto p-3">
        {all.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No profile photos yet.</p>
            <p className="text-xs mt-1">Your profile photos appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {all.map((p, i) => (
              <div key={i} className="relative aspect-square">
                <div
                  className="w-full h-full rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${p.url})` }}
                />
                {p.current && (
                  <span className="absolute top-2 left-2 bg-emerald-500 text-[#111b21] text-[10px] px-2 py-0.5 rounded-full font-medium">
                    Current
                  </span>
                )}
                {!p.current && (
                  <button
                    onClick={() => dispatch({ type: "UPLOAD_PROFILE_PHOTO", dataUrl: p.url })}
                    className="absolute bottom-2 right-2 bg-emerald-500 text-[#111b21] text-[10px] px-2 py-1 rounded-full font-medium"
                  >
                    Restore
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Beta program enrollment
export function BetaProgram({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [enrolled, setEnrolled] = useState(state.betaProgram);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Chatsapp Beta" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-center mb-2">Join the Beta</h2>
        <p className="text-sm text-[#8696a0] text-center mb-6">
          Get early access to new features before they're released to everyone.
        </p>

        <div className="bg-[#202c33] rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" /> Beta perks
          </h3>
          <ul className="text-xs text-[#aebac1] space-y-1">
            <li>• Try features weeks before public release</li>
            <li>• Provide feedback that shapes the product</li>
            <li>• Access to experimental AI personas</li>
            <li>• Early stickers and themes</li>
          </ul>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6 text-xs">
          ⚠️ Beta builds may be unstable. You can opt out anytime.
        </div>

        <button
          onClick={() => {
            dispatch({ type: "TOGGLE_BETA" });
            setEnrolled(!enrolled);
          }}
          className={`w-full py-3 rounded-full font-semibold ${enrolled ? "bg-red-500/20 text-red-400" : "bg-emerald-500 text-[#111b21]"}`}
        >
          {enrolled ? "Leave beta program" : "Join beta program"}
        </button>

        {enrolled && (
          <div className="mt-4 text-center text-xs text-emerald-400 flex items-center justify-center gap-1">
            <Check className="w-4 h-4" /> You're enrolled in beta
          </div>
        )}
      </div>
    </div>
  );
}

// Star messages organized by chat
export function StarredByChat({
  onBack,
  onOpenChat,
}: {
  onBack: () => void;
  onOpenChat: (chatId: string, msgId: string) => void;
}) {
  const { state } = useStore();
  // Group starred by chatId
  const grouped: Record<string, { chatId: string; chatName: string; chatColor: string; chatText: string; messages: any[] }> = {};
  state.starred.forEach((key) => {
    const [chatId, msgId] = key.split(":");
    const chat = state.chats.find((c) => c.id === chatId);
    if (!chat) return;
    const msg = chat.messages.find((m) => m.id === msgId);
    if (!msg) return;
    if (!grouped[chatId]) {
      grouped[chatId] = {
        chatId,
        chatName: chat.name,
        chatColor: chat.avatarColor,
        chatText: chat.avatarText,
        messages: [],
      };
    }
    grouped[chatId].messages.push(msg);
  });

  const groups = Object.values(grouped);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Starred messages" onBack={onBack} sub={`${state.starred.length} starred · ${groups.length} chat${groups.length !== 1 ? "s" : ""}`} />
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <span className="text-5xl block mb-3">⭐</span>
            <p className="text-sm">No starred messages yet</p>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.chatId}>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#181f24] sticky top-0">
                <Avatar color={g.chatColor} text={g.chatText} size="sm" />
                <span className="font-medium text-sm">{g.chatName}</span>
                <span className="text-xs text-[#8696a0]">· {g.messages.length} starred</span>
              </div>
              {g.messages.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onOpenChat(g.chatId, m.id)}
                  className="w-full px-4 py-2.5 hover:bg-[#202c33] text-left border-b border-[#222d34]"
                >
                  <div className="text-xs text-[#8696a0] mb-1">{m.sent ? "You" : g.chatName} · {m.time}</div>
                  <div className="text-sm">{m.text || `[${m.type}]`}</div>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Suppress unused
export const _u = { Mic, ChevronRight };
