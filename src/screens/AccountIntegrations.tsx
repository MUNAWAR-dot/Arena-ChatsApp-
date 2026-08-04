import { useState } from "react";
import { useStore } from "../store";
import {
  ArrowLeft, GoogleG, Mail, Check, Plus,
  Smartphone, Cloud, Download, X, User, Phone
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

// Connected accounts (Google / Email only)
export function ConnectedAccounts({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  const [connections, setConnections] = useState({
    google: !!state.profile.phone && !state.profile.phone.includes("@") ? true : false,
    email: !!state.profile.phone?.includes("@"),
  });

  const toggle = (k: keyof typeof connections) => setConnections((c) => ({ ...c, [k]: !c[k] }));

  const items = [
    {
      key: "google" as const,
      name: "Google",
      sub: connections.google ? state.profile.phone : "Sync contacts and back up to Google Drive",
      icon: <GoogleG />,
      bg: "bg-white",
    },
    {
      key: "email" as const,
      name: "Email",
      sub: connections.email ? state.profile.phone : "Add an email for account recovery",
      icon: <Mail className="w-5 h-5 text-emerald-400" />,
      bg: "bg-emerald-500/20",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Connected accounts" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-4">
          <p className="text-sm text-[#8696a0]">
            Sign in to other services to import contacts, back up your chats, and find friends.
          </p>
        </div>
        {items.map((it) => (
          <div key={it.key} className="flex items-center gap-3 px-4 py-3 border-b border-[#222d34]">
            <div className={`w-12 h-12 rounded-full ${it.bg} flex items-center justify-center`}>
              {it.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{it.name}</div>
              <div className="text-xs text-[#8696a0] truncate">{it.sub}</div>
            </div>
            {connections[it.key] ? (
              <button
                onClick={() => toggle(it.key)}
                className="text-red-400 text-sm px-3 py-1 rounded-full"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => toggle(it.key)}
                className="bg-emerald-500 text-[#111b21] text-sm font-medium px-3 py-1 rounded-full"
              >
                Connect
              </button>
            )}
          </div>
        ))}
        <div className="px-4 py-4 text-xs text-[#8696a0]">
          Disconnecting an account does not delete your Chatsapp account or messages.
        </div>
      </div>
    </div>
  );
}

// Multiple accounts — fully functional
export function MultipleAccounts({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [accounts, setAccounts] = useState([
    {
      id: "main",
      name: state.profile.name,
      phone: state.profile.phone,
      color: state.profile.avatarColor,
      text: state.profile.avatarText,
      current: true,
    },
  ]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const switchAccount = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (!acc || acc.current) return;
    setAccounts((arr) => arr.map((a) => ({ ...a, current: a.id === id })));
    dispatch({
      type: "UPDATE_PROFILE",
      profile: {
        name: acc.name,
        phone: acc.phone,
        avatarColor: acc.color,
        avatarText: acc.text,
      },
    });
    showToast(`Switched to ${acc.name}`);
  };

  const addAccount = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const colors = ["bg-pink-500","bg-purple-500","bg-blue-500","bg-orange-500"];
    const acc = {
      id: "acc" + Date.now(),
      name: newName.trim(),
      phone: newPhone.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      text: newName.trim().slice(0, 2).toUpperCase(),
      current: false,
    };
    setAccounts((arr) => [...arr, acc]);
    setAdding(false);
    setNewName("");
    setNewPhone("");
    showToast("Account added! Tap to switch");
  };

  const removeAccount = (id: string) => {
    setAccounts((arr) => {
      const target = arr.find((a) => a.id === id);
      if (target?.current) {
        showToast("You can't remove the active account");
        return arr;
      }
      showToast("Account removed");
      return arr.filter((a) => a.id !== id);
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Add account" onBack={onBack} sub="Use up to two Chatsapp accounts on this device" />
      <div className="flex-1 overflow-y-auto">
        {accounts.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-3 py-3 border-b border-[#222d34]">
            <div className={`w-12 h-12 rounded-full ${a.color} flex items-center justify-center text-white font-semibold`}>
              {a.text}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium flex items-center gap-2">
                {a.name}
                {a.current && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Active</span>
                )}
              </div>
              <div className="text-xs text-[#8696a0] truncate">{a.phone}</div>
            </div>
            {!a.current ? (
              <div className="flex gap-2">
                <button onClick={() => switchAccount(a.id)} className="text-emerald-400 text-sm px-3">
                  Switch
                </button>
                <button onClick={() => removeAccount(a.id)} className="text-red-400 text-sm px-2">
                  ✕
                </button>
              </div>
            ) : (
              <span className="text-emerald-400">✓</span>
            )}
          </div>
        ))}
        {accounts.length < 2 && (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-medium">Add account</span>
          </button>
        )}
        <div className="px-4 py-4 text-xs text-[#8696a0]">
          You'll need a separate phone number for each account. Your accounts are kept entirely separate.
        </div>
      </div>

      {adding && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={() => setAdding(false)}>
          <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Add new account</h2>
              <button onClick={() => setAdding(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <User className="w-5 h-5 text-[#8696a0]" />
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Account name"
                className="flex-1 bg-[#111b21] rounded p-2 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Phone className="w-5 h-5 text-[#8696a0]" />
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                className="flex-1 bg-[#111b21] rounded p-2 outline-none"
              />
            </div>
            <button
              onClick={addAccount}
              disabled={!newName.trim() || !newPhone.trim()}
              className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
            >
              Add account
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-sm px-4 py-2 rounded-full shadow-xl z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

// Data export
export function DataExport({ onBack }: { onBack: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);

  const generate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setDone(true);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Request account info" onBack={onBack} />
      <div className="flex-1 p-6">
        <Cloud className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
        <p className="text-sm text-[#8696a0] mb-6 text-center">
          Create a report of your Chatsapp account information and settings, which you can access or port to another app.
        </p>

        <div className="bg-[#202c33] rounded-lg p-4 mb-4">
          <div className="text-xs text-[#8696a0] mb-1">This report includes</div>
          <ul className="text-sm space-y-1">
            <li>• Profile information (name, photo, about)</li>
            <li>• Settings and preferences</li>
            <li>• List of contacts and groups</li>
            <li>• Blocked contacts</li>
            <li>• Account creation date and last updates</li>
          </ul>
          <div className="text-[10px] text-[#8696a0] mt-2">
            Does not include messages or media.
          </div>
        </div>

        {!done ? (
          <button
            onClick={generate}
            disabled={generating}
            className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] font-semibold py-3 rounded-full flex items-center justify-center gap-2"
          >
            {generating ? "Preparing report…" : "Request report"}
          </button>
        ) : (
          <div className="text-center">
            <div className="bg-emerald-500/20 rounded-lg p-4 mb-3 flex items-center gap-3">
              <Check className="w-6 h-6 text-emerald-400" />
              <div className="flex-1 text-left">
                <div className="font-medium">Report ready</div>
                <div className="text-xs text-[#8696a0]">whatsapp_account.zip · 248 KB</div>
              </div>
            </div>
            <button className="bg-emerald-500 text-[#111b21] font-semibold py-2 px-6 rounded-full inline-flex items-center gap-2">
              <Download className="w-4 h-4" /> Download
            </button>
            <button onClick={() => setDone(false)} className="block mx-auto mt-3 text-xs text-[#8696a0]">
              Generate again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Move chats from another device
export function MoveChats({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Move chats to another phone" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-6">
        <Smartphone className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
        <p className="text-sm text-[#8696a0] mb-6 text-center">
          Transfer your chats, photos, videos, and voice messages to a new phone — even between iPhone and Android.
        </p>

        <h3 className="text-xs uppercase text-emerald-400 mb-2">Choose destination</h3>
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#202c33] rounded-lg mb-2">
          <span className="text-2xl">📱</span>
          <div className="text-left flex-1">
            <div className="font-medium">iPhone</div>
            <div className="text-xs text-[#8696a0]">Move chats to a new iPhone</div>
          </div>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#202c33] rounded-lg mb-2">
          <span className="text-2xl">🤖</span>
          <div className="text-left flex-1">
            <div className="font-medium">Android</div>
            <div className="text-xs text-[#8696a0]">Move chats to a new Android</div>
          </div>
        </button>

        <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs">
          Both phones must be on Wi-Fi during the transfer. Your old phone will sign you out.
        </div>
      </div>
    </div>
  );
}
