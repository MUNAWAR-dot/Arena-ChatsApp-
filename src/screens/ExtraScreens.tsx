import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, Lock, Shield, Cloud, CreditCard, Megaphone,
  Globe, Check, UserPlus, UserMinus, Hash, Plus, X, Phone, Eye,
  Refresh, ChevronRight, FileText, ChatBubble
} from "../icons";
import { Toggle } from "./SubSettings";

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

// Block list
export function BlockedContacts({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const blocked = state.chats.filter((c) => state.settings.blockedContacts.includes(c.id));
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Blocked contacts" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]"
        >
          <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-emerald-400" />
          </div>
          <span>Add blocked contact</span>
        </button>
        {blocked.length === 0 ? (
          <div className="text-center text-sm text-[#8696a0] mt-12 px-8">
            <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            Blocked contacts will be unable to call you or send you messages.
          </div>
        ) : (
          blocked.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2.5">
              <Avatar color={c.avatarColor} text={c.avatarText} />
              <div className="flex-1">
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-[#8696a0]">{c.phone}</div>
              </div>
              <button
                onClick={() => dispatch({ type: "UNBLOCK_CONTACT", chatId: c.id })}
                className="text-emerald-400 text-sm flex items-center gap-1"
              >
                <UserMinus className="w-4 h-4" /> Unblock
              </button>
            </div>
          ))
        )}
      </div>
      {showAdd && (
        <div className="absolute inset-0 bg-[#111b21] z-40 flex flex-col">
          <SubHeader title="Block contact" onBack={() => setShowAdd(false)} />
          <div className="flex-1 overflow-y-auto">
            {state.chats
              .filter((c) => !c.isGroup && !state.settings.blockedContacts.includes(c.id))
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    dispatch({ type: "BLOCK_CONTACT", chatId: c.id });
                    setShowAdd(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
                >
                  <Avatar color={c.avatarColor} text={c.avatarText} />
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-[#8696a0]">{c.phone}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Disappearing messages
export function DisappearingMessages({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const options = [
    { id: "off" as const, label: "Off" },
    { id: "24h" as const, label: "24 hours" },
    { id: "7d" as const, label: "7 days" },
    { id: "90d" as const, label: "90 days" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Default message timer" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <p className="px-4 py-4 text-sm text-[#8696a0]">
          Start new chats with disappearing messages set to your selected duration. This won't affect existing chats.
        </p>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => dispatch({ type: "UPDATE_SETTINGS", settings: { disappearingDefault: o.id } })}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#202c33]"
          >
            <span>{o.label}</span>
            {state.settings.disappearingDefault === o.id && (
              <Check className="w-5 h-5 text-emerald-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Two-step verification
export function TwoStepVerification({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"intro" | "set" | "confirm" | "done">(state.settings.twoStepEnabled ? "done" : "intro");

  if (step === "done") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Two-step verification" onBack={onBack} />
        <div className="flex-1 overflow-y-auto">
          <div className="text-center px-8 py-10">
            <Shield className="w-16 h-16 mx-auto mb-3 text-emerald-400" />
            <p className="text-sm text-[#8696a0]">Two-step verification is enabled.</p>
          </div>
          <button className="w-full px-4 py-3 hover:bg-[#202c33] text-left">Change PIN</button>
          <button className="w-full px-4 py-3 hover:bg-[#202c33] text-left">Add email address</button>
          <button
            onClick={() => {
              dispatch({ type: "UPDATE_SETTINGS", settings: { twoStepEnabled: false, twoStepPin: undefined } });
              setStep("intro");
            }}
            className="w-full px-4 py-3 hover:bg-[#202c33] text-left text-red-400"
          >
            Turn off two-step verification
          </button>
        </div>
      </div>
    );
  }

  if (step === "intro") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Two-step verification" onBack={onBack} />
        <div className="flex-1 flex flex-col p-6 items-center text-center">
          <Shield className="w-20 h-20 text-emerald-400 mb-6" />
          <p className="text-sm text-[#8696a0] mb-8">
            For added security, enable two-step verification. You'll be asked for a PIN when registering your phone number with Chatsapp again.
          </p>
          <button
            onClick={() => setStep("set")}
            className="bg-emerald-500 text-[#111b21] font-semibold py-2 px-8 rounded-full"
          >
            Enable
          </button>
        </div>
      </div>
    );
  }

  if (step === "set") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Enter PIN" onBack={() => setStep("intro")} />
        <div className="p-6">
          <p className="text-sm text-[#8696a0] mb-4">Enter a 6-digit PIN you'll remember.</p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="------"
            className="w-full bg-transparent text-center text-3xl tracking-[0.6em] border-b border-emerald-500 outline-none pb-2"
          />
          <button
            disabled={pin.length !== 6}
            onClick={() => setStep("confirm")}
            className="mt-8 w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] font-semibold py-2 rounded-full"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Confirm PIN" onBack={() => setStep("set")} />
      <div className="p-6">
        <p className="text-sm text-[#8696a0] mb-4">Re-enter your PIN.</p>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
          placeholder="------"
          className="w-full bg-transparent text-center text-3xl tracking-[0.6em] border-b border-emerald-500 outline-none pb-2"
        />
        {confirm.length === 6 && confirm !== pin && (
          <p className="text-red-400 text-sm mt-3 text-center">PINs don't match</p>
        )}
        <button
          disabled={confirm !== pin}
          onClick={() => {
            dispatch({ type: "UPDATE_SETTINGS", settings: { twoStepEnabled: true, twoStepPin: pin } });
            setStep("done");
          }}
          className="mt-8 w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] font-semibold py-2 rounded-full"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

// App language
export function AppLanguage({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const langs = ["English","Español","Français","Deutsch","Italiano","Português","हिन्दी","العربية","中文","日本語","한국어","Русский","Türkçe","Bahasa Indonesia"];
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="App language" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {langs.map((l) => (
          <button
            key={l}
            onClick={() => dispatch({ type: "UPDATE_SETTINGS", settings: { language: l } })}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#202c33]"
          >
            <span>{l}</span>
            {state.settings.language === l && <Check className="w-5 h-5 text-emerald-400" />}
          </button>
        ))}
      </div>
    </div>
  );
}

// Backup
export function ChatBackup({ onBack }: { onBack: () => void }) {
  const [backingUp, setBackingUp] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastBackup, setLastBackup] = useState("Today at 2:00 AM");
  const [includeVideos, setIncludeVideos] = useState(true);
  const [encrypted, setEncrypted] = useState(true);
  const [frequency, setFrequency] = useState("Daily");
  const [account] = useState("user@gmail.com");
  const [backupSize, setBackupSize] = useState(256);

  const startBackup = () => {
    setBackingUp(true);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setBackingUp(false);
          setLastBackup("Just now");
          setBackupSize(256 + Math.floor(Math.random() * 40));
          return 100;
        }
        return p + 4;
      });
    }, 120);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Chat backup" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {/* Header card */}
        <div className="mx-4 mt-4 bg-gradient-to-br from-emerald-600/20 to-teal-600/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#25D366]/20 flex items-center justify-center">
            <Cloud className="w-7 h-7 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="font-semibold">Google Drive backup</div>
            <div className="text-xs text-[#8696a0]">Messages and media are backed up safely</div>
          </div>
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1 rounded-full">🔒 Encrypted</span>
        </div>

        {/* Last backup card */}
        <div className="mx-4 mt-3 bg-[#202c33] rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-emerald-400 font-bold">{lastBackup === "Just now" ? "✓" : "🕐"}</div>
            <div className="text-[10px] text-[#8696a0] mt-1">Last backup</div>
            <div className="text-xs font-medium truncate">{lastBackup}</div>
          </div>
          <div>
            <div className="text-emerald-400 font-bold">{backupSize} MB</div>
            <div className="text-[10px] text-[#8696a0] mt-1">Backup size</div>
            <div className="text-xs font-medium">~{Math.round(backupSize / 25)} chats</div>
          </div>
          <div>
            <div className="text-emerald-400 font-bold">{frequency}</div>
            <div className="text-[10px] text-[#8696a0] mt-1">Frequency</div>
            <div className="text-xs font-medium">{account.slice(0, 8)}…</div>
          </div>
        </div>

        {/* Progress */}
        {backingUp && (
          <div className="mx-4 mt-3 bg-[#202c33] rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                Backing up…
              </span>
              <span className="text-emerald-400 font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-[#111b21] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs text-[#8696a0] mt-2 flex items-center gap-1.5">
              {progress < 30 ? (
                <><FileText className="w-3.5 h-3.5" /> Backing up media…</>
              ) : progress < 70 ? (
                <><ChatBubble className="w-3.5 h-3.5" /> Backing up messages…</>
              ) : (
                <><Lock className="w-3.5 h-3.5" /> Encrypting backup…</>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mx-4 mt-4 bg-[#202c33] rounded-2xl overflow-hidden">
          <button
            onClick={startBackup}
            disabled={backingUp}
            className="w-full px-4 py-3.5 hover:bg-[#2a3942] text-left flex items-center gap-3 disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Refresh className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-emerald-400">{backingUp ? "Backing up…" : "Back up now"}</div>
              <div className="text-xs text-[#8696a0]">Start a manual backup right now</div>
            </div>
          </button>
          <div className="h-px bg-[#111b21]" />
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Back up frequency</div>
              <div className="text-xs text-[#8696a0]">How often to auto-backup</div>
            </div>
            <div className="flex gap-1.5">
              {["Daily", "Weekly", "Monthly"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFrequency(f)}
                  className={`px-2.5 py-1 rounded-full text-xs ${frequency === f ? "bg-emerald-500 text-[#111b21]" : "bg-[#111b21] text-[#aebac1]"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="h-px bg-[#111b21]" />
          <button className="w-full px-4 py-3 hover:bg-[#2a3942] text-left flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Back up to</div>
              <div className="text-xs text-[#8696a0]">{account}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        </div>

        {/* Options */}
        <div className="mx-4 mt-4 bg-[#202c33] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Include videos</div>
              <div className="text-xs text-[#8696a0]">Adds ~{(backupSize * 0.6).toFixed(0)} MB to backups</div>
            </div>
            <Toggle on={includeVideos} onChange={setIncludeVideos} />
          </div>
          <div className="h-px bg-[#111b21]" />
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">End-to-end encrypted backup</div>
              <div className="text-xs text-[#8696a0]">
                {encrypted ? "Protected with your password" : "Not protected"}
              </div>
            </div>
            <Toggle on={encrypted} onChange={setEncrypted} />
          </div>
        </div>

        {/* Info */}
        <div className="mx-4 mt-4 bg-[#182229] rounded-xl p-3 text-xs text-[#8696a0] flex items-start gap-2">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            {encrypted
              ? "Your backup is protected with an end-to-end encrypted password. Chatsapp can't read it."
              : "Tip: enable end-to-end encrypted backup for extra security."}
          </span>
        </div>
      </div>
    </div>
  );
}

// App lock
export function AppLockSettings({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="App lock" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 text-center">
          <Lock className="w-16 h-16 mx-auto mb-3 text-emerald-400" />
          <p className="text-sm text-[#8696a0]">
            When enabled, you'll need to use fingerprint or PIN to unlock Chatsapp.
          </p>
        </div>
        <div className="px-4 py-3 flex items-center justify-between border-t border-[#222d34]">
          <div>
            <div>Unlock with PIN</div>
            <div className="text-xs text-[#8696a0]">Require PIN to open Chatsapp</div>
          </div>
          <Toggle
            on={state.settings.appLock}
            onChange={(v) => {
              if (v) {
                const pin = prompt("Set a 4-digit PIN");
                if (pin && /^\d{4}$/.test(pin)) {
                  dispatch({ type: "UPDATE_SETTINGS", settings: { appLock: true, appLockPin: pin } });
                }
              } else {
                dispatch({ type: "UPDATE_SETTINGS", settings: { appLock: false, appLockPin: undefined } });
              }
            }}
          />
        </div>
        {state.settings.appLock && (
          <>
            <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Auto-lock</h3>
            {([
              { id: "immediate", label: "Immediately" },
              { id: "1min", label: "After 1 minute" },
              { id: "15min", label: "After 15 minutes" },
              { id: "30min", label: "After 30 minutes" },
              { id: "1hour", label: "After 1 hour" },
            ] as const).map((o) => (
              <button
                key={o.id}
                onClick={() => dispatch({ type: "UPDATE_SETTINGS", settings: { autoLock: o.id } })}
                className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between"
              >
                <span>{o.label}</span>
                {state.settings.autoLock === o.id && <Check className="w-5 h-5 text-emerald-400" />}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Payments
export function Payments({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Payments" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-8 text-center">
          <CreditCard className="w-20 h-20 mx-auto mb-4 text-emerald-400" />
          <h2 className="text-xl font-semibold mb-2">Chatsapp Payments</h2>
          <p className="text-sm text-[#8696a0]">
            Send and receive money securely with end-to-end encryption.
          </p>
        </div>
        <div className="px-4 space-y-2">
          <button className="w-full bg-emerald-500 text-[#111b21] font-semibold py-3 rounded-full">
            Add payment method
          </button>
        </div>
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-6 pb-2">Recent transactions</h3>
        <div className="text-center text-sm text-[#8696a0] py-8">
          No transactions yet
        </div>
        <div className="px-4 py-3 border-t border-[#222d34] text-xs text-[#8696a0]">
          🔒 Payments are protected with end-to-end encryption
        </div>
      </div>
    </div>
  );
}

// Broadcast list
export function BroadcastList({ onBack, onCreate }: { onBack: () => void; onCreate: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Broadcast lists" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-8 text-center">
          <Megaphone className="w-16 h-16 mx-auto mb-3 text-emerald-400" />
          <p className="text-sm text-[#8696a0] mb-4">
            Broadcast messages to multiple contacts. Recipients will receive the message as a normal message and can reply privately.
          </p>
          <button
            onClick={onCreate}
            className="bg-emerald-500 text-[#111b21] font-semibold py-2 px-6 rounded-full"
          >
            New list
          </button>
        </div>
      </div>
    </div>
  );
}

// Channel detail
export function ChannelDetail({
  channelName,
  onBack,
}: {
  channelName: string;
  onBack: () => void;
}) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="font-medium">{channelName}</div>
      </header>
      <div className="flex flex-col items-center py-6 px-4 border-b border-[#222d34]">
        <Avatar color="bg-emerald-600" text={channelName.slice(0, 2).toUpperCase()} size="2xl" />
        <h2 className="text-2xl font-medium mt-4">{channelName}</h2>
        <div className="text-sm text-[#8696a0] mt-1">192M followers · ✓ Verified</div>
        <button
          onClick={() => setFollowing((v) => !v)}
          className={`mt-4 px-6 py-2 rounded-full font-medium ${
            following ? "bg-[#202c33] text-emerald-400" : "bg-emerald-500 text-[#111b21]"
          }`}
        >
          {following ? "Following ✓" : "Follow"}
        </button>
      </div>
      <div className="px-4 py-4 border-b border-[#222d34]">
        <div className="text-xs text-[#8696a0] mb-1">About</div>
        <div className="text-sm">Stay updated with the latest news and announcements from {channelName}. End-to-end encrypted.</div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0b141a]">
        {[
          { text: "🚀 New update available! Check it out.", time: "2h ago", reactions: 1248 },
          { text: "Thank you for being part of our community ❤️", time: "Yesterday", reactions: 5621 },
          { text: "We're hiring! Visit our careers page.", time: "Mon", reactions: 342 },
        ].map((p, i) => (
          <div key={i} className="bg-[#202c33] rounded-lg p-3">
            <div className="text-sm">{p.text}</div>
            <div className="flex items-center gap-3 mt-2 text-xs text-[#8696a0]">
              <button className="hover:text-emerald-400">👍 {p.reactions}</button>
              <span>{p.time}</span>
              <Eye className="w-3 h-3 ml-auto" />
              <span>2.1M views</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Group manage members
export function GroupMembers({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const chat = state.chats.find((c) => c.id === chatId);
  const [adding, setAdding] = useState(false);
  if (!chat || !chat.isGroup) return null;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Group members" onBack={onBack} sub={`${chat.members?.length || 0} members`} />
      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => setAdding(true)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-[#111b21]" />
          </div>
          <span className="font-medium">Add members</span>
          <span className="ml-auto text-[10px] text-[#8696a0]">Admin only</span>
        </button>
        {chat.members?.map((m) => (
          <div key={m} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#202c33]">
            <Avatar
              color={m === "You" ? "bg-emerald-600" : "bg-zinc-600"}
              text={m.slice(0, 2).toUpperCase()}
            />
            <div className="flex-1">
              <div className="font-medium flex items-center gap-1.5">
                {m}
                {m === "You" && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
              <div className="text-xs text-[#8696a0]">{m === "You" ? "Admin · Group creator" : "Member"}</div>
            </div>
            {m !== "You" && (
              <button
                onClick={() => {
                  if (confirm(`Remove ${m} from group?`)) {
                    dispatch({ type: "REMOVE_GROUP_MEMBER", chatId, member: m });
                  }
                }}
                className="text-red-400 p-2 hover:bg-red-500/10 rounded-full"
                title="Remove member"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {adding && (
        <div className="absolute inset-0 bg-[#111b21] z-40 flex flex-col">
          <SubHeader title="Add members" onBack={() => setAdding(false)} />
          <div className="flex-1 overflow-y-auto">
            {state.chats
              .filter((c) => !c.isGroup && !chat.members?.includes(c.name))
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    dispatch({ type: "ADD_GROUP_MEMBER", chatId, member: c.name });
                    setAdding(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
                >
                  <Avatar color={c.avatarColor} text={c.avatarText} />
                  <div className="font-medium">{c.name}</div>
                  <Plus className="w-4 h-4 text-emerald-400 ml-auto" />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// App lock screen (PIN entry to unlock app)
export function AppLockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { state } = useStore();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const onChange = (v: string) => {
    const clean = v.replace(/[^0-9]/g, "").slice(0, 4);
    setPin(clean);
    setError(false);
    if (clean.length === 4) {
      if (clean === state.settings.appLockPin) {
        setTimeout(onUnlock, 200);
      } else {
        setError(true);
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#111b21] text-white p-6">
      <Lock className="w-16 h-16 text-emerald-400 mb-6" />
      <h1 className="text-xl font-semibold mb-2">Enter PIN</h1>
      <p className="text-sm text-[#8696a0] mb-8">Chatsapp is locked</p>
      <div className="flex gap-3 mb-2">
        {[0,1,2,3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 ${
              error ? "border-red-400 bg-red-400" :
              pin.length > i ? "border-emerald-400 bg-emerald-400" : "border-zinc-500"
            }`}
          />
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">Incorrect PIN</p>}
      <input
        type="password"
        inputMode="numeric"
        autoFocus
        value={pin}
        onChange={(e) => onChange(e.target.value)}
        className="opacity-0 absolute"
      />
      <div className="grid grid-cols-3 gap-3 mt-8">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <button
            key={n}
            onClick={() => onChange(pin + n)}
            className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-2xl"
          >
            {n}
          </button>
        ))}
        <div />
        <button
          onClick={() => onChange(pin + "0")}
          className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-2xl"
        >
          0
        </button>
        <button
          onClick={() => setPin(pin.slice(0, -1))}
          className="w-16 h-16 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-sm"
        >
          ⌫
        </button>
      </div>
    </div>
  );
}

// Help: list languages used in unused imports — silence warnings
export const _unused = { Globe, Hash, X, Phone };
