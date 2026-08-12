import { memo } from "react";
import { format } from "date-fns";

const STATUS_ICONS = {
  sent: "✓",
  delivered: "✓✓",
  read: "✓✓",
};

function MessageBubble({
  message,
  isOwn,
  showAvatar,
  avatar,
  showTimestamp = true,
  isGrouped = false,
}) {
  const status = message.status || (isOwn ? "sent" : null);
  const timeLabel = message.time?.includes(":")
    ? message.time
    : message.createdAt
      ? format(new Date(message.createdAt), "h:mm a")
      : message.time;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isOwn ? "row-reverse" : "row",
        alignItems: "flex-end",
        gap: 8,
        marginTop: isGrouped ? 2 : 0,
        animation: isGrouped ? "none" : "fadeIn 0.15s ease",
      }}
    >
      {!isOwn && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            flexShrink: 0,
            opacity: showAvatar ? 1 : 0,
            visibility: showAvatar ? "visible" : "hidden",
          }}
        >
          {showAvatar && avatar}
        </div>
      )}

      <div
        style={{
          maxWidth: "68%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
          gap: 2,
        }}
      >
        <div
          style={{
            padding: "9px 13px",
            borderRadius: isOwn
              ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)"
              : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
            background: isOwn
              ? "linear-gradient(135deg, var(--accent), var(--accent-dark))"
              : "var(--bg-card)",
            border: isOwn ? "none" : "1px solid var(--border)",
            color: isOwn ? "var(--on-accent)" : "var(--text-primary)",
            fontSize: 14,
            lineHeight: 1.5,
            wordBreak: "break-word",
            boxShadow: isOwn ? "0 2px 8px var(--accent-glow)" : "var(--shadow-sm)",
          }}
        >
          {message.type === "image" && message.imageUrl ? (
            <img
              src={message.imageUrl}
              alt="Shared"
              style={{ maxWidth: "100%", maxHeight: 280, borderRadius: 8, display: "block" }}
              loading="lazy"
            />
          ) : (
            message.text
          )}
        </div>
        {showTimestamp && (
          <span
            style={{
              fontSize: 10,
              color: "var(--text-muted)",
              paddingInline: 2,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {timeLabel}
            {isOwn && status && (
              <span
                style={{
                  color: status === "read" ? "var(--teal)" : "var(--text-muted)",
                  fontSize: 11,
                  letterSpacing: -1,
                }}
              >
                {STATUS_ICONS[status]}
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
