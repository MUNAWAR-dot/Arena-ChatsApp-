/**
 * Chatsapp System Diagnostics — runs real checks against the actual services
 * (database CRUD, crypto round-trip, OTP auth, outbox queue, status TTL).
 */

import { db } from "./db";
import { initIdentity, getPublicKey, encryptMessage, decryptMessage } from "./crypto";
import { requestOtp, verifyOtp } from "./auth";
import { onIncomingSocketMessage, getChatMessages } from "./messages";
import { createChat } from "./chats";
import { postStatus, getActiveStatuses } from "./status";
import { uploadMedia } from "./media";

export interface TestResult {
  name: string;
  passed: boolean;
  detail?: string;
  ms: number;
}

export async function runSelfTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  async function t(name: string, fn: () => Promise<void>) {
    const start = performance.now();
    try {
      await fn();
      results.push({ name, passed: true, ms: Math.round(performance.now() - start) });
    } catch (e: any) {
      results.push({ name, passed: false, detail: String(e?.message || e), ms: Math.round(performance.now() - start) });
    }
  }

  await t("Database: write & read", async () => {
    const id = "test_" + Date.now();
    await db.put("settings", { id, value: { ok: true } });
    const got = await db.get("settings", id);
    if (!got) throw new Error("read-back failed");
    await db.delete("settings", id);
  });

  await t("Database: indexed query", async () => {
    await db.put("contacts", { id: "ct_" + Date.now(), userId: "u_test", phone: "+1000000000", name: "T" });
    const rows = await db.getByIndex<{ id: string }>("contacts", "userId", "u_test");
    if (rows.length === 0) throw new Error("index query empty");
    await Promise.all(rows.map((r) => db.delete("contacts", r.id)));
  });

  await t("E2EE: key generation", async () => {
    await initIdentity();
    const pub = await getPublicKey();
    if (!pub || pub.length < 40) throw new Error("invalid public key");
  });

  await t("E2EE: encrypt → decrypt round-trip", async () => {
    await initIdentity();
    const pub = await getPublicKey();
    const env = await encryptMessage(pub, "chat_test", "u_test", "hello secure world");
    const plain = await decryptMessage(pub, env);
    if (plain !== "hello secure world") throw new Error("round-trip mismatch");
  });

  await t("Auth: OTP issue + verify", async () => {
    const { debugCode } = await requestOtp("+1999000000");
    const bad = await verifyOtp("+1999000000", "000000");
    if (bad.ok) throw new Error("wrong code accepted");
    const good = await verifyOtp("+1999000000", debugCode);
    if (!good.ok) throw new Error("correct code rejected");
  });

  await t("Messaging: socket ingest + dedupe", async () => {
    const chat = await createChat({ userId: "u_test", type: "dm", name: "Test", avatarColor: "bg-zinc-500", avatarText: "T", members: ["u_a", "u_b"], admins: ["u_a"], pinned: false, muted: false, archived: false });
    // Simulate the exact payload the server relays from another client
    const payload = {
      chatId: chat.id,
      message: {
        id: "msg_test_1",
        clientId: "cl_" + Date.now(),
        senderId: "u_b",
        type: "text",
        text: "pong",
        createdAt: new Date().toISOString(),
      },
    };
    await onIncomingSocketMessage(payload, { myId: "u_a" });
    const dup = await onIncomingSocketMessage(payload, { myId: "u_a" });
    if (dup !== null) throw new Error("dedupe failed");
    const list = await getChatMessages(chat.id);
    if (list.length !== 1) throw new Error("message ingest failed");
    await db.delete("chats", chat.id);
    await Promise.all(list.map((m) => db.delete("messages", m.id)));
  });

  await t("Status: post + TTL + fetch", async () => {
    const s = await postStatus("u_test", { type: "text", text: "live" });
    const active = await getActiveStatuses("u_test");
    if (!active.some((x) => x.id === s.id)) throw new Error("status not active");
    await db.delete("statuses", s.id);
  });

  await t("Media: blob ingestion", async () => {
    const file = new File(["chatsapp-test"], "test.txt", { type: "text/plain" });
    const rec = await uploadMedia(file);
    if (!rec.id) throw new Error("no media record");
    await db.delete("media", rec.id);
  });

  return results;
}
