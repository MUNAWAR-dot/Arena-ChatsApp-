import { useState } from "react";
import { useStore } from "../store";
import type { Status } from "../data";
import { Avatar } from "../components/Avatar";
import { Camera, More, Search, Plus, Pencil, ChatsappLogo } from "../icons";
import { Menu } from "../components/Menu";

export function Updates({
  onOpenStatus,
  onCreateStatus,
  onCamera,
  onStatusPrivacy,
  onMutedStatuses,
}: {
  onOpenStatus: (s: Status) => void;
  onCreateStatus: () => void;
  onCamera: () => void;
  onStatusPrivacy?: () => void;
  onMutedStatuses?: () => void;
}) {
  const { state } = useStore();
  const myItems = state.myStatusItems;
  const recent = state.statuses;
  const viewed = state.viewedStatuses;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <ChatsappLogo className="w-8 h-8 animate-wiggle" />
          <h1 className="text-2xl font-bold">Updates</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCamera} className="p-2 rounded-full hover:bg-white/10"><Camera className="w-5 h-5" /></button>
          <button className="p-2 rounded-full hover:bg-white/10"><Search className="w-5 h-5" /></button>
          <button onClick={() => setShowMenu(true)} className="p-2 rounded-full hover:bg-white/10"><More className="w-5 h-5" /></button>
        </div>
      </header>

      {showMenu && (
        <Menu
          onClose={() => setShowMenu(false)}
          items={[
            { label: "Status privacy", action: () => onStatusPrivacy?.() },
            { label: "Muted updates", action: () => onMutedStatuses?.() },
            { label: "Status archive" },
            { label: "Settings" },
          ]}
        />
      )}

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-4 pt-2 pb-3">
          <h2 className="text-lg font-semibold mb-3">Status</h2>
          <button
            onClick={() => myItems.length > 0 ? onOpenStatus({ ...myItems[myItems.length - 1], _isMine: true } as any) : onCreateStatus()}
            className="w-full flex items-center gap-3 mb-2"
          >
            <div className="relative">
              <Avatar
                color={state.profile.avatarColor}
                text={state.profile.avatarText}
                ring={myItems.length > 0 ? "active" : "none"}
              />
              {myItems.length === 0 && (
                <span className="absolute bottom-0 right-0 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#111b21]">
                  <Plus className="w-3 h-3 text-white" strokeWidth={3} />
                </span>
              )}
            </div>
            <div className="text-left">
              <div className="font-medium">My status</div>
              <div className="text-sm text-[#8696a0]">
                {myItems.length > 0 ? `${myItems.length} update${myItems.length > 1 ? "s" : ""} • Just now` : "Tap to add status update"}
              </div>
            </div>
            {myItems.length > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onCreateStatus(); }}
                className="ml-auto p-2 bg-emerald-500/20 rounded-full"
              >
                <Plus className="w-4 h-4 text-emerald-400" strokeWidth={3} />
              </button>
            )}
          </button>
        </div>

        {recent.length > 0 && (
          <div className="px-4">
            <h3 className="text-xs uppercase text-[#8696a0] tracking-wide mb-2">Recent updates</h3>
            {recent.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpenStatus(s)}
                className="w-full flex items-center gap-3 py-2 hover:bg-[#202c33] rounded-lg px-1 -mx-1"
              >
                <Avatar color={s.avatarColor} text={s.avatarText} ring="active" />
                <div className="text-left">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-[#8696a0]">{s.time}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {viewed.length > 0 && (
          <div className="px-4 mt-4">
            <h3 className="text-xs uppercase text-[#8696a0] tracking-wide mb-2">Viewed updates</h3>
            {viewed.map((s) => (
              <button
                key={s.id}
                onClick={() => onOpenStatus(s)}
                className="w-full flex items-center gap-3 py-2 hover:bg-[#202c33] rounded-lg px-1 -mx-1"
              >
                <Avatar color={s.avatarColor} text={s.avatarText} ring="viewed" />
                <div className="text-left">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-[#8696a0]">{s.time}</div>
                </div>
              </button>
            ))}
          </div>
        )}

      </div>

      <button
        onClick={onCreateStatus}
        className="absolute bottom-36 right-4 bg-[#202c33] hover:bg-[#2a3942] text-white rounded-2xl w-12 h-12 shadow-lg flex items-center justify-center"
      >
        <Pencil className="w-5 h-5" />
      </button>
      <button
        onClick={onCamera}
        className="absolute bottom-20 right-4 bg-[#25D366] hover:bg-[#2BE37F] text-[#0b141a] rounded-2xl w-14 h-14 shadow-[0_8px_24px_rgba(37,211,102,0.35)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Camera className="w-6 h-6" />
      </button>
    </div>
  );
}
