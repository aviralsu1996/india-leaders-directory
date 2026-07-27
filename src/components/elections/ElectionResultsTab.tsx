import React, { useState } from 'react';
import { ElectionRecord } from '../../data/electionsData';
import { Search, Download, ExternalLink, Award, ShieldCheck, Building, CheckCircle2, FileText, Filter } from 'lucide-react';

interface ElectionResultsTabProps {
  elections: ElectionRecord[];
  onSelectElection: (slug: string) => void;
}

export default function ElectionResultsTab({ elections, onSelectElection }: ElectionResultsTabProps) {
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const completedList = elections.filter(e => e.status === 'Completed' || e.winner);

  // Filter options
  const states = Array.from(new Set(completedList.map(e => e.state)));
  const years = Array.from(new Set(completedList.map(e => e.year))).sort((a, b) => b - a);
  const types = Array.from(new Set(completedList.map(e => e.type)));

  const filteredResults = completedList.filter((e) => {
    if (selectedState !== 'all' && e.state !== selectedState) return false;
    if (selectedYear !== 'all' && e.year.toString() !== selectedYear) return false;
    if (selectedType !== 'all' && e.type !== selectedType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.state.toLowerCase().includes(q) ||
        (e.winner || '').toLowerCase().includes(q) ||
        (e.winner_party || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportPDF = (election: ElectionRecord) => {
    // Generate text/JSON summary download as PDF report simulation
    const content = `=====================================================
ELECTION COMMISSION OF INDIA - GAZETTED RESULT SUMMARY
=====================================================
Election: ${election.title}
Type: ${election.type} | State: ${election.state} | Year: ${election.year}
Official Result Date: ${election.official_result_date || 'N/A'}
-----------------------------------------------------
Winning Leader / Chief Minister: ${election.winner || 'N/A'}
Winning Party: ${election.winner_party || 'N/A'} (${election.winner_alliance || 'N/A'})
Runner-Up Alliance / Party: ${election.runner_up_party || 'N/A'}
Total Seats: ${election.total_seats || 'N/A'}
Seat Distribution: ${election.seat_count || 'N/A'}
Alliance Vote Share: ${election.vote_share || 'N/A'}
-----------------------------------------------------
Source: Election Commission of India (https://eci.gov.in)
Document Generated: ${new Date().toLocaleDateString()}
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${election.slug}-eci-result-summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-[#080d0b] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" /> Gazetted Election Results Archive
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Filter official election outcomes, vote shares, seat distribution and gazette certificates
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search results by winner or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Filter State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All States & UTs</option>
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Filter Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Election Years</option>
              {years.map((yr) => (
                <option key={yr} value={yr.toString()}>{yr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Filter Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">All Election Categories</option>
              {types.map((tp) => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResults.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#080d0b] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  {item.type} • {item.state}
                </span>

                <span className="text-xs font-black text-slate-400">
                  {item.year}
                </span>
              </div>

              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                {item.title}
              </h4>

              {/* Winner & Runner Up Banner */}
              <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1 font-semibold">
                    <Award className="w-4 h-4 text-emerald-500" /> Victorious CM / PM:
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{item.winner}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
                  <span className="text-slate-400 font-semibold">Winning Party / Alliance:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.winner_party} ({item.winner_alliance})</span>
                </div>

                {item.runner_up_party && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
                    <span className="text-slate-400 font-semibold">Runner Up:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{item.runner_up_party}</span>
                  </div>
                )}
              </div>

              {/* Seat & Vote share Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/30">
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-bold">Seat Distribution</span>
                  <span className="text-base font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block">{item.seat_count}</span>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 block font-bold">Alliance Vote %</span>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5 block">{item.vote_share}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <button
                onClick={() => handleExportPDF(item)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" /> Export Gazette Summary
              </button>

              <button
                onClick={() => onSelectElection(item.slug)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                Full Analysis <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
