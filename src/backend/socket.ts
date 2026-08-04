/**
 * Chatsapp Socket.IO client — the ONLY realtime transport.
 *
 * Connects to the Fastify+Socket.IO server at VITE_SOCKET_URL (default localhost:3001).
 * All received messages arrive via the "message:new" socket event emitted by the
 * server when ANOTHER connected client sends a message. No timers, no mock events.
 */

import { io, type Socket } from "socket.io-client";

export interface SocketEvents {
  "message:new": (payload: { chatId: string; message: any }) => void;
  "message:status": (payload: { chatId: string; messageId: string; status: "DELIVERED" | "READ" }) => void;
  typing: (payload: { chatId: string; userId: string; action: "start" | "stop" }) => void;
  presence: (payload: { userId: string; online: boolean }) => void;
  call: (payload: { chatId: string; kind: "ringing" | "missed" | "ended"; callType?: "voice" | "video" }) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
}

// Default: same-origin Socket.IO path (works with the nginx proxy + docker stack).
// Override with VITE_SOCKET_URL for a separate realtime host.
const URL: string = (import.meta as any).env?.VITE_SOCKET_URL || "";

class SocketClient {
  private socket: Socket | null = null;
  private listeners = new Map<keyof SocketEvents, Set<Function>>();
  private reconnectTimer: any = null;
  private attempts = 0;

  connect(token: string): void {
    void token; // token is handed to socket.io via auth below
    if (this.socket) this.socket.disconnect();
    this.socket = io(URL, { auth: { token }, transports: ["websocket", "polling"] });
    this.socket.on("connect", () => {
      this.attempts = 0;
      this.emitLocal("connect");
    });
    this.socket.on("disconnect", (reason) => this.emitLocal("disconnect", reason));
    this.socket.on("connect_error", () => {
      // exponential backoff handled by socket.io internally; track attempts
      this.attempts++;
      void this.attempts;
    });
    this.socket.on("message:new", (p) => this.emitLocal("message:new", p));
    this.socket.on("message:status", (p) => this.emitLocal("message:status", p));
    this.socket.on("typing", (p) => this.emitLocal("typing", p));
    this.socket.on("presence", (p) => this.emitLocal("presence", p));
    this.socket.on("call", (p) => this.emitLocal("call", p));
  }

  joinChats(chatIds: string[]): void {
    this.socket?.emit("chat:join", chatIds);
  }

  /** Emit a send with ack — the server persists with Prisma and relays. */
  sendMessage(payload: {
    clientId: string;
    chatId: string;
    text: string;
    type?: string;
    envelope?: { iv: string; cipher: string; aad: string };
    mediaId?: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error("offline"));
        return;
      }
      const timeout = setTimeout(() => reject(new Error("ack timeout")), 8000);
      this.socket.emit("message:send", payload, (res: any) => {
        clearTimeout(timeout);
        if (res?.error) reject(new Error(res.error));
        else resolve(res);
      });
    });
  }

  sendStatus(chatId: string, messageId: string, status: "DELIVERED" | "READ"): void {
    this.socket?.emit("message:status", { chatId, messageId, status });
  }

  sendTyping(chatId: string, action: "start" | "stop"): void {
    this.socket?.emit("typing", { chatId, action });
  }

  emit(event: string, payload: any): void {
    this.socket?.emit(event, payload);
  }

  on<K extends keyof SocketEvents>(event: K, fn: SocketEvents[K]): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn as Function);
    return () => this.listeners.get(event)?.delete(fn as Function);
  }

  get connected(): boolean {
    return this.socket?.connected ?? false;
  }

  dispose(): void {
    clearTimeout(this.reconnectTimer);
    this.socket?.disconnect();
    this.listeners.clear();
  }

  private emitLocal<K extends keyof SocketEvents>(event: K, ...args: any[]): void {
    this.listeners.get(event)?.forEach((fn) => (fn as Function)(...args));
  }
}

export const socketClient = new SocketClient();
export { URL as SOCKET_URL };
