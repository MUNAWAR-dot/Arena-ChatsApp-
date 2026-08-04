import { useState } from "react";
import { useStore } from "../store";
import {
  ArrowLeft, ChevronRight, Bell, Users, Phone, VolumeUp, VolumeX, Play, ChatBubble
} from "../icons";
import { wallpaperOptions } from "../wallpapers";
import type { Wallpaper } from "../store";

export function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`w-11 h-6 rounded-full transition-colors relative ${on ? "bg-emerald-500" : "bg-zinc-600"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${on ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="flex items-center gap-3 px-2 py-3 bg-[#202c33]">
      <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h1 className="text-lg font-medium">{title}</h1>
    </header>
  );
}

export function AccountSettings({
  onBack,
  onTwoStep,
  onAppLock,
  onConnected,
  onMultiAccount,
  onDataExport,
  onMoveChats,
  onDeleteAccount,
}: {
  onBack: () => void;
  onTwoStep: () => void;
  onAppLock: () => void;
  onConnected?: () => void;
  onMultiAccount?: () => void;
  onDataExport?: () => void;
  onMoveChats?: () => void;
  onDeleteAccount?: () => void;
}) {
  const { state } = useStore();
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Account" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <button className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between">
          <div>
            <div>Security notifications</div>
            <div className="text-xs text-[#8696a0]">Get notified when security code changes</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onTwoStep} className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between">
          <div>
            <div>Two-step verification</div>
            <div className="text-xs text-[#8696a0]">{state.settings.twoStepEnabled ? "Enabled" : "Add a PIN for extra security"}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onAppLock} className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between">
          <div>
            <div>App lock</div>
            <div className="text-xs text-[#8696a0]">{state.settings.appLock ? "Enabled" : "Lock with PIN"}</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onConnected} className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between">
          <div>
            <div>Connected accounts</div>
            <div className="text-xs text-[#8696a0]">Google, Apple, Facebook</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onMoveChats} className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between">
          <div>
            <div>Move chats to another phone</div>
            <div className="text-xs text-[#8696a0]">Transfer to a new device</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        {[
          { label: "Change number", sub: "Migrate your account to a new number" },
        ].map((it) => (
          <button key={it.label} className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between">
            <div>
              <div>{it.label}</div>
              <div className="text-xs text-[#8696a0]">{it.sub}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        ))}
        <button onClick={onDataExport} className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between">
          <div>
            <div>Request account info</div>
            <div className="text-xs text-[#8696a0]">Get a report of your account information</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onMultiAccount} className="w-full px-4 py-3 hover:bg-[#202c33] text-left flex items-center justify-between">
          <div>
            <div>Add account</div>
            <div className="text-xs text-[#8696a0]">Use up to two accounts on this device</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button
          onClick={onDeleteAccount}
          className="w-full px-4 py-3 hover:bg-[#202c33] text-left text-red-400"
        >
          Delete my account
        </button>
      </div>
    </div>
  );
}

export function PrivacySettings({
  onBack,
  onBlocked,
  onDisappearing,
  onPrivacyDetail,
}: {
  onBack: () => void;
  onBlocked: () => void;
  onDisappearing: () => void;
  onPrivacyDetail?: (field: "lastSeen" | "profilePhoto" | "about" | "groups", title: string) => void;
}) {
  const { state, dispatch } = useStore();
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Privacy" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Who can see my personal info</h3>
        {([
          { label: "Last seen and online", field: "lastSeen" as const },
          { label: "Profile photo", field: "profilePhoto" as const },
          { label: "About", field: "about" as const },
          { label: "Groups", field: "groups" as const },
        ]).map((it) => {
          const val = state.privacySettings[it.field];
          const valueText =
            val === "everyone" ? "Everyone" :
            val === "contacts" ? "My contacts" :
            val === "contacts_except" ? "My contacts except…" :
            val === "nobody" ? "Nobody" :
            "Everyone";
          return (
            <button
              key={it.label}
              onClick={() => onPrivacyDetail?.(it.field, it.label)}
              className="w-full px-4 py-3 hover:bg-[#202c33] text-left"
            >
              <div>{it.label}</div>
              <div className="text-xs text-[#8696a0]">{valueText}</div>
            </button>
          );
        })}
        <div className="px-4 py-3 flex items-center justify-between hover:bg-[#202c33]">
          <div>
            <div>Read receipts</div>
            <div className="text-xs text-[#8696a0]">If turned off, you won't send or receive read receipts.</div>
          </div>
          <Toggle on={state.settings.readReceipts} onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { readReceipts: v } })} />
        </div>
        <div className="px-4 py-3 flex items-center justify-between hover:bg-[#202c33]">
          <div>
            <div>Show last seen</div>
            <div className="text-xs text-[#8696a0]">Show others when you were last online.</div>
          </div>
          <Toggle on={state.settings.lastSeen} onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { lastSeen: v } })} />
        </div>
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Disappearing messages</h3>
        <button onClick={onDisappearing} className="w-full px-4 py-3 hover:bg-[#202c33] text-left">
          <div>Default message timer</div>
          <div className="text-xs text-[#8696a0]">
            {state.settings.disappearingDefault === "off" ? "Off" :
             state.settings.disappearingDefault === "24h" ? "24 hours" :
             state.settings.disappearingDefault === "7d" ? "7 days" : "90 days"}
          </div>
        </button>
        <button onClick={onBlocked} className="w-full px-4 py-3 hover:bg-[#202c33] text-left">
          <div>Blocked contacts</div>
          <div className="text-xs text-[#8696a0]">{state.settings.blockedContacts.length || "None"}</div>
        </button>
      </div>
    </div>
  );
}

export function NotificationSettings({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [tonePicker, setTonePicker] = useState<null | "message" | "group" | "call">(null);

  const messageTones = ["Default (Note)", "Aurora", "Bounce", "Cascade", "Chime", "Halo", "Ping", "Pop", "Radar", "Ripple", "Silent"];
  const groupTones = ["Default (Note)", "Aurora", "Chime", "Halo", "Ping", "Pop", "Silent"];
  const callRingtones = ["Default (Eclipse)", "Bells", "Digital", "Guitar", "Marimba", "Old Phone", "Pulse", "Silent"];

  const playPreview = (toneName: string) => {
    // Simulate preview using Web Audio API — different pitch per tone
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const hash = toneName.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
      const base = 420 + (hash % 700);
      const notes = toneName === "Silent" ? [] : [0, 4, 7].map((semi) => base * Math.pow(2, semi / 12));
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i === 1 ? "triangle" : "sine";
        osc.connect(gain);
        gain.connect(ctx.destination);
        const t0 = ctx.currentTime + i * 0.12;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.14, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
        osc.start(t0);
        osc.stop(t0 + 0.4);
      });
    } catch {}
  };

  const pickers: Record<string, { title: string; icon: React.ReactNode; options: string[]; current: string; onPick: (v: string) => void }> = {
    message: {
      title: "Message notification tone",
      icon: <Bell className="w-5 h-5 text-emerald-400" />,
      options: messageTones,
      current: state.settings.notificationTone,
      onPick: (v) => dispatch({ type: "UPDATE_SETTINGS", settings: { notificationTone: v } }),
    },
    group: {
      title: "Group notification tone",
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      options: groupTones,
      current: state.settings.notificationTone,
      onPick: (v) => dispatch({ type: "UPDATE_SETTINGS", settings: { notificationTone: v } }),
    },
    call: {
      title: "Call ringtone",
      icon: <Phone className="w-5 h-5 text-emerald-400" />,
      options: callRingtones,
      current: state.settings.callRingtone,
      onPick: (v) => dispatch({ type: "UPDATE_SETTINGS", settings: { callRingtone: v } }),
    },
  };

  const picker = tonePicker ? pickers[tonePicker] : null;

  if (picker) {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title={picker.title} onBack={() => setTonePicker(null)} />
        <div className="flex-1 overflow-y-auto pb-6">
          {/* Header card */}
          <div className="mx-4 mt-4 bg-[#202c33] rounded-2xl p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-500/15 flex items-center justify-center">
              {picker.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{picker.title}</div>
              <div className="text-xs text-[#8696a0]">Current: {picker.current}</div>
            </div>
          </div>
          {/* Tone list */}
          <div className="mx-4 mt-3 bg-[#202c33] rounded-2xl overflow-hidden">
            {picker.options.map((t, idx) => {
              const isCurrent = picker.current === t;
              const isSilent = t === "Silent";
              return (
                <button
                  key={t}
                  onClick={() => { picker.onPick(t); if (!isSilent) playPreview(t); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2a3942] text-left border-b border-[#111b21] last:border-0 ${isCurrent ? "bg-emerald-500/5" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isSilent ? "bg-zinc-700" : "bg-[#111b21]"}`}>
                    {isSilent ? (
                      <VolumeX className="w-4 h-4 text-[#8696a0]" />
                    ) : isCurrent ? (
                      <VolumeUp className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Play className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${isCurrent ? "text-emerald-300" : ""}`}>{t}</div>
                    <div className="text-[11px] text-[#8696a0]">
                      {isSilent ? "No sound" : isCurrent ? "Currently selected" : `Tone ${idx + 1}`}
                    </div>
                  </div>
                  {!isSilent && (
                    <button
                      onClick={(e) => { e.stopPropagation(); playPreview(t); }}
                      className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0"
                      aria-label="Preview"
                    >
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  )}
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 ${isCurrent ? "border-emerald-500" : "border-zinc-600"}`}>
                    {isCurrent && <div className="w-2 h-2 bg-emerald-500 rounded-full m-auto mt-[5px]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-6">
        {/* Master toggle card */}
        <div className="mx-4 mt-4 bg-[#202c33] rounded-2xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Conversation tones</div>
            <div className="text-xs text-[#8696a0]">Play sounds for incoming and outgoing messages</div>
          </div>
          <Toggle on={state.settings.notifications} onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { notifications: v } })} />
        </div>

        {/* Messages section */}
        <h3 className="text-xs uppercase text-emerald-400 px-5 pt-5 pb-2 flex items-center gap-1.5">
          <ChatBubble className="w-3.5 h-3.5" /> Messages
        </h3>
        <div className="mx-4 bg-[#202c33] rounded-2xl overflow-hidden">
          <button onClick={() => setTonePicker("message")} className="w-full px-4 py-3 hover:bg-[#2a3942] text-left flex items-center gap-3 border-b border-[#111b21]">
            <div className="w-9 h-9 rounded-full bg-[#111b21] flex items-center justify-center">
              <VolumeUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Notification tone</div>
              <div className="text-xs text-[#8696a0]">{state.settings.notificationTone}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Vibrate</div>
              <div className="text-xs text-[#8696a0]">Phone vibrates on new message</div>
            </div>
            <Toggle
              on={state.settings.vibrate === "Default"}
              onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { vibrate: v ? "Default" : "Off" } })}
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t border-[#111b21]">
            <div>
              <div className="font-medium text-sm">Light</div>
              <div className="text-xs text-[#8696a0]">LED flash on new message</div>
            </div>
            <Toggle
              on={state.settings.vibrate === "Default"}
              onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { vibrate: v ? "Default" : "Off" } })}
            />
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t border-[#111b21]">
            <div>
              <div className="font-medium text-sm">High priority</div>
              <div className="text-xs text-[#8696a0]">Show as a heads-up notification</div>
            </div>
            <Toggle on={state.settings.notifications} onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { notifications: v } })} />
          </div>
        </div>

        {/* Groups section */}
        <h3 className="text-xs uppercase text-emerald-400 px-5 pt-5 pb-2 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Groups
        </h3>
        <div className="mx-4 bg-[#202c33] rounded-2xl overflow-hidden">
          <button onClick={() => setTonePicker("group")} className="w-full px-4 py-3 hover:bg-[#2a3942] text-left flex items-center gap-3 border-b border-[#111b21]">
            <div className="w-9 h-9 rounded-full bg-[#111b21] flex items-center justify-center">
              <VolumeUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Notification tone</div>
              <div className="text-xs text-[#8696a0]">{state.settings.notificationTone}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Vibrate</div>
              <div className="text-xs text-[#8696a0]">Phone vibrates for group messages</div>
            </div>
            <Toggle on={state.settings.vibrate === "Default"} onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { vibrate: v ? "Default" : "Off" } })} />
          </div>
        </div>

        {/* Calls section */}
        <h3 className="text-xs uppercase text-emerald-400 px-5 pt-5 pb-2 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5" /> Calls
        </h3>
        <div className="mx-4 bg-[#202c33] rounded-2xl overflow-hidden">
          <button onClick={() => setTonePicker("call")} className="w-full px-4 py-3 hover:bg-[#2a3942] text-left flex items-center gap-3 border-b border-[#111b21]">
            <div className="w-9 h-9 rounded-full bg-[#111b21] flex items-center justify-center">
              <Phone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">Ringtone</div>
              <div className="text-xs text-[#8696a0]">{state.settings.callRingtone}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
          <div className="px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Vibrate</div>
              <div className="text-xs text-[#8696a0]">Phone vibrates on incoming calls</div>
            </div>
            <Toggle on={state.settings.vibrate === "Default"} onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { vibrate: v ? "Default" : "Off" } })} />
          </div>
        </div>

        <div className="px-5 py-4 text-xs text-[#8696a0] flex items-center gap-2">
          <VolumeUp className="w-3.5 h-3.5 shrink-0" />
          Tap any tone row to preview it.
        </div>
      </div>
    </div>
  );
}

export function ChatSettings({
  onBack,
  onWallpaper,
  onBackup,
}: {
  onBack: () => void;
  onWallpaper: () => void;
  onBackup: () => void;
}) {
  const { state, dispatch } = useStore();
  const themes: { id: "dark" | "light"; label: string }[] = [
    { id: "dark", label: "Dark" },
    { id: "light", label: "Light" },
  ];
  const sizes: { id: "small" | "medium" | "large"; label: string }[] = [
    { id: "small", label: "Small" },
    { id: "medium", label: "Medium" },
    { id: "large", label: "Large" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Chats" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Display</h3>
        <div className="px-4 py-3">
          <div className="mb-2">Theme</div>
          <div className="flex gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => dispatch({ type: "UPDATE_SETTINGS", settings: { theme: t.id } })}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  state.settings.theme === t.id
                    ? "bg-emerald-500 text-[#111b21]"
                    : "bg-[#202c33] text-[#aebac1]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onWallpaper} className="w-full px-4 py-3 hover:bg-[#202c33] text-left">
          <div>Wallpaper</div>
          <div className="text-xs text-[#8696a0] capitalize">{state.settings.wallpaper}</div>
        </button>
        <div className="px-4 py-3">
          <div className="mb-2">Font size</div>
          <div className="flex gap-2">
            {sizes.map((s) => (
              <button
                key={s.id}
                onClick={() => dispatch({ type: "UPDATE_SETTINGS", settings: { fontSize: s.id } })}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  state.settings.fontSize === s.id
                    ? "bg-emerald-500 text-[#111b21]"
                    : "bg-[#202c33] text-[#aebac1]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Chat settings</h3>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>Enter is send</div>
          <Toggle on={state.settings.enterToSend} onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { enterToSend: v } })} />
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <div>Media visibility</div>
            <div className="text-xs text-[#8696a0]">Show media in phone's gallery</div>
          </div>
          <Toggle
            on={state.settings.mediaVisibility}
            onChange={(v) => dispatch({ type: "UPDATE_SETTINGS", settings: { mediaVisibility: v } })}
          />
        </div>
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Chat history</h3>
        <button onClick={onBackup} className="w-full px-4 py-3 hover:bg-[#202c33] text-left">
          <div>Chat backup</div>
          <div className="text-xs text-[#8696a0]">Last backup: Today at 2:00 AM</div>
        </button>
        <button
          onClick={() => {
            // Functional export: download a .txt file of all chats
            let exportText = "Chatsapp Chat Export\nGenerated: " + new Date().toLocaleString() + "\n\n";
            state.chats.forEach((c) => {
              if (c.messages.length === 0) return;
              exportText += "════════════════════════\n";
              exportText += `Chat: ${c.name}\n`;
              exportText += "════════════════════════\n";
              c.messages.forEach((m) => {
                const sender = m.sent ? "You" : c.name;
                const content = m.text || `[${m.type || "media"}]`;
                exportText += `[${m.time}] ${sender}: ${content}\n`;
              });
              exportText += "\n";
            });
            const blob = new Blob([exportText], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Chatsapp_Chat_Export.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="w-full px-4 py-3 hover:bg-[#202c33] text-left"
        >
          <div>Export chat</div>
          <div className="text-xs text-[#8696a0]">Download all conversations as a text file</div>
        </button>
        <button
          onClick={() => {
            if (confirm("Clear all chats?")) {
              state.chats.forEach((c) => {
                c.messages.forEach((m) => dispatch({ type: "DELETE_MESSAGE", chatId: c.id, messageId: m.id }));
              });
            }
          }}
          className="w-full px-4 py-3 hover:bg-[#202c33] text-left text-red-400"
        >
          Clear all chats
        </button>
        <button
          onClick={() => {
            if (confirm("Reset all data and chats? This will log you out.")) {
              dispatch({ type: "RESET" });
              location.reload();
            }
          }}
          className="w-full px-4 py-3 hover:bg-[#202c33] text-left text-red-400"
        >
          Reset app data
        </button>
      </div>
    </div>
  );
}

export function StorageSettings({ onBack, onManage, onCleanup }: { onBack: () => void; onManage?: () => void; onCleanup?: () => void }) {
  const { state, dispatch } = useStore();
  const [mobileOption, setMobileOption] = useState(state.settings.autoDownloadMobile ? "All media" : "Photos");
  const [wifiOption, setWifiOption] = useState(state.settings.autoDownloadWifi ? "All media" : "Photos");

  const updateMobile = (v: string) => {
    setMobileOption(v);
    dispatch({ type: "UPDATE_SETTINGS", settings: { autoDownloadMobile: v === "All media" } });
  };
  const updateWifi = (v: string) => {
    setWifiOption(v);
    dispatch({ type: "UPDATE_SETTINGS", settings: { autoDownloadWifi: v === "All media" } });
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Storage and data" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <button onClick={onManage} className="w-full px-4 py-3 hover:bg-[#202c33] text-left">
          <div>Manage storage</div>
          <div className="text-xs text-[#8696a0]">2.4 GB used</div>
        </button>
        <button onClick={onCleanup} className="w-full px-4 py-3 hover:bg-[#202c33] text-left">
          <div>Free up space ✨</div>
          <div className="text-xs text-[#8696a0]">Cleanup wizard</div>
        </button>
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Network usage</h3>
        <div className="px-4 py-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-[#202c33] rounded p-3">
              <div className="text-[#8696a0] text-xs">Sent</div>
              <div className="font-medium">312 MB</div>
            </div>
            <div className="bg-[#202c33] rounded p-3">
              <div className="text-[#8696a0] text-xs">Received</div>
              <div className="font-medium">1.2 GB</div>
            </div>
            <div className="bg-[#202c33] rounded p-3">
              <div className="text-[#8696a0] text-xs">Messages sent</div>
              <div className="font-medium">2,148</div>
            </div>
            <div className="bg-[#202c33] rounded p-3">
              <div className="text-[#8696a0] text-xs">Messages received</div>
              <div className="font-medium">5,302</div>
            </div>
          </div>
        </div>
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Media auto-download</h3>
        <div className="px-4 py-3">
          <div className="mb-2">When using mobile data</div>
          <div className="flex gap-2 flex-wrap">
            {["Off", "Photos", "All media"].map((opt) => (
              <button
                key={opt}
                onClick={() => updateMobile(opt)}
                className={`px-3 py-1 text-sm rounded-full ${mobileOption === opt ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3">
          <div className="mb-2">When connected on Wi-Fi</div>
          <div className="flex gap-2 flex-wrap">
            {["Off", "Photos", "All media"].map((opt) => (
              <button
                key={opt}
                onClick={() => updateWifi(opt)}
                className={`px-3 py-1 text-sm rounded-full ${wifiOption === opt ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-3 flex items-center justify-between border-t border-[#222d34]">
          <div>
            <div>Save incoming media to gallery</div>
            <div className="text-xs text-[#8696a0]">Auto-save photos and videos</div>
          </div>
          <Toggle
            on={state.privacySettings.autoSaveToGallery}
            onChange={(v) => dispatch({ type: "UPDATE_PRIVACY", updates: { autoSaveToGallery: v } })}
          />
        </div>
      </div>
    </div>
  );
}

export function WallpaperPicker({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Wallpaper" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-[#8696a0] mb-4">Choose a wallpaper for your chats.</p>
        <div className="grid grid-cols-3 gap-3">
          {wallpaperOptions.map((opt) => {
            const selected = state.settings.wallpaper === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => dispatch({ type: "UPDATE_SETTINGS", settings: { wallpaper: opt.id as Wallpaper } })}
                className={`aspect-[3/5] rounded-xl ${opt.preview} border-2 ${selected ? "border-emerald-500" : "border-transparent"} flex items-end justify-center pb-2`}
              >
                <span className="text-xs text-white bg-black/40 px-2 py-0.5 rounded">{opt.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function HelpScreen({ onBack, onHelpCenter, onAppInfo }: { onBack: () => void; onHelpCenter?: () => void; onAppInfo?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Help" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {[
          { label: "Help center", sub: "Get help, contact us", action: onHelpCenter },
          { label: "Contact us", sub: "Questions? Need help?" },
          { label: "Terms and Privacy Policy", sub: "" },
          { label: "Channel reports", sub: "" },
          { label: "App info", sub: "Version & changelog", action: onAppInfo },
        ].map((it) => (
          <button key={it.label} onClick={(it as any).action} className="w-full px-4 py-4 hover:bg-[#202c33] text-left flex items-center justify-between">
            <div>
              <div>{it.label}</div>
              {it.sub && <div className="text-xs text-[#8696a0]">{it.sub}</div>}
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        ))}
        <div className="text-center text-xs text-[#8696a0] py-6">
          from <span className="font-semibold text-emerald-400">Munawar</span>
        </div>
      </div>
    </div>
  );
}
