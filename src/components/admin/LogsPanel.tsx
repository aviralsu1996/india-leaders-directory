import React, { useState, useEffect } from 'react';
import { FileText, RefreshCw, AlertTriangle } from 'lucide-react';
import { auditLogRepository, AuditLogEntry } from '../../services/audit/AuditLogRepository';

const STATUS_BADGE: Record<AuditLogEntry['status'], string> = {
  success: 'bg-emerald-500/10 text-emerald-500',
  error: 'bg-red-500/10 text-red-500',
  warning: 'bg-amber-500/10 text-amber-500',
  info: 'bg-indigo-500/10 text-indigo-500',
};

interface LogsPanelProps {
  /** 'failed' shows only status=error entries (the "Failed Jobs" sidebar view); 'all' shows everything. */
  mode?: 'all' | 'failed';
}

export default function LogsPanel({ mode = 'all' }: LogsPanelProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionFilter, setActionFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    try {
      const entries =
        mode === 'failed'
          ? await auditLogRepository.getFailedJobs(200)
          : await auditLogRepository.getRecent({ limit: 200 });
      setLogs(entries);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const actions = Array.from(new Set(logs.map((l) => l.action))).sort();
  const filtered = actionFilter === 'all' ? logs : logs.filter((l) => l.action === actionFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            {mode === 'failed' ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <FileText className="w-5 h-5 text-indigo-500" />
            )}
            <span>{mode === 'failed' ? 'Failed Jobs' : 'Automation Logs'}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'failed'
              ? 'Every audit_logs entry with status=error, across leader import, image download, and news sync.'
              : 'Full audit trail of every automated write (leader import, image download, social audit) — every change is logged.'}
          </p>
        </div>
        <button
          onClick={load}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {mode === 'all' && actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActionFilter('all')}
            className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase font-mono transition ${actionFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}
          >
            All
          </button>
          {actions.map((action) => (
            <button
              key={action}
              onClick={() => setActionFilter(action)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase font-mono transition ${actionFilter === action ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-500'}`}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#020504]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            {mode === 'failed' ? 'No failed jobs. 🎉' : 'No log entries yet.'}
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {filtered.map((log) => (
              <div key={log.id} className="p-3.5 text-xs flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${STATUS_BADGE[log.status]}`}>
                      {log.status}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{log.action}</span>
                    {log.leader_slug && (
                      <span className="text-[10px] font-mono text-slate-400">· {log.leader_slug}</span>
                    )}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300">{log.message}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
