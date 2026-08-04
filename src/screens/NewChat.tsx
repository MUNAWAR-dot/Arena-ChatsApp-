import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, Search, Users, User, Plus } from "../icons";
import { ContactEditor } from "./ContactEditor";
import { NewCommunity } from "./NewCommunity";

export function NewChat({
  onBack,
  onOpenChat,
  onCreateGroup,
}: {
  onBack: () => void;
  onOpenChat: (chatId: string) => void;
  onCreateGroup: () => void;
}) {
  const { state, dispatch } = useStore();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [addingContact, setAddingContact] = useState(false);
  const [creatingCommunity, setCreatingCommunity] = useState(false);

  // Real contacts only: existing 1:1 chats + user-created custom contacts.
  const existingChats = state.chats.filter((c) => !c.isGroup);
  const customContacts = state.customContacts;

  const startChatWithCustom = (contactId: string) => {
    const contact = customContacts.find((c) => c.id === contactId);
    if (!contact) return;
    const id = "ct-" + contact.id;
    if (!state.chats.some((c) => c.id === id)) {
      dispatch({
        type: "CREATE_CHAT",
        chat: {
          id,
          name: contact.name,
          avatarColor: contact.avatarColor,
          avatarText: contact.avatarText,
          lastMessage: "",
          time: "now",
          unread: 0,
          online: false,
          phone: contact.phone,
          about: contact.notes || "Hey there! I am using Chatsapp.",
          messages: [],
        },
      });
    }
    onOpenChat(id);
  };

  const q = query.toLowerCase().trim();

  // Combine real 1:1 chats + real custom contacts into one searchable list.
  const items = [
    ...existingChats.map((c) => ({ key: "chat-" + c.id, name: c.name, color: c.avatarColor, text: c.avatarText, sub: c.about || c.phone || "", onClick: () => onOpenChat(c.id) })),
    ...customContacts
      .filter((c) => !existingChats.some((ch) => ch.phone === c.phone))
      .map((c) => ({ key: "ct-" + c.id, name: c.name, color: c.avatarColor, text: c.avatarText, sub: c.phone, onClick: () => startChatWithCustom(c.id) })),
  ]
    .filter((it) => !q || it.name.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          {searching ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or number"
              className="bg-transparent w-full outline-none"
            />
          ) : (
            <>
              <div className="font-medium">Select contact</div>
              <div className="text-xs text-[#8696a0]">{items.length} contacts</div>
            </>
          )}
        </div>
        <button onClick={() => setSearching((v) => !v)} className="p-2 rounded-full hover:bg-white/10">
          <Search className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <button onClick={onCreateGroup} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#111b21]" />
          </div>
          <span className="font-medium">New group</span>
        </button>
        <button
          onClick={() => setAddingContact(true)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
            <User className="w-5 h-5 text-[#111b21]" />
          </div>
          <span className="font-medium">New contact</span>
        </button>
        <button
          onClick={() => setCreatingCommunity(true)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#202c33]"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
            <Plus className="w-5 h-5 text-[#111b21]" />
          </div>
          <span className="font-medium">New community</span>
        </button>

        <h3 className="text-xs uppercase text-[#8696a0] tracking-wide px-4 py-2">Contacts on Chatsapp</h3>
        {items.length === 0 && (
          <div className="text-center text-sm text-[#8696a0] mt-8 px-6">
            <p>No contacts yet.</p>
            <p className="text-xs mt-1">Tap "New contact" to add someone, or join a group to see members.</p>
          </div>
        )}
        {items.map((it) => (
          <button
            key={it.key}
            onClick={it.onClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
          >
            <Avatar color={it.color} text={it.text} />
            <div className="min-w-0">
              <div className="font-medium truncate">{it.name}</div>
              <div className="text-xs text-[#8696a0] truncate">{it.sub}</div>
            </div>
          </button>
        ))}
      </div>

      {addingContact && (
        <ContactEditor
          onBack={() => setAddingContact(false)}
          onSaved={(contact) => {
            const id = "ct-" + contact.id;
            if (!state.chats.some((c) => c.id === id)) {
              dispatch({
                type: "CREATE_CHAT",
                chat: {
                  id,
                  name: contact.name,
                  avatarColor: contact.avatarColor,
                  avatarText: contact.avatarText,
                  lastMessage: "",
                  time: "now",
                  unread: 0,
                  online: false,
                  phone: contact.phone,
                  about: contact.notes || "Hey there! I am using Chatsapp.",
                  messages: [],
                },
              });
            }
            setAddingContact(false);
            onOpenChat(id);
          }}
        />
      )}

      {creatingCommunity && (
        <NewCommunity
          onBack={() => setCreatingCommunity(false)}
          onCreated={() => setCreatingCommunity(false)}
        />
      )}
    </div>
  );
}
