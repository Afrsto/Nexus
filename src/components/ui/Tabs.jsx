/** Shared tab bar — underline variant (profile) or pills via variant prop */
export default function Tabs({ tabs, active, onChange, variant = "underline", style = {} }) {
  const isPills = variant === "pills";

  return (
    <div
      style={{
        display: "flex",
        gap: isPills ? "var(--space-2)" : "var(--space-1)",
        borderBottom: isPills ? "none" : "1px solid var(--border)",
        padding: isPills ? "var(--space-2) 0" : "0 var(--space-6)",
        flexWrap: "wrap",
        ...style,
      }}
      role="tablist"
    >
      {tabs.map((tab) => {
        const label = typeof tab === "string" ? tab : tab.label;
        const id = typeof tab === "string" ? tab : tab.id;
        const isActive = active === id;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            style={{
              padding: isPills ? "8px 16px" : "12px 16px",
              background: isPills ? (isActive ? "var(--accent)" : "var(--bg-card)") : "none",
              border: isPills ? (isActive ? "none" : "1px solid var(--border)") : "none",
              borderRadius: isPills ? "var(--radius-full)" : 0,
              color: isActive
                ? isPills
                  ? "var(--on-accent)"
                  : "var(--accent)"
                : "var(--text-muted)",
              fontWeight: isActive ? 600 : 400,
              fontSize: 14,
              cursor: "pointer",
              borderBottom: !isPills
                ? isActive
                  ? "2px solid var(--accent)"
                  : "2px solid transparent"
                : undefined,
              marginBottom: !isPills ? -1 : 0,
              transition: "all var(--transition-fast)",
              fontFamily: "var(--font-body)",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
