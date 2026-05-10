-- Create a storage bucket for tournament banners
INSERT INTO storage.buckets (id, name, public) 
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for 'banners' bucket
-- 1. Allow public to view banners
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Banners'
  ) THEN
    CREATE POLICY "Public Access Banners" ON storage.objects
      FOR SELECT USING (bucket_id = 'banners');
  END IF;
END $$;

-- 2. Allow authenticated users to upload banners
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Users Upload Banners'
  ) THEN
    CREATE POLICY "Authenticated Users Upload Banners" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'banners' 
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 3. Allow owners to manage their own banners
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Owners Manage Banners'
  ) THEN
    CREATE POLICY "Owners Manage Banners" ON storage.objects
      FOR ALL USING (
        bucket_id = 'banners' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;
