import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { socketService } from "@/services/socketService";
import NotificationList from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const loadForUser = useNotificationStore((s) => s.loadForUser);
  const refresh = useNotificationStore((s) => s.refresh);

  useEffect(() => {
    if (user) loadForUser(user.id);
  }, [user, loadForUser]);

  useEffect(() => {
    if (!user) return;
    const onNew = () => refresh(user.id);
    socketService.on("notification:new", onNew);
    return () => socketService.off("notification:new", onNew);
  }, [user, refresh]);

  return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Notifications
        </h1>
      </div>

      <div style={{ flex: 1, overflow: "hidden", maxWidth: 680, width: "100%", margin: "0 auto" }}>
        <NotificationList />
      </div>
    </div>
  );
}
