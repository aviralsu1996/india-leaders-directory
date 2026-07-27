import React, { useState, useEffect } from 'react';
import { ElectionRecord, ELECTION_NOTIFICATIONS_DATA } from '../../data/electionsData';
import { electionsDbService } from '../../lib/electionsDbService';
import { ElectionSyncResult } from '../../lib/electionSyncService';
import UpcomingElectionsTab from './UpcomingElectionsTab';
import OngoingElectionsTab from './OngoingElectionsTab';
import CompletedElectionsTab from './CompletedElectionsTab';
import ElectionCalendarTab from './ElectionCalendarTab';
import InteractiveElectionMap from './InteractiveElectionMap';
import ElectionAnalytics from './ElectionAnalytics';
import ElectionNotificationsTab from './ElectionNotificationsTab';
import ElectionResultsTab from './ElectionResultsTab';
import UpcomingElectionCountdown from './UpcomingElectionCountdown';
import {
  Vote,
  Calendar,
  Radio,
  Award,
  Bell,
  MapPin,
  PieChart,
  ShieldCheck,
  Search,
  ExternalLink,
  Info,
  CheckCircle2,
  FileText,
  RefreshCw,
  Terminal,
  Database,
  Globe
} from 'lucide-react';

interface ElectionsDashboardProps {
  onSelectElection?: (slug: string) => void;
}

export default function ElectionsDashboard({ onSelectElection }: ElectionsDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const [elections, setElections] = useState<ElectionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<ElectionSyncResult | null>(null);
  const [showSyncLogs, setShowSyncLogs] = useState<boolean>(false);

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    setLoading(true);
    try {
      const data = await electionsDbService.getElections();
      setElections(data);
    } catch (e) {
      console.warn('Error loading elections data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    try {
      const res = await electionsDbService.syncNow();
      setSyncResult(res);
      setShowSyncLogs(true);
      await loadElections();
    } catch (e) {
      console.error('Election sync trigger error:', e);
    } finally {
      setSyncing(false);
    }
  };

  // Metric counts
  const upcomingCount = elections.filter(e => e.status === 'Tentative' || e.status === 'Official Schedule' || e.status === 'Official').length;
  const ongoingCount = elections.filter(e => e.status === 'Ongoing' || e.status === 'Polling').length;
  const completedCount = elections.filter(e => e.status === 'Completed').length;
  const notifCount = ELECTION_NOTIFICATIONS_DATA.length;

  const handleSelectSlug = (slug: string) => {
    if (onSelectElection) {
      onSelectElection(slug);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-in fade-in duration-300">
      {/* Hero Title & Subtitle */}
      <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-8 shadow-sm space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-200/50">
              Election Intelligence Unit
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 font-bold text-xs uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> ECI & BoomLive Synced
            </span>
          </div>

          <button
            onClick={handleTriggerSync}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing with ECI & BoomLive...' : 'Trigger Election Sync'}
          </button>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
            India Election Intelligence & Democratic Calendar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Real-time tracking of Assembly, Parliamentary, and Municipal elections across India. Constitutional timeline schedules, official gazette notifications, live poll turnouts, and historic democratic results.
          </p>
        </div>

        {/* Sync Status / Logs Panel toggle */}
        {showSyncLogs && syncResult && (
          <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 text-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-extrabold text-emerald-400 flex items-center gap-1.5">
                <Database className="w-4 h-4" /> Election Sync Engine Run Complete
              </span>
              <button
                onClick={() => setShowSyncLogs(false)}
                className="text-slate-400 hover:text-white text-[11px] font-bold"
              >
                Close Log Window
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
              <p>⚡ Records Synced: <strong className="text-white">{syncResult.syncedCount}</strong></p>
              <p>🕒 Last Synced: <strong className="text-white">{new Date(syncResult.lastSyncedAt).toLocaleTimeString()}</strong></p>
              <p>🌐 Sources: <strong className="text-emerald-400">ECI, BoomLive & CEOs</strong></p>
            </div>

            <div className="bg-black/50 p-3 rounded-xl font-mono text-[10px] space-y-1 max-h-36 overflow-y-auto border border-white/5">
              {syncResult.logs.map((log, idx) => (
                <p key={idx} className={log.includes('WARN') ? 'text-amber-400' : log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {log}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* KPI Metric Cards Top Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Upcoming Polls</span>
              <Calendar className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {upcomingCount}
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
              Assembly & Lok Sabha
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ongoing')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'ongoing'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Ongoing Polls</span>
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {ongoingCount}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
              Active Polling / Phase
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Completed This Cycle</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {completedCount}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
              Declared Results
            </span>
          </button>

          <button
            onClick={() => setActiveTab('notifs')}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeTab === 'notifs'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500'
                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">ECI Announcements</span>
              <Bell className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {notifCount}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 block mt-0.5">
              Press Notes & Code of Conduct
            </span>
          </button>
        </div>
      </div>

      {/* Real-time Election Countdown Widget */}
      <UpcomingElectionCountdown elections={elections} onSelectElection={handleSelectSlug} />

      {/* Navigation Tab Bar */}
      <div className="bg-white dark:bg-[#080d0b] p-2 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Calendar className="w-4 h-4" /> Upcoming Elections
        </button>

        <button
          onClick={() => setActiveTab('ongoing')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'ongoing'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Radio className="w-4 h-4" /> Ongoing Polls
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Award className="w-4 h-4" /> Completed Polls
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Vote className="w-4 h-4" /> Election Calendar
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'map'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <MapPin className="w-4 h-4" /> State Map Dossier
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <PieChart className="w-4 h-4" /> Election Analytics
        </button>

        <button
          onClick={() => setActiveTab('notifs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'notifs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <Bell className="w-4 h-4" /> ECI Announcements
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'results'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" /> Results Archive
        </button>
      </div>

      {/* Main Tab Content Display */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">Synchronizing Democratic Registries...</p>
        </div>
      ) : (
        <>
          {activeTab === 'upcoming' && (
            <UpcomingElectionsTab
              elections={elections}
              onSelectElection={handleSelectSlug}
            />
          )}

          {activeTab === 'ongoing' && (
            <OngoingElectionsTab
              elections={elections}
              onSelectElection={handleSelectSlug}
            />
          )}

          {activeTab === 'completed' && (
            <CompletedElectionsTab
              elections={elections}
              onSelectElection={handleSelectSlug}
            />
          )}

          {activeTab === 'calendar' && (
            <ElectionCalendarTab
              elections={elections}
              onSelectElection={handleSelectSlug}
            />
          )}

          {activeTab === 'map' && <InteractiveElectionMap />}

          {activeTab === 'analytics' && <ElectionAnalytics elections={elections} />}

          {activeTab === 'notifs' && <ElectionNotificationsTab />}

          {activeTab === 'results' && (
            <ElectionResultsTab
              elections={elections}
              onSelectElection={handleSelectSlug}
            />
          )}
        </>
      )}

      {/* Footer ECI Attribution & Verification Note */}
      <div className="bg-slate-900 text-slate-300 p-6 rounded-3xl space-y-3 text-xs border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-extrabold text-white text-sm">Official ECI Data Attribution</span>
          </div>

          <a
            href="https://eci.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline font-bold flex items-center gap-1"
          >
            Election Commission of India (eci.gov.in) <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-slate-400 leading-relaxed text-[11px]">
          Election schedules, candidate registries, constituency maps, and statistical records are cross-referenced with official public notifications published by the Election Commission of India (ECI) and State Chief Electoral Officer (CEO) Portals.
        </p>
      </div>
    </div>
  );
}
