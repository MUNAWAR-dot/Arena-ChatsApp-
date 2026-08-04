/**
 * Chatsapp Backend Facade — the single entry point for the frontend.
 * Exposes REST-style methods backed by the real services below.
 */

import { db } from "./db";
import {
  requestOtp, verifyOtp, requestEmailOtp, verifyEmailOtp,
  signIn, validateSession, refreshSession, signInWithGoogle,
  loadGoogleIdentity, renderGoogleButton,
  revokeSession, revokeAllSessions, deleteAccount, createSession,
} from "./auth";
import { initIdentity, getPublicKey, secureToken } from "./crypto";
import {
  sendMessage, onIncomingSocketMessage, onIncomingStatus, getChatMessages, startOutboxMonitor,
} from "./messages";
import {
  createChat, createGroup, getChats, updateChat, touchChat,
  addGroupMember, removeGroupMember, joinViaInvite, resetInviteLink, searchChats,
} from "./chats";
import { postStatus, getActiveStatuses, getAllActiveStatuses, viewStatus, deleteStatus, startStatusCleanup } from "./status";
import { uploadMedia, getMedia, deleteMedia } from "./media";
import {
  initPresence, ensureNotificationPermission, showNotification,
  persistNotification, markNotificationsRead, setBadgeCount,
} from "./presence";

export const api = {
  auth: {
    requestOtp,
    verifyOtp,
    requestEmailOtp,
    verifyEmailOtp,
    signIn,
    validateSession,
    refreshSession,
    signInWithGoogle,
    loadGoogleIdentity,
    renderGoogleButton,
    revokeSession,
    revokeAllSessions,
    deleteAccount,
    createSession,
  },
  crypto: {
    initIdentity,
    getPublicKey,
    secureToken,
  },
  messages: {
    sendMessage,
    onIncomingSocketMessage,
    onIncomingStatus,
    getChatMessages,
    startOutboxMonitor,
  },
  chats: {
    createChat,
    createGroup,
    getChats,
    updateChat,
    touchChat,
    addGroupMember,
    removeGroupMember,
    joinViaInvite,
    resetInviteLink,
    searchChats,
  },
  status: {
    postStatus,
    getActiveStatuses,
    getAllActiveStatuses,
    viewStatus,
    deleteStatus,
    startStatusCleanup,
  },
  media: {
    uploadMedia,
    getMedia,
    deleteMedia,
  },
  presence: {
    initPresence,
    ensureNotificationPermission,
    showNotification,
    persistNotification,
    markNotificationsRead,
    setBadgeCount,
  },
  db,
};

export type Api = typeof api;

/**
 * Bootstrap backend services:
 *  - outbox monitor (real retry of failed sends)
 *  - status cleanup (expired stories)
 * Socket connection is established separately via socketClient.connect(token)
 * once a session exists (see App.tsx).
 */
export function bootstrapBackend(_wsUrl?: string) {
  const stopOutbox = startOutboxMonitor();
  const stopCleanup = startStatusCleanup();
  return () => {
    stopOutbox();
    stopCleanup();
  };
}
