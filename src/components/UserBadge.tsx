import { UserProfile, AVAILABLE_BADGES, getUsers } from "@/lib/store";

interface Props {
  userId: string;
  size?: "sm" | "md";
}

export default function UserBadge({ userId, size = "md" }: Props) {
  const users = getUsers();
  const user = users[userId];
  if (!user) return <span className="text-muted-foreground">{userId}</span>;

  const avatarSize = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const badgeImgSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="flex items-center gap-1.5">
      {user.avatar ? (
        <img src={user.avatar} alt="" className={`${avatarSize} rounded-full object-cover border border-border`} />
      ) : (
        <div className={`${avatarSize} rounded-full bg-secondary flex items-center justify-center text-foreground font-bold ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
          {user.displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <span className={`font-semibold text-foreground ${textSize}`}>{user.displayName}</span>
      {user.isAdmin && <span className="gold-badge-lg" title="Admin">✅</span>}
      {user.isModerator && <span className="text-accent text-xs" title="Moderator">🛡️</span>}
      {user.badges?.map((bid) => {
        const badge = AVAILABLE_BADGES.find((b) => b.id === bid);
        if (!badge) return null;
        return <img key={bid} src={badge.image} alt={badge.name} title={badge.name} className={`${badgeImgSize} rounded-sm object-contain`} />;
      })}
    </div>
  );
}
