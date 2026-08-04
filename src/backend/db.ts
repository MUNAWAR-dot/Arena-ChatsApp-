/**
 * Chatsapp Database — real persistent storage layer.
 * Uses IndexedDB with named indexes, transactions, and schema versioning.
 * This is NOT a mock: data survives reloads, is queryable via indexes,
 * and is shared across tabs through the same origin.
 */

const DB_NAME = "chatsapp-db";
const DB_VERSION = 6;

export type StoreName =
  | "users"
  | "sessions"
  | "devices"
  | "contacts"
  | "chats"
  | "messages"
  | "media"
  | "statuses"
  | "notifications"
  | "reactions"
  | "calls"
  | "settings"
  | "privacy"
  | "blocked"
  | "reports"
  | "presence"
  | "outbox"; // offline send queue

const SCHEMA: Record<StoreName, { key: string; indexes?: [string, string][] }> = {
  users: { key: "id", indexes: [["phone", "phone"], ["username", "username"]] },
  sessions: { key: "id", indexes: [["userId", "userId"], ["expiresAt", "expiresAt"]] },
  devices: { key: "id", indexes: [["sessionId", "sessionId"]] },
  contacts: { key: "id", indexes: [["userId", "userId"], ["phone", "phone"], ["favorite", "favorite"]] },
  chats: { key: "id", indexes: [["userId", "userId"], ["updatedAt", "updatedAt"], ["pinned", "pinned"], ["archived", "archived"]] },
  messages: { key: "id", indexes: [["chatId", "chatId"], ["clientId", "clientId"], ["createdAt", "createdAt"], ["status", "status"], ["type", "type"], ["senderId", "senderId"]] },
  media: { key: "id", indexes: [["messageId", "messageId"], ["chatId", "chatId"], ["type", "type"]] },
  statuses: { key: "id", indexes: [["userId", "userId"], ["expiresAt", "expiresAt"]] },
  notifications: { key: "id", indexes: [["userId", "userId"], ["read", "read"], ["createdAt", "createdAt"]] },
  reactions: { key: "id", indexes: [["messageId", "messageId"]] },
  calls: { key: "id", indexes: [["userId", "userId"], ["createdAt", "createdAt"]] },
  settings: { key: "id" },
  privacy: { key: "id" },
  blocked: { key: "id", indexes: [["userId", "userId"]] },
  reports: { key: "id", indexes: [["userId", "userId"]] },
  presence: { key: "id", indexes: [["userId", "userId"]] },
  outbox: { key: "id", indexes: [["createdAt", "createdAt"], ["status", "status"]] },
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      (Object.keys(SCHEMA) as StoreName[]).forEach((store) => {
        if (!db.objectStoreNames.contains(store)) {
          const def = SCHEMA[store];
          const os = db.createObjectStore(store, { keyPath: def.key });
          (def.indexes || []).forEach(([name, key]) => os.createIndex(name, key));
        }
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const req = fn(t.objectStore(store));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export const db = {
  put<T extends { id: string }>(store: StoreName, value: T): Promise<string> {
    return tx(store, "readwrite", (s) => s.put(value) as IDBRequest<string>);
  },
  get<T>(store: StoreName, id: string): Promise<T | undefined> {
    return tx(store, "readonly", (s) => s.get(id) as IDBRequest<T>);
  },
  getAll<T>(store: StoreName): Promise<T[]> {
    return tx(store, "readonly", (s) => s.getAll() as IDBRequest<T[]>);
  },
  delete(store: StoreName, id: string): Promise<void> {
    return tx(store, "readwrite", (s) => s.delete(id) as IDBRequest<void>);
  },
  clear(store: StoreName): Promise<void> {
    return tx(store, "readwrite", (s) => s.clear() as IDBRequest<void>);
  },
  getByIndex<T>(store: StoreName, index: string, value: any): Promise<T[]> {
    return openDB().then(
      (db) =>
        new Promise<T[]>((resolve, reject) => {
          const t = db.transaction(store, "readonly");
          const req = t.objectStore(store).index(index).getAll(value);
          req.onsuccess = () => resolve(req.result as T[]);
          req.onerror = () => reject(req.error);
        })
    );
  },
  getRange<T>(store: StoreName, index: string, lower: any, upper?: any): Promise<T[]> {
    return openDB().then(
      (db) =>
        new Promise<T[]>((resolve, reject) => {
          const t = db.transaction(store, "readonly");
          const range = upper === undefined ? IDBKeyRange.lowerBound(lower) : IDBKeyRange.bound(lower, upper);
          const req = t.objectStore(store).index(index).getAll(range);
          req.onsuccess = () => resolve(req.result as T[]);
          req.onerror = () => reject(req.error);
        })
    );
  },
  /** Multi-store atomic write within one transaction. */
  write(ops: { store: StoreName; value: any }[]): Promise<void> {
    return openDB().then(
      (db) =>
        new Promise<void>((resolve, reject) => {
          const stores = Array.from(new Set(ops.map((o) => o.store)));
          const t = db.transaction(stores, "readwrite");
          ops.forEach((o) => t.objectStore(o.store).put(o.value));
          t.oncomplete = () => resolve();
          t.onerror = () => reject(t.error);
        })
    );
  },
  async integrityCheck(): Promise<{ store: StoreName; count: number }[]> {
    const out: { store: StoreName; count: number }[] = [];
    for (const s of Object.keys(SCHEMA) as StoreName[]) {
      const all = await db.getAll(s);
      out.push({ store: s, count: all.length });
    }
    return out;
  },
  async reset(): Promise<void> {
    const d = await openDB();
    await Promise.all((Object.keys(SCHEMA) as StoreName[]).map((s) => db.clear(s)));
    void d;
  },
};
