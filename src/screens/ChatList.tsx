import { useState } from "react";
import type { Chat } from "../data";
import { Avatar } from "../components/Avatar";
import { Ticks } from "../components/Ticks";
import { Camera, More, Search, Plus, Pin, VolumeX, ChatBubble, Archive, Lock, ChatsappLogo } from "../icons";
import { useStore } from "../store";
import { ChatLabelsPicker } from "./BusinessScreens";
import { ProfilePeek } from "./FinalScreens";
import { useToast } from "../components/Toast";

const baseFilters = ["All", "Unread", "Favorites", "Groups"];

export function ChatList({
  chats,
  onOpen,
  onMenu,
  onSearch,
  onNewChat,
  onArchived,
  onCamera,
  onLockedChats,
}: {
  chats: Chat[];
  onOpen: (id: string) => void;
  onMenu: () => void;
  onSearch: () => void;
  onNewChat: () => void;
  onArchived: () => void;
  onCamera: () => void;
  onLockedChats: () => void;
}) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState("All");
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [labelPicker, setLabelPicker] = useState<string | null>(null);
  const [multiSel, setMultiSel] = useState<Set<string>>(new Set());
  const [peekChatId, setPeekChatId] = useState<string | null>(null);

  const toggleMulti = (id: string) =>
    setMultiSel((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Hide locked chats from main list
  const visible = chats.filter((c) => !state.archived.includes(c.id) && !state.lockedChats.includes(c.id));

  const filters = [...baseFilters, ...state.labels.map((l) => l.name)];

  let filtered = visible.filter((c) => {
    if (filter === "Unread" && c.unread === 0) return false;
    if (filter === "Groups" && !c.isGroup) return false;
    if (filter === "Favorites" && !c.pinned) return false;
    // Label filter
    const label = state.labels.find((l) => l.name === filter);
    if (label) {
      const ids = state.chatLabels[c.id] || [];
      if (!ids.includes(label.id)) return false;
    }
    return true;
  });

  // Sort: pinned first
  filtered = [...filtered].sort((a, b) => Number(b.pinned ?? 0) - Number(a.pinned ?? 0));

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      {/* Multi-select bar */}
      {multiSel.size > 0 && (
        <div className="bg-emerald-700 flex items-center gap-2 px-2 py-2 text-white">
          <button onClick={() => setMultiSel(new Set())} className="p-2 rounded-full hover:bg-white/10">
            ✕
          </button>
          <div className="flex-1 font-medium">{multiSel.size} selected</div>
          <button
            onClick={() => {
              multiSel.forEach((id) => dispatch({ type: "PIN_CHAT", chatId: id }));
              setMultiSel(new Set());
            }}
            className="p-2"
            title="Pin"
          >📌</button>
          <button
            onClick={() => {
              multiSel.forEach((id) => dispatch({ type: "MUTE_CHAT", chatId: id }));
              setMultiSel(new Set());
            }}
            className="p-2"
            title="Mute"
          >🔕</button>
          <button
            onClick={() => {
              multiSel.forEach((id) => dispatch({ type: "MARK_READ", chatId: id }));
              setMultiSel(new Set());
            }}
            className="p-2"
            title="Mark read"
          >✓✓</button>
          <button
            onClick={() => {
              multiSel.forEach((id) => dispatch({ type: "ARCHIVE_CHAT", chatId: id }));
              setMultiSel(new Set());
            }}
            className="p-2"
            title="Archive"
          >📥</button>
          <button
            onClick={() => {
              if (confirm(`Delete ${multiSel.size} chats?`)) {
                multiSel.forEach((id) => dispatch({ type: "DELETE_CHAT", chatId: id }));
                setMultiSel(new Set());
              }
            }}
            className="p-2 text-red-200"
            title="Delete"
          >🗑️</button>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 animate-fade-in">
          <ChatsappLogo className="w-8 h-8" />
          <h1 className="text-2xl font-bold text-emerald-400">Chatsapp</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCamera} className="p-2 rounded-full hover:bg-white/10" aria-label="Camera">
            <Camera className="w-5 h-5" />
          </button>
          <button onClick={onSearch} className="p-2 rounded-full hover:bg-white/10" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button onClick={onMenu} className="p-2 rounded-full hover:bg-white/10" aria-label="Menu">
            <More className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search bar (tap to open search screen) */}
      <div className="px-3 pb-2">
        <button
          onClick={onSearch}
          className="w-full flex items-center gap-3 bg-[#202c33] rounded-full px-4 py-2 text-left"
        >
          <Search className="w-4 h-4 text-emerald-400" />
          <span className="flex-1 text-sm text-[#8696a0]">Search</span>
        </button>
      </div>

      {/* Filters */}
      <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1 rounded-full whitespace-nowrap ${
              filter === f
                ? "bg-emerald-900/60 text-emerald-300"
                : "bg-[#202c33] text-[#aebac1]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Locked chats link */}
      {state.lockedChatPin && (
        <button
          onClick={onLockedChats}
          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] border-b border-[#222d34]"
        >
          <Lock className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">Locked chats</span>
          <span className="ml-auto text-xs text-[#8696a0]">{state.lockedChats.length}</span>
        </button>
      )}

      {/* Archived link */}
      {state.archived.length > 0 && (
        <button
          onClick={onArchived}
          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] border-b border-[#222d34]"
        >
          <Archive className="w-5 h-5 text-[#8696a0]" />
          <span className="font-medium text-sm">Archived</span>
          <span className="ml-auto text-xs text-[#8696a0]">{state.archived.length}</span>
        </button>
      )}

      {/* Chats */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center text-[#8696a0] mt-20 px-6">
            <ChatBubble className="w-12 h-12 mx-auto mb-3 opacity-40" />
            No chats found
          </div>
        )}
        {filtered.map((chat, i) => (
          <div
            key={chat.id}
            className={`relative animate-fade-in ${multiSel.has(chat.id) ? "bg-emerald-500/10" : ""}`}
            style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
          >
            <button
              onClick={() => {
                if (multiSel.size > 0) toggleMulti(chat.id);
                else onOpen(chat.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (multiSel.size > 0) toggleMulti(chat.id);
                else setContextMenu({ id: chat.id, x: e.clientX, y: e.clientY });
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] active:bg-[#202c33] text-left"
            >
              <span
                onClick={(e) => { e.stopPropagation(); setPeekChatId(chat.id); }}
                className="cursor-pointer"
              >
                <Avatar color={chat.avatarColor} text={chat.avatarText} online={chat.online} />
              </span>
              <div className="flex-1 min-w-0 border-b border-[#222d34] pb-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{chat.name}</span>
                  <span
                    className={`text-xs ml-2 shrink-0 ${
                      chat.unread > 0 ? "text-emerald-400" : "text-[#8696a0]"
                    }`}
                  >
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <div className="flex items-center gap-1 text-sm text-[#8696a0] truncate">
                    {state.drafts[chat.id] ? (
                      <>
                        <span className="text-red-400 text-xs">Draft:</span>
                        <span className="truncate italic">{state.drafts[chat.id]}</span>
                      </>
                    ) : (
                      <>
                        {!chat.typing && chat.messages[chat.messages.length - 1]?.sent && (
                          <Ticks status={chat.messages[chat.messages.length - 1].status} />
                        )}
                        <span className={`truncate ${chat.typing ? "text-emerald-400 italic" : ""}`}>
                          {chat.lastMessage || "Start a conversation"}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    {(state.chatLabels[chat.id] || []).slice(0, 3).map((labelId) => {
                      const lbl = state.labels.find((l) => l.id === labelId);
                      return lbl ? <span key={labelId} className={`w-2 h-2 rounded-full ${lbl.color}`} title={lbl.name} /> : null;
                    })}
                    {chat.muted && <VolumeX className="w-4 h-4 text-[#8696a0]" />}
                    {chat.pinned && <Pin className="w-3.5 h-3.5 text-[#8696a0]" />}
                    {chat.unread > 0 && (
                      <span className="bg-emerald-500 text-[#111b21] text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({ id: chat.id, x: 0, y: 0 });
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 opacity-0 hover:opacity-100"
            />
          </div>
        ))}
        <div className="text-center text-xs text-[#8696a0] py-6 px-6">
          🔒 Your personal messages are end-to-end encrypted
        </div>
      </div>

      {contextMenu && (
        <div className="absolute inset-0 z-30" onClick={() => setContextMenu(null)}>
          <div
            className="absolute bg-[#233138] rounded-md shadow-lg py-2 w-48 text-white"
            style={{
              left: Math.min(contextMenu.x, 200),
              top: Math.min(contextMenu.y, 500),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: "Select", action: () => setMultiSel(new Set([contextMenu.id])) },
              {
                label: chats.find((c) => c.id === contextMenu.id)?.pinned ? "Unpin chat" : "Pin chat",
                action: () => {
                  const target = chats.find((c) => c.id === contextMenu.id);
                  const pinnedCount = chats.filter((c) => c.pinned).length;
                  if (!target?.pinned && pinnedCount >= state.pinLimit) {
                    toast.show({ message: `You can only pin up to ${state.pinLimit} chats. Unpin one first.`, type: "warning" });
                    return;
                  }
                  dispatch({ type: "PIN_CHAT_LIMITED", chatId: contextMenu.id });
                },
              },
              { label: chats.find((c) => c.id === contextMenu.id)?.muted ? "Unmute" : "Mute", action: () => dispatch({ type: "MUTE_CHAT", chatId: contextMenu.id }) },
              { label: "Mark as read", action: () => dispatch({ type: "MARK_READ", chatId: contextMenu.id }) },
              { label: "Add labels", action: () => setLabelPicker(contextMenu.id) },
              {
                label: "Lock chat",
                action: () => {
                  if (!state.lockedChatPin) {
                    toast.show({
                      message: "Set up chat lock first in Settings → Chat lock",
                      type: "warning",
                    });
                    return;
                  }
                  dispatch({ type: "LOCK_CHAT", chatId: contextMenu.id });
                  toast.show({ message: "Chat locked", type: "success" });
                },
              },
              { label: "Archive", action: () => dispatch({ type: "ARCHIVE_CHAT", chatId: contextMenu.id }) },
              { label: "Delete chat", action: () => { if (confirm("Delete this chat?")) dispatch({ type: "DELETE_CHAT", chatId: contextMenu.id }); }, danger: true },
            ].map((it) => (
              <button
                key={it.label}
                onClick={() => { it.action(); setContextMenu(null); }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/10 ${it.danger ? "text-red-400" : ""}`}
              >
                {it.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onNewChat}
        className="absolute bottom-20 right-4 bg-[#25D366] hover:bg-[#2BE37F] text-[#0b141a] rounded-2xl w-14 h-14 shadow-[0_8px_24px_rgba(37,211,102,0.35)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="New chat"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {labelPicker && (
        <ChatLabelsPicker chatId={labelPicker} onClose={() => setLabelPicker(null)} />
      )}

      {peekChatId && (() => {
        const c = state.chats.find((x) => x.id === peekChatId);
        if (!c) return null;
        return (
          <ProfilePeek
            chat={c}
            onClose={() => setPeekChatId(null)}
            onMessage={() => onOpen(c.id)}
            onCall={() => onOpen(c.id)}
            onVideo={() => onOpen(c.id)}
            onInfo={() => onOpen(c.id)}
          />
        );
      })()}
    </div>
  );
}
