-- Migration: Read-only RPC exposing pg_cron job status to the admin dashboard
--
-- cron.job / cron.job_run_details live in the `cron` schema, which PostgREST
-- does not expose directly, and RLS policies (as used on public.* tables)
-- don't apply to it either. A SECURITY DEFINER function in the public schema
-- is the standard, safe way to expose a narrow read-only view of it: it can
-- only ever SELECT, never INSERT/UPDATE/DELETE, and only returns the columns
-- listed below.

CREATE OR REPLACE FUNCTION public.get_cron_job_status()
RETURNS TABLE (
  jobname TEXT,
  schedule TEXT,
  active BOOLEAN,
  last_run_start TIMESTAMPTZ,
  last_run_status TEXT,
  last_run_message TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    j.jobname,
    j.schedule,
    j.active,
    d.start_time,
    d.status,
    d.return_message
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT start_time, status, return_message
    FROM cron.job_run_details AS r
    WHERE r.jobid = j.jobid
    ORDER BY start_time DESC
    LIMIT 1
  ) d ON true;
$$;

-- Read-only and narrow enough to be safe for both anon and authenticated
-- callers (this app's admin panel does not use real Supabase Auth sessions,
-- so anon access is required for the Cron Status dashboard tab to work).
GRANT EXECUTE ON FUNCTION public.get_cron_job_status() TO anon, authenticated;
