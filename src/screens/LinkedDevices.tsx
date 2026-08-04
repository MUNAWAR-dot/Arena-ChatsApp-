import { ArrowLeft, Plus } from "../icons";

const devices = [
  { name: "Chrome (Windows)", lastActive: "Active now", icon: "💻" },
  { name: "Chatsapp Web", lastActive: "Last active today at 9:32 AM", icon: "🌐" },
];

export function LinkedDevices({ onBack, onLink }: { onBack: () => void; onLink?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium">Linked devices</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 text-center">
          <div className="text-6xl mb-3">📱➡️💻</div>
          <p className="text-sm text-[#8696a0]">
            Use Chatsapp on other devices linked to this account.
          </p>
        </div>
        <div className="px-4">
          <button onClick={onLink} className="w-full bg-emerald-500 text-[#111b21] py-3 rounded-full font-medium flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Link a device
          </button>
        </div>
        <h3 className="text-xs uppercase text-[#8696a0] tracking-wide px-4 py-3 mt-2">Devices</h3>
        {devices.map((d) => (
          <button key={d.name} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] text-left">
            <div className="w-10 h-10 rounded-full bg-[#202c33] flex items-center justify-center text-xl">
              {d.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-[#8696a0]">{d.lastActive}</div>
            </div>
          </button>
        ))}
        <p className="text-xs text-[#8696a0] px-4 py-4">
          Make sure your phone has an active internet connection so all your devices stay connected.
        </p>
      </div>
    </div>
  );
}
