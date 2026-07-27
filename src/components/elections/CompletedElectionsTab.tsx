import React from 'react';
import { ElectionRecord } from '../../data/electionsData';
import { Award, ShieldCheck, User, Calendar, CheckCircle2, ArrowRight, ExternalLink } from 'lucide-react';

interface CompletedElectionsTabProps {
  elections: ElectionRecord[];
  onSelectElection: (slug: string) => void;
}

export default function CompletedElectionsTab({ elections, onSelectElection }: CompletedElectionsTabProps) {
  const completedList = elections.filter(e => e.status === 'Completed');

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedList.map((election) => (
          <div
            key={election.id}
            className="bg-white dark:bg-[#080d0b] rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-[10px] uppercase rounded-lg">
                  {election.type} • {election.year}
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-[10px] uppercase rounded-lg flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3 text-white" /> Completed
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-bold text-[10px] uppercase rounded-lg">
                    Government Formed
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                  {election.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Election Completed / Government Formation Date: <span className="font-semibold text-slate-700 dark:text-slate-300">{election.official_result_date || election.year}</span>
                </p>
              </div>

              {/* Victorious Government Box */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" /> Government Formed
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-700 text-white">
                    Winning Alliance: {election.winner_alliance || 'Majority'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase block">Chief Minister</span>
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {election.winner || election.current_chief_minister || 'Chief Minister Appointed'}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-bold uppercase block">Winning / Ruling Party</span>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {election.winner_party || election.current_governing_party}
                  </p>
                </div>
              </div>

              {/* Official Result seat & vote statistics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Official Result (Seats)</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {election.seat_count || 'Majority Formed'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Vote Share</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {election.vote_share || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 mt-4 flex items-center justify-between">
              <a
                href={election.eci_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1"
              >
                ECI Gazetted Record <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => onSelectElection(election.slug)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                View Full Result <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
