import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic, VolumeUp, VolumeX } from "../icons";
import { useStore } from "../store";

// Global playback state so only one voice plays at a time
type PlayState = { chatId: string; messageId: string } | null;
let listeners: ((s: PlayState) => void)[] = [];

function setGlobalPlayback(s: PlayState) {
  listeners.forEach((l) => l(s));
}
function subscribePlayback(l: (s: PlayState) => void) {
  listeners.push(l);
  return () => {
    listeners = listeners.filter((x) => x !== l);
  };
}

export function VoicePlayer({ duration, sent, chatId, messageId }: { duration?: string; sent?: boolean; chatId?: string; messageId?: string }) {
  const { dispatch } = useStore();
  const [isActive, setIsActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [muted, setMuted] = useState(false);
  const intervalRef = useRef<any>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const totalSec = (() => {
    if (!duration) return 10;
    const parts = duration.split(":").map(Number);
    return parts.length === 2 ? parts[0] * 60 + parts[1] : 10;
  })();

  // Sync with global playback: if another player starts, pause this one
  useEffect(() => {
    const unsub = subscribePlayback((s) => {
      const isThis = s?.chatId === chatId && s?.messageId === messageId;
      setIsActive(!!isThis);
      if (!isThis) {
        setPlaying(false);
      }
    });
    return unsub;
  }, [chatId, messageId]);

  // Progress ticker
  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        const next = e + 0.1 * speed;
        if (next >= totalSec) {
          setPlaying(false);
          setGlobalPlayback(null);
          setProgress(0);
          return 0;
        }
        setProgress((next / totalSec) * 100);
        return next;
      });
    }, 100);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [playing, totalSec, speed]);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
      setGlobalPlayback(null);
      return;
    }
    // Stop any other player via global state
    setGlobalPlayback({ chatId: chatId || "", messageId: messageId || "" });
    setIsActive(true);
    setPlaying(true);
    if (chatId && messageId) {
      dispatch({ type: "SET_VOICE_MINI", data: { chatId, messageId, duration } });
    }
  };

  const seekTo = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setElapsed(pct * totalSec);
    setProgress(pct * 100);
  };

  const bars = Array.from({ length: 30 }, (_, i) => {
    // organic waveform heights
    const wave = Math.abs(Math.sin(i * 0.55)) * 0.7 + Math.abs(Math.sin(i * 0.22)) * 0.3;
    return Math.round(4 + wave * 14);
  });

  const timeLabel = playing || progress > 0 ? fmt(elapsed) : duration || "0:10";

  return (
    <div className="flex items-center gap-1.5 min-w-[230px] py-1">
      {/* Play / pause button — brand green with glow when active */}
      <button
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
          isActive && playing
            ? "bg-[#25D366] text-[#0b141a] shadow-[0_0_14px_rgba(37,211,102,0.5)] scale-105"
            : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
        }`}
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </button>

      {/* Waveform scrubber with drag support */}
      <div
        ref={trackRef}
        className="flex-1 flex items-center gap-[2px] h-7 cursor-pointer relative touch-none"
        onMouseDown={(e) => {
          draggingRef.current = true;
          seekTo(e.clientX);
        }}
        onMouseMove={(e) => draggingRef.current && seekTo(e.clientX)}
        onMouseUp={() => (draggingRef.current = false)}
        onMouseLeave={() => (draggingRef.current = false)}
        onTouchStart={(e) => {
          draggingRef.current = true;
          const t = e.touches[0];
          seekTo(t.clientX);
        }}
        onTouchMove={(e) => {
          if (!draggingRef.current) return;
          const t = e.touches[0];
          seekTo(t.clientX);
        }}
        onTouchEnd={() => (draggingRef.current = false)}
        onClick={(e) => seekTo(e.clientX)}
      >
        {bars.map((h, i) => {
          const filled = (i / bars.length) * 100 <= progress;
          return (
            <div
              key={i}
              className={`w-[3px] rounded-full transition-colors duration-150 ${
                filled
                  ? isActive && playing
                    ? "bg-[#25D366]"
                    : "bg-emerald-400"
                  : sent
                  ? "bg-emerald-200/25"
                  : "bg-zinc-600"
              }`}
              style={{ height: `${h}px` }}
            />
          );
        })}
        {/* playback knob */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#25D366] shadow-md pointer-events-none transition-all"
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>

      {/* Speed toggle */}
      <button
        onClick={() => setSpeed((s) => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
        className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-emerald-400 hover:bg-white/20 transition-colors shrink-0"
      >
        {speed}x
      </button>

      {/* Mute toggle */}
      <button
        onClick={() => setMuted((m) => !m)}
        className={`p-1 rounded transition-colors shrink-0 ${muted ? "text-red-400" : "text-[#8696a0] hover:text-white"}`}
        aria-label="Mute"
      >
        {muted ? <VolumeX className="w-3.5 h-3.5" /> : <VolumeUp className="w-3.5 h-3.5" />}
      </button>

      {/* Time */}
      <div className="flex flex-col items-end shrink-0">
        <Mic className={`w-3 h-3 ${playing ? "text-[#25D366]" : "text-emerald-400"}`} />
        <span className="text-[10px] text-[#8696a0] font-mono">{timeLabel}</span>
      </div>
    </div>
  );
}
