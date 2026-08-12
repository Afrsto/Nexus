/**
 * Image uploads via ImgBB (https://api.imgbb.com/)
 * Set VITE_IMGBB_API_KEY in .env — get a free key at https://api.imgbb.com/
 *
 * Note: VITE_* keys are bundled into the client. Prefer a backend upload proxy in production.
 */

const MAX_SIZE_MB = 10;
const MAX_DATA_URL_BYTES = 1.5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];
const ALLOWED_EXT = /\.(jpe?g|png|gif|webp)$/i;

import { IS_PROD } from "@/config/env";

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

export function validateImageFile(file) {
  if (!file) return { valid: false, error: "No file selected" };

  const typeOk = file.type && ALLOWED_TYPES.includes(file.type);
  const extOk = ALLOWED_EXT.test(file.name || "");
  if (!typeOk || !extOk) {
    return { valid: false, error: "Only JPEG, PNG, GIF, and WebP images are allowed" };
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return { valid: false, error: `Image must be under ${MAX_SIZE_MB}MB` };
  }
  return { valid: true };
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      resolve(typeof result === "string" ? result.split(",")[1] : "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Dev-only offline fallback when no API key is configured */
async function fileToDataUrl(file, onProgress) {
  if (file.size > MAX_DATA_URL_BYTES) {
    throw new Error(
      "Local image fallback is limited to 1.5MB. Configure VITE_IMGBB_API_KEY for larger uploads."
    );
  }
  onProgress?.(20);
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  onProgress?.(100);
  return { url: dataUrl, thumbnail: dataUrl, localOnly: true };
}

async function uploadToImgBB(file, onProgress) {
  if (!IMGBB_API_KEY?.trim()) {
    throw new Error(
      "Image upload is not configured. Add VITE_IMGBB_API_KEY to your .env file (free key at https://api.imgbb.com/)."
    );
  }

  onProgress?.(10);
  const base64 = await fileToBase64(file);

  onProgress?.(35);
  const body = new FormData();
  body.append("key", IMGBB_API_KEY.trim());
  body.append("image", base64);
  body.append("name", file.name || `upload-${Date.now()}`);

  onProgress?.(55);
  const res = await fetch(IMGBB_UPLOAD_URL, { method: "POST", body });
  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    const msg =
      data.error?.message ||
      data.error?.message_key ||
      (typeof data.error === "string" ? data.error : null) ||
      "Upload failed";
    throw new Error(msg);
  }

  const url = data.data?.display_url || data.data?.url;
  if (!url) throw new Error("Upload succeeded but no image URL was returned");

  onProgress?.(100);
  return {
    url,
    thumbnail: data.data?.thumb?.url || data.data?.medium?.url || url,
  };
}

export async function uploadImage(file, onProgress) {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  try {
    return await uploadToImgBB(file, onProgress);
  } catch (err) {
    if (!IMGBB_API_KEY?.trim()) {
      if (IS_PROD) {
        throw new Error("Image upload is not configured.");
      }
      console.warn("[imageUpload] No ImgBB key — using local data URL:", err.message);
      return fileToDataUrl(file, onProgress);
    }
    throw err;
  }
}

export function revokePreviewUrl(url) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}
