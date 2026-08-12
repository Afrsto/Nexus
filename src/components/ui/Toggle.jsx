/** Toggle switch — used in Settings */
export function Toggle({ value, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      {label && (
        <span
          style={{ fontSize: 14, color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
        >
          {label}
        </span>
      )}
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: value ? "var(--accent)" : "var(--border)",
          border: "none",
          position: "relative",
          transition: "background var(--transition-base)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: value ? 22 : 2,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#fff",
            transition: "left var(--transition-base)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </label>
  );
}
