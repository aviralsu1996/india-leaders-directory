/**
 * CronStatusRepository — reads pg_cron job status via the get_cron_job_status()
 * RPC (migration 007). Read-only; this service can never modify a cron schedule.
 */
import { getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';

export interface CronJobStatus {
  jobname: string;
  schedule: string;
  active: boolean;
  last_run_start: string | null;
  last_run_status: string | null;
  last_run_message: string | null;
}

export class CronStatusRepository {
  async getJobStatuses(): Promise<{ jobs: CronJobStatus[]; error?: string }> {
    if (!isSupabaseConfigured) return { jobs: [], error: 'Supabase is not configured.' };
    const sb = getSupabase();
    if (!sb) return { jobs: [], error: 'Supabase client unavailable.' };

    const { data, error } = await sb.rpc('get_cron_job_status');
    if (error) {
      return { jobs: [], error: error.message };
    }
    return { jobs: (data || []) as CronJobStatus[] };
  }
}

export const cronStatusRepository = new CronStatusRepository();
