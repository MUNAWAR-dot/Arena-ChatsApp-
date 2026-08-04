/**
 * Chatsapp data types + EMPTY initial state.
 *
 * There is deliberately no seed data: chats, messages, statuses and calls are
 * created only by real user actions and persisted through the backend services
 * (IndexedDB locally, Prisma on the server).
 */

export type Message = {
  id: string;
  text: string;
  time: string;
  sent: boolean; // true = me, false = them
  status?: "sent" | "delivered" | "read"; // double tick states
  statusSentAt?: number;
  statusDeliveredAt?: number;
  statusReadAt?: number;
  type?: "text" | "image" | "video" | "voice" | "doc" | "poll" | "location" | "contact" | "sticker";
  media?: string;
  duration?: string; // for voice
  reply?: { name: string; text: string };
  reactions?: Reaction[];
  poll?: Poll;
  location?: { name: string; lat: number; lng: number };
  contact?: { name: string; phone: string };
  pinned?: boolean;
  edited?: boolean;
  deleted?: boolean;
  viewOnce?: boolean;
  viewedOnce?: boolean;
  vanish?: boolean;
  forwarded?: boolean;
  forwardCount?: number;
  fromMember?: string; // for group messages, name of sender
};

export type PollOption = { id: string; text: string; votes: string[] /* voter names */ };
export type Poll = { question: string; options: PollOption[]; multiple?: boolean };
export type Reaction = { emoji: string; by: string };

export type Chat = {
  id: string;
  name: string;
  avatarColor: string;
  avatarText: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  typing?: boolean;
  isGroup?: boolean;
  members?: string[];
  about?: string;
  phone?: string;
  pinned?: boolean;
  muted?: boolean;
  messages: Message[];
};

export type Status = {
  id: string;
  name: string;
  avatarColor: string;
  avatarText: string;
  time: string;
  viewed: boolean;
  bgColor: string;
  text: string;
};

export type Call = {
  id: string;
  name: string;
  avatarColor: string;
  avatarText: string;
  time: string;
  type: "incoming" | "outgoing" | "missed";
  callType: "voice" | "video";
};

// ── Empty initial state — populated only by real user actions ──
export const chats: Chat[] = [];
export const recentStatuses: Status[] = [];
export const viewedStatuses: Status[] = [];
export const calls: Call[] = [];
export const communities: {
  id: string;
  name: string;
  avatarColor: string;
  avatarText: string;
  description: string;
  groups: { id: string; name: string; lastMessage: string; time: string; unread: number }[];
}[] = [];

export const myStatus = {
  name: "My status",
  avatarColor: "bg-emerald-600",
  avatarText: "ME",
  hasStatus: false,
  time: "Tap to add status update",
};
