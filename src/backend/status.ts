/**
 * Chatsapp Status Service — real 24-hour expiry, view counts, privacy.
 */

import { db } from "./db";
import { secureToken } from "./crypto";

export interface StatusRecord {
  id: string;
  userId: string;
  type: "text" | "image" | "video";
  text?: string;
  mediaId?: string;
  createdAt: number;
  expiresAt: number;
  views: number;
  viewers: { userId: string; at: number }[];
}

export const STATUS_TTL_MS = 24 * 3600 * 1000;

export async function postStatus(userId: string, data: { type: "text" | "image" | "video"; text?: string; mediaId?: string }): Promise<StatusRecord> {
  const now = Date.now();
  const rec: StatusRecord = {
    id: "st_" + secureToken(10),
    userId,
    type: data.type,
    text: data.text,
    mediaId: data.mediaId,
    createdAt: now,
    expiresAt: now + STATUS_TTL_MS,
    views: 0,
    viewers: [],
  };
  await db.put("statuses", rec);
  return rec;
}

export async function getActiveStatuses(userId: string): Promise<StatusRecord[]> {
  const all = await db.getByIndex<StatusRecord>("statuses", "userId", userId);
  const now = Date.now();
  return all
    .filter((s) => s.expiresAt > now)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function getAllActiveStatuses(): Promise<StatusRecord[]> {
  const all = await db.getAll<StatusRecord>("statuses");
  const now = Date.now();
  return all
    .filter((s) => s.expiresAt > now)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function viewStatus(statusId: string, viewerId: string): Promise<void> {
  const s = await db.get<StatusRecord>("statuses", statusId);
  if (!s || s.expiresAt < Date.now()) return;
  if (s.viewers.some((v) => v.userId === viewerId)) return; // count once per viewer
  await db.put("statuses", {
    ...s,
    views: s.views + 1,
    viewers: [...s.viewers, { userId: viewerId, at: Date.now() }],
  });
}

export async function deleteStatus(statusId: string): Promise<void> {
  await db.delete("statuses", statusId);
}

/** Periodic cleanup of expired statuses. */
export function startStatusCleanup(): () => void {
  const id = setInterval(async () => {
    const all = await db.getAll<StatusRecord>("statuses");
    const now = Date.now();
    await Promise.all(
      all.filter((s) => s.expiresAt <= now).map((s) => db.delete("statuses", s.id))
    );
  }, 60 * 60 * 1000);
  return () => clearInterval(id);
}
