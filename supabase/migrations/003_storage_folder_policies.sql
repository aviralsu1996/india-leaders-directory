-- Migration: Storage folder structure for leaders bucket
-- Folder layout:
--   leaders/profile/   — profile photos
--   leaders/covers/    — cover banners
--   leaders/gallery/   — gallery images

-- Ensure bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('leaders', 'leaders', true)
ON CONFLICT (id) DO NOTHING;

-- Update policies to allow subfolder uploads (profile, covers, gallery)
DROP POLICY IF EXISTS "Allow editors to upload leader media" ON storage.objects;
CREATE POLICY "Allow editors to upload leader media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'leaders' AND
    (auth.jwt() ->> 'role' IN ('Editor', 'Admin'))
  );

DROP POLICY IF EXISTS "Allow editors to delete leader media" ON storage.objects;
CREATE POLICY "Allow editors to delete leader media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'leaders' AND
    (auth.jwt() ->> 'role' IN ('Editor', 'Admin'))
  );

-- Allow authenticated staff to update (replace) media
CREATE POLICY "Allow editors to update leader media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'leaders' AND
    (auth.jwt() ->> 'role' IN ('Editor', 'Admin'))
  )
  WITH CHECK (
    bucket_id = 'leaders' AND
    (auth.jwt() ->> 'role' IN ('Editor', 'Admin'))
  );
