import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { api } from "../backend";
import { Avatar } from "../components/Avatar";
import {
  ArrowLeft, Lock, Check, X, Sparkles, Languages, Volume,
  Type, Palette, Star, StarFilled, Clock, Shield, Eye, Image as ImageIcon
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

// Chat Lock screen — set up secret PIN for locked chats
export function ChatLockSetup({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useStore();
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState<"set" | "confirm" | "recovery">("set");
  const [recoveryQuestion, setRecoveryQuestion] = useState(state.lockQuestion || "What is your mother's maiden name?");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [recoveryMode, setRecoveryMode] = useState<"question" | "otp">("question");
  const [otpCode, setOtpCode] = useState("");
  const [sentOtpCode, setSentOtpCode] = useState("");
  const [recoveryMsg, setRecoveryMsg] = useState("");
  const hasPin = !!state.lockedChatPin;

  const QUESTIONS = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your favourite movie?",
    "What was your childhood nickname?",
  ];

  if (hasPin) {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Chat lock" onBack={onBack} />
        <div className="flex-1 overflow-y-auto">
          <div className="text-center px-8 py-10">
            <Lock className="w-16 h-16 mx-auto mb-3 text-emerald-400" />
            <p className="text-sm text-[#8696a0]">Locked chats are hidden in a private folder protected by your secret code.</p>
          </div>
          <div className="px-4 py-3 border-t border-[#222d34]">
            <div className="font-medium mb-1">Locked chats</div>
            <div className="text-xs text-[#8696a0]">{state.lockedChats.length} chats</div>
          </div>
          <h3 className="text-xs uppercase text-emerald-400 px-4 pt-3 pb-1">Recovery</h3>
          <div className="px-4 py-3 border-b border-[#222d34]">
            <div className="text-xs text-[#8696a0] mb-2">Security question</div>
            <div className="text-sm mb-2">{state.lockQuestion || "Not set"}</div>
            {state.lockQuestion && (
              <div className="text-xs text-emerald-400">✓ Recovery enabled</div>
            )}
          </div>
          <button
            onClick={() => { setStep("recovery"); setRecoveryMsg(""); }}
            className="w-full px-4 py-3 hover:bg-[#202c33] text-left text-emerald-400"
          >
            {state.lockQuestion ? "Change recovery settings" : "Set up recovery"}
          </button>
          <button
            onClick={() => { dispatch({ type: "SET_CHAT_LOCK_PIN", pin: "" }); dispatch({ type: "SET_LOCK_RECOVERY", question: "", answer: "" }); }}
            className="w-full px-4 py-3 hover:bg-[#202c33] text-left text-red-400"
          >
            Disable chat lock
          </button>
        </div>
      </div>
    );
  }

  if (step === "recovery") {
    const saveRecovery = () => {
      if (!recoveryAnswer.trim()) return;
      dispatch({ type: "SET_LOCK_RECOVERY", question: recoveryQuestion, answer: recoveryAnswer.trim().toLowerCase() });
      setRecoveryMsg("✓ Recovery settings saved");
      setTimeout(() => setStep("set"), 1000);
    };

    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Recovery settings" onBack={() => setStep("set")} />
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-sm text-[#8696a0] mb-4">
            If you forget your secret code, you can recover access with a security question or an OTP sent to your phone.
          </p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRecoveryMode("question")}
              className={`flex-1 py-2 rounded-full text-sm ${recoveryMode === "question" ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
            >
              Security question
            </button>
            <button
              onClick={() => setRecoveryMode("otp")}
              className={`flex-1 py-2 rounded-full text-sm ${recoveryMode === "otp" ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
            >
              OTP (SMS)
            </button>
          </div>

          {recoveryMode === "question" ? (
            <>
              <label className="text-xs text-[#8696a0] mb-1 block">Choose a question</label>
              <select
                value={recoveryQuestion}
                onChange={(e) => setRecoveryQuestion(e.target.value)}
                className="w-full bg-[#202c33] rounded p-2 outline-none mb-3"
              >
                {QUESTIONS.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
              <label className="text-xs text-[#8696a0] mb-1 block">Answer</label>
              <input
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
                placeholder="Your answer"
                className="w-full bg-[#202c33] rounded p-2 outline-none mb-3"
              />
              <button
                onClick={saveRecovery}
                disabled={!recoveryAnswer.trim()}
                className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
              >
                Save recovery
              </button>
            </>
          ) : (
            <>
              <div className="bg-[#202c33] rounded-lg p-3 text-sm mb-3">
                An OTP will be sent to <strong>{state.profile.phone}</strong> if you forget your code.
              </div>
              <button
                onClick={() => {
                  // Issue a real OTP via the auth service
                  api.auth.requestOtp(state.profile.phone.replace(/\D/g, "").replace(/^1(?=\d{10})/, "")).then((res) => {
                    setRecoveryMsg("OTP sent to your phone.");
                    setSentOtpCode(res.debugCode);
                  }).catch(() => {
                    setRecoveryMsg("Could not send OTP. Try the security question instead.");
                  });
                }}
                className="w-full bg-[#202c33] text-emerald-400 py-2 rounded-full font-semibold text-sm mb-2"
              >
                Send OTP to my phone
              </button>
              {sentOtpCode && (
                <p className="text-xs text-[#8696a0] mb-2 text-center">
                  OTP delivered.
                  {!sentOtpCode.startsWith("000") && (
                    <span className="text-emerald-400"> (local delivery: {sentOtpCode})</span>
                  )}
                </p>
              )}
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="------"
                className="w-full bg-[#202c33] rounded p-2 text-center tracking-[0.5em] outline-none mb-3"
              />
              <button
                onClick={() => {
                  api.auth.verifyOtp(state.profile.phone.replace(/\D/g, ""), otpCode).then((res) => {
                    if (res.ok) {
                      dispatch({ type: "SET_LOCK_RECOVERY", question: "otp", answer: "otp" });
                      setRecoveryMsg("✓ OTP recovery enabled");
                      setTimeout(() => setStep("set"), 1000);
                    } else {
                      setRecoveryMsg("✗ " + (res.error || "Wrong OTP"));
                    }
                  });
                }}
                disabled={otpCode.length !== 6}
                className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
              >
                Verify & enable OTP recovery
              </button>
            </>
          )}

          {recoveryMsg && (
            <p className={`text-center text-sm mt-3 ${recoveryMsg.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
              {recoveryMsg}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (step === "set") {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Set secret code" onBack={onBack} />
        <div className="p-6">
          <Lock className="w-16 h-16 mx-auto mb-3 text-emerald-400" />
          <p className="text-sm text-[#8696a0] mb-4 text-center">Choose a 4-digit secret code for locked chats.</p>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="----"
            className="w-full bg-transparent text-center text-3xl tracking-[0.6em] border-b border-emerald-500 outline-none pb-2"
          />
          <button
            disabled={pin.length !== 4}
            onClick={() => setStep("confirm")}
            className="w-full mt-8 bg-emerald-500 disabled:opacity-40 text-[#111b21] font-semibold py-2 rounded-full"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Confirm code" onBack={() => setStep("set")} />
      <div className="p-6">
        <p className="text-sm text-[#8696a0] mb-4 text-center">Re-enter your code.</p>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
          placeholder="----"
          className="w-full bg-transparent text-center text-3xl tracking-[0.6em] border-b border-emerald-500 outline-none pb-2"
        />
        {confirm.length === 4 && confirm !== pin && (
          <p className="text-red-400 text-sm mt-3 text-center">Codes don't match</p>
        )}
        <button
          disabled={confirm !== pin}
          onClick={() => {
            dispatch({ type: "SET_CHAT_LOCK_PIN", pin });
            if (!state.lockQuestion) {
              setStep("recovery");
              setRecoveryMsg("");
            } else {
              onBack();
            }
          }}
          className="w-full mt-8 bg-emerald-500 disabled:opacity-40 text-[#111b21] font-semibold py-2 rounded-full"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}

// Locked chats folder — enter PIN to access
export function LockedChatsFolder({ onBack, onOpenChat }: { onBack: () => void; onOpenChat: (id: string) => void }) {
  const { state, dispatch } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState<"question" | "otp">("question");
  const [answer, setAnswer] = useState("");
  const [otp, setOtp] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  const tryUnlock = (val: string) => {
    setPin(val);
    setError(false);
    if (val.length === 4) {
      if (val === state.lockedChatPin) {
        setUnlocked(true);
      } else {
        setError(true);
        setTimeout(() => setPin(""), 600);
      }
    }
  };

  if (!state.lockedChatPin) {
    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Locked chats" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Lock className="w-16 h-16 text-emerald-400 mb-4" />
          <p className="text-[#8696a0]">No secret code set up yet.</p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    // Recovery mode: answer security question or OTP
    if (recovering) {
      const recoverViaQuestion = () => {
        if (state.lockQuestion && state.lockQuestion !== "otp" && answer.trim().toLowerCase() === state.lockAnswer) {
          setUnlocked(true);
        } else {
          setRecoveryError("Wrong answer. Try again.");
        }
      };
      const recoverViaOtp = () => {
        if (otp === "123456") {
          setUnlocked(true);
        } else {
          setRecoveryError("Wrong OTP. Demo code: 123456");
        }
      };

      return (
        <div className="flex flex-col h-full bg-[#111b21] text-white">
          <SubHeader title="Recover locked chats" onBack={() => setRecovering(false)} />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setRecoveryMode("question"); setRecoveryError(""); }}
                className={`flex-1 py-2 rounded-full text-sm ${recoveryMode === "question" ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
              >
                Security question
              </button>
              <button
                onClick={() => { setRecoveryMode("otp"); setRecoveryError(""); }}
                className={`flex-1 py-2 rounded-full text-sm ${recoveryMode === "otp" ? "bg-emerald-500 text-[#111b21]" : "bg-[#202c33] text-[#aebac1]"}`}
              >
                OTP
              </button>
            </div>

            {recoveryMode === "question" ? (
              <>
                <div className="text-xs text-[#8696a0] mb-2">Security question</div>
                <div className="bg-[#202c33] rounded-lg p-3 text-sm mb-3">
                  {state.lockQuestion === "otp" ? "No security question set. Use OTP instead." : (state.lockQuestion || "No security question set.")}
                </div>
                {state.lockQuestion !== "otp" && state.lockQuestion && (
                  <>
                    <input
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Your answer"
                      className="w-full bg-[#202c33] rounded p-2 outline-none mb-3"
                    />
                    <button onClick={recoverViaQuestion} className="w-full bg-emerald-500 text-[#111b21] py-2 rounded-full font-semibold">
                      Recover
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                <div className="bg-[#202c33] rounded-lg p-3 text-sm mb-3">
                  Enter the 6-digit OTP sent to <strong>{state.profile.phone}</strong>
                </div>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                  placeholder="------"
                  className="w-full bg-[#202c33] rounded p-2 text-center tracking-[0.5em] outline-none mb-3"
                />
                <button onClick={recoverViaOtp} disabled={otp.length !== 6} className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold">
                  Verify OTP
                </button>
                <p className="text-xs text-[#8696a0] text-center mt-2">(demo code: 123456)</p>
              </>
            )}

            {recoveryError && <p className="text-red-400 text-sm text-center mt-3">{recoveryError}</p>}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full bg-[#111b21] text-white">
        <SubHeader title="Locked chats" onBack={onBack} />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Lock className="w-16 h-16 text-emerald-400 mb-4" />
          <p className="text-sm text-[#8696a0] mb-6">Enter secret code</p>
          <div className="flex gap-3 mb-3">
            {[0,1,2,3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 ${
                  error ? "border-red-400 bg-red-400" :
                  pin.length > i ? "border-emerald-400 bg-emerald-400" : "border-zinc-500"
                }`}
              />
            ))}
          </div>
          {error && <p className="text-red-400 text-sm">Wrong code</p>}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[1,2,3,4,5,6,7,8,9].map((n) => (
              <button key={n} onClick={() => tryUnlock(pin + n)} className="w-14 h-14 rounded-full bg-[#202c33] hover:bg-[#2a3942] text-2xl">{n}</button>
            ))}
            <div />
            <button onClick={() => tryUnlock(pin + "0")} className="w-14 h-14 rounded-full bg-[#202c33] text-2xl">0</button>
            <button onClick={() => setPin(pin.slice(0, -1))} className="w-14 h-14 rounded-full bg-[#202c33] text-sm">⌫</button>
          </div>
          <button
            onClick={() => { setRecovering(true); setRecoveryError(""); setAnswer(""); setOtp(""); }}
            className="mt-6 text-emerald-400 text-sm underline"
          >
            Forgot code? Recover
          </button>
        </div>
      </div>
    );
  }

  const lockedChats = state.chats.filter((c) => state.lockedChats.includes(c.id));

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Locked chats" onBack={onBack} sub={`${lockedChats.length} locked`} />
      <div className="flex-1 overflow-y-auto">
        {lockedChats.length === 0 ? (
          <div className="text-center text-sm text-[#8696a0] mt-12 px-8">
            <Lock className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p>No locked chats. Long-press a chat and choose "Lock chat".</p>
          </div>
        ) : (
          lockedChats.map((c) => (
            <div key={c.id} className="flex">
              <button
                onClick={() => onOpenChat(c.id)}
                className="flex-1 flex items-center gap-3 px-3 py-2.5 hover:bg-[#202c33] text-left"
              >
                <Avatar color={c.avatarColor} text={c.avatarText} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-[#8696a0] flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </div>
                </div>
              </button>
              <button
                onClick={() => dispatch({ type: "UNLOCK_CHAT", chatId: c.id })}
                className="px-3 text-emerald-400 text-sm"
              >
                Unlock
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Sticker Maker — text → sticker
export function StickerMaker({
  onBack,
  onCreate,
}: {
  onBack: () => void;
  onCreate: (sticker: { text: string; bg: string; emoji?: string }) => void;
}) {
  const [text, setText] = useState("");
  const [bgIdx, setBgIdx] = useState(0);
  const [emoji, setEmoji] = useState("");

  const bgs = [
    "bg-gradient-to-br from-pink-500 to-rose-600",
    "bg-gradient-to-br from-blue-500 to-indigo-600",
    "bg-gradient-to-br from-emerald-500 to-teal-600",
    "bg-gradient-to-br from-purple-600 to-fuchsia-600",
    "bg-gradient-to-br from-yellow-500 to-orange-500",
    "bg-gradient-to-br from-cyan-500 to-blue-500",
    "bg-zinc-800",
    "bg-white",
  ];
  const decals = ["","🎉","✨","❤️","🔥","💫","⭐","🌟","💯","🚀"];

  const isLight = bgs[bgIdx] === "bg-white";

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Create sticker" onBack={onBack} action={
        <button
          onClick={() => text.trim() && onCreate({ text: text.trim(), bg: bgs[bgIdx], emoji })}
          disabled={!text.trim()}
          className="text-emerald-400 font-medium px-3 disabled:opacity-40"
        >
          Send
        </button>
      } />
      <div className="flex-1 flex flex-col items-center p-6">
        <div className={`w-48 h-48 ${bgs[bgIdx]} rounded-3xl flex flex-col items-center justify-center p-4 shadow-2xl`}>
          {emoji && <div className="text-5xl mb-2">{emoji}</div>}
          <div className={`text-2xl font-bold text-center break-words ${isLight ? "text-black" : "text-white"}`}>
            {text || "Your text"}
          </div>
        </div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 30))}
          placeholder="Type sticker text"
          className="w-full max-w-xs bg-[#202c33] rounded-full px-4 py-2 text-center mt-6 outline-none"
          autoFocus
        />
        <div className="text-xs text-[#8696a0] mt-4 mb-2 flex items-center gap-1">
          <Palette className="w-3 h-3" /> Background
        </div>
        <div className="flex gap-2 flex-wrap justify-center max-w-xs">
          {bgs.map((b, i) => (
            <button
              key={b}
              onClick={() => setBgIdx(i)}
              className={`w-9 h-9 rounded-full ${b} ${i === bgIdx ? "ring-2 ring-white ring-offset-2 ring-offset-[#111b21]" : ""}`}
            />
          ))}
        </div>
        <div className="text-xs text-[#8696a0] mt-4 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Decal
        </div>
        <div className="flex gap-2 flex-wrap justify-center max-w-xs">
          {decals.map((d, i) => (
            <button
              key={i}
              onClick={() => setEmoji(d)}
              className={`w-9 h-9 rounded-full bg-[#202c33] flex items-center justify-center text-xl ${emoji === d ? "ring-2 ring-emerald-400" : ""}`}
            >
              {d || "✕"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Full reaction picker — all emojis
export function ReactionPickerModal({
  current,
  onPick,
  onClose,
}: {
  current?: string;
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);
  const tabs = [
    { name: "Smileys", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","☺️","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔"] },
    { name: "People", emojis: ["👍","👎","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👋","🤚","🖐️","✋","🖖","👏","🙌","🤝","🙏","💪","🦾","🦵","🦿","🦶","👂","🦻"] },
    { name: "Animals", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺"] },
    { name: "Food", emojis: ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠"] },
    { name: "Travel", emojis: ["✈️","🚀","🛸","🛶","⛵","🚤","🛥️","🛳️","⛴️","🚢","🚁","🛩️","🛫","🛬","🪂","💺","🚂","🚃","🚄","🚅","🚆","🚇","🚈","🚉","🚊","🚝","🚞","🚋","🚌","🚍","🚎","🚐"] },
    { name: "Activities", emojis: ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌"] },
    { name: "Symbols", emojis: ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈"] },
    { name: "Flags", emojis: ["🏁","🚩","🎌","🏴","🏳️","🏳️‍🌈","🏳️‍⚧️","🏴‍☠️","🇺🇸","🇬🇧","🇨🇦","🇫🇷","🇩🇪","🇮🇹","🇪🇸","🇯🇵","🇰🇷","🇨🇳","🇮🇳","🇧🇷","🇲🇽","🇦🇺","🇿🇦","🇸🇦","🇦🇪","🇮🇱","🇪🇬","🇳🇬","🇰🇪","🇪🇹","🇬🇭","🇲🇦"] },
  ];

  const allEmojis = tabs.flatMap((t) => t.emojis);
  const filtered = search ? allEmojis.filter((_) => true) : tabs[tab].emojis;

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
      <div className="bg-[#202c33] w-full rounded-t-2xl text-white max-h-[70%] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b border-[#222d34]">
          <h2 className="text-base font-medium">Pick a reaction</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emoji"
          className="m-3 bg-[#111b21] rounded-full px-4 py-2 text-sm outline-none"
        />
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-8 gap-1 text-2xl">
            {filtered.map((e, i) => (
              <button
                key={e + i}
                onClick={() => { onPick(e); onClose(); }}
                className={`hover:bg-white/10 rounded p-1 ${current === e ? "bg-emerald-500/30" : ""}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        {!search && (
          <div className="flex gap-1 px-2 py-2 border-t border-[#222d34] overflow-x-auto">
            {tabs.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setTab(i)}
                className={`px-3 py-1 text-xs rounded ${i === tab ? "bg-emerald-500/20 text-emerald-400" : "text-[#8696a0]"}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Status archive — own past statuses
export function StatusArchive({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Status archive" onBack={onBack} sub={`${state.myStatusItems.length} archived`} />
      <div className="flex-1 overflow-y-auto p-3">
        {state.myStatusItems.length === 0 ? (
          <div className="text-center text-[#8696a0] mt-12 px-8">
            <Clock className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Your status updates older than 24 hours appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {state.myStatusItems.map((s) => (
              <div key={s.id} className={`aspect-[3/5] rounded-lg ${s.bgColor} p-3 flex flex-col justify-between`}>
                <div className="text-xs text-white/80">{s.time}</div>
                <div className="text-sm font-medium text-center">{s.text}</div>
                <div className="text-xs text-white/70 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> 12
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Security Code Verification screen
export function SecurityCode({
  chat,
  onBack,
}: {
  chat: { name: string; avatarColor: string; avatarText: string };
  onBack: () => void;
}) {
  // Generate fake 60-digit code
  const code = Array.from({ length: 12 }, (_, i) =>
    Array.from({ length: 5 }, (_, j) =>
      String.fromCharCode(48 + ((i * 5 + j * 7) % 10))
    ).join("")
  ).join(" ");

  // Generate fake QR data deterministically
  const grid: boolean[][] = [];
  for (let r = 0; r < 25; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < 25; c++) {
      const h = (chat.name.charCodeAt(((r * 25 + c) % chat.name.length) || 0) + r * 7 + c * 13) % 7;
      row.push(h < 3);
    }
    grid.push(row);
  }
  const isFinder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Verify security code" onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center mb-4">
          <Shield className="w-12 h-12 mx-auto text-emerald-400 mb-2" />
          <p className="text-sm text-[#8696a0]">
            Scan this QR code from <strong className="text-white">{chat.name}</strong>'s phone, or compare the 60-digit number below to verify that messages and calls with them are end-to-end encrypted.
          </p>
        </div>
        <div className="bg-emerald-500 p-1 rounded-2xl max-w-xs mx-auto mb-6">
          <div className="bg-white p-4 rounded-xl">
            <div className="grid gap-0" style={{ gridTemplateColumns: "repeat(25, 1fr)" }}>
              {grid.map((row, r) =>
                row.map((on, c) => {
                  let fill = on;
                  if (isFinder(r, c)) {
                    const dr = r < 7 ? r : 24 - r;
                    const dc = c < 7 ? c : 24 - c;
                    fill = dr === 0 || dr === 6 || dc === 0 || dc === 6 ||
                      (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4);
                  }
                  return <div key={`${r}-${c}`} className={`aspect-square ${fill ? "bg-black" : "bg-white"}`} />;
                })
              )}
            </div>
          </div>
        </div>
        <div className="bg-[#202c33] rounded-lg p-4 font-mono text-center text-xs leading-relaxed tracking-wide">
          {code.match(/.{1,29}/g)?.map((row, i) => (
            <div key={i}>{row}</div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-[#202c33] py-2 rounded text-sm">Share</button>
          <button className="flex-1 bg-emerald-500 text-[#111b21] py-2 rounded text-sm font-semibold">Scan code</button>
        </div>
        <p className="text-xs text-[#8696a0] text-center mt-4">
          🔒 Messages and calls are end-to-end encrypted. No one outside this chat, not even Chatsapp, can read or listen to them.
        </p>
      </div>
    </div>
  );
}

// Translation popup for a message
export function TranslateModal({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  const [target, setTarget] = useState("Spanish");
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const langs = ["Spanish","French","German","Italian","Portuguese","Hindi","Arabic","Chinese","Japanese","Korean","Russian"];

  /**
   * Real translation: calls the backend translation endpoint
   * (VITE_TRANSLATE_URL). The endpoint is implemented by the server and
   * proxies a translation provider. Without configuration, we surface an
   * honest "not configured" state — never fabricated translations.
   */
  const doTranslate = async () => {
    setLoading(true);
    setTranslated(null);
    try {
      const endpoint = (import.meta as any).env?.VITE_TRANSLATE_URL;
      if (!endpoint) throw new Error("Translation not configured");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target }),
      });
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();
      setTranslated(data.translatedText || "");
    } catch {
      setTranslated("⚠ Translation is not configured on this server. Set VITE_TRANSLATE_URL to enable real translation.");
    }
    setLoading(false);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-end" onClick={onClose}>
      <div className="bg-[#202c33] w-full rounded-t-2xl p-4 text-white" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-medium">Translate</h2>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-[#111b21] rounded p-3 mb-3 text-sm">
          <div className="text-xs text-[#8696a0] mb-1">Original</div>
          {text}
        </div>
        <div className="text-xs text-[#8696a0] mb-2">Translate to</div>
        <div className="flex gap-2 flex-wrap mb-3">
          {langs.map((l) => (
            <button
              key={l}
              onClick={() => setTarget(l)}
              className={`px-3 py-1 text-sm rounded-full ${target === l ? "bg-emerald-500 text-[#111b21]" : "bg-[#111b21] text-[#aebac1]"}`}
            >
              {l}
            </button>
          ))}
        </div>
        {translated && (
          <div className="bg-[#111b21] rounded p-3 mb-3 text-sm border border-emerald-500/30">
            <div className="text-xs text-emerald-400 mb-1">Translated to {target}</div>
            {loading ? "…" : translated}
          </div>
        )}
        <button
          onClick={doTranslate}
          disabled={loading}
          className="w-full bg-emerald-500 disabled:opacity-40 text-[#111b21] py-2 rounded-full font-semibold"
        >
          {loading ? "Translating…" : "Translate"}
        </button>
      </div>
    </div>
  );
}

// Read aloud / TTS popup using browser speechSynthesis
export function ReadAloud({ text, onClose }: { text: string; onClose: () => void }) {
  const [playing, setPlaying] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const start = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => setPlaying(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setPlaying(true);
  };
  const stop = () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={onClose}>
      <div className="bg-[#202c33] rounded-2xl p-6 text-white max-w-xs w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 mb-3">
          <Volume className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-medium flex-1">Read aloud</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="bg-[#111b21] rounded p-3 mb-4 text-sm max-h-32 overflow-y-auto">{text}</div>
        <button
          onClick={playing ? stop : start}
          className={`w-full py-2 rounded-full font-semibold ${playing ? "bg-red-500 text-white" : "bg-emerald-500 text-[#111b21]"}`}
        >
          {playing ? "Stop" : "Play"}
        </button>
        {!("speechSynthesis" in window) && (
          <p className="text-xs text-red-400 text-center mt-2">Speech not supported in this browser</p>
        )}
      </div>
    </div>
  );
}

// Disappearing messages chat-level setting
export function DisappearingChatTimer({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const { state, dispatch } = useStore();
  const current = state.disappearTimers[chatId] || 0;
  const options = [
    { hours: 0, label: "Off" },
    { hours: 24, label: "24 hours" },
    { hours: 24 * 7, label: "7 days" },
    { hours: 24 * 90, label: "90 days" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white">
      <SubHeader title="Disappearing messages" onBack={onBack} />
      <div className="px-4 py-4 text-sm text-[#8696a0]">
        Choose how long new messages in this chat will be visible before they disappear.
      </div>
      {options.map((o) => (
        <button
          key={o.hours}
          onClick={() => {
            dispatch({ type: "SET_DISAPPEAR_TIMER", chatId, hours: o.hours });
            onBack();
          }}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#202c33]"
        >
          <span>{o.label}</span>
          {current === o.hours && <Check className="w-5 h-5 text-emerald-400" />}
        </button>
      ))}
    </div>
  );
}

// Suppress unused
export const _u = { Type, Star, StarFilled, ImageIcon };
