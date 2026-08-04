import { useState } from "react";
import { useStore } from "../store";
import { ArrowLeft, Users, Shield, Check } from "../icons";

export function NewCommunity({ onBack, onCreated }: { onBack: () => void; onCreated: () => void }) {
  const { dispatch } = useStore();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [created, setCreated] = useState(false);

  const create = () => {
    if (!name.trim()) return;
    // Persist community in the store so it shows in the Communities tab
    try {
      const raw = localStorage.getItem("wa-communities");
      const communities = raw ? JSON.parse(raw) : [];
      communities.push({
        id: "co" + Date.now(),
        name: name.trim(),
        avatarColor: "bg-emerald-600",
        avatarText: name.trim().slice(0, 2).toUpperCase(),
        description: desc.trim() || "New community",
        groups: [],
        members: [
          { name: "Admin", isAdmin: true },
          { name: "You", isAdmin: true },
        ],
        approvalRequired: false,
      });
      localStorage.setItem("wa-communities", JSON.stringify(communities));
    } catch {}
    void dispatch;
    setCreated(true);
    setTimeout(onCreated, 1200);
  };

  if (created) {
    return (
      <div className="absolute inset-0 z-50 bg-[#111b21] flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-[#111b21]" />
        </div>
        <h2 className="text-xl font-semibold">Community created</h2>
        <p className="text-sm text-[#8696a0] mt-1">You're now the admin of "{name}"</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-[#111b21] flex flex-col text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium flex-1">New community</h1>
        <button
          onClick={create}
          disabled={!name.trim()}
          className="text-emerald-400 font-medium px-3 disabled:opacity-40"
        >
          Create
        </button>
      </header>
      <div className="flex-1 p-4">
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Users className="w-10 h-10 text-emerald-400" />
          </div>
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Community name"
          className="w-full bg-[#202c33] rounded p-3 outline-none mb-3"
          autoFocus
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full bg-[#202c33] rounded p-3 outline-none text-sm resize-none"
        />
        <div className="mt-4 bg-[#202c33] rounded-lg p-3 text-xs text-[#8696a0]">
          <div className="text-white font-medium mb-1 flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" /> You are the community admin
          </div>
          • You can create and manage groups<br />
          • You control member approvals<br />
          • Admins can remove members
        </div>
      </div>
    </div>
  );
}
