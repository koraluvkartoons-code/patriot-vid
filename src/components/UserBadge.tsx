import { Shield } from "lucide-react";
import { AVAILABLE_BADGES, type UserProfile } from "@/lib/store";

interface Props {
  userId: string;
  size?: "sm" | "md";
  profiles: Record<string, UserProfile>;
}

export default function UserBadge({ userId, size = "md", profiles }: Props) {
  const user = profiles[userId];
  const isAdmin = userId === "PatriotAdmin" || userId === "admin" || user?.isAdmin;
  const isMod = user?.isModerator;

  const avatarSize = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  const badgeImgSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  const displayName = user?.displayName || userId;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {user?.avatar ? (
        <img src={user.avatar} alt="" className={`${avatarSize} rounded-full object-cover border border-border`} />
      ) : (
        <div className={`${avatarSize} rounded-full bg-secondary flex items-center justify-center text-foreground font-bold ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
      <span className={`font-semibold ${isAdmin ? "text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-foreground"} ${textSize}`}>
        {displayName}
      </span>
      {isAdmin && (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-black text-[10px] font-black tracking-wider uppercase shadow-[0_0_10px_rgba(234,179,8,0.6)] border border-yellow-200" title="Admin">
          👑 ADMIN
        </span>
      )}
      {!isAdmin && isMod && (
        <span title="Moderator" className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-indigo-900/80 text-cyan-300 text-[10px] font-bold border border-cyan-400/60">
          <Shield className={`${size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} text-cyan-300`} /> MOD
        </span>
      )}
      {user?.badges?.map((bid) => {
        const badge = AVAILABLE_BADGES.find((b) => b.id === bid);
        if (!badge) return null;
        return <img key={bid} src={badge.image} alt={badge.name} title={badge.name} className={`${badgeImgSize} rounded-sm object-contain`} />;
      })}
    </div>
  );
}
