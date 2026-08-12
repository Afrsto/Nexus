import { NavLink } from "react-router-dom";
import { useChatStore } from "@/store/useChatStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { ROUTES } from "@/constants/routes";

const ITEMS = [
  { to: ROUTES.HOME, label: "Home", icon: HomeIcon },
  { to: ROUTES.EXPLORE, label: "Explore", icon: ExploreIcon },
  { to: ROUTES.CHATS, label: "Chats", icon: ChatIcon, badge: "chats" },
  { to: ROUTES.ROOMS, label: "Rooms", icon: RoomsIcon },
  { to: ROUTES.NOTIFICATIONS, label: "Alerts", icon: BellIcon, badge: "notifs" },
  { to: ROUTES.PROFILE, label: "Me", icon: ProfileIcon },
];

export default function MobileNavbar({ onSearchOpen: _onSearchOpen }) {
  const totalChatUnread = useChatStore((s) => s.totalUnread());
  const notifUnread = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const getBadge = (key) => {
    if (key === "chats") return totalChatUnread > 0 ? totalChatUnread : null;
    if (key === "notifs") return notifUnread > 0 ? notifUnread : null;
    return null;
  };

  return (
    <nav
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-surface)",
        padding: "8px 0 max(8px, env(safe-area-inset-bottom))",
        zIndex: 50,
      }}
      className="show-mobile"
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        {ITEMS.map(({ to, label, icon: Icon, badge }) => {
          const count = badge ? getBadge(badge) : null;
          return (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              style={{ textDecoration: "none", position: "relative" }}
            >
              {({ isActive }) => (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    padding: "4px 12px",
                    color: isActive ? "var(--accent)" : "var(--text-muted)",
                    transition: "color var(--transition-fast)",
                    position: "relative",
                  }}
                >
                  <Icon size={22} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                  {count !== null && (
                    <span
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 4,
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
      </div>
    </nav>
  );
}

function HomeIcon({ size = 22 }) {
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
function ExploreIcon({ size = 22 }) {
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
function ChatIcon({ size = 22 }) {
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
function RoomsIcon({ size = 22 }) {
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
function BellIcon({ size = 22 }) {
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
function ProfileIcon({ size = 22 }) {
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
