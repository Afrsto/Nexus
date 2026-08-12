import { applyPlatformAdmin } from "@/constants/permissions";

/** Public user shape — never expose password */
export function toPublicUser(user) {
  if (!user) return null;
  const publicUser = { ...user };
  delete publicUser.password;
  return applyPlatformAdmin(publicUser);
}

export function getInitials(name = "U") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatPostTime(isoOrMs) {
  const date = typeof isoOrMs === "number" ? new Date(isoOrMs) : new Date(isoOrMs);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
