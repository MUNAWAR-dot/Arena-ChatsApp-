/**
 * Chatsapp Realtime Server (Node.js + ws).
 *
 * Production WebSocket gateway: relays typed events between connected clients
 * with connection tracking, heartbeats, and broadcast rooms (chatId).
 *
 * Run:  node deployment/ws-server.mjs   (or via docker-compose)
 */
import { WebSocketServer, WebSocket } from "ws";

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

/** rooms: chatId -> Set<ws> */
const rooms = new Map();
const clients = new Map(); // ws -> { userId, rooms }

function joinRoom(ws, chatId) {
  if (!rooms.has(chatId)) rooms.set(chatId, new Set());
  rooms.get(chatId).add(ws);
  const info = clients.get(ws) || { userId: null, rooms: new Set() };
  info.rooms.add(chatId);
  clients.set(ws, info);
}

function leaveRoom(ws, chatId) {
  rooms.get(chatId)?.delete(ws);
  if (rooms.get(chatId)?.size === 0) rooms.delete(chatId);
}

wss.on("connection", (ws) => {
  clients.set(ws, { userId: null, rooms: new Set() });
  ws.isAlive = true;
  ws.on("pong", () => (ws.isAlive = true));

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "pong", ts: Date.now() }));
      return;
    }
    if (msg.type === "auth") {
      const info = clients.get(ws);
      info.userId = msg.userId;
      (msg.chatIds || []).forEach((c) => joinRoom(ws, c));
      return;
    }
    // Relay to the chat room (everyone but sender)
    const room = rooms.get(msg.chatId);
    if (room) {
      const payload = JSON.stringify({ ...msg, ts: Date.now() });
      room.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
    // Also deliver status echoes back to sender
    if (msg.type === "message:status") {
      ws.send(JSON.stringify(msg));
    }
  });

  ws.on("close", () => {
    const info = clients.get(ws);
    if (info) info.rooms.forEach((c) => leaveRoom(ws, c));
    clients.delete(ws);
  });
});

// Heartbeat sweep every 30s
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

console.log(`[chatsapp] realtime server listening on :${PORT}`);
