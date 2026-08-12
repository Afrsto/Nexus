import { useEffect, useState } from "react";
import { notificationService } from "@/services/notificationService";
import { userService } from "@/services/userService";
import { Avatar } from "@/components/ui/Avatar";
import EmptyState from "@/components/common/EmptyState";

/** Profile activity — local state only; never overwrites the global notification inbox. */
export default function ProfileActivity({ userId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    setItems(notificationService.forUser(userId).slice(0, 20));
  }, [userId]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon="✨"
        title="No recent activity"
        description="Likes, comments, and follows will show up here."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {items.map((item) => {
        const actor = userService.getById(item.userId);
        if (!actor) return null;
        return (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              padding: "var(--space-3) var(--space-4)",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <Avatar user={actor} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.4 }}>
                <strong style={{ fontWeight: 600 }}>{actor.name}</strong>{" "}
                <span style={{ color: "var(--text-secondary)" }}>{item.message}</span>
              </p>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
