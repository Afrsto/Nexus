/** Platform admin — unrestricted access across the app */
export const ADMIN_EMAIL = "admin@nexus.app";
export const FULL_ACCESS = "FULL_ACCESS";

export function isPlatformAdmin(user) {
  if (!user) return false;
  return (
    user.role === "admin" ||
    user.permissions === FULL_ACCESS ||
    user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

/** Normalize session/public user so admin always has full access flags */
export function applyPlatformAdmin(user) {
  if (!user) return null;
  if (!isPlatformAdmin(user)) return user;
  return { ...user, role: "admin", permissions: FULL_ACCESS };
}

export function canEditPost(post, user) {
  if (!post || !user) return false;
  return post.userId === user.id || isPlatformAdmin(user);
}

export function canDeletePost(post, user) {
  return canEditPost(post, user);
}

export function canModerateComment(comment, user, postAuthorId) {
  if (!comment || !user) return false;
  return (
    comment.userId === user.id ||
    isPlatformAdmin(user) ||
    (postAuthorId != null && postAuthorId === user.id)
  );
}

/** Role hierarchy and permission flags for room/channel access control. */

export const ROLES = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  MEMBER: "Member",
};

/** Higher index = more authority */
export const ROLE_RANK = {
  [ROLES.OWNER]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.MODERATOR]: 2,
  [ROLES.MEMBER]: 1,
};

export const PERMISSIONS = {
  SEND_MESSAGES: "send_messages",
  DELETE_MESSAGES: "delete_messages",
  PIN_MESSAGES: "pin_messages",
  MANAGE_MEMBERS: "manage_members",
  MANAGE_ROLES: "manage_roles",
  CREATE_CHANNELS: "create_channels",
  UPLOAD_MEDIA: "upload_media",
  POST_ANNOUNCEMENTS: "post_announcements",
};

/** Default permissions per role */
export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.DELETE_MESSAGES,
    PERMISSIONS.PIN_MESSAGES,
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.CREATE_CHANNELS,
    PERMISSIONS.UPLOAD_MEDIA,
    PERMISSIONS.POST_ANNOUNCEMENTS,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.SEND_MESSAGES,
    PERMISSIONS.DELETE_MESSAGES,
    PERMISSIONS.PIN_MESSAGES,
    PERMISSIONS.UPLOAD_MEDIA,
  ],
  [ROLES.MEMBER]: [PERMISSIONS.SEND_MESSAGES, PERMISSIONS.UPLOAD_MEDIA],
};

/** Check if a role has a specific permission */
export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
