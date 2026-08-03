-- Migration: Add MLA enum value and district field for UP MLA import support

ALTER TYPE IF EXISTS leader_category ADD VALUE IF NOT EXISTS 'MLA';

ALTER TABLE public.leaders
  ADD COLUMN IF NOT EXISTS district VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_leaders_district ON public.leaders (district);
