import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, ArrowUp, Camera, X } from "../icons";

export function NewGroup({ onBack, onCreated }: { onBack: () => void; onCreated: (chatId: string) => void }) {
  const { state, dispatch } = useStore();
  const [step, setStep] = useState<"select" | "details">("select");
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");

  const candidates = state.chats.filter((c) => !c.isGroup);

  const toggle = (id: string) =>
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const create = () => {
    if (!name.trim()) return;
    const id = "g-" + Date.now();
    const memberNames = ["You", ...selected.map((sid) => state.chats.find((c) => c.id === sid)!.name)];
    const colors = ["bg-pink-500","bg-blue-500","bg-emerald-500","bg-purple-500","bg-orange-500"];
    dispatch({
      type: "CREATE_CHAT",
      chat: {
        id,
        name: name.trim(),
        avatarColor: colors[Math.floor(Math.random() * colors.length)],
        avatarText: name.trim().slice(0,2).toUpperCase(),
        lastMessage: "Group created",
        time: "now",
        unread: 0,
        online: false,
        isGroup: true,
        members: memberNames,
        about: "New group",
        messages: [],
      },
    });
    onCreated(id);
  };

  if (step === "select") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <header className="flex items-center gap-3 px-2 py-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></button>
          <div className="flex-1">
            <div className="font-medium">New group</div>
            <div className="text-xs text-[#8696a0]">Add participants</div>
          </div>
        </header>

        {selected.length > 0 && (
          <div className="px-3 py-2 flex gap-2 overflow-x-auto border-b border-[#222d34]">
            {selected.map((id) => {
              const c = state.chats.find((x) => x.id === id)!;
              return (
                <div key={id} className="flex flex-col items-center gap-1 shrink-0 relative">
                  <Avatar color={c.avatarColor} text={c.avatarText} size="sm" />
                  <button
                    onClick={() => toggle(id)}
                    className="absolute -top-1 -right-1 bg-zinc-700 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="text-xs max-w-[60px] truncate">{c.name}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs uppercase text-[#8696a0] tracking-wide px-4 py-2">Contacts</h3>
          {candidates.map((c) => {
            const isSel = selected.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggle(c.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
              >
                <div className="relative">
                  <Avatar color={c.avatarColor} text={c.avatarText} />
                  {isSel && (
                    <span className="absolute bottom-0 right-0 bg-emerald-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-[#111b21] text-[#111b21] text-xs">✓</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.name}</div>
                  <div className="text-xs text-[#8696a0] truncate">{c.about}</div>
                </div>
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <button
            onClick={() => setStep("details")}
            className="absolute bottom-6 right-4 bg-emerald-500 hover:bg-emerald-400 text-[#111b21] rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
          >
            <ArrowUp className="w-6 h-6 rotate-90" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3">
        <button onClick={() => setStep("select")} className="p-2 rounded-full hover:bg-white/10"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="font-medium">New group</div>
          <div className="text-xs text-[#8696a0]">Add subject</div>
        </div>
      </header>

      <div className="px-4 py-6 flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-[#202c33] flex items-center justify-center">
          <Camera className="w-7 h-7 text-[#8696a0]" />
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group subject"
          className="flex-1 bg-transparent border-b border-emerald-500 outline-none pb-1"
        />
      </div>

      <div className="px-4 py-2 text-sm text-[#8696a0]">Participants: {selected.length + 1}</div>
      <div className="flex-1 overflow-y-auto px-3 pb-20">
        <div className="flex items-center gap-3 py-2">
          <Avatar color={state.profile.avatarColor} text={state.profile.avatarText} size="sm" />
          <span className="text-sm">You</span>
        </div>
        {selected.map((id) => {
          const c = state.chats.find((x) => x.id === id)!;
          return (
            <div key={id} className="flex items-center gap-3 py-2">
              <Avatar color={c.avatarColor} text={c.avatarText} size="sm" />
              <span className="text-sm">{c.name}</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={create}
        disabled={!name.trim()}
        className="absolute bottom-6 right-4 bg-emerald-500 disabled:opacity-40 text-[#111b21] rounded-full w-14 h-14 shadow-lg flex items-center justify-center"
      >
        ✓
      </button>
    </div>
  );
}
