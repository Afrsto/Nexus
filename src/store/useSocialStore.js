import { create } from "zustand";
import { followService } from "@/services/followService";
import { userService } from "@/services/userService";
import { notificationService } from "@/services/notificationService";

function followKey(viewerId, targetId) {
  return `${viewerId}-${targetId}`;
}

export const useSocialStore = create((set, get) => ({
  version: 0,
  followLoading: {},

  bump() {
    set((s) => ({ version: s.version + 1 }));
  },

  getFollowers(userId) {
    const ids = followService.getFollowerIds(userId);
    return ids.map((id) => userService.getById(id)).filter(Boolean);
  },

  getFollowing(userId) {
    const ids = followService.getFollowingIds(userId);
    return ids.map((id) => userService.getById(id)).filter(Boolean);
  },

  isFollowing(viewerId, targetId) {
    return followService.isFollowing(viewerId, targetId);
  },

  getUser(userId) {
    return userService.getById(userId);
  },

  getUserByUsername(username) {
    return userService.getByUsername(username);
  },

  getSuggested(viewerId, limit = 5) {
    return followService.getSuggestedUsers(viewerId, limit);
  },

  async follow(viewerId, targetId) {
    const key = followKey(viewerId, targetId);
    if (get().followLoading[key]) return false;

    set((s) => ({
      followLoading: { ...s.followLoading, [key]: true },
    }));

    try {
      const ok = followService.follow(viewerId, targetId);
      if (ok) {
        notificationService.add({
          userId: viewerId,
          targetUserId: targetId,
          type: "follow",
          message: "started following you",
        });
        get().bump();
      }
      return ok;
    } finally {
      set((s) => {
        const next = { ...s.followLoading };
        delete next[key];
        return { followLoading: next };
      });
    }
  },

  async unfollow(viewerId, targetId) {
    const key = followKey(viewerId, targetId);
    if (get().followLoading[key]) return false;

    set((s) => ({
      followLoading: { ...s.followLoading, [key]: true },
    }));

    try {
      const ok = followService.unfollow(viewerId, targetId);
      if (ok) get().bump();
      return ok;
    } finally {
      set((s) => {
        const next = { ...s.followLoading };
        delete next[key];
        return { followLoading: next };
      });
    }
  },

  isFollowLoading(viewerId, targetId) {
    return !!get().followLoading[followKey(viewerId, targetId)];
  },

  searchUsers(query) {
    return userService.search(query);
  },
}));
