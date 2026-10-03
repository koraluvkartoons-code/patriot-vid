ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS deleted_by TEXT;
CREATE INDEX IF NOT EXISTS posts_deleted_at_idx ON public.posts (deleted_at);

CREATE TABLE public.guild_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE CHECK (char_length(username) BETWEEN 1 AND 40),
  title TEXT NOT NULL DEFAULT 'Tenderfoot' CHECK (char_length(title) BETWEEN 1 AND 60),
  quiz_answer TEXT CHECK (quiz_answer IN ('researching', 'posting')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.guild_members TO anon, authenticated;
GRANT ALL ON public.guild_members TO service_role;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guild members are public" ON public.guild_members FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Guild members can join" ON public.guild_members FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Guild members can update" ON public.guild_members FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.guilds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 240),
  owner_name TEXT NOT NULL CHECK (char_length(owner_name) BETWEEN 1 AND 40),
  background_color TEXT NOT NULL DEFAULT '#211827' CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  background_url TEXT,
  background_type TEXT CHECK (background_type IS NULL OR background_type IN ('image', 'video')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guilds TO anon, authenticated;
GRANT ALL ON public.guilds TO service_role;
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guilds are public" ON public.guilds FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can create guilds" ON public.guilds FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owners can update guilds" ON public.guilds FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Owners can delete guilds" ON public.guilds FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE public.guild_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL CHECK (char_length(author_name) BETWEEN 1 AND 40),
  text TEXT NOT NULL DEFAULT '' CHECK (char_length(text) <= 2000),
  media_url TEXT,
  media_type TEXT CHECK (media_type IS NULL OR media_type IN ('image', 'video', 'gif')),
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guild_messages TO anon, authenticated;
GRANT ALL ON public.guild_messages TO service_role;
ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guild messages are public" ON public.guild_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can send guild messages" ON public.guild_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authors can update guild messages" ON public.guild_messages FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authors can delete guild messages" ON public.guild_messages FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX guild_messages_guild_created_idx ON public.guild_messages (guild_id, created_at);

CREATE TABLE public.watchman_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_name TEXT NOT NULL CHECK (char_length(host_name) BETWEEN 1 AND 40),
  title TEXT NOT NULL DEFAULT 'Watchman Detector Stream' CHECK (char_length(title) BETWEEN 1 AND 120),
  room_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live', 'ended')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchman_streams TO anon, authenticated;
GRANT ALL ON public.watchman_streams TO service_role;
ALTER TABLE public.watchman_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Watchman streams are public" ON public.watchman_streams FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can start Watchman streams" ON public.watchman_streams FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Hosts can update Watchman streams" ON public.watchman_streams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Hosts can delete Watchman streams" ON public.watchman_streams FOR DELETE TO anon, authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watchman_streams;