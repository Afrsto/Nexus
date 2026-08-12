import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import ProfileStats from "./ProfileStats";
import { getAvatarColor } from "@/utils/avatarColor";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import { useChatStore } from "@/store/useChatStore";
import { userService } from "@/services/userService";
import { ROUTES } from "@/constants/routes";
import toast from "react-hot-toast";

export default function ProfileHeader({ user, isOwnProfile = false, onStatClick, onUserUpdate }) {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const follow = useSocialStore((s) => s.follow);
  const unfollow = useSocialStore((s) => s.unfollow);
  const isFollowLoading = useSocialStore((s) => s.isFollowLoading);
  const isFollowing = useSocialStore((s) => {
    void s.version;
    return currentUser && user ? s.isFollowing(currentUser.id, user.id) : false;
  });
  const getOrCreatePrivateChat = useChatStore((s) => s.getOrCreatePrivateChat);
  const [followBusy, setFollowBusy] = useState(false);

  if (!user) return null;

  const displayUser = userService.getById(user.id) || user;
  const accentTint = getAvatarColor(displayUser.id);
  const loading = followBusy || (currentUser && isFollowLoading(currentUser.id, displayUser.id));

  const refreshProfile = () => {
    const fresh = userService.getById(displayUser.id);
    if (fresh) onUserUpdate?.(fresh);
    if (currentUser?.id === displayUser.id) refreshUser();
  };

  const handleFollow = async () => {
    if (!currentUser || isOwnProfile || loading) return;
    setFollowBusy(true);
    try {
      if (isFollowing) {
        const ok = await unfollow(currentUser.id, displayUser.id);
        if (ok) toast.success(`Unfollowed @${displayUser.username}`);
      } else {
        const ok = await follow(currentUser.id, displayUser.id);
        if (ok) toast.success(`Following @${displayUser.username}`);
      }
      refreshProfile();
    } finally {
      setFollowBusy(false);
    }
  };

  const handleMessage = () => {
    if (!currentUser) return;
    const chat = getOrCreatePrivateChat(currentUser.id, displayUser.id);
    if (chat) {
      useChatStore.getState().setActiveChat(chat);
      navigate(`/chats/${chat.id}`);
    } else {
      navigate(ROUTES.CHATS);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          height: 200,
          background: displayUser.coverUrl
            ? `url(${displayUser.coverUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${accentTint}55 0%, var(--accent) 40%, var(--pink) 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 80%, var(--accent-glow) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,107,157,0.25) 0%, transparent 45%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "var(--space-4)",
            right: "var(--space-4)",
            display: "flex",
            gap: "var(--space-2)",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {isOwnProfile ? (
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.SETTINGS)}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant={isFollowing ? "secondary" : "primary"}
                size="sm"
                onClick={handleFollow}
                disabled={loading}
              >
                {loading ? "…" : isFollowing ? "Following" : "Follow"}
              </Button>
              <Button variant="secondary" size="sm" onClick={handleMessage}>
                Message
              </Button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: "0 var(--space-6)", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: -44,
            left: "var(--space-6)",
            padding: 4,
            background: "var(--bg-surface)",
            borderRadius: "50%",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <Avatar user={displayUser} size={88} showOnline />
        </div>

        <div style={{ paddingTop: 52, paddingBottom: "var(--space-4)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              flexWrap: "wrap",
            }}
          >
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {displayUser.name}
            </h1>
            {displayUser.verified && <Badge color="var(--accent)">Verified</Badge>}
          </div>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
            @{displayUser.username}
          </p>

          {displayUser.bio && (
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary)",
                marginTop: "var(--space-3)",
                lineHeight: 1.6,
                maxWidth: 520,
              }}
            >
              {displayUser.bio}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-4)",
              marginTop: "var(--space-3)",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            {displayUser.location && <span>📍 {displayUser.location}</span>}
            {displayUser.website && (
              <a
                href={`https://${displayUser.website}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                {displayUser.website}
              </a>
            )}
          </div>

          <ProfileStats user={displayUser} onStatClick={onStatClick} />
        </div>
      </div>
    </div>
  );
}
