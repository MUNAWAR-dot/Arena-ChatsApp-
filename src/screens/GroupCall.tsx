import { useEffect, useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { Mic, MicOff, Video, VideoOff, VolumeUp, PhoneOff, UserPlus, PictureInPicture } from "../icons";
import type { Chat } from "../data";

export function GroupCall({
  chat,
  type,
  onEnd,
  onShowMembers,
}: {
  chat: Chat;
  type: "voice" | "video";
  onEnd: () => void;
  onShowMembers?: () => void;
}) {
  const { dispatch } = useStore();
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(type === "video");
  const [speaker, setSpeaker] = useState(true);
  const [pip, setPip] = useState(false);
  const [status, setStatus] = useState("Connecting…");

  const members = (chat.members || []).filter((m) => m !== "You").slice(0, 6);
  const colors = ["bg-pink-500","bg-blue-500","bg-purple-500","bg-orange-500","bg-emerald-500","bg-rose-500"];

  useEffect(() => {
    const t = setTimeout(() => setStatus("On call"), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status !== "On call") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const endCall = () => {
    dispatch({
      type: "ADD_CALL",
      call: {
        id: "gc" + Date.now(),
        name: `${chat.name} · group`,
        avatarColor: chat.avatarColor,
        avatarText: chat.avatarText,
        time: "Just now",
        type: "outgoing",
        callType: type,
      },
    });
    onEnd();
  };

  if (pip) {
    return (
      <div className="absolute bottom-20 right-4 z-50 w-32 h-44 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gradient-to-br from-purple-700 to-pink-600 flex flex-col">
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
      style={{ background: "linear-gradient(160deg, #1f2937 0%, #0b141a 100%)" }}>
      <div className="flex items-center justify-between px-4 pt-8 pb-2">
        <button onClick={() => setPip(true)} className="p-2 bg-white/10 rounded-full">
          <PictureInPicture className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-emerald-300">🔒 End-to-end encrypted</div>
          <div className="text-sm">{chat.name}</div>
          <div className="text-xs text-zinc-300">{status === "On call" ? fmt(seconds) : status} · {members.length + 1} on call</div>
        </div>
        <button onClick={onShowMembers} className="p-2 bg-white/10 rounded-full">
          <UserPlus className="w-5 h-5" />
        </button>
      </div>

      {type === "video" && videoOn ? (
        <div className="flex-1 grid grid-cols-2 gap-1 p-2">
          {members.map((m, i) => (
            <div
              key={m}
              className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${
                ["from-purple-600 to-pink-600","from-blue-600 to-cyan-600","from-emerald-600 to-teal-600","from-orange-600 to-red-600","from-indigo-600 to-purple-600","from-rose-600 to-pink-600"][i % 6]
              } flex items-center justify-center`}
            >
              <Avatar color={colors[i % colors.length]} text={m.slice(0,2).toUpperCase()} size="lg" />
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                {m} {Math.random() > 0.7 && <MicOff className="w-3 h-3 inline ml-1" />}
              </div>
            </div>
          ))}
          {/* You */}
          <div className="relative rounded-xl overflow-hidden bg-zinc-700 flex items-center justify-center">
            <Avatar color="bg-emerald-600" text="ME" size="lg" />
            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-0.5 rounded">You</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <div className="grid grid-cols-3 gap-4">
            {members.map((m, i) => (
              <div key={m} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <Avatar color={colors[i % colors.length]} text={m.slice(0,2).toUpperCase()} size="lg" />
                  {Math.random() > 0.6 && (
                    <div className="absolute inset-0 rounded-full ring-2 ring-emerald-400 animate-pulse" />
                  )}
                </div>
                <div className="text-xs">{m}</div>
              </div>
            ))}
            <div className="flex flex-col items-center gap-1">
              <Avatar color="bg-emerald-600" text="ME" size="lg" />
              <div className="text-xs">You</div>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pb-10 flex items-center justify-around">
        <button
          onClick={() => setSpeaker((v) => !v)}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${speaker ? "bg-white/20" : "bg-white/10"}`}
        >
          <VolumeUp className="w-6 h-6" />
        </button>
        {type === "video" && (
          <button
            onClick={() => setVideoOn((v) => !v)}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${videoOn ? "bg-white/20" : "bg-white/10"}`}
          >
            {videoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
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
