import { create } from "zustand";
import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { ROLES } from "@/constants/permissions";

const ROOMS_KEY = STORAGE_KEYS.ROOMS || "nexus_rooms";
const ROOM_MSG_KEY = STORAGE_KEYS.ROOM_MESSAGES || "nexus_room_messages";

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_ROOMS = [
  {
    id: 1,
    name: "Nexus Community",
    description: "Official community hub",
    avatar: "NC",
    icon: "NC",
    members: 1,
    myRole: ROLES.ADMIN,
    channels: [{ id: 1, name: "general", type: "text", description: "General chat" }],
  },
];

function normalizeRoom(room) {
  if (!room) return room;
  const roleMap = {
    admin: ROLES.ADMIN,
    owner: ROLES.OWNER,
    moderator: ROLES.MODERATOR,
    member: ROLES.MEMBER,
  };
  const raw = room.myRole;
  const myRole =
    roleMap[String(raw || "").toLowerCase()] ||
    (Object.values(ROLES).includes(raw) ? raw : ROLES.MEMBER);
  return {
    ...room,
    icon: room.icon || room.avatar || "R",
    myRole,
  };
}

function loadRooms() {
  return storage.get(ROOMS_KEY, DEFAULT_ROOMS).map(normalizeRoom);
}

function loadMessages() {
  return storage.get(ROOM_MSG_KEY, {});
}

export const useRoomStore = create((set, get) => ({
  rooms: loadRooms(),
  messages: loadMessages(),
  activeRoom: null,
  activeChannel: null,

  setActiveRoom(room) {
    set({ activeRoom: room ? normalizeRoom(room) : null });
  },

  setActiveChannel(channel) {
    set({ activeChannel: channel });
  },

  sendMessage(roomId, channelId, text, userId) {
    const key = `${roomId}-${channelId}`;
    const msg = {
      id: newId(),
      userId: Number(userId),
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    set((s) => {
      const messages = { ...s.messages, [key]: [...(s.messages[key] || []), msg] };
      storage.set(ROOM_MSG_KEY, messages);
      return { messages };
    });
  },

  getMessages(roomId, channelId) {
    return get().messages[`${roomId}-${channelId}`] || [];
  },
}));
