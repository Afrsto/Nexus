import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { getInitials, toPublicUser } from "@/utils/userHelpers";
import { followService } from "./followService";
import { hashPassword, verifyPassword, isHashedPassword } from "@/utils/password";

const ADMIN_EMAIL = "admin@nexus.app";

function loadUsers() {
  return storage.get(STORAGE_KEYS.USERS, []);
}

function saveUsers(users) {
  storage.set(STORAGE_KEYS.USERS, users);
}

/** Seed admin account only — password from env or default demo value (hashed at rest). */
export async function initUserRegistry() {
  const users = loadUsers();
  const existingAdmin = users.find((u) => u.email === ADMIN_EMAIL);

  // Migrate any plaintext passwords to hashed form
  let migrated = false;
  for (const u of users) {
    if (u.password && !isHashedPassword(u.password)) {
      u.password = await hashPassword(u.password);
      migrated = true;
    }
  }
  if (migrated) saveUsers(users);

  if (existingAdmin) {
    if (existingAdmin.online !== false) {
      existingAdmin.online = false;
      saveUsers(users);
    }
    return;
  }

  const demoPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || "admin1234";

  const admin = {
    id: 1,
    username: "admin",
    name: "Admin",
    email: ADMIN_EMAIL,
    password: await hashPassword(demoPassword),
    avatar: "AD",
    bio: "Nexus administrator",
    location: "",
    website: "",
    followers: 0,
    following: 0,
    posts: 0,
    online: false,
    verified: true,
    role: "admin",
    joinedAt: new Date("2022-01-01").toISOString(),
    avatarUrl: null,
    coverUrl: null,
  };
  saveUsers([admin]);
  followService.ensureUserRecord(admin.id);
}

export const userService = {
  getAll() {
    return loadUsers().map(toPublicUser);
  },

  getById(id) {
    const user = loadUsers().find((u) => u.id === Number(id));
    return toPublicUser(user);
  },

  setOnlineStatus(id, online) {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === Number(id));
    if (idx === -1) return;
    users[idx].online = Boolean(online);
    saveUsers(users);
  },

  getByUsername(username) {
    const user = loadUsers().find((u) => u.username.toLowerCase() === username?.toLowerCase());
    return toPublicUser(user);
  },

  getByEmail(email) {
    return loadUsers().find((u) => u.email.toLowerCase() === email?.toLowerCase());
  },

  isUsernameTaken(username, excludeId = null) {
    return loadUsers().some(
      (u) => u.username.toLowerCase() === username?.toLowerCase() && u.id !== excludeId
    );
  },

  isEmailTaken(email, excludeId = null) {
    return loadUsers().some(
      (u) => u.email.toLowerCase() === email?.toLowerCase() && u.id !== excludeId
    );
  },

  async create({ name, username, email, password }) {
    const users = loadUsers();
    const id = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
    const user = {
      id,
      username: username.toLowerCase().replace(/\s/g, "_"),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: await hashPassword(password),
      avatar: getInitials(name),
      bio: "",
      location: "",
      website: "",
      followers: 0,
      following: 0,
      posts: 0,
      online: false,
      verified: false,
      joinedAt: new Date().toISOString(),
      avatarUrl: null,
      coverUrl: null,
    };
    users.push(user);
    saveUsers(users);
    followService.ensureUserRecord(id);
    return toPublicUser(user);
  },

  async authenticate(email, password) {
    const user = this.getByEmail(email);
    if (!user) return null;
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx === -1) return null;
    const full = users[idx];
    const ok = await verifyPassword(password, full.password);
    if (!ok) return null;

    // Upgrade legacy plaintext on successful login
    if (!isHashedPassword(full.password)) {
      users[idx] = { ...full, password: await hashPassword(password) };
      saveUsers(users);
    }

    return toPublicUser(full);
  },

  update(id, updates) {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    const { password: _p, id: _id, email: newEmail, username: newUsername, ...safe } = updates;

    if (newUsername && userService.isUsernameTaken(newUsername, id)) {
      throw new Error("Username is already taken");
    }
    if (newEmail && userService.isEmailTaken(newEmail, id)) {
      throw new Error("Email is already in use");
    }

    users[idx] = {
      ...users[idx],
      ...safe,
      ...(newUsername ? { username: newUsername.toLowerCase().replace(/\s/g, "_") } : {}),
      ...(newEmail ? { email: newEmail.toLowerCase() } : {}),
    };
    saveUsers(users);
    return toPublicUser(users[idx]);
  },

  updateCounts(id, { followers, following, posts }) {
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return;
    if (followers != null) users[idx].followers = followers;
    if (following != null) users[idx].following = following;
    if (posts != null) users[idx].posts = posts;
    saveUsers(users);
  },

  search(query) {
    const q = query?.toLowerCase().trim();
    if (!q) return [];
    return loadUsers()
      .filter((u) => u.username.toLowerCase().includes(q) || u.name.toLowerCase().includes(q))
      .map(toPublicUser)
      .slice(0, 20);
  },
};
