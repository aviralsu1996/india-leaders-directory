import React, { useState } from 'react';
import { STATE_ELECTION_DOSSIERS, StateElectionDossier, DISCLAIMER_TEXT } from '../../data/electionsData';
import { MapPin, Building, Calendar, Award, User, ExternalLink, Info, ShieldCheck, Search } from 'lucide-react';

interface InteractiveElectionMapProps {
  onSelectState?: (stateName: string) => void;
}

export default function InteractiveElectionMap({ onSelectState }: InteractiveElectionMapProps) {
  const [selectedStateName, setSelectedStateName] = useState<string>('Tamil Nadu');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const selectedDossier: StateElectionDossier | undefined = STATE_ELECTION_DOSSIERS.find(
    (s) => s.state.toLowerCase() === selectedStateName.toLowerCase()
  );

  const filteredStates = STATE_ELECTION_DOSSIERS.filter((s) =>
    s.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 md:p-8 shadow-sm space-y-8 text-left animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-5">
        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            State Election Dossier
          </span>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
            Interactive Election Intelligence Map & State Selector
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Click any State or Union Territory below to inspect constitutional tenure, ruling government, and ECI schedules
          </p>
        </div>

        {/* State Quick Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search state..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Grid: State Buttons Grid on Left + Selected State Dossier Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: State Select Buttons */}
        <div className="lg:col-span-5 space-y-3">
          <label className="text-xs font-bold uppercase text-slate-400 block">Select State / Union Territory ({filteredStates.length})</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-2">
            {filteredStates.map((st) => (
              <button
                key={st.state}
                onClick={() => {
                  setSelectedStateName(st.state);
                  if (onSelectState) onSelectState(st.state);
                }}
                className={`p-3 rounded-2xl text-left border text-xs transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                  selectedStateName.toLowerCase() === st.state.toLowerCase()
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                    : 'bg-slate-50 dark:bg-white/5 border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">{st.state}</span>
                  <MapPin className="w-3 h-3 shrink-0 opacity-70" />
                </div>
                <span className={`text-[10px] ${selectedStateName.toLowerCase() === st.state.toLowerCase() ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Next: {st.next_election_expected}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Selected State Intelligence Card */}
        {selectedDossier && (
          <div className="lg:col-span-7 bg-slate-50 dark:bg-white/2 rounded-3xl p-6 border border-slate-200/80 dark:border-white/5 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Card Header */}
              <div className="flex items-start justify-between border-b border-slate-200 dark:border-white/5 pb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] uppercase">
                    State Dossier
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    {selectedDossier.state}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Capital: <strong className="text-slate-800 dark:text-slate-200">{selectedDossier.capital}</strong>
                  </p>
                </div>

                <a
                  href={selectedDossier.eci_portal_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  CEO Portal <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Incumbent CM */}
                <div className="bg-white dark:bg-[#080d0b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-500" /> Chief Minister
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 block">
                    {selectedDossier.current_cm}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                    {selectedDossier.current_governing_party}
                  </span>
                </div>

                {/* Assembly Strength */}
                <div className="bg-white dark:bg-[#080d0b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-blue-500" /> Assembly Seats
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 block">
                    {selectedDossier.assembly_seats} Seats
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Lok Sabha: {selectedDossier.lok_sabha_seats} Seats
                  </span>
                </div>

                {/* Last Election */}
                <div className="bg-white dark:bg-[#080d0b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Last Polls Winner
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                    {selectedDossier.last_election_winner} ({selectedDossier.last_election_year})
                  </span>
                </div>

                {/* Next Expected Election */}
                <div className="bg-white dark:bg-[#080d0b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Next Poll Schedule
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                    {selectedDossier.next_election_expected}
                  </span>
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                    Status: {selectedDossier.status}
                  </span>
                </div>
              </div>

              {/* Major Opposition */}
              <div className="bg-white dark:bg-[#080d0b] p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Major Opposition Party</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {selectedDossier.major_opposition}
                </span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-white/5 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{DISCLAIMER_TEXT}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
