import React, { useState, useEffect } from 'react';
import { ListChecks, RefreshCw, Play, AlertCircle } from 'lucide-react';
import { syncQueueRepository, SyncQueueEntry } from '../../services/audit/SyncQueueRepository';
import { dbService } from '../../lib/supabaseClient';
import { imageDownloadPipeline } from '../../services/image';
import { SupabaseLeader } from '../../types';

const STATUS_COLORS: Record<SyncQueueEntry['status'], string> = {
  queued: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
  processing: 'bg-indigo-500/10 text-indigo-500',
  completed: 'bg-emerald-500/10 text-emerald-500',
  failed: 'bg-red-500/10 text-red-500',
  cancelled: 'bg-slate-100 text-slate-400 dark:bg-white/5',
};

export default function SyncQueuePanel() {
  const [items, setItems] = useState<SyncQueueEntry[]>([]);
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [retryingAll, setRetryingAll] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [queueItems, allLeaders] = await Promise.all([syncQueueRepository.getAll(), dbService.getLeaders()]);
      setItems(queueItems);
      setLeaders(allLeaders);
    } catch (err) {
      console.error('Failed to load sync queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRetry = async (item: SyncQueueEntry) => {
    if (!item.id) return;
    setErrorMsg(null);
    try {
      await syncQueueRepository.retry(item.id);
      if (item.provider === 'image_download') {
        await imageDownloadPipeline.retryQueuedDownloads(leaders);
      }
      await load();
    } catch (err) {
      console.error(err);
      setErrorMsg(`Failed to retry job for ${item.leader_slug}.`);
    }
  };

  const handleRetryAllImageJobs = async () => {
    setRetryingAll(true);
    setErrorMsg(null);
    try {
      await imageDownloadPipeline.retryQueuedDownloads(leaders);
      await load();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to retry queued image jobs.');
    } finally {
      setRetryingAll(false);
    }
  };

  const failedCount = items.filter((i) => i.status === 'failed').length;
  const queuedCount = items.filter((i) => i.status === 'queued').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-indigo-500" />
            <span>Sync Queue</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Retry-able background jobs (currently: image downloads that failed on first attempt).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRetryAllImageJobs}
            disabled={retryingAll || queuedCount === 0}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:text-slate-400 text-white font-black text-[10px] rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Retry All Queued ({queuedCount})</span>
          </button>
          <button
            onClick={load}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex gap-3 items-start">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="p-5 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Queued</p>
          <h3 className="text-2xl font-black text-slate-800 dark:text-white">{queuedCount}</h3>
        </div>
        <div className="p-5 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Failed</p>
          <h3 className="text-2xl font-black text-red-500">{failedCount}</h3>
        </div>
      </div>

      <div className="border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#020504]">
        {items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">Queue is empty.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/1 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider border-b border-slate-100 dark:border-white/5">
              <tr>
                <th className="p-3.5">Leader</th>
                <th className="p-3.5">Provider</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Attempts</th>
                <th className="p-3.5">Last Error</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {items.map((item) => (
                <tr key={item.id || item.leader_slug}>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{item.leader_slug}</td>
                  <td className="p-3.5 font-mono text-slate-500">{item.provider}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-500">{item.attempts ?? 0} / {item.max_attempts ?? 3}</td>
                  <td className="p-3.5 text-slate-500 max-w-xs truncate" title={item.last_error || ''}>
                    {item.last_error || '—'}
                  </td>
                  <td className="p-3.5 text-right">
                    {item.status === 'failed' && (
                      <button
                        onClick={() => handleRetry(item)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
