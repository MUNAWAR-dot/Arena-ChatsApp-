import { createContext, useContext, useEffect, useReducer, type ReactNode } from "react";
import type { Chat, Message, Status, Call } from "./data";

export type Profile = {
  name: string;
  about: string;
  phone: string;
  avatarColor: string;
  avatarText: string;
  photoUrl?: string;
};

export type Wallpaper = "default" | "dark" | "teal" | "purple" | "sunset" | "plain";

export type Settings = {
  wallpaper: Wallpaper;
  notifications: boolean;
  readReceipts: boolean;
  lastSeen: boolean;
  enterToSend: boolean;
  theme: "dark" | "light";
  language: string;
  fontSize: "small" | "medium" | "large";
  appLock: boolean;
  appLockPin?: string;
  twoStepEnabled: boolean;
  twoStepPin?: string;
  blockedContacts: string[];
  disappearingDefault: "off" | "24h" | "7d" | "90d";
  autoDownloadWifi: boolean;
  autoDownloadMobile: boolean;
  notificationTone: string;
  vibrate: string;
  callRingtone: string;
  autoLock: "immediate" | "1min" | "15min" | "30min" | "1hour";
  mediaVisibility: boolean;
};

export type Toast = { id: string; chatId: string; name: string; text: string; avatarColor: string; avatarText: string };

export type ScheduledMessage = {
  id: string;
  chatId: string;
  text: string;
  scheduledFor: number; // timestamp
};

export type CustomContact = {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
  avatarText: string;
  email?: string;
  notes?: string;
};

export type ChatLabel = {
  id: string;
  name: string;
  color: string; // tailwind color class
};

export type QuickReply = {
  id: string;
  shortcut: string; // e.g. "/hi"
  text: string;
};

export type BusinessProfile = {
  enabled: boolean;
  businessName?: string;
  category?: string;
  description?: string;
  address?: string;
  hours?: string;
  website?: string;
};

export type State = {
  profile: Profile;
  chats: Chat[];
  archived: string[];
  starred: string[]; // message ids "chatId:msgId"
  statuses: Status[];
  viewedStatuses: Status[];
  myStatusItems: Status[];
  calls: Call[];
  settings: Settings;
  drafts: Record<string, string>; // chatId -> text
  scheduled: ScheduledMessage[];
  recentEmojis: string[];
  customContacts: CustomContact[];
  online: boolean; // network simulation
  labels: ChatLabel[];
  chatLabels: Record<string, string[]>; // chatId -> labelIds
  quickReplies: QuickReply[];
  business: BusinessProfile;
  lockedChats: string[]; // chatIds locked behind secret code
  lockedChatPin?: string;
  disappearTimers: Record<string, number>; // chatId -> hours (0 = off)
  catalog: { id: string; name: string; price: string; emoji: string }[];
  cart: Record<string, number>; // catalogItemId -> quantity
  favoriteStickers: string[];
  orders: Order[];
  birthdays: Record<string, string>; // contactId -> "MM-DD"
  chatThemes: Record<string, string>; // chatId -> wallpaper id
  reminders: Reminder[];
  spamReports: string[];
  outOfOffice: { enabled: boolean; message: string; until?: number };
  pinLimit: number;
  lockQuestion?: string;
  lockAnswer?: string;
  vanishModeChats: string[];
  statusPrivacy: { mode: "everyone" | "contacts" | "contacts_except" | "only_share_with"; list: string[] };
  mutedStatuses: string[]; // chatIds whose statuses are muted
  sessions: Session[];
  groupPermissions: Record<string, GroupPermissions>;
  hidesReadReceipts: boolean;
  recentSearches: string[];
  customNotifications: Record<string, { tone: string; vibration: string; popup: boolean }>;
  privacySettings: {
    lastSeen: "everyone" | "contacts" | "contacts_except" | "nobody";
    profilePhoto: "everyone" | "contacts" | "contacts_except" | "nobody";
    about: "everyone" | "contacts" | "contacts_except" | "nobody";
    groups: "everyone" | "contacts" | "contacts_except";
    callPrivacy: "everyone" | "contacts" | "nobody";
    autoDownloadPhotos: boolean;
    autoDownloadVideos: boolean;
    autoSaveToGallery: boolean;
    silenceUnknown: boolean;
  };
  channelNotifications: Record<string, boolean>;
  closedPolls: string[]; // poll msg ids
  betaProgram: boolean;
  birthdayPopupShown: string; // last date shown (YYYY-MM-DD)
  profilePhotoHistory: string[]; // up to 5 previous photo URLs
  voiceMiniPlayerMsg: { chatId: string; messageId: string; duration?: string } | null;
  appVersion: string;
  installedStickerPacks: string[];
  customRingtones: Record<string, string>; // chatId -> ringtone name
  channelPosts: Record<string, ChannelPost[]>; // channelName -> posts
};

export type ChannelPost = {
  id: string;
  text: string;
  time: string;
  views: number;
  reactions: { emoji: string; count: number }[];
  scheduledFor?: number;
};

export type Session = {
  id: string;
  device: string;
  location: string;
  loginTime: number;
  current?: boolean;
};

export type GroupPermissions = {
  whoCanSendMessages: "everyone" | "admins";
  whoCanEditInfo: "everyone" | "admins";
  whoCanAddMembers: "everyone" | "admins";
  approveNewMembers: boolean;
};

export type Order = {
  id: string;
  items: { name: string; price: string; emoji: string; qty: number }[];
  total: number;
  date: number;
  status: "placed" | "shipped" | "delivered";
};

export type Reminder = {
  id: string;
  chatId: string;
  text: string;
  date: number;
  done: boolean;
};

type Action =
  | { type: "SEND_MESSAGE"; chatId: string; message: Message }
  | { type: "UPDATE_MESSAGE_STATUS"; chatId: string; messageId: string; status: "sent" | "delivered" | "read" }
  | { type: "RECEIVE_MESSAGE"; chatId: string; message: Message }
  | { type: "DELETE_MESSAGE"; chatId: string; messageId: string }
  | { type: "STAR_MESSAGE"; chatId: string; messageId: string }
  | { type: "MARK_READ"; chatId: string }
  | { type: "PIN_CHAT"; chatId: string }
  | { type: "MUTE_CHAT"; chatId: string }
  | { type: "ARCHIVE_CHAT"; chatId: string }
  | { type: "UNARCHIVE_CHAT"; chatId: string }
  | { type: "DELETE_CHAT"; chatId: string }
  | { type: "CREATE_CHAT"; chat: Chat }
  | { type: "ADD_CALL"; call: Call }
  | { type: "ADD_STATUS"; status: Status }
  | { type: "VIEW_STATUS"; statusId: string }
  | { type: "UPDATE_PROFILE"; profile: Partial<Profile> }
  | { type: "UPDATE_SETTINGS"; settings: Partial<Settings> }
  | { type: "EDIT_MESSAGE"; chatId: string; messageId: string; text: string }
  | { type: "REACT_MESSAGE"; chatId: string; messageId: string; emoji: string; by: string }
  | { type: "PIN_MESSAGE"; chatId: string; messageId: string }
  | { type: "VOTE_POLL"; chatId: string; messageId: string; optionId: string; voter: string }
  | { type: "BLOCK_CONTACT"; chatId: string }
  | { type: "UNBLOCK_CONTACT"; chatId: string }
  | { type: "ADD_GROUP_MEMBER"; chatId: string; member: string }
  | { type: "REMOVE_GROUP_MEMBER"; chatId: string; member: string }
  | { type: "UPDATE_GROUP_INFO"; chatId: string; name?: string; about?: string }
  | { type: "UPDATE_CHAT_AVATAR"; chatId: string; color: string; text: string }
  | { type: "SET_DRAFT"; chatId: string; text: string }
  | { type: "CLEAR_DRAFT"; chatId: string }
  | { type: "SCHEDULE_MESSAGE"; msg: ScheduledMessage }
  | { type: "REMOVE_SCHEDULED"; id: string }
  | { type: "ADD_RECENT_EMOJI"; emoji: string }
  | { type: "ADD_CONTACT"; contact: CustomContact }
  | { type: "UPDATE_CONTACT"; id: string; updates: Partial<CustomContact> }
  | { type: "DELETE_CONTACT"; id: string }
  | { type: "SET_ONLINE"; online: boolean }
  | { type: "SET_TYPING"; chatId: string; typing: boolean }
  | { type: "ADD_LABEL"; label: ChatLabel }
  | { type: "DELETE_LABEL"; id: string }
  | { type: "TOGGLE_CHAT_LABEL"; chatId: string; labelId: string }
  | { type: "ADD_QUICK_REPLY"; reply: QuickReply }
  | { type: "DELETE_QUICK_REPLY"; id: string }
  | { type: "UPDATE_BUSINESS"; updates: Partial<BusinessProfile> }
  | { type: "LOCK_CHAT"; chatId: string }
  | { type: "UNLOCK_CHAT"; chatId: string }
  | { type: "SET_CHAT_LOCK_PIN"; pin: string }
  | { type: "SET_LOCK_RECOVERY"; question: string; answer: string }
  | { type: "SET_DISAPPEAR_TIMER"; chatId: string; hours: number }
  | { type: "PURGE_EXPIRED" } // delete expired disappearing messages
  | { type: "ADD_TO_CART"; id: string }
  | { type: "REMOVE_FROM_CART"; id: string }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_FAVORITE_STICKER"; sticker: string }
  | { type: "ADD_CATALOG_ITEM"; item: { id: string; name: string; price: string; emoji: string } }
  | { type: "DELETE_CATALOG_ITEM"; id: string }
  | { type: "PLACE_ORDER"; order: Order }
  | { type: "UPDATE_ORDER_STATUS"; id: string; status: Order["status"] }
  | { type: "SET_BIRTHDAY"; chatId: string; date: string }
  | { type: "SET_CHAT_THEME"; chatId: string; wallpaper: string }
  | { type: "ADD_REMINDER"; reminder: Reminder }
  | { type: "TOGGLE_REMINDER"; id: string }
  | { type: "DELETE_REMINDER"; id: string }
  | { type: "REPORT_SPAM"; chatId: string }
  | { type: "UPDATE_OOO"; updates: Partial<State["outOfOffice"]> }
  | { type: "TOGGLE_VANISH_MODE"; chatId: string }
  | { type: "SET_STATUS_PRIVACY"; privacy: State["statusPrivacy"] }
  | { type: "TOGGLE_MUTED_STATUS"; chatId: string }
  | { type: "REMOVE_SESSION"; id: string }
  | { type: "SET_GROUP_PERMISSIONS"; chatId: string; permissions: GroupPermissions }
  | { type: "MARK_VIEWED_ONCE"; chatId: string; messageId: string }
  | { type: "PIN_CHAT_LIMITED"; chatId: string }
  | { type: "ADD_RECENT_SEARCH"; query: string }
  | { type: "CLEAR_RECENT_SEARCHES" }
  | { type: "SET_CUSTOM_NOTIFICATION"; chatId: string; settings: { tone: string; vibration: string; popup: boolean } }
  | { type: "UPDATE_PRIVACY"; updates: Partial<State["privacySettings"]> }
  | { type: "TOGGLE_CHANNEL_NOTIFICATION"; channelId: string }
  | { type: "CLOSE_POLL"; messageId: string }
  | { type: "UPLOAD_PROFILE_PHOTO"; dataUrl: string }
  | { type: "TOGGLE_BETA" }
  | { type: "MARK_BIRTHDAY_POPUP_SHOWN"; date: string }
  | { type: "SET_VOICE_MINI"; data: State["voiceMiniPlayerMsg"] }
  | { type: "INSTALL_STICKER_PACK"; pack: string }
  | { type: "UNINSTALL_STICKER_PACK"; pack: string }
  | { type: "SET_RINGTONE"; chatId: string; ringtone: string }
  | { type: "ADD_CHANNEL_POST"; channelName: string; post: ChannelPost }
  | { type: "DELETE_CHANNEL_POST"; channelName: string; postId: string }
  | { type: "REORDER_PINNED"; from: number; to: number }
  | { type: "RESET" };

const initialState: State = {
  profile: {
    name: "You",
    about: "Hey there! I am using Chatsapp.",
    phone: "+1 555 000 1234",
    avatarColor: "bg-emerald-600",
    avatarText: "ME",
  },
  chats: [],
  archived: [],
  starred: [],
  statuses: [],
  viewedStatuses: [],
  myStatusItems: [],
  calls: [],
  settings: {
    wallpaper: "default",
    notifications: true,
    readReceipts: true,
    lastSeen: true,
    enterToSend: true,
    theme: "dark",
    language: "English",
    fontSize: "medium",
    appLock: false,
    twoStepEnabled: false,
    blockedContacts: [],
    disappearingDefault: "off",
    autoDownloadWifi: true,
    autoDownloadMobile: false,
    notificationTone: "Default (Note)",
    vibrate: "Default",
    callRingtone: "Default (Eclipse)",
    autoLock: "immediate",
    mediaVisibility: true,
  },
  drafts: {},
  scheduled: [],
  recentEmojis: ["😂","❤️","👍","🙏","🔥","😍","🥰","✨"],
  customContacts: [],
  online: true,
  labels: [
    { id: "l1", name: "Customer", color: "bg-blue-500" },
    { id: "l2", name: "Important", color: "bg-red-500" },
    { id: "l3", name: "Personal", color: "bg-purple-500" },
    { id: "l4", name: "Work", color: "bg-emerald-500" },
  ],
  chatLabels: {},
  quickReplies: [
    { id: "q1", shortcut: "/hi", text: "Hello! Thanks for reaching out 👋" },
    { id: "q2", shortcut: "/thanks", text: "Thank you so much! 🙏" },
    { id: "q3", shortcut: "/brb", text: "Be right back!" },
  ],
  business: {
    enabled: false,
  },
  lockedChats: [],
  disappearTimers: {},
  catalog: [
    { id: "p1", name: "Premium Widget", price: "$29.99", emoji: "🛍️" },
    { id: "p2", name: "Cool Gadget", price: "$49.99", emoji: "📱" },
    { id: "p3", name: "Awesome Book", price: "$14.99", emoji: "📚" },
    { id: "p4", name: "Coffee Mug", price: "$9.99", emoji: "☕" },
    { id: "p5", name: "Headphones", price: "$89.99", emoji: "🎧" },
    { id: "p6", name: "Sneakers", price: "$129.99", emoji: "👟" },
  ],
  cart: {},
  favoriteStickers: [],
  orders: [],
  birthdays: {},
  chatThemes: {},
  reminders: [],
  spamReports: [],
  outOfOffice: { enabled: false, message: "I'm currently away. I'll respond as soon as possible." },
  pinLimit: 5,
  vanishModeChats: [],
  statusPrivacy: { mode: "contacts", list: [] },
  mutedStatuses: [],
  sessions: [
    { id: "s1", device: "iPhone 15 Pro · iOS 17", location: "San Francisco, CA", loginTime: Date.now() - 86400000 * 7, current: true },
    { id: "s2", device: "Chrome · macOS", location: "San Francisco, CA", loginTime: Date.now() - 86400000 * 2 },
    { id: "s3", device: "Chatsapp Web · Windows", location: "Unknown", loginTime: Date.now() - 86400000 * 14 },
  ],
  groupPermissions: {},
  hidesReadReceipts: false,
  recentSearches: [],
  customNotifications: {},
  privacySettings: {
    lastSeen: "everyone",
    profilePhoto: "contacts",
    about: "everyone",
    groups: "everyone",
    callPrivacy: "everyone",
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    autoSaveToGallery: true,
    silenceUnknown: false,
  },
  channelNotifications: {},
  closedPolls: [],
  betaProgram: false,
  birthdayPopupShown: "",
  profilePhotoHistory: [],
  voiceMiniPlayerMsg: null,
  appVersion: "2.26.10.74",
  installedStickerPacks: ["faces", "hands", "hearts"],
  customRingtones: {},
  channelPosts: {},
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SEND_MESSAGE": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? {
                ...c,
                messages: [...c.messages, action.message],
                lastMessage: action.message.text || (action.message.type === "image" ? "📷 Photo" : action.message.type === "voice" ? `🎵 Voice (${action.message.duration})` : action.message.type === "doc" ? "📄 " + (action.message.media || "Document") : ""),
                time: action.message.time,
              }
            : c
        ),
      };
    }
    case "UPDATE_MESSAGE_STATUS": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId ? { ...m, status: action.status } : m
                ),
              }
            : c
        ),
      };
    }
    case "RECEIVE_MESSAGE": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? {
                ...c,
                messages: [...c.messages, action.message],
                lastMessage: action.message.text,
                time: action.message.time,
                unread: c.unread + 1,
              }
            : c
        ),
      };
    }
    case "DELETE_MESSAGE": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? { ...c, messages: c.messages.filter((m) => m.id !== action.messageId) }
            : c
        ),
      };
    }
    case "STAR_MESSAGE": {
      const key = `${action.chatId}:${action.messageId}`;
      return {
        ...state,
        starred: state.starred.includes(key)
          ? state.starred.filter((k) => k !== key)
          : [...state.starred, key],
      };
    }
    case "MARK_READ": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId ? { ...c, unread: 0 } : c
        ),
      };
    }
    case "PIN_CHAT": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId ? { ...c, pinned: !c.pinned } : c
        ),
      };
    }
    case "MUTE_CHAT": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId ? { ...c, muted: !c.muted } : c
        ),
      };
    }
    case "ARCHIVE_CHAT": {
      return { ...state, archived: [...state.archived, action.chatId] };
    }
    case "UNARCHIVE_CHAT": {
      return { ...state, archived: state.archived.filter((id) => id !== action.chatId) };
    }
    case "DELETE_CHAT": {
      return {
        ...state,
        chats: state.chats.filter((c) => c.id !== action.chatId),
        archived: state.archived.filter((id) => id !== action.chatId),
      };
    }
    case "CREATE_CHAT": {
      if (state.chats.some((c) => c.id === action.chat.id)) return state;
      return { ...state, chats: [action.chat, ...state.chats] };
    }
    case "ADD_CALL": {
      return { ...state, calls: [action.call, ...state.calls] };
    }
    case "ADD_STATUS": {
      return { ...state, myStatusItems: [...state.myStatusItems, action.status] };
    }
    case "VIEW_STATUS": {
      return {
        ...state,
        statuses: state.statuses.filter((s) => s.id !== action.statusId),
        viewedStatuses: state.statuses.find((s) => s.id === action.statusId)
          ? [{ ...state.statuses.find((s) => s.id === action.statusId)!, viewed: true }, ...state.viewedStatuses]
          : state.viewedStatuses,
      };
    }
    case "UPDATE_PROFILE": {
      return { ...state, profile: { ...state.profile, ...action.profile } };
    }
    case "UPDATE_SETTINGS": {
      return { ...state, settings: { ...state.settings, ...action.settings } };
    }
    case "EDIT_MESSAGE": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId ? { ...m, text: action.text, edited: true } : m
                ),
              }
            : c
        ),
      };
    }
    case "REACT_MESSAGE": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id !== action.messageId) return m;
                  const existing = m.reactions || [];
                  const mine = existing.find((r) => r.by === action.by);
                  if (mine && mine.emoji === action.emoji) {
                    // toggle off
                    return { ...m, reactions: existing.filter((r) => r.by !== action.by) };
                  }
                  return {
                    ...m,
                    reactions: [
                      ...existing.filter((r) => r.by !== action.by),
                      { emoji: action.emoji, by: action.by },
                    ],
                  };
                }),
              }
            : c
        ),
      };
    }
    case "PIN_MESSAGE": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId ? { ...m, pinned: !m.pinned } : m
                ),
              }
            : c
        ),
      };
    }
    case "VOTE_POLL": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? {
                ...c,
                messages: c.messages.map((m) => {
                  if (m.id !== action.messageId || !m.poll) return m;
                  const opts = m.poll.options.map((o) => ({
                    ...o,
                    votes: o.id === action.optionId
                      ? (o.votes.includes(action.voter) ? o.votes.filter((v) => v !== action.voter) : [...o.votes, action.voter])
                      : (m.poll!.multiple ? o.votes : o.votes.filter((v) => v !== action.voter)),
                  }));
                  return { ...m, poll: { ...m.poll, options: opts } };
                }),
              }
            : c
        ),
      };
    }
    case "BLOCK_CONTACT": {
      return {
        ...state,
        settings: {
          ...state.settings,
          blockedContacts: [...state.settings.blockedContacts, action.chatId],
        },
      };
    }
    case "UNBLOCK_CONTACT": {
      return {
        ...state,
        settings: {
          ...state.settings,
          blockedContacts: state.settings.blockedContacts.filter((id) => id !== action.chatId),
        },
      };
    }
    case "ADD_GROUP_MEMBER": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId && c.isGroup
            ? { ...c, members: [...(c.members || []), action.member] }
            : c
        ),
      };
    }
    case "REMOVE_GROUP_MEMBER": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId && c.isGroup
            ? { ...c, members: (c.members || []).filter((m) => m !== action.member) }
            : c
        ),
      };
    }
    case "UPDATE_GROUP_INFO": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? { ...c, name: action.name ?? c.name, about: action.about ?? c.about }
            : c
        ),
      };
    }
    case "UPDATE_CHAT_AVATAR": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? { ...c, avatarColor: action.color, avatarText: action.text }
            : c
        ),
      };
    }
    case "SET_DRAFT": {
      return { ...state, drafts: { ...state.drafts, [action.chatId]: action.text } };
    }
    case "CLEAR_DRAFT": {
      const { [action.chatId]: _, ...rest } = state.drafts;
      return { ...state, drafts: rest };
    }
    case "SCHEDULE_MESSAGE": {
      return { ...state, scheduled: [...state.scheduled, action.msg] };
    }
    case "REMOVE_SCHEDULED": {
      return { ...state, scheduled: state.scheduled.filter((s) => s.id !== action.id) };
    }
    case "ADD_RECENT_EMOJI": {
      const filtered = state.recentEmojis.filter((e) => e !== action.emoji);
      return { ...state, recentEmojis: [action.emoji, ...filtered].slice(0, 24) };
    }
    case "ADD_CONTACT": {
      return { ...state, customContacts: [...state.customContacts, action.contact] };
    }
    case "UPDATE_CONTACT": {
      return {
        ...state,
        customContacts: state.customContacts.map((c) =>
          c.id === action.id ? { ...c, ...action.updates } : c
        ),
      };
    }
    case "DELETE_CONTACT": {
      return { ...state, customContacts: state.customContacts.filter((c) => c.id !== action.id) };
    }
    case "SET_ONLINE": {
      return { ...state, online: action.online };
    }
    case "SET_TYPING": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId ? { ...c, typing: action.typing } : c
        ),
      };
    }
    case "ADD_LABEL": {
      return { ...state, labels: [...state.labels, action.label] };
    }
    case "DELETE_LABEL": {
      const cl = { ...state.chatLabels };
      Object.keys(cl).forEach((cid) => {
        cl[cid] = cl[cid].filter((id) => id !== action.id);
      });
      return {
        ...state,
        labels: state.labels.filter((l) => l.id !== action.id),
        chatLabels: cl,
      };
    }
    case "TOGGLE_CHAT_LABEL": {
      const cur = state.chatLabels[action.chatId] || [];
      const next = cur.includes(action.labelId)
        ? cur.filter((id) => id !== action.labelId)
        : [...cur, action.labelId];
      return {
        ...state,
        chatLabels: { ...state.chatLabels, [action.chatId]: next },
      };
    }
    case "ADD_QUICK_REPLY": {
      return { ...state, quickReplies: [...state.quickReplies, action.reply] };
    }
    case "DELETE_QUICK_REPLY": {
      return { ...state, quickReplies: state.quickReplies.filter((q) => q.id !== action.id) };
    }
    case "UPDATE_BUSINESS": {
      return { ...state, business: { ...state.business, ...action.updates } };
    }
    case "LOCK_CHAT": {
      return { ...state, lockedChats: [...state.lockedChats, action.chatId] };
    }
    case "UNLOCK_CHAT": {
      return { ...state, lockedChats: state.lockedChats.filter((id) => id !== action.chatId) };
    }
    case "SET_CHAT_LOCK_PIN": {
      return { ...state, lockedChatPin: action.pin };
    }
    case "SET_LOCK_RECOVERY": {
      return { ...state, lockQuestion: action.question, lockAnswer: action.answer };
    }
    case "SET_DISAPPEAR_TIMER": {
      return {
        ...state,
        disappearTimers: { ...state.disappearTimers, [action.chatId]: action.hours },
      };
    }
    case "PURGE_EXPIRED": {
      // Delete messages older than the chat's disappear timer
      const now = Date.now();
      const updated = state.chats.map((c) => {
        const hours = state.disappearTimers[c.id];
        if (!hours) return c;
        const cutoff = now - hours * 3600_000;
        const filtered = c.messages.filter((m) => {
          const t = parseInt((m.id.match(/\d+/) || ["0"])[0]);
          return !t || t > cutoff;
        });
        if (filtered.length === c.messages.length) return c;
        return { ...c, messages: filtered };
      });
      return { ...state, chats: updated };
    }
    case "ADD_TO_CART": {
      return {
        ...state,
        cart: { ...state.cart, [action.id]: (state.cart[action.id] || 0) + 1 },
      };
    }
    case "REMOVE_FROM_CART": {
      const cur = state.cart[action.id] || 0;
      const next = { ...state.cart };
      if (cur <= 1) delete next[action.id];
      else next[action.id] = cur - 1;
      return { ...state, cart: next };
    }
    case "CLEAR_CART": {
      return { ...state, cart: {} };
    }
    case "TOGGLE_FAVORITE_STICKER": {
      return {
        ...state,
        favoriteStickers: state.favoriteStickers.includes(action.sticker)
          ? state.favoriteStickers.filter((s) => s !== action.sticker)
          : [...state.favoriteStickers, action.sticker],
      };
    }
    case "ADD_CATALOG_ITEM": {
      return { ...state, catalog: [...state.catalog, action.item] };
    }
    case "DELETE_CATALOG_ITEM": {
      const newCart = { ...state.cart };
      delete newCart[action.id];
      return {
        ...state,
        catalog: state.catalog.filter((c) => c.id !== action.id),
        cart: newCart,
      };
    }
    case "PLACE_ORDER": {
      return { ...state, orders: [action.order, ...state.orders] };
    }
    case "UPDATE_ORDER_STATUS": {
      return {
        ...state,
        orders: state.orders.map((o) => o.id === action.id ? { ...o, status: action.status } : o),
      };
    }
    case "SET_BIRTHDAY": {
      return { ...state, birthdays: { ...state.birthdays, [action.chatId]: action.date } };
    }
    case "SET_CHAT_THEME": {
      return { ...state, chatThemes: { ...state.chatThemes, [action.chatId]: action.wallpaper } };
    }
    case "ADD_REMINDER": {
      return { ...state, reminders: [...state.reminders, action.reminder] };
    }
    case "TOGGLE_REMINDER": {
      return {
        ...state,
        reminders: state.reminders.map((r) => r.id === action.id ? { ...r, done: !r.done } : r),
      };
    }
    case "DELETE_REMINDER": {
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.id) };
    }
    case "REPORT_SPAM": {
      return { ...state, spamReports: [...state.spamReports, action.chatId] };
    }
    case "UPDATE_OOO": {
      return { ...state, outOfOffice: { ...state.outOfOffice, ...action.updates } };
    }
    case "TOGGLE_VANISH_MODE": {
      return {
        ...state,
        vanishModeChats: state.vanishModeChats.includes(action.chatId)
          ? state.vanishModeChats.filter((id) => id !== action.chatId)
          : [...state.vanishModeChats, action.chatId],
      };
    }
    case "SET_STATUS_PRIVACY": {
      return { ...state, statusPrivacy: action.privacy };
    }
    case "TOGGLE_MUTED_STATUS": {
      return {
        ...state,
        mutedStatuses: state.mutedStatuses.includes(action.chatId)
          ? state.mutedStatuses.filter((id) => id !== action.chatId)
          : [...state.mutedStatuses, action.chatId],
      };
    }
    case "REMOVE_SESSION": {
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) };
    }
    case "SET_GROUP_PERMISSIONS": {
      return {
        ...state,
        groupPermissions: { ...state.groupPermissions, [action.chatId]: action.permissions },
      };
    }
    case "MARK_VIEWED_ONCE": {
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId ? { ...m, viewedOnce: true } : m
                ),
              }
            : c
        ),
      };
    }
    case "PIN_CHAT_LIMITED": {
      const pinnedCount = state.chats.filter((c) => c.pinned).length;
      const target = state.chats.find((c) => c.id === action.chatId);
      if (target?.pinned) {
        return {
          ...state,
          chats: state.chats.map((c) =>
            c.id === action.chatId ? { ...c, pinned: false } : c
          ),
        };
      }
      if (pinnedCount >= state.pinLimit) {
        return state; // ignore - limit reached
      }
      return {
        ...state,
        chats: state.chats.map((c) =>
          c.id === action.chatId ? { ...c, pinned: true } : c
        ),
      };
    }
    case "ADD_RECENT_SEARCH": {
      const filtered = state.recentSearches.filter((q) => q !== action.query);
      return { ...state, recentSearches: [action.query, ...filtered].slice(0, 8) };
    }
    case "CLEAR_RECENT_SEARCHES": {
      return { ...state, recentSearches: [] };
    }
    case "SET_CUSTOM_NOTIFICATION": {
      return {
        ...state,
        customNotifications: { ...state.customNotifications, [action.chatId]: action.settings },
      };
    }
    case "UPDATE_PRIVACY": {
      return { ...state, privacySettings: { ...state.privacySettings, ...action.updates } };
    }
    case "TOGGLE_CHANNEL_NOTIFICATION": {
      return {
        ...state,
        channelNotifications: {
          ...state.channelNotifications,
          [action.channelId]: !state.channelNotifications[action.channelId],
        },
      };
    }
    case "CLOSE_POLL": {
      return {
        ...state,
        closedPolls: state.closedPolls.includes(action.messageId)
          ? state.closedPolls
          : [...state.closedPolls, action.messageId],
      };
    }
    case "UPLOAD_PROFILE_PHOTO": {
      // Track previous photo in history
      const history = state.profile.photoUrl
        ? [state.profile.photoUrl, ...state.profilePhotoHistory.filter((u) => u !== state.profile.photoUrl)].slice(0, 5)
        : state.profilePhotoHistory;
      return {
        ...state,
        profile: { ...state.profile, photoUrl: action.dataUrl || undefined },
        profilePhotoHistory: history,
      };
    }
    case "TOGGLE_BETA": {
      return { ...state, betaProgram: !state.betaProgram };
    }
    case "MARK_BIRTHDAY_POPUP_SHOWN": {
      return { ...state, birthdayPopupShown: action.date };
    }
    case "SET_VOICE_MINI": {
      return { ...state, voiceMiniPlayerMsg: action.data };
    }
    case "INSTALL_STICKER_PACK": {
      if (state.installedStickerPacks.includes(action.pack)) return state;
      return { ...state, installedStickerPacks: [...state.installedStickerPacks, action.pack] };
    }
    case "UNINSTALL_STICKER_PACK": {
      return {
        ...state,
        installedStickerPacks: state.installedStickerPacks.filter((p) => p !== action.pack),
      };
    }
    case "SET_RINGTONE": {
      return { ...state, customRingtones: { ...state.customRingtones, [action.chatId]: action.ringtone } };
    }
    case "ADD_CHANNEL_POST": {
      return {
        ...state,
        channelPosts: {
          ...state.channelPosts,
          [action.channelName]: [action.post, ...(state.channelPosts[action.channelName] || [])],
        },
      };
    }
    case "DELETE_CHANNEL_POST": {
      return {
        ...state,
        channelPosts: {
          ...state.channelPosts,
          [action.channelName]: (state.channelPosts[action.channelName] || []).filter((p) => p.id !== action.postId),
        },
      };
    }
    case "REORDER_PINNED": {
      const pinned = state.chats.filter((c) => c.pinned);
      const others = state.chats.filter((c) => !c.pinned);
      const [moved] = pinned.splice(action.from, 1);
      pinned.splice(action.to, 0, moved);
      return { ...state, chats: [...pinned, ...others] };
    }
    case "RESET": {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("wa-onboarded");
      return initialState;
    }
  }
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null);

const STORAGE_KEY = "wa-state-v2";

function loadState(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    return { ...initialState, ...parsed };
  } catch {
    return initialState;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined as any, loadState);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be inside StoreProvider");
  return ctx;
}

export { }; // no seed exports — data is created only by real user actions
