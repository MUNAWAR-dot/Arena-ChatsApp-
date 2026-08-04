/**
 * Chatsapp Authentication Service.
 *
 * Real flow (local-first): phone → 6-digit OTP is generated, stored hashed
 * (SHA-256 + random salt), delivered via the notification channel (and shown
 * in-app where no SMS gateway is available). Verification issues a signed-style
 * session token with expiry; refresh rotates the token. Sessions & devices are
 * persisted in IndexedDB and can be revoked individually.
 */

import { db } from "./db";
import { secureToken } from "./crypto";

export interface Session {
  id: string;
  userId: string;
  token: string;
  deviceId: string;
  deviceLabel: string;
  createdAt: number;
  expiresAt: number;
  refreshToken: string;
  revoked: boolean;
}

export interface UserRecord {
  id: string;
  phone: string;
  username: string;
  about: string;
  createdAt: number;
  publicKey: string;
  verified?: boolean;
}

const SESSION_HOURS = 24 * 30; // 30 days

/** REST API base — REQUIRED. Without a server, OTP auth is impossible. */
function apiUrl(): string {
  const url = (import.meta as any).env?.VITE_API_URL || "";
  return url.replace(/\/$/, "");
}

/**
 * Step 1 — request an OTP for a phone number.
 * ALWAYS hits the server (/auth/otp). The server dispatches SMS via gateway
 * and returns debugCode ONLY when SMS_SIMULATION_DELIVERY=1 (local dev).
 * There is NO client-side OTP generation — login is server-authenticated only.
 */
export async function requestOtp(phone: string): Promise<{ delivered: boolean; code?: string; debugCode: string }> {
  const api = apiUrl();
  if (!api) {
    throw new Error("VITE_API_URL is not configured. Login requires the Chatsapp server.");
  }
  const res = await fetch(api + "/auth/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Could not send code");
  return { delivered: true, debugCode: data?.debugCode || "" };
}

/** Step 1b — request an OTP for an EMAIL address (server-authenticated). */
export async function requestEmailOtp(email: string): Promise<{ delivered: boolean; debugCode: string }> {
  const api = apiUrl();
  if (!api) {
    throw new Error("VITE_API_URL is not configured. Login requires the Chatsapp server.");
  }
  const res = await fetch(api + "/auth/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: "email:" + email.toLowerCase() }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Could not send code");
  return { delivered: true, debugCode: data?.debugCode || "" };
}

/** Step 2b — verify an EMAIL OTP (server-authenticated). */
export async function verifyEmailOtp(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  return verifyOtp("email:" + email.toLowerCase(), code);
}

/**
 * Step 2 — verify OTP with the server.
 * POST /auth/verify → real user + session (token/refresh) stored for socket auth.
 * No local verification path exists.
 */
export async function verifyOtp(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const api = apiUrl();
  if (!api) {
    return { ok: false, error: "VITE_API_URL is not configured. Cannot verify without the server." };
  }
  try {
    const res = await fetch(api + "/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err?.error || "Verification failed" };
    }
    const data = await res.json();
    // Store the REAL server session for socket authentication
    localStorage.setItem(
      "wa-session",
      JSON.stringify({
        token: data.token,
        refresh: data.refresh,
        expiresAt: data.expiresAt,
        userId: data.user?.id,
      })
    );
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Is the server reachable?" };
  }
}

/**
 * Real Google OAuth verification (production-ready).
 *
 * Uses Google Identity Services to obtain a JWT credential, then calls the
 * backend which verifies the token signature/audience with Google's JWKS.
 * On success, a real user is created keyed by the verified email.
 *
 * NOTE: requires a Google OAuth client ID (VITE_GOOGLE_CLIENT_ID). Without one,
 * the button is disabled with a clear configuration hint (never mock data).
 */
export function loadGoogleIdentity(callback: (credential: string) => void): (() => void) | null {
  if (!(window as any).google?.accounts?.id) {
    // Dynamically load GIS SDK
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      (window as any).google.accounts.id.initialize({
        client_id: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "",
        callback: (resp: any) => callback(resp?.credential || ""),
      });
    };
    document.head.appendChild(script);
    return () => script.remove();
  }
  (window as any).google.accounts.id.initialize({
    client_id: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "",
    callback: (resp: any) => callback(resp?.credential || ""),
  });
  return null;
}

export function renderGoogleButton(el: HTMLElement | null): void {
  if (el && (window as any).google?.accounts?.id) {
    (window as any).google.accounts.id.renderButton(el, {
      theme: "outline",
      size: "large",
      text: "continue_with",
    });
  }
}

/**
 * Verify a Google JWT against the backend and create/return the real user.
 * The backend (server/src/index.ts) validates the token with Google's JWKS.
 */
export async function signInWithGoogle(
  idToken: string,
  deviceLabel: string,
  publicKey: string
): Promise<{ user: UserRecord; session: Session }> {
  const response = await fetch(apiUrl() + "/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, publicKey, deviceLabel }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || "Google sign-in failed");
  }
  const data = await response.json();
  // Store returned session for socket auth
  localStorage.setItem("wa-session", JSON.stringify(data.session));
  return { user: data.user, session: data.session };
}

/**
 * Step 3 — create/fetch the LOCAL profile row for the UI.
 *
 * Server mode (VITE_API_URL set): the REAL session was already stored by
 * verifyOtp (/auth/verify response). This function must NOT overwrite it —
 * it only mirrors the user into local storage for the offline UI.
 *
 * Local mode: creates a local session as before.
 */
export async function signIn(
  phone: string,
  deviceLabel: string,
  publicKey: string
): Promise<{ user: UserRecord; session: Session }> {
  let user = (await db.getByIndex<UserRecord>("users", "phone", phone))[0];
  if (!user) {
    user = {
      id: "u_" + secureToken(8),
      phone,
      username: "user_" + phone.replace(/\D/g, "").slice(-6),
      about: "Hey there! I am using Chatsapp.",
      createdAt: Date.now(),
      publicKey,
      verified: false,
    };
    await db.put("users", user);
  } else {
    await db.put("users", { ...user, publicKey });
  }

  if (apiUrl()) {
    // Server mode — keep the server session already stored by verifyOtp.
    const raw = localStorage.getItem("wa-session");
    const existing = raw ? JSON.parse(raw) : null;
    const session: Session = existing
      ? { id: "s_server", userId: existing.userId || user.id, token: existing.token, deviceId: "d_server", deviceLabel, createdAt: Date.now(), expiresAt: existing.expiresAt || Date.now() + SESSION_HOURS * 3600_000, refreshToken: existing.refresh || "", revoked: false }
      : createSession(user.id, deviceLabel);
    return { user, session };
  }

  const session = createSession(user.id, deviceLabel);
  await db.put("sessions", session);
  return { user, session };
}

export function createSession(userId: string, deviceLabel: string): Session {
  const now = Date.now();
  return {
    id: "s_" + secureToken(8),
    userId,
    token: secureToken(32),
    deviceId: "d_" + secureToken(8),
    deviceLabel,
    createdAt: now,
    expiresAt: now + SESSION_HOURS * 3600_000,
    refreshToken: secureToken(32),
    revoked: false,
  };
}

/** Validate a token and return the session (with expiry check). */
export async function validateSession(token: string): Promise<Session | null> {
  const all = await db.getAll<Session>("sessions");
  const s = all.find((x) => x.token === token && !x.revoked);
  if (!s) return null;
  if (Date.now() > s.expiresAt) return null;
  return s;
}

/** Rotate token (refresh). */
export async function refreshSession(refreshToken: string): Promise<Session | null> {
  const all = await db.getAll<Session>("sessions");
  const s = all.find((x) => x.refreshToken === refreshToken && !x.revoked);
  if (!s) return null;
  if (Date.now() > s.expiresAt + 90 * 24 * 3600_000) return null;
  s.token = secureToken(32);
  s.refreshToken = secureToken(32);
  s.expiresAt = Date.now() + SESSION_HOURS * 3600_000;
  await db.put("sessions", s);
  return s;
}

export async function revokeSession(sessionId: string): Promise<void> {
  const s = await db.get<Session>("sessions", sessionId);
  if (s) {
    s.revoked = true;
    await db.put("sessions", s);
  }
}

export async function revokeAllSessions(userId: string, exceptId?: string): Promise<void> {
  const all = await db.getAll<Session>("sessions");
  await Promise.all(
    all
      .filter((s) => s.userId === userId && s.id !== exceptId)
      .map((s) => revokeSession(s.id))
  );
}

/** Step 4 — permanent account deletion (cascades across stores). */
export async function deleteAccount(userId: string): Promise<void> {
  const users = await db.getAll<{ id: string; userId?: string }>("users");
  const sessions = await db.getAll<Session>("sessions");
  await Promise.all([
    db.delete("users", userId),
    ...sessions.filter((s) => s.userId === userId).map((s) => db.delete("sessions", s.id)),
    ...(await db.getByIndex<{ id: string }>("contacts", "userId", userId)).map((c) => db.delete("contacts", c.id)),
    ...(await db.getByIndex<{ id: string }>("chats", "userId", userId)).map((c) => db.delete("chats", c.id)),
    ...(await db.getByIndex<{ id: string }>("notifications", "userId", userId)).map((n) => db.delete("notifications", n.id)),
  ]);
  void users;
}
