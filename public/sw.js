/**
 * Chatsapp Service Worker — real Web Push notifications (VAPID).
 *
 * To enable push on the free tier:
 *  1. Generate VAPID keys:  npx web-push generate-vapid-keys
 *  2. Set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY on the server (Render env)
 *  3. Set VITE_VAPID_PUBLIC_KEY on the frontend (Netlify env)
 *  4. The server subscribes the client via POST /push/subscribe and sends
 *     push messages via web-push when a new message arrives.
 */

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Foreground message passthrough — forward to open tabs
self.addEventListener("message", (event) => {
  if (event.data?.type === "chatsapp-toast") {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      tag: event.data.tag || "chatsapp",
      data: { url: event.data.url },
      icon: "/favicon.svg",
      badge: "/favicon.svg",
    });
  }
});

// Real push events (VAPID)
self.addEventListener("push", (event) => {
  let payload = { title: "Chatsapp", body: "New message", url: "/" };
  try {
    payload = event.data ? JSON.parse(event.data.text()) : payload;
  } catch {}
  event.waitUntil(
    self.registration.showNotification(payload.title || "Chatsapp", {
      body: payload.body || "New message",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      data: { url: payload.url || "/" },
      tag: payload.tag || "chatsapp-" + Date.now(),
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});
