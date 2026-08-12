import { create } from "zustand";
import { notificationService } from "@/services/notificationService";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  filter: "all",

  loadForUser(targetUserId) {
    const notifications = notificationService.forUser(targetUserId);
    set({ notifications });
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  setFilter(filter) {
    set({ filter });
  },

  markRead(id) {
    notificationService.markRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  },

  markAllRead(targetUserId) {
    notificationService.markAllRead(targetUserId);
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  refresh(targetUserId) {
    get().loadForUser(targetUserId);
  },

  pushRealtime(notif, currentUserId) {
    if (!notif || Number(notif.targetUserId) !== Number(currentUserId)) return;
    set((s) => {
      const exists = s.notifications.some((n) => n.id === notif.id);
      if (exists) return s;
      return {
        notifications: [
          { ...notif, time: notif.time || "just now", read: false },
          ...s.notifications,
        ],
      };
    });
  },

  getFiltered() {
    const { notifications, filter } = get();
    if (filter === "all") return notifications;
    const map = {
      mentions: "mention",
      likes: "like",
      follows: "follow",
      comments: "comment",
    };
    return notifications.filter((n) => n.type === map[filter]);
  },
}));
