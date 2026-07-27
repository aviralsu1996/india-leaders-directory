import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, Play, CheckCircle2, AlertTriangle, XCircle, Terminal, 
  Database, MapPin, Users, Layers, Search, Trash2, RotateCcw, 
  Clock, Calendar, ShieldCheck, Check, Copy, Sparkles, Filter, 
  ArrowRight, Share2, Image as ImageIcon, CheckSquare, Square, Info
} from 'lucide-react';
import { mlaPipeline, ProgressState, FailedJob, CronLog } from '../../lib/mlaImportPipeline';
import { ALL_INDIA_MLAS } from '../../data/allIndiaMlaData';
import { STATE_DISTRICTS_MAP } from '../../data/districtData';

interface MlaSyncProps {
  onSyncComplete?: () => void;
}

export default function MlaSync({ onSyncComplete }: MlaSyncProps) {
  // Config & State Selection
  const [selectedState, setSelectedState] = useState<string>('all');
  const [constituencyQuery, setConstituencyQuery] = useState<string>('');
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);

  // Pipeline execution state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressState>({
    total: 0,
    processed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    percentage: 0,
    currentState: '',
    currentConstituency: '',
    status: 'idle'
  });

  // Log & Failed Jobs terminal views
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM READY] India MLA Import Pipeline initialized.',
    '[INFO] Select an import mode or cron schedule below to begin synchronization.'
  ]);
  const [logFilter, setLogFilter] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'terminal' | 'failed' | 'cron'>('terminal');

  // Failed jobs & Cron Logs state
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [cronLogs, setCronLogs] = useState<CronLog[]>([]);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  // Copy logs feedback
  const [copiedLogs, setCopiedLogs] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Load existing states & UTs list
  const allStates = Array.from(new Set(ALL_INDIA_MLAS.map(m => m.state))).sort();

  useEffect(() => {
    setFailedJobs(mlaPipeline.getFailedJobs());
    setCronLogs(mlaPipeline.getCronLogs());
  }, []);

  useEffect(() => {
    if (activeSubTab === 'terminal' && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeSubTab]);

  const addLogMessage = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  // Run Import Pipeline
  const handleStartImport = async (type: 'all' | 'single_state' | 'single_constituency' | 'images' | 'social') => {
    if (isProcessing) return;

    setIsProcessing(true);
    let stateFilter = 'all';
    let constituencyFilter = '';
    let syncImagesOnly = false;
    let syncSocialOnly = false;

    if (type === 'single_state') {
      if (selectedState === 'all') {
        alert('Please select a specific Indian State or UT to import.');
        setIsProcessing(false);
        return;
      }
      stateFilter = selectedState;
    } else if (type === 'single_constituency') {
      if (!constituencyQuery.trim()) {
        alert('Please enter a constituency or district name to import.');
        setIsProcessing(false);
        return;
      }
      constituencyFilter = constituencyQuery.trim();
    } else if (type === 'images') {
      syncImagesOnly = true;
    } else if (type === 'social') {
      syncSocialOnly = true;
    }

    addLogMessage(`Triggered pipeline action: ${type.toUpperCase()}`);

    const result = await mlaPipeline.executeImport(
      {
        stateFilter,
        constituencyFilter,
        updateExisting,
        syncImagesOnly,
        syncSocialOnly
      },
      (currentProgress) => {
        setProgress(currentProgress);
      },
      (logMsg) => {
        addLogMessage(logMsg);
      }
    );

    setIsProcessing(false);
    setFailedJobs(mlaPipeline.getFailedJobs());

    if (onSyncComplete) {
      onSyncComplete();
    }
  };

  // Retry failed job
  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    const success = await mlaPipeline.retryFailedJob(jobId);
    if (success) {
      addLogMessage(`[RETRY SUCCESS] Successfully re-imported failed MLA job.`);
    } else {
      addLogMessage(`[RETRY FAILED] Could not re-import job ID: ${jobId}`);
    }
    setFailedJobs(mlaPipeline.getFailedJobs());
    setRetryingJobId(null);
  };

  const handleClearFailedJobs = () => {
    mlaPipeline.clearFailedJobs();
    setFailedJobs([]);
    addLogMessage(`[ACTION] Cleared all failed job logs.`);
  };

  // Trigger Cron jobs
  const handleRunCron = async (type: 'Daily' | 'Weekly' | 'Monthly') => {
    addLogMessage(`[CRON RUN] Executing ${type} scheduled cron task...`);
    let logItem: CronLog;
    if (type === 'Daily') {
      logItem = await mlaPipeline.runDailyCron();
    } else if (type === 'Weekly') {
      logItem = await mlaPipeline.runWeeklyCron();
    } else {
      logItem = await mlaPipeline.runMonthlyCron();
    }
    setCronLogs(mlaPipeline.getCronLogs());
    addLogMessage(`[CRON SUCCESS] ${logItem.message}`);
  };

  const copyLogsToClipboard = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopiedLogs(true);
    setTimeout(() => setCopiedLogs(false), 2000);
  };

  const filteredLogs = logs.filter(l => 
    !logFilter || l.toLowerCase().includes(logFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn text-xs">
      
      {/* 1. Header Banner */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/90 via-teal-950/90 to-slate-950 rounded-3xl border border-emerald-500/20 relative overflow-hidden text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 text-[10px] font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pan-India MLA Automation Grid</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider font-display text-white">
            India MLA Import System
          </h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Automated sync pipeline for Members of Legislative Assemblies (MLAs) across all 28 States & UTs. Verified portrait uploads, state constituency indexing, and automated cron background sync.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => handleStartImport('all')}
            disabled={isProcessing}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl uppercase tracking-wider transition cursor-pointer shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2 text-xs"
          >
            <Play className={`w-4 h-4 fill-current ${isProcessing ? 'animate-spin' : ''}`} />
            <span>Sync All India MLAs</span>
          </button>
          
          <button
            onClick={() => handleStartImport('images')}
            disabled={isProcessing}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/10 transition cursor-pointer flex items-center gap-2 text-xs"
          >
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            <span>Sync Photos</span>
          </button>
        </div>
      </div>

      {/* 2. Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Import Controls & Filters */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Controls Card */}
          <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider font-mono">
                    Pipeline Controls
                  </h3>
                  <p className="text-[11px] text-slate-400">Target specific states, constituencies, or assets</p>
                </div>
              </div>

              {/* Preservation toggle */}
              <label 
                onClick={() => setUpdateExisting(!updateExisting)}
                className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition"
              >
                {updateExisting ? (
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                  Update Existing (Preserve Edits)
                </span>
              </label>
            </div>

            {/* Controls Actions Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Option A: Single State Import */}
              <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>Import Single State</span>
                </div>
                
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-slate-800 dark:text-white font-medium focus:outline-none"
                >
                  <option value="all">-- Select Indian State / UT --</option>
                  {allStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                <button
                  onClick={() => handleStartImport('single_state')}
                  disabled={isProcessing || selectedState === 'all'}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Sync {selectedState === 'all' ? 'State' : selectedState}</span>
                </button>
              </div>

              {/* Option B: Single Constituency Import */}
              <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                  <Search className="w-4 h-4 text-emerald-500" />
                  <span>Import Constituency / District</span>
                </div>

                <input
                  type="text"
                  placeholder="e.g. Gorakhpur / Nandigram / Baramati"
                  value={constituencyQuery}
                  onChange={(e) => setConstituencyQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-slate-800 dark:text-white font-medium focus:outline-none"
                />

                <button
                  onClick={() => handleStartImport('single_constituency')}
                  disabled={isProcessing || !constituencyQuery.trim()}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Sync Constituency</span>
                </button>
              </div>

            </div>

            {/* Quick asset enrichers */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Asset Enrichment Tools:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleStartImport('social')}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-[11px] transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-white/10"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Sync Social Links & Wiki</span>
                </button>
                <button
                  onClick={() => handleStartImport('images')}
                  disabled={isProcessing}
                  className="px-3.5 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-[11px] transition cursor-pointer flex items-center gap-1.5 border border-slate-200 dark:border-white/10"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Refresh Portrait Photos</span>
                </button>
              </div>
            </div>

          </div>

          {/* Progress Bar Card */}
          {(isProcessing || progress.total > 0) && (
            <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4 animate-scaleUp">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-emerald-500 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span className="font-mono font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                    Pipeline Execution Progress
                  </span>
                </div>
                <span className="font-mono font-black text-emerald-500 text-sm">
                  {progress.percentage}% Complete
                </span>
              </div>

              {/* Bar track */}
              <div className="w-full bg-slate-100 dark:bg-white/5 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-white/10">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              {/* Current state and constituency indicator */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-50 dark:bg-black/20 p-3 rounded-2xl border border-slate-150 dark:border-white/5 font-mono">
                <div>
                  <span className="text-slate-500 font-bold">Current Target: </span>
                  <span className="text-slate-800 dark:text-white font-bold">
                    {progress.currentConstituency || 'Ready'} ({progress.currentState || 'National Grid'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold">Processed: </span>
                  <span className="text-emerald-500 font-black">{progress.processed} / {progress.total} dossiers</span>
                </div>
              </div>

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <span className="block font-bold uppercase">Created</span>
                  <span className="text-base font-black mt-0.5 block">{progress.created}</span>
                </div>
                <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <span className="block font-bold uppercase">Updated</span>
                  <span className="text-base font-black mt-0.5 block">{progress.updated}</span>
                </div>
                <div className="p-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500">
                  <span className="block font-bold uppercase">Skipped</span>
                  <span className="text-base font-black mt-0.5 block">{progress.skipped}</span>
                </div>
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                  <span className="block font-bold uppercase">Failed</span>
                  <span className="text-base font-black mt-0.5 block">{progress.failed}</span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Cron Jobs Schedule Summary */}
        <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider font-mono">
                  Cron Schedules
                </h3>
                <p className="text-[11px] text-slate-400">Automated background sync intervals</p>
              </div>
            </div>

            {/* Schedule 1: Daily */}
            <div className="p-3.5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-slate-800 dark:text-white">Daily Cron</span>
                </div>
                <button
                  onClick={() => handleRunCron('Daily')}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold font-mono uppercase cursor-pointer transition"
                >
                  Run Now
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                Check resignations, by-elections, party changes & cabinet promotions.
              </p>
            </div>

            {/* Schedule 2: Weekly */}
            <div className="p-3.5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-bold text-slate-800 dark:text-white">Weekly Cron</span>
                </div>
                <button
                  onClick={() => handleRunCron('Weekly')}
                  className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold font-mono uppercase cursor-pointer transition"
                >
                  Run Now
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                Refresh verified portrait photos and social media links.
              </p>
            </div>

            {/* Schedule 3: Monthly */}
            <div className="p-3.5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="font-bold text-slate-800 dark:text-white">Monthly Cron</span>
                </div>
                <button
                  onClick={() => handleRunCron('Monthly')}
                  className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-bold font-mono uppercase cursor-pointer transition"
                >
                  Run Now
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                Full-scale India MLA synchronization across 28 states & UTs.
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-[10px] text-indigo-600 dark:text-indigo-300 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
            <span>Built-in idempotency guarantees zero duplicate leader records.</span>
          </div>
        </div>

      </div>

      {/* 3. Sub-tabs Navigation: Terminal Logs / Failed Jobs / Cron Logs */}
      <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-3xl p-6 shadow-sm space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('terminal')}
              className={`px-4 py-2 rounded-2xl font-bold font-mono text-xs uppercase tracking-wider cursor-pointer transition flex items-center gap-2 ${
                activeSubTab === 'terminal' 
                  ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>View Logs ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('failed')}
              className={`px-4 py-2 rounded-2xl font-bold font-mono text-xs uppercase tracking-wider cursor-pointer transition flex items-center gap-2 ${
                activeSubTab === 'failed' 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/30' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Failed Jobs ({failedJobs.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('cron')}
              className={`px-4 py-2 rounded-2xl font-bold font-mono text-xs uppercase tracking-wider cursor-pointer transition flex items-center gap-2 ${
                activeSubTab === 'cron' 
                  ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/30' 
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Cron History ({cronLogs.length})</span>
            </button>
          </div>

          {activeSubTab === 'terminal' && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filter logs..."
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl text-[11px] text-slate-800 dark:text-white focus:outline-none font-mono"
              />
              <button
                onClick={copyLogsToClipboard}
                className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition cursor-pointer text-[10px] font-mono flex items-center gap-1"
                title="Copy Terminal Logs"
              >
                {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {activeSubTab === 'failed' && failedJobs.length > 0 && (
            <button
              onClick={handleClearFailedJobs}
              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl text-[10px] font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Failed Jobs</span>
            </button>
          )}

        </div>

        {/* Tab Content A: Real-time Terminal Window */}
        {activeSubTab === 'terminal' && (
          <div className="bg-slate-950 rounded-2xl border border-slate-850 p-4 font-mono text-[11px] text-slate-300 max-h-[320px] overflow-y-auto space-y-1.5 shadow-inner leading-relaxed">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-600 font-mono">No matching log messages found.</div>
            ) : (
              filteredLogs.map((logLine, idx) => {
                let colorClass = 'text-slate-300';
                if (logLine.includes('[ERROR]')) colorClass = 'text-red-400 font-bold';
                else if (logLine.includes('[SUCCESS]') || logLine.includes('[CREATE]')) colorClass = 'text-emerald-400 font-bold';
                else if (logLine.includes('[UPDATE]') || logLine.includes('[CRON]')) colorClass = 'text-indigo-300';
                else if (logLine.includes('[SKIP]')) colorClass = 'text-slate-500';
                else if (logLine.includes('[WARN]')) colorClass = 'text-amber-400';

                return (
                  <div key={idx} className={`${colorClass} whitespace-pre-wrap font-mono`}>
                    {logLine}
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        )}

        {/* Tab Content B: Failed Jobs Table */}
        {activeSubTab === 'failed' && (
          <div className="space-y-3">
            {failedJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-200">Zero Failed Jobs!</p>
                <p className="text-[11px] text-slate-400">All MLA dossiers imported cleanly without write errors.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-mono text-slate-400 uppercase">
                      <th className="p-2.5">Candidate Name</th>
                      <th className="p-2.5">State & Constituency</th>
                      <th className="p-2.5">Failure Reason</th>
                      <th className="p-2.5">Time</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[11px]">
                    {failedJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-white/1">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-white">{job.leaderName}</td>
                        <td className="p-2.5 text-slate-400">{job.constituency}, {job.state}</td>
                        <td className="p-2.5 text-red-500 font-bold">{job.reason}</td>
                        <td className="p-2.5 text-slate-500 text-[10px]">{job.timestamp}</td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            disabled={retryingJobId === job.id}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold cursor-pointer transition flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className={`w-3 h-3 ${retryingJobId === job.id ? 'animate-spin' : ''}`} />
                            <span>Retry Job</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab Content C: Cron History Logs */}
        {activeSubTab === 'cron' && (
          <div className="space-y-3 font-mono">
            {cronLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-1">
                <Clock className="w-8 h-8 text-indigo-400 mx-auto" />
                <p className="font-bold text-slate-700 dark:text-slate-200">No Cron Execution Logs Yet</p>
                <p className="text-[11px] text-slate-400">Trigger any schedule above to log automated background activity.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cronLogs.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-md text-[9px] font-bold uppercase">
                          {item.jobType} Cron
                        </span>
                        <span className="text-slate-800 dark:text-white font-bold text-xs">{item.message}</span>
                      </div>
                      {item.details && (
                        <p className="text-[10px] text-slate-400 mt-1">{item.details}</p>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 shrink-0">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
