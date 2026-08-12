import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import Feed from "@/components/feed/Feed";
import StoryBar from "@/components/feed/StoryBar";
import FollowButton from "@/components/common/FollowButton";
import { Avatar } from "@/components/ui/Avatar";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const getSuggested = useSocialStore((s) => s.getSuggested);
  const followVersion = useSocialStore((s) => s.version);
  const suggested = user ? getSuggested(user.id, 5) : [];
  void followVersion;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "var(--feed-max)", padding: "0 var(--space-4)" }}>
          <StoryBar />
          <div style={{ marginTop: 20 }}>
            <Feed />
          </div>
        </div>
      </div>

      <aside
        className="hide-mobile"
        style={{
          width: 280,
          flexShrink: 0,
          borderLeft: "1px solid var(--border)",
          padding: "20px",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <h3
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Suggested for you
          </h3>
          {suggested.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Register more accounts or explore to find people to follow.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {suggested.map((u) => (
                <SuggestedUser key={u.id} user={u} />
              ))}
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6, marginTop: "auto" }}>
          © 2025 Nexus Platform
        </p>
      </aside>
    </div>
  );
}

function SuggestedUser({ user }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Avatar user={user} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.name}
        </p>
        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>@{user.username}</p>
      </div>
      <FollowButton user={user} />
    </div>
  );
}
