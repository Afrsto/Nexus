export default function EmptyState({ icon = "✦", title, description, action }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "60px 32px",
        textAlign: "center",
        color: "var(--text-muted)",
      }}
    >
      <div
        style={{
          fontSize: 36,
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{ fontWeight: 600, color: "var(--text-secondary)", fontSize: 15, marginBottom: 4 }}
        >
          {title}
        </p>
        {description && (
          <p style={{ fontSize: 13, color: "var(--text-muted)", maxWidth: 280, margin: "0 auto" }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
