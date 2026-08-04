import { useState } from "react";
import { useStore } from "../store";
import { Avatar } from "../components/Avatar";
import { ArrowLeft, Camera, Pencil, User, Info, Phone, Check, X, Sparkles, Image as ImageIcon } from "../icons";
import { ProfilePhotoEditor } from "./MoreFeatures";

export function Profile({ onBack, onAvatarCreator, onPhotoHistory }: { onBack: () => void; onAvatarCreator: () => void; onPhotoHistory?: () => void }) {
  const { state, dispatch } = useStore();
  const [editingName, setEditingName] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [name, setName] = useState(state.profile.name);
  const [about, setAbout] = useState(state.profile.about);
  const [showColors, setShowColors] = useState(false);
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);

  const colors = ["bg-emerald-600","bg-pink-500","bg-purple-500","bg-blue-500","bg-orange-500","bg-rose-500","bg-teal-500","bg-indigo-500","bg-fuchsia-500","bg-amber-500"];

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3 bg-[#202c33]">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-medium">Profile</h1>
      </header>

      <div className="flex flex-col items-center py-8">
        <div className="relative">
          <Avatar
            color={state.profile.avatarColor}
            text={state.profile.avatarText}
            photoUrl={state.profile.photoUrl}
            size="2xl"
          />
          <button
            onClick={() => setShowPhotoEditor(true)}
            className="absolute bottom-0 right-0 bg-emerald-500 rounded-full w-10 h-10 flex items-center justify-center"
          >
            <Camera className="w-5 h-5 text-[#111b21]" />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={onAvatarCreator}
            className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-500/10 px-4 py-1.5 rounded-full"
          >
            <Sparkles className="w-4 h-4" /> Create avatar
          </button>
          {onPhotoHistory && (
            <button
              onClick={onPhotoHistory}
              className="text-emerald-400 text-sm bg-emerald-500/10 px-4 py-1.5 rounded-full flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" /> History
            </button>
          )}
        </div>
        {showColors && (
          <div className="mt-4 grid grid-cols-5 gap-3">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => {
                  dispatch({ type: "UPDATE_PROFILE", profile: { avatarColor: c } });
                  setShowColors(false);
                }}
                className={`w-10 h-10 rounded-full ${c} ${state.profile.avatarColor === c ? "ring-2 ring-white" : ""}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-start gap-4 px-4 py-4 border-b border-[#222d34]">
          <User className="w-5 h-5 text-[#8696a0] mt-1" />
          <div className="flex-1">
            <div className="text-xs text-[#8696a0]">Name</div>
            {editingName ? (
              <div className="flex gap-2 items-center">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent border-b border-emerald-500 outline-none py-1"
                />
                <button onClick={() => { setName(state.profile.name); setEditingName(false); }}><X className="w-5 h-5" /></button>
                <button onClick={() => {
                  if (name.trim()) {
                    dispatch({ type: "UPDATE_PROFILE", profile: { name: name.trim(), avatarText: name.trim().slice(0,2).toUpperCase() } });
                  }
                  setEditingName(false);
                }}><Check className="w-5 h-5 text-emerald-400" /></button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span>{state.profile.name}</span>
                <button onClick={() => setEditingName(true)}><Pencil className="w-4 h-4 text-[#8696a0]" /></button>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-[#8696a0] px-4 pt-2 pb-4 ml-9">
          This is not your username or pin. This name will be visible to your Chatsapp contacts.
        </p>

        <div className="flex items-start gap-4 px-4 py-4 border-b border-[#222d34]">
          <Info className="w-5 h-5 text-[#8696a0] mt-1" />
          <div className="flex-1">
            <div className="text-xs text-[#8696a0]">About</div>
            {editingAbout ? (
              <div className="flex gap-2 items-center">
                <input
                  autoFocus
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="flex-1 bg-transparent border-b border-emerald-500 outline-none py-1"
                />
                <button onClick={() => { setAbout(state.profile.about); setEditingAbout(false); }}><X className="w-5 h-5" /></button>
                <button onClick={() => {
                  dispatch({ type: "UPDATE_PROFILE", profile: { about: about.trim() || "Hey there!" } });
                  setEditingAbout(false);
                }}><Check className="w-5 h-5 text-emerald-400" /></button>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span>{state.profile.about}</span>
                <button onClick={() => setEditingAbout(true)}><Pencil className="w-4 h-4 text-[#8696a0]" /></button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 px-4 py-4">
          <Phone className="w-5 h-5 text-[#8696a0] mt-1" />
          <div className="flex-1">
            <div className="text-xs text-[#8696a0]">Phone</div>
            <div>{state.profile.phone}</div>
          </div>
        </div>
      </div>

      {showPhotoEditor && (
        <ProfilePhotoEditor onBack={() => setShowPhotoEditor(false)} />
      )}
    </div>
  );
}
