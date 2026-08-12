import { create } from "zustand";
import { postService } from "@/services/postService";
import { commentService } from "@/services/commentService";
import { notificationService } from "@/services/notificationService";
import { formatPostTime } from "@/utils/userHelpers";

export const usePostStore = create((set) => ({
  posts: [],
  loading: false,
  error: null,

  async loadFeed() {
    set({ loading: true, error: null });
    try {
      const posts = postService.getFeed();
      set({ posts, loading: false });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  async createPost(userId, payload) {
    const post = postService.create(userId, payload);
    set((s) => ({ posts: [post, ...s.posts] }));
    return post;
  },

  async likePost(postId, userId, authorId) {
    const updated = postService.likePost(postId, userId);
    if (!updated) return;
    set((s) => ({
      posts: s.posts.map((p) => (p.id === postId ? { ...p, ...updated } : p)),
    }));
    if (updated.liked && authorId !== userId) {
      notificationService.add({
        userId,
        targetUserId: authorId,
        type: "like",
        message: "liked your post",
        postId,
      });
    }
  },

  async savePost(postId, userId) {
    const updated = postService.savePost(postId, userId);
    if (!updated) return;
    set((s) => ({
      posts: s.posts.map((p) => (p.id === postId ? { ...p, ...updated } : p)),
    }));
  },

  getComments(postId) {
    return commentService.getByPost(postId);
  },

  async addComment(postId, userId, text, postAuthorId) {
    const comment = commentService.add(postId, { userId, text });
    set((s) => ({
      posts: s.posts.map((p) => (p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p)),
    }));
    if (postAuthorId !== userId) {
      notificationService.add({
        userId,
        targetUserId: postAuthorId,
        type: "comment",
        message: "commented on your post",
        postId,
      });
    }
    return { ...comment, time: formatPostTime(comment.createdAt) };
  },

  async updatePost(postId, currentUser, payload) {
    const updated = await postService.update(postId, currentUser, payload);
    set((s) => ({
      posts: s.posts.map((p) => (p.id === postId ? { ...p, ...updated } : p)),
    }));
    return updated;
  },

  async deletePost(postId, currentUser) {
    await postService.deletePost(postId, currentUser);
    set((s) => ({ posts: s.posts.filter((p) => p.id !== postId) }));
    return true;
  },

  async deleteComment(postId, commentId, currentUser, postAuthorId) {
    const ok = commentService.remove(postId, commentId, currentUser, postAuthorId);
    if (ok) {
      set((s) => ({
        posts: s.posts.map((p) =>
          p.id === postId ? { ...p, comments: Math.max(0, (p.comments || 1) - 1) } : p
        ),
      }));
    }
    return ok;
  },
}));
