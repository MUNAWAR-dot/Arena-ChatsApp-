import type { ReactNode } from "react";

// Render Chatsapp-style formatting:
// *bold* _italic_ ~strikethrough~ ```monospace``` `inlinecode`
// And detect URLs → link previews (just styled span)
export function formatText(text: string): ReactNode[] {
  if (!text) return [];

  const tokens: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  // Regex order matters: monospace blocks first
  const patterns: { regex: RegExp; render: (m: string) => ReactNode }[] = [
    {
      regex: /```([^`]+)```/,
      render: (m) => <code key={key++} className="block bg-black/30 rounded px-2 py-1 my-1 font-mono text-xs whitespace-pre-wrap">{m}</code>,
    },
    {
      regex: /`([^`\n]+)`/,
      render: (m) => <code key={key++} className="bg-black/30 rounded px-1 font-mono text-xs">{m}</code>,
    },
    {
      regex: /\*([^*\n]+)\*/,
      render: (m) => <strong key={key++} className="font-bold">{m}</strong>,
    },
    {
      regex: /_([^_\n]+)_/,
      render: (m) => <em key={key++} className="italic">{m}</em>,
    },
    {
      regex: /~([^~\n]+)~/,
      render: (m) => <span key={key++} className="line-through">{m}</span>,
    },
    {
      regex: /(https?:\/\/[^\s]+)/,
      render: (m) => <span key={key++} className="text-emerald-300 underline break-all">{m}</span>,
    },
    {
      regex: /(@\w+)/,
      render: (m) => <span key={key++} className="text-emerald-400 font-medium">{m}</span>,
    },
  ];

  let safety = 0;
  while (remaining && safety++ < 200) {
    let earliestIdx = -1;
    let earliestPattern = -1;
    let earliestMatch: RegExpExecArray | null = null;

    for (let i = 0; i < patterns.length; i++) {
      patterns[i].regex.lastIndex = 0;
      const m = patterns[i].regex.exec(remaining);
      if (m && (earliestIdx === -1 || m.index < earliestIdx)) {
        earliestIdx = m.index;
        earliestPattern = i;
        earliestMatch = m;
      }
    }

    if (earliestPattern === -1 || !earliestMatch) {
      tokens.push(<span key={key++}>{remaining}</span>);
      break;
    }

    if (earliestIdx > 0) {
      tokens.push(<span key={key++}>{remaining.slice(0, earliestIdx)}</span>);
    }
    tokens.push(patterns[earliestPattern].render(earliestMatch[1]));
    remaining = remaining.slice(earliestIdx + earliestMatch[0].length);
  }

  return tokens;
}

// Detect first URL in text (for link preview)
export function extractFirstUrl(text: string): string | null {
  const m = text.match(/(https?:\/\/[^\s]+)/);
  return m ? m[0] : null;
}
