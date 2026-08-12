import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostStore } from "@/store/usePostStore";
import { postService } from "@/services/postService";
import { canDeletePost } from "@/constants/permissions";
import { userService } from "@/services/userService";
import toast from "react-hot-toast";
import { Avatar } from "@/components/ui/Avatar";
import { formatCount } from "@/utils/avatarColor";
import PostComments from "./PostComments";

export default function PostCard({ post }) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const likePost = usePostStore((s) => s.likePost);
  const savePost = usePostStore((s) => s.savePost);
  const updatePost = usePostStore((s) => s.updatePost);
  const deletePost = usePostStore((s) => s.deletePost);

  const author = userService.getById(post.userId);
  const [liked, setLiked] = useState(post.likedBy?.includes(currentUser?.id) ?? post.liked);
  const [saved, setSaved] = useState(post.savedBy?.includes(currentUser?.id) ?? post.saved);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || "");
  const [displayContent, setDisplayContent] = useState(post.content || "");
  const [saving, setSaving] = useState(false);
  const canEdit = currentUser && postService.canEdit(post, currentUser);
  const canDelete = currentUser && canDeletePost(post, currentUser);

  useEffect(() => {
    setDisplayContent(post.content || "");
    setEditContent(post.content || "");
    setLiked(post.likedBy?.includes(currentUser?.id) ?? post.liked ?? false);
    setSaved(post.savedBy?.includes(currentUser?.id) ?? post.saved ?? false);
    setLikeCount(post.likes ?? 0);
  }, [
    post.content,
    post.id,
    post.likedBy,
    post.savedBy,
    post.likes,
    post.liked,
    post.saved,
    currentUser?.id,
  ]);

  if (!author) return null;

  const handleLike = () => {
    if (!currentUser) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    likePost(post.id, currentUser.id, post.userId);
  };

  const handleSave = () => {
    if (!currentUser) return;
    setSaved((s) => !s);
    savePost(post.id, currentUser.id);
  };

  const handleDelete = async () => {
    if (!currentUser || !window.confirm("Delete this post?")) return;
    try {
      await deletePost(post.id, currentUser);
      toast.success("Post deleted");
    } catch (err) {
      toast.error(err.message || "Could not delete post");
    }
  };

  const handleEditSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const updated = await updatePost(post.id, currentUser, {
        content: editContent,
        imageUrl: post.imageUrl,
      });
      setDisplayContent(updated.content || "");
      setEditing(false);
      toast.success("Post updated");
    } catch (err) {
      toast.error(err.message || "Could not update post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        transition: "border-color var(--transition-base)",
        animation: "fadeIn 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
        <button
          type="button"
          onClick={() => navigate(`/profile/${author.username}`)}
          aria-label={`View ${author.name}'s profile`}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <Avatar user={author} size={40} showOnline />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => navigate(`/profile/${author.username}`)}
              style={{
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                color: "var(--text-primary)",
                background: "none",
                border: "none",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              {author.name}
            </button>
            {author.verified && (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="var(--accent)">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
          </div>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            @{author.username} · {post.time}
          </p>
        </div>
        {(canEdit || canDelete) && (
          <div style={{ display: "flex", gap: 8 }}>
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setEditContent(displayContent);
                  setEditing(true);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--red)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div style={{ padding: "0 16px 14px" }}>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button
              type="button"
              onClick={handleEditSave}
              disabled={saving}
              style={{
                padding: "6px 14px",
                background: "var(--accent)",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{
                padding: "6px 14px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : displayContent ? (
        <div style={{ padding: "0 16px 14px" }}>
          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.65,
              whiteSpace: "pre-wrap",
            }}
          >
            {displayContent}
          </p>
        </div>
      ) : null}

      {post.imageUrl && (
        <div style={{ padding: displayContent ? "0 0 14px" : "0 0 14px" }}>
          <img
            src={post.imageUrl}
            alt={displayContent ? `Photo by ${author.name}` : `Post by ${author.name}`}
            style={{ width: "100%", maxHeight: 480, objectFit: "cover", display: "block" }}
            loading="lazy"
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "8px 12px 12px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <ActionBtn
          onClick={handleLike}
          active={liked}
          activeColor="var(--pink)"
          count={formatCount(likeCount)}
          icon={<HeartIcon filled={liked} />}
          label="Like"
        />
        <ActionBtn
          onClick={() => setShowComments((s) => !s)}
          active={showComments}
          activeColor="var(--accent)"
          count={formatCount(post.comments ?? 0)}
          icon={<CommentIcon />}
          label="Comment"
        />
        <ActionBtn count={formatCount(post.shares ?? 0)} icon={<ShareIcon />} label="Share" />
        <div style={{ marginLeft: "auto" }}>
          <ActionBtn
            onClick={handleSave}
            active={saved}
            activeColor="var(--amber)"
            icon={<BookmarkIcon filled={saved} />}
            label="Save"
          />
        </div>
      </div>

      {showComments && (
        <div style={{ padding: "0 16px 16px", borderTop: "1px solid var(--border)" }}>
          <PostComments postId={post.id} postAuthorId={post.userId} />
        </div>
      )}
    </article>
  );
}

function ActionBtn({ onClick, active, activeColor, count, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: "var(--radius-full)",
        background: "transparent",
        border: "none",
        cursor: onClick ? "pointer" : "default",
        color: active ? activeColor : "var(--text-muted)",
        fontSize: 12,
        fontWeight: 500,
        transition: "all var(--transition-fast)",
        minHeight: 36,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-surface)";
        if (!active) e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        if (!active) e.currentTarget.style.color = "var(--text-muted)";
      }}
    >
      {icon}
      {count !== undefined && <span>{count}</span>}
    </button>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}
function CommentIcon() {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
    </svg>
  );
}
function BookmarkIcon({ filled }) {
  return (
    <svg
      width={17}
      height={17}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
    </svg>
  );
}
