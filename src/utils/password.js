/**
 * Password hashing helpers for mock/local auth.
 * Demo-only: still client-side — not a substitute for server auth.
 */

const TEXT_ENCODER = new TextEncoder();

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function randomSaltHex(bytes = 16) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return toHex(arr);
}

/** Returns `saltHex:hashHex` */
export async function hashPassword(password, saltHex = randomSaltHex()) {
  const salt = fromHex(saltHex);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    TEXT_ENCODER.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  return `${saltHex}:${toHex(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored) return false;
  // Legacy plaintext (pre-migration) — compare directly then caller should rehash
  if (!stored.includes(":")) {
    return stored === password;
  }
  const [saltHex] = stored.split(":");
  if (!saltHex) return false;
  const next = await hashPassword(password, saltHex);
  return next === stored;
}

export function isHashedPassword(stored) {
  return typeof stored === "string" && stored.includes(":") && stored.length > 40;
}
