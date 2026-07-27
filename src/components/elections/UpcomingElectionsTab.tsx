import React, { useState, useMemo } from 'react';
import { ElectionRecord, DISCLAIMER_TEXT } from '../../data/electionsData';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Building,
  User,
  Shield,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Globe,
  Award,
  Users,
  Landmark,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface UpcomingElectionsTabProps {
  elections: ElectionRecord[];
  onSelectElection: (slug: string) => void;
}

export default function UpcomingElectionsTab({ elections, onSelectElection }: UpcomingElectionsTabProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');

  // Accordion Expand States
  const [collapsedYears, setCollapsedYears] = useState<Record<number, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleYearSection = (year: number) => {
    setCollapsedYears(prev => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleRowExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Extract unique states for filter dropdown
  const uniqueStates = useMemo(() => {
    const statesSet = new Set<string>();
    elections.forEach(e => {
      if (e.state) statesSet.add(e.state);
    });
    return Array.from(statesSet).sort();
  }, [elections]);

  // Filtered dataset
  const filteredElections = useMemo(() => {
    return elections.filter(item => {
      // Type Filter
      if (selectedType !== 'All') {
        const itemType = (item.election_type || item.type || '').toLowerCase();
        if (selectedType === 'Assembly' && !itemType.includes('assembly')) return false;
        if (selectedType === 'Lok Sabha' && !itemType.includes('lok sabha')) return false;
        if (selectedType === 'Rajya Sabha' && !itemType.includes('rajya sabha')) return false;
      }

      // Year Filter
      if (selectedYear !== 'All') {
        const itemYear = item.election_year || item.year;
        if (String(itemYear) !== selectedYear) return false;
      }

      // Status Filter
      if (selectedStatus !== 'All') {
        const st = (item.status || '').toLowerCase();
        const querySt = selectedStatus.toLowerCase();
        if (!st.includes(querySt)) return false;
      }

      // State Filter
      if (selectedState !== 'All') {
        if ((item.state || '').toLowerCase() !== selectedState.toLowerCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesState = (item.state || '').toLowerCase().includes(q);
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesCM = (item.chief_minister || item.current_chief_minister || '').toLowerCase().includes(q);
        const matchesParty = (item.winning_party || item.current_governing_party || '').toLowerCase().includes(q);
        if (!matchesState && !matchesTitle && !matchesCM && !matchesParty) return false;
      }

      return true;
    });
  }, [elections, selectedType, selectedYear, selectedStatus, selectedState, searchQuery]);

  // Group Year Wise (2027, 2028, 2029, 2030, 2031...)
  const yearWiseGroups = useMemo(() => {
    const map = new Map<number, ElectionRecord[]>();
    const defaultYears = [2027, 2028, 2029, 2030, 2031];

    defaultYears.forEach(y => map.set(y, []));

    filteredElections.forEach(rec => {
      const yr = Number(rec.election_year || rec.year || 2027);
      if (!map.has(yr)) {
        map.set(yr, []);
      }
      map.get(yr)!.push(rec);
    });

    const sortedYears = Array.from(map.keys()).sort((a, b) => a - b);
    return sortedYears.map(yr => ({
      year: yr,
      records: map.get(yr) || []
    }));
  }, [filteredElections]);

  const totalFiltered = filteredElections.length;

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      {/* Top Banner with ECI & BoomLive Attribution */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-800 via-emerald-900 to-slate-950 border border-emerald-700/50">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Election Calendar Timeline
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-bold flex items-center gap-1 border border-white/10">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> BoomLive & ECI Synchronized
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Upcoming State Assembly & Parliamentary Elections
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm max-w-3xl leading-relaxed">
            Constitutional tenure projections and official poll schedules cross-referenced with the Election Commission of India (ECI) and verified electoral tracking networks.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-200">
            <div className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{DISCLAIMER_TEXT}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-white dark:bg-[#080d0b] rounded-2xl border border-slate-100 dark:border-white/5 p-4 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search state, chief minister, party or election..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 text-xs">
          {/* Election Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              Election Type
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="All">All Types</option>
              <option value="Assembly">Assembly</option>
              <option value="Lok Sabha">Lok Sabha</option>
              <option value="Rajya Sabha">Rajya Sabha</option>
            </select>
          </div>

          {/* By Year */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              By Year
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="All">All Years</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
              <option value="2031">2031</option>
            </select>
          </div>

          {/* By State */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              By State
            </label>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="All">All States ({uniqueStates.length})</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* By Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              By Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="All">All Statuses</option>
              <option value="Tentative">Tentative</option>
              <option value="Official Schedule">Official Schedule</option>
              <option value="Polling">Polling Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Active Filter Counter / Reset */}
          <div className="col-span-2 sm:col-span-4 md:col-span-1 flex items-end justify-between md:justify-end gap-2">
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 py-2">
              {totalFiltered} Elections Found
            </span>
            {(selectedType !== 'All' || selectedYear !== 'All' || selectedStatus !== 'All' || selectedState !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType('All');
                  setSelectedYear('All');
                  setSelectedStatus('All');
                  setSelectedState('All');
                  setSearchQuery('');
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-all cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BoomLive Timeline Grouped Year Wise */}
      <div className="space-y-6">
        {yearWiseGroups.map(group => {
          const isCollapsed = collapsedYears[group.year];
          const itemCount = group.records.length;

          return (
            <div
              key={group.year}
              className="bg-white dark:bg-[#080d0b] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden transition-all"
            >
              {/* Year Accordion Header */}
              <button
                onClick={() => toggleYearSection(group.year)}
                className="w-full px-6 py-4 bg-slate-50/70 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/10 border-b border-slate-100 dark:border-white/5 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                    {group.year}
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Due in {group.year}
                    </h3>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ({itemCount} {itemCount === 1 ? 'State / Election' : 'States'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {isCollapsed ? 'Click to Expand' : 'Click to Collapse'}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Collapsible Content */}
              {!isCollapsed && (
                <div>
                  {itemCount === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                      No elections matching current search/filter criteria due in {group.year}.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-white/5">
                      {group.records.map(election => {
                        const isExpanded = expandedRows[election.id];

                        // Status Badge Colors
                        const statusColor =
                          election.status === 'Completed'
                            ? 'bg-emerald-600 text-white'
                            : election.status === 'Polling' || election.status === 'Ongoing'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : election.status === 'Official Schedule' || election.status === 'Official'
                            ? 'bg-blue-600 text-white'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50';

                        return (
                          <div key={election.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-white/5">
                            {/* Summary Table Row */}
                            <div
                              onClick={() => toggleRowExpand(election.id)}
                              className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 items-center gap-3 sm:gap-4 cursor-pointer"
                            >
                              {/* State & Title */}
                              <div className="md:col-span-3 flex items-center gap-2.5">
                                <Building className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <div>
                                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                                    {election.state}
                                  </h4>
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                    {election.election_type || election.type}
                                  </span>
                                </div>
                              </div>

                              {/* Expected Month & Assembly Tenure */}
                              <div className="md:col-span-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Month</p>
                                  <p className="font-bold text-slate-800 dark:text-slate-200">
                                    {election.expected_month || election.year}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assembly Tenure</p>
                                  <p className="font-bold text-slate-700 dark:text-slate-300">
                                    {election.tenure_start && election.tenure_end
                                      ? `${election.tenure_start} - ${election.tenure_end}`
                                      : `${(election.election_year || election.year || 2027) - 5} - ${election.election_year || election.year}`}
                                  </p>
                                </div>
                              </div>

                              {/* Seats & CM */}
                              <div className="md:col-span-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assembly Seats</p>
                                  <p className="font-extrabold text-emerald-700 dark:text-emerald-400">
                                    {election.assembly_seats || election.total_seats || 'N/A'} Seats
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chief Minister</p>
                                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                    {election.chief_minister || election.current_chief_minister || 'N/A'}
                                  </p>
                                </div>
                              </div>

                              {/* Ruling Party & Status Badge */}
                              <div className="md:col-span-3 flex items-center justify-between gap-2 text-xs">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ruling Party</p>
                                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                                    {election.winning_party || election.current_governing_party || 'N/A'}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${statusColor}`}>
                                    <Clock className="w-3 h-3" />
                                    {election.status}
                                  </span>

                                  <button className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 transition-colors">
                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Expanded Row Detailed Dossier */}
                            {isExpanded && (
                              <div className="p-5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 space-y-6 animate-in slide-in-from-top-1 duration-200 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* 1. Current Government Structure */}
                                  <div className="bg-white dark:bg-[#0c1410] p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-3 shadow-sm">
                                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-2">
                                      <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Current Government
                                    </h5>

                                    <div className="space-y-2 text-slate-700 dark:text-slate-300">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Governor:</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{election.governor || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Chief Minister:</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{election.chief_minister || election.current_chief_minister || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Deputy CM:</span>
                                        <span className="font-semibold">{election.deputy_chief_minister || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Leader of Opposition:</span>
                                        <span className="font-semibold">{election.leader_of_opposition || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-slate-100 dark:border-white/5 pt-1.5">
                                        <span className="text-slate-400 font-medium">Assembly Strength:</span>
                                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{election.assembly_seats || election.total_seats || 'N/A'} Seats</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Current Alliance:</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{election.winning_alliance || election.current_governing_party || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 2. Previous Election Result */}
                                  <div className="bg-white dark:bg-[#0c1410] p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-3 shadow-sm">
                                    <h5 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-2">
                                      <Award className="w-4 h-4 text-amber-500" /> Previous Election Result
                                    </h5>

                                    <div className="space-y-2 text-slate-700 dark:text-slate-300">
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Winning Party:</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{election.winning_party || election.current_governing_party || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Vote Share:</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{election.vote_share || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-400 font-medium">Seats Tally:</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{election.seat_count || `${election.assembly_seats} Seats`}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-slate-100 dark:border-white/5 pt-1.5">
                                        <span className="text-slate-400 font-medium">Last Polls Year:</span>
                                        <span className="font-semibold">{election.tenure_start || (election.year ? election.year - 5 : 2022)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* 3. Official Constitutional Links & Actions */}
                                  <div className="bg-white dark:bg-[#0c1410] p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-3 shadow-sm flex flex-col justify-between">
                                    <div>
                                      <h5 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-white/5 pb-2">
                                        <Globe className="w-4 h-4 text-blue-500" /> Official Election Portals
                                      </h5>

                                      <div className="pt-2 space-y-2.5">
                                        <a
                                          href={election.eci_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold transition-all"
                                        >
                                          <span className="flex items-center gap-2">
                                            <Shield className="w-3.5 h-3.5 text-blue-500" /> ECI Official Portal
                                          </span>
                                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                        </a>

                                        <a
                                          href={election.state_ec_url || election.eci_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-between text-slate-800 dark:text-slate-200 font-bold transition-all"
                                        >
                                          <span className="flex items-center gap-2">
                                            <Building className="w-3.5 h-3.5 text-emerald-500" /> State CEO Commission
                                          </span>
                                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                                        </a>
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => onSelectElection(election.slug || election.id)}
                                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mt-3"
                                    >
                                      Inspect Full Dossier Page <ArrowUpRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Election History & Notes */}
                                {(election.election_history || election.description) && (
                                  <div className="bg-white dark:bg-[#0c1410] p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-1.5">
                                    <h6 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                                      <Info className="w-3.5 h-3.5 text-emerald-500" /> Election History & Political Overview
                                    </h6>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                                      {election.election_history || election.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
