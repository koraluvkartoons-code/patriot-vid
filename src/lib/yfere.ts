import { supabase } from "@/integrations/supabase/client";
import { mapPost } from "@/lib/api";
import type { Post } from "@/lib/store";

export const YFERE_SITE = "yfere";
export const YFERE_PAGE_SIZE = 24;

export function chainItems(posts: Post[]): Post[] {
  return [...new Map(posts.map(post => [post.id, post])).values()]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

export function categoryTone(category: string): number {
  return [...category.toLowerCase()].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0) % 5;
}

export async function fetchYfereItems(offset = 0): Promise<Post[]> {
  const { data, error } = await supabase.from("posts")
    .select("id,user_id,title,description,media_url,media_type,media,category,likes,created_at,is_pinned,scheduled_at")
    .eq("site", YFERE_SITE).is("deleted_at", null)
    .or(`scheduled_at.is.null,scheduled_at.lte.${new Date().toISOString()}`)
    .order("created_at", { ascending: true }).order("id", { ascending: true })
    .range(offset, offset + YFERE_PAGE_SIZE - 1);
  if (error) throw error;
  return (data || []).map(mapPost);
}