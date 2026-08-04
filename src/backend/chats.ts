/**
 * Chatsapp Chats & Groups Service — chat records, group roles, invite links,
 * pin/mute/archive, and search (indexed queries).
 */

import { db } from "./db";
import { secureToken } from "./crypto";

export interface ChatRecord {
  id: string;
  userId: string;
  type: "dm" | "group" | "broadcast";
  name: string;
  about?: string;
  avatarColor: string;
  avatarText: string;
  members: string[]; // userIds
  admins: string[]; // userIds
  ownerId?: string;
  inviteToken?: string;
  approvalRequired?: boolean;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  unreadCount: number;
  disappearingHours?: number;
}

export async function createChat(chat: Omit<ChatRecord, "id" | "createdAt" | "updatedAt" | "lastMessageAt" | "unreadCount" | "inviteToken">): Promise<ChatRecord> {
  const rec: ChatRecord = {
    ...chat,
    id: "chat_" + secureToken(10),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastMessageAt: Date.now(),
    unreadCount: 0,
  };
  await db.put("chats", rec);
  return rec;
}

export async function createGroup(chat: Omit<ChatRecord, "id" | "createdAt" | "updatedAt" | "lastMessageAt" | "unreadCount" | "inviteToken" | "type">): Promise<ChatRecord> {
  const rec = await createChat({ ...chat, type: "group" });
  await updateChat(rec.id, { inviteToken: secureToken(16) });
  return (await db.get<ChatRecord>("chats", rec.id))!;
}

export async function getChats(userId: string): Promise<ChatRecord[]> {
  const all = await db.getByIndex<ChatRecord>("chats", "userId", userId);
  return all.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

export async function updateChat(chatId: string, patch: Partial<ChatRecord>): Promise<void> {
  const cur = await db.get<ChatRecord>("chats", chatId);
  if (!cur) return;
  await db.put("chats", { ...cur, ...patch, updatedAt: Date.now() });
}

export async function touchChat(chatId: string, unreadDelta = 0): Promise<void> {
  const cur = await db.get<ChatRecord>("chats", chatId);
  if (!cur) return;
  await db.put("chats", {
    ...cur,
    lastMessageAt: Date.now(),
    updatedAt: Date.now(),
    unreadCount: Math.max(0, cur.unreadCount + unreadDelta),
  });
}

export async function addGroupMember(chatId: string, memberId: string, adminId: string): Promise<void> {
  const cur = await db.get<ChatRecord>("chats", chatId);
  if (!cur || cur.type !== "group") return;
  if (!cur.admins.includes(adminId)) throw new Error("Only admins can add members");
  if (cur.members.includes(memberId)) return;
  await db.put("chats", { ...cur, members: [...cur.members, memberId], updatedAt: Date.now() });
}

export async function removeGroupMember(chatId: string, memberId: string, adminId: string): Promise<void> {
  const cur = await db.get<ChatRecord>("chats", chatId);
  if (!cur || cur.type !== "group") return;
  if (!cur.admins.includes(adminId) && adminId !== memberId) throw new Error("Only admins can remove members");
  await db.put("chats", {
    ...cur,
    members: cur.members.filter((m) => m !== memberId),
    updatedAt: Date.now(),
  });
}

/** Invite-link join with optional admin approval. */
export async function joinViaInvite(token: string, userId: string): Promise<ChatRecord | null> {
  const chats = await db.getAll<ChatRecord>("chats");
  const chat = chats.find((c) => c.inviteToken === token);
  if (!chat) return null;
  if (chat.members.includes(userId)) return chat;
  if (chat.approvalRequired) {
    // pending state — admins approve via addGroupMember
    return chat;
  }
  await db.put("chats", { ...chat, members: [...chat.members, userId], updatedAt: Date.now() });
  return chat;
}

export async function resetInviteLink(chatId: string): Promise<string> {
  const token = secureToken(16);
  await updateChat(chatId, { inviteToken: token });
  return token;
}

export async function searchChats(userId: string, query: string): Promise<ChatRecord[]> {
  const q = query.toLowerCase();
  const all = await getChats(userId);
  return all.filter((c) => c.name.toLowerCase().includes(q) || c.about?.toLowerCase().includes(q));
}
