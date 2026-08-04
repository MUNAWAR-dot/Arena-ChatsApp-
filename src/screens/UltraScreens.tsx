import { useState, useMemo } from "react";
import {
  ArrowLeft, Search, X, ChevronRight, HelpCircle,
  Image as ImageIcon, Camera, Palette
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

const SETTINGS_INDEX: { label: string; section: string; keywords: string; target: string }[] = [
  { label: "Profile", section: "Account", keywords: "name avatar photo about", target: "profile" },
  { label: "Account", section: "", keywords: "security number two-step delete", target: "account" },
  { label: "Privacy", section: "", keywords: "block last seen read receipts", target: "privacy" },
  { label: "Chat lock", section: "Privacy", keywords: "lock pin secret", target: "chatlock" },
  { label: "Starred messages", section: "", keywords: "star save", target: "starred" },
  { label: "Status archive", section: "Status", keywords: "history old past", target: "statusarchive" },
  { label: "Linked devices", section: "", keywords: "web desktop watch laptop", target: "linked" },
  { label: "Active sessions", section: "Account", keywords: "device login", target: "sessions" },
  { label: "Connected accounts", section: "Account", keywords: "google apple facebook email", target: "connected" },
  { label: "Add account", section: "Account", keywords: "multiple second", target: "multi-account" },
  { label: "Chats", section: "", keywords: "theme wallpaper backup", target: "chats" },
  { label: "Notifications", section: "", keywords: "tone sound vibrate", target: "notifications" },
  { label: "Storage and data", section: "", keywords: "space cleanup mb gb", target: "storage" },
  { label: "Business tools", section: "Business", keywords: "catalog quick reply labels", target: "business" },
  { label: "App language", section: "", keywords: "translation language", target: "language" },
  { label: "Help", section: "", keywords: "support faq contact", target: "help" },
  { label: "Two-step verification", section: "Account", keywords: "pin security 2fa", target: "twostep" },
  { label: "App lock", section: "Account", keywords: "biometric fingerprint", target: "applock" },
  { label: "Chat backup", section: "Chats", keywords: "google drive icloud", target: "backup" },
  { label: "Blocked contacts", section: "Privacy", keywords: "block ignore", target: "blocked" },
  { label: "Disappearing messages", section: "Privacy", keywords: "auto delete vanish", target: "disappearing" },
  { label: "Payments", section: "", keywords: "money send receive", target: "payments" },
  { label: "Broadcast lists", section: "", keywords: "send to many", target: "broadcast" },
];

// Settings search
export function SettingsSearch({
  onBack,
  onPick,
}: {
  onBack: () => void;
  onPick: (target: string) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return SETTINGS_INDEX.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.section.toLowerCase().includes(q) ||
        it.keywords.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-2 px-2 py-3 bg-[#202c33]">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings…"
          className="flex-1 bg-transparent outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X className="w-5 h-5 text-[#8696a0]" />
          </button>
        )}
      </header>
      <div className="flex-1 overflow-y-auto">
        {!query && (
          <div className="px-4 py-3 text-xs text-[#8696a0]">
            <h3 className="uppercase text-emerald-400 mb-2">Suggested</h3>
            {SETTINGS_INDEX.slice(0, 6).map((it) => (
              <button
                key={it.target}
                onClick={() => onPick(it.target)}
                className="w-full flex items-center justify-between py-2 hover:bg-white/5 rounded px-2 text-left"
              >
                <span className="text-white text-sm">{it.label}</span>
                <ChevronRight className="w-4 h-4 text-[#8696a0]" />
              </button>
            ))}
          </div>
        )}
        {query && results.length === 0 && (
          <div className="text-center text-sm text-[#8696a0] mt-12 px-6">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No settings found for "{query}"
          </div>
        )}
        {results.map((it) => (
          <button
            key={it.target}
            onClick={() => onPick(it.target)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#202c33] text-left"
          >
            <div>
              <div className="text-sm">
                <Highlight text={it.label} q={query} />
              </div>
              {it.section && <div className="text-xs text-[#8696a0]">in {it.section}</div>}
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        ))}
      </div>
    </div>
  );
}

function Highlight({ text, q }: { text: string; q: string }) {
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="bg-emerald-500/30 text-emerald-300">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

// Help center with search & FAQ
export function HelpCenter({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState("");

  const faqs = [
    { q: "How do I back up my chats?", a: "Settings → Chats → Chat backup. You can back up to Google Drive or iCloud." },
    { q: "How do I block someone?", a: "Open the contact's chat → tap their name → scroll down → Block." },
    { q: "Why aren't my messages being delivered?", a: "Check your internet connection. The recipient might have no signal or have blocked you." },
    { q: "How do I leave a group?", a: "Open the group → tap group name → Exit group." },
    { q: "What are blue ticks?", a: "Two blue ticks mean your message has been read. Both sender and receiver must have read receipts on." },
    { q: "How do I restore my chats?", a: "Reinstall Chatsapp and verify your number. You'll be prompted to restore from backup." },
    { q: "Can I use Chatsapp on multiple phones?", a: "You can link up to 4 devices. Settings → Linked devices → Link a device." },
    { q: "How do I change my number?", a: "Settings → Account → Change number. Make sure your old number is active." },
    { q: "Are my messages encrypted?", a: "Yes! All messages, calls, and media are protected with end-to-end encryption by default." },
    { q: "How do I delete a message for everyone?", a: "Long-press message → Delete → Delete for everyone (within ~2 hours)." },
    { q: "What is two-step verification?", a: "An extra layer of security requiring a 6-digit PIN when registering your number." },
    { q: "Can I hide my online status?", a: "Yes! Settings → Privacy → Last seen and online → Nobody." },
  ];

  const filtered = query
    ? faqs.filter((f) => (f.q + " " + f.a).toLowerCase().includes(query.toLowerCase()))
    : faqs;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Help center" onBack={onBack} />
      <div className="px-3 py-2 sticky top-0 bg-[#111b21] border-b border-[#222d34] z-10">
        <div className="bg-[#202c33] rounded-full flex items-center gap-2 px-3 py-2">
          <Search className="w-4 h-4 text-[#8696a0]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#8696a0]"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X className="w-4 h-4 text-[#8696a0]" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {!query && (
          <div className="px-4 py-4">
            <h3 className="text-xs uppercase text-emerald-400 mb-2">Popular topics</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { t: "📱 Account", k: "account" },
                { t: "💬 Chats", k: "chat" },
                { t: "🔒 Privacy", k: "privacy" },
                { t: "📞 Calls", k: "call" },
                { t: "💼 Business", k: "business" },
                { t: "💰 Payments", k: "payment" },
              ].map((t) => (
                <button
                  key={t.t}
                  onClick={() => setQuery(t.k)}
                  className="bg-[#202c33] hover:bg-[#2a3942] rounded-lg p-3 text-sm text-left"
                >
                  {t.t}
                </button>
              ))}
            </div>
          </div>
        )}
        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-2 pb-1">
          {query ? `Results (${filtered.length})` : "Frequently asked"}
        </h3>
        {filtered.length === 0 ? (
          <div className="text-center text-sm text-[#8696a0] mt-12 px-6">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No articles found for "{query}"
          </div>
        ) : (
          filtered.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)
        )}
        <div className="px-4 py-6 text-center text-xs text-[#8696a0]">
          Need more help?{" "}
          <button className="text-emerald-400 underline">Contact support</button>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#222d34]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#202c33] text-left"
      >
        <span className="text-sm flex-1">{q}</span>
        <ChevronRight className={`w-4 h-4 text-[#8696a0] transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-[#aebac1] bg-[#181f24]">{a}</div>
      )}
    </div>
  );
}

// Custom wallpaper from photo
export function CustomWallpaperPicker({
  onBack,
  onPick,
}: {
  onBack: () => void;
  onPick: (wallpaper: string) => void;
}) {
  const presetPhotos = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400",
    "https://images.unsplash.com/photo-1516796181074-bf453fbfa3e6?w=400",
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Custom wallpaper" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
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
            <Palette className="w-6 h-6 text-emerald-400" />
            <span className="text-xs">Solid color</span>
          </button>
        </div>
        <h3 className="text-xs uppercase text-emerald-400 mb-2">Curated</h3>
        <div className="grid grid-cols-2 gap-2">
          {presetPhotos.map((url) => (
            <button
              key={url}
              onClick={() => onPick(url)}
              className="aspect-[3/5] rounded-xl bg-cover bg-center overflow-hidden"
              style={{ backgroundImage: `url(${url})` }}
            >
              <div className="w-full h-full bg-black/20 hover:bg-black/0 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Keyboard shortcuts panel
export function KeyboardShortcuts({ onBack }: { onBack: () => void }) {
  const shortcuts = [
    { keys: "Enter", desc: "Send message" },
    { keys: "Shift + Enter", desc: "New line" },
    { keys: "Ctrl/⌘ + N", desc: "New chat" },
    { keys: "Ctrl/⌘ + Shift + N", desc: "New group" },
    { keys: "Ctrl/⌘ + F", desc: "Search in chat" },
    { keys: "Ctrl/⌘ + K", desc: "Search chats" },
    { keys: "Ctrl/⌘ + B", desc: "Bold (in formatted message)" },
    { keys: "Ctrl/⌘ + I", desc: "Italic" },
    { keys: "Ctrl/⌘ + Shift + X", desc: "Strikethrough" },
    { keys: "Ctrl/⌘ + Shift + M", desc: "Mute/unmute" },
    { keys: "Ctrl/⌘ + Shift + L", desc: "Lock app" },
    { keys: "Ctrl/⌘ + ,", desc: "Open settings" },
    { keys: "Ctrl/⌘ + E", desc: "Archive chat" },
    { keys: "Esc", desc: "Close current view" },
    { keys: "↑ / ↓", desc: "Navigate chats" },
    { keys: "Tab", desc: "Switch tabs" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Keyboard shortcuts" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-[#8696a0] mb-4">
          Speed up your Chatsapp experience with these shortcuts.
        </p>
        <div className="bg-[#202c33] rounded-lg overflow-hidden">
          {shortcuts.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 border-b border-[#111b21] last:border-0"
            >
              <span className="text-sm">{s.desc}</span>
              <kbd className="bg-[#111b21] text-emerald-400 px-2 py-1 rounded text-xs font-mono border border-[#222d34]">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// "Add to home screen" / pin chat as PWA
export function AddToHomeScreen({
  chat,
  onBack,
  onAdded,
}: {
  chat: { name: string; avatarColor: string; avatarText: string };
  onBack: () => void;
  onAdded?: () => void;
}) {
  const [added, setAdded] = useState(false);
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Add to home screen" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-4">
          <div className={`w-24 h-24 rounded-2xl ${chat.avatarColor} flex items-center justify-center text-3xl font-semibold text-white`}>
            {chat.avatarText}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-lg">📲</span>
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">Add {chat.name} to your home screen</h2>
        <p className="text-sm text-[#8696a0] mb-6 max-w-xs">
          Open this chat with one tap, right from your home screen.
        </p>
        {added ? (
          <div className="text-emerald-400 text-sm flex items-center gap-2 mb-3">
            ✓ Added to home screen
          </div>
        ) : null}
        <button
          onClick={() => {
            setAdded(true);
            setTimeout(() => { onAdded?.(); onBack(); }, 1200);
          }}
          disabled={added}
          className="bg-emerald-500 disabled:opacity-50 text-[#111b21] font-semibold py-2 px-8 rounded-full"
        >
          {added ? "Added ✓" : "Add to home screen"}
        </button>
      </div>
    </div>
  );
}

// "Tools" — keyboard, web, shortcut
export function ToolsScreen({
  onBack,
  onKeyboard,
  onWeb,
  onDiagnostics,
}: {
  onBack: () => void;
  onKeyboard: () => void;
  onWeb: () => void;
  onDiagnostics?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Tools" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <button onClick={onKeyboard} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
          <span className="text-2xl">⌨️</span>
          <div className="flex-1">
            <div className="font-medium">Keyboard shortcuts</div>
            <div className="text-xs text-[#8696a0]">Speed things up</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onWeb} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
          <span className="text-2xl">💻</span>
          <div className="flex-1">
            <div className="font-medium">Chatsapp Web</div>
            <div className="text-xs text-[#8696a0]">Use on your computer</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        {onDiagnostics && (
          <button onClick={onDiagnostics} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
            <span className="text-2xl">🩺</span>
            <div className="flex-1">
              <div className="font-medium">System diagnostics</div>
              <div className="text-xs text-[#8696a0]">Run backend service checks</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        )}
      </div>
    </div>
  );
}
