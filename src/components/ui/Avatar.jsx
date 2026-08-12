import { getAvatarColor } from "@/utils/avatarColor";
import { usePresenceStore } from "@/store/usePresenceStore";

/**
 * Avatar — user image or initials with optional online indicator.
 */
export function Avatar({ user, size = 36, showOnline = false, className = "" }) {
  const isOnline = usePresenceStore((s) => s.isOnline(user?.id));
  const online = showOnline && isOnline;
  const color = getAvatarColor(user?.id);
  const label = user?.avatar || user?.name?.slice(0, 2).toUpperCase();

  return (
    <div
      style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}
      className={className}
    >
      {user?.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name || "User"}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.35,
            fontWeight: 600,
            color: "#fff",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.02em",
            userSelect: "none",
          }}
          aria-label={user?.name}
        >
          {label}
        </div>
      )}

      {online && (
        <span
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: "50%",
            background: "var(--teal)",
            border: "2px solid var(--bg-surface)",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/** Square avatar used for groups and rooms */
export function GroupAvatar({ initials, color = "var(--accent)", size = 36, radius }) {
  const r = radius ?? size * 0.3;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.32,
        fontWeight: 700,
        color: "#fff",
        fontFamily: "var(--font-display)",
        flexShrink: 0,
        userSelect: "none",
      }}
      aria-label={initials}
    >
      {initials}
    </div>
  );
}
