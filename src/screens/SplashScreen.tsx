import { useEffect, useState } from "react";
import { ChatsappLogo } from "../icons";

// Authentic Chatsapp splash/launch screen
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Show splash for ~1.6s then fade out
    const t1 = setTimeout(() => setFadeOut(true), 1500);
    const t2 = setTimeout(onDone, 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={`h-full w-full flex flex-col items-center justify-center bg-[#111b21] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Chatsapp logo — floating brand mark */}
      <div className="relative mb-8 animate-logo-float">
        <div className="w-28 h-28 rounded-[1.75rem] bg-[#25D366]/10 flex items-center justify-center">
          <ChatsappLogo className="w-24 h-24 drop-shadow-2xl" />
        </div>
        {/* glow ring */}
        <div className="absolute inset-0 rounded-[1.75rem] bg-emerald-400/20 blur-2xl -z-10" />
      </div>

      {/* Logo text */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-4xl font-light text-white tracking-tight animate-fade-in">Chatsapp</span>
      </div>
      <span className="text-emerald-400 text-sm font-medium mb-10 animate-fade-in">from Munawar</span>

      {/* Loading bar — shimmer brand green */}
      <div className="w-32 h-1 bg-[#202c33] rounded-full overflow-hidden">
        <div className="h-full shimmer-bar rounded-full" style={{ animation: "splashLoad 1.4s ease-out forwards, shimmer 1.2s linear infinite" }} />
      </div>

      <style>{`
        @keyframes splashLoad {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
