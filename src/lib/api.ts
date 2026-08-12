import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, Post, Comment, PostMedia } from "@/lib/store";

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

export async function fetchCategories(): Promise<string[]> {
  const { data, error } = await supabase.from("posts").select("category").not("category", "is", null);
  if (error) throw error;
  const set = new Set<string>();
  for (const r of data || []) if (r.category) set.add(r.category);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export async function fetchPosts(limit = 20, offset = 0, order: "newest" | "oldest" = "newest", category?: string, viewerId?: string | null): Promise<Post[]> {
  const ascending = order === "oldest";
  let query = supabase
    .from("posts")
    .select("id,user_id,title,description,media_type,media,category,likes,created_at,is_pinned");

  if (category) query = query.eq("category", category);

  // Scheduled posts (future date) stay hidden until their time — except for their author
  const now = new Date().toISOString();
  query = viewerId
    ? query.or(`created_at.lte.${now},user_id.eq.${viewerId}`)
    : query.lte("created_at", now);

  const { data, error } = await query
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data || []).map(p => ({
    id: p.id,
    userId: p.user_id,
    title: p.title,
    description: p.description || "",
    mediaUrl: undefined,
    mediaType: p.media_type || undefined,
    media: parseMedia(p.media),
    category: p.category || undefined,
    likes: p.likes || [],
    createdAt: p.created_at,
    isPinned: p.is_pinned || false,
  }));
}

export async function searchPosts(term: string, limit = 20, offset = 0): Promise<Post[]> {
  const q = term.trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from("posts")
    .select("id,user_id,title,description,media_type,media,category,likes,created_at,is_pinned")
    .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data || []).map(p => ({
    id: p.id,
    userId: p.user_id,
    title: p.title,
    description: p.description || "",
    mediaUrl: undefined,
    mediaType: p.media_type || undefined,
    media: parseMedia(p.media),
    category: p.category || undefined,
    likes: p.likes || [],
    createdAt: p.created_at,
    isPinned: p.is_pinned || false,
  }));
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

export async function createPost(post: { userId: string; title: string; description: string; mediaUrl?: string; mediaType?: string; media?: PostMedia[]; category?: string; createdAt?: string }) {
  await supabase.from("posts").insert({
    user_id: post.userId,
    title: post.title,
    description: post.description,
    media_url: post.mediaUrl || null,
    media_type: post.mediaType || null,
    media: (post.media || []) as unknown as never,
    category: post.category?.trim() || null,
    likes: [],
    ...(post.createdAt ? { created_at: post.createdAt } : {}),
  });
}

export async function repostPost(post: { title: string; description: string; media?: PostMedia[]; mediaType?: string; category?: string; userId: string; originalUser: string }) {
  await createPost({
    userId: post.userId,
    title: post.title,
    description: `♻ Reposted from @${post.originalUser}${post.description ? `\n\n${post.description}` : ""}`,
    media: post.media || [],
    mediaUrl: post.media?.[0]?.url,
    mediaType: post.media?.[0]?.type || post.mediaType,
    category: post.category,
  });
}

export async function updatePost(id: string, title: string, description: string, createdAt?: string, category?: string | null) {
  const patch: { title: string; description: string; updated_at: string; created_at?: string; category?: string | null } = {
    title, description, updated_at: new Date().toISOString(),
  };
  if (createdAt) patch.created_at = createdAt;
  if (category !== undefined) patch.category = category && category.trim() ? category.trim() : null;
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

export async function deleteComment(id: string) {
  await supabase.from("comments").delete().eq("id", id);
}
