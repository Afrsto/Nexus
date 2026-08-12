import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatStore } from "@/store/useChatStore";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/userService";
import { Avatar, GroupAvatar } from "@/components/ui/Avatar";
import { getAvatarColor } from "@/utils/avatarColor";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "@/components/common/EmptyState";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { usePresenceStore } from "@/store/usePresenceStore";
import { uploadImage, validateImageFile } from "@/services/imageUploadService";
import { socketService } from "@/services/socketService";
import toast from "react-hot-toast";

function shouldGroup(prev, curr) {
  if (!prev || !curr) return false;
  return prev.senderId === curr.senderId;
}

export default function ChatView({ chatId: chatIdProp }) {
  const navigate = useNavigate();
  const { chatId: chatIdParam } = useParams();
  const chatId = chatIdProp ?? chatIdParam;
  const currentUser = useAuthStore((s) => s.user);
  const numericId = Number(chatId);
  const chatIdValid = Number.isFinite(numericId);
  const chat = useChatStore((s) =>
    chatIdValid ? s.chats.find((c) => Number(c.id) === numericId) : undefined
  );
  const messages = useChatStore((s) => (chatIdValid ? (s.history[numericId] ?? []) : []));
  const typingMap = useChatStore((s) => s.typingMap);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const sendImageMessage = useChatStore((s) => s.sendImageMessage);
  const markMessagesRead = useChatStore((s) => s.markMessagesRead);

  const [text, setText] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const typingTimer = useRef(null);
  const activeChatRef = useRef(numericId);
  activeChatRef.current = numericId;
  const scrollRef = useScrollToBottom([messages.length, typingMap[numericId]]);

  const user = chat?.type === "private" ? userService.getById(chat.userId) : null;
  const peerOnline = usePresenceStore((s) => (user ? s.isOnline(user.id) : false));
  const isTypingRemote = Boolean(typingMap[numericId]);

  useEffect(() => {
    if (!chat || !currentUser || !chatIdValid) return;
    markMessagesRead(numericId, currentUser.id);
  }, [numericId, currentUser, chat, markMessagesRead, chatIdValid]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimer.current);
      if (Number.isFinite(numericId)) socketService.stopTyping(numericId);
    };
  }, [numericId]);

  const handleSend = () => {
    if (!text.trim() || !chatIdValid) return;
    if (!currentUser) return;
    sendMessage(numericId, text.trim(), currentUser.id);
    setText("");
    clearTimeout(typingTimer.current);
    socketService.stopTyping(numericId);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    if (!chatIdValid) return;
    if (value.trim()) {
      socketService.startTyping(numericId);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socketService.stopTyping(numericId);
      }, 1500);
    } else {
      clearTimeout(typingTimer.current);
      socketService.stopTyping(numericId);
    }
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !currentUser || !chatIdValid) return;
    const v = validateImageFile(file);
    if (!v.valid) {
      toast.error(v.error);
      return;
    }
    const targetChatId = numericId;
    setUploadingImage(true);
    try {
      const { url } = await uploadImage(file, () => {});
      if (activeChatRef.current !== targetChatId) return;
      sendImageMessage(targetChatId, url, currentUser.id);
    } catch (err) {
      toast.error(err.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  if (!chat) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <EmptyState
          icon={<ChatIcon />}
          title="Conversation not found"
          description="Pick a chat from the list to start messaging"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 var(--space-5)",
          height: 60,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          className="show-mobile"
          onClick={() => navigate("/chats")}
          aria-label="Back to conversations"
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <BackIcon />
        </button>
        {chat.type === "private" && user ? (
          <>
            <Avatar user={user} size={38} showOnline />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                {user.name}
              </p>
              <p style={{ fontSize: 11, color: peerOnline ? "var(--teal)" : "var(--text-muted)" }}>
                {isTypingRemote ? "typing…" : peerOnline ? "Online" : "Offline"}
              </p>
            </div>
          </>
        ) : (
          <>
            <GroupAvatar
              initials={chat.avatar}
              color={getAvatarColor(chat.id + 10)}
              size={38}
              radius={10}
            />
            <div>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                {chat.name}
              </p>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{chat.members} members</p>
            </div>
          </>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {[PhoneIcon, VideoIcon, InfoIcon].map((Icon, i) => (
            <button
              key={i}
              type="button"
              aria-label={["Call", "Video", "Info"][i]}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-card)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-4) var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {messages.map((msg, i) => {
          const isOwn = msg.senderId === currentUser?.id;
          const senderUser = userService.getById(msg.senderId);
          const prevMsg = messages[i - 1];
          const grouped = shouldGroup(prevMsg, msg);
          const showAvatar = !isOwn && !grouped;

          return (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={isOwn}
              showAvatar={showAvatar}
              isGrouped={grouped}
              showTimestamp={!grouped || i === messages.length - 1}
              avatar={senderUser ? <Avatar user={senderUser} size={28} /> : null}
            />
          );
        })}

        {isTypingRemote && <TypingIndicator userName={user?.name?.split(" ")[0]} />}
      </div>

      <div
        style={{
          padding: "var(--space-3) var(--space-4)",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--bg-card)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--border)",
            padding: "8px 14px",
            transition: "border-color var(--transition-fast)",
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImagePick}
            disabled={uploadingImage}
          />
          <button
            type="button"
            aria-label="Attach image"
            disabled={uploadingImage}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: "none",
              border: "none",
              cursor: uploadingImage ? "wait" : "pointer",
              color: "var(--text-muted)",
              padding: 4,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            <ImageIcon />
          </button>
          <button
            type="button"
            aria-label="Add emoji"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-muted)",
              padding: 4,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
            }}
          >
            <EmojiIcon />
          </button>
          <input
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Send a message…"
            aria-label="Message"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim()}
            aria-label="Send message"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: text.trim() ? "var(--accent)" : "var(--bg-surface)",
              border: "none",
              cursor: text.trim() ? "pointer" : "default",
              color: text.trim() ? "var(--on-accent)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all var(--transition-fast)",
              flexShrink: 0,
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg
      width={36}
      height={36}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 10a19.79 19.79 0 01-3.07-8.67A2 2 0 013 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
    </svg>
  );
}
function VideoIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
function EmojiIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}
