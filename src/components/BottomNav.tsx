import { useRef, useState } from "react";
import { ChatBubble, Phone, Users } from "../icons";

export type Tab = "chats" | "updates" | "communities" | "calls";

const TAB_ORDER_KEY = "wa-tab-order";

const DEFAULT_ITEMS: { key: Tab; label: string; icon: any; badge?: number }[] = [
  { key: "chats", label: "Chats", icon: ChatBubble },
  { key: "updates", label: "Updates", icon: () => <span className="text-2xl leading-none">◯</span> },
  { key: "communities", label: "Communities", icon: Users },
  { key: "calls", label: "Calls", icon: Phone },
];

export function BottomNav({
  active,
  onChange,
  unread,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  unread: number;
}) {
  const [items, setItems] = useState(() => {
    try {
      const order = JSON.parse(localStorage.getItem(TAB_ORDER_KEY) || "null") as Tab[] | null;
      if (order && order.length === DEFAULT_ITEMS.length) {
        return order
          .map((k) => DEFAULT_ITEMS.find((i) => i.key === k))
          .filter(Boolean) as typeof DEFAULT_ITEMS;
      }
    } catch {}
    return DEFAULT_ITEMS;
  });
  const dragIndex = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const itemsWithBadges = items.map((it) => ({
    ...it,
    badge: it.key === "chats" ? unread : undefined,
  }));

  const persist = (newItems: typeof items) => {
    setItems(newItems);
    localStorage.setItem(TAB_ORDER_KEY, JSON.stringify(newItems.map((i) => i.key)));
  };

  const handleDragEnter = (idx: number) => {
    if (dragIndex.current === null || dragIndex.current === idx) return;
    const from = dragIndex.current;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(idx, 0, moved);
    dragIndex.current = idx;
    persist(next);
  };

  const stopDrag = () => {
    dragIndex.current = null;
    setDragging(false);
  };

  return (
    <nav className="absolute bottom-0 inset-x-0 bg-[#1f2c33] border-t border-[#222d34] flex z-30 select-none">
      {itemsWithBadges.map((it, idx) => {
        const Icon = it.icon;
        const isActive = active === it.key;
        return (
          <button
            key={it.key}
            draggable={false}
            onPointerDown={() => {
              dragIndex.current = idx;
              setDragging(true);
            }}
            onPointerEnter={() => dragging && handleDragEnter(idx)}
            onPointerUp={stopDrag}
            onPointerLeave={() => {
              // keep dragging state until pointer up anywhere
            }}
            onClick={() => onChange(it.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 relative ${
              dragging ? "cursor-grabbing opacity-80" : "cursor-grab active:cursor-grabbing"
            }`}
            title={dragging ? "Release to place · drag to reorder" : "Drag to reorder"}
          >
            <div className={`relative px-5 py-1 rounded-full ${isActive ? "bg-emerald-900/60" : ""}`}>
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-300" : "text-[#aebac1]"}`} />
              {it.badge != null && it.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-[#111b21] text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                  {it.badge}
                </span>
              )}
            </div>
            <span className={`text-xs ${isActive ? "text-emerald-300 font-medium" : "text-[#aebac1]"}`}>
              {it.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
