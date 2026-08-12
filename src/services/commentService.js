import { storage } from "@/utils/storage";
import { STORAGE_KEYS } from "@/constants/storageKeys";
import { canModerateComment } from "@/constants/permissions";

function loadComments() {
  return storage.get(STORAGE_KEYS.COMMENTS, {});
}

function saveComments(data) {
  storage.set(STORAGE_KEYS.COMMENTS, data);
}

export const commentService = {
  getByPost(postId) {
    const all = loadComments();
    return (all[postId] || []).sort((a, b) => a.createdAt - b.createdAt);
  },

  add(postId, { userId, text }) {
    const all = loadComments();
    const list = all[postId] || [];
    const comment = {
      id: Date.now(),
      postId,
      userId,
      text: text.trim(),
      createdAt: Date.now(),
    };
    all[postId] = [...list, comment];
    saveComments(all);
    return comment;
  },

  remove(postId, commentId, currentUser, postAuthorId) {
    const all = loadComments();
    const list = all[postId] || [];
    const comment = list.find((c) => c.id === commentId);
    if (!comment || !canModerateComment(comment, currentUser, postAuthorId)) {
      return false;
    }
    all[postId] = list.filter((c) => c.id !== commentId);
    saveComments(all);
    return true;
  },

  countForPost(postId) {
    return (loadComments()[postId] || []).length;
  },
};
