import { useEffect, useMemo, useState } from "react";
import { StoreProvider, useStore } from "./store";
import type { Status, Message } from "./data";
import { ThemeProvider } from "./theme";
import { ChatList } from "./screens/ChatList";
import { ChatView } from "./screens/ChatView";
import { Updates } from "./screens/Updates";
import { Calls } from "./screens/Calls";
import { Communities } from "./screens/Communities";
import { Settings, type SettingsTarget } from "./screens/Settings";
import { ContactInfo } from "./screens/ContactInfo";
import { CallScreen, ScreenShareOverlay } from "./screens/CallScreen";
import { IncomingCall } from "./screens/IncomingCall";
import { StatusViewer } from "./screens/StatusViewer";
import { BottomNav, type Tab } from "./components/BottomNav";
import { Menu } from "./components/Menu";
import { Welcome } from "./screens/Welcome";
import { NewChat } from "./screens/NewChat";
import { NewGroup } from "./screens/NewGroup";
import { CameraScreen } from "./screens/Camera";
import { ForwardScreen } from "./screens/Forward";
// Starred (deprecated) replaced by StarredByChat
import { LinkedDevices } from "./screens/LinkedDevices";
import { QRCodeScreen } from "./screens/QRCodeScreen";
import { Profile } from "./screens/Profile";
import { SearchScreen } from "./screens/SearchScreen";
import { Archived } from "./screens/Archived";
import { CreateStatus } from "./screens/CreateStatus";
import { MediaViewer } from "./screens/MediaViewer";
import { MediaGallery } from "./screens/MediaGallery";
import { Dialer } from "./screens/Dialer";
import { MessageInfo } from "./screens/MessageInfo";
import { ContactEditor } from "./screens/ContactEditor";
import {
  AccountSettings, PrivacySettings, NotificationSettings,
  ChatSettings, StorageSettings, WallpaperPicker, HelpScreen
} from "./screens/SubSettings";
import {
  BlockedContacts, DisappearingMessages, TwoStepVerification, AppLanguage,
  ChatBackup, AppLockSettings, Payments, BroadcastList, GroupMembers, AppLockScreen
} from "./screens/ExtraScreens";
import {
  StorageManager, ScheduledMessages, StatusViews, GroupEditor,
  AvatarCreator, NetworkBanner, SendPayment, ContactsList, ChatSearch
} from "./screens/MoreScreens";
import {
  BusinessTools, BusinessProfileEditor, CatalogEditor, QuickReplies, LabelsManager
} from "./screens/BusinessScreens";
import {
  ChatLockSetup, LockedChatsFolder, StatusArchive, SecurityCode, DisappearingChatTimer
} from "./screens/AdvancedScreens";
import { GroupCall } from "./screens/GroupCall";
import { PhotoViewer, CatalogBrowser, CartCheckout } from "./screens/ExtraFunctions";
import {
  OrderHistory, Birthdays, Reminders, SpamReport, OutOfOffice,
  GroupInviteLink, ChatThemePicker
} from "./screens/MoreFunctions";
import {
  PinnedMessages, CommonGroups, StatusPrivacy, MutedStatuses,
  ActiveSessions, GroupPermissionsScreen, VanishModeInfo, QRScanner,
  BackupEncryption, AudioRoom
} from "./screens/RealWhatsAppScreens";
import {
  CustomNotifications
} from "./screens/FinalScreens";
import {
  ConnectedAccounts, MultipleAccounts, DataExport, MoveChats
} from "./screens/AccountIntegrations";
import {
  WebQRPair, PrivacyOption, DeleteAccountFlow
} from "./screens/MoreFeatures";
import {
  SettingsSearch, HelpCenter, KeyboardShortcuts, ToolsScreen, AddToHomeScreen
} from "./screens/UltraScreens";
import { ChannelView } from "./screens/ChannelView";
import { ToastProvider } from "./components/Toast";
import { bootstrapBackend } from "./backend";
import { socketClient } from "./backend/socket";
import { onIncomingSocketMessage, onIncomingStatus } from "./backend/messages";
import { registerServiceWorker, subscribeToPush, sendSubscriptionToServer } from "./backend/push";
import {
  StorageCleanupWizard, BirthdayPopup, AppInfo, VoiceMiniPlayer,
  ProfilePhotoHistory, BetaProgram, StarredByChat
} from "./screens/MaxScreens";
import {
  StickerStore, ChannelAdminTools, GroupIconPicker, RingtonePicker, ForwardToStatus
} from "./screens/UltimateScreens";
import {
  InviteFriends, LegalPage, GroupCallParticipants
} from "./screens/LaunchScreens";
import { SplashScreen } from "./screens/SplashScreen";
import { Diagnostics } from "./screens/Diagnostics";
// Realtime notifications now flow through the real socket + Notification API (src/backend/presence.ts)

type View =
  | { kind: "main" }
  | { kind: "chat"; id: string; jumpTo?: string }
  | { kind: "contact"; id: string }
  | { kind: "settings" }
  | { kind: "settings-sub"; target: SettingsTarget }
  | { kind: "wallpaper" }
  | { kind: "call"; name: string; type: "voice" | "video"; color: string; text: string }
  | { kind: "incoming-call"; chatId: string; callType: "voice" | "video" }
  | { kind: "status"; status: Status; isMine?: boolean; queue?: Status[]; idx?: number }
  | { kind: "create-status" }
  | { kind: "new-chat" }
  | { kind: "new-group" }
  | { kind: "camera" }
  | { kind: "search" }
  | { kind: "archived" }
  | { kind: "forward"; message: Message }
  | { kind: "media"; chatId: string; messageId: string }
  | { kind: "gallery"; chatId: string }
  | { kind: "members"; chatId: string }
  | { kind: "dialer" }
  | { kind: "msginfo"; chatId: string; messageId: string }
  | { kind: "contact-editor"; contactId?: string }
  | { kind: "contacts" }
  | { kind: "scheduled" }
  | { kind: "storage-manager" }
  | { kind: "status-views"; status: Status }
  | { kind: "group-editor"; chatId: string }
  | { kind: "avatar-creator" }
  | { kind: "send-payment" }
  | { kind: "chat-search"; chatId: string }
  | { kind: "meta-ai" }
  | { kind: "locked-chats" }
  | { kind: "group-call"; chatId: string; callType: "voice" | "video" }
  | { kind: "security-code"; chatId: string }
  | { kind: "chat-disappearing"; chatId: string }
  | { kind: "photo-viewer"; chatId: string }
  | { kind: "catalog-browser" }
  | { kind: "cart-checkout" }
  | { kind: "order-history" }
  | { kind: "birthdays" }
  | { kind: "reminders" }
  | { kind: "ooo" }
  | { kind: "create-channel" }
  | { kind: "spam-report"; chatId: string }
  | { kind: "group-invite"; chatId: string }
  | { kind: "chat-theme"; chatId: string }
  | { kind: "pinned-list"; chatId: string }
  | { kind: "common-groups"; chatId: string }
  | { kind: "vanish-mode"; chatId: string }
  | { kind: "group-permissions"; chatId: string }
  | { kind: "audio-room"; chatId: string }
  | { kind: "qr-scanner" }
  | { kind: "status-privacy" }
  | { kind: "muted-statuses" }
  | { kind: "active-sessions" }
  | { kind: "backup-encryption" }
  | { kind: "custom-notif"; chatId: string }
  | { kind: "trending-channels" }
  | { kind: "saved-messages" }
  | { kind: "wa-updates" }
  | { kind: "web-pair" }
  | { kind: "privacy-detail"; field: "lastSeen" | "profilePhoto" | "about" | "groups"; title: string }
  | { kind: "delete-account" }
  | { kind: "notif-history" }
  | { kind: "settings-search" }
  | { kind: "help-center" }
  | { kind: "custom-wallpaper" }
  | { kind: "keyboard-shortcuts" }
  | { kind: "tools" }
  | { kind: "diagnostics" }
  | { kind: "channel-view"; channelName: string }
  | { kind: "add-to-home"; chatId: string }
  | { kind: "storage-cleanup" }
  | { kind: "app-info" }
  | { kind: "beta-program" }
  | { kind: "photo-history" }
  | { kind: "starred-grouped" }
  | { kind: "sticker-store" }
  | { kind: "channel-admin"; channelName: string }
  | { kind: "group-icon"; chatId: string }
  | { kind: "ringtone"; chatId: string }
  | { kind: "forward-status"; text: string }
  | { kind: "invite-friends" }
  | { kind: "legal"; type: "terms" | "privacy" }
  | { kind: "group-call-members"; chatId: string };

const ONBOARDED_KEY = "wa-onboarded";

function MainApp() {
  const { state, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>("chats");

  // Bootstrap the real backend: Socket.IO client + outbox monitor + status cleanup.
  // Messages are sent/received exclusively through the socket (no timers/mocks).
  useEffect(() => {
    bootstrapBackend(undefined);
    // Register service worker + web push (real notifications)
    let swReg: ServiceWorkerRegistration | null = null;
    registerServiceWorker().then((reg) => {
      swReg = reg;
      return subscribeToPush(reg).then((sub) => {
        try {
          const sessionRaw = localStorage.getItem("wa-session");
          if (sessionRaw) sendSubscriptionToServer(sub, JSON.parse(sessionRaw).token);
        } catch {}
        return sub;
      });
    }).catch(() => {});
    // Restore session if one exists, then connect the real socket
    try {
      const sessionRaw = localStorage.getItem("wa-session");
      if (sessionRaw) {
        const session = JSON.parse(sessionRaw);
        socketClient.connect(session.token);
        // Join rooms for existing chats
        const chatIds = state.chats.map((c) => c.id);
        socketClient.joinChats(chatIds);
      }
    } catch {}
    void swReg;

    // Real incoming message: server relays this only when another client sends
    const offMsg = socketClient.on("message:new", async (payload) => {
      const rec = await onIncomingSocketMessage(payload, {
        myId: "me",
        peerPublicKey: undefined,
      });
      if (!rec) return;
      const time = new Date(rec.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      dispatch({
        type: "RECEIVE_MESSAGE",
        chatId: rec.chatId,
        message: {
          id: rec.id,
          text: rec.text,
          time,
          sent: false,
          type: rec.type as any,
          media: rec.mediaId,
        },
      });
      // Keep rooms joined
      socketClient.joinChats([rec.chatId]);
    });

    // Real status acks (delivered/read) from the server
    const offStatus = socketClient.on("message:status", (payload) => {
      onIncomingStatus(payload);
      dispatch({
        type: "UPDATE_MESSAGE_STATUS",
        chatId: payload.chatId,
        messageId: payload.messageId,
        status: payload.status.toLowerCase() as any,
      });
    });

    const offPresence = socketClient.on("presence", (p) => {
      dispatch({ type: "SET_ONLINE", online: p.online });
    });

    // Real typing indicator from the socket (other client's keystrokes)
    const offTyping = socketClient.on("typing", (p) => {
      dispatch({ type: "SET_TYPING", chatId: p.chatId, typing: p.action === "start" });
      // Auto-clear after 4s of silence (real clients send "stop" on blur)
      if (p.action === "start") {
        window.setTimeout(() => {
          dispatch({ type: "SET_TYPING", chatId: p.chatId, typing: false });
        }, 4000);
      }
    });

    return () => {
      offMsg();
      offStatus();
      offPresence();
      offTyping();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const [view, setView] = useState<View>({ kind: "main" });
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    // Show splash on every fresh page load, but skip on subsequent mounts
    return sessionStorage.getItem("wa-splash-shown") !== "1";
  });
  const [showMenu, setShowMenu] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("wa-state-v2");
      const s = raw ? JSON.parse(raw) : null;
      return !s?.settings?.appLock;
    } catch { return true; }
  });
  const [onboarded, setOnboarded] = useState<boolean>(() => {
    return localStorage.getItem(ONBOARDED_KEY) === "1";
  });
  useEffect(() => {
    if (onboarded) localStorage.setItem(ONBOARDED_KEY, "1");
  }, [onboarded]);

  // Process scheduled messages (user-created schedules only)
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      state.scheduled.forEach((s) => {
        if (s.scheduledFor <= now) {
          const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          dispatch({
            type: "SEND_MESSAGE",
            chatId: s.chatId,
            message: {
              id: "ms" + Date.now() + Math.random(),
              text: s.text,
              time,
              sent: true,
              status: "sent",
            },
          });
          dispatch({ type: "REMOVE_SCHEDULED", id: s.id });
        }
      });
    }, 5000);
    return () => clearInterval(id);
  }, [state.scheduled, dispatch]);

  // Incoming calls arrive ONLY via real socket events from another client
  useEffect(() => {
    return socketClient.on("call", (p: any) => {
      if (p.kind === "ringing" && p.chatId) {
        const chat = state.chats.find((c) => c.id === p.chatId);
        if (chat && !chat.isGroup) {
          setView({ kind: "incoming-call", chatId: chat.id, callType: p.callType || "voice" });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.chats]);

  const totalUnread = useMemo(
    () => state.chats.reduce((sum, c) => sum + c.unread, 0),
    [state.chats]
  );

  const currentChat = (
    view.kind === "chat" || view.kind === "contact" || view.kind === "members" ||
    view.kind === "gallery" || view.kind === "group-editor" || view.kind === "chat-search" ||
    view.kind === "msginfo" || view.kind === "group-call" || view.kind === "security-code" ||
    view.kind === "chat-disappearing" || view.kind === "photo-viewer" ||
    view.kind === "spam-report" || view.kind === "group-invite" || view.kind === "chat-theme" ||
    view.kind === "pinned-list" || view.kind === "common-groups" || view.kind === "vanish-mode" ||
    view.kind === "group-permissions" || view.kind === "audio-room" || view.kind === "custom-notif" ||
    view.kind === "add-to-home" || view.kind === "group-icon" || view.kind === "ringtone" ||
    view.kind === "group-call-members"
  )
    ? state.chats.find((c) => c.id === ((view as any).id || (view as any).chatId))
    : undefined;

  // Authentic Chatsapp splash screen on launch
  if (showSplash) {
    return (
      <SplashScreen
        onDone={() => {
          sessionStorage.setItem("wa-splash-shown", "1");
          setShowSplash(false);
        }}
      />
    );
  }

  if (!onboarded) {
    if (view.kind === "legal") {
      return <LegalPage type={view.type} onBack={() => setView({ kind: "main" })} />;
    }
    return (
      <Welcome
        onDone={() => { setOnboarded(true); setUnlocked(true); }}
        onOpenLegal={(type) => setView({ kind: "legal", type })}
      />
    );
  }

  if (state.settings.appLock && !unlocked) {
    return <AppLockScreen onUnlock={() => setUnlocked(true)} />;
  }

  const goToCallFor = (id: string, type: "voice" | "video") => {
    const c = state.chats.find((x) => x.id === id);
    if (!c) return;
    if (c.isGroup) {
      setView({ kind: "group-call", chatId: c.id, callType: type });
    } else {
      setView({ kind: "call", name: c.name, type, color: c.avatarColor, text: c.avatarText });
    }
  };

  const incomingCallChat = view.kind === "incoming-call"
    ? state.chats.find((c) => c.id === view.chatId)
    : null;

  // Open self chat helper
  const openSelfChat = () => {
    const id = "self";
    if (!state.chats.some((c) => c.id === id)) {
      dispatch({
        type: "CREATE_CHAT",
        chat: {
          id,
          name: `${state.profile.name} (You)`,
          avatarColor: state.profile.avatarColor,
          avatarText: state.profile.avatarText,
          lastMessage: "Message yourself for notes, links, files…",
          time: "now",
          unread: 0,
          online: true,
          pinned: true,
          phone: state.profile.phone,
          about: "Notes to self",
          messages: [],
        },
      });
    }
    setView({ kind: "chat", id });
  };

  return (
    <>
      <NetworkBanner />

      {view.kind === "main" && (
        <>
          {tab === "chats" && (
            <ChatList
              chats={state.chats}
              onOpen={(id) => setView({ kind: "chat", id })}
              onMenu={() => setShowMenu(true)}
              onSearch={() => setView({ kind: "search" })}
              onNewChat={() => setView({ kind: "new-chat" })}
              onArchived={() => setView({ kind: "archived" })}
              onCamera={() => setView({ kind: "camera" })}
              onLockedChats={() => setView({ kind: "locked-chats" })}
            />
          )}
          {tab === "updates" && (
            <Updates
              onOpenStatus={(s) => {
                // Build a status queue for next/prev navigation
                const queue = [...state.myStatusItems, ...state.statuses, ...state.viewedStatuses];
                const idx = Math.max(0, queue.findIndex((x) => x.id === s.id));
                setView({ kind: "status", status: s, isMine: (s as any)._isMine, queue, idx });
              }}
              onCreateStatus={() => setView({ kind: "create-status" })}
              onCamera={() => setView({ kind: "camera" })}
              onStatusPrivacy={() => setView({ kind: "status-privacy" })}
              onMutedStatuses={() => setView({ kind: "muted-statuses" })}
            />
          )}
          {tab === "communities" && (
            <Communities
              onOpenGroupChat={(groupId, name) => {
                // Open an existing community group chat or create one on the fly
                const chatId = "community-" + groupId;
                if (!state.chats.some((c) => c.id === chatId)) {
                  dispatch({
                    type: "CREATE_CHAT",
                    chat: {
                      id: chatId,
                      name,
                      avatarColor: "bg-emerald-600",
                      avatarText: name.slice(0, 2).toUpperCase(),
                      lastMessage: "",
                      time: "now",
                      unread: 0,
                      online: false,
                      isGroup: true,
                      members: [state.profile.name],
                      about: "Community group",
                      messages: [],
                    },
                  });
                }
                setView({ kind: "chat", id: chatId });
              }}
            />
          )}
          {tab === "calls" && (
            <Calls
              onCall={(name, type, color, text) =>
                setView({ kind: "call", name, type, color, text })
              }
              onDialer={() => setView({ kind: "dialer" })}
            />
          )}
          <BottomNav active={tab} onChange={setTab} unread={totalUnread} />
          {showMenu && (
            <Menu
              onClose={() => setShowMenu(false)}
              items={[
                { label: "New group", action: () => setView({ kind: "new-group" }) },
                { label: "Linked devices", action: () => setView({ kind: "settings-sub", target: "linked" }) },
                { label: "Starred messages", action: () => setView({ kind: "settings-sub", target: "starred" }) },
                { label: "Archived chats", action: () => setView({ kind: "archived" }) },
                { label: "Scheduled messages", action: () => setView({ kind: "scheduled" }) },
                { label: "Contacts", action: () => setView({ kind: "contacts" }) },
                { label: "Message yourself", action: openSelfChat },
                { label: "Catalog & shop", action: () => setView({ kind: "catalog-browser" }) },
                { label: "Order history", action: () => setView({ kind: "order-history" }) },
                { label: "Sticker store", action: () => setView({ kind: "sticker-store" }) },
                { label: "Tools", action: () => setView({ kind: "tools" }) },
                { label: "Reminders", action: () => setView({ kind: "reminders" }) },
                { label: "Birthdays", action: () => setView({ kind: "birthdays" }) },
                { label: "Out of office", action: () => setView({ kind: "ooo" }) },
                { label: "Scan QR code", action: () => setView({ kind: "qr-scanner" }) },
                { label: "Payments", action: () => setView({ kind: "send-payment" }) },
                { label: "Invite a friend", action: () => setView({ kind: "invite-friends" }) },
                { label: "Settings", action: () => setView({ kind: "settings" }) },
              ]}
            />
          )}
        </>
      )}

      {view.kind === "chat" && currentChat && (
        <ChatView
          chat={currentChat}
          jumpToMsgId={view.jumpTo}
          onBack={() => setView({ kind: "main" })}
          onOpenProfile={() => setView({ kind: "contact", id: currentChat.id })}
          onCall={(t) => goToCallFor(currentChat.id, t)}
          onForward={(msg) => setView({ kind: "forward", message: msg })}
          onOpenMedia={(msgId) => setView({ kind: "media", chatId: currentChat.id, messageId: msgId })}
          onMessageInfo={(msgId) => setView({ kind: "msginfo", chatId: currentChat.id, messageId: msgId })}
          onSearch={() => setView({ kind: "chat-search", chatId: currentChat.id })}
          onPinnedList={() => setView({ kind: "pinned-list", chatId: currentChat.id })}
          onVanishMode={() => setView({ kind: "vanish-mode", chatId: currentChat.id })}
          onAudioRoom={() => setView({ kind: "audio-room", chatId: currentChat.id })}
          onAddToHome={() => setView({ kind: "add-to-home", chatId: currentChat.id })}
        />
      )}

      {view.kind === "chat-search" && currentChat && (
        <ChatSearch
          chatId={currentChat.id}
          onBack={() => setView({ kind: "chat", id: currentChat.id })}
          onJump={(msgId) => setView({ kind: "chat", id: currentChat.id, jumpTo: msgId })}
        />
      )}

      {view.kind === "msginfo" && currentChat && (
        <MessageInfo
          chatId={currentChat.id}
          messageId={view.messageId}
          onBack={() => setView({ kind: "chat", id: currentChat.id })}
        />
      )}

      {view.kind === "contact" && currentChat && (
        <ContactInfo
          chat={currentChat}
          onBack={() => setView({ kind: "chat", id: currentChat.id })}
          onCall={(t) => goToCallFor(currentChat.id, t)}
          onMedia={() => setView({ kind: "gallery", chatId: currentChat.id })}
          onMembers={() => setView({ kind: "members", chatId: currentChat.id })}
          onEditGroup={() => setView({ kind: "group-editor", chatId: currentChat.id })}
          onSearchInChat={() => setView({ kind: "chat-search", chatId: currentChat.id })}
          onSecurityCode={() => setView({ kind: "security-code", chatId: currentChat.id })}
          onDisappearing={() => setView({ kind: "chat-disappearing", chatId: currentChat.id })}
          onPhoto={() => setView({ kind: "photo-viewer", chatId: currentChat.id })}
          onChatTheme={() => setView({ kind: "chat-theme", chatId: currentChat.id })}
          onInviteLink={() => setView({ kind: "group-invite", chatId: currentChat.id })}
          onSpamReport={() => setView({ kind: "spam-report", chatId: currentChat.id })}
          onCommonGroups={() => setView({ kind: "common-groups", chatId: currentChat.id })}
          onPermissions={() => setView({ kind: "group-permissions", chatId: currentChat.id })}
          onCustomNotifications={() => setView({ kind: "custom-notif", chatId: currentChat.id })}
          onChangeGroupIcon={() => setView({ kind: "group-icon", chatId: currentChat.id })}
        />
      )}

      {view.kind === "members" && currentChat && (
        <GroupMembers
          chatId={currentChat.id}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "group-editor" && currentChat && (
        <GroupEditor
          chatId={currentChat.id}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "gallery" && currentChat && (
        <MediaGallery
          chat={currentChat}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
          onOpenMedia={(msgId) => setView({ kind: "media", chatId: currentChat.id, messageId: msgId })}
        />
      )}

      {view.kind === "media" && (
        <MediaViewer
          chatId={view.chatId}
          startMessageId={view.messageId}
          onBack={() => setView({ kind: "chat", id: view.chatId })}
          onForward={(m) => setView({ kind: "forward", message: m })}
        />
      )}

      {view.kind === "settings" && (
        <Settings
          onBack={() => setView({ kind: "main" })}
          onOpen={(target) => setView({ kind: "settings-sub", target })}
          onSearch={() => setView({ kind: "settings-search" })}
        />
      )}

      {view.kind === "settings-sub" && (
        <SettingsSub
          target={view.target}
          onBack={() =>
            // Back from Linked devices returns to the main screen, not Settings
            view.target === "linked"
              ? setView({ kind: "main" })
              : setView({ kind: "settings" })
          }
          onWallpaper={() => setView({ kind: "wallpaper" })}
          onTwoStep={() => setView({ kind: "settings-sub", target: "twostep" })}
          onAppLock={() => setView({ kind: "settings-sub", target: "applock" })}
          onBlocked={() => setView({ kind: "settings-sub", target: "blocked" })}
          onDisappearing={() => setView({ kind: "settings-sub", target: "disappearing" })}
          onBackup={() => setView({ kind: "settings-sub", target: "backup" })}
          onCreateBroadcast={() => setView({ kind: "new-group" })}
          onAvatarCreator={() => setView({ kind: "avatar-creator" })}
          onStorageManager={() => setView({ kind: "storage-manager" })}
          onBusinessProfile={() => setView({ kind: "settings-sub", target: "business-profile" })}
          onCatalog={() => setView({ kind: "settings-sub", target: "catalog" })}
          onQuickReplies={() => setView({ kind: "settings-sub", target: "quickreplies" })}
          onLabels={() => setView({ kind: "settings-sub", target: "labels" })}
          onSubNavigate={(target) => setView({ kind: "settings-sub", target })}
          onWebPair={() => setView({ kind: "web-pair" })}
          onPrivacyDetail={(field, title) => setView({ kind: "privacy-detail", field, title })}
          onDeleteAccount={() => setView({ kind: "delete-account" })}
          onHelpCenter={() => setView({ kind: "help-center" })}
          onOpenStarredChat={(chatId, msgId) => setView({ kind: "chat", id: chatId, jumpTo: msgId })}
          onStorageCleanup={() => setView({ kind: "storage-cleanup" })}
          onAppInfo={() => setView({ kind: "app-info" })}
          onPhotoHistory={() => setView({ kind: "photo-history" })}
        />
      )}

      {view.kind === "wallpaper" && (
        <WallpaperPicker onBack={() => setView({ kind: "settings-sub", target: "chats" })} />
      )}

      {view.kind === "call" && (
        <>
          <CallScreen
            name={view.name}
            type={view.type}
            avatarColor={view.color}
            avatarText={view.text}
            onEnd={() => { setScreenSharing(false); setView({ kind: "main" }); }}
            onScreenShare={() => setScreenSharing(true)}
          />
          <ScreenShareOverlay
            isSharing={screenSharing}
            onStop={() => setScreenSharing(false)}
          />
        </>
      )}

      {view.kind === "incoming-call" && incomingCallChat && (
        <IncomingCallWrapper
          chatId={view.chatId}
          callType={view.callType}
          name={incomingCallChat.name}
          avatarColor={incomingCallChat.avatarColor}
          avatarText={incomingCallChat.avatarText}
          onAccept={() =>
            setView({
              kind: "call",
              name: incomingCallChat.name,
              type: view.callType,
              color: incomingCallChat.avatarColor,
              text: incomingCallChat.avatarText,
            })
          }
          onDecline={() => setView({ kind: "main" })}
        />
      )}

      {view.kind === "status" && (
        <StatusViewer
          status={view.status}
          isMine={view.isMine}
          onClose={() => setView({ kind: "main" })}
          onViews={() => setView({ kind: "status-views", status: view.status })}
          onNext={() => {
            const queue = view.queue || [];
            const idx = (view.idx ?? 0) + 1;
            if (idx < queue.length) {
              const isMineStatus = queue[idx].id.startsWith("ms");
              setView({ kind: "status", status: queue[idx], isMine: isMineStatus, queue, idx });
            } else {
              setView({ kind: "main" });
            }
          }}
        />
      )}

      {view.kind === "status-views" && (
        <StatusViews
          status={view.status}
          onBack={() => setView({ kind: "main" })}
        />
      )}

      {view.kind === "create-status" && (
        <CreateStatus onClose={() => setView({ kind: "main" })} />
      )}

      {view.kind === "new-chat" && (
        <NewChat
          onBack={() => setView({ kind: "main" })}
          onOpenChat={(id) => setView({ kind: "chat", id })}
          onCreateGroup={() => setView({ kind: "new-group" })}
        />
      )}

      {view.kind === "new-group" && (
        <NewGroup
          onBack={() => setView({ kind: "new-chat" })}
          onCreated={(id) => setView({ kind: "chat", id })}
        />
      )}

      {view.kind === "camera" && (
        <CameraScreen onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "search" && (
        <SearchScreen
          onBack={() => setView({ kind: "main" })}
          onOpenChat={(id) => setView({ kind: "chat", id })}
        />
      )}

      {view.kind === "archived" && (
        <Archived
          onBack={() => setView({ kind: "main" })}
          onOpenChat={(id) => setView({ kind: "chat", id })}
        />
      )}

      {view.kind === "forward" && (
        <ForwardScreen
          message={view.message}
          onBack={() => setView({ kind: "main" })}
          onForwarded={() => setView({ kind: "main" })}
          onForwardToStatus={(text) => setView({ kind: "forward-status", text })}
        />
      )}

      {view.kind === "dialer" && (
        <Dialer
          onBack={() => setView({ kind: "main" })}
          onCall={(name, type, color, text) =>
            setView({ kind: "call", name, type, color, text })
          }
        />
      )}

      {view.kind === "contact-editor" && (
        <ContactEditor
          existing={view.contactId ? state.customContacts.find((c) => c.id === view.contactId) : undefined}
          onBack={() => setView({ kind: "contacts" })}
          onSaved={() => setView({ kind: "contacts" })}
        />
      )}

      {view.kind === "contacts" && (
        <ContactsList
          onBack={() => setView({ kind: "main" })}
          onEdit={(id) => setView({ kind: "contact-editor", contactId: id })}
          onNew={() => setView({ kind: "contact-editor" })}
          onOpenChat={(id) => setView({ kind: "chat", id })}
        />
      )}

      {view.kind === "scheduled" && (
        <ScheduledMessages
          onBack={() => setView({ kind: "main" })}
          onOpenChat={(id) => setView({ kind: "chat", id })}
        />
      )}

      {view.kind === "storage-manager" && (
        <StorageManager onBack={() => setView({ kind: "settings-sub", target: "storage" })} />
      )}

      {view.kind === "avatar-creator" && (
        <AvatarCreator onBack={() => setView({ kind: "settings-sub", target: "profile" })} />
      )}

      {view.kind === "send-payment" && (
        <SendPayment onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "locked-chats" && (
        <LockedChatsFolder
          onBack={() => setView({ kind: "main" })}
          onOpenChat={(id) => setView({ kind: "chat", id })}
        />
      )}

      {view.kind === "group-call" && currentChat && (
        <GroupCall
          chat={currentChat}
          type={view.callType}
          onEnd={() => setView({ kind: "main" })}
          onShowMembers={() => setView({ kind: "group-call-members", chatId: currentChat.id })}
        />
      )}

      {view.kind === "security-code" && currentChat && (
        <SecurityCode
          chat={currentChat}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "chat-disappearing" && currentChat && (
        <DisappearingChatTimer
          chatId={currentChat.id}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "photo-viewer" && currentChat && (
        <PhotoViewer
          color={currentChat.avatarColor}
          text={currentChat.avatarText}
          name={currentChat.name}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "catalog-browser" && (
        <CatalogBrowser
          onBack={() => setView({ kind: "main" })}
          onCheckout={() => setView({ kind: "cart-checkout" })}
        />
      )}

      {view.kind === "cart-checkout" && (
        <CartCheckout
          onBack={() => setView({ kind: "catalog-browser" })}
          onPlaceOrder={() => setView({ kind: "order-history" })}
        />
      )}

      {view.kind === "order-history" && (
        <OrderHistory onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "birthdays" && (
        <Birthdays onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "reminders" && (
        <Reminders
          onBack={() => setView({ kind: "main" })}
          onOpenChat={(id) => setView({ kind: "chat", id })}
        />
      )}

      {view.kind === "ooo" && (
        <OutOfOffice onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "spam-report" && currentChat && (
        <SpamReport
          chat={currentChat}
          onBack={() => setView({ kind: "main" })}
        />
      )}

      {view.kind === "group-invite" && currentChat && (
        <GroupInviteLink
          chat={currentChat}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "chat-theme" && currentChat && (
        <ChatThemePicker
          chatId={currentChat.id}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "pinned-list" && currentChat && (
        <PinnedMessages
          chatId={currentChat.id}
          onBack={() => setView({ kind: "chat", id: currentChat.id })}
          onJump={(msgId) => setView({ kind: "chat", id: currentChat.id, jumpTo: msgId })}
        />
      )}

      {view.kind === "common-groups" && currentChat && (
        <CommonGroups
          chatId={currentChat.id}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
          onOpenChat={(id) => setView({ kind: "chat", id })}
        />
      )}

      {view.kind === "vanish-mode" && currentChat && (
        <VanishModeInfo
          chatId={currentChat.id}
          onBack={() => setView({ kind: "chat", id: currentChat.id })}
        />
      )}

      {view.kind === "group-permissions" && currentChat && (
        <GroupPermissionsScreen
          chatId={currentChat.id}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "audio-room" && currentChat && (
        <AudioRoom
          chat={currentChat}
          onLeave={() => setView({ kind: "chat", id: currentChat.id })}
        />
      )}

      {view.kind === "qr-scanner" && (
        <QRScanner
          onBack={() => setView({ kind: "main" })}
          onScan={(data) => {
            // Try to find existing chat by name
            const existing = state.chats.find((c) => c.name === data);
            if (existing) {
              setView({ kind: "chat", id: existing.id });
            } else {
              // Create new chat
              const id = "qr-" + Date.now();
              dispatch({
                type: "CREATE_CHAT",
                chat: {
                  id,
                  name: data,
                  avatarColor: "bg-emerald-500",
                  avatarText: data.slice(0, 2).toUpperCase(),
                  lastMessage: "",
                  time: "now",
                  unread: 0,
                  online: false,
                  about: "Added via QR scan",
                  messages: [],
                },
              });
              setView({ kind: "chat", id });
            }
          }}
        />
      )}

      {view.kind === "status-privacy" && (
        <StatusPrivacy onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "muted-statuses" && (
        <MutedStatuses onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "active-sessions" && (
        <ActiveSessions onBack={() => setView({ kind: "settings" })} />
      )}

      {view.kind === "backup-encryption" && (
        <BackupEncryption onBack={() => setView({ kind: "settings-sub", target: "backup" })} />
      )}

      {view.kind === "custom-notif" && currentChat && (
        <CustomNotifications
          chatId={currentChat.id}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
          onPickRingtone={() => setView({ kind: "ringtone", chatId: currentChat.id })}
        />
      )}

      {view.kind === "channel-view" && (
        <ChannelView
          channelName={view.channelName}
          onBack={() => setView({ kind: "main" })}
          isOwner={view.channelName === state.profile.name + "'s Channel" || view.channelName === "My Channel"}
          onAdmin={() => setView({ kind: "channel-admin", channelName: view.channelName })}
        />
      )}

      {view.kind === "add-to-home" && currentChat && (
        <AddToHomeScreen
          chat={currentChat}
          onBack={() => setView({ kind: "chat", id: currentChat.id })}
        />
      )}

      {view.kind === "storage-cleanup" && (
        <StorageCleanupWizard onBack={() => setView({ kind: "settings-sub", target: "storage" })} />
      )}

      {view.kind === "app-info" && (
        <AppInfo
          onBack={() => setView({ kind: "settings-sub", target: "help" })}
          onBeta={() => setView({ kind: "beta-program" })}
        />
      )}

      {view.kind === "beta-program" && (
        <BetaProgram onBack={() => setView({ kind: "app-info" })} />
      )}

      {view.kind === "photo-history" && (
        <ProfilePhotoHistory onBack={() => setView({ kind: "settings-sub", target: "profile" })} />
      )}

      {view.kind === "starred-grouped" && (
        <StarredByChat
          onBack={() => setView({ kind: "settings" })}
          onOpenChat={(chatId, msgId) => setView({ kind: "chat", id: chatId, jumpTo: msgId })}
        />
      )}

      {view.kind === "sticker-store" && (
        <StickerStore onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "channel-admin" && (
        <ChannelAdminTools
          channelName={view.channelName}
          onBack={() => setView({ kind: "channel-view", channelName: view.channelName })}
        />
      )}

      {view.kind === "group-icon" && currentChat && (
        <GroupIconPicker
          chatId={currentChat.id}
          onBack={() => setView({ kind: "contact", id: currentChat.id })}
        />
      )}

      {view.kind === "ringtone" && currentChat && (
        <RingtonePicker
          chatId={currentChat.id}
          onBack={() => setView({ kind: "custom-notif", chatId: currentChat.id })}
        />
      )}

      {view.kind === "forward-status" && (
        <ForwardToStatus
          text={view.text}
          onClose={() => setView({ kind: "main" })}
          onPost={(caption) => {
            dispatch({
              type: "ADD_STATUS",
              status: {
                id: "ms" + Date.now(),
                name: state.profile.name,
                avatarColor: state.profile.avatarColor,
                avatarText: state.profile.avatarText,
                time: "Just now",
                viewed: false,
                bgColor: "bg-gradient-to-br from-emerald-500 to-teal-600",
                text: caption,
              },
            });
            setView({ kind: "main" });
          }}
        />
      )}

      {view.kind === "invite-friends" && (
        <InviteFriends onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "legal" && (
        <LegalPage type={view.type} onBack={() => setView({ kind: "main" })} />
      )}

      {view.kind === "group-call-members" && currentChat && (
        <GroupCallParticipants
          groupName={currentChat.name}
          members={currentChat.members || []}
          onBack={() => setView({ kind: "group-call", chatId: currentChat.id, callType: "voice" })}
        />
      )}

      {/* Floating voice mini player */}
      <VoiceMiniPlayer />

      {view.kind === "web-pair" && (
        <WebQRPair onBack={() => setView({ kind: "settings-sub", target: "linked" })} />
      )}

      {view.kind === "privacy-detail" && (
        <PrivacyOption
          title={view.title}
          field={view.field}
          onBack={() => setView({ kind: "settings-sub", target: "privacy" })}
        />
      )}

      {view.kind === "delete-account" && (
        <DeleteAccountFlow
          onBack={() => setView({ kind: "settings-sub", target: "account" })}
          onConfirm={() => {
            dispatch({ type: "RESET" });
            location.reload();
          }}
        />
      )}

      {view.kind === "settings-search" && (
        <SettingsSearch
          onBack={() => setView({ kind: "settings" })}
          onPick={(target) => setView({ kind: "settings-sub", target: target as SettingsTarget })}
        />
      )}

      {view.kind === "help-center" && (
        <HelpCenter onBack={() => setView({ kind: "settings-sub", target: "help" })} />
      )}

      {view.kind === "keyboard-shortcuts" && (
        <KeyboardShortcuts onBack={() => setView({ kind: "tools" })} />
      )}

      {view.kind === "tools" && (
        <ToolsScreen
          onBack={() => setView({ kind: "main" })}
          onKeyboard={() => setView({ kind: "keyboard-shortcuts" })}
          onWeb={() => setView({ kind: "web-pair" })}
          onDiagnostics={() => setView({ kind: "diagnostics" })}
        />
      )}

      {view.kind === "diagnostics" && (
        <Diagnostics onBack={() => setView({ kind: "main" })} />
      )}

      {/* Birthday popup on app launch */}
      <BirthdayPopupGate onMessage={(id) => setView({ kind: "chat", id })} />
    </>
  );
}

function BirthdayPopupGate({ onMessage }: { onMessage: (chatId: string) => void }) {
  const { state, dispatch } = useStore();
  const [showing, setShowing] = useState(false);

  const today = new Date();
  const monthDay = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayStr = today.toISOString().slice(0, 10);

  const todayBirthdays = useMemo(
    () =>
      Object.entries(state.birthdays)
        .filter(([_, d]) => d === monthDay)
        .map(([cid]) => state.chats.find((c) => c.id === cid))
        .filter((c): c is NonNullable<typeof c> => !!c),
    [state.birthdays, state.chats, monthDay]
  );

  useEffect(() => {
    if (todayBirthdays.length > 0 && state.birthdayPopupShown !== todayStr) {
      setShowing(true);
    }
  }, [todayBirthdays.length, state.birthdayPopupShown, todayStr]);

  if (!showing || todayBirthdays.length === 0) return null;

  return (
    <BirthdayPopup
      birthdayChats={todayBirthdays}
      onClose={() => {
        dispatch({ type: "MARK_BIRTHDAY_POPUP_SHOWN", date: todayStr });
        setShowing(false);
      }}
      onMessage={(cid) => {
        dispatch({ type: "MARK_BIRTHDAY_POPUP_SHOWN", date: todayStr });
        setShowing(false);
        onMessage(cid);
      }}
    />
  );
}

function IncomingCallWrapper({
  chatId,
  callType,
  name,
  avatarColor,
  avatarText,
  onAccept,
  onDecline,
}: {
  chatId: string;
  callType: "voice" | "video";
  name: string;
  avatarColor: string;
  avatarText: string;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { dispatch } = useStore();
  const handleDecline = () => {
    dispatch({
      type: "ADD_CALL",
      call: {
        id: "ic" + Date.now(),
        name,
        avatarColor,
        avatarText,
        time: "Just now",
        type: "missed",
        callType,
      },
    });
    onDecline();
  };
  void chatId;
  return (
    <IncomingCall
      name={name}
      type={callType}
      avatarColor={avatarColor}
      avatarText={avatarText}
      onAccept={onAccept}
      onDecline={handleDecline}
    />
  );
}

function SettingsSub({
  target,
  onBack,
  onWallpaper,
  onTwoStep,
  onAppLock,
  onBlocked,
  onDisappearing,
  onBackup,
  onCreateBroadcast,
  onAvatarCreator,
  onStorageManager,
  onBusinessProfile,
  onCatalog,
  onQuickReplies,
  onLabels,
  onSubNavigate,
  onWebPair,
  onPrivacyDetail,
  onDeleteAccount,
  onHelpCenter,
  onOpenStarredChat,
  onStorageCleanup,
  onAppInfo,
  onPhotoHistory,
}: {
  target: SettingsTarget;
  onBack: () => void;
  onWallpaper: () => void;
  onTwoStep: () => void;
  onAppLock: () => void;
  onBlocked: () => void;
  onDisappearing: () => void;
  onBackup: () => void;
  onCreateBroadcast: () => void;
  onAvatarCreator: () => void;
  onStorageManager: () => void;
  onBusinessProfile: () => void;
  onCatalog: () => void;
  onQuickReplies: () => void;
  onLabels: () => void;
  onSubNavigate?: (target: SettingsTarget) => void;
  onWebPair?: () => void;
  onPrivacyDetail?: (field: "lastSeen" | "profilePhoto" | "about" | "groups", title: string) => void;
  onDeleteAccount?: () => void;
  onHelpCenter?: () => void;
  onOpenStarredChat?: (chatId: string, msgId: string) => void;
  onStorageCleanup?: () => void;
  onAppInfo?: () => void;
  onPhotoHistory?: () => void;
}) {
  switch (target) {
    case "profile": return (
      <Profile
        onBack={onBack}
        onAvatarCreator={onAvatarCreator}
        onPhotoHistory={onPhotoHistory}
      />
    );
    case "account": return (
      <AccountSettings
        onBack={onBack}
        onTwoStep={onTwoStep}
        onAppLock={onAppLock}
        onConnected={() => onSubNavigate?.("connected")}
        onMultiAccount={() => onSubNavigate?.("multi-account")}
        onDataExport={() => onSubNavigate?.("data-export")}
        onMoveChats={() => onSubNavigate?.("move-chats")}
        onDeleteAccount={onDeleteAccount}
      />
    );
    case "privacy": return (
      <PrivacySettings
        onBack={onBack}
        onBlocked={onBlocked}
        onDisappearing={onDisappearing}
        onPrivacyDetail={onPrivacyDetail}
      />
    );
    case "chats": return <ChatSettings onBack={onBack} onWallpaper={onWallpaper} onBackup={onBackup} />;
    case "notifications": return <NotificationSettings onBack={onBack} />;
    case "storage": return <StorageSettings onBack={onBack} onManage={onStorageManager} onCleanup={onStorageCleanup} />;
    case "qr": return <QRCodeScreen onBack={onBack} />;
    case "starred": return (
      <StarredByChat
        onBack={onBack}
        onOpenChat={(chatId, msgId) => onOpenStarredChat?.(chatId, msgId)}
      />
    );
    case "linked": return <LinkedDevices onBack={onBack} onLink={onWebPair} />;
    case "help": return <HelpScreen onBack={onBack} onHelpCenter={onHelpCenter} onAppInfo={onAppInfo} />;
    case "applock": return <AppLockSettings onBack={onBack} />;
    case "twostep": return <TwoStepVerification onBack={onBack} />;
    case "backup": return <ChatBackup onBack={onBack} />;
    case "blocked": return <BlockedContacts onBack={onBack} />;
    case "disappearing": return <DisappearingMessages onBack={onBack} />;
    case "language": return <AppLanguage onBack={onBack} />;
    case "payments": return <Payments onBack={onBack} />;
    case "broadcast": return <BroadcastList onBack={onBack} onCreate={onCreateBroadcast} />;
    case "business": return (
      <BusinessTools
        onBack={onBack}
        onProfile={onBusinessProfile}
        onCatalog={onCatalog}
        onQuickReplies={onQuickReplies}
        onLabels={onLabels}
      />
    );
    case "business-profile": return <BusinessProfileEditor onBack={onBack} />;
    case "catalog": return <CatalogEditor onBack={onBack} />;
    case "quickreplies": return <QuickReplies onBack={onBack} />;
    case "labels": return <LabelsManager onBack={onBack} />;
    case "chatlock": return <ChatLockSetup onBack={onBack} />;
    case "statusarchive": return <StatusArchive onBack={onBack} />;
    case "sessions": return <ActiveSessions onBack={onBack} />;
    case "connected": return <ConnectedAccounts onBack={onBack} />;
    case "multi-account": return <MultipleAccounts onBack={onBack} />;
    case "data-export": return <DataExport onBack={onBack} />;
    case "move-chats": return <MoveChats onBack={onBack} />;
  }
}

function ThemedFrame({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  const isLight = state.settings.theme === "light";
  return (
    <div className={`min-h-screen w-full ${isLight ? "bg-zinc-300" : "bg-zinc-900"} flex items-center justify-center p-0 sm:p-4 transition-colors`}>
      <div
        className={`relative w-full sm:w-[400px] h-screen sm:h-[860px] sm:rounded-[2.5rem] sm:border-[10px] ${isLight ? "sm:border-zinc-400" : "sm:border-zinc-800"} sm:shadow-2xl ${isLight ? "bg-white" : "bg-app"} overflow-hidden font-chat select-none animate-screen-in`}
        // Profile photos are protected — no screenshots / long-press saving
        onContextMenu={(e) => {
          // Allow context menu only on text inputs/areas
          const tag = (e.target as HTMLElement)?.tagName;
          if (tag !== "INPUT" && tag !== "TEXTAREA") e.preventDefault();
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ThemeProvider>
        <ThemedFrame>
          <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-50 items-end justify-center pb-1">
            <div className="w-2 h-2 bg-zinc-700 rounded-full" />
          </div>
          <div className="hidden sm:flex absolute top-0 inset-x-0 h-6 z-40 px-6 items-center justify-between text-[10px] text-white/80 font-medium pointer-events-none">
            <span className="ml-3">9:41</span>
            <span className="mr-3">●●●● 5G ▮</span>
          </div>
          <div className="h-full sm:pt-6 relative flex flex-col">
            <ToastProvider>
              <MainApp />
            </ToastProvider>
          </div>
        </ThemedFrame>
      </ThemeProvider>
    </StoreProvider>
  );
}
