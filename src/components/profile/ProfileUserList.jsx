import UserRow from "@/components/common/UserRow";
import EmptyState from "@/components/common/EmptyState";

export default function ProfileUserList({ users, emptyTitle, emptyDescription }) {
  if (users.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      {users.map((user) => (
        <UserRow key={user.id} user={user} asLink={false} showFollowButton />
      ))}
    </div>
  );
}
