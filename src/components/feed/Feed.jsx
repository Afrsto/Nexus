import { useEffect } from "react";
import { usePostStore } from "@/store/usePostStore";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { PostSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/common/EmptyState";

export default function Feed() {
  const posts = usePostStore((s) => s.posts);
  const loading = usePostStore((s) => s.loading);
  const error = usePostStore((s) => s.error);
  const loadFeed = usePostStore((s) => s.loadFeed);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  if (loading && posts.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <CreatePost />
        {[1, 2].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <CreatePost />
      {error && (
        <div
          role="alert"
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadFeed()}
            style={{
              background: "var(--accent)",
              color: "var(--on-accent)",
              border: "none",
              borderRadius: "var(--radius-full)",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      )}
      {posts.length === 0 && !error ? (
        <EmptyState
          icon="📝"
          title="Your feed is empty"
          description="Create your first post or follow people to see their updates here."
        />
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
