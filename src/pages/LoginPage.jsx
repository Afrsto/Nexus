import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes";
import { IS_PROD } from "@/config/env";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.HOME;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    const result = await login({ email: form.email, password: form.password });
    if (result.success) {
      toast.success("Welcome back! 👋");
      navigate(from, { replace: true });
    } else toast.error(result.error || "Login failed");
  };

  const demoLogin = async () => {
    const result = await login({ email: "demo@nexus.app", password: "demo1234" });
    if (result.success) {
      toast.success("Logged in as demo user!");
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="fade-in" style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          padding: "40px 36px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent), var(--pink))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(108,99,255,0.35)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 22,
                color: "#fff",
              }}
            >
              N
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: 6,
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sign in to your Nexus account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Email">
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              style={inputStyle}
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              style={inputStyle}
            />
          </Field>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 13,
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                color: "var(--text-secondary)",
              }}
            >
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => set("remember", e.target.checked)}
                style={{ accentColor: "var(--accent)", width: 14, height: 14 }}
              />
              Remember me
            </label>
            <span style={{ color: "var(--accent)", cursor: "pointer", fontSize: 13 }}>
              Forgot password?
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...btnStyle,
              background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: "var(--text-muted)",
              fontSize: 12,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            or
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          {!IS_PROD && (
            <button
              type="button"
              onClick={demoLogin}
              disabled={isLoading}
              style={{
                ...btnStyle,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
            >
              Try demo (dev only)
            </button>
          )}
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link to={ROUTES.REGISTER} style={{ color: "var(--accent)", fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
  transition: "border-color var(--transition-fast)",
};

const btnStyle = {
  width: "100%",
  padding: "12px",
  border: "none",
  borderRadius: "var(--radius-md)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  transition: "opacity var(--transition-fast)",
  fontFamily: "var(--font-body)",
};
