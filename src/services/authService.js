import { api } from "./api";
import { USE_API } from "@/config/env";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { userService, initUserRegistry } from "./userService";
import { followService } from "./followService";
import { runDataResetIfNeeded } from "./dataResetService";
import { applyPlatformAdmin } from "@/constants/permissions";

const SESSION_KEY = STORAGE_KEYS.SESSION;
const AUTH_PERSIST_KEY = "nexus_auth";
const SESSION_TTL = 1000 * 60 * 60 * 24 * 7;

function buildSession(user) {
  return {
    token: `nexus_${user.id}_${Date.now()}`,
    refreshToken: `refresh_${user.id}`,
    user: applyPlatformAdmin(user),
    expiresAt: Date.now() + SESSION_TTL,
  };
}

/** Clear both session stores (authService + zustand persist). */
export function clearAllAuthStorage() {
  storage.remove(SESSION_KEY);
  try {
    localStorage.removeItem(AUTH_PERSIST_KEY);
  } catch {
    /* ignore */
  }
}

export const authService = {
  async init() {
    await runDataResetIfNeeded();
    await initUserRegistry();
    followService.migrateAll();
  },

  async login({ email, password }) {
    if (USE_API) {
      const data = await api.post("/auth/login", { email, password });
      storage.set(SESSION_KEY, data);
      return data;
    }
    await delay(300);
    if (!email?.trim() || !password) throw new Error("Invalid credentials");
    const user = await userService.authenticate(email.trim(), password);
    if (!user) throw new Error("Invalid email or password");
    const session = buildSession(user);
    storage.set(SESSION_KEY, session);
    return session;
  },

  async register({ name, username, email, password }) {
    if (USE_API) {
      const data = await api.post("/auth/register", { name, username, email, password });
      storage.set(SESSION_KEY, data);
      return data;
    }
    await delay(300);
    if (userService.isEmailTaken(email)) throw new Error("Email is already registered");
    if (userService.isUsernameTaken(username)) throw new Error("Username is already taken");
    const user = await userService.create({ name, username, email, password });
    const session = buildSession(user);
    storage.set(SESSION_KEY, session);
    return session;
  },

  logout() {
    clearAllAuthStorage();
  },

  getSession() {
    return storage.get(SESSION_KEY, null);
  },

  isAuthenticated() {
    const session = this.getSession();
    if (!session?.token || !session?.user) return false;
    if (session.expiresAt && session.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }
    return true;
  },

  isSessionValid(session = this.getSession()) {
    if (!session?.token || !session?.user) return false;
    if (session.expiresAt && session.expiresAt <= Date.now()) return false;
    return true;
  },

  async refreshToken() {
    const session = this.getSession();
    if (!session?.user) throw new Error("No session");
    const fresh = userService.getById(session.user.id);
    if (!fresh) throw new Error("User not found");
    const next = buildSession(fresh);
    storage.set(SESSION_KEY, next);
    return next;
  },
};

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
