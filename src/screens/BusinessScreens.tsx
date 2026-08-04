import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, Briefcase, ShoppingBag, Zap, Plus, Trash, Check, X, Tag,
  ChevronRight, MapPin, Globe, Clock, Mail
} from "../icons";
import { Toggle } from "./SubSettings";

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

export function BusinessTools({
  onBack,
  onProfile,
  onCatalog,
  onQuickReplies,
  onLabels,
}: {
  onBack: () => void;
  onProfile: () => void;
  onCatalog: () => void;
  onQuickReplies: () => void;
  onLabels: () => void;
}) {
  const { state, dispatch } = useStore();
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Business tools" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-[#222d34]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="font-medium">Business mode</div>
              <div className="text-xs text-[#8696a0]">Use Chatsapp Business features</div>
            </div>
            <div className="ml-auto">
              <Toggle
                on={state.business.enabled}
                onChange={(v) => dispatch({ type: "UPDATE_BUSINESS", updates: { enabled: v } })}
              />
            </div>
          </div>
        </div>

        {state.business.enabled ? (
          <>
            <button onClick={onProfile} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
              <Briefcase className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <div className="font-medium">Business profile</div>
                <div className="text-xs text-[#8696a0]">{state.business.businessName || "Set up your business"}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8696a0]" />
            </button>
            <button onClick={onCatalog} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
              <ShoppingBag className="w-5 h-5 text-purple-400" />
              <div className="flex-1">
                <div className="font-medium">Catalog</div>
                <div className="text-xs text-[#8696a0]">{state.catalog.length} items</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8696a0]" />
            </button>
            <button onClick={onQuickReplies} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
              <Zap className="w-5 h-5 text-yellow-400" />
              <div className="flex-1">
                <div className="font-medium">Quick replies</div>
                <div className="text-xs text-[#8696a0]">{state.quickReplies.length} templates</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8696a0]" />
            </button>
            <button onClick={onLabels} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
              <Tag className="w-5 h-5 text-pink-400" />
              <div className="flex-1">
                <div className="font-medium">Labels</div>
                <div className="text-xs text-[#8696a0]">{state.labels.length} labels</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8696a0]" />
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
              <Zap className="w-5 h-5 text-orange-400" />
              <div className="flex-1">
                <div className="font-medium">Greeting message</div>
                <div className="text-xs text-[#8696a0]">Off</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8696a0]" />
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#202c33] text-left">
              <Clock className="w-5 h-5 text-emerald-400" />
              <div className="flex-1">
                <div className="font-medium">Away message</div>
                <div className="text-xs text-[#8696a0]">Off</div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8696a0]" />
            </button>
          </>
        ) : (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <Briefcase className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enable Business mode to access tools for managing customers, catalogs, and quick replies.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function BusinessProfileEditor({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [name, setName] = useState(state.business.businessName || "");
  const [category, setCategory] = useState(state.business.category || "");
  const [desc, setDesc] = useState(state.business.description || "");
  const [address, setAddress] = useState(state.business.address || "");
  const [hours, setHours] = useState(state.business.hours || "");
  const [website, setWebsite] = useState(state.business.website || "");

  const categories = ["Retail", "Restaurant", "Beauty", "Health", "Education", "Tech", "Services", "Other"];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Business profile" onBack={onBack} action={
        <button
          onClick={() => {
            dispatch({
              type: "UPDATE_BUSINESS",
              updates: { businessName: name, category, description: desc, address, hours, website },
            });
            onBack();
          }}
          className="p-2 text-emerald-400"
        ><Check className="w-5 h-5" /></button>
      } />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col items-center mb-2">
          <Avatar color="bg-emerald-600" text={(name || "BIZ").slice(0, 2).toUpperCase()} size="2xl" />
        </div>
        <div>
          <label className="text-xs text-[#8696a0] block mb-1">Business name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#202c33] rounded p-2 outline-none" placeholder="Your business name" />
        </div>
        <div>
          <label className="text-xs text-[#8696a0] block mb-1">Category</label>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 text-sm rounded-full ${category === c ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-[#8696a0] block mb-1">Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full bg-[#202c33] rounded p-2 outline-none text-sm resize-none" placeholder="What does your business do?" />
        </div>
        <Field icon={MapPin} placeholder="Address" value={address} onChange={setAddress} />
        <Field icon={Clock} placeholder="Hours (e.g. Mon-Fri 9-5)" value={hours} onChange={setHours} />
        <Field icon={Globe} placeholder="Website" value={website} onChange={setWebsite} />
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange }: { icon: any; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 bg-[#202c33] rounded p-2">
      <Icon className="w-5 h-5 text-[#8696a0]" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="flex-1 bg-transparent outline-none text-sm" />
    </div>
  );
}

export function CatalogEditor({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [emoji, setEmoji] = useState("🛍️");

  const emojis = ["🛍️","📱","💻","🎧","👟","👕","☕","🍕","📚","🎮","🪑","💄","🎨","⚽","🚲","🌹"];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader
        title="Catalog"
        onBack={onBack}
        sub={`${state.catalog.length} items`}
        action={
          <button onClick={() => setAdding(true)} className="p-2 text-emerald-400">
            <Plus className="w-5 h-5" />
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {state.catalog.map((p) => (
            <div key={p.id} className="bg-[#202c33] rounded-lg p-3 relative group">
              <div className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-5xl mb-2">
                {p.emoji}
              </div>
              <div className="text-sm font-medium truncate">{p.name}</div>
              <div className="text-emerald-400 font-semibold">{p.price}</div>
              <button
                onClick={() => {
                  if (confirm(`Delete ${p.name}?`)) dispatch({ type: "DELETE_CATALOG_ITEM", id: p.id });
                }}
                className="absolute top-2 right-2 bg-black/40 rounded-full w-6 h-6 flex items-center justify-center text-red-400"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => setAdding(true)}
            className="bg-[#202c33] hover:bg-[#2a3942] rounded-lg p-3 flex flex-col items-center justify-center aspect-square text-emerald-400"
          >
            <Plus className="w-8 h-8" />
            <span className="text-sm mt-1">Add item</span>
          </button>
        </div>
      </div>

      {adding && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={() => setAdding(false)}>
          <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">Add catalog item</h2>
              <button onClick={() => setAdding(false)}><X className="w-5 h-5" /></button>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className="w-full bg-[#111b21] rounded p-2 outline-none mb-2" />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (e.g. $9.99)" className="w-full bg-[#111b21] rounded p-2 outline-none mb-3" />
            <div className="text-xs text-[#8696a0] mb-2">Choose icon</div>
            <div className="grid grid-cols-8 gap-1 mb-4">
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded ${emoji === e ? "bg-emerald-500/30" : "hover:bg-white/5"}`}
                >
                  {e}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (name.trim() && price.trim()) {
                  dispatch({
                    type: "ADD_CATALOG_ITEM",
                    item: { id: "p" + Date.now(), name: name.trim(), price: price.trim(), emoji },
                  });
                  setName("");
                  setPrice("");
                  setAdding(false);
                }
              }}
              disabled={!name.trim() || !price.trim()}
              className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuickReplies({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [shortcut, setShortcut] = useState("");
  const [text, setText] = useState("");

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Quick replies" onBack={onBack} sub={`${state.quickReplies.length} templates`} action={
        <button onClick={() => setAdding(true)} className="p-2 text-emerald-400">
          <Plus className="w-5 h-5" />
        </button>
      } />
      <div className="flex-1 overflow-y-auto">
        {state.quickReplies.length === 0 && (
          <div className="text-center text-sm text-[#8696a0] mt-12 px-8">
            <Zap className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>Quick replies let you reuse messages.</p>
            <p className="text-xs mt-2">In a chat, type the shortcut to insert.</p>
          </div>
        )}
        {state.quickReplies.map((q) => (
          <div key={q.id} className="px-4 py-3 border-b border-[#222d34] flex items-start gap-3">
            <div className="flex-1">
              <div className="text-emerald-400 text-sm font-mono">{q.shortcut}</div>
              <div className="text-sm mt-1">{q.text}</div>
            </div>
            <button
              onClick={() => dispatch({ type: "DELETE_QUICK_REPLY", id: q.id })}
              className="text-red-400 p-1"
            ><Trash className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {adding && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={() => setAdding(false)}>
          <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">New quick reply</h2>
              <button onClick={() => setAdding(false)}><X className="w-5 h-5" /></button>
            </div>
            <input
              value={shortcut}
              onChange={(e) => {
                let v = e.target.value;
                if (!v.startsWith("/")) v = "/" + v.replace("/", "");
                setShortcut(v);
              }}
              placeholder="/shortcut"
              className="w-full bg-[#111b21] rounded p-2 mb-2 outline-none font-mono"
            />
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Message text"
              rows={3}
              className="w-full bg-[#111b21] rounded p-2 outline-none resize-none text-sm"
            />
            <button
              onClick={() => {
                if (shortcut.length > 1 && text.trim()) {
                  dispatch({
                    type: "ADD_QUICK_REPLY",
                    reply: { id: "q" + Date.now(), shortcut, text: text.trim() },
                  });
                  setShortcut("");
                  setText("");
                  setAdding(false);
                }
              }}
              disabled={shortcut.length < 2 || !text.trim()}
              className="w-full mt-3 bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LabelsManager({
  onBack,
}: {
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState("bg-blue-500");

  const colors = [
    "bg-red-500","bg-orange-500","bg-yellow-500","bg-green-500",
    "bg-emerald-500","bg-cyan-500","bg-blue-500","bg-purple-500",
    "bg-pink-500","bg-rose-500"
  ];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Labels" onBack={onBack} action={
        <button onClick={() => setAdding(true)} className="p-2 text-emerald-400">
          <Plus className="w-5 h-5" />
        </button>
      } />
      <div className="flex-1 overflow-y-auto">
        {state.labels.map((l) => {
          const count = Object.values(state.chatLabels).filter((ids) => ids.includes(l.id)).length;
          return (
            <div key={l.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#222d34]">
              <div className={`w-4 h-4 rounded-full ${l.color}`} />
              <div className="flex-1">
                <div className="font-medium">{l.name}</div>
                <div className="text-xs text-[#8696a0]">{count} chat{count !== 1 ? "s" : ""}</div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete label "${l.name}"?`)) dispatch({ type: "DELETE_LABEL", id: l.id });
                }}
                className="text-red-400 p-1"
              ><Trash className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
      {adding && (
        <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={() => setAdding(false)}>
          <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-medium">New label</h2>
              <button onClick={() => setAdding(false)}><X className="w-5 h-5" /></button>
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Label name"
              className="w-full bg-[#111b21] rounded p-2 mb-3 outline-none"
            />
            <div className="text-xs text-[#8696a0] mb-2">Color</div>
            <div className="grid grid-cols-10 gap-2 mb-4">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full ${c} ${color === c ? "ring-2 ring-white" : ""}`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                if (name.trim()) {
                  dispatch({
                    type: "ADD_LABEL",
                    label: { id: "l" + Date.now(), name: name.trim(), color },
                  });
                  setName("");
                  setAdding(false);
                }
              }}
              disabled={!name.trim()}
              className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Picker for assigning labels to a chat
export function ChatLabelsPicker({
  chatId,
  onClose,
}: {
  chatId: string;
  onClose: () => void;
}) {
  const { state, dispatch } = useStore();
  const assigned = state.chatLabels[chatId] || [];
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
      <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white max-h-[60%] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">Assign labels</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        {state.labels.map((l) => {
          const isOn = assigned.includes(l.id);
          return (
            <button
              key={l.id}
              onClick={() => dispatch({ type: "TOGGLE_CHAT_LABEL", chatId, labelId: l.id })}
              className="w-full flex items-center gap-3 py-2.5 hover:bg-white/5 rounded px-2"
            >
              <div className={`w-4 h-4 rounded-full ${l.color}`} />
              <span className="flex-1 text-left">{l.name}</span>
              {isOn && <Check className="w-5 h-5 text-emerald-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// (suppress unused)
export const _u = { Mail };
