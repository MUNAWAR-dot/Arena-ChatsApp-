import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { More, Search, Phone, Video, ArrowDownLeft, ArrowUpRight, PhoneMissed, Plus, ArrowLeft, Link, X, Copy, Check, ChatsappLogo } from "../icons";

export function Calls({
  onCall,
  onDialer,
}: {
  onCall: (name: string, type: "voice" | "video", color: string, text: string) => void;
  onDialer?: () => void;
}) {
  const { state } = useStore();
  const [filter, setFilter] = useState<"all" | "missed">("all");
  const [showPicker, setShowPicker] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const calls = state.calls.filter((c) => filter === "all" || c.type === "missed");
  const callLink = "https://wa.me/call/" + Math.random().toString(36).slice(2, 10);

  const copyLink = () => {
    navigator.clipboard?.writeText(callLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <ChatsappLogo className="w-8 h-8 animate-wiggle" />
          <h1 className="text-2xl font-bold">Calls</h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-white/10"><Search className="w-5 h-5" /></button>
          <button className="p-2 rounded-full hover:bg-white/10"><More className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="px-3 pb-2 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`text-sm px-3 py-1 rounded-full ${filter === "all" ? "bg-emerald-900/60 text-emerald-300" : "bg-[#202c33] text-[#aebac1]"}`}
        >All</button>
        <button
          onClick={() => setFilter("missed")}
          className={`text-sm px-3 py-1 rounded-full ${filter === "missed" ? "bg-emerald-900/60 text-emerald-300" : "bg-[#202c33] text-[#aebac1]"}`}
        >Missed</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        <button
          onClick={() => setShowLinkModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <span className="text-emerald-400 text-xl">🔗</span>
          </div>
          <div className="text-left">
            <div className="font-medium">Create call link</div>
            <div className="text-sm text-[#8696a0]">Share a link for your Chatsapp call</div>
          </div>
        </button>

        <h3 className="text-xs uppercase text-[#8696a0] tracking-wide px-4 py-2">Recent</h3>
        {calls.length === 0 && (
          <p className="text-center text-sm text-[#8696a0] py-12">No calls</p>
        )}
        {calls.map((c) => (
          <button
            key={c.id}
            onClick={() => onCall(c.name, c.callType, c.avatarColor, c.avatarText)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-[#202c33]"
          >
            <Avatar color={c.avatarColor} text={c.avatarText} />
            <div className="flex-1 text-left">
              <div className={`font-medium ${c.type === "missed" ? "text-red-400" : ""}`}>{c.name}</div>
              <div className="text-sm text-[#8696a0] flex items-center gap-1">
                {c.type === "incoming" && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />}
                {c.type === "outgoing" && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />}
                {c.type === "missed" && <PhoneMissed className="w-3.5 h-3.5 text-red-400" />}
                <span>{c.time}</span>
              </div>
            </div>
            <span className="p-2 text-emerald-400">
              {c.callType === "video" ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </span>
          </button>
        ))}
      </div>

      <div className="absolute bottom-20 right-4 flex flex-col gap-2 items-end">
        {onDialer && (
          <button
            onClick={onDialer}
            className="bg-[#202c33] hover:bg-[#2a3942] text-emerald-400 rounded-2xl w-12 h-12 shadow-lg flex items-center justify-center"
            title="Dial number"
          >
            #
          </button>
        )}
        <button
          onClick={() => setShowPicker(true)}
          className="bg-[#25D366] hover:bg-[#2BE37F] text-[#0b141a] rounded-2xl w-14 h-14 shadow-[0_8px_24px_rgba(37,211,102,0.35)] flex items-center justify-center relative transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Phone className="w-6 h-6" />
          <Plus className="w-3 h-3 absolute top-3 right-3" strokeWidth={3} />
        </button>
      </div>

      {showPicker && <CallPicker onBack={() => setShowPicker(false)} onCall={(n,t,col,tx) => { setShowPicker(false); onCall(n,t,col,tx); }} />}

      {/* Create call link modal */}
      {showLinkModal && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowLinkModal(false)}>
          <div className="bg-[#202c33] rounded-2xl p-5 max-w-sm w-full text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <Link className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-lg font-medium">Call link</h2>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="p-1.5 text-[#8696a0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#8696a0] mb-3">
              Anyone with the link can join this call. The link expires in 7 days.
            </p>

            <div className="bg-[#111b21] rounded-lg p-3 mb-4 break-all text-emerald-400 text-sm font-mono">
              {callLink}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={copyLink}
                className="bg-emerald-500 text-[#111b21] py-2 rounded-full font-semibold text-sm flex items-center justify-center gap-1.5"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {linkCopied ? "Copied" : "Copy link"}
              </button>
              <button
                onClick={() => {
                  onCall("Call link", "voice", "bg-emerald-500", "🔗");
                  setShowLinkModal(false);
                }}
                className="bg-[#111b21] text-emerald-400 py-2 rounded-full font-semibold text-sm"
              >
                Join with link
              </button>
            </div>
            <button className="w-full mt-2 text-center text-sm text-[#8696a0] py-1">
              Send via Chatsapp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CallPicker({
  onBack,
  onCall,
}: {
  onBack: () => void;
  onCall: (name: string, type: "voice" | "video", color: string, text: string) => void;
}) {
  const { state } = useStore();
  const contacts = state.chats.filter((c) => !c.isGroup);
  return (
    <div className="absolute inset-0 bg-[#111b21] z-40 flex flex-col text-white">
      <header className="flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="font-medium">Select contact to call</div>
          <div className="text-xs text-[#8696a0]">{contacts.length} contacts</div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-[#202c33]">
            <Avatar color={c.avatarColor} text={c.avatarText} />
            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-[#8696a0]">{c.about}</div>
            </div>
            <button onClick={() => onCall(c.name, "voice", c.avatarColor, c.avatarText)} className="p-2 text-emerald-400">
              <Phone className="w-5 h-5" />
            </button>
            <button onClick={() => onCall(c.name, "video", c.avatarColor, c.avatarText)} className="p-2 text-emerald-400">
              <Video className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
