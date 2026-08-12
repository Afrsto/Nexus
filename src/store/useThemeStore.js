import { create } from "zustand";
import { persist } from "zustand/middleware";
import { THEME, CSS_VAR_MAP } from "@/constants/theme";

/**
 * Applies CSS custom properties to :root so all components can use
 * var(--bg), var(--text-primary), etc. without importing the store.
 */
function applyCssVars(mode) {
  const vars = THEME[mode];
  const root = document.documentElement;
  Object.entries(CSS_VAR_MAP).forEach(([key, cssVar]) => {
    if (vars[key]) root.style.setProperty(cssVar, vars[key]);
  });
  root.setAttribute("data-theme", mode);
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      mode: "dark", // "dark" | "light"

      isDark: () => get().mode === "dark",

      toggle() {
        const next = get().mode === "dark" ? "light" : "dark";
        applyCssVars(next);
        set({ mode: next });
      },

      setMode(mode) {
        applyCssVars(mode);
        set({ mode });
      },

      /** Called once on app mount to sync CSS vars with persisted preference */
      hydrate() {
        applyCssVars(get().mode);
      },
    }),
    { name: "nexus_theme" }
  )
);
