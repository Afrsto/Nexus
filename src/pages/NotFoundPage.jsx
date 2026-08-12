import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        flexDirection: "column",
        gap: 24,
        textAlign: "center",
        padding: "0 24px",
      }}
      className="fade-in"
    >
      {/* Glitch number */}
      <div style={{ position: "relative" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(80px, 15vw, 140px)",
            fontWeight: 800,
            letterSpacing: -4,
            background: "linear-gradient(135deg, var(--accent), var(--pink))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, var(--accent), var(--pink))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "var(--font-display)",
            fontSize: "clamp(80px, 15vw, 140px)",
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 1,
            opacity: 0.15,
            transform: "translate(3px, 3px)",
          }}
        >
          404
        </div>
      </div>

      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Lost in the void
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 15, maxWidth: 320 }}>
          This page doesn&apos;t exist or was moved to another dimension.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 24px",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          ← Go back
        </button>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "10px 24px",
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            border: "none",
            borderRadius: "var(--radius-md)",
            color: "#fff",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Back to Home
        </button>
      </div>

      {/* Decorative orbs */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "10%",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: "15%",
          right: "10%",
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,157,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
