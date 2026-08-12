import { memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useChatStore } from "@/store/useChatStore";
import { Avatar, GroupAvatar } from "@/components/ui/Avatar";
import { userService } from "@/services/userService";
import { getAvatarColor } from "@/utils/avatarColor";

const ChatListItem = memo(function ChatListItem({ chat, isActive, onSelect }) {
  const user = chat.type === "private" ? userService.getById(chat.userId) : null;
  const displayName = chat.type === "private" ? user?.name : chat.name;

  return (
    <button
      type="button"
      onClick={() => onSelect(chat.id)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-4)",
        background: isActive ? "var(--accent-muted)" : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
        transition: "all var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--bg-card)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      {chat.type === "private" && user ? (
        <Avatar user={user} size={44} showOnline />
      ) : (
        <GroupAvatar
          initials={chat.avatar}
          color={getAvatarColor(chat.id + 10)}
          size={44}
          radius={12}
        />
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: chat.unread > 0 ? 600 : 500,
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 140,
            }}
          >
            {displayName}
          </span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0 }}>
            {chat.time}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: chat.unread > 0 ? "var(--text-secondary)" : "var(--text-muted)",
              fontWeight: chat.unread > 0 ? 500 : 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 150,
            }}
          >
            {chat.lastMessage}
          </span>
          {chat.unread > 0 && (
            <span
              style={{
                minWidth: 18,
                height: 18,
                padding: "0 5px",
                borderRadius: 9,
                background: "var(--accent)",
                color: "var(--on-accent)",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {chat.unread > 9 ? "9+" : chat.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

export default function ChatList() {
  const chats = useChatStore((s) => s.chats);
  const { chatId } = useParams();
  const navigate = useNavigate();
  const unreadCount = chats.filter((c) => c.unread > 0).length;

  return (
    <div
      style={{
        width: "min(100%, var(--chat-list-width))",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-surface)",
        flexShrink: 0,
        overflowY: "auto",
        height: "100%",
      }}
    >
      <div style={{ padding: "var(--space-4) var(--space-4) var(--space-2)" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Messages
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
          {unreadCount} unread conversation{unreadCount !== 1 ? "s" : ""}
        </p>
      </div>

      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={String(chat.id) === chatId}
          onSelect={(id) => navigate(`/chats/${id}`)}
        />
      ))}
    </div>
  );
}
