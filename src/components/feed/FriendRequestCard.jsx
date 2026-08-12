import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { formatCount } from "@/utils/avatarColor";

export default function FriendRequestCard({ user, onAccept, onDecline }) {
  const [status, setStatus] = useState(null); // null | "accepted" | "declined"

  if (status) {
    return (
      <div
        style={{
          padding: "14px 16px",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: 0.6,
        }}
      >
        <Avatar user={user} size={40} />
        <p style={{ fontSize: 13, color: "var(--text-muted)", fontStyle: "italic" }}>
          {status === "accepted"
            ? `Now connected with ${user.name}`
            : `Ignored request from ${user.name}`}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "14px 16px",
        background: "var(--bg-card)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        transition: "border-color var(--transition-fast)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      <Avatar user={user} size={44} showOnline />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{user.name}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          @{user.username} · {formatCount(user.followers)} followers
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setStatus("accepted");
            onAccept?.(user);
          }}
        >
          Accept
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStatus("declined");
            onDecline?.(user);
          }}
        >
          Ignore
        </Button>
      </div>
    </div>
  );
}
