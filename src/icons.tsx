import type { SVGProps } from "react";

const I = (props: SVGProps<SVGSVGElement>) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const Search = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
);
export const Camera = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
);
export const More = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></svg>
);
export const Plus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const Pencil = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
);
export const ChatBubble = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
);
export const Phone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
export const Video = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" ry="2" /></svg>
);
export const Mic = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
);
export const Send = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>
);
export const Smile = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
);
export const Paperclip = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
);
export const ArrowLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
export const Check = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="20 6 9 17 4 12" /></svg>
);
export const DoubleCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)} viewBox="0 0 18 18">
    <path d="M1 9.5l3.5 3.5L9 8" />
    <path d="M7.5 13l3.5-3.5M11 12l6-6" />
  </svg>
);
export const Clock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
export const Pin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></svg>
);
export const VolumeX = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
);
export const Users = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
export const ArrowDownLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="17" y1="7" x2="7" y2="17" /><polyline points="17 17 7 17 7 7" /></svg>
);
export const ArrowUpRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" /></svg>
);
export const PhoneMissed = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="23" y1="1" x2="17" y2="7" /><line x1="17" y1="1" x2="23" y2="7" /><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
export const Settings = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
);
export const User = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
export const Bell = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
);
export const Lock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
);
export const HelpCircle = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
export const Database = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></svg>
);
export const Palette = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>
);
export const ChevronRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="9 18 15 12 9 6" /></svg>
);
export const QR = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><line x1="14" y1="14" x2="14" y2="17" /><line x1="17" y1="14" x2="20" y2="14" /><line x1="17" y1="17" x2="17" y2="20" /><line x1="20" y1="17" x2="20" y2="20" /></svg>
);
export const Image = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
);
export const FileText = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
);
export const MapPin = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const Sticker = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M15 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9l6-6V5a2 2 0 0 0-2-2z" /><polyline points="15 21 15 15 21 15" /></svg>
);
export const X = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);
export const PhoneOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" /><line x1="23" y1="1" x2="1" y2="23" /></svg>
);
export const VolumeUp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
);
export const MicOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
);
export const VideoOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);
export const Globe = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);
export const Star = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
export const StarFilled = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)} fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);
export const Trash = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
);
export const Reply = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="9 17 4 12 9 7" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></svg>
);
export const Forward = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="15 17 20 12 15 7" /><path d="M4 18v-2a4 4 0 0 1 4-4h12" /></svg>
);
export const Copy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
export const Info = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
);
export const Archive = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" /></svg>
);
export const Moon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
);
export const Sun = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
);
export const Type = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>
);
export const Eye = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const Monitor = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
);
export const LogOut = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
);
export const Refresh = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
);
export const ArrowUp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
);
export const RotateCcw = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
);
export const Flash = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
export const Share2 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
);
// Chatsapp brand mark — modern chat bubble with a "C" spark
// (aesthetic new-brand logo: rounded bubble + stylized speech tail + "C")
export const ChatsappLogo = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 48" fill="none" {...p}>
    <defs>
      <linearGradient id="csGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#2BE37F" />
        <stop offset="1" stopColor="#0BA95B" />
      </linearGradient>
    </defs>
    {/* Rounded-square badge */}
    <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#csGrad)" />
    {/* Chat bubble with tail */}
    <path
      d="M24 9.5c-8.2 0-14.5 5.7-14.5 13 0 3.6 1.7 6.9 4.6 9.2-.2 1.5-.7 3-1.4 4.2 2.5-1 4.4-2.4 5.8-3.7 1.7.6 3.6.9 5.5.9 8.2 0 14.5-5.7 14.5-13S32.2 9.5 24 9.5z"
      fill="white"
    />
    {/* C letter mark */}
    <path
      d="M28.8 17.8a6.2 6.2 0 1 0 0 8.6l-1.6-1.3a4.1 4.1 0 1 1 0-6l1.6-1.3z"
      fill="#0BA95B"
    />
    {/* Spark dot */}
    <circle cx="34" cy="12.5" r="1.8" fill="#7CFCB2" />
  </svg>
);
export const MessageCircle = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
);
export const Maximize = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
);
export const Minimize = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
);
export const ScreenShare = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /><path d="m8 11 4-4 4 4" /><line x1="12" y1="7" x2="12" y2="15" /></svg>
);
export const PhoneIncoming = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="16 2 16 8 22 8" /><line x1="23" y1="1" x2="16" y2="8" /><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
export const Pause = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)} fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
);
export const Play = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)} fill="currentColor" stroke="none"><polygon points="6 4 20 12 6 20 6 4" /></svg>
);
export const Heart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
);
export const Edit3 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
);
export const Megaphone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M3 11l18-8v18l-18-8v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>
);
export const CreditCard = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
);
export const Shield = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
export const Cloud = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>
);
export const ChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="6 9 12 15 18 9" /></svg>
);
export const Hash = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>
);
export const UserPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
);
export const UserMinus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
);
export const Download = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
export const CalendarClock = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><circle cx="12" cy="16" r="3" /></svg>
);
export const Wifi = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
);
export const WifiOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="1" y1="1" x2="23" y2="23" /><path d="M16.72 11.06A11 11 0 0 1 19 12.55" /><path d="M5 12.55a11 11 0 0 1 5.17-2.39" /><path d="M10.71 5.05A16 16 0 0 1 22.58 9" /><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>
);
export const Smartphone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>
);
export const Mail = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
);
export const PieChart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>
);
export const Backspace = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" /><line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" /></svg>
);
export const Mic2 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /></svg>
);
export const Sparkles = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM5 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" /></svg>
);
export const Tag = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
);
export const Calendar = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
export const TrendingUp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);
export const Bot = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="3" y="11" width="18" height="10" rx="2" ry="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></svg>
);
export const Briefcase = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
export const ShoppingBag = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
);
export const Zap = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
);
export const Hash2 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></svg>
);
export const TagPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /><line x1="14" y1="3" x2="20" y2="3" /><line x1="17" y1="0" x2="17" y2="6" /></svg>
);
export const Languages = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" /></svg>
);
export const Volume = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
);
export const Scissors = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
);
export const PictureInPicture = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><rect x="2" y="4" width="20" height="16" rx="2" /><rect x="13" y="11" width="7" height="6" rx="1" fill="currentColor" stroke="none" /></svg>
);
export const Layers = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>
);
export const AtSign = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" /></svg>
);
export const ScanLine = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><line x1="7" y1="12" x2="17" y2="12" /></svg>
);
export const Pencil2 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M12 19l7-7 3 3-7 7-3-3z" /><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" /><path d="M2 2l7.586 7.586" /><circle cx="11" cy="11" r="2" /></svg>
);
export const Cart = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
);
export const Pin2 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="12" y1="17" x2="12" y2="22" /><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" /></svg>
);
export const ZoomIn = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>
);
// Google "G" logo (4-color)
export const GoogleG = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...p}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
// Apple logo for "Sign in with Apple"
export const AppleLogo = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...p}>
    <path d="M17.6 12.5c0-2.4 2-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8s-1.9-.8-3.1-.8c-1.6 0-3 .9-3.8 2.4-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.7zM15.4 5.6c.6-.7 1.1-1.7.9-2.7-.9 0-2 .6-2.6 1.3-.6.6-1.1 1.6-1 2.6 1 .1 2-.5 2.7-1.2z" />
  </svg>
);
export const Facebook = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2" {...p}>
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
  </svg>
);
export const Verified = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)} fill="currentColor" stroke="none">
    <path d="M12 1l2.39 3.21 3.81-.82-.13 3.91 3.61 1.55-1.95 3.42 1.95 3.42-3.61 1.55.13 3.91-3.81-.82L12 23l-2.39-3.21-3.81.82.13-3.91-3.61-1.55 1.95-3.42-1.95-3.42 3.61-1.55-.13-3.91 3.81.82L12 1z" />
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" />
  </svg>
);
export const Bold = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>
);
export const Italic = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>
);
export const Strikethrough = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M16 4H9a3 3 0 0 0-2.83 4" /><path d="M14 12a4 4 0 0 1 0 8H6" /><line x1="4" y1="12" x2="20" y2="12" /></svg>
);
export const Code = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);
export const Cake = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" /><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" /><path d="M2 21h20" /><path d="M7 8v3" /><path d="M12 8v3" /><path d="M17 8v3" /><path d="M7 4h.01" /><path d="M12 4h.01" /><path d="M17 4h.01" /></svg>
);
export const AlertTriangle = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
);
export const Link = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);
export const PackageCheck = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M16.5 9.4 7.55 4.24" /><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
);
export const EyeOff = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
);
export const Ghost = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M9 10h.01" /><path d="M15 10h.01" /><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" /></svg>
);
export const Headphones = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>
);
export const Activity = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
);
export const Crown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
);
export const Shield2 = (p: SVGProps<SVGSVGElement>) => (
  <svg {...I(p)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
);
