import type { Chat } from "../data";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, Phone, Video, Search, Bell, Lock, Star, Image as ImageIcon, ChevronRight, Users, Clock, VolumeX, Palette, Link, Shield } from "../icons";

export function ContactInfo({
  chat,
  onBack,
  onCall,
  onMedia,
  onMembers,
  onEditGroup,
  onSearchInChat,
  onSecurityCode,
  onDisappearing,
  onPhoto,
  onChatTheme,
  onInviteLink,
  onSpamReport,
  onCommonGroups,
  onPermissions,
  onCustomNotifications,
  onChangeGroupIcon,
}: {
  chat: Chat;
  onBack: () => void;
  onCall: (t: "voice" | "video") => void;
  onMedia: () => void;
  onMembers?: () => void;
  onEditGroup?: () => void;
  onSearchInChat?: () => void;
  onSecurityCode?: () => void;
  onDisappearing?: () => void;
  onPhoto?: () => void;
  onChatTheme?: () => void;
  onInviteLink?: () => void;
  onSpamReport?: () => void;
  onCommonGroups?: () => void;
  onPermissions?: () => void;
  onCustomNotifications?: () => void;
  onChangeGroupIcon?: () => void;
}) {
  const { state, dispatch } = useStore();
  const isBlocked = state.settings.blockedContacts.includes(chat.id);
  const mediaCount = chat.messages.filter((m) => m.type === "image" || m.type === "doc").length;
  const starredCount = state.starred.filter((k) => k.startsWith(chat.id + ":")).length;

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white overflow-y-auto">
      <header className="flex items-center gap-3 px-2 py-3 bg-[#111b21] sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">{chat.isGroup ? "Group info" : "Contact info"}</h1>
      </header>

      <div className="flex flex-col items-center py-6 px-4 border-b border-[#222d34]">
        <button onClick={onPhoto} className="cursor-zoom-in">
          <Avatar color={chat.avatarColor} text={chat.avatarText} size="2xl" online={chat.online} />
        </button>
        <h2 className="text-2xl font-medium mt-4">{chat.name}</h2>
        {chat.isGroup ? (
          <div className="text-sm text-[#8696a0] mt-1">Group · {chat.members?.length} members</div>
        ) : (
          <>
            <div className="text-sm text-[#8696a0] mt-1">{chat.phone}</div>
            <div className="text-xs text-emerald-400 mt-1">{chat.online ? "online" : "last seen recently"}</div>
          </>
        )}
        <div className="flex gap-8 mt-6">
          <button onClick={() => onCall("voice")} className="flex flex-col items-center gap-1 text-emerald-400">
            <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <span className="text-xs">Audio</span>
          </button>
          <button onClick={() => onCall("video")} className="flex flex-col items-center gap-1 text-emerald-400">
            <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-xs">Video</span>
          </button>
          <button onClick={onSearchInChat} className="flex flex-col items-center gap-1 text-emerald-400">
            <div className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-xs">Search</span>
          </button>
        </div>
        {chat.isGroup && (
          <div className="flex gap-2 mt-4">
            {onEditGroup && (
              <button
                onClick={onEditGroup}
                className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm"
              >
                Edit info
              </button>
            )}
            {onChangeGroupIcon && (
              <button
                onClick={onChangeGroupIcon}
                className="px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-sm flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4" /> Change icon
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-4 border-b border-[#222d34]">
        <div className="text-sm text-[#8696a0] mb-1">About</div>
        <div>{chat.about ?? "Hey there! I am using Chatsapp."}</div>
      </div>

      {chat.isGroup && (
        <div className="border-b border-[#222d34] py-3">
          <div className="px-4 text-sm text-[#8696a0] mb-2 flex items-center justify-between">
            <span>{chat.members?.length} members</span>
            <button onClick={onMembers} className="text-emerald-400 text-xs">Manage</button>
          </div>
          {chat.members?.slice(0, 5).map((m) => (
            <div key={m} className="flex items-center gap-3 px-4 py-2 hover:bg-[#202c33]">
              <Avatar color="bg-zinc-600" text={m.slice(0, 2).toUpperCase()} />
              <div className="flex-1 font-medium">{m}</div>
              {m === "You" && <span className="text-xs text-emerald-400">You</span>}
            </div>
          ))}
          {(chat.members?.length || 0) > 5 && (
            <button onClick={onMembers} className="w-full text-left px-4 py-2 text-emerald-400 text-sm flex items-center gap-3">
              <Users className="w-5 h-5" />
              View all {chat.members?.length} members
            </button>
          )}
        </div>
      )}

      <div className="border-b border-[#222d34]">
        <button onClick={onMedia} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
          <ImageIcon className="w-5 h-5 text-[#8696a0]" />
          <div className="flex-1">
            <div className="text-sm">Media, links, and docs</div>
          </div>
          <span className="text-sm text-[#8696a0]">{mediaCount}</span>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
          <Star className="w-5 h-5 text-[#8696a0]" />
          <div className="flex-1 text-sm">Starred messages</div>
          <span className="text-sm text-[#8696a0]">{starredCount || "None"}</span>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onDisappearing} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
          <Clock className="w-5 h-5 text-[#8696a0]" />
          <div className="flex-1 text-sm">Disappearing messages</div>
          <span className="text-sm text-[#8696a0]">
            {(() => {
              const h = state.disappearTimers[chat.id];
              return !h ? "Off" : h === 24 ? "24 hours" : h === 168 ? "7 days" : "90 days";
            })()}
          </span>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button
          onClick={() => dispatch({ type: "MUTE_CHAT", chatId: chat.id })}
          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left"
        >
          <VolumeX className="w-5 h-5 text-[#8696a0]" />
          <div className="flex-1 text-sm">Mute notifications</div>
          <span className="text-sm text-[#8696a0]">{chat.muted ? "Muted" : "Off"}</span>
        </button>
        <button onClick={onCustomNotifications} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
          <Bell className="w-5 h-5 text-[#8696a0]" />
          <div className="flex-1 text-sm">Custom notifications</div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onSecurityCode} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
          <Lock className="w-5 h-5 text-[#8696a0]" />
          <div className="flex-1">
            <div className="text-sm">Encryption</div>
            <div className="text-xs text-[#8696a0]">Tap to verify · End-to-end encrypted</div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        <button onClick={onChatTheme} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
          <Palette className="w-5 h-5 text-[#8696a0]" />
          <div className="flex-1 text-sm">Chat wallpaper</div>
          <ChevronRight className="w-4 h-4 text-[#8696a0]" />
        </button>
        {chat.isGroup && onInviteLink && (
          <button onClick={onInviteLink} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
            <Link className="w-5 h-5 text-[#8696a0]" />
            <div className="flex-1 text-sm">Invite via link</div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        )}
        {chat.isGroup && onPermissions && (
          <button onClick={onPermissions} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
            <Shield className="w-5 h-5 text-[#8696a0]" />
            <div className="flex-1 text-sm">Group permissions</div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        )}
        {!chat.isGroup && onCommonGroups && (
          <button onClick={onCommonGroups} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
            <Users className="w-5 h-5 text-[#8696a0]" />
            <div className="flex-1 text-sm">Groups in common</div>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>
        )}
      </div>

      <div className="py-2">
        {!chat.isGroup && (
          <button
            onClick={() => {
              if (isBlocked) {
                dispatch({ type: "UNBLOCK_CONTACT", chatId: chat.id });
              } else if (confirm(`Block ${chat.name}? You will no longer receive messages or calls from them.`)) {
                dispatch({ type: "BLOCK_CONTACT", chatId: chat.id });
              }
            }}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#202c33]"
          >
            {isBlocked ? `Unblock ${chat.name}` : `Block ${chat.name}`}
          </button>
        )}
        {onSpamReport && (
          <button
            onClick={onSpamReport}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#202c33]"
          >
            Report spam
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(chat.isGroup ? "Exit group?" : `Report ${chat.name}?`)) {
              if (chat.isGroup) {
                dispatch({ type: "DELETE_CHAT", chatId: chat.id });
                onBack();
              }
            }
          }}
          className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#202c33]"
        >
          {chat.isGroup ? "Exit group" : `Report ${chat.name}`}
        </button>
        <button
          onClick={() => {
            if (confirm("Delete this chat permanently?")) {
              dispatch({ type: "DELETE_CHAT", chatId: chat.id });
              onBack();
            }
          }}
          className="w-full text-left px-4 py-3 text-red-400 hover:bg-[#202c33]"
        >
          Delete chat
        </button>
      </div>
    </div>
  );
}
