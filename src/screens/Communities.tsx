import { useState } from "react";
import { Avatar } from "../components/Avatar";
import {
  More, Search, Users, Plus, ArrowLeft, Hash, Bell, Check, X,
  Crown, Shield, UserMinus, Settings, Clock, Lock, ChatsappLogo
} from "../icons";

type Community = {
  id: string;
  name: string;
  avatarColor: string;
  avatarText: string;
  description: string;
  groups: { id: string; name: string; lastMessage: string; time: string; unread: number }[];
  members: { name: string; isAdmin: boolean; pending?: boolean }[];
  approvalRequired: boolean;
};

function loadCommunities(): Community[] {
  try {
    const raw = localStorage.getItem("wa-communities");
    if (!raw) return [];
    const custom = JSON.parse(raw) as Community[];
    return custom;
  } catch {
    return [];
  }
}

export function Communities({ onOpenGroupChat }: { onOpenGroupChat?: (groupId: string, name: string) => void }) {
  const [communities, setCommunities] = useState<Community[]>(loadCommunities);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const community = communities.find((c) => c.id === openId);

  // ─── Community detail view ───────────────────────────────
  if (community) {
    const isAdmin = community.members.find((m) => m.name === "You")?.isAdmin;
    const pendingMembers = community.members.filter((m) => m.pending);

    const updateCommunity = (updates: Partial<Community>) => {
      setCommunities((arr) => arr.map((c) => (c.id === community.id ? { ...c, ...updates } : c)));
    };

    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
          <button onClick={() => setOpenId(null)} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Avatar color={community.avatarColor} text={community.avatarText} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{community.name}</div>
            <div className="text-xs text-[#8696a0]">{community.groups.length + 1} groups</div>
          </div>
          {isAdmin && (
            <button className="p-2 rounded-full hover:bg-white/10">
              <Settings className="w-5 h-5" />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto pb-6">
          <div className="flex items-center gap-3 p-4 border-b border-[#222d34]">
            <Avatar color={community.avatarColor} text={community.avatarText} size="lg" />
            <div>
              <div className="text-lg font-semibold flex items-center gap-1">
                {community.name}
                <Crown className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-sm text-[#8696a0]">{community.description}</div>
            </div>
          </div>

          {/* Admin-only: add group */}
          {isAdmin && (
            <button
              onClick={() => {
                const name = prompt("Group name:");
                if (name?.trim()) {
                  updateCommunity({
                    groups: [
                      ...community.groups,
                      { id: "g" + Date.now(), name: name.trim(), lastMessage: "Group created", time: "now", unread: 0 },
                    ],
                  });
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] text-emerald-400"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium">Add group</span>
              <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                Admin only
              </span>
            </button>
          )}

          {community.groups.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                if (onOpenGroupChat) onOpenGroupChat(g.id, g.name);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33] text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2a3942] flex items-center justify-center">
                <Hash className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="font-medium truncate">{g.name}</span>
                  <span className={`text-xs ${g.unread > 0 ? "text-emerald-400" : "text-[#8696a0]"}`}>{g.time}</span>
                </div>
                <div className="flex justify-between text-sm text-[#8696a0]">
                  <span className="truncate">{g.lastMessage}</span>
                  {g.unread > 0 && (
                    <span className="bg-emerald-500 text-[#111b21] text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                      {g.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Members */}
          <h3 className="text-xs uppercase text-[#8696a0] tracking-wide px-4 py-2 mt-4">
            Members ({community.members.length})
          </h3>

          {/* Pending approvals — visible to admins only */}
          {isAdmin && pendingMembers.length > 0 && (
            <div className="px-4 py-2">
              <div className="text-xs text-yellow-400 mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending approval ({pendingMembers.length})
              </div>
              {pendingMembers.map((m) => (
                <div key={m.name} className="flex items-center gap-3 py-2">
                  <Avatar color="bg-zinc-600" text={m.name.slice(0, 2).toUpperCase()} size="sm" />
                  <div className="flex-1 text-sm">{m.name}</div>
                  <button
                    onClick={() =>
                      updateCommunity({
                        members: community.members.map((x) =>
                          x.name === m.name ? { ...x, pending: false } : x
                        ),
                      })
                    }
                    className="bg-emerald-500 text-[#111b21] rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      updateCommunity({ members: community.members.filter((x) => x.name !== m.name) })
                    }
                    className="bg-red-500/20 text-red-400 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {community.members.filter((m) => !m.pending).map((m) => (
            <div key={m.name} className="flex items-center gap-3 px-4 py-2">
              <Avatar color={m.name === "You" ? "bg-emerald-600" : "bg-zinc-600"} text={m.name.slice(0, 2).toUpperCase()} size="sm" />
              <div className="flex-1 text-sm">{m.name}</div>
              {m.isAdmin ? (
                <span className="text-xs text-yellow-400 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Admin
                </span>
              ) : (
                isAdmin && (
                  <button
                    onClick={() =>
                      updateCommunity({ members: community.members.filter((x) => x.name !== m.name) })
                    }
                    className="text-red-400 p-1"
                    title="Remove"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )
              )}
            </div>
          ))}

          {/* Admin-only: approval toggle */}
          {isAdmin && (
            <div className="px-4 py-3 mt-3 flex items-center justify-between border-t border-[#222d34]">
              <div>
                <div className="text-sm font-medium">Admin approval for new members</div>
                <div className="text-xs text-[#8696a0]">
                  {community.approvalRequired
                    ? "Anyone can join via link, but admins must approve"
                    : "Anyone with the link can join instantly"}
                </div>
              </div>
              <button
                onClick={() => updateCommunity({ approvalRequired: !community.approvalRequired })}
                className={`w-11 h-6 rounded-full transition-colors relative ${community.approvalRequired ? "bg-emerald-500" : "bg-zinc-600"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${community.approvalRequired ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          )}

          {/* Non-admin join simulation */}
          {!isAdmin && (
            <div className="px-4 py-4 text-xs text-[#8696a0] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              Only community admins can manage groups and members.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main list ───────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <ChatsappLogo className="w-8 h-8 animate-wiggle" />
          <h1 className="text-2xl font-bold">Communities</h1>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-white/10"><Search className="w-5 h-5" /></button>
          <button className="p-2 rounded-full hover:bg-white/10"><More className="w-5 h-5" /></button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        <button
          onClick={() => setCreating(true)}
          className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[#202c33]"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-left">
            <div className="font-medium">New community</div>
            <div className="text-xs text-[#8696a0]">You'll become the admin</div>
          </div>
        </button>

        {communities.map((co) => {
          const you = co.members.find((m) => m.name === "You");
          const isAdmin = !!you?.isAdmin;
          const pending = co.members.filter((m) => m.pending).length;
          return (
            <div key={co.id} className="px-2 mb-2">
              <button
                onClick={() => setOpenId(co.id)}
                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-[#202c33] rounded-lg text-left"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden">
                  <Avatar color={co.avatarColor} text={co.avatarText} size="lg" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg flex items-center gap-1">
                    {co.name}
                    {isAdmin && <Crown className="w-4 h-4 text-yellow-400" />}
                  </div>
                  <div className="text-sm text-[#8696a0]">{co.description}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {isAdmin && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                  {pending > 0 && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {pending} pending
                    </span>
                  )}
                  {!isAdmin && (
                    <span className="text-[10px] text-[#8696a0]">Member</span>
                  )}
                  <Bell className="w-4 h-4 text-[#8696a0]" />
                </div>
              </button>
              {co.groups.slice(0, 2).map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    if (onOpenGroupChat) onOpenGroupChat(g.id, g.name);
                  }}
                  className="w-full flex items-center gap-3 pl-6 pr-3 py-2 hover:bg-[#202c33] rounded-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#2a3942] flex items-center justify-center">
                    <Hash className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium truncate">{g.name}</span>
                      <span className={`text-xs ${g.unread > 0 ? "text-emerald-400" : "text-[#8696a0]"}`}>{g.time}</span>
                    </div>
                    <div className="text-sm text-[#8696a0] truncate">{g.lastMessage}</div>
                  </div>
                </button>
              ))}
              <button
                onClick={() => setOpenId(co.id)}
                className="w-full text-left pl-6 py-2 text-sm text-emerald-400 hover:bg-[#202c33] rounded-lg"
              >
                View all
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setCreating(true)}
        className="absolute bottom-20 right-4 bg-[#25D366] hover:bg-[#2BE37F] text-[#0b141a] rounded-2xl w-14 h-14 shadow-[0_8px_24px_rgba(37,211,102,0.35)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Users className="w-6 h-6" />
        <Plus className="w-3 h-3 absolute top-3 right-3" strokeWidth={3} />
      </button>

      {/* Create community flow */}
      {creating && (
        <div className="absolute inset-0 z-50 bg-[#111b21] flex flex-col text-white">
          <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
            <button onClick={() => setCreating(false)} className="p-2 rounded-full hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium flex-1">New community</h1>
            <button
              onClick={() => {
                if (!newName.trim()) return;
                const colors = ["bg-emerald-600", "bg-blue-600", "bg-purple-600", "bg-orange-600"];
                const newCommunity: Community = {
                  id: "co" + Date.now(),
                  name: newName.trim(),
                  avatarColor: colors[Math.floor(Math.random() * colors.length)],
                  avatarText: newName.trim().slice(0, 2).toUpperCase(),
                  description: newDesc.trim() || "New community",
                  groups: [],
                  members: [
                    { name: "Admin", isAdmin: true },
                    { name: "You", isAdmin: true },
                  ],
                  approvalRequired: false,
                };
                setCommunities((arr) => {
                  const next = [...arr, newCommunity];
                  try {
                    localStorage.setItem("wa-communities", JSON.stringify(next));
                  } catch {}
                  return next;
                });
                setCreating(false);
                setNewName("");
                setNewDesc("");
              }}
              disabled={!newName.trim()}
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
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Community name"
              className="w-full bg-[#202c33] rounded p-3 outline-none mb-3"
              autoFocus
            />
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
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
      )}
    </div>
  );
}
