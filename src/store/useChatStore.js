import { create } from "zustand";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { userService } from "@/services/userService";
import { socketService } from "@/services/socketService";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function sameId(a, b) {
  return Number(a) === Number(b);
}

function dedupeChats(chats) {
  const byKey = new Map();
  for (const chat of chats) {
    const key = chat.type === "private" ? `private:${Number(chat.userId)}` : `group:${chat.id}`;
    const existing = byKey.get(key);
    if (!existing || Number(chat.id) > Number(existing.id)) {
      byKey.set(key, chat);
    }
  }
  return Array.from(byKey.values());
}

function loadChats() {
  const raw = storage.get(STORAGE_KEYS.CHATS, []);
  const chats = dedupeChats(raw);
  if (chats.length !== raw.length) storage.set(STORAGE_KEYS.CHATS, chats);
  return chats;
}

function saveChats(chats) {
  const normalized = dedupeChats(chats);
  storage.set(STORAGE_KEYS.CHATS, normalized);
  return normalized;
}

function loadHistory() {
  return storage.get(STORAGE_KEYS.CHAT_HISTORY, {});
}

function saveHistory(history) {
  storage.set(STORAGE_KEYS.CHAT_HISTORY, history);
}

export const useChatStore = create((set, get) => ({
  chats: loadChats(),
  history: loadHistory(),
  activeChat: null,
  typingMap: {},

  setActiveChat(chat) {
    if (!chat) {
      set((s) => (s.activeChat === null ? s : { activeChat: null }));
      return;
    }

    set((s) => {
      const existing = s.chats.find((c) => sameId(c.id, chat.id)) || chat;
      const unreadNeedsReset = (existing.unread || 0) > 0;
      const activeChanged = !sameId(s.activeChat?.id, existing.id);

      if (!unreadNeedsReset && !activeChanged) return s;

      const chats = unreadNeedsReset
        ? s.chats.map((c) => (sameId(c.id, existing.id) ? { ...c, unread: 0 } : c))
        : s.chats;

      if (unreadNeedsReset) saveChats(chats);

      return { activeChat: existing, chats };
    });
  },

  getOrCreatePrivateChat(currentUserId, otherUserId) {
    const other = userService.getById(otherUserId);
    if (!other) return null;

    const otherUserIdNum = Number(otherUserId);
    const { chats: stateChats } = get();
    let chat = stateChats.find((c) => c.type === "private" && Number(c.userId) === otherUserIdNum);

    if (!chat) {
      chat = loadChats().find((c) => c.type === "private" && Number(c.userId) === otherUserIdNum);
    }

    if (!chat) {
      chat = {
        id: Date.now(),
        userId: otherUserIdNum,
        type: "private",
        lastMessage: "",
        time: "",
        unread: 0,
      };
      const nextChats = saveChats([chat, ...get().chats]);
      set({ chats: nextChats });
    } else {
      const inState = get().chats.some((c) => sameId(c.id, chat.id));
      if (!inState) {
        const nextChats = saveChats([chat, ...get().chats]);
        set({ chats: nextChats });
      }
    }

    return chat;
  },

  findChatByUserId(userId) {
    const userIdNum = Number(userId);
    return get().chats.find((c) => c.type === "private" && Number(c.userId) === userIdNum);
  },

  _appendMessage(chatId, msg, { fromSelf = false } = {}) {
    const id = Number(chatId);
    const preview = msg.type === "image" ? "📷 Photo" : msg.text;
    set((s) => {
      const isActive = sameId(s.activeChat?.id, id);
      const bumpUnread = !fromSelf && !isActive;
      const history = { ...s.history, [id]: [...(s.history[id] || []), msg] };
      const chats = s.chats.map((c) =>
        sameId(c.id, id)
          ? {
              ...c,
              lastMessage: preview,
              time: "now",
              unread: bumpUnread ? (c.unread || 0) + 1 : isActive ? 0 : c.unread || 0,
            }
          : c
      );
      saveHistory(history);
      saveChats(chats);
      return { history, chats };
    });
  },

  sendMessage(chatId, text, senderId) {
    const id = Number(chatId);
    const msg = {
      id: newId(),
      chatId: id,
      type: "text",
      senderId,
      text,
      createdAt: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    get()._appendMessage(id, msg, { fromSelf: true });
    socketService.sendMessage({ chatId: id, ...msg });
    return msg;
  },

  sendImageMessage(chatId, imageUrl, senderId) {
    const id = Number(chatId);
    const msg = {
      id: newId(),
      chatId: id,
      type: "image",
      imageUrl,
      senderId,
      text: "",
      createdAt: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    get()._appendMessage(id, msg, { fromSelf: true });
    socketService.sendMessage({ chatId: id, ...msg });
    return msg;
  },

  receiveMessage(chatId, msg) {
    const id = Number(chatId ?? msg.chatId);
    const normalized = { ...msg, chatId: id };
    const history = get().history[id] || [];
    if (history.some((m) => m.id === normalized.id)) return;
    get()._appendMessage(id, normalized);
  },

  markMessagesRead(chatId, currentUserId) {
    const id = Number(chatId);
    const messages = get().history[id] || [];
    let changed = false;
    const nextMessages = messages.map((m) => {
      if (m.senderId !== currentUserId && m.status !== "read") {
        changed = true;
        return { ...m, status: "read" };
      }
      return m;
    });

    set((s) => {
      const history = changed ? { ...s.history, [id]: nextMessages } : s.history;
      if (changed) saveHistory(history);
      const nextChats = s.chats.map((c) =>
        sameId(c.id, id) && (c.unread || 0) > 0 ? { ...c, unread: 0 } : c
      );
      const unreadCleared = nextChats.some((c, i) => c !== s.chats[i]);
      if (unreadCleared) saveChats(nextChats);
      if (!changed && !unreadCleared) return s;
      return { history, chats: nextChats };
    });
  },

  setTyping(chatId, isTyping) {
    const id = Number(chatId);
    set((s) => {
      if (s.typingMap[id] === isTyping) return s;
      return { typingMap: { ...s.typingMap, [id]: isTyping } };
    });
  },

  totalUnread() {
    return get().chats.reduce((sum, c) => sum + (c.unread || 0), 0);
  },
}));
