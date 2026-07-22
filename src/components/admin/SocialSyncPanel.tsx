import React, { useState, useEffect } from 'react';
import { Share2, Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { dbService } from '../../lib/supabaseClient';
import { socialSyncService, SocialAuditSummary } from '../../services/social';
import { SupabaseLeader } from '../../types';

export default function SocialSyncPanel() {
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [summary, setSummary] = useState<SocialAuditSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setLeaders(await dbService.getLeaders());
      } catch (err) {
        console.error('Failed to load leaders for social audit:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const runAudit = async () => {
    setAuditing(true);
    setErrorMsg(null);
    try {
      setSummary(await socialSyncService.runAudit(leaders));
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to run social link audit.');
    } finally {
      setAuditing(false);
    }
  };

  const invalidResults = summary?.results.filter((r) => r.links.some((l) => l.url && !l.verified)) || [];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 dark:border-white/5 pb-5">
        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Share2 className="w-5 h-5 text-indigo-500" />
          <span>Social Link Audit</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Validates format of every leader's Twitter/X, Facebook, Instagram, and YouTube links on file —
          never invents a link that isn't already there. To fill a genuinely missing link from a verified
          source, use Leader Sync.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl h-36 flex flex-col justify-between shadow-sm">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Leaders checked</p>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white">{summary?.totalChecked ?? leaders.length}</h3>
          <button
            onClick={runAudit}
            disabled={auditing || loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:text-slate-400 text-white font-black text-[10px] rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {auditing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Run Social Audit</span>
              </>
            )}
          </button>
        </div>

        <div className="p-5 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl h-36 flex flex-col justify-between shadow-sm">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Invalid links found</p>
          <h3 className="text-3xl font-black text-red-500">{summary?.leadersWithInvalidLinks ?? '—'}</h3>
        </div>

        <div className="p-5 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl h-36 flex flex-col justify-between shadow-sm">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">No verified social presence</p>
          <h3 className="text-3xl font-black text-amber-500">{summary?.leadersMissingAllSocial ?? '—'}</h3>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex gap-3 items-start">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <p>{errorMsg}</p>
        </div>
      )}

      {summary && invalidResults.length === 0 && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex gap-3 items-start">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <p>No invalid social links found.</p>
        </div>
      )}

      {invalidResults.length > 0 && (
        <div className="border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#020504]">
          <div className="p-3.5 bg-slate-50 dark:bg-white/1 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Leaders With Invalid Links</h3>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {invalidResults.map((r) => (
              <div key={r.leaderId} className="p-3.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">{r.leaderName}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {r.links
                    .filter((l) => l.url && !l.verified)
                    .map((l) => (
                      <span
                        key={l.platform}
                        className="px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-mono font-bold rounded"
                        title={l.url}
                      >
                        {l.platform}: {l.reason}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
