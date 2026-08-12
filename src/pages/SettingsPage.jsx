import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import ProfileImageField from "@/components/profile/ProfileImageField";
import toast from "react-hot-toast";

const SECTIONS = ["Account", "Appearance", "Notifications", "Privacy", "Danger Zone"];

export default function SettingsPage() {
  const [section, setSection] = useState("Account");
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const logout = useAuthStore((s) => s.logout);
  const { mode, toggle } = useThemeStore();

  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    website: user?.website || "",
    email: user?.email || "",
    avatarUrl: user?.avatarUrl || "",
    coverUrl: user?.coverUrl || "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        email: user.email || "",
        avatarUrl: user.avatarUrl || "",
        coverUrl: user.coverUrl || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      updateProfile({
        name: form.name,
        username: form.username,
        bio: form.bio,
        location: form.location,
        website: form.website,
        avatarUrl: form.avatarUrl,
        coverUrl: form.coverUrl,
      });
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.message || "Could not update profile");
    }
  };

  return (
    <div style={{ height: "100%", overflow: "hidden", display: "flex" }}>
      {/* Settings sidebar */}
      <aside
        className="hide-mobile"
        style={{
          width: 220,
          borderRight: "1px solid var(--border)",
          padding: "24px 12px",
          flexShrink: 0,
          overflow: "auto",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            padding: "0 10px",
            marginBottom: 16,
          }}
        >
          Settings
        </h2>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              style={{
                padding: "9px 12px",
                borderRadius: "var(--radius-md)",
                background: section === s ? "rgba(108,99,255,0.15)" : "transparent",
                color: section === s ? "var(--accent)" : "var(--text-secondary)",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 14,
                fontWeight: section === s ? 600 : 400,
                fontFamily: "var(--font-body)",
                transition: "all var(--transition-fast)",
              }}
            >
              {s}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }} className="fade-in">
        <div style={{ maxWidth: 560 }}>
          {section === "Account" && (
            <SettingsSection
              title="Account Settings"
              description="Manage your personal information"
            >
              <ProfileImageField
                label="Profile photo"
                variant="avatar"
                value={form.avatarUrl}
                onChange={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
              />
              <ProfileImageField
                label="Cover image"
                variant="cover"
                value={form.coverUrl}
                onChange={(url) => setForm((f) => ({ ...f, coverUrl: url }))}
              />
              <Field label="Display name">
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  style={inputStyle}
                />
              </Field>
              <Field label="Username">
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--text-muted)",
                    }}
                  >
                    @
                  </span>
                  <input
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    style={{ ...inputStyle, paddingLeft: 26 }}
                  />
                </div>
              </Field>
              <Field label="Bio">
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  style={{ ...inputStyle, borderRadius: "var(--radius-md)", resize: "vertical" }}
                />
              </Field>
              <Field label="Location">
                <input
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  style={inputStyle}
                />
              </Field>
              <Field label="Website">
                <input
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="yoursite.com"
                  style={inputStyle}
                />
              </Field>
              <Field label="Email">
                <input value={form.email} disabled style={{ ...inputStyle, opacity: 0.6 }} />
              </Field>
              <SaveBtn onClick={handleSave} />
            </SettingsSection>
          )}

          {section === "Appearance" && (
            <SettingsSection title="Appearance" description="Customize how Nexus looks">
              <Row label="Dark mode" sub="Toggle between light and dark themes">
                <Toggle checked={mode === "dark"} onChange={toggle} />
              </Row>
              <Row label="Compact mode" sub="Reduce spacing for a denser layout">
                <Toggle checked={false} onChange={() => toast("Coming soon!")} />
              </Row>
              <Row label="Reduced motion" sub="Minimize animations">
                <Toggle checked={false} onChange={() => toast("Coming soon!")} />
              </Row>
            </SettingsSection>
          )}

          {section === "Notifications" && (
            <SettingsSection title="Notifications" description="Choose what you're notified about">
              {[
                { label: "New followers", sub: "When someone follows you" },
                { label: "Post likes", sub: "When someone likes your post" },
                { label: "Comments", sub: "When someone comments on your post" },
                { label: "Mentions", sub: "When someone mentions you" },
                { label: "Direct messages", sub: "New messages from people you follow" },
              ].map((n) => (
                <Row key={n.label} label={n.label} sub={n.sub}>
                  <Toggle checked={true} onChange={() => {}} />
                </Row>
              ))}
            </SettingsSection>
          )}

          {section === "Privacy" && (
            <SettingsSection title="Privacy" description="Control your privacy settings">
              {[
                { label: "Private account", sub: "Only followers can see your posts" },
                { label: "Show online status", sub: "Let others see when you're active" },
                { label: "Allow friend requests", sub: "Let anyone send you a request" },
              ].map((n) => (
                <Row key={n.label} label={n.label} sub={n.sub}>
                  <Toggle checked={n.label !== "Private account"} onChange={() => {}} />
                </Row>
              ))}
            </SettingsSection>
          )}

          {section === "Danger Zone" && (
            <SettingsSection title="Danger Zone" description="Irreversible actions">
              <div
                style={{
                  border: "1px solid rgba(255,68,68,0.3)",
                  borderRadius: "var(--radius-lg)",
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                    Log out
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                    Sign out of your account on this device
                  </p>
                  <button
                    onClick={() => {
                      logout();
                      toast.success("Logged out");
                    }}
                    style={{
                      padding: "8px 20px",
                      background: "transparent",
                      border: "1px solid var(--red)",
                      borderRadius: "var(--radius-md)",
                      color: "var(--red)",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Log Out
                  </button>
                </div>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <p style={{ fontWeight: 600, color: "var(--red)", marginBottom: 4 }}>
                    Delete account
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>
                    This action is permanent and cannot be undone
                  </p>
                  <button
                    onClick={() => toast.error("This would delete your account")}
                    style={{
                      padding: "8px 20px",
                      background: "var(--red)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      color: "#fff",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </SettingsSection>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, description, children }) {
  return (
    <div className="fade-in">
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 4,
        }}
      >
        {title}
      </h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>{description}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
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

function Row({ label, sub, children }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        background: checked ? "var(--accent)" : "var(--border)",
        cursor: "pointer",
        position: "relative",
        transition: "background var(--transition-base)",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#fff",
          transition: "left var(--transition-base)",
        }}
      />
    </button>
  );
}

function SaveBtn({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 24px",
        background: "var(--accent)",
        border: "none",
        borderRadius: "var(--radius-md)",
        color: "#fff",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        alignSelf: "flex-start",
      }}
    >
      Save Changes
    </button>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--text-primary)",
  fontSize: 14,
  outline: "none",
};
