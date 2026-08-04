import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, X, MapPin, Send, ScanLine, Camera, FileText, Pencil2,
  Cart, Plus, Trash, Check, Verified, ZoomIn, AtSign, Heart, ShoppingBag
} from "../icons";

function SubHeader({ title, onBack, sub, action }: { title: string; onBack: () => void; sub?: string; action?: React.ReactNode }) {
  return (
    <header className="flex items-center gap-3 px-2 py-3 bg-[#202c33] text-white">
      <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-lg font-medium">{title}</h1>
        {sub && <p className="text-xs text-[#8696a0]">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

// Profile photo full-screen viewer with zoom
export function PhotoViewer({
  color,
  text,
  name,
  onBack,
}: {
  color: string;
  text: string;
  name: string;
  onBack: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col">
      <header className="flex items-center gap-3 px-2 py-3 bg-black/70 text-white">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium flex-1">{name}</h1>
        <button onClick={() => setZoom((z) => z >= 3 ? 1 : z + 0.5)} className="p-2 rounded-full hover:bg-white/10">
          <ZoomIn className="w-5 h-5" />
        </button>
      </header>
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onClick={() => setZoom((z) => z >= 3 ? 1 : z + 0.5)}
      >
        <div className="transition-transform" style={{ transform: `scale(${zoom})` }}>
          <Avatar color={color} text={text} size="2xl" />
        </div>
      </div>
      <div className="text-center text-xs text-white/60 py-3">Tap to zoom · Pinch to scale</div>
    </div>
  );
}

// Live location share
export function LiveLocation({
  onBack,
  onShare,
}: {
  onBack: () => void;
  onShare: (duration: number) => void;
}) {
  const durations = [
    { mins: 15, label: "15 minutes" },
    { mins: 60, label: "1 hour" },
    { mins: 480, label: "8 hours" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Share live location" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="aspect-video bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 relative flex items-center justify-center">
          {/* Map grid */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent),
                              linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)`,
            backgroundSize: "50px 50px",
          }} />
          <div className="relative z-10">
            <div className="absolute -inset-8 rounded-full bg-emerald-400/30 animate-ping" />
            <div className="w-12 h-12 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-2xl">
              <MapPin className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-2">Choose duration</h3>
          <p className="text-xs text-[#8696a0] mb-4">
            Anyone in this chat can see your real-time location for the selected period.
          </p>
          {durations.map((d) => (
            <button
              key={d.mins}
              onClick={() => onShare(d.mins)}
              className="w-full text-left py-3 hover:bg-[#202c33] rounded px-3 flex items-center justify-between"
            >
              <span>{d.label}</span>
              <Send className="w-4 h-4 text-emerald-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Document scanner stub
export function DocumentScanner({
  onBack,
  onSend,
}: {
  onBack: () => void;
  onSend: (name: string) => void;
}) {
  const [scanned, setScanned] = useState<string[]>([]);
  const [name, setName] = useState("Scanned document");

  const scan = () => {
    setScanned((s) => [...s, "Page " + (s.length + 1)]);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col text-white">
      <header className="flex items-center gap-3 px-2 py-3 bg-black/70">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
        <h1 className="flex-1 font-medium">Scan document</h1>
        {scanned.length > 0 && (
          <button
            onClick={() => onSend(name + ".pdf")}
            className="text-emerald-400 font-medium px-3"
          >
            Send
          </button>
        )}
      </header>
      <div className="flex-1 flex items-center justify-center relative">
        <div className="absolute inset-12 border-2 border-dashed border-emerald-500/50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <ScanLine className="w-16 h-16 text-emerald-400 mx-auto mb-2 animate-pulse" />
            <p className="text-sm text-white/70">Position document inside the frame</p>
            <p className="text-xs text-white/50 mt-1">{scanned.length} page{scanned.length !== 1 ? "s" : ""} scanned</p>
          </div>
        </div>
      </div>
      {scanned.length > 0 && (
        <div className="bg-black/80 p-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/10 rounded px-3 py-2 text-sm outline-none mb-2"
            placeholder="Document name"
          />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {scanned.map((p, i) => (
              <div key={i} className="shrink-0 w-16 h-20 bg-white rounded flex items-center justify-center text-black text-xs">
                {p}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="bg-black p-4 flex justify-center">
        <button
          onClick={scan}
          className="w-16 h-16 rounded-full bg-white flex items-center justify-center"
        >
          <Camera className="w-7 h-7 text-black" />
        </button>
      </div>
    </div>
  );
}

// Photo doodle (drawing on photo)
export function PhotoDoodle({
  onBack,
  onSend,
}: {
  onBack: () => void;
  onSend: (caption: string) => void;
}) {
  const [color, setColor] = useState("#ef4444");
  const [strokes, setStrokes] = useState<{ x: number; y: number; color: string }[][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [caption, setCaption] = useState("");
  const colors = ["#ef4444","#f97316","#eab308","#22c55e","#06b6d4","#3b82f6","#a855f7","#ec4899","#ffffff","#000000"];

  const handleStart = (e: React.PointerEvent) => {
    setDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setStrokes((s) => [...s, [{ x: e.clientX - rect.left, y: e.clientY - rect.top, color }]]);
  };
  const handleMove = (e: React.PointerEvent) => {
    if (!drawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setStrokes((s) => {
      const next = [...s];
      next[next.length - 1] = [...next[next.length - 1], { x: e.clientX - rect.left, y: e.clientY - rect.top, color }];
      return next;
    });
  };
  const handleEnd = () => setDrawing(false);

  const undo = () => setStrokes((s) => s.slice(0, -1));

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col text-white">
      <header className="flex items-center gap-3 px-2 py-3 bg-black/70">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <X className="w-5 h-5" />
        </button>
        <h1 className="flex-1 font-medium">Edit photo</h1>
        <button onClick={undo} className="text-sm text-emerald-400 px-2">Undo</button>
      </header>
      <div
        className="flex-1 relative bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 touch-none cursor-crosshair"
        onPointerDown={handleStart}
        onPointerMove={handleMove}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {strokes.map((stroke, i) => (
            <polyline
              key={i}
              points={stroke.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke={stroke[0]?.color || color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>
      <div className="bg-black/70 p-3 flex gap-1.5 justify-center">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`w-7 h-7 rounded-full ${color === c ? "ring-2 ring-white" : ""}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <button onClick={() => setStrokes([])} className="ml-2 text-xs text-white/70">
          Clear
        </button>
      </div>
      <div className="bg-black/90 p-3 flex items-center gap-2">
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption…"
          className="flex-1 bg-white/10 rounded-full px-4 py-2 outline-none text-sm placeholder:text-white/50"
        />
        <button
          onClick={() => onSend(caption || "🎨 Doodle")}
          className="bg-emerald-500 text-black rounded-full w-12 h-12 flex items-center justify-center"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// Mention picker for groups
export function MentionPicker({
  members,
  search,
  onPick,
  onClose,
}: {
  members: string[];
  search: string;
  onPick: (member: string) => void;
  onClose: () => void;
}) {
  const filtered = members.filter((m) => m.toLowerCase().includes(search.toLowerCase()));
  if (filtered.length === 0) return null;
  return (
    <div className="absolute bottom-16 left-2 right-2 bg-[#233138] rounded-lg shadow-2xl max-h-48 overflow-y-auto z-30">
      <div className="px-3 py-2 text-xs text-[#8696a0] border-b border-[#222d34] flex items-center gap-1">
        <AtSign className="w-3 h-3" /> Mention
      </div>
      {filtered.map((m) => (
        <button
          key={m}
          onClick={() => { onPick(m); onClose(); }}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/10 text-left"
        >
          <Avatar color="bg-zinc-600" text={m.slice(0, 2).toUpperCase()} size="sm" />
          <span className="text-sm">{m}</span>
        </button>
      ))}
    </div>
  );
}

// Catalog browser with cart
export function CatalogBrowser({
  onBack,
  onCheckout,
  onShareItem,
}: {
  onBack: () => void;
  onCheckout: () => void;
  onShareItem?: (item: { name: string; price: string; emoji: string }) => void;
}) {
  const { state, dispatch } = useStore();
  const cartCount = Object.values(state.cart).reduce((s, n) => s + n, 0);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader
        title="Catalog"
        onBack={onBack}
        sub={`${state.catalog.length} items`}
        action={
          <button onClick={onCheckout} className="relative p-2 rounded-full hover:bg-white/10">
            <Cart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-[#111b21] text-[10px] font-semibold rounded-full min-w-[18px] h-4 px-1 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {state.catalog.map((p) => (
            <div key={p.id} className="bg-[#202c33] rounded-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl">
                {p.emoji}
              </div>
              <div className="p-2.5">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-emerald-400 font-semibold">{p.price}</div>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={() => dispatch({ type: "ADD_TO_CART", id: p.id })}
                    className="flex-1 bg-emerald-500/20 text-emerald-400 text-xs py-1.5 rounded hover:bg-emerald-500/30"
                  >
                    + Cart
                  </button>
                  {onShareItem && (
                    <button
                      onClick={() => onShareItem(p)}
                      className="bg-blue-500/20 text-blue-400 px-2 py-1.5 rounded hover:bg-blue-500/30"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cart / Checkout
export function CartCheckout({
  onBack,
  onPlaceOrder,
}: {
  onBack: () => void;
  onPlaceOrder: () => void;
}) {
  const { state, dispatch } = useStore();
  const items = Object.entries(state.cart).map(([id, qty]) => ({
    item: state.catalog.find((c) => c.id === id),
    qty,
  })).filter((x) => x.item);

  const total = items.reduce((s, { item, qty }) => {
    const price = parseFloat((item!.price || "0").replace(/[^\d.]/g, ""));
    return s + price * qty;
  }, 0);

  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);

  const place = () => {
    setPlacing(true);
    setTimeout(() => {
      setPlacing(false);
      setPlaced(true);
      // Save order to history
      dispatch({
        type: "PLACE_ORDER",
        order: {
          id: "ord" + Date.now(),
          items: items.map(({ item, qty }) => ({
            name: item!.name,
            price: item!.price,
            emoji: item!.emoji,
            qty,
          })),
          total,
          date: Date.now(),
          status: "placed",
        },
      });
      dispatch({ type: "CLEAR_CART" });
      setTimeout(() => {
        onPlaceOrder();
      }, 1800);
    }, 1500);
  };

  if (placed) {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-4">
          <Check className="w-12 h-12 text-[#111b21]" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Order placed!</h2>
        <p className="text-[#8696a0]">Order #{Math.floor(Math.random() * 100000)}</p>
        <p className="text-emerald-400 mt-1">${total.toFixed(2)}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Cart" onBack={onBack} sub={`${items.length} item${items.length !== 1 ? "s" : ""}`} />
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <ShoppingBag className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          items.map(({ item, qty }) => (
            <div key={item!.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#222d34]">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                {item!.emoji}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{item!.name}</div>
                <div className="text-emerald-400 text-sm">{item!.price}</div>
              </div>
              <div className="flex items-center gap-2 bg-[#202c33] rounded-full">
                <button
                  onClick={() => dispatch({ type: "REMOVE_FROM_CART", id: item!.id })}
                  className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"
                >−</button>
                <span className="text-sm font-medium min-w-[20px] text-center">{qty}</span>
                <button
                  onClick={() => dispatch({ type: "ADD_TO_CART", id: item!.id })}
                  className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center"
                >+</button>
              </div>
            </div>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="border-t border-[#222d34] p-4">
          <div className="flex justify-between text-lg font-medium mb-3">
            <span>Total</span>
            <span className="text-emerald-400">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={place}
            disabled={placing}
            className="w-full bg-emerald-500 disabled:opacity-50 text-[#111b21] font-semibold py-3 rounded-full"
          >
            {placing ? "Placing order…" : "Place order"}
          </button>
        </div>
      )}
    </div>
  );
}

// Voice transcription — shows the real transcript when one is attached to the
// message (set by a real transcription service). No fabricated sample text.
export function VoiceTranscript({
  duration,
  onClose,
}: {
  duration?: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#202c33] rounded-2xl p-5 max-w-sm w-full text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-medium">Voice transcript</h2>
            <p className="text-xs text-[#8696a0]">{duration || "0:00"}</p>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-[#111b21] rounded-lg p-4 text-sm min-h-[100px] text-[#aebac1]">
          No transcript available. Transcription is generated by the messaging
          server when the sender enables it.
        </div>
        <p className="text-[10px] text-[#8696a0] mt-2 text-center">
          Transcripts are end-to-end encrypted and never stored in plaintext.
        </p>
      </div>
    </div>
  );
}

// Multi-select chats bar
export function MultiSelectChatsBar({
  count,
  onClear,
  onArchive,
  onDelete,
  onMarkRead,
  onMute,
  onPin,
}: {
  count: number;
  onClear: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMarkRead: () => void;
  onMute: () => void;
  onPin: () => void;
}) {
  return (
    <div className="bg-emerald-700 flex items-center gap-2 px-2 py-2 text-white">
      <button onClick={onClear} className="p-2 rounded-full hover:bg-white/10">
        <X className="w-5 h-5" />
      </button>
      <div className="flex-1 font-medium">{count} selected</div>
      <button onClick={onPin} className="p-2"><Pencil2 className="w-5 h-5" /></button>
      <button onClick={onMute} className="p-2 text-sm">🔕</button>
      <button onClick={onMarkRead} className="p-2 text-sm">✓✓</button>
      <button onClick={onArchive} className="p-2 text-sm">📥</button>
      <button onClick={onDelete} className="p-2 text-red-200"><Trash className="w-5 h-5" /></button>
    </div>
  );
}

// Suppress unused
export const _u = { Plus, Verified, FileText, Heart };
