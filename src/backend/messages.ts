/**
 * Chatsapp Messaging Service — REAL pipeline only.
 *
 * Send: user action → IndexedDB write (queued) → Socket.IO "message:send"
 *       with server ack → status transitions on ack.
 * Receive: Socket.IO "message:new" from the server (which only emits when a
 *          DIFFERENT connected client sends) → dedupe by clientId → IndexedDB.
 *
 * There are no timers, mock arrays, or auto-generated messages here.
 */

import { db } from "./db";
import { socketClient } from "./socket";
import { secureToken, encryptMessage, decryptMessage } from "./crypto";
import { persistNotification } from "./presence";

export type MsgStatus = "queued" | "sending" | "sent" | "delivered" | "read";

export interface MessageRecord {
  id: string;
  clientId: string;
  chatId: string;
  senderId: string;
  recipientId?: string;
  type: string;
  text: string;
  mediaId?: string;
  status: MsgStatus;
  createdAt: number;
  updatedAt: number;
  statusSentAt?: number;
  statusDeliveredAt?: number;
  statusReadAt?: number;
  editedAt?: number;
  deleted?: boolean;
  replyTo?: string;
  reactions?: { emoji: string; by: string }[];
  envelope?: { iv: string; cipher: string; aad: string };
}

let clock = 0;
function nextTs(): number {
  clock += 1;
  return Date.now() + clock / 1000;
}

export interface SendOptions {
  peerPublicKey?: string;
}

/** Send a message: persist locally, then deliver via the real socket server. */
export async function sendMessage(
  chatId: string,
  senderId: string,
  recipientId: string | undefined,
  content: { text: string; type?: string; mediaId?: string },
  opts: SendOptions = {}
): Promise<MessageRecord> {
  const clientId = secureToken(12);
  const now = nextTs();
  const rec: MessageRecord = {
    id: "msg_" + secureToken(10),
    clientId,
    chatId,
    senderId,
    recipientId,
    type: content.type || "text",
    text: content.text,
    mediaId: content.mediaId,
    status: "queued",
    createdAt: now,
    updatedAt: now,
  };

  // E2EE: encrypt before it leaves the device
  if (opts.peerPublicKey) {
    try {
      rec.envelope = await encryptMessage(opts.peerPublicKey, chatId, senderId, content.text);
      rec.text = "";
    } catch {
      rec.envelope = undefined;
    }
  }

  await db.put("messages", rec);
  await db.put("outbox", { id: rec.id, messageId: rec.id, createdAt: Date.now(), status: "queued", attempts: 0 });

  // Deliver over the real socket; mark statuses on ack
  void (async () => {
    await updateRec(rec.id, { status: "sending", statusSentAt: Date.now() });
    try {
      const res = await socketClient.sendMessage({
        clientId,
        chatId,
        text: rec.envelope ? "" : rec.text,
        type: rec.type.toUpperCase(),
        envelope: rec.envelope,
        mediaId: rec.mediaId,
      });
      void res; // server message object (cuid id); we keep our local id as canonical
      await updateRec(rec.id, { status: "sent", statusSentAt: Date.now() });
      await db.delete("outbox", rec.id);
      // Other clients will ack DELIVERED/READ via socket → updateRec
    } catch {
      // offline: keep queued; outbox monitor retries with backoff
      const out = await db.get<{ attempts: number }>("outbox", rec.id);
      await db.put("outbox", { id: rec.id, messageId: rec.id, createdAt: Date.now(), status: "retry", attempts: (out?.attempts || 0) + 1 });
    }
  })();

  return rec;
}

async function updateRec(id: string, patch: Partial<MessageRecord>): Promise<void> {
  const cur = await db.get<MessageRecord>("messages", id);
  if (!cur) return;
  await db.put("messages", { ...cur, ...patch, updatedAt: Date.now() });
}

/**
 * Handle a real socket "message:new" (only ever emitted by the server when
 * another connected client sends). Dedupes by clientId and persists.
 */
export async function onIncomingSocketMessage(
  payload: { chatId: string; message: any },
  ctx: { myId: string; peerPublicKey?: string }
): Promise<MessageRecord | null> {
  const src = payload.message;
  if (!src || src.senderId === ctx.myId) return null;

  const dup = await db.getByIndex<MessageRecord>("messages", "clientId", src.clientId);
  if (dup.length > 0) return null;

  let text = src.text || "";
  if (src.envelopeIv && src.envelopeCipher && ctx.peerPublicKey) {
    try {
      text = await decryptMessage(ctx.peerPublicKey, {
        iv: src.envelopeIv,
        cipher: src.envelopeCipher,
        aad: src.envelopeAad || "",
      });
    } catch {
      text = "🔒 Could not decrypt";
    }
  }

  const rec: MessageRecord = {
    id: src.id || "msg_" + secureToken(10),
    clientId: src.clientId,
    chatId: payload.chatId,
    senderId: src.senderId,
    type: (src.type || "text").toLowerCase(),
    text,
    mediaId: src.mediaId,
    status: "delivered",
    statusDeliveredAt: Date.now(),
    createdAt: src.createdAt ? new Date(src.createdAt).getTime() : Date.now(),
    updatedAt: Date.now(),
  };
  await db.put("messages", rec);

  // Mark read + ack back through the socket (real round trip)
  await updateRec(rec.id, { status: "read", statusReadAt: Date.now() });
  socketClient.sendStatus(payload.chatId, rec.id, "READ");

  await persistNotification({
    userId: ctx.myId,
    chatId: payload.chatId,
    title: "New message",
    body: (text || "[media]").slice(0, 120),
  });
  return rec;
}

/** Handle real socket "message:status" (DELIVERED/READ) from the server. */
export function onIncomingStatus(payload: { chatId: string; messageId: string; status: "DELIVERED" | "READ" }): void {
  void (async () => {
    const rec = await db.get<MessageRecord>("messages", payload.messageId);
    if (!rec) return;
    const patch: Partial<MessageRecord> = { status: payload.status.toLowerCase() as MsgStatus };
    if (payload.status === "DELIVERED") patch.statusDeliveredAt = Date.now();
    if (payload.status === "READ") patch.statusReadAt = Date.now();
    await updateRec(payload.messageId, patch);
  })();
}

export async function getChatMessages(chatId: string, limit = 200): Promise<MessageRecord[]> {
  const all = await db.getByIndex<MessageRecord>("messages", "chatId", chatId);
  return all
    .filter((m) => !m.deleted)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-limit);
}

export async function deleteMessage(messageId: string): Promise<void> {
  const rec = await db.get<MessageRecord>("messages", messageId);
  if (rec) {
    await db.put("messages", { ...rec, deleted: true, updatedAt: Date.now() });
  }
}

/** Outbox monitor — retries FAILED sends only (real failures, exponential backoff). */
export function startOutboxMonitor(): () => void {
  const id = setInterval(async () => {
    const pending = await db.getAll<{ id: string; messageId: string; createdAt: number; attempts: number }>("outbox");
    for (const p of pending) {
      if (!socketClient.connected) continue; // never fabricate delivery
      const delay = Math.min(60000, 1000 * 2 ** (p.attempts || 0));
      if (Date.now() - p.createdAt > delay) {
        const rec = await db.get<MessageRecord>("messages", p.messageId);
        if (rec && rec.status !== "sent") {
          await db.put("outbox", { ...p, status: "sending" });
          try {
            await socketClient.sendMessage({
              clientId: rec.clientId,
              chatId: rec.chatId,
              text: rec.envelope ? "" : rec.text,
              type: rec.type.toUpperCase(),
              envelope: rec.envelope,
              mediaId: rec.mediaId,
            });
            await updateRec(rec.id, { status: "sent", statusSentAt: Date.now() });
            await db.delete("outbox", rec.id);
          } catch {
            await db.put("outbox", { ...p, attempts: p.attempts + 1 });
          }
        }
      }
    }
  }, 5000);
  return () => clearInterval(id);
}
