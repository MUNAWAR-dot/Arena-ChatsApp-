import { useState } from "react";
import type { Chat } from "../data";
import { ArrowLeft, Image as ImageIcon, FileText, Globe } from "../icons";

export function MediaGallery({
  chat,
  onBack,
  onOpenMedia,
}: {
  chat: Chat;
  onBack: () => void;
  onOpenMedia: (msgId: string) => void;
}) {
  const [tab, setTab] = useState<"media" | "docs" | "links">("media");
  const media = chat.messages.filter((m) => m.type === "image" || m.type === "video");
  const docs = chat.messages.filter((m) => m.type === "doc");
  const links = chat.messages.filter((m) => m.text && /https?:\/\//.test(m.text));

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33]">
        <div className="flex items-center gap-3 px-2 py-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="font-medium">Media, links and docs</div>
            <div className="text-xs text-[#8696a0]">{chat.name}</div>
          </div>
        </div>
        <div className="flex">
          {(["media","docs","links"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium uppercase tracking-wide ${
                tab === t ? "text-emerald-400 border-b-2 border-emerald-400" : "text-[#8696a0]"
              }`}
            >
              {t === "media" ? `Media (${media.length})` : t === "docs" ? `Docs (${docs.length})` : `Links (${links.length})`}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-2">
        {tab === "media" && (
          media.length === 0 ? (
            <Empty icon={ImageIcon} text="No media" />
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {media.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onOpenMedia(m.id)}
                  className="aspect-square bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center"
                >
                  <ImageIcon className="w-8 h-8 text-white/70" />
                </button>
              ))}
            </div>
          )
        )}
        {tab === "docs" && (
          docs.length === 0 ? (
            <Empty icon={FileText} text="No documents" />
          ) : (
            docs.map((m) => (
              <button
                key={m.id}
                onClick={() => onOpenMedia(m.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#202c33] rounded-lg text-left"
              >
                <FileText className="w-10 h-10 text-emerald-400" />
                <div>
                  <div className="font-medium text-sm">{m.media}</div>
                  <div className="text-xs text-[#8696a0]">PDF · 124 KB · {m.time}</div>
                </div>
              </button>
            ))
          )
        )}
        {tab === "links" && (
          links.length === 0 ? (
            <Empty icon={Globe} text="No links shared" />
          ) : (
            links.map((m) => (
              <div key={m.id} className="p-3 border-b border-[#222d34]">
                <div className="text-sm text-emerald-400 truncate">{m.text}</div>
                <div className="text-xs text-[#8696a0] mt-1">{m.time}</div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#8696a0]">
      <Icon className="w-16 h-16 opacity-30 mb-3" />
      <p className="text-sm">{text}</p>
    </div>
  );
}
