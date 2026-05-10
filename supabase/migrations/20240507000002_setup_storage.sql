-- Ensure 'logos' bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for 'logos' bucket
-- 1. Allow public to view logos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Logos'
  ) THEN
    CREATE POLICY "Public Access Logos" ON storage.objects
      FOR SELECT USING (bucket_id = 'logos');
  END IF;
END $$;

-- 2. Allow authenticated users to upload logos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated Users Upload Logos'
  ) THEN
    CREATE POLICY "Authenticated Users Upload Logos" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'logos' 
        AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- 3. Allow owners to manage their own logos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Owners Manage Logos'
  ) THEN
    CREATE POLICY "Owners Manage Logos" ON storage.objects
      FOR ALL USING (
        bucket_id = 'logos' 
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;
