import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, Post, Comment, PostMedia, Repost } from "@/lib/store";

// ===== MEDIA UPLOAD =====
export async function uploadMedia(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file);
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

// ===== PROFILES =====
export async function fetchProfiles(): Promise<Record<string, UserProfile>> {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) throw error;
  const map: Record<string, UserProfile> = {};
  for (const p of data || []) {
    map[p.display_name] = {
      displayName: p.display_name,
      avatar: p.avatar || "",
      badges: p.badges || [],
      isAdmin: p.is_admin || false,
      isModerator: p.is_moderator || false,
    };
  }
  // Always ensure admin
  if (!map["PatriotAdmin"]) {
    map["PatriotAdmin"] = { displayName: "PatriotAdmin", avatar: "", badges: [], isAdmin: true };
  }
  return map;
}

export async function upsertProfile(profile: UserProfile) {
  await supabase.from("profiles").upsert({
    display_name: profile.displayName,
    avatar: profile.avatar,
    badges: profile.badges,
    is_admin: profile.isAdmin || false,
    is_moderator: profile.isModerator || false,
  }, { onConflict: "display_name" });
}

export async function updateProfileBadges(displayName: string, badges: string[]) {
  await supabase.from("profiles").update({ badges }).eq("display_name", displayName);
}

export async function updateProfileMod(displayName: string, isMod: boolean) {
  await supabase.from("profiles").update({ is_moderator: isMod }).eq("display_name", displayName);
}

// ===== POSTS =====
function parseMedia(raw: unknown): PostMedia[] {
  if (!Array.isArray(raw)) return [];
  return (raw as PostMedia[]).filter(m => m && typeof m.url === "string");
}

const POST_COLS = "id,user_id,title,description,media_type,media,category,likes,created_at,is_pinned,scheduled_at";

type RawPost = {
  id: string; user_id: string; title: string; description: string | null;
  media_type: string | null; media: unknown; category: string | null;
  likes: string[] | null; created_at: string; is_pinned: boolean | null;
  scheduled_at?: string | null; media_url?: string | null;
};

export function mapPost(p: RawPost): Post {
  return {
    id: p.id,
    userId: p.user_id,
    title: p.title,
    description: p.description || "",
    mediaUrl: p.media_url || undefined,
    mediaType: p.media_type || undefined,
    media: parseMedia(p.media),
    category: p.category || undefined,
    likes: p.likes || [],
    createdAt: p.created_at,
    isPinned: p.is_pinned || false,
    scheduledAt: p.scheduled_at || undefined,
  };
}

// only posts whose scheduled time has arrived (or that were never scheduled)
function publishedFilter(q: any) {
  return q.or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`);
}

export async function fetchCategories(site = "main"): Promise<string[]> {
  const { data, error } = await supabase.from("posts").select("category").eq("site", site).not("category", "is", null);
  if (error) throw error;
  const set = new Set<string>();
  for (const r of data || []) if (r.category) set.add(r.category);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function fetchPosts(limit = 20, offset = 0, order: "newest" | "oldest" = "newest", category?: string, site = "main"): Promise<Post[]> {
  const ascending = order === "oldest";
  let query: any = supabase.from("posts").select(POST_COLS).eq("site", site);

  if (category) query = query.eq("category", category);
  query = publishedFilter(query);

  const { data, error } = await query
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data || []).map(mapPost);
}

export async function searchPosts(term: string, limit = 20, offset = 0, site = "main"): Promise<Post[]> {
  const q = term.trim();
  if (!q) return [];
  const { data, error } = await publishedFilter(
    supabase.from("posts").select(POST_COLS).eq("site", site).or(`title.ilike.%${q}%,description.ilike.%${q}%`)
  )
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data || []).map(mapPost);
}

// ===== SCHEDULED POSTS =====
export async function fetchScheduledPosts(userId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLS)
    .eq("user_id", userId)
    .gt("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapPost);
}

export async function fetchPostMedia(id: string) {
  const { data, error } = await supabase
    .from("posts")
    .select("media_url, media_type")
    .eq("id", id)
    .single();

  if (error) throw error;

  return {
    mediaUrl: data.media_url || undefined,
    mediaType: data.media_type || undefined,
  };
}

export async function togglePinPost(id: string, pinned: boolean) {
  await supabase.from("posts").update({ is_pinned: pinned }).eq("id", id);
}

export async function createPost(post: { userId: string; title: string; description: string; mediaUrl?: string; mediaType?: string; media?: PostMedia[]; category?: string; scheduledAt?: string; site?: string }) {
  await supabase.from("posts").insert({
    user_id: post.userId,
    title: post.title,
    description: post.description,
    media_url: post.mediaUrl || null,
    media_type: post.mediaType || null,
    media: (post.media || []) as unknown as never,
    category: post.category?.trim() || null,
    scheduled_at: post.scheduledAt || null,
    site: post.site || "main",
    likes: [],
  });
}

export async function updatePost(id: string, title: string, description: string, createdAt?: string, category?: string | null, scheduledAt?: string | null) {
  const patch: any = {
    title, description, updated_at: new Date().toISOString(),
  };
  if (createdAt) patch.created_at = createdAt;
  if (category !== undefined) patch.category = category && category.trim() ? category.trim() : null;
  if (scheduledAt !== undefined) patch.scheduled_at = scheduledAt;
  await supabase.from("posts").update(patch).eq("id", id);
}

export async function deletePost(id: string) {
  await supabase.from("comments").delete().eq("post_id", id);
  await supabase.from("posts").delete().eq("id", id);
}

export async function togglePostLike(postId: string, userId: string) {
  const { data } = await supabase.from("posts").select("likes").eq("id", postId).single();
  if (!data) return;
  let likes: string[] = data.likes || [];
  if (likes.includes(userId)) likes = likes.filter(l => l !== userId);
  else likes.push(userId);
  await supabase.from("posts").update({ likes }).eq("id", postId);
}

// ===== REPOSTS =====
export async function fetchFeedReposts(limit = 30): Promise<Repost[]> {
  const { data, error } = await supabase
    .from("reposts")
    .select(`id,post_id,user_id,quote_text,media,created_at, posts(${POST_COLS})`)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const now = Date.now();
  return (data || [])
    .map((r: any) => ({
      id: r.id,
      postId: r.post_id,
      userId: r.user_id,
      quoteText: r.quote_text || "",
      media: parseMedia(r.media),
      createdAt: r.created_at,
      post: r.posts ? mapPost(r.posts) : undefined,
    }))
    .filter(r => r.post && (!r.post.scheduledAt || new Date(r.post.scheduledAt).getTime() <= now));
}

export async function fetchRepostsFor(postIds: string[]): Promise<Record<string, string[]>> {
  if (!postIds.length) return {};
  const { data, error } = await supabase.from("reposts").select("post_id,user_id").in("post_id", postIds);
  if (error) throw error;
  const map: Record<string, string[]> = {};
  for (const r of data || []) (map[r.post_id] ||= []).push(r.user_id);
  return map;
}

export async function addRepost(postId: string, userId: string, quoteText = "", media: PostMedia[] = []) {
  const { error } = await supabase.from("reposts").upsert(
    { post_id: postId, user_id: userId, quote_text: quoteText, media: media as unknown as never },
    { onConflict: "post_id,user_id" }
  );
  if (error) throw error;
}

export async function removeRepost(postId: string, userId: string) {
  await supabase.from("reposts").delete().eq("post_id", postId).eq("user_id", userId);
}

// ===== COMMENTS =====
export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(c => ({
    id: c.id,
    postId: c.post_id,
    userId: c.user_id,
    text: c.text || "",
    mediaUrl: c.media_url || undefined,
    mediaType: c.media_type || undefined,
    createdAt: c.created_at,
    editedAt: (c as { edited_at?: string }).edited_at || undefined,
  }));
}

export async function createComment(comment: { postId: string; userId: string; text: string; mediaUrl?: string; mediaType?: string }) {
  await supabase.from("comments").insert({
    post_id: comment.postId,
    user_id: comment.userId,
    text: comment.text,
    media_url: comment.mediaUrl || null,
    media_type: comment.mediaType || null,
  });
}

export async function updateComment(id: string, text: string) {
  await supabase.from("comments").update({ text, edited_at: new Date().toISOString() }).eq("id", id);
}

export async function deleteComment(id: string) {
  await supabase.from("comments").delete().eq("id", id);
}
