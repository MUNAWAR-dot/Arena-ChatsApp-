import { useState } from "react";
import { Avatar } from "../components/Avatar";
import { useStore } from "../store";
import {
  ArrowLeft, More, Verified, Bell, Eye, Heart,
  Forward as ForwardIcon, ChevronRight, Send
} from "../icons";

type ChannelPost = {
  id: string;
  text: string;
  time: string;
  views: string;
  reactions: { emoji: string; count: number }[];
  hasMedia?: boolean;
};

const SAMPLE_POSTS: Record<string, ChannelPost[]> = {
  default: [
    { id: "p1", text: "🎉 Big news! Welcome to our channel. Stay tuned for exclusive updates.", time: "Just now", views: "248K", reactions: [{ emoji: "❤️", count: 5621 }, { emoji: "🔥", count: 1234 }] },
    { id: "p2", text: "Check out our latest behind-the-scenes look 📸", time: "2h ago", views: "1.2M", reactions: [{ emoji: "❤️", count: 12450 }, { emoji: "👏", count: 3421 }, { emoji: "✨", count: 891 }], hasMedia: true },
    { id: "p3", text: "Question for you all — what topic should we cover next? Reply with reactions!\n\n❤️ Tech news\n🔥 Behind the scenes\n👏 Tutorials\n✨ Q&A", time: "Yesterday", views: "3.4M", reactions: [{ emoji: "❤️", count: 8932 }, { emoji: "🔥", count: 5621 }, { emoji: "👏", count: 4123 }, { emoji: "✨", count: 2890 }] },
    { id: "p4", text: "Thank you for 1M followers! 🎊", time: "Mon", views: "892K", reactions: [{ emoji: "❤️", count: 23456 }, { emoji: "🎉", count: 18923 }] },
    { id: "p5", text: "Heads up — we're going live tomorrow at 8pm EST. Don't miss it!", time: "Sun", views: "421K", reactions: [{ emoji: "🔥", count: 6234 }] },
  ],
};

export function ChannelView({
  channelName,
  onBack,
  onNotifications,
  onAdmin,
  isOwner,
}: {
  channelName: string;
  onBack: () => void;
  onNotifications?: () => void;
  onAdmin?: () => void;
  isOwner?: boolean;
}) {
  const { state, dispatch } = useStore();
  const channelId = "ch-" + channelName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const [following, setFollowing] = useState(state.channelNotifications[channelId] !== false);
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const [showMenu, setShowMenu] = useState(false);

  const posts = SAMPLE_POSTS.default;
  const colorMap: Record<string, string> = {
    "Chatsapp": "bg-emerald-600",
    "Tech News": "bg-blue-600",
    "Daily Sports": "bg-orange-600",
    "Music Hub": "bg-purple-600",
    "Foodie": "bg-yellow-600",
    "Travel Diaries": "bg-cyan-600",
    "Cinema": "bg-rose-600",
    "Wellness": "bg-emerald-500",
  };

  const react = (postId: string, emoji: string) => {
    setReactions((r) => ({ ...r, [postId]: r[postId] === emoji ? "" : emoji }));
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      {/* Header */}
      <header className="bg-[#202c33] flex items-center gap-2 px-2 py-2 relative">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar
          color={colorMap[channelName] || "bg-emerald-600"}
          text={channelName.slice(0, 2).toUpperCase()}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium flex items-center gap-1 truncate">
            {channelName}
            <Verified className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          </div>
          <div className="text-xs text-[#aebac1]">
            {following ? "Following · Notifications on" : "192M followers"}
          </div>
        </div>
        <button
          onClick={() => {
            dispatch({ type: "TOGGLE_CHANNEL_NOTIFICATION", channelId });
            setFollowing(!following);
          }}
          className="p-2 rounded-full hover:bg-white/10"
          title={following ? "Mute" : "Notifications"}
        >
          <Bell className={`w-5 h-5 ${following ? "text-emerald-400" : "text-[#aebac1]"}`} />
        </button>
        <button onClick={() => setShowMenu((v) => !v)} className="p-2 rounded-full hover:bg-white/10">
          <More className="w-5 h-5" />
        </button>
        {showMenu && (
          <div className="absolute right-2 top-12 bg-[#233138] rounded-md shadow-lg py-2 w-52 z-50">
            {[
              { label: "View channel info", action: () => setShowMenu(false) },
              ...(isOwner ? [{ label: "🛠️ Admin tools", action: () => { setShowMenu(false); onAdmin?.(); } }] : []),
              { label: onNotifications ? "Notification settings" : "Mute notifications", action: () => { setShowMenu(false); onNotifications?.(); } },
              { label: "Share channel" },
              { label: "Report channel" },
              { label: "Unfollow", action: () => { setShowMenu(false); onBack(); }, danger: true },
            ].map((it) => (
              <button
                key={it.label}
                onClick={() => { (it as any).action?.(); setShowMenu(false); }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-white/10 ${(it as any).danger ? "text-red-400" : ""}`}
              >
                {it.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Channel banner */}
      <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 px-4 py-6 text-center border-b border-[#222d34]">
        <Avatar
          color={colorMap[channelName] || "bg-emerald-600"}
          text={channelName.slice(0, 2).toUpperCase()}
          size="2xl"
        />
        <h2 className="text-2xl font-medium mt-3 flex items-center justify-center gap-2">
          {channelName}
          <Verified className="w-5 h-5 text-white" />
        </h2>
        <p className="text-sm text-emerald-100 mt-1">192M followers · Channel</p>
        <button
          onClick={() => setFollowing(!following)}
          className={`mt-3 px-6 py-1.5 rounded-full text-sm font-semibold ${
            following ? "bg-white/20 text-white" : "bg-white text-emerald-700"
          }`}
        >
          {following ? "Following ✓" : "Follow"}
        </button>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0b141a]">
        {posts.map((p) => (
          <div key={p.id} className="bg-[#202c33] rounded-lg overflow-hidden">
            {p.hasMedia && (
              <div className="aspect-video bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 flex items-center justify-center">
                <span className="text-6xl">📸</span>
              </div>
            )}
            <div className="p-3">
              <div className="text-sm whitespace-pre-wrap">{p.text}</div>
              <div className="flex items-center gap-3 mt-3 text-xs text-[#8696a0]">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {p.views}
                </span>
                <span>{p.time}</span>
                <button className="ml-auto p-1 hover:text-white">
                  <ForwardIcon className="w-4 h-4" />
                </button>
              </div>
              {/* Reactions row */}
              <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
                {p.reactions.map((r) => {
                  const isMine = reactions[p.id] === r.emoji;
                  return (
                    <button
                      key={r.emoji}
                      onClick={() => react(p.id, r.emoji)}
                      className={`shrink-0 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                        isMine ? "bg-emerald-500/30 text-emerald-300" : "bg-[#111b21] text-[#aebac1] hover:bg-[#0b141a]"
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span>{(r.count + (isMine ? 1 : 0)).toLocaleString()}</span>
                    </button>
                  );
                })}
                <button
                  onClick={() => react(p.id, "❤️")}
                  className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-[#111b21] text-[#aebac1] hover:bg-[#0b141a]"
                >
                  <Heart className="w-3 h-3 inline" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <div className="text-center text-xs text-[#8696a0] py-4">
          🔒 You can only view and react to posts. Channel admins can't see who reacted.
        </div>
      </div>
    </div>
  );
}

// "View profile" full screen — peek style for chats
export function ContactProfileFullView({
  chat,
  onBack,
  onMessage,
  onCall,
  onVideo,
  onInfo,
}: {
  chat: { name: string; avatarColor: string; avatarText: string; phone?: string; about?: string; isGroup?: boolean; members?: string[] };
  onBack: () => void;
  onMessage: () => void;
  onCall: () => void;
  onVideo: () => void;
  onInfo: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 bg-[#111b21] text-white flex flex-col">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">{chat.isGroup ? "Group profile" : "Profile"}</h1>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className={`aspect-square ${chat.avatarColor} flex items-center justify-center`}>
          <span className="text-9xl font-bold text-white opacity-90">{chat.avatarText}</span>
        </div>
        <div className="px-4 py-4 border-b border-[#222d34]">
          <h2 className="text-2xl font-semibold">{chat.name}</h2>
          <p className="text-sm text-[#8696a0] mt-1">
            {chat.isGroup ? `${chat.members?.length || 0} members` : (chat.phone || "Hey there!")}
          </p>
        </div>
        {chat.about && (
          <div className="px-4 py-4 border-b border-[#222d34]">
            <div className="text-xs text-[#8696a0] mb-1">About</div>
            <div className="text-sm">{chat.about}</div>
          </div>
        )}
        <div className="grid grid-cols-4 gap-2 p-4">
          <button onClick={onMessage} className="flex flex-col items-center gap-1 py-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942]">
            <Send className="w-5 h-5 text-emerald-400" />
            <span className="text-xs">Message</span>
          </button>
          <button onClick={onCall} className="flex flex-col items-center gap-1 py-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942]">
            <span className="text-xl">📞</span>
            <span className="text-xs">Audio</span>
          </button>
          <button onClick={onVideo} className="flex flex-col items-center gap-1 py-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942]">
            <span className="text-xl">📹</span>
            <span className="text-xs">Video</span>
          </button>
          <button onClick={onInfo} className="flex flex-col items-center gap-1 py-3 bg-[#202c33] rounded-lg hover:bg-[#2a3942]">
            <ChevronRight className="w-5 h-5 text-emerald-400" />
            <span className="text-xs">Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}
