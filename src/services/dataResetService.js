import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { ADMIN_EMAIL } from "@/constants/permissions";
import { initUserRegistry } from "./userService";
import { toPublicUser } from "@/utils/userHelpers";

const DATA_RESET_VERSION_KEY = "nexus_data_reset_version";
const CURRENT_RESET_VERSION = "admin-only-v1";

function loadUsers() {
  return storage.get(STORAGE_KEYS.USERS, []);
}

/** Wipe all app data except the admin account; reset admin activity counts. */
export async function resetApplicationDataExceptAdmin() {
  await initUserRegistry();

  const users = loadUsers();
  let admin = users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  if (!admin) {
    await initUserRegistry();
    admin = loadUsers().find((u) => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  }

  if (!admin) return;

  const adminRecord = {
    ...admin,
    role: "admin",
    followers: 0,
    following: 0,
    posts: 0,
  };

  storage.set(STORAGE_KEYS.USERS, [adminRecord]);
  storage.set(STORAGE_KEYS.POSTS, []);
  storage.set(STORAGE_KEYS.COMMENTS, {});
  storage.set(STORAGE_KEYS.FOLLOWS, {
    [adminRecord.id]: { followerIds: [], followingIds: [] },
  });
  storage.set(STORAGE_KEYS.CHATS, []);
  storage.set(STORAGE_KEYS.CHAT_HISTORY, {});
  storage.set(STORAGE_KEYS.NOTIFICATIONS, []);
  storage.set(STORAGE_KEYS.ROOMS, []);
  storage.set(STORAGE_KEYS.ROOM_MESSAGES, {});

  const adminPublic = toPublicUser(adminRecord);
  const session = storage.get(STORAGE_KEYS.SESSION, null);
  if (session?.user) {
    const isAdminSession =
      session.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      session.user.id === adminRecord.id;
    if (isAdminSession) {
      storage.set(STORAGE_KEYS.SESSION, {
        ...session,
        user: adminPublic,
      });
    } else {
      storage.remove(STORAGE_KEYS.SESSION);
    }
  }

  syncAuthPersist(adminPublic);
}

const AUTH_PERSIST_KEY = "nexus_auth";

function syncAuthPersist(adminPublicUser) {
  try {
    const raw = localStorage.getItem(AUTH_PERSIST_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const state = parsed?.state;
    if (!state?.user) {
      localStorage.removeItem(AUTH_PERSIST_KEY);
      return;
    }
    const isAdmin =
      state.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      state.user.id === adminPublicUser.id;
    if (isAdmin) {
      parsed.state = { ...state, user: adminPublicUser, isAuthenticated: true };
      localStorage.setItem(AUTH_PERSIST_KEY, JSON.stringify(parsed));
    } else {
      localStorage.removeItem(AUTH_PERSIST_KEY);
    }
  } catch {
    localStorage.removeItem(AUTH_PERSIST_KEY);
  }
}

/** Run full reset once per version bump (safe on repeat visits). */
export async function runDataResetIfNeeded() {
  if (storage.get(DATA_RESET_VERSION_KEY) === CURRENT_RESET_VERSION) return;
  await resetApplicationDataExceptAdmin();
  storage.set(DATA_RESET_VERSION_KEY, CURRENT_RESET_VERSION);
}
