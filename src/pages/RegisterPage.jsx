import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { ROUTES } from "@/constants/routes";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [step, setStep] = useState(1); // 2-step form
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const goToStep2 = () => {
    const name = form.name.trim();
    const username = form.username.trim();
    if (!name || !username) {
      toast.error("Please fill all fields");
      return;
    }
    if (username.length < 3) {
      toast.error("Username must be 3+ characters");
      return;
    }
    setForm((f) => ({ ...f, name, username }));
    setStep(2);
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    goToStep2();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be 6+ characters");
      return;
    }
    const result = await register(form);
    if (result.success) {
      toast.success("Account created! Welcome to Nexus 🎉");
      navigate(ROUTES.HOME, { replace: true });
    } else toast.error(result.error || "Registration failed");
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
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "linear-gradient(135deg, var(--accent), var(--pink))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
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
              fontSize: 24,
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Join Nexus
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {step === 1 ? "Start with your identity" : "Secure your account"}
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[1, 2].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: s <= step ? "var(--accent)" : "var(--border)",
                transition: "background var(--transition-base)",
              }}
            />
          ))}
        </div>

        {step === 1 ? (
          <form
            onSubmit={handleStep1}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Field label="Full name">
              <input
                type="text"
                placeholder="Aurora Chen"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <Field label="Username">
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    fontSize: 14,
                  }}
                >
                  @
                </span>
                <input
                  type="text"
                  placeholder="aurora_dev"
                  value={form.username}
                  onChange={(e) =>
                    set("username", e.target.value.toLowerCase().replace(/\s/g, "_"))
                  }
                  style={{ ...inputStyle, paddingLeft: 28 }}
                />
              </div>
            </Field>
            <button
              type="button"
              onClick={goToStep2}
              style={{
                ...btnStyle,
                background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                marginTop: 4,
              }}
            >
              Continue →
            </button>
          </form>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <Field label="Email address">
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
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                style={inputStyle}
              />
            </Field>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  ...btnStyle,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  flex: "0 0 auto",
                  width: 48,
                }}
              >
                ←
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...btnStyle,
                  background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
                  flex: 1,
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Creating…" : "Create Account"}
              </button>
            </div>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          Already on Nexus?{" "}
          <Link to={ROUTES.LOGIN} style={{ color: "var(--accent)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: 12,
            fontSize: 11,
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          By joining you agree to our <span style={{ color: "var(--accent)" }}>Terms</span> &{" "}
          <span style={{ color: "var(--accent)" }}>Privacy Policy</span>
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
  fontFamily: "var(--font-body)",
};
