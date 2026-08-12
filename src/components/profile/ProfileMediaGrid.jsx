import EmptyState from "@/components/common/EmptyState";

export default function ProfileMediaGrid({ posts }) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title="No media yet"
        description="Photos shared by this user will show up here."
      />
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "var(--space-1)",
      }}
    >
      {posts.map((p) => (
        <div
          key={p.id}
          style={{
            aspectRatio: "1",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
            cursor: "pointer",
            transition: "transform var(--transition-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <img
            src={p.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
