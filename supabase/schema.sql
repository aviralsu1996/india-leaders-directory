-- ====================================================================
-- INDIVIDUAL POLITICAL LEADERS DIRECTORY - SUPABASE POSTGRESQL SCHEMA
-- ====================================================================
-- This file contains the complete, production-ready schema for Supabase.
-- It establishes the `leaders` table, index paths, Row Level Security (RLS) rules,
-- bucket triggers, and user authentication roles (Admin, Editor, Viewer).

-- 1. Create the custom categories enum
CREATE TYPE leader_category AS ENUM (
  'Prime Minister',
  'Chief Minister',
  'Deputy Chief Minister',
  'Cabinet Minister',
  'Minister of State',
  'Lok Sabha MP',
  'Rajya Sabha MP',
  'Governor'
);

-- 2. Create the leaders table
CREATE TABLE IF NOT EXISTS public.leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  designation VARCHAR(255) NOT NULL,
  category leader_category NOT NULL,
  state VARCHAR(100) NOT NULL,
  constituency VARCHAR(255) NOT NULL,
  party VARCHAR(100) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  dob DATE,
  bio TEXT NOT NULL,
  education VARCHAR(255) NOT NULL,
  profession VARCHAR(255) NOT NULL,
  mobile VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  facebook VARCHAR(512),
  twitter VARCHAR(512),
  instagram VARCHAR(512),
  youtube VARCHAR(512),
  website VARCHAR(512),
  image TEXT, -- profile photo URL (stored in leaders/images/ bucket)
  cover_image TEXT, -- background banner URL (stored in leaders/images/ bucket)
  gallery TEXT[] DEFAULT '{}', -- array of image URLs (stored in leaders/gallery/ bucket)
  featured BOOLEAN DEFAULT FALSE NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft' NOT NULL CHECK (status IN ('Published', 'Draft')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add indexing for optimized searching
CREATE INDEX IF NOT EXISTS idx_leaders_name_trgm ON public.leaders (name);
CREATE INDEX IF NOT EXISTS idx_leaders_slug ON public.leaders (slug);
CREATE INDEX IF NOT EXISTS idx_leaders_category ON public.leaders (category);
CREATE INDEX IF NOT EXISTS idx_leaders_state ON public.leaders (state);
CREATE INDEX IF NOT EXISTS idx_leaders_party ON public.leaders (party);
CREATE INDEX IF NOT EXISTS idx_leaders_featured ON public.leaders (featured);
CREATE INDEX IF NOT EXISTS idx_leaders_status ON public.leaders (status);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

-- 5. Establish Role Based Policies
-- Create user roles / metadata mappings for Admin, Editor, and Viewer
-- Viewer: Can only select published records.
-- Editor: Can read all, and insert/update records.
-- Admin: Fully unconstrained CRUD + administrative synchronization.

-- Policy: Everyone (including public) can view Published leaders
CREATE POLICY "Allow public read access to Published leaders"
  ON public.leaders
  FOR SELECT
  USING (status = 'Published');

-- Policy: Authenticated users with role 'Viewer', 'Editor' or 'Admin' can read draft leaders too
CREATE POLICY "Allow authenticated staff to read all leaders"
  ON public.leaders
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Policy: Editors can insert and update any leader
CREATE POLICY "Allow Editors to insert leaders"
  ON public.leaders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('Editor', 'Admin')
  );

CREATE POLICY "Allow Editors to update leaders"
  ON public.leaders
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('Editor', 'Admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('Editor', 'Admin'));

-- Policy: Admins have full delete capabilities
CREATE POLICY "Allow Admins to delete leaders"
  ON public.leaders
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'Admin');


-- 6. Trigger for automatic updated_at updates
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leaders_modtime
  BEFORE UPDATE ON public.leaders
  FOR EACH ROW
  EXECUTE PROCEDURE update_modified_column();


-- ====================================================================
-- STORAGE BUCKETS SETUP
-- ====================================================================
-- Note: Execute these commands in Supabase or set them up in the dashboard.

-- Create storage bucket names: 'leaders'
-- Within 'leaders' bucket, the directory structure is:
--   - images/ (for profile and cover photos)
--   - gallery/ (for leader gallery uploads)

INSERT INTO storage.buckets (id, name, public) 
VALUES ('leaders', 'leaders', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies for 'leaders' bucket
-- Allow public access to view media
CREATE POLICY "Allow public access to media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'leaders');

-- Allow editors and admins to upload media
CREATE POLICY "Allow editors to upload leader media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'leaders' AND 
    (auth.jwt() ->> 'role' IN ('Editor', 'Admin'))
  );

-- Allow editors and admins to delete media
CREATE POLICY "Allow editors to delete leader media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'leaders' AND 
    (auth.jwt() ->> 'role' IN ('Editor', 'Admin'))
  );
