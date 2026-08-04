import { useEffect, useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  Mic, MicOff, Video, VideoOff, VolumeUp, PhoneOff, User,
  Monitor, PictureInPicture, Maximize, Minimize
} from "../icons";

export function CallScreen({
  name,
  type,
  avatarColor,
  avatarText,
  onEnd,
  onScreenShare,
}: {
  name: string;
  type: "voice" | "video";
  avatarColor: string;
  avatarText: string;
  onEnd: () => void;
  onScreenShare?: () => void;
}) {
  const { dispatch } = useStore();
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(type === "video");
  const [speaker, setSpeaker] = useState(true);
  const [status, setStatus] = useState("Calling…");
  const [pip, setPip] = useState(false);
  const [layout, setLayout] = useState<"large" | "small">("large");

  useEffect(() => {
    const t1 = setTimeout(() => setStatus("Ringing…"), 1500);
    const t2 = setTimeout(() => setStatus("Connected"), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (status !== "Connected") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const endCall = () => {
    dispatch({
      type: "ADD_CALL",
      call: {
        id: "c" + Date.now(),
        name,
        avatarColor,
        avatarText,
        time: "Just now",
        type: "outgoing",
        callType: type,
      },
    });
    onEnd();
  };

  if (pip) {
    return (
      <div className="absolute bottom-20 right-4 z-50 w-28 h-44 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-br from-purple-700 to-pink-600 flex flex-col">
        <button onClick={() => setPip(false)} className="flex-1 flex items-center justify-center text-white text-xs">
          <div className="text-center">
            <Video className="w-6 h-6 mx-auto mb-1" />
            <div>{fmt(seconds)}</div>
          </div>
        </button>
        <button onClick={endCall} className="bg-red-600 py-1.5 text-white text-xs">
          End
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col text-white theme-keep-white"
      style={{
        background: type === "video"
          ? "linear-gradient(160deg, #1f2937 0%, #0b141a 100%)"
          : "linear-gradient(160deg, #064e3b 0%, #0b141a 100%)"
      }}>
      <div className="flex flex-col items-center pt-8">
        <div className="text-xs text-emerald-300">🔒 End-to-end encrypted</div>
        <div className="mt-1 text-sm text-zinc-300">{type === "video" ? "Chatsapp video call" : "Chatsapp voice call"}</div>
      </div>

      {/* Video: caller + self preview with resize */}
      {type === "video" && videoOn ? (
        <div className="flex-1 relative">
          {/* Caller's video — click to toggle big/small */}
          <button
            onClick={() => setLayout((l) => (l === "large" ? "small" : "large"))}
            className={`absolute inset-0 w-full h-full transition-all bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 flex items-center justify-center ${
              layout === "small" ? "!left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !w-2/3 !h-2/3 rounded-xl" : ""
            }`}
            title="Tap to resize"
          >
            <Avatar color={avatarColor} text={avatarText} size="2xl" />
          </button>
          <div className="absolute top-16 left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <div className="text-2xl font-medium">{name}</div>
            <div className="text-sm text-zinc-200 mt-1">{status === "Connected" ? fmt(seconds) : status}</div>
          </div>
          {/* Self preview — click to resize */}
          <button
            onClick={() => setLayout((l) => (l === "large" ? "small" : "large"))}
            className={`absolute right-4 ${layout === "small" ? "bottom-28 w-40 h-56" : "bottom-28 w-28 h-40"} rounded-xl bg-zinc-800 border-2 border-white/10 overflow-hidden flex items-center justify-center transition-all`}
            title="Tap to resize self preview"
          >
            <User className="w-10 h-10 text-zinc-500" />
            <span className="absolute bottom-1 right-1 bg-black/50 rounded px-1 text-[10px]">{layout === "large" ? "⤢" : "⤡"}</span>
          </button>
          {/* Screen share button */}
          <button
            onClick={() => {
              if (onScreenShare) onScreenShare();
              else setStatus(status === "Connected" ? "Sharing screen…" : status);
            }}
            className="absolute bottom-28 left-4 bg-white/20 p-3 rounded-full hover:bg-white/30"
            title="Share screen"
          >
            <Monitor className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Avatar color={avatarColor} text={avatarText} size="2xl" />
          <div className="text-3xl font-light">{name}</div>
          <div className="text-zinc-300">{status === "Connected" ? fmt(seconds) : status}</div>
        </div>
      )}

      <div className="px-6 pb-8 flex items-center justify-around">
        <button
          onClick={() => setPip(true)}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"
          title="Minimize"
        >
          <PictureInPicture className="w-5 h-5" />
        </button>
        <button
          onClick={() => setSpeaker((v) => !v)}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${speaker ? "bg-white/20" : "bg-white/10"}`}
        >
          <VolumeUp className="w-6 h-6" />
        </button>
        {type === "video" && (
          <>
            <button
              onClick={() => setVideoOn((v) => !v)}
              className={`w-14 h-14 rounded-full flex items-center justify-center ${videoOn ? "bg-white/20" : "bg-white/10"}`}
            >
              {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
            <button
              onClick={() => setLayout((l) => (l === "large" ? "small" : "large"))}
              className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center"
              title="Toggle video size"
            >
              {layout === "large" ? <Maximize className="w-5 h-5" /> : <Minimize className="w-5 h-5" />}
            </button>
          </>
        )}
        <button
          onClick={() => setMuted((v) => !v)}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${muted ? "bg-white/30" : "bg-white/10"}`}
        >
          {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>
        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}

// Screen share overlay shown over the video call
export function ScreenShareOverlay({
  isSharing,
  onStop,
}: {
  isSharing: boolean;
  onStop: () => void;
}) {
  if (!isSharing) return null;
  return (
    <div className="absolute inset-0 z-[60] bg-zinc-900 flex flex-col text-white">
      <div className="flex items-center justify-between p-3 bg-black/60">
        <div className="flex items-center gap-2 text-sm">
          <Monitor className="w-4 h-4 text-emerald-400" />
          <span>You are sharing your screen</span>
        </div>
        <button
          onClick={onStop}
          className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full"
        >
          Stop sharing
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-3/4 max-w-md aspect-video bg-zinc-800 border-2 border-emerald-500/40 rounded-lg flex flex-col items-center justify-center gap-2">
          <Monitor className="w-16 h-16 text-emerald-400" />
          <span className="text-sm text-zinc-300">Your screen is being shared</span>
          <span className="text-xs text-zinc-500">Everything on this screen is visible to the call</span>
        </div>
        <button
          onClick={onStop}
          className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full text-sm"
        >
          Stop sharing
        </button>
      </div>
      <div className="text-center text-xs text-zinc-500 py-3">
        🔒 Screen sharing is end-to-end encrypted
      </div>
    </div>
  );
}
