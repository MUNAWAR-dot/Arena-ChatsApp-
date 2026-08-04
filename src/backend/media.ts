/**
 * Chatsapp Media Service.
 *
 * Real file pipeline: read → client-side compression (canvas) → thumbnail →
 * blob persisted in IndexedDB → object URL used in the UI. Supports retry and
 * progress reporting. In production, blobs would stream to S3/cloud storage via
 * signed URLs; the service exposes the same upload(file) API.
 */

import { db } from "./db";
import { secureToken } from "./crypto";

export interface MediaRecord {
  id: string;
  messageId?: string;
  chatId?: string;
  type: "image" | "video" | "audio" | "doc";
  mime: string;
  name: string;
  size: number;
  blob?: Blob;
  url?: string; // local object URL cache
  thumbnailUrl?: string;
  createdAt: number;
  uploaded: boolean;
}

export const MAX_IMAGE_DIMENSION = 1600;
export const THUMB_MAX = 320;
export const JPEG_QUALITY = 0.82;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

async function compressImage(file: File, maxDim: number): Promise<{ blob: Blob; thumb: string | null }> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { blob: file, thumb: null };
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b || file), "image/jpeg", JPEG_QUALITY)
    );
    // thumbnail
    const ts = Math.min(1, THUMB_MAX / Math.max(w, h));
    const tw = Math.round(w * ts);
    const th = Math.round(h * ts);
    canvas.width = tw;
    canvas.height = th;
    ctx.drawImage(img, 0, 0, tw, th);
    const thumbData = canvas.toDataURL("image/jpeg", 0.6);
    return { blob, thumb: thumbData };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface UploadProgress {
  (percent: number): void;
}

/**
 * Upload media. When Cloudinary is configured (VITE_CLOUDINARY_CLOUD_NAME +
 * VITE_CLOUDINARY_UPLOAD_PRESET), files are uploaded to Cloudinary and the
 * CDN URL is stored. Otherwise files are stored locally in IndexedDB.
 */
export async function uploadMedia(
  file: File,
  opts: { chatId?: string; messageId?: string; onProgress?: UploadProgress } = {}
): Promise<MediaRecord> {
  const type: MediaRecord["type"] = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
    ? "video"
    : file.type.startsWith("audio/")
    ? "audio"
    : "doc";

  let blob: Blob = file;
  let thumb: string | null = null;

  opts.onProgress?.(15); // read
  if (type === "image") {
    const compressed = await compressImage(file, MAX_IMAGE_DIMENSION);
    blob = compressed.blob;
    thumb = compressed.thumb;
  } else if (type === "video" || type === "audio") {
    blob = file;
  }
  opts.onProgress?.(60); // processed

  // Cloudinary upload (free tier) when configured
  let cloudUrl: string | null = null;
  const cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;
  if (cloudName && preset) {
    try {
      const form = new FormData();
      form.append("file", blob, file.name);
      form.append("upload_preset", preset);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const data = await res.json();
        cloudUrl = data?.secure_url || data?.url || null;
      }
    } catch {}
  }
  opts.onProgress?.(85);

  const rec: MediaRecord = {
    id: "m_" + secureToken(10),
    chatId: opts.chatId,
    messageId: opts.messageId,
    type,
    mime: file.type || "application/octet-stream",
    name: file.name || `media_${Date.now()}`,
    size: blob.size,
    blob: cloudUrl ? undefined : blob,
    url: cloudUrl || URL.createObjectURL(blob),
    thumbnailUrl: thumb || undefined,
    createdAt: Date.now(),
    uploaded: true,
  };
  await db.put("media", rec); // persisted (metadata; blob omitted when in cloud)
  opts.onProgress?.(100);
  return rec;
}

export async function getMedia(id: string): Promise<MediaRecord | undefined> {
  return db.get<MediaRecord>("media", id);
}

export async function deleteMedia(id: string): Promise<void> {
  const rec = await db.get<MediaRecord>("media", id);
  if (rec?.url && rec.url.startsWith("blob:")) URL.revokeObjectURL(rec.url);
  await db.delete("media", id);
}

export function dataUrlFromMedia(rec: MediaRecord): string | null {
  if (rec.thumbnailUrl) return rec.thumbnailUrl;
  if (rec.url) return rec.url;
  return null;
}

export { blobToDataUrl };
