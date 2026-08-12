import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePostStore } from "@/store/usePostStore";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import ImageUpload from "./ImageUpload";
import toast from "react-hot-toast";

export default function CreatePost() {
  const user = useAuthStore((s) => s.user);
  const createPost = usePostStore((s) => s.createPost);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) {
      toast.error("Add text or an image to post");
      return;
    }
    setSubmitting(true);
    try {
      await createPost(user.id, { content, imageUrl });
      setContent("");
      setImageUrl(null);
      toast.success("Post published!");
    } catch (err) {
      toast.error(err.message || "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        marginBottom: "var(--space-4)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        <Avatar user={user} size={40} showOnline />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={3}
          style={{
            flex: 1,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3)",
            resize: "vertical",
            minHeight: 72,
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--text-primary)",
          }}
        />
      </div>

      <ImageUpload
        disabled={submitting}
        onUploaded={({ imageUrl: url }) => setImageUrl(url)}
        onClear={() => setImageUrl(null)}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--space-3)" }}>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Posting…" : "Post"}
        </Button>
      </div>
    </form>
  );
}
