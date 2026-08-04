import { useState } from "react";
import { useStore } from "../store";
import {
  ArrowLeft, Share2, Copy, MessageCircle, Shield, Info,
  ChatsappLogo, Link
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

// Invite friends — share Chatsapp with contacts
export function InviteFriends({ onBack }: { onBack: () => void }) {
  const { state } = useStore();
  const [copied, setCopied] = useState(false);
  const inviteLink = "https://wa.me/?text=" + encodeURIComponent("Hey! Join me on Chatsapp — it's free and secure. Download it here: https://www.chatsapp.com/dl");

  const copy = () => {
    navigator.clipboard?.writeText("Join me on Chatsapp — it's free and secure. https://www.chatsapp.com/dl");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white animate-fade-in">
      <SubHeader title="Invite a friend" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-8 text-center">
          <div className="w-24 h-24 rounded-full bg-[#25D366]/15 flex items-center justify-center mx-auto mb-4">
            <ChatsappLogo className="w-12 h-12 text-[#25D366]" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Share Chatsapp with a friend</h2>
          <p className="text-sm text-[#8696a0] max-w-xs mx-auto">
            Chatsapp is free, secure, and used by millions of people. Invite someone you care about.
          </p>
        </div>

        <div className="px-4 space-y-2">
          <button
            onClick={copy}
            className="w-full flex items-center gap-3 p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Copy className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Copy link</div>
              <div className="text-xs text-[#8696a0]">Share the download link</div>
            </div>
            {copied && <span className="text-emerald-400 text-xs animate-fade-in">✓ Copied</span>}
          </button>

          <button
            onClick={() => {
              window.open(inviteLink, "_blank");
            }}
            className="w-full flex items-center gap-3 p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Share via…</div>
              <div className="text-xs text-[#8696a0]">SMS, email, or other apps</div>
            </div>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Chatsapp", text: "Join me on Chatsapp!", url: "https://www.chatsapp.com/dl" });
              } else {
                copy();
              }
            }}
            className="w-full flex items-center gap-3 p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">Send via Chatsapp</div>
              <div className="text-xs text-[#8696a0]">Message a contact</div>
            </div>
          </button>
        </div>

        <h3 className="text-xs uppercase text-emerald-400 px-4 pt-6 pb-2">Contacts on Chatsapp</h3>
        <div className="flex-1 overflow-y-auto">
          {state.chats.filter((c) => !c.isGroup).slice(0, 8).map((c) => (
            <button
              key={c.id}
              onClick={copy}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#202c33] text-left transition-colors"
            >
              <div className={`w-10 h-10 rounded-full ${c.avatarColor} flex items-center justify-center text-white font-medium text-sm`}>
                {c.avatarText}
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{c.name}</div>
                <div className="text-xs text-[#8696a0]">{c.phone}</div>
              </div>
              <span className="text-emerald-400 text-xs">Invite</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Terms & Privacy Policy pages
export function LegalPage({ type, onBack }: { type: "terms" | "privacy"; onBack: () => void }) {
  const isTerms = type === "terms";
  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white animate-fade-in">
      <SubHeader title={isTerms ? "Terms of Service" : "Privacy Policy"} onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-5 text-sm text-[#aebac1] space-y-4">
        {isTerms ? (
          <>
            <div className="flex items-center gap-3 pb-3 border-b border-[#222d34]">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center">
                <ChatsappLogo className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Chatsapp Terms of Service</h2>
                <p className="text-xs text-[#8696a0]">Last modified: January 2026 · Version 2.0</p>
              </div>
            </div>
            <p>Welcome to Chatsapp Messenger. By using our Services, you agree to these Terms. Please read them carefully — they affect your legal rights.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">1</span> Our Services</h3>
            <p>Chatsapp provides messaging, calling, file sharing and status services that are protected by end-to-end encryption. Messages and calls are secured from the moment they leave your device until they reach the receiver — not even Chatsapp can read or listen to them.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">2</span> Eligibility</h3>
            <p>You must be at least 13 years old to use our Services. If you are under 18, you need your parent or legal guardian's permission. You may not use our Services if we have banned you or if you're in a country where Chatsapp is prohibited.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">3</span> Account & Registration</h3>
            <p>You need a valid phone number to register. You're responsible for maintaining the confidentiality of your account, including your PIN, two-step verification code, and any linked devices. You agree to provide accurate information.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">4</span> Privacy & Data</h3>
            <p>Our Privacy Policy explains how we collect and use your information. By using Chatsapp you agree that we may collect and use your information in accordance with the Privacy Policy. We never sell your personal information.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">5</span> Acceptable Use</h3>
            <p>You agree not to misuse the Services. Prohibited activities include (a) spamming or sending unsolicited messages, (b) transmitting illegal content, malware or viruses, (c) infringing others' intellectual property or privacy, (d) impersonating others, (e) harvesting data without permission, (f) attempting to access our systems without authorization.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">6</span> Content Ownership</h3>
            <p>You retain all rights to your messages, photos and content you share. You grant Chatsapp a limited license to host, store and transmit your content solely to provide the Services. Content you send is end-to-end encrypted and we cannot access it.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">7</span> Fees & Payments</h3>
            <p>Chatsapp is free to download and use. Data charges from your mobile carrier may apply. If you use optional paid features, additional terms may apply and you agree to pay all fees as described at checkout.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">8</span> Termination</h3>
            <p>You may delete your account at any time from Settings → Account → Delete my account. We may suspend or terminate your access if you violate these Terms, harm others, or create legal risk for us.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">9</span> Disclaimers & Limitation of Liability</h3>
            <p>The Services are provided "as is" without warranties of any kind. To the maximum extent permitted by law, Chatsapp is not liable for indirect, incidental, or consequential damages, lost profits, or data loss. Our total liability is limited to the amount you paid us in the last 12 months.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">10</span> Changes to These Terms</h3>
            <p>We may update these Terms from time to time. We'll notify you of material changes 30 days in advance through the app. Continued use of Chatsapp after changes means you accept the updated Terms.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">11</span> Contact Us</h3>
            <p>Questions about these Terms? Contact our support team at <span className="text-emerald-400">support@chatsapp.com</span> or via Help → Contact us in the app.</p>

            <div className="bg-[#182229] rounded-lg p-4 text-xs">
              <p className="text-[#8696a0]">By tapping "Agree and continue" during registration, you accept these Terms and our Privacy Policy.</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 pb-3 border-b border-[#222d34]">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/20 flex items-center justify-center">
                <ChatsappLogo className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Chatsapp Privacy Policy</h2>
                <p className="text-xs text-[#8696a0]">Last modified: January 2026 · Version 2.0</p>
              </div>
            </div>
            <p>At Chatsapp, your privacy matters. Our mission is to connect the world privately. This policy explains what we collect, how we use it, and the controls you have.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">🔐</span> End-to-End Encryption</h3>
            <p>Messages, photos, videos, voice messages, documents, status updates and calls are secured with end-to-end encryption. Neither Chatsapp nor anyone else can read or listen to them. The encryption keys are stored on your device only.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">📋</span> Information We Collect</h3>
            <p>
              <strong className="text-white">Account information</strong> — phone number, profile name and photo, about info.<br />
              <strong className="text-white">Messages</strong> — encrypted in transit; we cannot read them.<br />
              <strong className="text-white">Transactions</strong> — payment info if you use Chatsapp Pay.<br />
              <strong className="text-white">Usage & log data</strong> — when you use features, network diagnostics, performance data.<br />
              <strong className="text-white">Device & connection info</strong> — hardware model, OS, battery level, signal strength, app version, carrier.
            </p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">🚫</span> What We DON'T Collect</h3>
            <p>We don't read your messages. We don't see your shared location. We don't keep your messages after delivery. We don't share your contact lists with third parties for their own use. We never sell your personal information.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">⚙️</span> How We Use Information</h3>
            <p>We use your information to operate, provide, improve and protect our Services: delivering messages, syncing your account across devices, showing relevant offers (where permitted), and maintaining safety and security.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">🎛️</span> Your Controls</h3>
            <p>You're in control:<br />
              • <strong className="text-white">Privacy settings</strong> — choose who sees your last seen, profile photo, about and status.<br />
              • <strong className="text-white">Disappearing messages</strong> & view-once media — make content vanish.<br />
              • <strong className="text-white">Blocking & reporting</strong> — stop unwanted contact.<br />
              • <strong className="text-white">Two-step verification</strong> — add a PIN for extra security.<br />
              • <strong className="text-white">Delete account</strong> — remove your data permanently.
            </p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">📤</span> Data Transfers & Retention</h3>
            <p>We retain information for as long as needed to provide the Services. If you delete your account, your messages are deleted from our servers. Undelivered messages are kept for up to 30 days, and backups may remain encrypted until you delete them.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">🌍</span> International Transfers</h3>
            <p>Chatsapp operates globally and may process your information on servers in different countries. We use standard contractual clauses and other safeguards approved by regulators.</p>

            <h3 className="text-white font-semibold pt-2 flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">📧</span> Contact</h3>
            <p>Questions or requests about your data? Contact our Data Protection team at <span className="text-emerald-400">privacy@chatsapp.com</span> or via Help → Contact us.</p>

            <div className="bg-[#182229] rounded-lg p-4 text-xs">
              <p className="text-[#8696a0]">Last updated January 2026. We'll notify you 30 days before any material changes.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Group call participants list
export function GroupCallParticipants({
  groupName,
  members,
  onBack,
}: {
  groupName: string;
  members: string[];
  onBack: () => void;
}) {
  const [speaking] = useState<Set<number>>(new Set([1, 3]));

  return (
    <div className="flex flex-col h-full bg-[#111b21] text-white animate-fade-in">
      <SubHeader title="On the call" onBack={onBack} sub={`${groupName} · ${members.length + 1} participants`} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2 text-xs uppercase text-emerald-400">Speaking</div>
        {members.slice(0, 4).map((m, i) => (
          <div key={m + i} className="flex items-center gap-3 px-4 py-3 border-b border-[#222d34] animate-fade-in">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${["from-purple-500 to-pink-500","from-blue-500 to-cyan-500","from-emerald-500 to-teal-500","from-orange-500 to-red-500"][i % 4]} flex items-center justify-center text-white font-semibold`}>
              {m.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{m}</div>
              <div className="text-xs text-[#8696a0]">
                {speaking.has(i) ? (
                  <span className="text-emerald-400">🔊 Speaking…</span>
                ) : (
                  "On the call"
                )}
              </div>
            </div>
            {speaking.has(i) && (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-0.5 bg-emerald-400 rounded-full h-full animate-pulse" />
                <span className="w-0.5 bg-emerald-400 rounded-full h-1/2 animate-pulse" style={{ animationDelay: "100ms" }} />
                <span className="w-0.5 bg-emerald-400 rounded-full h-3/4 animate-pulse" style={{ animationDelay: "200ms" }} />
              </div>
            )}
          </div>
        ))}
        <div className="px-4 py-2 text-xs uppercase text-[#8696a0]">Others</div>
        {members.slice(4).map((m, i) => (
          <div key={m + i} className="flex items-center gap-3 px-4 py-3 border-b border-[#222d34] animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-zinc-600 flex items-center justify-center text-white font-semibold">
              {m.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 font-medium text-sm">{m}</div>
            <span className="text-xs text-[#8696a0]">Muted</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Suppress unused
export const _u = { Info, Shield, Link };
