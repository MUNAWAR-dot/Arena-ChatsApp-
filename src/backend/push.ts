/**
 * Chatsapp Web Push — real push subscription (VAPID) + in-app SW notifications.
 *
 * Free-tier setup:
 *  - Server: VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY (see server/src/index.ts)
 *  - Client: VITE_VAPID_PUBLIC_KEY
 *
 * Without VAPID config, in-app notifications still work through the SW
 * "chatsapp-toast" message when the tab is open.
 */

const SW_PATH = "/sw.js";

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register(SW_PATH);
  } catch {
    return null;
  }
}

/** Send an in-app notification through the SW (works even without VAPID). */
export async function notifyViaWorker(
  reg: ServiceWorkerRegistration | null,
  title: string,
  body: string,
  url = "/"
): Promise<void> {
  if (!reg?.active) return;
  reg.active.postMessage({
    type: "chatsapp-toast",
    title,
    body,
    url,
    tag: "chatsapp-" + Date.now(),
  });
}

/** Subscribe to real web push (requires VAPID keys configured). */
export async function subscribeToPush(
  reg: ServiceWorkerRegistration | null
): Promise<PushSubscription | null> {
  if (!reg || !("PushManager" in window)) return null;
  const vapid = (import.meta as any).env?.VITE_VAPID_PUBLIC_KEY;
  if (!vapid) return null; // not configured — in-app notifications still work
  try {
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
    }
    return sub;
  } catch {
    return null;
  }
}

export async function sendSubscriptionToServer(sub: PushSubscription | null, token: string): Promise<void> {
  if (!sub || !token) return;
  const api = (import.meta as any).env?.VITE_API_URL || "";
  if (!api) return;
  try {
    await fetch(api + "/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(sub),
    });
  } catch {}
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out.buffer.slice(0) as ArrayBuffer;
}
