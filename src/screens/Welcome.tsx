import { useState } from "react";
import { useStore } from "../store";
import { ChevronRight, ArrowLeft, ChevronDown, GoogleG, Mail, Phone, ChatsappLogo, Lock, Smile } from "../icons";
import { DEFAULT_COUNTRY, formatPhone, maxPhoneDigits, type Country } from "../countries";
import { CountryPicker } from "./CountryPicker";
import { api } from "../backend";
import { socketClient } from "../backend/socket";

const LANGUAGES = [
  { code: "en", name: "English", subtitle: "English" },
  { code: "es", name: "Español", subtitle: "Spanish" },
  { code: "fr", name: "Français", subtitle: "French" },
  { code: "de", name: "Deutsch", subtitle: "German" },
  { code: "it", name: "Italiano", subtitle: "Italian" },
  { code: "pt", name: "Português", subtitle: "Portuguese" },
  { code: "ru", name: "Русский", subtitle: "Russian" },
  { code: "ar", name: "العربية", subtitle: "Arabic" },
  { code: "hi", name: "हिन्दी", subtitle: "Hindi" },
  { code: "zh", name: "中文", subtitle: "Chinese" },
  { code: "ja", name: "日本語", subtitle: "Japanese" },
  { code: "ko", name: "한국어", subtitle: "Korean" },
  { code: "tr", name: "Türkçe", subtitle: "Turkish" },
  { code: "id", name: "Bahasa Indonesia", subtitle: "Indonesian" },
];

type Step = "language" | "intro" | "auth" | "google" | "google-loading" | "email" | "phone" | "verify" | "profile";

export function Welcome({ onDone, onOpenLegal }: { onDone: () => void; onOpenLegal?: (type: "terms" | "privacy") => void }) {
  const { dispatch } = useStore();
  const [step, setStep] = useState<Step>("language");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const [debugOtp, setDebugOtp] = useState("");
  const [authProvider, setAuthProvider] = useState<"phone" | "google" | "email">("phone");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [debugEmailOtp, setDebugEmailOtp] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleEmail, setGoogleEmail] = useState("");
  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "";

  // ── Real email OTP flow ────────────────────────────────────
  const sendEmailCode = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setVerifyError("Enter a valid email address");
      return;
    }
    setVerifying(true);
    setVerifyError("");
    try {
      const res = await api.auth.requestEmailOtp(email.trim());
      setDebugEmailOtp(res.debugCode);
      setEmailCodeSent(true);
      setEmailCode("");
    } catch {
      setVerifyError("Could not send the code. Try again.");
    }
    setVerifying(false);
  };

  const verifyEmailCode = async () => {
    if (emailCode.length !== 6) return;
    setVerifying(true);
    setVerifyError("");
    const res = await api.auth.verifyEmailOtp(email.trim(), emailCode);
    if (res.ok) {
      // Create the real user keyed by email
      try {
        await api.crypto.initIdentity();
        const pub = await api.crypto.getPublicKey();
        const { user, session } = await api.auth.signIn("email:" + email.trim().toLowerCase(), "Web Browser", pub);
        localStorage.setItem("wa-session", JSON.stringify(session));
        socketClient.connect(session.token);
        setName(user.username.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));
        dispatch({ type: "UPDATE_PROFILE", profile: { name: user.username, phone: user.phone } });
      } catch {}
      setVerifying(false);
      setStep("profile");
    } else {
      setVerifyError(res.error || "Incorrect code");
      setVerifying(false);
    }
  };

  // ── Real Google OAuth flow ─────────────────────────────────
  const startGoogleSignIn = () => {
    setGoogleError("");
    if (!googleClientId) {
      setGoogleError("Google sign-in isn't configured on this device. Use email or phone instead.");
      return;
    }
    setStep("google");
    // Load GIS SDK and wire the real callback
    api.auth.loadGoogleIdentity(async (credential) => {
      if (!credential) {
        setGoogleError("Google sign-in was cancelled or failed.");
        return;
      }
      setStep("google-loading");
      try {
        await api.crypto.initIdentity();
        const pub = await api.crypto.getPublicKey();
        const { user, session } = await api.auth.signInWithGoogle(credential, "Web Browser", pub);
        localStorage.setItem("wa-session", JSON.stringify(session));
        socketClient.connect(session.token);
        setGoogleEmail(user.phone.replace("google:", ""));
        setName(user.username.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()));
        dispatch({ type: "UPDATE_PROFILE", profile: { name: user.username, phone: user.phone } });
        setStep("profile");
      } catch (e: any) {
        setGoogleError(e?.message || "Google verification failed");
        setStep("google");
      }
    });
  };

  const formattedPhone = formatPhone(phoneDigits, country.format);
  const maxDigits = maxPhoneDigits(country.format);
  const phoneValid = phoneDigits.length >= 7;

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/[^0-9]/g, "").slice(0, maxDigits);
    setPhoneDigits(digits);
  };

  const requestCode = async () => {
    if (!phoneValid) return;
    setStep("verify");
    setResendIn(60);
    const id = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) { clearInterval(id); return 0; }
        return s - 1;
      });
    }, 1000);
    // Real OTP issuance via the auth service (locally delivered; SMS gateway pluggable)
    try {
      const full = `${country.dial}${phoneDigits}`;
      const res = await api.auth.requestOtp(full);
      setDebugOtp(res.debugCode);
    } catch {
      setDebugOtp("");
    }
  };

  const [verifyError, setVerifyError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const verifyCode = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    setVerifyError("");
    const full = `${country.dial}${phoneDigits}`;
    const res = await api.auth.verifyOtp(full, code);
    setVerifying(false);
    if (res.ok) {
      // Open a real session via the auth service and store it for socket auth
      try {
        await api.crypto.initIdentity();
        const pub = await api.crypto.getPublicKey();
        const { user, session } = await api.auth.signIn(full, "Web Browser", pub);
        localStorage.setItem("wa-session", JSON.stringify(session));
        // Connect the real socket immediately so messages sync from login
        socketClient.connect(session.token);
        dispatch({ type: "UPDATE_PROFILE", profile: { name: user.username, phone: user.phone } });
      } catch {}
      setStep("profile");
    } else {
      setVerifyError(res.error || "Verification failed");
    }
  };

  const finish = () => {
    if (!name.trim()) return;
    // Build phone or fallback to email-based "phone" placeholder
    const fullPhone =
      authProvider === "phone" && phoneDigits
        ? `${country.dial} ${formattedPhone || phoneDigits}`
        : email
        ? email
        : `${country.dial} ${formattedPhone || phoneDigits}`;
    dispatch({
      type: "UPDATE_PROFILE",
      profile: {
        name: name.trim(),
        phone: fullPhone,
        avatarText: name.trim().slice(0, 2).toUpperCase(),
      },
    });
    onDone();
  };

  // ─── Step: Language selection ───────────────────────────────
  if (step === "language") {
    return (
      <div className="h-full flex flex-col bg-[#111b21] text-white">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-24 h-24 rounded-full bg-[#25D366]/15 flex items-center justify-center mb-6">
            <ChatsappLogo className="w-12 h-12 text-[#25D366]" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Chatsapp</h1>
          <p className="text-[#8696a0] text-sm text-center mb-8">
            Choose your preferred language
          </p>
          <button
            onClick={() => setShowLangPicker(true)}
            className="w-full max-w-xs bg-[#202c33] rounded-lg px-4 py-3 flex items-center justify-between mb-3"
          >
            <span>{language}</span>
            <ChevronDown className="w-4 h-4 text-[#8696a0]" />
          </button>
        </div>
        <div className="p-6">
          <button
            onClick={() => setStep("intro")}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#111b21] font-semibold py-3 rounded-full"
          >
            Continue
          </button>
        </div>

        {showLangPicker && (
          <div className="absolute inset-0 z-50 bg-[#111b21] flex flex-col">
            <header className="flex items-center gap-3 px-2 py-3 bg-[#202c33]">
              <button onClick={() => setShowLangPicker(false)} className="p-2 rounded-full hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-medium">Choose language</h1>
            </header>
            <div className="flex-1 overflow-y-auto">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLanguage(l.name); setShowLangPicker(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#202c33] text-left"
                >
                  <div>
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-[#8696a0]">{l.subtitle}</div>
                  </div>
                  {language === l.name && <span className="text-emerald-400">✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Step: Intro / Privacy ─────────────────────────────────
  if (step === "intro") {
    return (
      <div className="h-full flex flex-col bg-[#111b21] text-white items-center justify-between p-6">
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs">
          <div className="w-32 h-32 rounded-full bg-[#25D366]/15 flex items-center justify-center mb-8">
            <ChatsappLogo className="w-16 h-16 text-[#25D366]" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Welcome to Chatsapp</h1>
          <p className="text-[#8696a0] text-sm mb-2">
            Read our{" "}
            <button onClick={() => onOpenLegal?.("privacy")} className="text-emerald-400 cursor-pointer inline">
              Privacy Policy
            </button>.
            Tap "Agree and continue" to accept the{" "}
            <button onClick={() => onOpenLegal?.("terms")} className="text-emerald-400 cursor-pointer inline">
              Terms of Service
            </button>.
          </p>
          <p className="text-xs text-[#8696a0] mt-4">
            Language: <button onClick={() => setStep("language")} className="text-emerald-400">{language}</button>
          </p>
        </div>
        <button
          onClick={() => setStep("auth")}
          className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 text-[#111b21] font-semibold py-3 rounded-full"
        >
          Agree and continue
        </button>
        <p className="text-xs text-[#8696a0] mt-4">
          from <span className="text-emerald-400 font-medium">Munawar</span>
        </p>
      </div>
    );
  }

  // ─── Step: Auth method choice ──────────────────────────────
  if (step === "auth") {
    return (
      <div className="h-full flex flex-col bg-[#111b21] text-white">
        <header className="flex items-center gap-3 px-2 py-3">
          <button onClick={() => setStep("intro")} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">How do you want to sign in?</h1>
        </header>

        <div className="flex-1 flex flex-col p-6">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-center">Sign in to Chatsapp</h2>
            <p className="text-sm text-[#8696a0] text-center max-w-xs">
              Sign in with your Google account, email, or phone number.
            </p>
          </div>

          <div className="space-y-2.5 max-w-sm w-full mx-auto">
            {/* Google — real OAuth */}
            <button
              onClick={() => { setAuthProvider("google"); startGoogleSignIn(); }}
              className="w-full bg-white text-zinc-800 font-medium py-3 rounded-full flex items-center justify-center gap-3 hover:bg-zinc-100"
            >
              <GoogleG />
              Continue with Google
            </button>
            {/* Email */}
            <button
              onClick={() => { setAuthProvider("email"); setStep("email"); }}
              className="w-full bg-[#202c33] text-white font-medium py-3 rounded-full flex items-center justify-center gap-3 hover:bg-[#2a3942]"
            >
              <Mail className="w-5 h-5 text-emerald-400" />
              Continue with email
            </button>

            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-[#222d34]" />
              <span className="text-xs text-[#8696a0]">OR</span>
              <div className="flex-1 h-px bg-[#222d34]" />
            </div>

            {/* Phone */}
            <button
              onClick={() => { setAuthProvider("phone"); setStep("phone"); }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#111b21] font-semibold py-3 rounded-full flex items-center justify-center gap-3"
            >
              <Phone className="w-5 h-5" />
              Use phone number
            </button>
          </div>

          <p className="text-xs text-[#8696a0] text-center mt-6">
            By signing in, you agree to our{" "}
            <button onClick={() => onOpenLegal?.("terms")} className="text-emerald-400 cursor-pointer inline">Terms of Service</button> and{" "}
            <button onClick={() => onOpenLegal?.("privacy")} className="text-emerald-400 cursor-pointer inline">Privacy Policy</button>.
          </p>
        </div>
      </div>
    );
  }

  // ─── Step: Google OAuth (real Google Identity Services) ────
  if (step === "google") {
    return (
      <div className="h-full flex flex-col bg-[#111b21] text-white">
        <header className="flex items-center gap-3 px-2 py-3">
          <button onClick={() => setStep("auth")} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Sign in with Google</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <GoogleG />
          <p className="text-sm text-[#8696a0] mt-6 mb-6 max-w-xs">
            You'll be redirected to Google to sign in. Chatsapp verifies your
            Google account with Google's servers — we never receive your password.
          </p>
          {!googleClientId ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-xs text-yellow-400/90 max-w-xs">
              Google sign-in requires a Google OAuth client ID. Set{" "}
              <code className="text-emerald-400">VITE_GOOGLE_CLIENT_ID</code> and{" "}
              <code className="text-emerald-400">GOOGLE_CLIENT_ID</code> in your
              environment to enable it. You can still sign in with email or phone.
            </div>
          ) : (
            <div
              ref={(el) => {
                if (el && !el.hasChildNodes()) {
                  api.auth.renderGoogleButton(el);
                }
              }}
              className="google-btn"
            />
          )}
          {googleError && (
            <p className="text-red-400 text-sm mt-3">{googleError}</p>
          )}
          <button
            onClick={() => setStep("auth")}
            className="mt-6 text-sm text-emerald-400"
          >
            Choose another method
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: Google sign-in loading (real token exchange) ────
  if (step === "google-loading") {
    return (
      <div className="h-full flex flex-col bg-[#111b21] text-white items-center justify-center p-6">
        <GoogleG />
        <div className="mt-6 mb-4 w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <h2 className="text-lg font-medium">Verifying with Google…</h2>
        <p className="text-sm text-[#8696a0] mt-1">{googleEmail || ""}</p>
      </div>
    );
  }

  // ─── Step: Email OTP verification (real) ──────────────────
  if (step === "email") {
    return (
      <div className="h-full flex flex-col bg-[#111b21] text-white">
        <header className="flex items-center gap-3 px-2 py-3">
          <button onClick={() => setStep("auth")} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Sign in with email</h1>
        </header>
        <div className="flex-1 flex flex-col p-6">
          <Mail className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          {emailCodeSent ? (
            <>
              <p className="text-sm text-[#8696a0] mb-6 text-center">
                Enter the 6-digit code sent to <strong className="text-white">{email}</strong>
              </p>
              <input
                type="text"
                inputMode="numeric"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="------"
                className="w-full bg-[#202c33] rounded-lg px-3 py-3 text-center text-2xl tracking-[0.5em] outline-none mb-3"
              />
              {debugEmailOtp && (
                <p className="text-xs text-[#8696a0] text-center mb-3">
                  Code sent to {email}.
                  {!debugEmailOtp.startsWith("000") && (
                    <span className="text-emerald-400"> (local delivery: {debugEmailOtp})</span>
                  )}
                </p>
              )}
              {verifyError && <p className="text-red-400 text-xs text-center mb-3">{verifyError}</p>}
              <div className="flex-1" />
              <button
                onClick={verifyEmailCode}
                disabled={emailCode.length !== 6 || verifying}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#111b21] font-semibold py-3 rounded-full"
              >
                {verifying ? "Verifying…" : "Verify"}
              </button>
              <button
                onClick={() => {
                  setEmailCode("");
                  setEmailCodeSent(false);
                }}
                className="text-sm text-emerald-400 mt-3"
              >
                Use a different email
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-[#8696a0] mb-6 text-center">
                We'll send a 6-digit verification code to your email. No password needed.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-[#202c33] rounded-lg px-3 py-3 outline-none mb-3"
                autoFocus
              />
              {verifyError && <p className="text-red-400 text-xs text-center mb-3">{verifyError}</p>}
              <div className="flex-1" />
              <button
                onClick={sendEmailCode}
                disabled={!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || verifying}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#111b21] font-semibold py-3 rounded-full"
              >
                {verifying ? "Sending…" : "Send code"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── Step: Phone number ────────────────────────────────────
  if (step === "phone") {
    return (
      <div className="h-full flex flex-col bg-[#111b21] text-white">
        <header className="flex items-center gap-3 px-2 py-3">
          <button onClick={() => setStep("intro")} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Enter your phone number</h1>
        </header>

        <div className="flex-1 flex flex-col p-6">
          <p className="text-sm text-[#8696a0] mb-6 text-center">
            Chatsapp will need to verify your phone number. Carrier charges may apply.
          </p>

          {/* Country selector */}
          <button
            onClick={() => setShowCountryPicker(true)}
            className="w-full flex items-center justify-between px-3 py-2 border-b border-emerald-500 mb-4 hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <span className="text-2xl">{country.flag}</span>
              <span>{country.name}</span>
            </span>
            <ChevronRight className="w-4 h-4 text-[#8696a0]" />
          </button>

          {/* Dial code + phone */}
          <div className="flex gap-2 border-b border-emerald-500 pb-2 mb-2">
            <span className="text-base font-medium min-w-[55px]">{country.dial}</span>
            <input
              autoFocus
              inputMode="numeric"
              value={formattedPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="phone number"
              className="bg-transparent flex-1 outline-none text-base placeholder:text-[#8696a0]"
            />
          </div>

          <p className="text-xs text-[#8696a0]">
            {phoneDigits.length > 0 ? `${phoneDigits.length} digit${phoneDigits.length === 1 ? "" : "s"}` : "Enter your phone number"}
          </p>

          <div className="flex-1" />

          <p className="text-xs text-[#8696a0] text-center mb-4">
            Carrier SMS charges may apply
          </p>
          <button
            onClick={requestCode}
            disabled={!phoneValid}
            className="self-center bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#111b21] font-semibold py-2.5 px-10 rounded-full"
          >
            Next
          </button>
        </div>

        {showCountryPicker && (
          <CountryPicker
            current={country.code}
            onPick={(c) => {
              setCountry(c);
              // Truncate digits to new country's max
              const newMax = maxPhoneDigits(c.format);
              setPhoneDigits((d) => d.slice(0, newMax));
            }}
            onClose={() => setShowCountryPicker(false)}
          />
        )}
      </div>
    );
  }

  // ─── Step: Verify code ─────────────────────────────────────
  if (step === "verify") {
    return (
      <div className="h-full flex flex-col bg-[#111b21] text-white">
        <header className="flex items-center gap-3 px-2 py-3">
          <button onClick={() => setStep("phone")} className="p-2 rounded-full hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-medium">Verifying your number</h1>
        </header>

        <div className="flex-1 flex flex-col p-6">
          <p className="text-sm text-[#8696a0] mb-2 text-center">
            Waiting to automatically detect an SMS sent to{" "}
            <strong className="text-white">{country.dial} {formattedPhone}</strong>.
          </p>
          <button
            onClick={() => setStep("phone")}
            className="text-emerald-400 text-xs text-center mb-8"
          >
            Wrong number?
          </button>

          {/* OTP boxes */}
          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-10 h-12 border-b-2 ${
                  code.length > i ? "border-emerald-500" : "border-[#222d34]"
                } flex items-center justify-center text-2xl font-mono`}
              >
                {code[i] || ""}
              </div>
            ))}
          </div>

          <input
            autoFocus
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            className="opacity-0 absolute pointer-events-auto h-12 w-full -mt-12"
            maxLength={6}
          />

          <p className="text-xs text-[#8696a0] text-center mb-4">
            {resendIn > 0
              ? `Resend code in ${resendIn}s`
              : (
                <button
                  onClick={() => {
                    setResending(true);
                    setTimeout(() => {
                      setResending(false);
                      setResendIn(60);
                      const id = setInterval(() => {
                        setResendIn((s) => { if (s <= 1) { clearInterval(id); return 0; } return s - 1; });
                      }, 1000);
                    }, 1000);
                  }}
                  className="text-emerald-400"
                  disabled={resending}
                >
                  {resending ? "Sending…" : "Didn't get it? Resend SMS"}
                </button>
              )
            }
          </p>

          {debugOtp && (
            <p className="text-xs text-[#8696a0] text-center mb-4">
              Code sent via SMS to {country.dial} {formattedPhone}.
              {!debugOtp.startsWith("000") && (
                <span className="text-emerald-400"> (dev only — returned by server: {debugOtp})</span>
              )}
            </p>
          )}

          <div className="flex-1" />

          {verifyError && (
            <p className="text-red-400 text-xs text-center mb-3">{verifyError}</p>
          )}
          <button
            onClick={verifyCode}
            disabled={code.length !== 6 || verifying}
            className="self-center bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#111b21] font-semibold py-2.5 px-10 rounded-full"
          >
            {verifying ? "Verifying…" : "Verify"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Step: Profile setup ───────────────────────────────────
  const profileBackTo: Step =
    authProvider === "phone" ? "verify" :
    authProvider === "google" ? "google" :
    authProvider === "email" ? "email" :
    "auth";

  const providerLabel: Record<string, { label: string; bg: string; icon: React.ReactNode }> = {
    google: { label: `Connected to Google · ${email}`, bg: "bg-blue-500/10 border-blue-500/30", icon: <GoogleG /> },
    email: { label: `Connected via email · ${email}`, bg: "bg-emerald-500/10 border-emerald-500/30", icon: <Mail className="w-4 h-4 text-emerald-400" /> },
    phone: { label: `Verified · ${country.dial} ${formattedPhone}`, bg: "bg-emerald-500/10 border-emerald-500/30", icon: <Phone className="w-4 h-4 text-emerald-400" /> },
  };
  const provider = providerLabel[authProvider];

  return (
    <div className="h-full flex flex-col bg-[#111b21] text-white">
      <header className="flex items-center gap-3 px-2 py-3">
        <button onClick={() => setStep(profileBackTo)} className="p-2 rounded-full hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-medium">Profile info</h1>
      </header>

      <div className="flex-1 flex flex-col p-6">
        {provider && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${provider.bg} mb-4 text-xs`}>
            {provider.icon}
            <span className="flex-1 truncate">{provider.label}</span>
            <span className="text-emerald-400">✓</span>
          </div>
        )}
        <p className="text-sm text-[#8696a0] mb-6 text-center">
          Please provide your name and an optional profile photo.
        </p>

        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full bg-emerald-600 flex items-center justify-center text-4xl font-semibold text-white">
            {(name || "?").slice(0, 2).toUpperCase()}
          </div>
          <button className="text-xs text-emerald-400 mt-2">Add photo</button>
        </div>

        <div className="border-b border-emerald-500 pb-2 mb-8 flex items-center gap-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name here"
            className="bg-transparent flex-1 outline-none text-base"
            maxLength={25}
          />
          <span className="text-xs text-[#8696a0]">{name.length}/25</span>
          <Smile className="w-5 h-5 text-[#8696a0]" />
        </div>

        <div className="flex-1" />

        <button
          onClick={finish}
          disabled={!name.trim()}
          className="self-center bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#111b21] font-semibold py-2.5 px-10 rounded-full"
        >
          Next
        </button>
      </div>
    </div>
  );
}
