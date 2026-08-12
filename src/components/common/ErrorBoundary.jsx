import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[Nexus ErrorBoundary]", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          flexDirection: "column",
          gap: 16,
          background: "var(--bg)",
          padding: 32,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "rgba(255,68,68,0.15)",
            border: "1px solid rgba(255,68,68,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
          }}
        >
          ⚠️
        </div>
        <h2
          style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--text-primary)" }}
        >
          Something went wrong
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, maxWidth: 360 }}>
          {this.state.error?.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 24px",
            borderRadius: "var(--radius-full)",
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Reload App
        </button>
      </div>
    );
  }
}
