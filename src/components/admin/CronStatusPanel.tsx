import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { cronStatusRepository, CronJobStatus } from '../../services/audit/CronStatusRepository';

export default function CronStatusPanel() {
  const [jobs, setJobs] = useState<CronJobStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { jobs, error } = await cronStatusRepository.getJobStatuses();
    setJobs(jobs);
    if (error) setError(error);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span>Scheduled Job Status</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Read-only view of pg_cron schedules (e.g. the automatic news sync every 6 hours). Requires
            migration 007 (get_cron_job_status RPC) to be applied.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex gap-3 items-start">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {!error && jobs.length === 0 && !loading && (
        <div className="py-16 text-center text-slate-400 text-xs">
          No scheduled jobs found. Apply migration 005 (news sync schedule) and confirm the
          `app.settings.supabase_url`/`app.settings.service_role_key` DB settings are configured.
        </div>
      )}

      {jobs.length > 0 && (
        <div className="border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#020504]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/1 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-100 dark:border-white/5">
              <tr>
                <th className="p-3.5">Job</th>
                <th className="p-3.5">Schedule</th>
                <th className="p-3.5">Active</th>
                <th className="p-3.5">Last Run</th>
                <th className="p-3.5">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {jobs.map((job) => (
                <tr key={job.jobname}>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{job.jobname}</td>
                  <td className="p-3.5 font-mono text-slate-500">{job.schedule}</td>
                  <td className="p-3.5">
                    {job.active ? (
                      <span className="text-emerald-500 font-bold">Active</span>
                    ) : (
                      <span className="text-slate-400">Paused</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {job.last_run_start ? new Date(job.last_run_start).toLocaleString() : 'Never run'}
                  </td>
                  <td className="p-3.5">
                    {job.last_run_status === 'succeeded' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </span>
                    ) : job.last_run_status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 text-red-500 font-bold" title={job.last_run_message || ''}>
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </span>
                    ) : (
                      <span className="text-slate-400">{job.last_run_status || '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
