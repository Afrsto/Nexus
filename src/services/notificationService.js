import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { formatPostTime } from "@/utils/userHelpers";
import { socketService } from "./socketService";

function load() {
  return storage.get(STORAGE_KEYS.NOTIFICATIONS, []);
}

function save(list) {
  storage.set(STORAGE_KEYS.NOTIFICATIONS, list);
}

export const notificationService = {
  getAll() {
    return load().sort((a, b) => b.createdAt - a.createdAt);
  },

  add({ userId, targetUserId, type, message, postId = null }) {
    const list = load();
    const notif = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now() + Math.random(),
      userId,
      targetUserId,
      type,
      message,
      postId,
      read: false,
      createdAt: Date.now(),
      time: "just now",
    };
    list.unshift(notif);
    save(list.slice(0, 100));
    socketService.emit("notification:new", notif);
    return notif;
  },

  markRead(id) {
    const list = load().map((n) => (n.id === id ? { ...n, read: true } : n));
    save(list);
  },

  markAllRead(targetUserId) {
    const list = load().map((n) => (n.targetUserId === targetUserId ? { ...n, read: true } : n));
    save(list);
  },

  forUser(targetUserId) {
    return load()
      .filter((n) => n.targetUserId === targetUserId)
      .map((n) => ({ ...n, time: formatPostTime(n.createdAt) }));
  },
};
