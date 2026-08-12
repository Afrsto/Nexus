import { useRoomStore } from "@/store/useRoomStore";
import { GroupAvatar } from "@/components/ui/Avatar";
import { getAvatarColor, formatCount } from "@/utils/avatarColor";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function channelIcon(type) {
  if (type === "announcement") {
    return (
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
  }
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="16" y2="18" />
    </svg>
  );
}

export default function RoomSidebar() {
  const rooms = useRoomStore((s) => s.rooms);
  const activeRoom = useRoomStore((s) => s.activeRoom);
  const activeChannel = useRoomStore((s) => s.activeChannel);
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom);
  const setActiveChannel = useRoomStore((s) => s.setActiveChannel);
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: 260,
        borderRight: "1px solid var(--border)",
        display: "flex",
        background: "var(--bg-surface)",
        flexShrink: 0,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: 64,
          borderRight: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "12px 0",
          gap: 8,
        }}
      >
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => {
              setActiveRoom(room);
              navigate(`/rooms/${room.id}`);
            }}
            title={room.name}
            aria-label={room.name}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                borderRadius: activeRoom?.id === room.id ? 14 : "50%",
                overflow: "hidden",
                transition: "border-radius var(--transition-base)",
                boxShadow: activeRoom?.id === room.id ? `0 0 0 2px var(--accent)` : "none",
              }}
            >
              <GroupAvatar
                initials={room.icon}
                color={getAvatarColor(room.id)}
                size={44}
                radius={activeRoom?.id === room.id ? 14 : 22}
              />
            </div>
            {activeRoom?.id === room.id && (
              <span
                style={{
                  position: "absolute",
                  left: -8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 3,
                  height: 24,
                  borderRadius: 2,
                  background: "var(--accent)",
                }}
              />
            )}
          </button>
        ))}

        <button
          type="button"
          aria-label="Create a room (coming soon)"
          disabled
          title="Create a room (coming soon)"
          onClick={() => toast("Room creation is coming soon")}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--accent-muted)",
            border: "2px dashed var(--accent-border)",
            cursor: "not-allowed",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.7,
          }}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {activeRoom && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 12px 10px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <GroupAvatar
                initials={activeRoom.icon}
                color={getAvatarColor(activeRoom.id)}
                size={28}
                radius={8}
              />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  {activeRoom.name}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {formatCount(activeRoom.members)} members
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: "8px 8px", overflowY: "auto", flex: 1 }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: 0.6,
                padding: "4px 8px",
                marginBottom: 2,
              }}
            >
              Channels
            </p>
            {activeRoom.channels.map((ch) => {
              const isActive = activeChannel?.id === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setActiveChannel(ch);
                    navigate(`/rooms/${activeRoom.id}/channels/${ch.id}`);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 8px",
                    borderRadius: "var(--radius-sm)",
                    background: isActive ? "var(--accent-muted)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--bg-card)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }
                  }}
                >
                  <span style={{ color: isActive ? "var(--accent)" : "inherit" }}>
                    {channelIcon(ch.type)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{ch.name}</span>
                </button>
              );
            })}
          </div>

          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--teal)" }}
              />
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                You · {activeRoom.myRole}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
