import { useState } from "react";
import { postService } from "@/services/postService";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import PostCard from "@/components/feed/PostCard";
import UserRow from "@/components/common/UserRow";
import EmptyState from "@/components/common/EmptyState";

const TABS = ["Posts", "People"];

export default function ExplorePage() {
  const [tab, setTab] = useState("Posts");
  const currentUser = useAuthStore((s) => s.user);
  const getSuggested = useSocialStore((s) => s.getSuggested);
  const posts = postService.getFeed();
  const people = currentUser ? getSuggested(currentUser.id, 15) : userService.getAll().slice(0, 15);

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }} className="fade-in">
        <div style={{ marginBottom: 24 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            Explore
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Discover posts and people on Nexus
          </p>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-full)",
                background: tab === t ? "var(--accent)" : "var(--bg-card)",
                color: tab === t ? "var(--on-accent)" : "var(--text-muted)",
                border: `1px solid ${tab === t ? "var(--accent)" : "var(--border)"}`,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--font-body)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Posts" &&
          (posts.length === 0 ? (
            <EmptyState
              title="No posts yet"
              description="Be the first to share something on Nexus."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          ))}

        {tab === "People" &&
          (people.length === 0 ? (
            <EmptyState
              title="No users to discover"
              description="Register another account to see people here."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {people.map((u) => (
                <UserRow key={u.id} user={u} asLink={false} showFollowButton />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
