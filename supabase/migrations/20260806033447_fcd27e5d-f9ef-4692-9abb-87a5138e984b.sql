ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS category text;

CREATE INDEX IF NOT EXISTS posts_category_idx ON public.posts (category);