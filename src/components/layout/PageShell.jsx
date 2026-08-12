/** Centered scrollable page wrapper with consistent max-width */
export default function PageShell({
  children,
  maxWidth = "var(--content-max)",
  padding = "0 var(--space-4)",
  scroll = true,
  className = "fade-in",
  style = {},
}) {
  return (
    <div
      className={className}
      style={{
        height: "100%",
        overflowY: scroll ? "auto" : "hidden",
        overflowX: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          maxWidth,
          margin: "0 auto",
          width: "100%",
          padding,
          ...(!scroll ? { height: "100%", display: "flex", flexDirection: "column" } : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}
