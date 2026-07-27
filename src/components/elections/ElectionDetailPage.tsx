import React, { useEffect, useState } from 'react';
import { ElectionRecord, DISCLAIMER_TEXT } from '../../data/electionsData';
import { electionsDbService } from '../../lib/electionsDbService';
import {
  ArrowLeft,
  Calendar,
  Building,
  User,
  ShieldCheck,
  ExternalLink,
  Info,
  Clock,
  Award,
  Share2,
  CheckCircle2,
  Check
} from 'lucide-react';

interface ElectionDetailPageProps {
  slug: string;
  onBack: () => void;
}

export default function ElectionDetailPage({ slug, onBack }: ElectionDetailPageProps) {
  const [election, setElection] = useState<ElectionRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    loadData();
    window.scrollTo(0, 0);
  }, [slug]);

  const loadData = async () => {
    setLoading(true);
    try {
      const record = await electionsDbService.getElectionBySlug(slug);
      setElection(record);
    } catch (e) {
      console.warn('Error loading election:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: election?.title || 'Election Intelligence',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-bold">Loading Gazetted Election Dossier...</p>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Election Record Not Found</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Elections Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left animate-in fade-in duration-300">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Elections Dashboard
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white font-bold text-xs cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Link Copied' : 'Share Dossier'}
        </button>
      </div>

      {/* Hero Banner Header */}
      <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase border border-emerald-200/50">
            {election.type} • {election.state}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 ${
              election.status === 'Official'
                ? 'bg-blue-600 text-white'
                : election.status === 'Completed'
                ? 'bg-slate-800 text-white'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Status: {election.status}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 leading-tight">
            {election.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
            {election.description}
          </p>
        </div>

        {/* ECI Disclaimer Banner */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl flex items-start gap-3 text-amber-800 dark:text-amber-200 text-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Official ECI Schedule Notice</p>
            <p>{DISCLAIMER_TEXT}</p>
          </div>
        </div>

        {/* Key Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-white/5 text-xs">
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected / Scheduled Month</span>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {election.expected_month || `${election.year}`}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Assembly Seats</span>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {election.total_seats || 'N/A'} Seats
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current CM / PM</span>
            <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {election.current_chief_minister || election.winner || 'N/A'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Governing Alliance</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {election.current_governing_party || election.winner_party || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Detailed Breakdown & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Section: Timeline & Key Dates */}
          <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" /> Election Schedule Timeline
            </h3>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Official Gazetted Gazette Notification</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {election.official_gazette_date || 'Awaiting Official ECI Press Note'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Polling Schedule</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {election.official_poll_date || election.expected_month || 'Expected per Schedule'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Vote Counting & Declaration</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {election.official_result_date || 'Post-Polling Phase'}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Results / Victorious Leadership (If Completed) */}
          {election.winner && (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-200/50 dark:border-emerald-900/30 p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" /> Gazetted Election Outcome
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-white dark:bg-[#080d0b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Winning Alliance</span>
                  <p className="text-base font-black text-slate-900 dark:text-slate-100">{election.winner}</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{election.winner_party}</p>
                </div>

                <div className="bg-white dark:bg-[#080d0b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Seat Distribution</span>
                  <p className="text-base font-black text-slate-900 dark:text-slate-100">{election.seat_count}</p>
                  <p className="font-semibold text-slate-500">Vote Share: {election.vote_share}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Official ECI Links & Attribution */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Official ECI Links
            </h4>

            <p className="text-slate-500 leading-relaxed">
              For official notifications, electoral roll search, voter slips, and candidate affidavits:
            </p>

            <a
              href={election.eci_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              Visit Official ECI Portal <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-slate-50 dark:bg-white/2 p-5 rounded-3xl border border-slate-200/60 dark:border-white/5 space-y-2 text-[11px] text-slate-500">
            <p className="font-bold text-slate-800 dark:text-slate-200">Data Integrity Policy</p>
            <p className="leading-relaxed">
              Election schedules, candidates, and statistical records are cross-referenced with the Election Commission of India (ECI) public registry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
