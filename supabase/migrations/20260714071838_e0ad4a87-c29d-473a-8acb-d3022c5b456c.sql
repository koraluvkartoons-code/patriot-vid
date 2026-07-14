CREATE INDEX IF NOT EXISTS idx_posts_pinned_created ON public.posts (is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_streams_created ON public.streams (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_streams_status ON public.streams (status);
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.comments (post_id, created_at);