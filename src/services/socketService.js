/**
 * Real-time socket layer — Socket.IO when VITE_SOCKET_URL is set.
 * Presence, chat, and notifications use documented event names.
 */

import { SOCKET_URL, USE_SOCKET, IS_PROD } from "@/config/env";

const HEARTBEAT_MS = 25_000;

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.userId = null;
    this._handlers = {};
    this._heartbeatTimer = null;
    this._broadcast = null;
    this._unloadHandler = null;
    this._generation = 0;
    this._connecting = null;
  }

  _on(event, handler) {
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(handler);
  }

  _off(event, handler) {
    if (!this._handlers[event]) return;
    this._handlers[event] = this._handlers[event].filter((h) => h !== handler);
  }

  _emitLocal(event, payload) {
    this._handlers[event]?.forEach((h) => {
      try {
        h(payload);
      } catch (err) {
        if (!IS_PROD) {
          console.warn(`[socket] handler error for "${event}":`, err);
        }
      }
    });
  }

  _initBroadcast() {
    if (typeof BroadcastChannel === "undefined") return;
    if (this._broadcast) {
      try {
        this._broadcast.close();
      } catch {
        /* ignore */
      }
      this._broadcast = null;
    }
    this._broadcast = new BroadcastChannel("nexus-realtime");
    this._broadcast.onmessage = (e) => {
      const { event, payload } = e.data || {};
      if (event) this._emitLocal(event, payload);
    };
  }

  _closeBroadcast() {
    if (!this._broadcast) return;
    try {
      this._broadcast.close();
    } catch {
      /* ignore */
    }
    this._broadcast = null;
  }

  _broadcastEvent(event, payload) {
    this._broadcast?.postMessage({ event, payload });
    this._emitLocal(event, payload);
  }

  async connect(token, userId) {
    const generation = ++this._generation;
    await this.disconnect({ preserveGeneration: true });

    if (generation !== this._generation) return;

    this.userId = userId;
    this._initBroadcast();

    if (USE_SOCKET) {
      try {
        const { io } = await import("socket.io-client");
        if (generation !== this._generation) return;

        this.socket = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"],
          reconnectionAttempts: 8,
          reconnectionDelay: 2000,
        });

        this.socket.on("connect", () => {
          if (generation !== this._generation) return;
          this.connected = true;
          this.socket.emit("user:online", { userId });
          this._startHeartbeat();
          this._emitLocal("socket:connected", { userId });
        });

        this.socket.on("disconnect", () => {
          this.connected = false;
          this._stopHeartbeat();
          this._emitLocal("socket:disconnected", { userId });
        });

        this.socket.on("connect_error", (err) => {
          if (!IS_PROD) {
            console.warn("[socket] connect_error:", err?.message || err);
          }
        });

        const relay = (event) => (payload) => this._emitLocal(event, payload);
        this.socket.on("user:online", relay("user:online"));
        this.socket.on("user:offline", relay("user:offline"));
        this.socket.on("notification:new", relay("notification:new"));
        this.socket.on("message:new", relay("message:new"));
        this.socket.on("typing:update", relay("typing:update"));
      } catch {
        if (generation !== this._generation) return;
        this._connectLocalPresence(userId);
      }
    } else {
      this._connectLocalPresence(userId);
    }
  }

  /** Tab-synced presence when no socket server (static hosting) */
  _connectLocalPresence(userId) {
    this.connected = true;
    this._broadcastEvent("user:online", { userId });
    this._startHeartbeat();

    if (this._unloadHandler) {
      window.removeEventListener("beforeunload", this._unloadHandler);
      this._unloadHandler = null;
    }

    const onUnload = () => {
      this._broadcastEvent("user:offline", { userId });
    };
    window.addEventListener("beforeunload", onUnload);
    this._unloadHandler = onUnload;
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    const tick = () => {
      const payload = { userId: this.userId, at: Date.now() };
      if (this.socket?.connected) {
        this.socket.emit("user:heartbeat", payload);
      } else {
        this._broadcastEvent("user:heartbeat", payload);
      }
    };
    tick();
    this._heartbeatTimer = setInterval(tick, HEARTBEAT_MS);
  }

  _stopHeartbeat() {
    if (this._heartbeatTimer) clearInterval(this._heartbeatTimer);
    this._heartbeatTimer = null;
  }

  async disconnect({ preserveGeneration = false } = {}) {
    if (!preserveGeneration) this._generation += 1;

    if (this.userId) {
      if (this.socket?.connected) {
        this.socket.emit("user:offline", { userId: this.userId });
      } else if (this.connected) {
        this._broadcastEvent("user:offline", { userId: this.userId });
      }
    }
    this._stopHeartbeat();
    if (this._unloadHandler) {
      window.removeEventListener("beforeunload", this._unloadHandler);
      this._unloadHandler = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this._closeBroadcast();
    this.connected = false;
    this.userId = null;
  }

  /** Local-only subscriptions — socket events are relayed via `_emitLocal`. */
  on(event, handler) {
    this._on(event, handler);
  }

  off(event, handler) {
    this._off(event, handler);
  }

  emit(event, payload) {
    if (this.socket?.connected) {
      this.socket.emit(event, payload);
      return;
    }

    if (USE_SOCKET && IS_PROD) return;

    // Offline / mock realtime: mirror events locally + across tabs
    if (event === "typing:start") {
      setTimeout(() => this._broadcastEvent("typing:update", { ...payload, isTyping: true }), 80);
    } else if (event === "typing:stop") {
      this._broadcastEvent("typing:update", { ...payload, isTyping: false });
    } else if (event === "message:send") {
      this._broadcastEvent("message:new", payload);
    } else if (event === "notification:new") {
      this._broadcastEvent("notification:new", payload);
    }
  }

  sendMessage(payload) {
    this.emit("message:send", payload);
  }

  startTyping(chatId) {
    this.emit("typing:start", { chatId, userId: this.userId });
  }

  stopTyping(chatId) {
    this.emit("typing:stop", { chatId, userId: this.userId });
  }
}

export const socketService = new SocketService();
