import { useNotificationStore } from "@/store/useNotificationStore";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar } from "@/components/ui/Avatar";
import EmptyState from "@/components/common/EmptyState";

const TYPE_META = {
  like: { icon: "❤️", color: "var(--pink)", label: "Like" },
  comment: { icon: "💬", color: "var(--accent)", label: "Comment" },
  follow: { icon: "👤", color: "var(--teal)", label: "Follow" },
  friend_request: { icon: "🤝", color: "var(--amber)", label: "Request" },
  mention: { icon: "@", color: "var(--accent)", label: "Mention" },
};

const FILTERS = ["all", "mentions", "likes", "follows"];

export default function NotificationList() {
  const user = useAuthStore((s) => s.user);
  const { filter, setFilter, markRead, markAllRead, getFiltered } = useNotificationStore();
  const notifications = getFiltered();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: 4 }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "5px 14px",
                borderRadius: "var(--radius-full)",
                background: filter === f ? "var(--accent)" : "transparent",
                color: filter === f ? "var(--on-accent)" : "var(--text-muted)",
                border: filter === f ? "none" : "1px solid var(--border)",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                transition: "all var(--transition-fast)",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {unread > 0 && (
          <button
            onClick={() => user && markAllRead(user.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--accent)",
              fontFamily: "var(--font-body)",
            }}
          >
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="All caught up!"
            description="No notifications to show right now"
          />
        ) : (
          notifications.map((notif) => <NotifItem key={notif.id} notif={notif} onRead={markRead} />)
        )}
      </div>
    </div>
  );
}

function NotifItem({ notif, onRead }) {
  const user = userService.getById(notif.userId);
  const meta = TYPE_META[notif.type] || { icon: "✦", color: "var(--accent)" };

  if (!user) return null;

  return (
    <button
      type="button"
      onClick={() => onRead(notif.id)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        padding: "14px 20px",
        background: notif.read ? "transparent" : "var(--accent-muted)",
        border: "none",
        borderBottom: "1px solid var(--border)",
        cursor: "pointer",
        transition: "background var(--transition-fast)",
        animation: "fadeIn 0.2s ease",
        textAlign: "left",
        fontFamily: "inherit",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card)")}
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = notif.read ? "transparent" : "var(--accent-muted)")
      }
    >
      {/* Avatar + type badge */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar user={user} size={44} />
        <div
          style={{
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 20,
            height: 20,
            borderRadius: 10,
            background: meta.color,
            border: "2px solid var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
          }}
        >
          {meta.icon}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 600 }}>{user.name}</strong>{" "}
          <span style={{ color: "var(--text-secondary)" }}>{notif.message || notif.content}</span>
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{notif.time}</p>
      </div>

      {!notif.read && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent)",
            flexShrink: 0,
            marginTop: 6,
          }}
        />
      )}
    </button>
  );
}
