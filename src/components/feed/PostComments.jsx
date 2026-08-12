import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostStore } from "@/store/usePostStore";
import { userService } from "@/services/userService";
import { Avatar } from "@/components/ui/Avatar";
import { formatPostTime } from "@/utils/userHelpers";
import { canModerateComment } from "@/constants/permissions";
import toast from "react-hot-toast";

export default function PostComments({ postId, postAuthorId }) {
  const currentUser = useAuthStore((s) => s.user);
  const getComments = usePostStore((s) => s.getComments);
  const addComment = usePostStore((s) => s.addComment);
  const deleteComment = usePostStore((s) => s.deleteComment);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = useCallback(() => {
    const raw = getComments(postId);
    setComments(
      raw.map((c) => ({
        ...c,
        time: formatPostTime(c.createdAt),
        author: userService.getById(c.userId),
      }))
    );
  }, [getComments, postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      await addComment(postId, currentUser.id, text, postAuthorId);
      setText("");
      refresh();
    } catch (err) {
      toast.error(err.message || "Could not post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (comment) => {
    if (!currentUser) return;
    try {
      await deleteComment(postId, comment.id, currentUser, postAuthorId);
      refresh();
    } catch (err) {
      toast.error(err.message || "Could not delete comment");
    }
  };

  return (
    <div style={{ paddingTop: "var(--space-3)" }}>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}
      >
        {currentUser && <Avatar user={currentUser} size={32} />}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment…"
          aria-label="Write a comment"
          style={{
            flex: 1,
            padding: "8px 14px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-full)",
            fontSize: 13,
          }}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          style={{
            padding: "8px 16px",
            borderRadius: "var(--radius-full)",
            background: text.trim() ? "var(--accent)" : "var(--bg-surface)",
            color: text.trim() ? "var(--on-accent)" : "var(--text-muted)",
            border: "none",
            cursor: text.trim() ? "pointer" : "default",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Post
        </button>
      </form>

      {comments.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-muted)",
            padding: "12px 0",
          }}
        >
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {comments.map((c) => (
            <div
              key={c.id}
              style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}
            >
              {c.author && <Avatar user={c.author} size={32} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    background: "var(--bg-surface)",
                    borderRadius: "var(--radius-md)",
                    padding: "8px 12px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                    {c.author?.name || "User"}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      marginTop: 2,
                      lineHeight: 1.5,
                    }}
                  >
                    {c.text}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 4,
                    paddingLeft: 4,
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.time}</span>
                  {currentUser && canModerateComment(c, currentUser, postAuthorId) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 11,
                        color: "var(--red)",
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
