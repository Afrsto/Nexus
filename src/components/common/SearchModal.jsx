import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/services/userService";
import { postService } from "@/services/postService";
import { Avatar } from "@/components/ui/Avatar";
import { useDebounce } from "@/hooks/useDebounce";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 200);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement;
    setQuery("");
    const t = setTimeout(() => inputRef.current?.focus(), 50);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const nodes = Array.from(dialogRef.current.querySelectorAll(FOCUSABLE));
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const q = debouncedQuery.toLowerCase().trim();
  const allUsers = userService.getAll();
  const allPosts = postService.getFeed();
  const users = q ? userService.search(q) : allUsers.slice(0, 6);
  const posts = q
    ? allPosts.filter(
        (p) => p.content?.toLowerCase().includes(q) || p.tags?.some((t) => t.includes(q))
      )
    : allPosts.slice(0, 3);

  const goUser = (username) => {
    navigate(`/profile/${username}`);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
        padding: "12vh 16px 16px",
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        style={{
          width: "100%",
          maxWidth: 540,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "slideDown 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 20px",
            borderBottom: `1px solid ${q || users.length ? "var(--border)" : "transparent"}`,
          }}
        >
          <svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, posts, tags…"
            aria-label="Search people, posts, and tags"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 16,
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                padding: 4,
                borderRadius: 6,
              }}
            >
              <svg
                width={14}
                height={14}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <kbd
            style={{
              padding: "2px 8px",
              borderRadius: 6,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            ESC
          </kbd>
        </div>

        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          {users.length > 0 && (
            <section>
              <p
                style={{
                  padding: "10px 20px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                {q ? "People" : "Suggested"}
              </p>
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => goUser(user.username)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 20px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Avatar user={user} size={36} showOnline />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>@{user.username}</p>
                  </div>
                </button>
              ))}
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <p
                style={{
                  padding: "10px 20px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                Posts
              </p>
              {posts.map((post) => {
                const content = post.content || "";
                const preview = content
                  ? `${content.slice(0, 100)}${content.length > 100 ? "…" : ""}`
                  : post.imageUrl
                    ? "Photo post"
                    : "Post";
                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={onClose}
                    style={{
                      width: "100%",
                      padding: "10px 20px",
                      transition: "background var(--transition-fast)",
                      cursor: "pointer",
                      background: "transparent",
                      border: "none",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--bg-card)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {preview}
                    </p>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                      {post.tags?.map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 11,
                            color: "var(--accent)",
                            background: "var(--accent-muted)",
                            padding: "1px 7px",
                            borderRadius: 4,
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {q && users.length === 0 && posts.length === 0 && (
            <div
              style={{
                padding: "32px 20px",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 14,
              }}
            >
              No results for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { transform: translateY(-16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
