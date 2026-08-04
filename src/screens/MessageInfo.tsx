import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, Check, DoubleCheck } from "../icons";

export function MessageInfo({
  chatId,
  messageId,
  onBack,
}: {
  chatId: string;
  messageId: string;
  onBack: () => void;
}) {
  const { state } = useStore();
  const chat = state.chats.find((c) => c.id === chatId);
  const msg = chat?.messages.find((m) => m.id === messageId);
  if (!chat || !msg) return null;

  // Real timestamps from the message record (captured on actual status transitions)
  const fmt = (ts?: number) => (ts ? new Date(ts).toLocaleString() : null);
  const sent = fmt(msg.statusSentAt) ?? fmt(new Date(msg.time as any).getTime());
  const delivered = msg.status === "delivered" || msg.status === "read" ? fmt(msg.statusDeliveredAt) ?? "Delivered" : null;
  const read = msg.status === "read" ? fmt(msg.statusReadAt) ?? "Read" : null;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Message info</h1>
      </header>

      <div className="p-3">
        <div className="flex justify-end">
          <div className="bg-[#005c4b] rounded-lg rounded-tr-none px-3 py-2 max-w-[78%] text-sm">
            {msg.text || `[${msg.type}]`}
            <div className="text-[10px] text-white/60 text-right mt-1">{msg.time}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chat.isGroup ? (
          <>
            <h3 className="text-xs uppercase text-[#8696a0] tracking-wide px-4 py-2 flex items-center gap-2">
              <DoubleCheck className="text-[#53bdeb]" /> Read by
            </h3>
            {(chat.members || []).filter((m) => m !== "You").slice(0, 3).map((m) => (
              <div key={m} className="flex items-center gap-3 px-4 py-2">
                <Avatar color="bg-zinc-600" text={m.slice(0, 2).toUpperCase()} size="sm" />
                <div className="flex-1">
                  <div className="text-sm">{m}</div>
                </div>
                <DoubleCheck className="text-[#53bdeb] w-4 h-4" />
              </div>
            ))}
            <h3 className="text-xs uppercase text-[#8696a0] tracking-wide px-4 py-2 flex items-center gap-2">
              <DoubleCheck className="text-[#8696a0]" /> Delivered to
            </h3>
            {(chat.members || []).filter((m) => m !== "You").map((m) => (
              <div key={m + "d"} className="flex items-center gap-3 px-4 py-2">
                <Avatar color="bg-zinc-600" text={m.slice(0, 2).toUpperCase()} size="sm" />
                <div className="flex-1 text-sm">{m}</div>
                <DoubleCheck className="text-[#8696a0] w-4 h-4" />
              </div>
            ))}
          </>
        ) : (
          <div className="px-4 py-2">
            <Row icon={<DoubleCheck className="text-[#53bdeb]" />} label="Read" time={read} />
            <Row icon={<DoubleCheck className="text-[#8696a0]" />} label="Delivered" time={delivered} />
            <Row icon={<Check className="text-[#8696a0] w-4 h-4" />} label="Sent" time={sent} />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon, label, time }: { icon: any; label: string; time: string | null }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#222d34]">
      <div className="w-6 flex justify-center">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-[#8696a0]">{time || "Pending..."}</div>
      </div>
    </div>
  );
}
