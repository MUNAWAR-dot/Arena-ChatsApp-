/**
 * Chatsapp Presence & Notifications.
 *
 * Presence: real online/offline detection via visibility + heartbeat broadcast.
 * Notifications: real Notification API + badge count + silent sync events.
 */

import { socketClient } from "./socket";
import { db } from "./db";
import { secureToken } from "./crypto";

const HEARTBEAT_MS = 15000;
const AWAY_MS = 60000;

export interface PresenceRecord {
  userId: string;
  online: boolean;
  lastSeen: number;
}

let heartbeatTimer: any = null;
let lastActive = Date.now();

export function initPresence(userId: string): () => void {
  const setOnline = (online: boolean) => {
    const rec: PresenceRecord = { userId, online, lastSeen: Date.now() };
    db.put("presence", { ...rec, id: userId }).catch(() => {});
    // Presence broadcast goes through the real socket (server relays to rooms)
    socketClient.emit("presence", { userId, online, lastSeen: rec.lastSeen });
  };

  const onVisible = () => {
    if (document.visibilityState === "visible") {
      lastActive = Date.now();
      setOnline(true);
      clearInterval(heartbeatTimer);
      heartbeatTimer = setInterval(() => {
        // Auto-away if the user hasn't interacted for a while
        const away = Date.now() - lastActive > AWAY_MS;
        socketClient.emit("presence", { userId, online: !away, lastSeen: Date.now() });
      }, HEARTBEAT_MS);
    } else {
      setOnline(false);
      clearInterval(heartbeatTimer);
    }
  };
  const onActivity = () => {
    lastActive = Date.now();
  };

  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("pointerdown", onActivity);
  window.addEventListener("keydown", onActivity);
  onVisible();

  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("pointerdown", onActivity);
    window.removeEventListener("keydown", onActivity);
    clearInterval(heartbeatTimer);
    setOnline(false);
  };
}

/* ── Notifications ─────────────────────────────────────────── */

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

export function showNotification(title: string, body: string, onClick?: () => void): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const n = new Notification(title, {
      body,
      tag: "chatsapp-" + secureToken(4),
    });
    n.onclick = () => {
      window.focus();
      onClick?.();
      n.close();
    };
  } catch {}
}

export async function setBadgeCount(count: number): Promise<void> {
  try {
    if ("setAppBadge" in navigator) {
      if (count > 0) await (navigator as any).setAppBadge(count);
      else await (navigator as any).clearAppBadge();
    }
  } catch {}
}

export interface AppNotification {
  id: string;
  userId: string;
  chatId?: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

export async function persistNotification(n: Omit<AppNotification, "id" | "createdAt" | "read">): Promise<void> {
  const rec: AppNotification = { ...n, id: "n_" + secureToken(8), read: false, createdAt: Date.now() };
  await db.put("notifications", rec);
  const unread = await db.getByIndex<AppNotification>("notifications", "read", false);
  await setBadgeCount(unread.length);
  void rec;
  return;
}

export async function markNotificationsRead(chatId: string): Promise<void> {
  const all = await db.getAll<AppNotification>("notifications");
  await Promise.all(
    all
      .filter((n) => n.chatId === chatId && !n.read)
      .map((n) => db.put("notifications", { ...n, read: true }))
  );
  const unread = await db.getByIndex<AppNotification>("notifications", "read", false);
  await setBadgeCount(unread.length);
}
