ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;

CREATE INDEX IF NOT EXISTS posts_scheduled_at_idx ON public.posts (scheduled_at);

CREATE TABLE IF NOT EXISTS public.reposts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  quote_text text DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reposts TO anon, authenticated;
GRANT ALL ON public.reposts TO service_role;

ALTER TABLE public.reposts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reposts" ON public.reposts FOR SELECT USING (true);
CREATE POLICY "Anyone can create reposts" ON public.reposts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reposts" ON public.reposts FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reposts" ON public.reposts FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS reposts_created_at_idx ON public.reposts (created_at DESC);
CREATE INDEX IF NOT EXISTS reposts_user_idx ON public.reposts (user_id);