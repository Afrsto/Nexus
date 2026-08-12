/**
 * Design tokens — single source of truth for colors, spacing, typography.
 * Referenced by ThemeContext and CSS variable injection.
 */

export const COLORS = {
  accent: "#6C63FF",
  accentLight: "#8B85FF",
  accentDark: "#4A43CC",
  pink: "#FF6B9D",
  teal: "#00D4AA",
  amber: "#FFB547",
  red: "#FF4444",
  orange: "#FF8C42",
  cyan: "#4ECDC4",
};

export const AVATAR_COLORS = ["#6C63FF", "#FF6B9D", "#00D4AA", "#FFB547", "#FF8C42", "#4ECDC4"];

export const THEME = {
  dark: {
    bg: "#0A0A0F",
    bgSurface: "#111118",
    bgCard: "#1A1A25",
    border: "#2A2A38",
    textPrimary: "#F0F0FF",
    textSecondary: "#B0B0C8",
    textMuted: "#8B8BA8",
  },
  light: {
    bg: "#F8F8FC",
    bgSurface: "#FFFFFF",
    bgCard: "#F0F0F8",
    border: "#E0E0F0",
    textPrimary: "#0A0A1A",
    textSecondary: "#3A3A5A",
    textMuted: "#5A5A78",
  },
};

/** Layout and semantic tokens (static — set in globals.css) */
export const LAYOUT = {
  contentMax: "680px",
  feedMax: "600px",
  chatListWidth: "320px",
};

/** CSS variable names mapped to theme keys */
export const CSS_VAR_MAP = {
  bg: "--bg",
  bgSurface: "--bg-surface",
  bgCard: "--bg-card",
  border: "--border",
  textPrimary: "--text-primary",
  textSecondary: "--text-secondary",
  textMuted: "--text-muted",
};
