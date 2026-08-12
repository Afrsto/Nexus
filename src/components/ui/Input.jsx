/**
 * Input — styled text input with optional label and error message.
 */
export function Input({ label, error, style = {}, ...props }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-secondary)",
            fontFamily: "var(--font-body)",
          }}
        >
          {label}
        </label>
      )}
      <input
        style={{
          width: "100%",
          padding: "11px 16px",
          background: "var(--bg-card)",
          border: `1px solid ${error ? "var(--red)" : "var(--border)"}`,
          borderRadius: "var(--radius-full)",
          fontSize: 14,
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          outline: "none",
          transition: "border-color var(--transition-fast)",
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 12, color: "var(--red)", fontFamily: "var(--font-body)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
