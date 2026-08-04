import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, X, Check, Smartphone, Monitor, Plus,
  Camera, Image as ImageIcon, Trash, Refresh, Lock, Bell, AlertTriangle, Send
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

// Chatsapp Web QR pairing screen
export function WebQRPair({ onBack }: { onBack: () => void }) {
  const [paired, setPaired] = useState(false);
  // Pairing only completes by a REAL user action: the user scans the QR on
  // their computer and confirms below. No timers, no simulated pairing.

  // Generate random "QR" grid
  const grid: boolean[][] = [];
  for (let r = 0; r < 25; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < 25; c++) {
      const h = (r * 7 + c * 13 + r * c) % 6;
      row.push(h < 3);
    }
    grid.push(row);
  }
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);

  if (paired) {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Linked successfully" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
            <Check className="w-12 h-12 text-[#111b21]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Device linked</h2>
          <p className="text-sm text-[#8696a0] mb-6">
            Chatsapp Web is now active on Chrome (Windows). You can now message from your computer.
          </p>
          <button onClick={onBack} className="bg-emerald-500 text-[#111b21] px-6 py-2 rounded-full font-semibold">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Link a device" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4 text-center">
        <p className="text-sm text-[#8696a0] mb-4">
          To use Chatsapp on your computer:
        </p>
        <ol className="text-sm text-left max-w-xs mx-auto mb-4 space-y-1">
          <li>1. Open <strong>web.whatsapp.com</strong> on your computer</li>
          <li>2. Tap <strong>Link a device</strong> on this phone</li>
          <li>3. Point your phone's camera at the QR code</li>
        </ol>

        {/* Camera viewfinder for scanning */}
        <div className="relative w-64 h-64 mx-auto bg-black rounded-2xl overflow-hidden mb-4">
          <div className="absolute inset-4 border-2 border-emerald-400 rounded-2xl" />
          {/* fake QR being scanned */}
          <div className="absolute inset-8 bg-white p-2 rounded">
            <div className="grid gap-0" style={{ gridTemplateColumns: "repeat(25, 1fr)" }}>
              {grid.map((row, r) =>
                row.map((on, c) => {
                  let fill = on;
                  if (isFinder(r, c)) {
                    const dr = r < 7 ? r : 24 - r;
                    const dc = c < 7 ? c : 24 - c;
                    fill = dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
                      (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
                  }
                  return <div key={`${r}-${c}`} className={`aspect-square ${fill ? "bg-black" : "bg-white"}`} />;
                })
              )}
            </div>
          </div>
          {/* scan line */}
          <div className="absolute top-4 left-4 right-4 h-1 bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]" style={{ animation: "scanline 2s ease-in-out infinite" }} />
        </div>

        <p className="text-xs text-[#8696a0] mb-3">
          Point your phone camera at the QR on your computer screen.
        </p>
        <button
          onClick={() => setPaired(true)}
          className="bg-emerald-500 text-[#111b21] px-5 py-2 rounded-full text-sm font-medium"
        >
          ✓ I've scanned the QR code
        </button>

        <style>{`
          @keyframes scanline {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(220px); }
          }
        `}</style>
      </div>
    </div>
  );
}

// Detailed privacy: Last seen / Profile / About
export function PrivacyOption({
  title,
  field,
  onBack,
}: {
  title: string;
  field: "lastSeen" | "profilePhoto" | "about" | "groups";
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const current = state.privacySettings[field] as string;

  const opts: { id: any; label: string; sub?: string }[] = [
    { id: "everyone", label: "Everyone", sub: "Anyone with your number" },
    { id: "contacts", label: "My contacts", sub: "All people in your address book" },
    { id: "contacts_except", label: "My contacts except…", sub: "Hide from selected contacts" },
    ...(field === "groups" ? [] : [{ id: "nobody", label: "Nobody", sub: "Hidden from everyone" }]),
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title={title} onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <p className="text-sm text-[#8696a0] px-4 py-3">
          If you don't share your {title.toLowerCase()}, you won't be able to see other people's either.
        </p>
        {opts.map((o) => (
          <button
            key={o.id}
            onClick={() => dispatch({ type: "UPDATE_PRIVACY", updates: { [field]: o.id } as any })}
            className="w-full flex items-center px-4 py-3 hover:bg-[#202c33] text-left"
          >
            <div className={`w-5 h-5 rounded-full border-2 mr-3 ${current === o.id ? "border-emerald-500 bg-emerald-500" : "border-zinc-500"}`}>
              {current === o.id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[5px]" />}
            </div>
            <div>
              <div>{o.label}</div>
              {o.sub && <div className="text-xs text-[#8696a0]">{o.sub}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Profile photo upload (camera/gallery/remove)
export function ProfilePhotoEditor({ onBack }: { onBack: () => void }) {
  const { dispatch } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      dispatch({ type: "UPLOAD_PROFILE_PHOTO", dataUrl });
      onBack();
    };
    reader.readAsDataURL(file);
  };

  const presetPhotos = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
  ];

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={onBack}>
      <div className="bg-[#202c33] w-full rounded-t-2xl text-white p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Profile photo</h2>
          <button onClick={onBack}><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-2xl bg-emerald-500/20 flex flex-col items-center justify-center gap-1 hover:bg-emerald-500/30"
          >
            <Camera className="w-6 h-6 text-emerald-400" />
            <span className="text-xs">Camera</span>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-2xl bg-emerald-500/20 flex flex-col items-center justify-center gap-1 hover:bg-emerald-500/30"
          >
            <ImageIcon className="w-6 h-6 text-emerald-400" />
            <span className="text-xs">Gallery</span>
          </button>
          <button
            onClick={() => {
              dispatch({ type: "UPLOAD_PROFILE_PHOTO", dataUrl: "" });
              dispatch({ type: "UPDATE_PROFILE", profile: { photoUrl: undefined } });
              onBack();
            }}
            className="aspect-square rounded-2xl bg-red-500/20 flex flex-col items-center justify-center gap-1 hover:bg-red-500/30"
          >
            <Trash className="w-6 h-6 text-red-400" />
            <span className="text-xs">Remove</span>
          </button>
        </div>

        <h3 className="text-xs uppercase text-emerald-400 mb-2">Suggested</h3>
        <div className="grid grid-cols-4 gap-2">
          {presetPhotos.map((url) => (
            <button
              key={url}
              onClick={() => {
                dispatch({ type: "UPLOAD_PROFILE_PHOTO", dataUrl: url });
                onBack();
              }}
              className="aspect-square rounded-full overflow-hidden bg-cover bg-center"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 p-3 bg-[#111b21] rounded-lg text-xs text-[#8696a0]">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          Your profile photo is end-to-end encrypted.
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}

// Delete account flow with warning
export function DeleteAccountFlow({ onBack, onConfirm }: { onBack: () => void; onConfirm: () => void }) {
  const { state } = useStore();
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);

  const reasons = [
    "I don't use Chatsapp anymore",
    "I'm worried about my privacy",
    "I have another Chatsapp account",
    "I want to change my phone number",
    "Other",
  ];

  if (confirming) {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Delete account" onBack={() => setConfirming(false)} />
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="font-semibold text-center mb-2">Are you absolutely sure?</h3>
            <ul className="text-sm text-[#aebac1] space-y-1">
              <li>• Your account will be permanently deleted</li>
              <li>• Your message history will be erased</li>
              <li>• You will be removed from all your groups</li>
              <li>• Your Google Drive backup will be deleted</li>
              <li>• <strong className="text-red-400">This cannot be undone</strong></li>
            </ul>
          </div>

          <div className="bg-[#202c33] rounded-lg p-4 mb-4">
            <div className="text-xs text-[#8696a0] mb-2">Confirm by entering your phone number</div>
            <div className="text-lg font-mono">{state.profile.phone}</div>
          </div>

          <button
            onClick={onConfirm}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-full"
          >
            DELETE MY ACCOUNT
          </button>
          <button onClick={() => setConfirming(false)} className="w-full mt-2 text-emerald-400 py-2">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Delete my account" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-center mb-3">Deleting your account will:</h2>
        <ul className="text-sm text-[#aebac1] space-y-2 mb-6">
          <li>• Delete your account info and profile photo</li>
          <li>• Remove you from all Chatsapp groups</li>
          <li>• Delete your message history on this phone</li>
          <li>• Delete your Google Drive backup</li>
          <li>• Delete your payment info if applicable</li>
        </ul>

        <h3 className="text-xs uppercase text-emerald-400 mb-2">Why are you leaving?</h3>
        {reasons.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className="w-full flex items-center gap-3 py-2.5 hover:bg-white/5 rounded text-left text-sm"
          >
            <div className={`w-5 h-5 rounded-full border-2 ${reason === r ? "border-emerald-500 bg-emerald-500" : "border-zinc-500"}`}>
              {reason === r && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[5px]" />}
            </div>
            <span>{r}</span>
          </button>
        ))}

        <button
          onClick={() => reason && setConfirming(true)}
          disabled={!reason}
          className="w-full mt-6 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-semibold py-3 rounded-full"
        >
          Delete my account
        </button>
        <button onClick={onBack} className="w-full mt-2 text-emerald-400 py-2">
          Keep my account
        </button>
      </div>
    </div>
  );
}

// Tap-to-react quick bar (small reaction shortcut bar)
export function QuickReactionBar({
  onReact,
  onMore,
  current,
}: {
  onReact: (emoji: string) => void;
  onMore: () => void;
  current?: string;
}) {
  const quick = ["❤️", "👍", "👎", "😂", "😮", "🙏"];
  return (
    <div className="bg-[#233138] rounded-full px-1.5 py-1 flex items-center gap-0.5 shadow-2xl border border-white/10 animate-slide-up">
      {quick.map((e) => (
        <button
          key={e}
          onClick={() => onReact(e)}
          className={`text-xl w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-transform hover:scale-125 ${current === e ? "bg-emerald-500/30" : ""}`}
        >
          {e}
        </button>
      ))}
      <button
        onClick={onMore}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// Animated reaction toast (when adding a reaction, briefly show big animated emoji)
export function ReactionAnimation({ emoji, onDone }: { emoji: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="text-7xl animate-reaction" style={{ animation: "reactionFly 0.9s ease-out forwards" }}>
        {emoji}
      </div>
      <style>{`
        @keyframes reactionFly {
          0% { transform: scale(0) translateY(0); opacity: 0; }
          25% { transform: scale(1.5) translateY(-20px); opacity: 1; }
          75% { transform: scale(1.2) translateY(-100px); opacity: 0.8; }
          100% { transform: scale(0.5) translateY(-200px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Channel notification settings
export function ChannelNotificationSettings({
  channelName,
  channelId,
  onBack,
}: {
  channelName: string;
  channelId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const enabled = state.channelNotifications[channelId] ?? true;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Channel notifications" onBack={onBack} sub={channelName} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 flex items-center justify-between border-b border-[#222d34]">
          <div>
            <div className="font-medium">Receive notifications</div>
            <div className="text-xs text-[#8696a0]">Get notified about new posts</div>
          </div>
          <Toggle
            on={enabled}
            onChange={() => dispatch({ type: "TOGGLE_CHANNEL_NOTIFICATION", channelId })}
          />
        </div>
        {enabled && (
          <>
            <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Sound</h3>
            <button className="w-full px-4 py-3 hover:bg-[#202c33] text-left">
              <div>Notification sound</div>
              <div className="text-xs text-[#8696a0]">Default</div>
            </button>
          </>
        )}
        <button
          onClick={() => {
            if (confirm(`Unfollow ${channelName}?`)) onBack();
          }}
          className="w-full px-4 py-3 hover:bg-[#202c33] text-left text-red-400 mt-4"
        >
          Unfollow channel
        </button>
      </div>
    </div>
  );
}

// Mention list overlay (long-press @mention)
export function MentionList({
  members,
  onClose,
  onPick,
}: {
  members: string[];
  onClose: () => void;
  onPick: (member: string) => void;
}) {
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
      <div className="bg-[#202c33] w-full rounded-t-2xl text-white max-h-[60%] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-[#222d34]">
          <h2 className="text-lg font-medium">Mention</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => onPick("everyone")}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold">@</span>
            </div>
            <div>
              <div className="font-medium">@everyone</div>
              <div className="text-xs text-[#8696a0]">Notify all participants</div>
            </div>
          </button>
          <div className="h-px bg-[#222d34]" />
          {members.map((m) => (
            <button
              key={m}
              onClick={() => onPick(m)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-left"
            >
              <Avatar color="bg-zinc-600" text={m.slice(0, 2).toUpperCase()} size="sm" />
              <span>{m}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Notification history (recent in-app notifications log)
export function NotificationHistory({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  // Build a synthetic notification history from chats with unread messages
  const history = state.chats
    .filter((c) => c.messages.length > 0)
    .map((c) => {
      const last = c.messages[c.messages.length - 1];
      return {
        id: c.id + "-" + last.id,
        chat: c,
        text: last.text || `[${last.type}]`,
        time: last.time,
      };
    })
    .slice(0, 20);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Notification history" onBack={onBack} sub={`${history.length} recent`} />
      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <Bell className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No recent notifications</p>
          </div>
        ) : (
          history.map((h) => (
            <div key={h.id} className="flex items-start gap-3 px-3 py-2.5 border-b border-[#222d34]">
              <Avatar color={h.chat.avatarColor} text={h.chat.avatarText} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{h.chat.name}</span>
                  <span className="text-xs text-[#8696a0]">{h.time}</span>
                </div>
                <div className="text-xs text-[#aebac1] truncate">{h.text}</div>
              </div>
            </div>
          ))
        )}
        <div className="px-4 py-4 text-xs text-[#8696a0] text-center">
          Notifications are stored locally for 7 days.
        </div>
      </div>
    </div>
  );
}

// Suppress unused
export const _u = { Smartphone, Monitor, Refresh, Send };
