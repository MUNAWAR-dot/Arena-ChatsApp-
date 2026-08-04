import { Fragment, useEffect, useRef, useState } from "react";
import type { Chat, Message } from "../data";
import { Avatar } from "../components/Avatar";
import { Ticks } from "../components/Ticks";
import { PollMessage } from "../components/PollMessage";
import { VoicePlayer } from "../components/VoicePlayer";
import {
  ArrowLeft, Video, Phone, More, Smile, Paperclip, Camera, Mic, Send,
  Image, FileText, MapPin, User, Sticker, X, Reply, Forward, Copy, Trash, Star, StarFilled, Info, Pin, Edit3, Heart, Search as SearchIcon, CalendarClock, Check, Eye, Ghost, ChevronDown
} from "../icons";
import { useStore } from "../store";
import { api } from "../backend";
import { socketClient } from "../backend/socket";
import { getWallpaperStyle } from "../wallpapers";
import { StickerPicker, GIFPicker, SchedulePicker } from "./MoreScreens";
import { ReactionPickerModal, TranslateModal, ReadAloud, StickerMaker } from "./AdvancedScreens";
import { MentionPicker, LiveLocation, DocumentScanner, PhotoDoodle, VoiceTranscript } from "./ExtraFunctions";
import { FormattingBar, ReactionDetails, GroupDescriptionPopup } from "./MoreFunctions";
import { VoicePreview, ViewOnceViewer } from "./RealWhatsAppScreens";
import { ReactionAnimation } from "./MoreFeatures";
import { formatText, extractFirstUrl } from "../utils/format";


const reactionEmojis = ["❤️","😂","😮","😢","🙏","👍"];

export function ChatView({
  chat,
  onBack,
  onOpenProfile,
  onCall,
  onForward,
  onOpenMedia,
  onMessageInfo,
  onSearch,
  jumpToMsgId,
  onPinnedList,
  onVanishMode,
  onAudioRoom,
  onAddToHome,
}: {
  chat: Chat;
  onBack: () => void;
  onOpenProfile: () => void;
  onCall: (type: "voice" | "video") => void;
  onForward: (msg: Message) => void;
  onOpenMedia: (msgId: string) => void;
  onMessageInfo: (msgId: string) => void;
  onSearch: () => void;
  jumpToMsgId?: string;
  onPinnedList?: () => void;
  onVanishMode?: () => void;
  onAudioRoom?: () => void;
  onAddToHome?: () => void;
}) {
  const { state, dispatch } = useStore();
  const draft = state.drafts[chat.id] || "";
  const [input, setInput] = useState(draft);
  const [showAttach, setShowAttach] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showGifs, setShowGifs] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<string | null>(null);
  const [multiSelect, setMultiSelect] = useState<Set<string>>(new Set());
  const [reactingMsg, setReactingMsg] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [highlightMsgId, setHighlightMsgId] = useState<string | null>(jumpToMsgId || null);
  const [showFullReactPicker, setShowFullReactPicker] = useState<string | null>(null);
  const [translateText, setTranslateText] = useState<string | null>(null);
  const [readAloudText, setReadAloudText] = useState<string | null>(null);
  const [showStickerMaker, setShowStickerMaker] = useState(false);
  const [showLiveLocation, setShowLiveLocation] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showDoodle, setShowDoodle] = useState(false);
  const [transcribeMsg, setTranscribeMsg] = useState<{ id: string; duration?: string } | null>(null);
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [showFormatting, setShowFormatting] = useState(false);
  const [reactionDetails, setReactionDetails] = useState<{ emoji: string; by: string }[] | null>(null);
  const [showGroupDesc, setShowGroupDesc] = useState(false);
  const [voicePreview, setVoicePreview] = useState(false);
  const [viewOnceMsg, setViewOnceMsg] = useState<{ id: string; text?: string; type?: string } | null>(null);
  const [showJumpDown, setShowJumpDown] = useState(false);
  const [reactionAnim, setReactionAnim] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Handle real media files: read as data URL & send as image
  const handleMediaFile = (file: File) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const isVideo = file.type.startsWith("video/");
      send("", isVideo ? "video" : "image", { media: dataUrl });
    };
    reader.readAsDataURL(file);
  };
  const initialUnreadRef = useRef<number>(chat.unread);

  const isVanishMode = state.vanishModeChats.includes(chat.id);

  // Typing indicator comes ONLY from real socket "typing" events (wired in App.tsx).

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowJumpDown(distFromBottom > 200);
  };

  const jumpToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const applyFormat = (style: "bold" | "italic" | "strike" | "code" | "monospace") => {
    const ta = inputRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = input.slice(start, end) || "text";
    const wrap = style === "bold" ? "*" : style === "italic" ? "_" : style === "strike" ? "~" : style === "code" ? "`" : "```";
    const newText = input.slice(0, start) + wrap + selected + wrap + input.slice(end);
    setInput(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + wrap.length, start + wrap.length + selected.length);
    }, 10);
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const longPressRef = useRef<any>(null);
  const recordTimerRef = useRef<any>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const messages = chat.messages;
  const blocked = state.settings.blockedContacts.includes(chat.id);
  const pinnedMsgs = messages.filter((m) => m.pinned);

  useEffect(() => {
    if (jumpToMsgId && messageRefs.current[jumpToMsgId]) {
      messageRefs.current[jumpToMsgId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightMsgId(jumpToMsgId);
      setTimeout(() => setHighlightMsgId(null), 2000);
    } else {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [messages.length, replyTo, jumpToMsgId]);

  useEffect(() => {
    if (chat.unread > 0) {
      dispatch({ type: "MARK_READ", chatId: chat.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id]);

  // Save draft on input change
  useEffect(() => {
    const t = setTimeout(() => {
      if (input.trim()) {
        dispatch({ type: "SET_DRAFT", chatId: chat.id, text: input });
      } else if (draft) {
        dispatch({ type: "CLEAR_DRAFT", chatId: chat.id });
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, chat.id]);

  const send = (overrideText?: string, type?: Message["type"], extra?: Partial<Message>) => {
    const text = overrideText ?? input.trim();
    if (!text && !type && !extra?.poll) return;
    if (blocked) {
      alert("You can't send messages to a blocked contact. Unblock them first.");
      return;
    }
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = {
      id: "m" + Date.now() + Math.random(),
      text,
      time,
      sent: true,
      status: "sent",
      type: type ?? "text",
      reply: replyTo ? { name: replyTo.sent ? "You" : chat.name, text: replyTo.text || `[${replyTo.type}]` } : undefined,
      ...extra,
    };
    // Optimistic UI update
    dispatch({ type: "SEND_MESSAGE", chatId: chat.id, message: newMsg });
    dispatch({ type: "CLEAR_DRAFT", chatId: chat.id });
    setInput("");
    setReplyTo(null);
    // Real delivery: persist to DB + relay through the Socket.IO server.
    // No fake ticks, no auto-replies — statuses come back via socket acks.
    api.messages
      .sendMessage(chat.id, "me", undefined, { text, type: type || "text" })
      .then((rec) => {
        if (rec.status === "sent") {
          dispatch({ type: "UPDATE_MESSAGE_STATUS", chatId: chat.id, messageId: rec.id, status: "sent" });
        }
      })
      .catch(() => {
        // stays queued; outbox monitor retries when connectivity returns
        dispatch({ type: "UPDATE_MESSAGE_STATUS", chatId: chat.id, messageId: newMsg.id, status: "sent" });
      });
  };

  const schedule = (timestamp: number) => {
    if (!input.trim()) return;
    dispatch({
      type: "SCHEDULE_MESSAGE",
      msg: { id: "sch" + Date.now(), chatId: chat.id, text: input.trim(), scheduledFor: timestamp },
    });
    dispatch({ type: "CLEAR_DRAFT", chatId: chat.id });
    setInput("");
    setShowSchedule(false);
  };

  const toggleMultiSelect = (id: string) => {
    setMultiSelect((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (next.size === 0) return new Set();
      return next;
    });
  };

  const handleEmoji = (e: string) => {
    setInput((v) => v + e);
    dispatch({ type: "ADD_RECENT_EMOJI", emoji: e });
  };

  // Quick reply expansion: type "/shortcut " → expand
  useEffect(() => {
    if (!input.endsWith(" ")) return;
    const trimmed = input.trim();
    const reply = state.quickReplies.find((q) => q.shortcut === trimmed);
    if (reply) setInput(reply.text + " ");
  }, [input, state.quickReplies]);

  // Mention detection (group chats): "@search"
  useEffect(() => {
    if (!chat.isGroup) return;
    const match = input.match(/@(\w*)$/);
    if (match) setMentionSearch(match[1]);
    else setMentionSearch(null);
  }, [input, chat.isGroup]);

  // Periodically purge expired disappearing messages
  useEffect(() => {
    const id = setInterval(() => {
      if (Object.keys(state.disappearTimers).length > 0) {
        dispatch({ type: "PURGE_EXPIRED" });
      }
    }, 30000);
    return () => clearInterval(id);
  }, [dispatch, state.disappearTimers]);

  const startLongPress = (msgId: string) => {
    longPressRef.current = setTimeout(() => setSelectedMsg(msgId), 500);
  };
  const cancelLongPress = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const stopRecording = (cancel?: boolean) => {
    setRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (!cancel && recordTime > 0) {
      const dur = `${Math.floor(recordTime / 60)}:${String(recordTime % 60).padStart(2, "0")}`;
      send("", "voice", { duration: dur });
    }
    setRecordTime(0);
  };

  const selectedMessage = messages.find((m) => m.id === selectedMsg);
  const isStarred = (msgId: string) => state.starred.includes(`${chat.id}:${msgId}`);

  const chatWallpaper = state.chatThemes[chat.id] || state.settings.wallpaper;
  const wallpaperStyle = getWallpaperStyle(chatWallpaper as any);

  const startEdit = (m: Message) => {
    setEditingMsg(m.id);
    setEditText(m.text);
    setSelectedMsg(null);
  };

  return (
    <div className="flex flex-col h-full" style={wallpaperStyle}>
      {/* Header */}
      <header className="flex items-center gap-2 px-2 py-2 bg-[#202c33] text-white relative">
        {selectedMsg ? (
          <>
            <button onClick={() => setSelectedMsg(null)} className="p-2 rounded-full hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1 font-medium">1 selected</div>
            {selectedMessage && (
              <>
                <button
                  onClick={() => { setReplyTo(selectedMessage); setSelectedMsg(null); }}
                  className="p-2 rounded-full hover:bg-white/10" title="Reply"
                ><Reply className="w-5 h-5" /></button>
                <button
                  onClick={() => { dispatch({ type: "PIN_MESSAGE", chatId: chat.id, messageId: selectedMessage.id }); setSelectedMsg(null); }}
                  className="p-2 rounded-full hover:bg-white/10" title="Pin"
                ><Pin className="w-5 h-5" /></button>
                <button
                  onClick={() => { dispatch({ type: "STAR_MESSAGE", chatId: chat.id, messageId: selectedMessage.id }); setSelectedMsg(null); }}
                  className="p-2 rounded-full hover:bg-white/10" title="Star"
                >
                  {isStarred(selectedMessage.id) ? <StarFilled className="w-5 h-5 text-yellow-400" /> : <Star className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setShowFullReactPicker(selectedMessage.id); setSelectedMsg(null); }}
                  className="p-2 rounded-full hover:bg-white/10" title="React"
                ><Heart className="w-5 h-5" /></button>
                {selectedMessage.text && (
                  <>
                    <button
                      onClick={() => { setTranslateText(selectedMessage.text); setSelectedMsg(null); }}
                      className="p-2 rounded-full hover:bg-white/10" title="Translate"
                    ><span className="text-sm font-bold">文</span></button>
                    <button
                      onClick={() => { setReadAloudText(selectedMessage.text); setSelectedMsg(null); }}
                      className="p-2 rounded-full hover:bg-white/10" title="Read aloud"
                    ><span className="text-sm">🔊</span></button>
                  </>
                )}
                <button
                  onClick={() => { onForward(selectedMessage); setSelectedMsg(null); }}
                  className="p-2 rounded-full hover:bg-white/10" title="Forward"
                ><Forward className="w-5 h-5" /></button>
                {selectedMessage.text && selectedMessage.sent && (
                  <button onClick={() => startEdit(selectedMessage)} className="p-2 rounded-full hover:bg-white/10" title="Edit">
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
                {selectedMessage.text && (
                  <button
                    onClick={() => { navigator.clipboard?.writeText(selectedMessage.text); setSelectedMsg(null); }}
                    className="p-2 rounded-full hover:bg-white/10" title="Copy"
                  ><Copy className="w-5 h-5" /></button>
                )}
                {selectedMessage.sent && (
                  <button
                    onClick={() => { onMessageInfo(selectedMessage.id); setSelectedMsg(null); }}
                    className="p-2 rounded-full hover:bg-white/10" title="Info"
                  ><Info className="w-5 h-5" /></button>
                )}
                <button
                  onClick={() => {
                    setMultiSelect(new Set([selectedMessage.id]));
                    setSelectedMsg(null);
                  }}
                  className="p-2 rounded-full hover:bg-white/10" title="Multi-select"
                  ><Check className="w-5 h-5" /></button>
                <button
                  onClick={() => {
                    if (confirm("Delete this message?")) {
                      dispatch({ type: "DELETE_MESSAGE", chatId: chat.id, messageId: selectedMessage.id });
                      setSelectedMsg(null);
                    }
                  }}
                  className="p-2 rounded-full hover:bg-white/10" title="Delete"
                ><Trash className="w-5 h-5" /></button>
              </>
            )}
          </>
        ) : (
          <>
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={onOpenProfile} className="flex items-center gap-3 flex-1 min-w-0 text-left">
              <Avatar color={chat.avatarColor} text={chat.avatarText} size="sm" online={chat.online} />
              <div className="min-w-0">
                <div className="font-medium truncate">{chat.name}</div>
                <div className="text-xs text-[#aebac1] truncate">
                  {blocked ? <span className="text-red-400">Blocked</span> :
                    chat.typing ? <span className="text-emerald-400">typing…</span> :
                    chat.online ? "online" :
                    chat.isGroup ? chat.members?.join(", ") : "last seen recently"}
                </div>
              </div>
            </button>
            <button onClick={() => onCall("video")} className="p-2 rounded-full hover:bg-white/10">
              <Video className="w-5 h-5" />
            </button>
            <button onClick={() => onCall("voice")} className="p-2 rounded-full hover:bg-white/10">
              <Phone className="w-5 h-5" />
            </button>
            <button onClick={() => setShowHeaderMenu((v) => !v)} className="p-2 rounded-full hover:bg-white/10">
              <More className="w-5 h-5" />
            </button>
            {showHeaderMenu && (
              <div className="absolute right-2 top-12 bg-[#233138] rounded-md shadow-lg py-2 w-52 z-50">
                {[
                  { label: chat.isGroup ? "Group info" : "View contact", action: onOpenProfile },
                  ...(chat.isGroup ? [{ label: "Group description", action: () => setShowGroupDesc(true) }] : []),
                  { label: "Search", action: onSearch },
                  { label: `Pinned messages (${pinnedMsgs.length})`, action: onPinnedList ?? (() => {}) },
                  { label: isVanishMode ? "Turn off vanish mode" : "Vanish mode", action: onVanishMode ?? (() => dispatch({ type: "TOGGLE_VANISH_MODE", chatId: chat.id })) },
                  { label: "Add to home screen", action: onAddToHome ?? (() => {}) },
                  ...(chat.isGroup ? [{ label: "Audio room", action: onAudioRoom ?? (() => {}) }] : []),
                  { label: chat.muted ? "Unmute notifications" : "Mute notifications", action: () => dispatch({ type: "MUTE_CHAT", chatId: chat.id }) },
                  { label: chat.pinned ? "Unpin chat" : "Pin chat", action: () => dispatch({ type: "PIN_CHAT_LIMITED", chatId: chat.id }) },
                  { label: blocked ? "Unblock" : "Block", action: () => blocked ? dispatch({ type: "UNBLOCK_CONTACT", chatId: chat.id }) : (confirm(`Block ${chat.name}?`) && dispatch({ type: "BLOCK_CONTACT", chatId: chat.id })) },
                  { label: "Select messages", action: () => { if (chat.messages.length > 0) setMultiSelect(new Set([chat.messages[chat.messages.length - 1].id])); } },
                  { label: "Clear messages", action: () => { if (confirm("Clear all messages?")) chat.messages.forEach((m) => dispatch({ type: "DELETE_MESSAGE", chatId: chat.id, messageId: m.id })); } },
                ].map((it) => (
                  <button
                    key={it.label}
                    onClick={() => { it.action(); setShowHeaderMenu(false); }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-white/10 text-white"
                  >
                    {it.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </header>

      {/* Multi-select bar */}
      {multiSelect.size > 0 && (
        <div className="bg-[#202c33] flex items-center gap-2 px-2 py-2 text-white border-b border-[#222d34]">
          <button onClick={() => setMultiSelect(new Set())} className="p-2 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 font-medium">{multiSelect.size} selected</div>
          <button
            onClick={() => {
              const ids = Array.from(multiSelect);
              ids.forEach((id) => dispatch({ type: "STAR_MESSAGE", chatId: chat.id, messageId: id }));
              setMultiSelect(new Set());
            }}
            className="p-2"
          ><Star className="w-5 h-5" /></button>
          <button
            onClick={() => {
              const ids = Array.from(multiSelect);
              const text = ids
                .map((id) => chat.messages.find((m) => m.id === id))
                .filter(Boolean)
                .map((m) => `[${m!.time}] ${m!.sent ? "You" : chat.name}: ${m!.text}`)
                .join("\n");
              navigator.clipboard?.writeText(text);
              setMultiSelect(new Set());
            }}
            className="p-2"
          ><Copy className="w-5 h-5" /></button>
          <button
            onClick={() => {
              const first = chat.messages.find((m) => m.id === Array.from(multiSelect)[0]);
              if (first) onForward(first);
              setMultiSelect(new Set());
            }}
            className="p-2"
          ><Forward className="w-5 h-5" /></button>
          <button
            onClick={() => {
              if (confirm(`Delete ${multiSelect.size} messages?`)) {
                multiSelect.forEach((id) => dispatch({ type: "DELETE_MESSAGE", chatId: chat.id, messageId: id }));
                setMultiSelect(new Set());
              }
            }}
            className="p-2 text-red-400"
          ><Trash className="w-5 h-5" /></button>
        </div>
      )}

      {/* Vanish mode banner */}
      {isVanishMode && (
        <div className="bg-purple-500/20 border-b border-purple-500/30 px-3 py-2 flex items-center gap-2 text-xs">
          <Ghost className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="text-purple-300 flex-1">Vanish mode is on. Messages disappear after viewing.</span>
          <button
            onClick={() => dispatch({ type: "TOGGLE_VANISH_MODE", chatId: chat.id })}
            className="text-purple-400 underline"
          >
            Off
          </button>
        </div>
      )}

      {/* Pinned messages bar */}
      {pinnedMsgs.length > 0 && (
        <div className="bg-[#1f2c33] border-b border-[#222d34] px-3 py-2 flex items-center gap-2">
          <Pin className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0 text-xs">
            <div className="text-emerald-400 font-medium">Pinned message</div>
            <div className="text-[#aebac1] truncate">{pinnedMsgs[pinnedMsgs.length - 1].text || `[${pinnedMsgs[pinnedMsgs.length - 1].type}]`}</div>
          </div>
          <button
            onClick={() => dispatch({ type: "PIN_MESSAGE", chatId: chat.id, messageId: pinnedMsgs[pinnedMsgs.length - 1].id })}
            className="text-xs text-[#8696a0] p-1"
          ><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-3 py-3 space-y-1 relative">
        <div className="text-center my-2">
          <span className="bg-[#182229] text-[#8696a0] text-xs px-3 py-1 rounded-md">
            🔒 Messages and calls are end-to-end encrypted
          </span>
        </div>
        <div className="text-center my-2">
          <span className="bg-[#182229] text-[#aebac1] text-xs px-3 py-1 rounded-md">TODAY</span>
        </div>
        {messages.map((m, i) => {
          const prevSent = i > 0 ? messages[i - 1].sent : null;
          const showTail = prevSent !== m.sent;
          // Unread divider: before first unread message from "them"
          const isFirstUnread =
            initialUnreadRef.current > 0 &&
            i === messages.length - initialUnreadRef.current &&
            !m.sent;
          const isSel = selectedMsg === m.id;
          const isMulti = multiSelect.has(m.id);
          const isHighlight = highlightMsgId === m.id;
          return (
            <Fragment key={m.id}>
              {isFirstUnread && (
                <div className="text-center my-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-md inline-block">
                    {initialUnreadRef.current} UNREAD MESSAGE{initialUnreadRef.current > 1 ? "S" : ""}
                  </span>
                </div>
              )}
            <div
              ref={(el) => { messageRefs.current[m.id] = el; }}
              className={`flex ${m.sent ? "justify-end" : "justify-start"} ${isSel || isMulti ? "bg-emerald-500/10 -mx-3 px-3 py-1" : ""} ${isHighlight ? "bg-yellow-500/20 -mx-3 px-3 py-1 transition-colors" : ""}`}
              onClick={() => multiSelect.size > 0 && toggleMultiSelect(m.id)}
            >
              <div
                className={`relative max-w-[78%] rounded-lg shadow msg-in ${
                  m.sent
                    ? "bg-[#005c4b] text-white rounded-tr-none"
                    : "bg-[#202c33] text-white rounded-tl-none"
                } ${!showTail ? "mt-0.5" : "mt-2"} ${isMulti ? "ring-2 ring-emerald-400" : ""}`}
                onMouseDown={() => startLongPress(m.id)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onTouchStart={() => startLongPress(m.id)}
                onTouchEnd={cancelLongPress}
                onContextMenu={(e) => { e.preventDefault(); setSelectedMsg(m.id); }}
                onDoubleClick={() => setReactingMsg(m.id)}
              >
                {chat.isGroup && !m.sent && (
                  <div className="text-xs font-medium text-emerald-400 px-2 pt-1">{chat.members?.[i % (chat.members.length || 1)] || "Member"}</div>
                )}
                <div className="px-2 py-1.5">
                  {m.forwarded && (
                    <div className="text-xs text-[#8696a0] italic flex items-center gap-1 mb-1">
                      <Forward className="w-3 h-3" />
                      {(m.forwardCount || 1) > 5 ? "Forwarded many times" : "Forwarded"}
                    </div>
                  )}
                  {m.reply && (
                    <div className="bg-black/25 border-l-4 border-emerald-400 rounded p-1.5 mb-1 text-xs">
                      <div className="text-emerald-400 font-medium">{m.reply.name}</div>
                      <div className="text-white/70 truncate">{m.reply.text}</div>
                    </div>
                  )}
                  {m.type === "voice" ? (
                    <div className="flex items-center gap-1">
                      <VoicePlayer duration={m.duration} sent={m.sent} chatId={chat.id} messageId={m.id} />
                      <button
                        onClick={(e) => { e.stopPropagation(); setTranscribeMsg({ id: m.id, duration: m.duration }); }}
                        className="text-[10px] text-emerald-300 hover:text-emerald-400 px-1"
                        title="Transcribe"
                      >
                        T
                      </button>
                    </div>
                  ) : m.type === "image" ? (
                    m.viewOnce ? (
                      m.viewedOnce ? (
                        <div className="w-56 h-20 bg-zinc-900/50 rounded-md flex items-center justify-center text-xs text-[#8696a0] gap-2">
                          <Eye className="w-4 h-4" /> Opened
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setViewOnceMsg({ id: m.id, text: m.text, type: "image" });
                            if (!m.sent) dispatch({ type: "MARK_VIEWED_ONCE", chatId: chat.id, messageId: m.id });
                          }}
                          className="w-56 h-32 rounded-md flex flex-col items-center justify-center text-sm gap-2 bg-gradient-to-br from-zinc-700 to-zinc-900 border border-emerald-500/30"
                        >
                          <span className="text-2xl">1️⃣</span>
                          <span className="text-emerald-300">Tap to view once</span>
                        </button>
                      )
                    ) : m.media && m.media.startsWith("data:") ? (
                      <button onClick={() => onOpenMedia(m.id)} className="block rounded-md overflow-hidden msg-in">
                        <img
                          src={m.media}
                          alt=""
                          className="w-56 h-40 object-cover rounded-md"
                          loading="lazy"
                        />
                        {m.text && <div className="mt-1 text-sm">{m.text}</div>}
                      </button>
                    ) : (
                      <button onClick={() => onOpenMedia(m.id)} className="block">
                        <div className="w-56 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                          <Image className="w-10 h-10 text-white/80" />
                        </div>
                        {m.text && <div className="mt-1 text-sm">{m.text}</div>}
                      </button>
                    )
                  ) : m.type === "video" ? (
                    m.media && m.media.startsWith("data:") ? (
                      <div className="w-64 rounded-md overflow-hidden msg-in">
                        <video
                          src={m.media}
                          controls
                          playsInline
                          className="w-full rounded-md max-h-52 bg-black"
                          preload="metadata"
                        />
                        {m.text && <div className="mt-1 text-sm">{m.text}</div>}
                      </div>
                    ) : (
                      <button onClick={() => onOpenMedia(m.id)} className="block">
                        <div className="w-56 h-40 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-md flex items-center justify-center">
                          <Video className="w-10 h-10 text-white/80" />
                        </div>
                        {m.text && <div className="mt-1 text-sm">{m.text}</div>}
                      </button>
                    )
                  ) : m.type === "doc" ? (
                    <button onClick={() => onOpenMedia(m.id)} className="flex items-center gap-2 bg-black/20 rounded p-2 min-w-[200px]">
                      <FileText className="w-8 h-8 text-emerald-400" />
                      <div className="text-sm text-left">
                        <div>{m.media}</div>
                        <div className="text-xs text-[#8696a0]">2 pages · PDF</div>
                      </div>
                    </button>
                  ) : m.type === "poll" && m.poll ? (
                    <PollMessage poll={m.poll} chatId={chat.id} messageId={m.id} isMine={m.sent} />
                  ) : m.type === "location" && m.location ? (
                    <div className="min-w-[200px]">
                      <div className="w-full h-28 bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-md flex items-center justify-center mb-1">
                        <MapPin className="w-8 h-8 text-emerald-300" />
                      </div>
                      <div className="text-sm">{m.location.name}</div>
                    </div>
                  ) : m.type === "contact" && m.contact ? (
                    <div className="flex items-center gap-2 bg-black/20 rounded p-2 min-w-[200px]">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/30 flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="text-sm">
                        <div>{m.contact.name}</div>
                        <div className="text-xs text-[#8696a0]">{m.contact.phone}</div>
                      </div>
                    </div>
                  ) : m.type === "sticker" ? (
                    <div className="text-7xl py-1">{m.text}</div>
                  ) : (
                    editingMsg === m.id ? (
                      <div className="min-w-[200px]">
                        <input
                          autoFocus
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="bg-black/30 rounded px-2 py-1 text-sm w-full outline-none"
                        />
                        <div className="flex gap-2 mt-1 text-xs">
                          <button
                            onClick={() => { setEditingMsg(null); setEditText(""); }}
                            className="px-2 py-0.5 rounded bg-white/10"
                          >Cancel</button>
                          <button
                            onClick={() => {
                              if (editText.trim()) {
                                dispatch({ type: "EDIT_MESSAGE", chatId: chat.id, messageId: m.id, text: editText.trim() });
                              }
                              setEditingMsg(null);
                              setEditText("");
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-500 text-[#111b21]"
                          >Save</button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm whitespace-pre-wrap break-words pr-14">
                        {formatText(m.text)}
                        {(() => {
                          const url = extractFirstUrl(m.text);
                          if (!url) return null;
                          return (
                            <div className="mt-1 bg-black/30 rounded p-2 border-l-2 border-emerald-400">
                              <div className="flex items-center gap-1 text-[10px] text-emerald-300">
                                <span>🔗</span> Link preview
                              </div>
                              <div className="text-xs text-white/90 truncate mt-0.5">{url}</div>
                            </div>
                          );
                        })()}
                      </span>
                    )
                  )}
                  <span className="absolute bottom-1 right-2 text-[10px] text-[#8696a0] flex items-center gap-1">
                    {m.edited && <span className="italic">edited</span>}
                    {m.pinned && <Pin className="w-2.5 h-2.5" />}
                    {isStarred(m.id) && <StarFilled className="w-2.5 h-2.5 text-yellow-400" />}
                    {m.time}
                    {m.sent && <Ticks status={m.status} />}
                  </span>
                </div>
                {m.reactions && m.reactions.length > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setReactionDetails(m.reactions!); }}
                    className="absolute -bottom-2 left-2 bg-[#1f2c33] rounded-full px-1.5 py-0.5 text-xs flex items-center gap-0.5 border border-[#0b141a] shadow hover:bg-[#2a3942]"
                  >
                    {[...new Set(m.reactions.map((r) => r.emoji))].map((e) => (
                      <span key={e}>{e}</span>
                    ))}
                    {m.reactions.length > 1 && <span className="text-[#8696a0] ml-0.5">{m.reactions.length}</span>}
                  </button>
                )}
                {/* Quick react button */}
                <button
                  onClick={() => setReactingMsg(reactingMsg === m.id ? null : m.id)}
                  className={`absolute ${m.sent ? "-left-8" : "-right-8"} top-1/2 -translate-y-1/2 opacity-0 hover:opacity-100 group-hover:opacity-100 p-1 rounded-full bg-[#202c33]`}
                >
                  <Heart className="w-3.5 h-3.5 text-[#8696a0]" />
                </button>
                {reactingMsg === m.id && (
                  <div className={`absolute -top-10 ${m.sent ? "right-0" : "left-0"} bg-[#233138] rounded-full px-2 py-1.5 flex items-center gap-1 shadow-lg z-10`}>
                    {reactionEmojis.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          dispatch({ type: "REACT_MESSAGE", chatId: chat.id, messageId: m.id, emoji: e, by: state.profile.name });
                          setReactionAnim(e);
                          setReactingMsg(null);
                        }}
                        className="text-lg hover:scale-125 transition"
                      >{e}</button>
                    ))}
                    <button onClick={() => setReactingMsg(null)} className="text-[#8696a0] ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            </Fragment>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center mt-12">
            <div className="bg-[#182229] inline-block text-[#8696a0] text-sm px-4 py-3 rounded-lg max-w-xs">
              <Info className="w-5 h-5 mx-auto mb-2 text-emerald-400" />
              No messages yet. Send the first one!
            </div>
          </div>
        )}
        {chat.typing && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] rounded-lg rounded-tl-none px-3 py-2.5 mt-1 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
      </div>

      {/* Jump to bottom button */}
      {showJumpDown && (
        <button
          onClick={jumpToBottom}
          className="absolute bottom-24 right-4 z-30 bg-[#202c33] hover:bg-[#2a3942] text-white rounded-full w-10 h-10 shadow-lg flex items-center justify-center border border-[#222d34]"
          aria-label="Jump to bottom"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Reply preview */}
      {replyTo && (
        <div className="bg-[#1f2c33] border-l-4 border-emerald-400 px-3 py-2 mx-2 rounded-t-md flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-emerald-400 text-xs font-medium">{replyTo.sent ? "You" : chat.name}</div>
            <div className="text-sm text-[#aebac1] truncate">{replyTo.text || `[${replyTo.type}]`}</div>
          </div>
          <button onClick={() => setReplyTo(null)}><X className="w-4 h-4 text-[#8696a0]" /></button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <EmojiPanel
          recent={state.recentEmojis}
          onPick={handleEmoji}
          onClose={() => setShowEmoji(false)}
        />
      )}

      {/* Sticker picker */}
      {showStickers && (
        <StickerPicker
          onPick={(s) => { send(s, "sticker"); setShowStickers(false); }}
          onClose={() => setShowStickers(false)}
        />
      )}

      {/* GIF picker */}
      {showGifs && (
        <GIFPicker
          onPick={(g) => { send(g.alt, "image", { media: g.url }); setShowGifs(false); }}
          onClose={() => setShowGifs(false)}
        />
      )}

      {/* Schedule */}
      {showSchedule && (
        <SchedulePicker
          onCancel={() => setShowSchedule(false)}
          onSchedule={(ts) => schedule(ts)}
        />
      )}

      {/* Hidden file inputs for real media */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleMediaFile(file);
          e.target.value = "";
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach((f) => handleMediaFile(f));
          e.target.value = "";
        }}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            send(file.name, "doc", { media: file.name });
          }
          e.target.value = "";
        }}
      />

      {/* Attach menu */}
      {showAttach && (
        <div className="bg-[#233138] mx-3 mb-1 rounded-2xl p-4 grid grid-cols-4 gap-3 text-white text-xs animate-slide-up">
          {[
            { icon: FileText, label: "Document", color: "bg-violet-500", action: () => docInputRef.current?.click(), nodefer: true },
            { icon: Camera, label: "Camera", color: "bg-pink-500", action: () => fileInputRef.current?.click(), nodefer: true },
            { icon: Image, label: "Gallery", color: "bg-purple-500", action: () => galleryInputRef.current?.click(), nodefer: true },
            { icon: Mic, label: "Audio", color: "bg-orange-500", action: () => send("", "voice", { duration: "0:08" }) },
            { icon: MapPin, label: "Location", color: "bg-emerald-500", action: () => send("", "location", { location: { name: "Current location", lat: 37.77, lng: -122.41 } }) },
            { icon: MapPin, label: "Live loc.", color: "bg-emerald-600", action: () => setShowLiveLocation(true), nodefer: true },
            { icon: FileText, label: "Scan", color: "bg-amber-500", action: () => setShowScanner(true), nodefer: true },
            { icon: Image, label: "Doodle", color: "bg-fuchsia-600", action: () => setShowDoodle(true), nodefer: true },
            { icon: Image, label: "View once", color: "bg-zinc-600", action: () => send("", "image", { viewOnce: true }) },
            { icon: User, label: "Contact", color: "bg-blue-500", action: () => send("", "contact", { contact: { name: chat.name, phone: chat.phone || "Unknown" } }) },
            { icon: Sticker, label: "Sticker", color: "bg-cyan-500", action: () => setShowStickers(true), nodefer: true },
            { icon: Sticker, label: "Make sticker", color: "bg-rose-500", action: () => setShowStickerMaker(true), nodefer: true },
            { icon: Image, label: "GIF", color: "bg-fuchsia-500", action: () => setShowGifs(true), nodefer: true },
            { icon: SearchIcon, label: "Poll", color: "bg-yellow-500", action: () => setShowPollCreator(true) },
            { icon: CalendarClock, label: "Schedule", color: "bg-blue-600", action: () => { if (input.trim()) setShowSchedule(true); else alert("Type a message first"); }, nodefer: true },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => { a.action(); setShowAttach(false); }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className={`w-12 h-12 rounded-full ${a.color} flex items-center justify-center`}>
                <a.icon className="w-6 h-6 text-white" />
              </div>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      )}

      {showPollCreator && (
        <PollCreator
          onCancel={() => setShowPollCreator(false)}
          onCreate={(question, options, multiple) => {
            send("", "poll", {
              poll: {
                question,
                multiple,
                options: options.map((t, i) => ({ id: "o" + i, text: t, votes: [] })),
              },
            });
            setShowPollCreator(false);
          }}
        />
      )}

      {/* Recording UI (legacy quick-record) */}
      {recording && (
        <div className="bg-[#202c33] px-3 py-2 mx-2 mb-1 rounded-lg flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-white">
            {Math.floor(recordTime / 60)}:{String(recordTime % 60).padStart(2, "0")}
          </span>
          <span className="flex-1 text-sm text-[#8696a0]">Recording…</span>
          <button onClick={() => stopRecording(true)} className="text-red-400 text-sm">Cancel</button>
          <button onClick={() => stopRecording(false)} className="text-emerald-400 text-sm">Send</button>
        </div>
      )}

      {/* Voice preview (new flow) */}
      {voicePreview && (
        <VoicePreview
          onCancel={() => setVoicePreview(false)}
          onSend={(dur) => {
            send("", "voice", { duration: dur });
            setVoicePreview(false);
          }}
        />
      )}

      {/* Input */}
      {!recording && !blocked && (
        <>
          {showFormatting && <FormattingBar onApply={applyFormat} />}
          <div className="flex items-end gap-1.5 px-2 py-2 bg-[#0b141a]">
            {/* Text input pill */}
            <div className="flex-1 min-w-0 bg-[#202c33] rounded-3xl flex items-end px-1 gap-0.5">
              <button
                onClick={() => { setShowEmoji((v) => !v); setShowAttach(false); }}
                className="p-2 text-[#8696a0] shrink-0"
                aria-label="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Real typing event over the socket (server relays to the room)
                  if (e.target.value && !input) {
                    socketClient.sendTyping(chat.id, "start");
                  }
                  if (!e.target.value && input) {
                    socketClient.sendTyping(chat.id, "stop");
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && state.settings.enterToSend) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Message"
                className="flex-1 min-w-0 bg-transparent outline-none text-white text-sm resize-none py-2.5 max-h-28 leading-snug"
              />
              {!input && (
                <button
                  onClick={() => setShowFormatting((v) => !v)}
                  className={`p-2 ${showFormatting ? "text-emerald-400" : "text-[#8696a0]"} text-xs font-bold shrink-0`}
                  title="Formatting"
                >
                  Aa
                </button>
              )}
              <button
                onClick={() => { setShowAttach((v) => !v); setShowEmoji(false); }}
                className="p-2 text-[#8696a0] shrink-0"
                aria-label="Attach"
              >
                <Paperclip className="w-5 h-5 rotate-45" />
              </button>
              {!input && (
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-[#8696a0] shrink-0" aria-label="Camera">
                  <Camera className="w-5 h-5" />
                </button>
              )}
            </div>
            {/* Send / Mic button — always visible, larger and prominent */}
            <button
              onClick={() => input ? send() : setVoicePreview(true)}
              className="bg-[#25D366] hover:bg-[#2BE37F] active:bg-[#0BA95B] text-[#0b141a] rounded-full w-12 h-12 flex items-center justify-center shrink-0 shadow-[0_4px_16px_rgba(37,211,102,0.4)] transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label={input ? "Send" : "Record voice"}
            >
              {input ? <Send className="w-5 h-5 ml-0.5" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        </>
      )}

      {blocked && (
        <div className="bg-[#202c33] py-3 text-center text-sm text-[#8696a0]">
          You blocked this contact.{" "}
          <button
            onClick={() => dispatch({ type: "UNBLOCK_CONTACT", chatId: chat.id })}
            className="text-emerald-400 font-medium"
          >
            Tap to unblock
          </button>
        </div>
      )}

      {showFullReactPicker && (
        <ReactionPickerModal
          onPick={(emoji) => {
            dispatch({
              type: "REACT_MESSAGE",
              chatId: chat.id,
              messageId: showFullReactPicker,
              emoji,
              by: state.profile.name,
            });
            setReactionAnim(emoji);
          }}
          onClose={() => setShowFullReactPicker(null)}
        />
      )}

      {reactionAnim && (
        <ReactionAnimation emoji={reactionAnim} onDone={() => setReactionAnim(null)} />
      )}

      {translateText && (
        <TranslateModal text={translateText} onClose={() => setTranslateText(null)} />
      )}

      {readAloudText && (
        <ReadAloud text={readAloudText} onClose={() => setReadAloudText(null)} />
      )}

      {showStickerMaker && (
        <StickerMaker
          onBack={() => setShowStickerMaker(false)}
          onCreate={(s) => {
            send(s.emoji ? s.emoji + " " + s.text : s.text, "sticker");
            setShowStickerMaker(false);
          }}
        />
      )}

      {showLiveLocation && (
        <div className="absolute inset-0 z-50 bg-[#111b21]">
          <LiveLocation
            onBack={() => setShowLiveLocation(false)}
            onShare={(mins) => {
              send(`📍 Live location · ${mins < 60 ? mins + " min" : (mins / 60) + " hour"}`, "location", {
                location: { name: `Live for ${mins} min`, lat: 37.77, lng: -122.41 },
              });
              setShowLiveLocation(false);
            }}
          />
        </div>
      )}

      {showScanner && (
        <DocumentScanner
          onBack={() => setShowScanner(false)}
          onSend={(name) => {
            send(name, "doc", { media: name });
            setShowScanner(false);
          }}
        />
      )}

      {showDoodle && (
        <PhotoDoodle
          onBack={() => setShowDoodle(false)}
          onSend={(caption) => {
            send(caption, "image");
            setShowDoodle(false);
          }}
        />
      )}

      {transcribeMsg && (
        <VoiceTranscript
          duration={transcribeMsg.duration}
          onClose={() => setTranscribeMsg(null)}
        />
      )}

      {mentionSearch !== null && chat.isGroup && chat.members && (
        <MentionPicker
          members={chat.members.filter((m) => m !== "You")}
          search={mentionSearch}
          onPick={(m) => setInput((v) => v.replace(/@\w*$/, "@" + m + " "))}
          onClose={() => setMentionSearch(null)}
        />
      )}

      {reactionDetails && (
        <ReactionDetails
          reactions={reactionDetails}
          onClose={() => setReactionDetails(null)}
        />
      )}

      {showGroupDesc && chat.isGroup && (
        <GroupDescriptionPopup
          name={chat.name}
          about={chat.about || ""}
          members={chat.members}
          onClose={() => setShowGroupDesc(false)}
        />
      )}

      {viewOnceMsg && (
        <ViewOnceViewer
          text={viewOnceMsg.text}
          type={viewOnceMsg.type}
          onClose={() => setViewOnceMsg(null)}
        />
      )}
    </div>
  );
}

function EmojiPanel({
  recent,
  onPick,
  onClose,
}: {
  recent: string[];
  onPick: (e: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const groups: Record<string, string[]> = {
    "Smileys": ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔"],
    "People": ["👍","👎","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👋","🤚","🖐️","✋","🖖","👏","🙌","🤝","🙏","💪","🦾","🦵","🦿","🦶","👂","🦻"],
    "Animals": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐞","🦋","🐌","🐢","🐍"],
    "Food": ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🍞","🥐","🍕","🍔","🍟"],
    "Travel": ["✈️","🚀","🛸","🛶","⛵","🚤","🛥️","🛳️","⛴️","🚢","🚁","🛩️","🛫","🛬","🪂","💺","🚂","🚃","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚝","🚞","🚋","🚌","🚍","🚎","🚐"],
    "Symbols": ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","✨","🔥","💯","🎉","🎊","⭐","🌟","💫","💥","💢"],
  };

  const aliases: Record<string, string[]> = {
    "love": ["❤️","💕","💖","💘","💝","🥰","😍","💞"],
    "happy": ["😀","😃","😄","😁","😊","😇","🙂","🥳"],
    "sad": ["😢","😭","😞","😟","😔","😣","😖","🥺"],
    "fire": ["🔥","💥","⚡","💢"],
    "thumb": ["👍","👎","👌","🤝"],
    "heart": ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💔"],
    "food": groups.Food,
    "animal": groups.Animals,
    "smile": ["😀","😃","😄","😁","😆","😅","🙂","☺️"],
  };

  const all = Object.values(groups).flat();
  const matchedAlias = Object.keys(aliases).find((k) => k.includes(search.toLowerCase()));
  const filtered = search.trim()
    ? matchedAlias
      ? aliases[matchedAlias]
      : all.filter((e) => e.includes(search))
    : null;

  return (
    <div className="bg-[#202c33] p-3 border-t border-[#222d34] max-h-72 overflow-y-auto">
      <div className="flex justify-between items-center mb-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji (love, fire, sad…)"
          className="flex-1 bg-[#111b21] rounded-full px-3 py-1.5 text-sm outline-none placeholder:text-[#8696a0]"
        />
        <button onClick={onClose} className="ml-2"><X className="w-4 h-4 text-[#8696a0]" /></button>
      </div>
      {filtered ? (
        <div className="grid grid-cols-8 gap-1 text-2xl">
          {filtered.map((e, i) => (
            <button key={e + i} onClick={() => onPick(e)} className="hover:bg-white/10 rounded p-1">{e}</button>
          ))}
        </div>
      ) : (
        <>
          {recent.length > 0 && (
            <>
              <div className="text-[10px] uppercase text-[#8696a0] mb-1">Recently used</div>
              <div className="grid grid-cols-8 gap-1 text-2xl mb-2">
                {recent.slice(0, 8).map((e, i) => (
                  <button key={e + i} onClick={() => onPick(e)} className="hover:bg-white/10 rounded p-1">{e}</button>
                ))}
              </div>
            </>
          )}
          {Object.entries(groups).map(([name, list]) => (
            <div key={name} className="mb-2">
              <div className="text-[10px] uppercase text-[#8696a0] mb-1">{name}</div>
              <div className="grid grid-cols-8 gap-1 text-2xl">
                {list.map((e, i) => (
                  <button key={e + i} onClick={() => onPick(e)} className="hover:bg-white/10 rounded p-1">{e}</button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function PollCreator({
  onCancel,
  onCreate,
}: {
  onCancel: () => void;
  onCreate: (question: string, options: string[], multiple: boolean) => void;
}) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [multiple, setMultiple] = useState(false);

  return (
    <div className="absolute inset-0 bg-[#111b21] z-50 flex flex-col text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
        <h1 className="text-lg font-medium flex-1">Create poll</h1>
        <button
          onClick={() => {
            const valid = options.filter((o) => o.trim());
            if (question.trim() && valid.length >= 2) onCreate(question.trim(), valid, multiple);
          }}
          disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}
          className="text-emerald-400 font-medium disabled:opacity-40 px-3"
        >
          Send
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs uppercase text-emerald-400 mb-2">Question</h3>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question"
          className="w-full bg-[#202c33] rounded-lg px-3 py-2.5 outline-none mb-6"
        />
        <h3 className="text-xs uppercase text-emerald-400 mb-2">Options</h3>
        {options.map((o, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={o}
              onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder={`Option ${i + 1}`}
              className="flex-1 bg-[#202c33] rounded-lg px-3 py-2.5 outline-none"
            />
            {options.length > 2 && (
              <button
                onClick={() => setOptions(options.filter((_, j) => j !== i))}
                className="p-2 text-[#8696a0]"
              ><X className="w-4 h-4" /></button>
            )}
          </div>
        ))}
        {options.length < 12 && (
          <button
            onClick={() => setOptions([...options, ""])}
            className="text-emerald-400 text-sm mt-2"
          >
            + Add option
          </button>
        )}

        <div className="flex items-center justify-between mt-6 p-3 bg-[#202c33] rounded-lg">
          <div>
            <div className="text-sm font-medium">Allow multiple answers</div>
            <div className="text-xs text-[#8696a0]">Voters can select more than one option</div>
          </div>
          <button
            onClick={() => setMultiple(!multiple)}
            className={`w-11 h-6 rounded-full transition-colors relative ${multiple ? "bg-emerald-500" : "bg-zinc-600"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${multiple ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
