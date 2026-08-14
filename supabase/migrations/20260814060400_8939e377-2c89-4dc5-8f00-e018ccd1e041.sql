ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS site text NOT NULL DEFAULT 'main';
CREATE INDEX IF NOT EXISTS posts_site_created_at_idx ON public.posts (site, created_at DESC);