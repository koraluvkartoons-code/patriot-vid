
-- Add archive columns
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Anyone can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
