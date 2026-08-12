import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { userService } from "./userService";

function normalizeId(id) {
  return Number(id);
}

function normalizeFollowData(raw = {}) {
  const data = {};
  for (const [key, value] of Object.entries(raw)) {
    const id = normalizeId(key);
    if (!id) continue;
    data[id] = {
      followerIds: [...new Set((value?.followerIds || []).map(normalizeId).filter(Boolean))],
      followingIds: [...new Set((value?.followingIds || []).map(normalizeId).filter(Boolean))],
    };
  }
  return data;
}

function loadFollows() {
  return normalizeFollowData(storage.get(STORAGE_KEYS.FOLLOWS, {}));
}

function saveFollows(data) {
  const normalized = normalizeFollowData(data);
  storage.set(STORAGE_KEYS.FOLLOWS, normalized);
  return normalized;
}

function ensureEntry(data, userId) {
  const id = normalizeId(userId);
  if (!data[id]) {
    data[id] = { followerIds: [], followingIds: [] };
  }
  return id;
}

function syncCounts(userId) {
  const data = loadFollows();
  const id = normalizeId(userId);
  const entry = data[id] || { followerIds: [], followingIds: [] };
  userService.updateCounts(id, {
    followers: entry.followerIds.length,
    following: entry.followingIds.length,
  });
}

export const followService = {
  ensureUserRecord(userId) {
    const data = loadFollows();
    ensureEntry(data, userId);
    saveFollows(data);
  },

  getFollowerIds(userId) {
    const data = loadFollows();
    return data[normalizeId(userId)]?.followerIds || [];
  },

  getFollowingIds(userId) {
    const data = loadFollows();
    return data[normalizeId(userId)]?.followingIds || [];
  },

  isFollowing(viewerId, targetId) {
    const viewer = normalizeId(viewerId);
    const target = normalizeId(targetId);
    if (!viewer || !target || viewer === target) return false;
    const data = loadFollows();
    return (data[viewer]?.followingIds || []).includes(target);
  },

  follow(viewerId, targetId) {
    const viewer = normalizeId(viewerId);
    const target = normalizeId(targetId);
    if (!viewer || !target || viewer === target) return false;

    const data = loadFollows();
    ensureEntry(data, viewer);
    ensureEntry(data, target);

    if (data[viewer].followingIds.includes(target)) return false;

    data[viewer].followingIds.push(target);
    if (!data[target].followerIds.includes(viewer)) {
      data[target].followerIds.push(viewer);
    }

    saveFollows(data);
    syncCounts(viewer);
    syncCounts(target);
    return true;
  },

  unfollow(viewerId, targetId) {
    const viewer = normalizeId(viewerId);
    const target = normalizeId(targetId);
    if (!viewer || !target) return false;

    const data = loadFollows();
    if (!data[viewer]) return false;

    const wasFollowing = data[viewer].followingIds.includes(target);
    if (!wasFollowing) return false;

    data[viewer].followingIds = data[viewer].followingIds.filter((id) => id !== target);
    if (data[target]) {
      data[target].followerIds = data[target].followerIds.filter((id) => id !== viewer);
    }

    saveFollows(data);
    syncCounts(viewer);
    syncCounts(target);
    return true;
  },

  /** Ensure every registered user has a follow record and accurate counts */
  migrateAll() {
    const data = loadFollows();
    for (const user of userService.getAll()) {
      ensureEntry(data, user.id);
    }
    saveFollows(data);
    for (const user of userService.getAll()) {
      syncCounts(user.id);
    }
  },

  getSuggestedUsers(viewerId, limit = 5) {
    const viewer = normalizeId(viewerId);
    const all = userService.getAll().filter((u) => u.id !== viewer);
    const following = new Set(this.getFollowingIds(viewer));
    return all.filter((u) => !following.has(u.id)).slice(0, limit);
  },
};
