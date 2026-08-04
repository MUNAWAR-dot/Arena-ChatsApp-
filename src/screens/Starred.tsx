import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, StarFilled } from "../icons";

export function Starred({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  const items = state.starred
    .map((key) => {
      const [chatId, msgId] = key.split(":");
      const chat = state.chats.find((c) => c.id === chatId);
      const msg = chat?.messages.find((m) => m.id === msgId);
      if (!chat || !msg) return null;
      return { chat, msg };
    })
    .filter(Boolean) as { chat: any; msg: any }[];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3 bg-[#111b21]">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium">Starred messages</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#8696a0] px-8">
            <StarFilled className="w-16 h-16 text-yellow-400/50 mb-4" />
            <p className="text-center text-sm">No starred messages.<br />Tap and hold a message to star it.</p>
          </div>
        ) : (
          items.map(({ chat, msg }) => (
            <div key={chat.id + ":" + msg.id} className="px-4 py-3 border-b border-[#222d34]">
              <div className="flex items-center gap-2 mb-2">
                <Avatar color={chat.avatarColor} text={chat.avatarText} size="sm" />
                <div className="text-sm font-medium">{msg.sent ? "You" : chat.name}</div>
                <div className="text-xs text-[#8696a0]">→ {chat.name}</div>
              </div>
              <div className="bg-[#202c33] rounded-lg px-3 py-2 text-sm flex justify-between gap-3">
                <span>{msg.text || `[${msg.type}]`}</span>
                <div className="flex flex-col items-end shrink-0">
                  <StarFilled className="w-3 h-3 text-yellow-400" />
                  <span className="text-[10px] text-[#8696a0]">{msg.time}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
