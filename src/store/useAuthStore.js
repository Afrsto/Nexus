import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { applyPlatformAdmin } from "@/constants/permissions";

function syncSessionUser(updated) {
  const session = storage.get(STORAGE_KEYS.SESSION);
  if (session) {
    storage.set(STORAGE_KEYS.SESSION, {
      ...session,
      user: applyPlatformAdmin(updated),
    });
  }
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      hasHydrated: false,
      error: null,

      async login(credentials) {
        set({ isLoading: true, error: null });
        try {
          const session = await authService.login(credentials);
          set({
            user: applyPlatformAdmin(session.user),
            token: session.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      async register(payload) {
        set({ isLoading: true, error: null });
        try {
          const session = await authService.register(payload);
          set({
            user: applyPlatformAdmin(session.user),
            token: session.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          set({ isLoading: false, error: err.message });
          return { success: false, error: err.message };
        }
      },

      logout() {
        authService.logout();
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      /** Re-validate session expiry against authService storage. */
      validateSession() {
        const session = authService.getSession();
        if (!authService.isSessionValid(session)) {
          if (get().isAuthenticated || get().token) {
            get().logout();
          }
          return false;
        }
        // Prefer session as source of truth for token/user when present
        if (session?.token && session?.user) {
          set({
            user: applyPlatformAdmin(session.user),
            token: session.token,
            isAuthenticated: true,
          });
        }
        return true;
      },

      updateProfile(updates) {
        const current = get().user;
        if (!current) return;
        const updated = userService.update(current.id, updates);
        syncSessionUser(updated);
        set({ user: applyPlatformAdmin(updated) });
        return updated;
      },

      refreshUser() {
        const current = get().user;
        if (!current) return;
        const fresh = userService.getById(current.id);
        if (fresh) {
          const user = applyPlatformAdmin(fresh);
          syncSessionUser(user);
          set({ user });
        }
      },

      clearError() {
        set({ error: null });
      },

      setHasHydrated(value) {
        set({ hasHydrated: value, isLoading: !value ? get().isLoading : false });
      },
    }),
    {
      name: "nexus_auth",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        isAuthenticated: s.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          useAuthStore.setState({ hasHydrated: true, isLoading: false });
          return;
        }
        if (state) {
          const session = authService.getSession();
          if (!authService.isSessionValid(session)) {
            authService.logout();
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
          } else if (state.user?.id) {
            const fresh = userService.getById(state.user.id);
            if (fresh) state.user = applyPlatformAdmin(fresh);
            if (session?.token) state.token = session.token;
            state.isAuthenticated = true;
          }
        }
        useAuthStore.setState({ hasHydrated: true, isLoading: false });
      },
    }
  )
);
