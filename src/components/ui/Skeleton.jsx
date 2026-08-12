/** Loading skeleton placeholders */
export function Skeleton({ width = "100%", height = 16, radius = "var(--radius-md)", style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, flexShrink: 0, ...style }}
      aria-hidden="true"
    />
  );
}

export function PostSkeleton() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: 20,
        marginBottom: 16,
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Skeleton width={42} height={42} radius="50%" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton width="40%" height={14} />
          <Skeleton width="25%" height={12} />
        </div>
      </div>
      <Skeleton width="100%" height={200} radius="var(--radius-lg)" style={{ marginBottom: 12 }} />
      <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={14} />
    </div>
  );
}
