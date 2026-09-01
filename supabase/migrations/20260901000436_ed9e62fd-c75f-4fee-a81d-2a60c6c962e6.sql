ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone;
ALTER TABLE public.reposts ADD COLUMN IF NOT EXISTS media jsonb NOT NULL DEFAULT '[]'::jsonb;