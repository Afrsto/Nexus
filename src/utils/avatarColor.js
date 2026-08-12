import { AVATAR_COLORS } from "@/constants/theme";

/** Returns a consistent color for a given user ID */
export function getAvatarColor(userId) {
  return AVATAR_COLORS[Math.abs(userId) % AVATAR_COLORS.length];
}

/** Format large numbers: 12400 → 12.4k */
export function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toLocaleString();
}
