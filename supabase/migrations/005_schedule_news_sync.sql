-- Migration: Automatic, scheduled news synchronization
--
-- Context: NewsService.syncLeaderNews() and the sync-news Edge Function both
-- existed already, but nothing ever invoked them automatically — the only
-- caller was a manual "Sync" button in the admin panel (one leader at a
-- time). With ~668 leaders, that means the `news` table stays empty unless
-- an admin manually syncs every leader. This migration schedules the
-- sync-news Edge Function to run automatically on a recurring basis using
-- pg_cron + pg_net, so news stays populated without manual intervention.
--
-- MANUAL STEP REQUIRED BEFORE THIS WILL WORK:
-- pg_net needs the target URL (this project's Edge Function endpoint) and a
-- service-role bearer token to authorize the call. Neither can be known or
-- safely hardcoded in a file committed to git, so this migration reads them
-- from database-level settings that you must configure once, from the
-- Supabase SQL Editor (see supabase/README_NEWS_CRON.md for the exact
-- commands with your project's values filled in):
--
--   ALTER DATABASE postgres SET app.settings.supabase_url = 'https://<project-ref>.supabase.co';
--   ALTER DATABASE postgres SET app.settings.service_role_key = '<service-role-key>';
--
-- Until those two settings are configured, the scheduled job will run but
-- the HTTP call will fail (logged in cron.job_run_details) — it will not
-- silently corrupt or duplicate data, since the target endpoint itself is
-- upsert-based (migration 004).

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove any prior schedule with the same name so this migration is re-runnable.
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'sync-leader-news-every-6h';

SELECT cron.schedule(
  'sync-leader-news-every-6h',
  '0 */6 * * *', -- every 6 hours
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/sync-news',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
