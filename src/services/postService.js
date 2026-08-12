import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { formatPostTime } from "@/utils/userHelpers";
import { commentService } from "./commentService";
import { userService } from "./userService";
import { api, BASE_URL } from "./api";
import { USE_API } from "@/config/env";
import { canEditPost, canDeletePost } from "@/constants/permissions";

function loadPosts() {
  return storage.get(STORAGE_KEYS.POSTS, []);
}

function savePosts(posts) {
  storage.set(STORAGE_KEYS.POSTS, posts);
}

function enrichPost(post) {
  const commentCount = commentService.countForPost(post.id);
  return {
    ...post,
    comments: commentCount,
    time: formatPostTime(post.createdAt),
  };
}

export const postService = {
  getFeed() {
    const posts = loadPosts()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(enrichPost);
    return posts;
  },

  getByUser(userId) {
    return loadPosts()
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(enrichPost);
  },

  getById(postId) {
    const post = loadPosts().find((p) => p.id === postId);
    return post ? enrichPost(post) : null;
  },

  create(userId, payload) {
    const posts = loadPosts();
    const post = {
      id: Date.now(),
      userId,
      type: payload.imageUrl ? "image" : "text",
      content: payload.content?.trim() || "",
      imageUrl: payload.imageUrl || null,
      imageColor: payload.imageColor || null,
      tags: payload.tags || [],
      likes: 0,
      likedBy: [],
      shares: 0,
      savedBy: [],
      createdAt: Date.now(),
    };
    posts.unshift(post);
    savePosts(posts);

    const userPosts = posts.filter((p) => p.userId === userId).length;
    userService.updateCounts(userId, { posts: userPosts });

    return enrichPost(post);
  },

  likePost(postId, userId) {
    const posts = loadPosts();
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return null;

    const post = posts[idx];
    const likedBy = post.likedBy || [];
    const hasLiked = likedBy.includes(userId);
    const nextLikedBy = hasLiked ? likedBy.filter((id) => id !== userId) : [...likedBy, userId];

    posts[idx] = {
      ...post,
      likedBy: nextLikedBy,
      likes: nextLikedBy.length,
      liked: nextLikedBy.includes(userId),
    };
    savePosts(posts);
    return enrichPost(posts[idx]);
  },

  savePost(postId, userId) {
    const posts = loadPosts();
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) return null;

    const post = posts[idx];
    const savedBy = post.savedBy || [];
    const hasSaved = savedBy.includes(userId);
    const nextSavedBy = hasSaved ? savedBy.filter((id) => id !== userId) : [...savedBy, userId];

    posts[idx] = {
      ...post,
      savedBy: nextSavedBy,
      saved: nextSavedBy.includes(userId),
    };
    savePosts(posts);
    return enrichPost(posts[idx]);
  },

  canEdit(post, currentUser) {
    return canEditPost(post, currentUser);
  },

  canDelete(post, currentUser) {
    return canDeletePost(post, currentUser);
  },

  async deletePost(postId, currentUser) {
    const posts = loadPosts();
    const post = posts.find((p) => p.id === postId);
    if (!post) throw new Error("Post not found");
    if (!this.canDelete(post, currentUser)) {
      const err = new Error("You cannot delete this post");
      err.status = 403;
      throw err;
    }

    if (USE_API && BASE_URL) {
      try {
        await api.delete(`/posts/${postId}`);
      } catch (err) {
        if (err.status === 403 || err.message?.includes("403")) throw err;
        /* fall through to local */
      }
    }

    const ownerId = post.userId;
    savePosts(posts.filter((p) => p.id !== postId));
    const remaining = loadPosts().filter((p) => p.userId === ownerId).length;
    userService.updateCounts(ownerId, { posts: remaining });
    return true;
  },

  async update(postId, currentUser, payload) {
    const posts = loadPosts();
    const idx = posts.findIndex((p) => p.id === postId);
    if (idx === -1) throw new Error("Post not found");
    const post = posts[idx];
    if (!this.canEdit(post, currentUser)) {
      const err = new Error("You cannot edit this post");
      err.status = 403;
      throw err;
    }

    const updates = {
      content: payload.content?.trim() ?? post.content,
      imageUrl: payload.imageUrl !== undefined ? payload.imageUrl : post.imageUrl,
      updatedAt: Date.now(),
      type: payload.imageUrl || post.imageUrl ? "image" : "text",
    };

    if (USE_API && BASE_URL) {
      try {
        const remote = await api.put(`/posts/${postId}`, updates);
        posts[idx] = { ...post, ...remote };
        savePosts(posts);
        return enrichPost(posts[idx]);
      } catch {
        /* fall through to local */
      }
    }

    posts[idx] = { ...post, ...updates };
    savePosts(posts);
    return enrichPost(posts[idx]);
  },
};
