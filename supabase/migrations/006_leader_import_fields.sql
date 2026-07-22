-- Migration: Fields needed by the Official Leader Data Import pipeline
-- Safe: ADD COLUMN only — never modifies or deletes existing leader records

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS ministry VARCHAR(255),
  ADD COLUMN IF NOT EXISTS field_sources JSONB DEFAULT '{}'::jsonb NOT NULL;

CREATE INDEX IF NOT EXISTS idx_leaders_ministry ON public.leaders (ministry)
  WHERE ministry IS NOT NULL;

COMMENT ON COLUMN public.leaders.ministry IS 'Ministry/portfolio name, imported from official sources when designation alone does not capture it';
COMMENT ON COLUMN public.leaders.field_sources IS 'Per-field provenance map from the leader data import pipeline, e.g. {"bio": "Wikipedia Commons", "image": "Ministry Website"} — lets the admin dashboard show where each field came from without re-scraping';
