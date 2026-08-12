import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import { Button } from "@/components/ui/Button";

/** Follow / unfollow control with instant state + loading */
export default function FollowButton({ user, size = "sm", onChange }) {
  const currentUser = useAuthStore((s) => s.user);
  const follow = useSocialStore((s) => s.follow);
  const unfollow = useSocialStore((s) => s.unfollow);
  const isFollowLoading = useSocialStore((s) => s.isFollowLoading);
  const isFollowing = useSocialStore((s) => {
    void s.version;
    return currentUser ? s.isFollowing(currentUser.id, user?.id) : false;
  });

  if (!currentUser || !user || currentUser.id === user.id) return null;

  const loading = isFollowLoading(currentUser.id, user.id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    if (isFollowing) {
      await unfollow(currentUser.id, user.id);
    } else {
      await follow(currentUser.id, user.id);
    }
    onChange?.();
  };

  return (
    <Button
      type="button"
      variant={isFollowing ? "secondary" : "primary"}
      size={size}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "…" : isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
