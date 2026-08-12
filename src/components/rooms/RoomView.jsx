import { useState } from "react";
import { useRoomStore } from "@/store/useRoomStore";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/userService";
import { Avatar } from "@/components/ui/Avatar";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import EmptyState from "@/components/common/EmptyState";
import { hasPermission, PERMISSIONS } from "@/constants/permissions";

export default function RoomView() {
  const activeRoom = useRoomStore((s) => s.activeRoom);
  const activeChannel = useRoomStore((s) => s.activeChannel);
  const getMessages = useRoomStore((s) => s.getMessages);
  const sendMessage = useRoomStore((s) => s.sendMessage);
  const currentUser = useAuthStore((s) => s.user);

  const [text, setText] = useState("");

  const messages = activeRoom && activeChannel ? getMessages(activeRoom.id, activeChannel.id) : [];

  const scrollRef = useScrollToBottom([messages.length]);
  const canSend = activeRoom ? hasPermission(activeRoom.myRole, PERMISSIONS.SEND_MESSAGES) : false;
  const isAnnouncement = activeChannel?.type === "announcement";
  const canPost = isAnnouncement
    ? hasPermission(activeRoom?.myRole, PERMISSIONS.POST_ANNOUNCEMENTS)
    : canSend;

  const handleSend = () => {
    if (!text.trim() || !activeRoom || !activeChannel || !canPost || !currentUser) return;
    sendMessage(activeRoom.id, activeChannel.id, text.trim(), currentUser.id);
    setText("");
  };

  if (!activeRoom) {
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
          icon={<RoomsIcon />}
          title="Select a room"
          description="Pick a room from the left to start chatting"
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
      {/* Channel header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "0 20px",
          height: 60,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "var(--text-muted)" }}>
            {activeChannel?.type === "announcement" ? <AnnouncementIcon /> : <HashIcon />}
          </span>
          <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>
            {activeChannel?.name}
          </span>
        </div>
        {activeChannel?.description && (
          <>
            <div style={{ width: 1, height: 20, background: "var(--border)" }} />
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {activeChannel.description}
            </span>
          </>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {messages.map((msg, i) => {
          const author = userService.getById(msg.userId) || {
            id: msg.userId,
            name: "User",
            avatar: "U",
            username: "user",
          };
          const prevMsg = messages[i - 1];
          const showHeader = !prevMsg || prevMsg.userId !== msg.userId;

          return (
            <div
              key={msg.id}
              style={{ display: "flex", gap: 12, padding: "2px 0", animation: "fadeIn 0.15s ease" }}
            >
              {showHeader ? <Avatar user={author} size={36} /> : <div style={{ width: 36 }} />}
              <div style={{ flex: 1 }}>
                {showHeader && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                      {author.name}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{msg.time}</span>
                  </div>
                )}
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    padding: showHeader ? 0 : "0 0 0 0",
                    background: msg.userId === 0 ? "transparent" : "transparent",
                  }}
                >
                  {msg.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-surface)",
          flexShrink: 0,
        }}
      >
        {canPost ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--bg-card)",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border)",
              padding: "8px 14px",
            }}
            onFocusCapture={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlurCapture={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message #${activeChannel?.name || "channel"}…`}
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
                color: text.trim() ? "#fff" : "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all var(--transition-fast)",
              }}
            >
              <SendIcon />
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-xl)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              fontSize: 13,
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            🔒 You don&apos;t have permission to post in this channel
          </div>
        )}
      </div>
    </div>
  );
}

function HashIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}
function AnnouncementIcon() {
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
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function RoomsIcon() {
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
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
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
