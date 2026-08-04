import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, Search, ChevronRight, QR, User, Lock, Bell, Database, Palette, HelpCircle, Users, Globe, Star, Briefcase, Sparkles } from "../icons";

export type SettingsTarget =
  | "profile"
  | "account"
  | "privacy"
  | "chats"
  | "notifications"
  | "storage"
  | "qr"
  | "starred"
  | "linked"
  | "help"
  | "applock"
  | "twostep"
  | "backup"
  | "blocked"
  | "disappearing"
  | "language"
  | "payments"
  | "broadcast"
  | "business"
  | "business-profile"
  | "catalog"
  | "quickreplies"
  | "labels"
  | "chatlock"
  | "statusarchive"
  | "sessions"
  | "connected"
  | "multi-account"
  | "data-export"
  | "move-chats";

export function Settings({
  onBack,
  onOpen,
  onSearch,
}: {
  onBack: () => void;
  onOpen: (target: SettingsTarget) => void;
  onSearch?: () => void;
}) {
  const { state } = useStore();

  const items: { icon: any; label: string; sub: string; color: string; target: SettingsTarget }[] = [
    { icon: User, label: "Account", sub: "Security, change number, two-step", color: "text-blue-400", target: "account" },
    { icon: Lock, label: "Privacy", sub: "Block contacts, disappearing messages", color: "text-emerald-400", target: "privacy" },
    { icon: Lock, label: "Chat lock", sub: state.lockedChatPin ? "Enabled" : "Hide chats with PIN", color: "text-purple-400", target: "chatlock" },
    { icon: Star, label: "Starred messages", sub: `${state.starred.length} starred`, color: "text-yellow-400", target: "starred" },
    { icon: Sparkles, label: "Status archive", sub: `${state.myStatusItems.length} archived`, color: "text-fuchsia-400", target: "statusarchive" },
    { icon: Users, label: "Linked devices", sub: "Web, desktop, watch", color: "text-orange-400", target: "linked" },
    { icon: Lock, label: "Active sessions", sub: `${state.sessions.length} active`, color: "text-cyan-400", target: "sessions" },
    { icon: User, label: "Connected accounts", sub: "Google, email", color: "text-blue-400", target: "connected" },
    { icon: Users, label: "Add account", sub: "Use up to 2 accounts", color: "text-emerald-400", target: "multi-account" },
    { icon: Palette, label: "Chats", sub: "Theme, wallpapers, chat backup", color: "text-pink-400", target: "chats" },
    { icon: Bell, label: "Notifications", sub: "Message, group & call tones", color: "text-yellow-400", target: "notifications" },
    { icon: Database, label: "Storage and data", sub: "Network usage, auto-download", color: "text-cyan-400", target: "storage" },
    { icon: Briefcase, label: "Business tools", sub: state.business.enabled ? "Enabled" : "Catalog, quick replies, labels", color: "text-emerald-300", target: "business" },
    { icon: Globe, label: "App language", sub: state.settings.language, color: "text-indigo-400", target: "language" },
    { icon: HelpCircle, label: "Help", sub: "Help center, contact us, privacy policy", color: "text-rose-400", target: "help" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3 bg-[#111b21]">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium">Settings</h1>
        <div className="ml-auto">
          <button onClick={onSearch} className="p-2 rounded-full hover:bg-white/10"><Search className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <button onClick={() => onOpen("profile")} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33]">
          <Avatar color={state.profile.avatarColor} text={state.profile.avatarText} photoUrl={state.profile.photoUrl} size="lg" />
          <div className="flex-1 text-left">
            <div className="font-medium text-lg">{state.profile.name}</div>
            <div className="text-sm text-[#8696a0]">{state.profile.about}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onOpen("qr"); }} className="p-2">
            <QR className="w-5 h-5 text-emerald-400" />
          </button>
          <ChevronRight className="w-5 h-5 text-[#8696a0]" />
        </button>

        <div className="border-t border-[#222d34] mt-2">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => onOpen(it.target)}
              className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left"
            >
              <it.icon className={`w-6 h-6 ${it.color}`} />
              <div className="flex-1">
                <div className="font-medium">{it.label}</div>
                <div className="text-xs text-[#8696a0]">{it.sub}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center text-xs text-[#8696a0] py-6">
          from <span className="font-semibold text-emerald-400">Munawar</span>
        </div>
      </div>
    </div>
  );
}
