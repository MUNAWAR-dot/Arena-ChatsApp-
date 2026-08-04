import { useState } from "react";
import { X, Flash, RotateCcw, Image } from "../icons";

export function CameraScreen({ onBack }: { onBack: () => void }) {
  const [flash, setFlash] = useState(false);
  const [mode, setMode] = useState<"photo" | "video">("photo");
  const [captured, setCaptured] = useState(false);

  if (captured) {
    return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col">
        <div className="flex justify-between p-4 text-white">
          <button onClick={() => setCaptured(false)}><X className="w-6 h-6" /></button>
        </div>
        <div className="flex-1 bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 flex items-center justify-center">
          <Image className="w-20 h-20 text-white/70" />
        </div>
        <div className="p-4 flex justify-between items-center bg-black/80 text-white">
          <input
            placeholder="Add a caption…"
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <button
            onClick={onBack}
            className="bg-emerald-500 text-[#111b21] rounded-full w-12 h-12 flex items-center justify-center font-bold"
          >
            ➤
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col text-white theme-keep-white">
      <div className="flex justify-between p-4">
        <button onClick={onBack}><X className="w-6 h-6" /></button>
        <button onClick={() => setFlash((v) => !v)} className={flash ? "text-yellow-400" : ""}>
          <Flash className="w-6 h-6" />
        </button>
      </div>
      <div className="flex-1 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black relative flex items-center justify-center">
        <div className="absolute inset-12 border border-white/20 rounded-3xl" />
        <span className="text-white/40 text-sm">Camera preview</span>
      </div>
      <div className="px-6 pb-8 pt-4">
        <div className="flex justify-center gap-6 text-sm mb-4">
          <button
            onClick={() => setMode("photo")}
            className={mode === "photo" ? "text-yellow-400 font-semibold" : "text-white/70"}
          >
            PHOTO
          </button>
          <button
            onClick={() => setMode("video")}
            className={mode === "video" ? "text-yellow-400 font-semibold" : "text-white/70"}
          >
            VIDEO
          </button>
        </div>
        <div className="flex items-center justify-around">
          <button className="text-white/70">
            <Image className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCaptured(true)}
            className={`w-20 h-20 rounded-full border-4 ${mode === "video" ? "border-red-500" : "border-white"} flex items-center justify-center`}
          >
            <div className={`w-16 h-16 rounded-full ${mode === "video" ? "bg-red-500" : "bg-white"}`} />
          </button>
          <button>
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
