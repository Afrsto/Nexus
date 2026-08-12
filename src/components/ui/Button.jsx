/**
 * Button — base interactive element with variant and size support.
 * Variants: "primary" | "secondary" | "ghost" | "danger"
 */
export function Button({
  children,
  onClick,
  variant = "secondary",
  size = "md",
  disabled = false,
  fullWidth = false,
  style = {},
  ...rest
}) {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "none",
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-body)",
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.55 : 1,
    transition: "all var(--transition-fast)",
    width: fullWidth ? "100%" : undefined,
    whiteSpace: "nowrap",
  };

  const sizes = {
    sm: { fontSize: 12, padding: "6px 14px" },
    md: { fontSize: 13, padding: "9px 20px" },
    lg: { fontSize: 15, padding: "12px 28px" },
  };

  const variants = {
    primary: { background: "var(--accent)", color: "var(--on-accent)" },
    secondary: {
      background: "var(--bg-card)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border)",
    },
    ghost: { background: "transparent", color: "var(--text-muted)" },
    danger: { background: "transparent", color: "var(--red)", border: "1px solid var(--red)" },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
