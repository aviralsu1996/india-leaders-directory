-- Migration: Enforce no-duplicate-news at the database level
--
-- Context: news rows were being written via a check-then-insert pattern
-- (query for an existing title, then insert if none found), which is not
-- race-safe — two concurrent sync runs can both pass the check and insert
-- the same article twice. This migration adds a real uniqueness
-- constraint per (leader_slug, title) so the application can safely use
-- an upsert (INSERT ... ON CONFLICT DO NOTHING) instead.
--
-- IMPORTANT — review before running against production:
-- The DELETE below removes existing duplicate rows (same leader_slug +
-- title), keeping only the oldest copy of each. This is a data change,
-- not just a schema change. Run it only after confirming you want
-- duplicate news rows cleaned up; a unique index cannot be created while
-- duplicates exist.

-- 1. Remove duplicate news rows, keeping the earliest (oldest created_at) copy.
DELETE FROM public.news a
USING public.news b
WHERE a.leader_slug = b.leader_slug
  AND a.title = b.title
  AND (a.created_at > b.created_at OR (a.created_at = b.created_at AND a.id > b.id));

-- 2. Enforce uniqueness going forward.
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_leader_slug_title_unique
  ON public.news (leader_slug, title);
