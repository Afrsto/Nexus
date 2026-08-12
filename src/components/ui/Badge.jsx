/** Badge — small pill used for unread counts, role labels, tags */
export function Badge({ children, color = "var(--accent)", style = {} }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        borderRadius: "var(--radius-full)",
        background: color,
        color: "#fff",
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "var(--font-body)",
        lineHeight: 1,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
