/**
 * API client — production requests via VITE_API_URL.
 * When no API URL is configured, callers use storage-backed services directly.
 */

import { API_URL } from "@/config/env";
import { STORAGE_KEYS } from "@/constants/storageKeys";

const AUTH_PERSIST_KEY = "nexus_auth";

function clearClientAuth() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(AUTH_PERSIST_KEY);
  } catch {
    /* ignore */
  }
}

function getToken() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || "{}");
    return session.token || null;
  } catch {
    return null;
  }
}

async function request(method, endpoint, body = null, options = {}) {
  if (!API_URL) {
    throw new Error("API URL is not configured");
  }

  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(`${API_URL.replace(/\/$/, "")}${endpoint}`, config);

  if (response.status === 401) {
    clearClientAuth();
    window.location.href = "/login";
    return;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    const err = new Error(error.message || `HTTP ${response.status}`);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  get: (endpoint, opts) => request("GET", endpoint, null, opts),
  post: (endpoint, body, opts) => request("POST", endpoint, body, opts),
  put: (endpoint, body, opts) => request("PUT", endpoint, body, opts),
  patch: (endpoint, body, opts) => request("PATCH", endpoint, body, opts),
  delete: (endpoint, opts) => request("DELETE", endpoint, null, opts),
};

export { API_URL as BASE_URL };
