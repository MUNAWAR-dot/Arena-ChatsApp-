import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, Archive } from "../icons";

export function Archived({ onBack, onOpenChat }: { onBack: () => void; onOpenChat: (id: string) => void }) {
  const { state, dispatch } = useStore();
  const archived = state.chats.filter((c) => state.archived.includes(c.id));

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3 bg-[#202c33]">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Archived</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        {archived.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8696a0]">
            <Archive className="w-16 h-16 opacity-30 mb-3" />
            <p className="text-sm">No archived chats</p>
          </div>
        ) : (
          archived.map((c) => (
            <div key={c.id} className="flex">
              <button
                onClick={() => onOpenChat(c.id)}
                className="flex-1 flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
              >
                <Avatar color={c.avatarColor} text={c.avatarText} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-[#8696a0] truncate">{c.lastMessage}</div>
                </div>
              </button>
              <button
                onClick={() => dispatch({ type: "UNARCHIVE_CHAT", chatId: c.id })}
                className="px-3 text-emerald-400 text-sm"
              >
                Unarchive
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
