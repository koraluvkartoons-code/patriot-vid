import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, Post, Comment } from "@/lib/store";

// ===== PROFILES =====
export async function fetchProfiles(): Promise<Record<string, UserProfile>> {
  const { data } = await supabase.from("profiles").select("*");
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
export async function fetchPosts(): Promise<Post[]> {
  const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  return (data || []).map(p => ({
    id: p.id,
    userId: p.user_id,
    title: p.title,
    description: p.description || "",
    mediaUrl: p.media_url || undefined,
    mediaType: p.media_type || undefined,
    likes: p.likes || [],
    createdAt: p.created_at,
  }));
}

export async function createPost(post: { userId: string; title: string; description: string; mediaUrl?: string; mediaType?: string }) {
  await supabase.from("posts").insert({
    user_id: post.userId,
    title: post.title,
    description: post.description,
    media_url: post.mediaUrl || null,
    media_type: post.mediaType || null,
    likes: [],
  });
}

export async function updatePost(id: string, title: string, description: string) {
  await supabase.from("posts").update({ title, description, updated_at: new Date().toISOString() }).eq("id", id);
}

export async function deletePost(id: string) {
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
  const { data } = await supabase.from("comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
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
