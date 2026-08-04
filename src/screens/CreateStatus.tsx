import { useState } from "react";
import { useStore } from "../store";
import { X, Type, Send, Palette, Image as ImageIcon } from "../icons";

const bgColors = [
  "bg-gradient-to-br from-pink-500 to-rose-600",
  "bg-gradient-to-br from-blue-500 to-indigo-600",
  "bg-gradient-to-br from-orange-500 to-red-500",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-purple-600 to-fuchsia-600",
  "bg-gradient-to-br from-yellow-500 to-orange-500",
  "bg-gradient-to-br from-zinc-700 to-zinc-900",
];

const photoBackgrounds = [
  "bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500",
  "bg-gradient-to-br from-blue-700 via-cyan-600 to-emerald-500",
  "bg-gradient-to-br from-rose-700 via-red-600 to-yellow-500",
  "bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-500",
  "bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-500",
];

export function CreateStatus({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [mode, setMode] = useState<"text" | "photo" | "video">("text");
  const [text, setText] = useState("");
  const [bgIdx, setBgIdx] = useState(0);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [font, setFont] = useState<"sans" | "serif" | "mono">("sans");
  const [caption, setCaption] = useState("");

  const fonts = { sans: "font-sans", serif: "font-serif", mono: "font-mono" };

  const post = () => {
    if (mode === "text" && !text.trim()) return;
    dispatch({
      type: "ADD_STATUS",
      status: {
        id: "ms" + Date.now(),
        name: state.profile.name,
        avatarColor: state.profile.avatarColor,
        avatarText: state.profile.avatarText,
        time: "Just now",
        viewed: false,
        bgColor: mode === "text" ? bgColors[bgIdx] : photoBackgrounds[photoIdx],
        text:
          mode === "text" ? text.trim() :
          mode === "video" ? "▶️ Video · " + (caption || "My video") :
          caption || "📷",
      },
    });
    onClose();
  };

  if (mode === "video") {
    return (
      <div className={`absolute inset-0 z-50 flex flex-col text-white ${photoBackgrounds[photoIdx]}`}>
        <div className="flex justify-between p-4">
          <button onClick={onClose}><X className="w-6 h-6" /></button>
          <button
            onClick={() => setMode("text")}
            className="bg-white/20 px-3 py-1 rounded-full text-sm"
          >
            Aa Text
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="w-full max-w-xs aspect-video bg-black/50 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/20">
            <span className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-3xl ml-1">▶</span>
            </span>
            <span className="text-xs opacity-80">Video preview</span>
          </div>
        </div>
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
          {photoBackgrounds.map((b, i) => (
            <button
              key={b}
              onClick={() => setPhotoIdx(i)}
              className={`shrink-0 w-12 h-16 rounded ${b} ${i === photoIdx ? "ring-2 ring-white" : ""}`}
            />
          ))}
        </div>
        <div className="p-3 flex items-center gap-2 bg-black/30">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption…"
            className="flex-1 bg-white/10 backdrop-blur rounded-full px-4 py-2 outline-none text-sm placeholder:text-white/60"
          />
          <button
            onClick={post}
            className="bg-emerald-500 text-[#111b21] rounded-full w-12 h-12 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (mode === "photo") {
    return (
      <div className={`absolute inset-0 z-50 flex flex-col text-white ${photoBackgrounds[photoIdx]}`}>
        <div className="flex justify-between p-4">
          <button onClick={onClose}><X className="w-6 h-6" /></button>
          <button
            onClick={() => setMode("text")}
            className="bg-white/20 px-3 py-1 rounded-full text-sm"
          >
            Aa Text
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <ImageIcon className="w-32 h-32 text-white/40" />
        </div>
        <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
          {photoBackgrounds.map((b, i) => (
            <button
              key={b}
              onClick={() => setPhotoIdx(i)}
              className={`shrink-0 w-12 h-16 rounded ${b} ${i === photoIdx ? "ring-2 ring-white" : ""}`}
            />
          ))}
        </div>
        <div className="p-3 flex items-center gap-2 bg-black/30">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption…"
            className="flex-1 bg-white/10 backdrop-blur rounded-full px-4 py-2 outline-none text-sm placeholder:text-white/60"
          />
          <button
            onClick={post}
            className="bg-emerald-500 text-[#111b21] rounded-full w-12 h-12 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-50 flex flex-col text-white theme-keep-white ${bgColors[bgIdx]}`}>
      <div className="flex justify-between p-4">
        <button onClick={onClose}><X className="w-6 h-6" /></button>
        <div className="flex gap-3">
          <button
            onClick={() => setMode("photo")}
            className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            <ImageIcon className="w-4 h-4" /> Photo
          </button>
          <button
            onClick={() => setMode("video")}
            className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1"
          >
            <span className="text-sm">🎬</span> Video
          </button>
          <button onClick={() => setBgIdx((i) => (i + 1) % bgColors.length)}>
            <Palette className="w-6 h-6" />
          </button>
          <button onClick={() => setFont((f) => f === "sans" ? "serif" : f === "serif" ? "mono" : "sans")}>
            <Type className="w-6 h-6" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a status"
          className={`w-full bg-transparent text-center text-3xl outline-none placeholder:text-white/60 resize-none ${fonts[font]}`}
          rows={4}
          maxLength={200}
        />
      </div>
      <div className="p-4 flex justify-end">
        <button
          onClick={post}
          disabled={!text.trim()}
          className="bg-white text-black rounded-full w-14 h-14 flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
