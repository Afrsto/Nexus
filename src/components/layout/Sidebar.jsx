import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useThemeStore } from "@/store/useThemeStore";
import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants/routes";

const NAV = [
  { to: ROUTES.HOME, icon: HomeIcon, label: "Home" },
  { to: ROUTES.EXPLORE, icon: ExploreIcon, label: "Explore" },
  { to: ROUTES.CHATS, icon: ChatIcon, label: "Chats", badge: "chats" },
  { to: ROUTES.ROOMS, icon: RoomsIcon, label: "Rooms" },
  { to: ROUTES.FRIENDS, icon: UsersIcon, label: "Friends" },
  { to: ROUTES.NOTIFICATIONS, icon: BellIcon, label: "Alerts", badge: "notifs" },
  { to: ROUTES.PROFILE, icon: ProfileIcon, label: "Profile" },
  { to: ROUTES.SETTINGS, icon: SettingsIcon, label: "Settings" },
];

export default function Sidebar({ onSearchOpen }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const totalChatUnread = useChatStore((s) => s.totalUnread());
  const notifUnread = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const { toggle, isDark } = useThemeStore();
  const navigate = useNavigate();

  const getBadge = (key) => {
    if (key === "chats") return totalChatUnread > 0 ? totalChatUnread : null;
    if (key === "notifs") return notifUnread > 0 ? notifUnread : null;
    return null;
  };

  return (
    <aside
      style={{
        width: 72,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        background: "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        gap: 4,
        flexShrink: 0,
        zIndex: 10,
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}
      className="hide-mobile"
    >
      {/* Logo */}
      <button
        type="button"
        onClick={() => navigate(ROUTES.HOME)}
        aria-label="Nexus home"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "linear-gradient(135deg, var(--accent), var(--pink))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          marginBottom: 12,
          flexShrink: 0,
          boxShadow: "var(--shadow-md)",
          transition: "transform var(--transition-fast)",
          border: "none",
          padding: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 16,
            color: "#fff",
            letterSpacing: -0.5,
          }}
        >
          N
        </span>
      </button>

      {/* Search */}
      <SidebarBtn onClick={onSearchOpen} title="Search (⌘K)">
        <SearchIcon />
      </SidebarBtn>

      <div style={{ width: 32, height: 1, background: "var(--border)", margin: "6px 0" }} />

      {/* Nav links */}
      {NAV.map(({ to, icon: Icon, label, badge }) => {
        const count = badge ? getBadge(badge) : null;
        return (
          <NavLink
            key={to}
            to={to}
            title={label}
            aria-label={label}
            style={{ position: "relative", textDecoration: "none" }}
          >
            {({ isActive }) => (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isActive ? "var(--accent-muted)" : "transparent",
                  color: isActive ? "var(--accent)" : "var(--text-muted)",
                  transition: "all var(--transition-fast)",
                  cursor: "pointer",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                  }
                }}
              >
                <Icon size={20} />
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      left: -8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 20,
                      borderRadius: 2,
                      background: "var(--accent)",
                    }}
                  />
                )}
                {count !== null && (
                  <span
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      background: "var(--pink)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 3px",
                    }}
                  >
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <SidebarBtn onClick={toggle} title={isDark() ? "Light mode" : "Dark mode"}>
        {isDark() ? <SunIcon /> : <MoonIcon />}
      </SidebarBtn>

      {/* Logout */}
      <SidebarBtn onClick={logout} title="Log out" danger>
        <LogoutIcon />
      </SidebarBtn>

      {/* Avatar */}
      {user && (
        <button
          type="button"
          style={{
            marginTop: 8,
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: 0,
          }}
          onClick={() => navigate(ROUTES.PROFILE)}
          aria-label="Your profile"
        >
          <Avatar user={user} size={36} showOnline />
        </button>
      )}
    </aside>
  );
}

function SidebarBtn({ onClick, title, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        color: "var(--text-muted)",
        border: "none",
        cursor: "pointer",
        transition: "all var(--transition-fast)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger ? "rgba(255,68,68,0.12)" : "var(--bg-card)";
        e.currentTarget.style.color = danger ? "var(--red)" : "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {children}
    </button>
  );
}

function HomeIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function ExploreIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function ChatIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function RoomsIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function UsersIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
function BellIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}
function ProfileIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function SettingsIcon({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}
function SearchIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
function SunIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}
function MoonIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}
function LogoutIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
