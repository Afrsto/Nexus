/** Centralized environment configuration for API + realtime */
export const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_WS_URL || "";

export const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY || "";

export const USE_API = Boolean(API_URL);
export const USE_SOCKET = Boolean(SOCKET_URL);
export const IS_PROD = import.meta.env.PROD;
