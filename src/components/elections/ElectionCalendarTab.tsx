import React, { useState } from 'react';
import { ElectionRecord, DISCLAIMER_TEXT } from '../../data/electionsData';
import { Calendar as CalendarIcon, Clock, ArrowRight, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

interface ElectionCalendarTabProps {
  elections: ElectionRecord[];
  onSelectElection: (slug: string) => void;
}

export default function ElectionCalendarTab({ elections, onSelectElection }: ElectionCalendarTabProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const availableYears = [2024, 2025, 2026, 2027, 2028, 2029];

  // Helper to filter elections for a given month and year
  const getElectionsForMonth = (monthName: string, year: number) => {
    return elections.filter((e) => {
      const matchYear = e.year === year;
      if (!matchYear) return false;

      const mLower = monthName.toLowerCase();
      const expMonth = (e.expected_month || '').toLowerCase();
      const pollDate = (e.official_poll_date || '').toLowerCase();
      const resultDate = (e.official_result_date || '').toLowerCase();

      return (
        expMonth.includes(mLower) ||
        pollDate.includes(mLower) ||
        resultDate.includes(mLower) ||
        // Fallback for general matches if month not strictly parsed
        (monthName === 'April' && (expMonth.includes('april') || expMonth.includes('spring')))
      );
    });
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      {/* Top Controls: Year Selection & Disclaimer */}
      <div className="bg-white dark:bg-[#080d0b] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-500" /> Election Calendar Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Constitutional election cycle timeline across all Indian States, UTs, and Parliament
            </p>
          </div>

          {/* Year Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 p-3.5 rounded-2xl flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="leading-tight">{DISCLAIMER_TEXT}</span>
        </div>
      </div>

      {/* 12 Months Timeline Grid */}
      <div className="space-y-6">
        {months.map((m, idx) => {
          const monthElections = getElectionsForMonth(m, selectedYear);

          return (
            <div
              key={m}
              className={`p-6 rounded-3xl border transition-all ${
                monthElections.length > 0
                  ? 'bg-white dark:bg-[#080d0b] border-slate-200 dark:border-white/10 shadow-sm'
                  : 'bg-slate-50/50 dark:bg-white/2 border-slate-100 dark:border-white/5 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-200/50">
                    0{idx + 1}
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                    {m} {selectedYear}
                  </h4>
                </div>

                <span className="text-xs font-bold text-slate-400">
                  {monthElections.length} {monthElections.length === 1 ? 'Election Event' : 'Election Events'}
                </span>
              </div>

              {monthElections.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No scheduled or expected assembly/parliamentary elections in {m} {selectedYear}.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthElections.map((el) => (
                    <div
                      key={el.id}
                      className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase">
                            {el.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              el.status === 'Official'
                                ? 'bg-blue-600 text-white'
                                : el.status === 'Completed'
                                ? 'bg-slate-700 text-white'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {el.status}
                          </span>
                        </div>

                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 leading-snug">
                          {el.title}
                        </h5>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          State: <span className="font-semibold text-slate-800 dark:text-slate-200">{el.state}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">
                          {el.expected_month || el.official_poll_date}
                        </span>

                        <button
                          onClick={() => onSelectElection(el.slug)}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View Details <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
