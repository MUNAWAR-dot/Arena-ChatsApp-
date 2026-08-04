import { useState } from "react";
import { useStore } from "../store";
import { ArrowLeft, Phone, Video, Backspace, UserPlus } from "../icons";

const keys = [
  { d: "1", l: "" },
  { d: "2", l: "ABC" },
  { d: "3", l: "DEF" },
  { d: "4", l: "GHI" },
  { d: "5", l: "JKL" },
  { d: "6", l: "MNO" },
  { d: "7", l: "PQRS" },
  { d: "8", l: "TUV" },
  { d: "9", l: "WXYZ" },
  { d: "*", l: "" },
  { d: "0", l: "+" },
  { d: "#", l: "" },
];

export function Dialer({
  onBack,
  onCall,
}: {
  onBack: () => void;
  onCall: (name: string, type: "voice" | "video", color: string, text: string) => void;
}) {
  const { state, dispatch } = useStore();
  const [number, setNumber] = useState("");

  const press = (d: string) => setNumber((n) => n + d);
  const back = () => setNumber((n) => n.slice(0, -1));

  // Match against existing chat
  const cleanNum = number.replace(/\D/g, "");
  const matched = state.chats.find((c) =>
    c.phone && c.phone.replace(/\D/g, "").includes(cleanNum) && cleanNum.length >= 4
  );

  const placeCall = (type: "voice" | "video") => {
    if (matched) {
      onCall(matched.name, type, matched.avatarColor, matched.avatarText);
    } else if (number.length >= 4) {
      // Create a new contact + chat
      const id = "dialer-" + cleanNum;
      const colors = ["bg-pink-500","bg-blue-500","bg-orange-500","bg-purple-500"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      dispatch({
        type: "CREATE_CHAT",
        chat: {
          id,
          name: number,
          avatarColor: color,
          avatarText: "?",
          lastMessage: "",
          time: "now",
          unread: 0,
          online: false,
          phone: number,
          about: "Unknown contact",
          messages: [],
        },
      });
      onCall(number, type, color, "?");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <header className="bg-[#202c33] flex items-center gap-3 px-2 py-3">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Dial number</h1>
      </header>

      <div className="flex-1 flex flex-col p-6">
        <div className="text-center my-6 min-h-[80px] flex flex-col justify-center">
          <div className="text-4xl font-light tracking-wider min-h-[48px] break-all">{number || "·"}</div>
          {matched && (
            <div className="text-emerald-400 text-sm mt-2">{matched.name}</div>
          )}
          {!matched && number.length >= 4 && (
            <button
              onClick={() => {
                dispatch({
                  type: "ADD_CONTACT",
                  contact: {
                    id: "dial-" + cleanNum,
                    name: number,
                    phone: number,
                    avatarColor: "bg-emerald-500",
                    avatarText: "?",
                  },
                });
                alert(`Contact saved: ${number}`);
              }}
              className="text-emerald-400 text-sm mt-2 flex items-center justify-center gap-1 mx-auto"
            >
              <UserPlus className="w-4 h-4" /> Add to contacts
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 flex-1">
          {keys.map((k) => (
            <button
              key={k.d}
              onClick={() => press(k.d)}
              className="aspect-square max-h-20 rounded-full bg-[#202c33] hover:bg-[#2a3942] flex flex-col items-center justify-center"
            >
              <span className="text-2xl">{k.d}</span>
              {k.l && <span className="text-[10px] text-[#8696a0] -mt-1">{k.l}</span>}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-around mt-6">
          <button
            onClick={() => placeCall("video")}
            disabled={number.length < 4}
            className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center disabled:opacity-30"
          >
            <Video className="w-5 h-5 text-emerald-400" />
          </button>
          <button
            onClick={() => placeCall("voice")}
            disabled={number.length < 4}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 flex items-center justify-center"
          >
            <Phone className="w-6 h-6 text-[#111b21]" />
          </button>
          <button
            onClick={back}
            disabled={!number}
            className="w-12 h-12 rounded-full bg-[#202c33] flex items-center justify-center disabled:opacity-30"
          >
            <Backspace className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
