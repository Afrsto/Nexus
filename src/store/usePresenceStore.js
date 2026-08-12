import { create } from "zustand";
import { userService } from "@/services/userService";

export const usePresenceStore = create((set, get) => ({
  onlineIds: new Set(),

  setOnline(userId) {
    const id = Number(userId);
    if (!id) return;
    set((s) => {
      const next = new Set(s.onlineIds);
      next.add(id);
      return { onlineIds: next };
    });
    userService.setOnlineStatus(id, true);
  },

  setOffline(userId) {
    const id = Number(userId);
    if (!id) return;
    set((s) => {
      const next = new Set(s.onlineIds);
      next.delete(id);
      return { onlineIds: next };
    });
    userService.setOnlineStatus(id, false);
  },

  isOnline(userId) {
    const id = Number(userId);
    if (!id) return false;
    return get().onlineIds.has(id);
  },

  hydrate(ids = []) {
    const next = new Set(ids.map(Number).filter(Boolean));
    set({ onlineIds: next });
    next.forEach((id) => userService.setOnlineStatus(id, true));
  },

  reset() {
    const ids = Array.from(get().onlineIds);
    ids.forEach((id) => userService.setOnlineStatus(id, false));
    set({ onlineIds: new Set() });
  },
}));
