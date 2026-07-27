import React from 'react';
import { ElectionRecord } from '../../data/electionsData';
import { Radio, Calendar, CheckCircle, ExternalLink, ArrowRight, ShieldAlert, Award } from 'lucide-react';

interface OngoingElectionsTabProps {
  elections: ElectionRecord[];
  onSelectElection: (slug: string) => void;
}

export default function OngoingElectionsTab({ elections, onSelectElection }: OngoingElectionsTabProps) {
  const ongoingList = elections.filter(e => e.status === 'Ongoing');

  if (ongoingList.length === 0) {
    return (
      <div className="bg-white dark:bg-[#080d0b] p-12 rounded-3xl border border-slate-100 dark:border-white/5 text-center space-y-3">
        <Radio className="w-10 h-10 text-emerald-500 mx-auto animate-pulse" />
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">No Major Assembly Elections Currently Active</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          All major general assembly polls have completed counting or are in preparation stage for upcoming cycles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ongoingList.map((election) => (
          <div
            key={election.id}
            className="bg-white dark:bg-[#080d0b] rounded-3xl border border-emerald-500/30 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider rounded-bl-2xl flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE ONGOING ELECTION
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200/50">
                  {election.type} • {election.state}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 leading-snug">
                {election.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {election.description}
              </p>

              {/* Polling & Phase Status */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status Phase</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {election.current_phase || election.polling_phase || 'Active Polling'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Expected Result Date</span>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 mt-1 block">
                    {election.official_result_date || 'Awaiting ECI Notice'}
                  </span>
                </div>
              </div>

              {/* Turnout metrics */}
              {election.polling_percentage && (
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-200/40 dark:border-emerald-900/30 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Recorded Turnout:
                  </span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {election.polling_percentage}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-5 border-t border-slate-100 dark:border-white/5 mt-6 flex items-center justify-between">
              <a
                href={election.eci_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1"
              >
                Official ECI Live Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => onSelectElection(election.slug)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                Inspect Live Polls <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
