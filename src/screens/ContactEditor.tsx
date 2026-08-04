import { useState } from "react";
import { useStore } from "../store";
import type { CustomContact } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, User, Phone, Mail, Trash, Check } from "../icons";

export function ContactEditor({
  existing,
  onBack,
  onSaved,
}: {
  existing?: CustomContact;
  onBack: () => void;
  onSaved: (contact: CustomContact) => void;
}) {
  const { dispatch } = useStore();
  const [name, setName] = useState(existing?.name || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [notes, setNotes] = useState(existing?.notes || "");

  const colors = ["bg-pink-500","bg-blue-500","bg-purple-500","bg-orange-500","bg-emerald-500","bg-rose-500","bg-teal-500","bg-indigo-500"];

  const save = () => {
    if (!name.trim() || !phone.trim()) return;
    const contact: CustomContact = {
      id: existing?.id || "ct" + Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      avatarColor: existing?.avatarColor || colors[Math.floor(Math.random() * colors.length)],
      avatarText: name.trim().slice(0, 2).toUpperCase(),
    };
    if (existing) {
      dispatch({ type: "UPDATE_CONTACT", id: existing.id, updates: contact });
    } else {
      dispatch({ type: "ADD_CONTACT", contact });
    }
    onSaved(contact);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium flex-1">{existing ? "Edit contact" : "New contact"}</h1>
        <button
          onClick={save}
          disabled={!name.trim() || !phone.trim()}
          className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30"
        >
          <Check className="w-5 h-5 text-emerald-400" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center py-6">
          <Avatar
            color={existing?.avatarColor || "bg-emerald-600"}
            text={(name || "?").slice(0, 2).toUpperCase()}
            size="2xl"
          />
        </div>

        <div className="px-4 space-y-3">
          <Field icon={User} placeholder="First name" value={name} onChange={setName} />
          <Field icon={Phone} placeholder="Phone" value={phone} onChange={setPhone} />
          <Field icon={Mail} placeholder="Email (optional)" value={email} onChange={setEmail} />
          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes…"
              rows={3}
              className="w-full bg-[#202c33] rounded-lg p-3 outline-none text-sm placeholder:text-[#8696a0] resize-none"
            />
          </div>
        </div>

        {existing && (
          <button
            onClick={() => {
              if (confirm(`Delete ${existing.name}?`)) {
                dispatch({ type: "DELETE_CONTACT", id: existing.id });
                onBack();
              }
            }}
            className="w-full px-4 py-3 mt-6 hover:bg-[#202c33] text-left text-red-400 flex items-center gap-3"
          >
            <Trash className="w-5 h-5" /> Delete contact
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange }: { icon: any; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#222d34] pb-2">
      <Icon className="w-5 h-5 text-[#8696a0]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none py-2 text-sm"
      />
    </div>
  );
}
