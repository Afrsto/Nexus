import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import FollowButton from "@/components/common/FollowButton";
import { formatCount } from "@/utils/avatarColor";

/** Reusable user list row for profile, friends, explore */
export default function UserRow({
  user,
  action,
  actionLabel = "Follow",
  onAction,
  showFollowers = true,
  asLink = true,
  showFollowButton = false,
}) {
  const inner = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-border)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Avatar user={user} size={44} showOnline />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{user.name}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          @{user.username}
          {showFollowers && user.followers != null && (
            <> · {formatCount(user.followers)} followers</>
          )}
        </p>
      </div>
      {action ??
        (showFollowButton ? (
          <FollowButton user={user} />
        ) : (
          onAction && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onAction(user);
              }}
            >
              {actionLabel}
            </Button>
          )
        ))}
    </div>
  );

  if (asLink && !showFollowButton) {
    return (
      <Link to={`/profile/${user.username}`} style={{ display: "block", textDecoration: "none" }}>
        {inner}
      </Link>
    );
  }

  if (showFollowButton) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <Link
          to={`/profile/${user.username}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flex: 1,
            minWidth: 0,
            textDecoration: "none",
          }}
        >
          <Avatar user={user} size={44} showOnline />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
              {user.name}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              @{user.username}
              {showFollowers && user.followers != null && (
                <> · {formatCount(user.followers)} followers</>
              )}
            </p>
          </div>
        </Link>
        <FollowButton user={user} />
      </div>
    );
  }

  return inner;
}
