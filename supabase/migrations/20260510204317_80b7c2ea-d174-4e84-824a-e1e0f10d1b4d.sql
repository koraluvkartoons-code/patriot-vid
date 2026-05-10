
-- Streams table
CREATE TABLE public.streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Live Stream',
  room_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'live',
  thumbnail_url TEXT,
  recording_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view streams" ON public.streams FOR SELECT USING (true);
CREATE POLICY "Anyone create streams" ON public.streams FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone update streams" ON public.streams FOR UPDATE USING (true);
CREATE POLICY "Anyone delete streams" ON public.streams FOR DELETE USING (true);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL REFERENCES public.streams(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_session_id TEXT NOT NULL,
  text TEXT DEFAULT '',
  media_url TEXT,
  media_type TEXT,
  reply_to UUID,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone post chat" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone update chat" ON public.chat_messages FOR UPDATE USING (true);
CREATE POLICY "Anyone delete chat" ON public.chat_messages FOR DELETE USING (true);
CREATE INDEX idx_chat_stream ON public.chat_messages(stream_id, created_at);

-- Banned IPs
CREATE TABLE public.banned_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  stream_id UUID,
  reason TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.banned_ips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view bans" ON public.banned_ips FOR SELECT USING (true);
CREATE POLICY "Anyone create bans" ON public.banned_ips FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone delete bans" ON public.banned_ips FOR DELETE USING (true);
CREATE INDEX idx_banned_ip ON public.banned_ips(ip_address, expires_at);

-- Chat timeouts (per-session)
CREATE TABLE public.chat_timeouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_session_id TEXT NOT NULL,
  stream_id UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_timeouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view timeouts" ON public.chat_timeouts FOR SELECT USING (true);
CREATE POLICY "Anyone create timeouts" ON public.chat_timeouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone delete timeouts" ON public.chat_timeouts FOR DELETE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.streams;

-- Storage bucket for recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('stream-recordings', 'stream-recordings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read recordings" ON storage.objects FOR SELECT USING (bucket_id = 'stream-recordings');
CREATE POLICY "Anyone upload recordings" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'stream-recordings');
CREATE POLICY "Anyone delete recordings" ON storage.objects FOR DELETE USING (bucket_id = 'stream-recordings');
