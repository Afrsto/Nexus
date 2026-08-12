import PostCard from "@/components/feed/PostCard";
import EmptyState from "@/components/common/EmptyState";

export default function ProfilePosts({ posts }) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="No posts yet"
        description="When this user shares something, it will appear here."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
