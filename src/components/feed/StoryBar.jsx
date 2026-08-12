import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import { Avatar } from "@/components/ui/Avatar";

export default function StoryBar() {
  const user = useAuthStore((s) => s.user);
  const getFollowing = useSocialStore((s) => s.getFollowing);

  const following = user ? getFollowing(user.id).slice(0, 8) : [];
  const stories = user
    ? [{ user, isOwn: true }, ...following.map((u) => ({ user: u, isOwn: false }))]
    : [];

  if (stories.length <= 1) return null;

  return (
    <div
      style={{
        padding: "16px 0",
        borderBottom: "1px solid var(--border)",
        overflowX: "auto",
        flexShrink: 0,
        marginBottom: 4,
      }}
    >
      <div style={{ display: "flex", gap: 16, width: "max-content", padding: "0 4px" }}>
        {stories.map(({ user: u, isOwn }) => (
          <StoryItem key={u.id} user={u} isOwn={isOwn} />
        ))}
      </div>
    </div>
  );
}

function StoryItem({ user, isOwn }) {
  return (
    <button
      type="button"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        flexShrink: 0,
        transition: "transform var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          padding: 2,
          background: isOwn
            ? "var(--border)"
            : "linear-gradient(135deg, var(--accent), var(--pink))",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Avatar user={user} size={56} showOnline={!isOwn} />
        </div>
      </div>
      <span
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          maxWidth: 64,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {isOwn ? "Your story" : user.name.split(" ")[0]}
      </span>
    </button>
  );
}
