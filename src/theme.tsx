import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useStore } from "./store";

export type ThemeColors = {
  bgApp: string; // main app bg
  bgPanel: string; // header bg
  bgChatList: string;
  bgChatHover: string;
  bgInput: string;
  bgBubbleMe: string;
  bgBubbleThem: string;
  bgWallpaper: string;
  text: string;
  textMuted: string;
  textBubbleMe: string;
  textBubbleThem: string;
  border: string;
  accent: string; // emerald
};

export const darkTheme: ThemeColors = {
  bgApp: "#111b21",
  bgPanel: "#202c33",
  bgChatList: "#111b21",
  bgChatHover: "#202c33",
  bgInput: "#202c33",
  bgBubbleMe: "#005c4b",
  bgBubbleThem: "#202c33",
  bgWallpaper: "#0b141a",
  text: "#e9edef",
  textMuted: "#8696a0",
  textBubbleMe: "#ffffff",
  textBubbleThem: "#ffffff",
  border: "#222d34",
  accent: "#00a884",
};

export const lightTheme: ThemeColors = {
  bgApp: "#ffffff",
  bgPanel: "#f0f2f5",
  bgChatList: "#ffffff",
  bgChatHover: "#f5f6f6",
  bgInput: "#f0f2f5",
  bgBubbleMe: "#d9fdd3",
  bgBubbleThem: "#ffffff",
  bgWallpaper: "#efeae2",
  text: "#111b21",
  textMuted: "#667781",
  textBubbleMe: "#111b21",
  textBubbleThem: "#111b21",
  border: "#e9edef",
  accent: "#008069",
};

const ThemeCtx = createContext<ThemeColors>(darkTheme);

export function useTheme() {
  return useContext(ThemeCtx);
}

const fontSizes = {
  small: { base: "13px", sm: "11px", lg: "15px" },
  medium: { base: "14px", sm: "12px", lg: "16px" },
  large: { base: "16px", sm: "13px", lg: "18px" },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { state } = useStore();
  const colors = state.settings.theme === "light" ? lightTheme : darkTheme;
  const fs = fontSizes[state.settings.fontSize];

  // Toggle light theme class on <html> for global CSS overrides
  useEffect(() => {
    document.documentElement.classList.toggle("theme-light", state.settings.theme === "light");
  }, [state.settings.theme]);

  // Apply CSS vars to root so everything theme-aware can use them
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--wa-bg-app", colors.bgApp);
    root.style.setProperty("--wa-bg-panel", colors.bgPanel);
    root.style.setProperty("--wa-bg-chat-hover", colors.bgChatHover);
    root.style.setProperty("--wa-bg-input", colors.bgInput);
    root.style.setProperty("--wa-bg-bubble-me", colors.bgBubbleMe);
    root.style.setProperty("--wa-bg-bubble-them", colors.bgBubbleThem);
    root.style.setProperty("--wa-bg-wallpaper", colors.bgWallpaper);
    root.style.setProperty("--wa-text", colors.text);
    root.style.setProperty("--wa-text-muted", colors.textMuted);
    root.style.setProperty("--wa-text-bubble-me", colors.textBubbleMe);
    root.style.setProperty("--wa-text-bubble-them", colors.textBubbleThem);
    root.style.setProperty("--wa-border", colors.border);
    root.style.setProperty("--wa-accent", colors.accent);
    root.style.setProperty("--wa-font-base", fs.base);
    root.style.setProperty("--wa-font-sm", fs.sm);
    root.style.setProperty("--wa-font-lg", fs.lg);
  }, [colors, fs]);

  return <ThemeCtx.Provider value={colors}>{children}</ThemeCtx.Provider>;
}
