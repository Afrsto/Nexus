import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePresenceStore } from "@/store/usePresenceStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useChatStore } from "@/store/useChatStore";
import { socketService } from "@/services/socketService";

/** Wire socket presence, notifications, chat messages, and typing for the logged-in user */
export function useRealtime() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!user?.id || !token) return;

    let cancelled = false;
    const selfId = Number(user.id);

    const onOnline = ({ userId }) => usePresenceStore.getState().setOnline(userId);
    const onOffline = ({ userId }) => usePresenceStore.getState().setOffline(userId);
    const onHeartbeat = ({ userId }) => usePresenceStore.getState().setOnline(userId);
    const onNotification = (notif) => {
      useNotificationStore.getState().pushRealtime(notif, selfId);
    };
    const onMessage = (msg) => {
      const chatId = msg.chatId;
      if (chatId == null) return;
      // Skip own echoes already appended by sendMessage
      if (Number(msg.senderId) === selfId) {
        const history = useChatStore.getState().history[chatId] || [];
        if (history.some((m) => m.id === msg.id)) return;
      }
      useChatStore.getState().receiveMessage(chatId, msg);
    };
    const onTyping = ({ chatId, userId, isTyping }) => {
      if (chatId == null) return;
      if (userId != null && Number(userId) === selfId) return;
      useChatStore.getState().setTyping(Number(chatId), Boolean(isTyping));
    };

    (async () => {
      try {
        await socketService.connect(token, user.id);
        if (cancelled) return;
        usePresenceStore.getState().setOnline(user.id);
      } catch {
        /* presence still works via local handlers if connect fails mid-way */
      }
    })();

    socketService.on("user:online", onOnline);
    socketService.on("user:offline", onOffline);
    socketService.on("user:heartbeat", onHeartbeat);
    socketService.on("notification:new", onNotification);
    socketService.on("message:new", onMessage);
    socketService.on("typing:update", onTyping);

    return () => {
      cancelled = true;
      socketService.off("user:online", onOnline);
      socketService.off("user:offline", onOffline);
      socketService.off("user:heartbeat", onHeartbeat);
      socketService.off("notification:new", onNotification);
      socketService.off("message:new", onMessage);
      socketService.off("typing:update", onTyping);
      usePresenceStore.getState().setOffline(user.id);
      usePresenceStore.getState().reset();
      socketService.disconnect();
    };
  }, [user?.id, token]);
}
