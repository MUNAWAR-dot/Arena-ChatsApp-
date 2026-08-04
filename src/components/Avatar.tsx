import { cn } from "../utils/cn";

export function Avatar({
  color,
  text,
  size = "md",
  online,
  ring,
  photoUrl,
}: {
  color: string;
  text: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  online?: boolean;
  ring?: "active" | "viewed" | "none";
  photoUrl?: string;
}) {
  const sizes = {
    sm: "w-9 h-9 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl",
    "2xl": "w-32 h-32 text-3xl",
  };
  const dot = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
    xl: "w-4 h-4",
    "2xl": "w-5 h-5",
  };
  const ringClass =
    ring === "active"
      ? "ring-2 ring-[#25D366] ring-offset-2 ring-offset-[#111b21]"
      : ring === "viewed"
      ? "ring-2 ring-zinc-600 ring-offset-2 ring-offset-[#111b21]"
      : "";
  return (
    <div className="relative shrink-0">
      {ring === "active" && (
        <span className="absolute inset-0 rounded-full ring-2 ring-[#25D366]/40 animate-ping" />
      )}
      <div
        className={cn(
          "rounded-full flex items-center justify-center text-white font-semibold select-none overflow-hidden bg-cover bg-center",
          !photoUrl && color,
          sizes[size],
          ringClass
        )}
        style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}
      >
        {!photoUrl && text}
      </div>
      {online && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-emerald-500 border-2 border-[#111b21]",
            dot[size]
          )}
        />
      )}
    </div>
  );
}
