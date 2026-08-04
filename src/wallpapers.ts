import type { Wallpaper } from "./store";

export function getWallpaperStyle(w: Wallpaper): React.CSSProperties {
  const doodle = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='%23182229' fill-opacity='0.6'%3E%3Cpath d='M14 16h12v12H14zM34 36h12v12H34zM54 16h12v12H54zM14 56h12v12H14zM54 56h12v12H54z'/%3E%3C/g%3E%3C/svg%3E")`;
  switch (w) {
    case "default":
      return { backgroundImage: doodle, backgroundColor: "#0b141a" };
    case "dark":
      return { backgroundColor: "#000000" };
    case "teal":
      return { backgroundImage: doodle, backgroundColor: "#0c2a2a" };
    case "purple":
      return { backgroundImage: doodle, backgroundColor: "#231830" };
    case "sunset":
      return { background: "linear-gradient(160deg, #2d1b1b 0%, #1a0e1a 100%)" };
    case "plain":
      return { backgroundColor: "#0b141a" };
  }
}

export const wallpaperOptions: { id: Wallpaper; name: string; preview: string }[] = [
  { id: "default", name: "Default", preview: "bg-[#0b141a]" },
  { id: "dark", name: "Dark", preview: "bg-black" },
  { id: "teal", name: "Teal", preview: "bg-[#0c2a2a]" },
  { id: "purple", name: "Purple", preview: "bg-[#231830]" },
  { id: "sunset", name: "Sunset", preview: "bg-gradient-to-br from-[#2d1b1b] to-[#1a0e1a]" },
  { id: "plain", name: "Plain", preview: "bg-[#0b141a]" },
];
