import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { X } from "../icons";

type ToastItem = {
  id: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  action?: { label: string; onClick: () => void };
};

const ToastCtx = createContext<{ show: (t: Omit<ToastItem, "id">) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // Fallback: still works even outside provider
    return { show: (t: Omit<ToastItem, "id">) => alert(t.message) };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((t: Omit<ToastItem, "id">) => {
    const id = "tst" + Date.now() + Math.random();
    setToasts((arr) => [...arr, { ...t, id }]);
    setTimeout(() => setToasts((arr) => arr.filter((x) => x.id !== id)), 4000);
  }, []);

  const colors = {
    info: "bg-[#202c33] text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-yellow-600 text-white",
    error: "bg-red-600 text-white",
  };

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="absolute bottom-24 left-2 right-2 z-[80] pointer-events-none flex flex-col gap-2 items-center">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-lg px-4 py-3 shadow-2xl flex items-center gap-3 max-w-sm w-full ${colors[t.type || "info"]}`}
            style={{ animation: "slideUp 0.25s ease-out" }}
          >
            <span className="flex-1 text-sm">{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick();
                  setToasts((arr) => arr.filter((x) => x.id !== t.id));
                }}
                className="text-emerald-300 text-xs font-semibold uppercase whitespace-nowrap"
              >
                {t.action.label}
              </button>
            )}
            <button
              onClick={() => setToasts((arr) => arr.filter((x) => x.id !== t.id))}
              className="text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
