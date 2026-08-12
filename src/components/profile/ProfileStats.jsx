import { formatCount } from "@/utils/avatarColor";

export default function ProfileStats({ user, onStatClick }) {
  const stats = [
    { key: "Posts", value: user.posts, tab: "Posts" },
    { key: "Followers", value: user.followers, tab: "Followers" },
    { key: "Following", value: user.following, tab: "Following" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-2)",
        flexWrap: "wrap",
        marginTop: "var(--space-4)",
      }}
    >
      {stats.map((stat) => (
        <button
          key={stat.key}
          type="button"
          onClick={() => onStatClick?.(stat.tab)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "var(--space-2) var(--space-4)",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            cursor: onStatClick ? "pointer" : "default",
            transition: "all var(--transition-fast)",
            minWidth: 88,
            fontFamily: "var(--font-body)",
          }}
          onMouseEnter={(e) => {
            if (onStatClick) {
              e.currentTarget.style.borderColor = "var(--accent-border)";
              e.currentTarget.style.background = "var(--accent-muted)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.background = "var(--bg-card)";
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--text-primary)",
            }}
          >
            {formatCount(stat.value)}
          </span>
          <span style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{stat.key}</span>
        </button>
      ))}
    </div>
  );
}
