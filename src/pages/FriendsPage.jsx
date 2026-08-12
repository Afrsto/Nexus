import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import UserRow from "@/components/common/UserRow";
import EmptyState from "@/components/common/EmptyState";

const TABS = ["Following", "Followers", "Discover"];

export default function FriendsPage() {
  const [tab, setTab] = useState("Following");
  const [search, setSearch] = useState("");
  const currentUser = useAuthStore((s) => s.user);
  const getFollowing = useSocialStore((s) => s.getFollowing);
  const getFollowers = useSocialStore((s) => s.getFollowers);
  const getSuggested = useSocialStore((s) => s.getSuggested);

  if (!currentUser) return null;

  let users = [];
  if (tab === "Following") users = getFollowing(currentUser.id);
  else if (tab === "Followers") users = getFollowers(currentUser.id);
  else users = getSuggested(currentUser.id, 20);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }} className="fade-in">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 800,
            marginBottom: 20,
          }}
        >
          Connections
        </h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people…"
          style={{
            width: "100%",
            padding: "10px 16px",
            marginBottom: 20,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-full)",
            fontSize: 14,
          }}
        />

        <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              style={{
                padding: "8px 18px",
                borderRadius: "var(--radius-full)",
                background: tab === t ? "var(--accent)" : "var(--bg-card)",
                color: tab === t ? "var(--on-accent)" : "var(--text-muted)",
                border: `1px solid ${tab === t ? "var(--accent)" : "var(--border)"}`,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "var(--font-body)",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={tab === "Discover" ? "No suggestions" : `No ${tab.toLowerCase()} yet`}
            description="Follow people from the feed or explore page to build your network."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map((u) => (
              <UserRow key={u.id} user={u} asLink={false} showFollowers showFollowButton />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
