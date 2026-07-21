-- Migration: Add verification and image pipeline fields to leaders table
-- Safe: ADD COLUMN only — never modifies or deletes existing leader records

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS linkedin VARCHAR(512),
  ADD COLUMN IF NOT EXISTS wikipedia_url VARCHAR(512),
  ADD COLUMN IF NOT EXISTS official_profile_url VARCHAR(512),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS last_verified TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS image_source VARCHAR(255),
  ADD COLUMN IF NOT EXISTS image_hash VARCHAR(64),
  ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'pending'
    CHECK (sync_status IN ('pending', 'synced', 'failed', 'skipped'));

-- Indexes for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_leaders_verified ON public.leaders (verified);
CREATE INDEX IF NOT EXISTS idx_leaders_sync_status ON public.leaders (sync_status);
CREATE INDEX IF NOT EXISTS idx_leaders_image_hash ON public.leaders (image_hash)
  WHERE image_hash IS NOT NULL;

COMMENT ON COLUMN public.leaders.linkedin IS 'Verified LinkedIn profile URL';
COMMENT ON COLUMN public.leaders.wikipedia_url IS 'Verified Wikipedia page URL';
COMMENT ON COLUMN public.leaders.official_profile_url IS 'Official government profile URL';
COMMENT ON COLUMN public.leaders.verified IS 'Whether leader profile has been verified against official sources';
COMMENT ON COLUMN public.leaders.last_verified IS 'Timestamp of last verification run';
COMMENT ON COLUMN public.leaders.image_source IS 'Origin of profile image (wikipedia, lok_sabha, pmo, upload, etc.)';
COMMENT ON COLUMN public.leaders.image_hash IS 'SHA-256 hash of profile image for deduplication';
COMMENT ON COLUMN public.leaders.sync_status IS 'Pipeline sync state: pending, synced, failed, skipped';
