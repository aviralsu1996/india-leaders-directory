import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { dbService } from '../../lib/supabaseClient';
import { leaderDataImportService, LeaderImportCandidate } from '../../services/leaders';
import { auditLogRepository, AuditLogEntry } from '../../services/audit/AuditLogRepository';
import { SupabaseLeader } from '../../types';

const IMPORTABLE_FIELDS: Array<keyof SupabaseLeader> = [
  'designation', 'ministry', 'constituency', 'state', 'party', 'bio',
  'image', 'cover_image', 'website', 'email', 'twitter', 'facebook', 'instagram', 'youtube',
];

function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

interface LeaderSyncPanelProps {
  onSyncComplete: () => void;
}

export default function LeaderSyncPanel({ onSyncComplete }: LeaderSyncPanelProps) {
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fieldsFound: 0 });
  const [lastCandidates, setLastCandidates] = useState<LeaderImportCandidate[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await dbService.getLeaders();
      setLeaders(data);
      setLogs(await auditLogRepository.getRecent({ action: 'leader_import', limit: 50 }));
    } catch (err) {
      console.error('Failed to load leaders for sync:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const missingCount = leaders.filter((l) => IMPORTABLE_FIELDS.some((f) => isEmpty(l[f]))).length;

  const handleScanAndImport = async () => {
    if (scanning) return;
    setScanning(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLastCandidates([]);

    try {
      const candidates = await leaderDataImportService.scanForMissingDataCandidates(
        leaders,
        (current, total, fieldsFound) => setProgress({ current, total, fieldsFound })
      );
      setLastCandidates(candidates);

      let totalFieldsApplied = 0;
      for (const candidate of candidates) {
        const outcome = await leaderDataImportService.applyLeaderImport(candidate);
        totalFieldsApplied += outcome.fieldsApplied;
      }

      await load();
      onSyncComplete();
      setSuccessMsg(
        candidates.length === 0
          ? 'No missing fields could be matched against any official source or Wikipedia this run.'
          : `Imported ${totalFieldsApplied} field(s) across ${candidates.length} leader(s) from verified sources.`
      );
    } catch (err) {
      console.error(err);
      setErrorMsg('An error occurred during the leader data import scan.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <span>Official Leader Data Import</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fills only currently-empty fields from Lok Sabha → Rajya Sabha → PMO → Cabinet Secretariat →
            Ministry → State Government → Election Commission → Wikipedia Commons (fallback only). Never
            overwrites a populated field.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl flex flex-col justify-between h-36 shadow-sm">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Leaders with missing fields</p>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{missingCount}</h3>
          </div>
          <button
            onClick={handleScanAndImport}
            disabled={scanning || missingCount === 0}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:text-slate-400 text-white font-black text-[10px] rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            {scanning ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Scanning {progress.current}/{progress.total}...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Scan &amp; Import Missing Data</span>
              </>
            )}
          </button>
        </div>

        <div className="p-5 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl flex flex-col justify-between h-36 shadow-sm">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Total leaders</p>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{leaders.length}</h3>
          <p className="text-[10px] text-slate-500">Loaded from Supabase</p>
        </div>

        <div className="p-5 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl flex flex-col justify-between h-36 shadow-sm">
          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Last run</p>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white mt-1">{lastCandidates.length}</h3>
          <p className="text-[10px] text-slate-500">Leader(s) updated last scan</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs flex gap-3 items-start">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs flex gap-3 items-start">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <p className="font-medium leading-relaxed">{successMsg}</p>
        </div>
      )}

      {lastCandidates.length > 0 && (
        <div className="border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#020504]">
          <div className="p-3.5 bg-slate-50 dark:bg-white/1 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Fields Imported This Run</h3>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5 text-xs">
            {lastCandidates.map((c) => (
              <div key={c.leaderId} className="p-3.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">{c.leaderName}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {c.updates.map((u) => (
                    <span
                      key={u.field}
                      className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-bold rounded"
                      title={u.newValue}
                    >
                      {u.field} ← {u.source}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>Recent Leader Import Log</span>
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No import activity logged yet.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-2.5 bg-slate-50 dark:bg-[#020504] border border-slate-100 dark:border-white/5 rounded-lg text-[10.5px]">
                <p className="text-slate-700 dark:text-slate-300">{log.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
