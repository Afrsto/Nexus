import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useSocialStore } from "@/store/useSocialStore";
import { postService } from "@/services/postService";
import PageShell from "@/components/layout/PageShell";
import Tabs from "@/components/ui/Tabs";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfilePosts from "@/components/profile/ProfilePosts";
import ProfileMediaGrid from "@/components/profile/ProfileMediaGrid";
import ProfileUserList from "@/components/profile/ProfileUserList";
import ProfileActivity from "@/components/profile/ProfileActivity";

const TABS = ["Posts", "Media", "Activity", "Followers", "Following"];

export default function ProfilePage() {
  const { username } = useParams();
  const currentUser = useAuthStore((s) => s.user);
  const getUserByUsername = useSocialStore((s) => s.getUserByUsername);
  const getFollowers = useSocialStore((s) => s.getFollowers);
  const getFollowing = useSocialStore((s) => s.getFollowing);
  const followVersion = useSocialStore((s) => s.version);
  const [tab, setTab] = useState("Posts");
  const [profileUser, setProfileUser] = useState(null);

  useEffect(() => {
    const user = username ? getUserByUsername(username) : currentUser;
    setProfileUser(user);
  }, [username, currentUser, getUserByUsername, followVersion]);

  const isOwnProfile = !username || username === currentUser?.username;

  if (!profileUser) {
    return (
      <PageShell>
        <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>User not found</h2>
          <p>@{username} doesn&apos;t exist on Nexus</p>
        </div>
      </PageShell>
    );
  }

  const userPosts = postService.getByUser(profileUser.id);
  const mediaPosts = userPosts.filter((p) => p.imageUrl);
  const followers = getFollowers(profileUser.id);
  const following = getFollowing(profileUser.id);

  return (
    <PageShell padding="0">
      <ProfileHeader
        user={profileUser}
        isOwnProfile={isOwnProfile}
        onStatClick={(t) => setTab(t)}
        onUserUpdate={setProfileUser}
      />

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 5,
          background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      <div style={{ padding: "var(--space-5) var(--space-6)" }}>
        {tab === "Posts" && <ProfilePosts posts={userPosts} />}
        {tab === "Media" && <ProfileMediaGrid posts={mediaPosts} />}
        {tab === "Activity" && <ProfileActivity userId={profileUser.id} />}
        {tab === "Followers" && (
          <ProfileUserList
            users={followers}
            emptyTitle="No followers yet"
            emptyDescription="When people follow this user, they'll appear here."
          />
        )}
        {tab === "Following" && (
          <ProfileUserList
            users={following}
            emptyTitle="Not following anyone"
            emptyDescription="Accounts this user follows will show up here."
          />
        )}
      </div>
    </PageShell>
  );
}
