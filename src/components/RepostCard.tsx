import { Link } from "react-router-dom";
import { type Repost, type UserProfile, getCurrentUserId } from "@/lib/store";
import { removeRepost } from "@/lib/api";
import PostCard from "./PostCard";
import { Repeat2, X } from "lucide-react";

interface Props {
  repost: Repost;
  profiles: Record<string, UserProfile>;
  onNeedSetup: () => void;
  onRefresh: () => void;
}

export default function RepostCard({ repost, profiles, onNeedSetup, onRefresh }: Props) {
  const currentUser = getCurrentUserId();
  const mine = currentUser === repost.userId;

  const undo = async () => {
    await removeRepost(repost.postId, repost.userId);
    onRefresh();
  };

  if (!repost.post) return null;

  return (
    <div className="border border-term-green/30 rounded-sm bg-term-green/5">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-term-green">
        <Repeat2 className="w-3 h-3" />
        <span className="font-bold">{repost.userId}</span> reposted
        <span className="text-muted-foreground">· {new Date(repost.createdAt).toLocaleString()}</span>
        {mine && (
          <button onClick={undo} title="Undo repost" className="ml-auto text-muted-foreground hover:text-destructive">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {repost.quoteText && (
        <p className="px-2 pb-1 text-[13px] text-foreground break-words">{repost.quoteText}</p>
      )}

      <div className="px-1 pb-1">
        <div className="text-[10px] text-muted-foreground px-1 pb-0.5">
          original by <Link to={`/post/${repost.post.id}`} className="text-accent hover:text-primary">@{repost.post.userId}</Link>
        </div>
        <PostCard
          post={repost.post}
          profiles={profiles}
          onNeedSetup={onNeedSetup}
          onRefresh={onRefresh}
          compact
          hideActions={!!repost.quoteText}
        />
      </div>
    </div>
  );
}
