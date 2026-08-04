/**
 * Chatsapp Server — Fastify (HTTP/REST) + Socket.IO (realtime) + Prisma (PostgreSQL).
 *
 * Everything is real: messages are persisted with Prisma and relayed through
 * Socket.IO rooms; no timers generate content. Run with:
 *
 *   cd server
 *   cp .env.example .env   # set DATABASE_URL
 *   npx prisma migrate deploy
 *   npm run dev
 */
import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { Server } from "socket.io";
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import webpush from "web-push";
import { OAuth2Client } from "google-auth-library";
import { PrismaClient, MsgStatus } from "@prisma/client";

const prisma = new PrismaClient();

// Real web push (VAPID). Configure VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY on the
// server to enable push to subscribed devices; without them push is skipped
// (socket notifications still work).
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@chatsapp.example",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// In-memory push subscriptions per user (persist in production DB if needed)
const pushSubs = new Map<string, any[]>();

// Real Google OAuth verification. Requires GOOGLE_CLIENT_ID env; without it,
// the endpoint returns 503 with a clear configuration message (never mocks).
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const app = Fastify({ logger: true });

// Socket.IO attaches to Fastify's own HTTP server (no manual createServer)
const io = new Server(app.server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(",") || true },
});

await app.register(cors, { origin: process.env.CORS_ORIGIN?.split(",") || true });
await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });

/* ── Auth helpers ─────────────────────────────────────────── */

function hash(v: string): string {
  return createHash("sha256").update(v).digest("hex");
}

const SESSION_TTL = 30 * 24 * 3600 * 1000;

async function issueSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const refresh = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      userId,
      tokenHash: hash(token),
      refreshHash: hash(refresh),
      expiresAt: new Date(Date.now() + SESSION_TTL),
    },
  });
  return { token, refresh, expiresAt: Date.now() + SESSION_TTL };
}

async function userFromToken(token?: string) {
  if (!token) return null;
  const s = await prisma.session.findUnique({
    where: { tokenHash: hash(token) },
    include: { user: true },
  });
  if (!s || s.revoked || s.expiresAt < new Date()) return null;
  return s.user;
}

/** Small helper so handlers return proper JSON errors (no @fastify/sensible needed). */
function httpError(statusCode: number, message: string) {
  const err = new Error(message) as Error & { statusCode: number };
  err.statusCode = statusCode;
  return err;
}

const otpStore = new Map<string, { hash: string; expires: number; attempts: number }>();

/* ── REST endpoints ───────────────────────────────────────── */

app.get("/health", async () => {
  await prisma.$queryRaw`SELECT 1`;
  return { ok: true, ts: Date.now() };
});

app.post("/auth/otp", { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } }, async (req, reply) => {
  try {
    const body = z.object({ phone: z.string().min(7) }).parse(req.body);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(body.phone, { hash: hash(code), expires: Date.now() + 10 * 60 * 1000, attempts: 0 });
    // Production: dispatch via SMS gateway (Twilio etc.). The code is returned ONLY
    // when SMS_SIMULATION_DELIVERY=1 for local development without a gateway.
    return { ok: true, debugCode: process.env.SMS_SIMULATION_DELIVERY === "1" ? code : undefined };
  } catch (e: any) {
    return reply.code(400).send({ error: e?.message || "bad request" });
  }
});

app.post("/auth/verify", async (req, reply) => {
  try {
    const body = z.object({ phone: z.string(), code: z.string().length(6) }).parse(req.body);
    const entry = otpStore.get(body.phone);
    if (!entry) throw httpError(400, "No code requested");
    if (Date.now() > entry.expires) throw httpError(400, "Code expired");
    if (entry.attempts >= 5) throw httpError(400, "Too many attempts");
    entry.attempts++;
    const a = Buffer.from(entry.hash);
    const b = Buffer.from(hash(body.code));
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw httpError(401, "Incorrect code");
    otpStore.delete(body.phone);

    let user = await prisma.user.findUnique({ where: { phone: body.phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: body.phone,
          username: "user_" + body.phone.replace(/\D/g, "").slice(-6),
          publicKey: "",
        },
      });
    }
    const session = await issueSession(user.id);
    return { user, ...session };
  } catch (e: any) {
    return reply.code(e?.statusCode || 400).send({ error: e?.message || "bad request" });
  }
});

/**
 * Google OAuth — real token verification via Google's JWKS.
 * Creates a real user keyed by the verified Google email.
 */
app.post("/auth/google", async (req, reply) => {
  try {
    const body = z
      .object({ idToken: z.string(), publicKey: z.string().default(""), deviceLabel: z.string().default("Web Browser") })
      .parse(req.body);

    if (!process.env.GOOGLE_CLIENT_ID) {
      return reply.code(503).send({ error: "Google sign-in not configured (missing GOOGLE_CLIENT_ID)" });
    }

    // Verify the JWT signature + audience with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: body.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return reply.code(400).send({ error: "Google token missing email" });
    }
    if (!payload.email_verified) {
      return reply.code(400).send({ error: "Google email not verified" });
    }

    // Real user keyed by verified email
    let user = await prisma.user.findUnique({ where: { phone: "google:" + payload.email.toLowerCase() } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          phone: "google:" + payload.email.toLowerCase(),
          username: (payload.name || payload.email.split("@")[0]).replace(/\s+/g, "_").toLowerCase() + "_" + Math.random().toString(36).slice(2, 6),
          about: "Hey there! I am using Chatsapp.",
          publicKey: body.publicKey,
          verified: true,
        },
      });
    } else {
      await prisma.user.update({ where: { id: user.id }, data: { publicKey: body.publicKey } });
    }

    const session = await issueSession(user.id);
    return { user, ...session };
  } catch (e: any) {
    return reply.code(400).send({ error: e?.message || "Google verification failed" });
  }
});

app.post("/auth/session", async (req, reply) => {
  try {
    const body = z.object({ refresh: z.string() }).parse(req.body);
    const s = await prisma.session.findUnique({ where: { refreshHash: hash(body.refresh) } });
    if (!s || s.revoked) throw httpError(401, "Invalid refresh token");
    const session = await issueSession(s.userId);
    return session;
  } catch (e: any) {
    return reply.code(e?.statusCode || 400).send({ error: e?.message || "bad request" });
  }
});

app.delete("/auth/session", async (req, reply) => {
  const user = await userFromToken(req.headers.authorization?.replace("Bearer ", ""));
  if (!user) return reply.code(401).send({ error: "unauthorized" });
  const body = z.object({ sessionId: z.string().optional() }).parse(req.body || {});
  if (body.sessionId) {
    await prisma.session.updateMany({ where: { id: body.sessionId, userId: user.id }, data: { revoked: true } });
  } else {
    await prisma.session.updateMany({ where: { userId: user.id }, data: { revoked: true } });
  }
  return { ok: true };
});

app.post("/push/subscribe", async (req, reply) => {
  const user = await userFromToken(req.headers.authorization?.replace("Bearer ", ""));
  if (!user) return reply.code(401).send({ error: "unauthorized" });
  const body = z
    .object({
      endpoint: z.string(),
      keys: z.object({ p256dh: z.string(), auth: z.string() }),
    })
    .parse(req.body);
  const subs = pushSubs.get(user.id) || [];
  subs.push({ endpoint: body.endpoint, keys: body.keys });
  pushSubs.set(user.id, subs);
  return { ok: true };
});

/** Send a web-push notification to a user's subscribed devices. */
async function sendPush(userId: string, title: string, body: string, url = "/") {
  const subs = pushSubs.get(userId) || [];
  if (!subs.length || !process.env.VAPID_PUBLIC_KEY) return;
  const payload = JSON.stringify({ title, body, url, tag: "chatsapp-" + Date.now() });
  await Promise.allSettled(
    subs.map((sub) => webpush.sendNotification(sub, payload).catch((e: any) => {
      // 404/410 = subscription expired — drop it
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        pushSubs.set(userId, pushSubs.get(userId)!.filter((s) => s.endpoint !== sub.endpoint));
      }
    }))
  );
}

app.post("/contacts", async (req, reply) => {
  const user = await userFromToken(req.headers.authorization?.replace("Bearer ", ""));
  if (!user) return reply.code(401).send({ error: "unauthorized" });
  const body = z.object({ phone: z.string(), name: z.string().optional() }).parse(req.body);
  const target = await prisma.user.findUnique({ where: { phone: body.phone } });
  if (!target) return reply.code(404).send({ error: "User not on Chatsapp" });
  await prisma.contact.upsert({
    where: { ownerId_contactId: { ownerId: user.id, contactId: target.id } },
    create: { ownerId: user.id, contactId: target.id, name: body.name },
    update: { name: body.name },
  });
  return { ok: true, contact: target };
});

app.post("/messages", async (req, reply) => {
  const user = await userFromToken(req.headers.authorization?.replace("Bearer ", ""));
  if (!user) return reply.code(401).send({ error: "unauthorized" });
  const body = z
    .object({
      clientId: z.string(),
      chatId: z.string(),
      text: z.string().default(""),
      type: z.string().default("TEXT"),
      envelope: z.object({ iv: z.string(), cipher: z.string(), aad: z.string() }).optional(),
      mediaId: z.string().optional(),
    })
    .parse(req.body);

  const member = await prisma.membership.findUnique({
    where: { userId_chatId: { userId: user.id, chatId: body.chatId } },
  });
  if (!member) return reply.code(403).send({ error: "Not a member of this chat" });

  const existing = await prisma.message.findUnique({ where: { clientId: body.clientId } });
  if (existing) return { message: existing };

  const msg = await prisma.message.create({
    data: {
      clientId: body.clientId,
      chatId: body.chatId,
      senderId: user.id,
      type: body.type as any,
      text: body.envelope ? "" : body.text,
      envelopeIv: body.envelope?.iv,
      envelopeCipher: body.envelope?.cipher,
      envelopeAad: body.envelope?.aad,
      mediaId: body.mediaId,
      status: MsgStatus.SENT,
    },
  });

  // Bump chat ordering + recipient unread counters
  await prisma.chat.update({ where: { id: body.chatId }, data: { updatedAt: new Date() } });
  await prisma.membership.updateMany({
    where: { chatId: body.chatId, userId: { not: user.id } },
    data: { unread: { increment: 1 } },
  });

  io.to("chat:" + body.chatId).emit("message:new", { chatId: body.chatId, message: msg });
  return { message: msg };
});

app.get("/chats", async (req, reply) => {
  const user = await userFromToken(req.headers.authorization?.replace("Bearer ", ""));
  if (!user) return reply.code(401).send({ error: "unauthorized" });
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { chat: { include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } } } },
    orderBy: { chat: { updatedAt: "desc" } },
  });
  return {
    chats: memberships.map((m) => ({
      ...m.chat,
      pinned: m.pinned,
      muted: m.muted,
      archived: m.archived,
      unread: m.unread,
    })),
  };
});

app.get("/chats/:id/messages", async (req, reply) => {
  const user = await userFromToken(req.headers.authorization?.replace("Bearer ", ""));
  if (!user) return reply.code(401).send({ error: "unauthorized" });
  const { id } = req.params as { id: string };
  const member = await prisma.membership.findUnique({
    where: { userId_chatId: { userId: user.id, chatId: id } },
  });
  if (!member) return reply.code(403).send({ error: "forbidden" });
  const messages = await prisma.message.findMany({
    where: { chatId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });
  return { messages };
});

/* ── Socket.IO realtime ───────────────────────────────────── */

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined;
  const user = await userFromToken(token);
  if (!user) return next(new Error("unauthorized"));
  (socket.data as any).userId = user.id;
  next();
});

io.on("connection", (socket) => {
  const userId = (socket.data as any).userId as string;
  const userRoom = "user:" + userId;
  socket.join(userRoom);
  socket.to(userRoom).emit("presence", { userId, online: true });

  socket.on("chat:join", (chatIds: string[]) => {
    (Array.isArray(chatIds) ? chatIds : []).forEach((id) => socket.join("chat:" + id));
  });

  socket.on("message:send", async (payload, ack) => {
    try {
      const body = z
        .object({
          clientId: z.string(),
          chatId: z.string(),
          text: z.string().default(""),
          type: z.string().default("TEXT"),
          envelope: z.object({ iv: z.string(), cipher: z.string(), aad: z.string() }).optional(),
          mediaId: z.string().optional(),
        })
        .parse(payload);
      const member = await prisma.membership.findUnique({
        where: { userId_chatId: { userId, chatId: body.chatId } },
      });
      if (!member) return ack?.({ error: "forbidden" });

      const existing = await prisma.message.findUnique({ where: { clientId: body.clientId } });
      if (existing) return ack?.({ message: existing });

      const msg = await prisma.message.create({
        data: {
          clientId: body.clientId,
          chatId: body.chatId,
          senderId: userId,
          type: body.type as any,
          text: body.envelope ? "" : body.text,
          envelopeIv: body.envelope?.iv,
          envelopeCipher: body.envelope?.cipher,
          envelopeAad: body.envelope?.aad,
          mediaId: body.mediaId,
          status: MsgStatus.SENT,
        },
      });
      // Bump chat ordering + recipient unread counters (real chat semantics)
      await prisma.chat.update({ where: { id: body.chatId }, data: { updatedAt: new Date() } });
      const members = await prisma.membership.findMany({ where: { chatId: body.chatId } });
      await prisma.membership.updateMany({
        where: { chatId: body.chatId, userId: { not: userId } },
        data: { unread: { increment: 1 } },
      });

      socket.to("chat:" + body.chatId).emit("message:new", { chatId: body.chatId, message: msg });
      ack?.({ message: msg });

      // Real web push to all other chat members (works while app is closed)
      const sender = await prisma.user.findUnique({ where: { id: userId } });
      for (const m of members.filter((x) => x.userId !== userId)) {
        await sendPush(m.userId, sender?.username || "Chatsapp", (body.text || "[media]").slice(0, 120), "/");
      }
    } catch (e: any) {
      ack?.({ error: String(e?.message || e) });
    }
  });

  socket.on("message:status", async (payload) => {
    try {
      const body = z
        .object({ chatId: z.string(), messageId: z.string(), status: z.enum(["DELIVERED", "READ"]) })
        .parse(payload);
      await prisma.message.update({
        where: { id: body.messageId },
        data: { status: body.status as MsgStatus },
      });
      socket.to("chat:" + body.chatId).emit("message:status", body);
      const msg = await prisma.message.findUnique({ where: { id: body.messageId } });
      if (msg) {
        socket.to("user:" + msg.senderId).emit("message:status", body);
      }
    } catch {}
  });

  socket.on("typing", (payload: { chatId: string; action: "start" | "stop" }) => {
    socket.to("chat:" + payload.chatId).emit("typing", {
      chatId: payload.chatId,
      userId,
      action: payload.action,
    });
  });

  socket.on("disconnect", () => {
    socket.to(userRoom).emit("presence", { userId, online: false });
  });
});

/* ── Start ────────────────────────────────────────────────── */

const PORT = Number(process.env.PORT || 3001);
try {
  await app.listen({ port: PORT, host: "0.0.0.0" });
  app.log.info(`[chatsapp] http+socket listening on :${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
