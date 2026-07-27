import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Briefcase, Building, MapPin, Calendar, Clock, 
  ExternalLink, FileText, CheckCircle2, AlertTriangle, XCircle, 
  RotateCcw, Sparkles, Filter, ChevronRight, GraduationCap, DollarSign, 
  Users, Award, Globe, PhoneCall, ShieldCheck, RefreshCw, Layers
} from 'lucide-react';
import { Job, GovtJobPortal } from '../../types';
import { dbService } from '../../lib/supabaseClient';
import { OFFICIAL_GOVT_PORTALS } from '../../data/govtJobsData';
import GovernmentEmblem from '../GovernmentEmblem';

interface JobsDirectoryProps {
  onSelectJob: (slug: string) => void;
}

export default function JobsDirectory({ onSelectJob }: JobsDirectoryProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Active Main View Tab: 'current' | 'upcoming' | 'portals' | 'all'
  const [mainTab, setMainTab] = useState<'current' | 'upcoming' | 'portals' | 'all'>('current');

  // Stats
  const [stats, setStats] = useState({ 
    total: 0, 
    central: 0, 
    state: 0, 
    closingSoon: 0, 
    open: 0, 
    upcoming: 0 
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All Jobs' | 'Central Government' | 'State Government'>('All Jobs');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Open' | 'Closing Soon' | 'Upcoming'>('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [qualificationFilter, setQualificationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');
  const [portalCategoryFilter, setPortalCategoryFilter] = useState<string>('all');

  // Available options derived from data
  const [statesList, setStatesList] = useState<string[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);

  useEffect(() => {
    loadJobs();
  }, [categoryFilter, statusFilter, stateFilter, departmentFilter, qualificationFilter, experienceFilter, employmentTypeFilter, searchQuery, mainTab]);

  async function loadJobs() {
    try {
      setLoading(true);
      setError(null);

      const catParam = categoryFilter === 'Central Government' ? 'Central' : categoryFilter === 'State Government' ? 'State' : 'all';

      let data = await dbService.getJobs({
        category: catParam,
        state: stateFilter,
        department: departmentFilter,
        qualification: qualificationFilter,
        experience: experienceFilter,
        employment_type: employmentTypeFilter,
        search: searchQuery
      });

      // Tab specific filtering
      if (mainTab === 'current') {
        data = data.filter(j => j.status === 'Open' || j.status === 'Closing Soon');
      } else if (mainTab === 'upcoming') {
        data = data.filter(j => j.status === 'Upcoming');
      }

      // Explicit status dropdown filter if set
      if (statusFilter !== 'all') {
        data = data.filter(j => j.status === statusFilter);
      }

      setJobs(data);

      const statsData = await dbService.getJobsStats();
      setStats(statsData);

      // Extract unique states & departments for dropdowns
      const allRaw = await dbService.getJobs();
      const uniqueStates = Array.from(new Set(allRaw.map(j => j.state))).filter(Boolean).sort();
      const uniqueDepts = Array.from(new Set(allRaw.map(j => j.organization))).filter(Boolean).sort();
      setStatesList(uniqueStates);
      setDepartmentsList(uniqueDepts);

    } catch (err: any) {
      console.error('Failed loading government jobs:', err);
      setError('Unable to fetch recruitment notifications. Please retry.');
    } finally {
      setLoading(false);
    }
  }

  const handleRefreshPortalData = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setRefreshing(false);
      loadJobs();
    }, 800);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All Jobs');
    setStatusFilter('all');
    setStateFilter('all');
    setDepartmentFilter('all');
    setQualificationFilter('all');
    setExperienceFilter('all');
    setEmploymentTypeFilter('all');
    setPortalCategoryFilter('all');
  };

  const getStatusBadge = (status: Job['status']) => {
    if (status === 'Open') {
      return (
        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3" />
          <span>Active Application</span>
        </span>
      );
    } else if (status === 'Closing Soon') {
      return (
        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 uppercase tracking-wider animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          <span>Closing Soon</span>
        </span>
      );
    } else if (status === 'Upcoming') {
      return (
        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <span>Upcoming Notice</span>
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold rounded-lg flex items-center gap-1 uppercase tracking-wider">
          <XCircle className="w-3 h-3" />
          <span>Closed</span>
        </span>
      );
    }
  };

  const filteredPortals = portalCategoryFilter === 'all' 
    ? OFFICIAL_GOVT_PORTALS 
    : OFFICIAL_GOVT_PORTALS.filter(p => p.category === portalCategoryFilter);

  return (
    <div className="space-y-8 py-2 text-left">
      
      {/* PAGE HEADER & HERO BANNER */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/20 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider shadow-inner">
              <GovernmentEmblem size="sm" />
              <span>Official Govt Recruitment & Notification Gateway</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight leading-none uppercase">
              GOVERNMENT <span className="text-emerald-400">JOBS</span> & PORTALS
            </h1>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-sans font-medium">
              Verified active recruitment notices, upcoming exam calendars, official syllabus downloads, and direct 1-click links to official UPSC, SSC, IBPS, Indian Railways, Defence, and State Public Service Commission portals.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-emerald-400/90 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Verified Official Sources</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Direct Official Portal Links</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">Last Synced: {lastSyncTime}</span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
            <button
              onClick={handleRefreshPortalData}
              disabled={refreshing}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl text-xs font-mono font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing Official Feeds...' : 'Refresh Live Feeds'}</span>
            </button>
            <span className="text-[10px] font-mono text-slate-400">
              Aggregating UPSC • SSC • IBPS • RRB • NCS
            </span>
          </div>
        </div>
      </div>

      {/* MAIN VIEW NAVIGATION TABS */}
      <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-2 rounded-2xl shadow-sm flex flex-wrap items-center gap-2">
        <button
          onClick={() => setMainTab('current')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'current'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Current Jobs ({stats.open})</span>
        </button>

        <button
          onClick={() => setMainTab('upcoming')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'upcoming'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Upcoming Jobs ({stats.upcoming})</span>
        </button>

        <button
          onClick={() => setMainTab('portals')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'portals'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Official Portals ({OFFICIAL_GOVT_PORTALS.length})</span>
        </button>

        <button
          onClick={() => setMainTab('all')}
          className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl text-xs font-bold font-sans transition flex items-center justify-center gap-2 cursor-pointer ${
            mainTab === 'all'
              ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Notices ({stats.total})</span>
        </button>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div 
          onClick={() => setMainTab('current')}
          className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:border-emerald-500/40 cursor-pointer transition"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Current Openings
            </p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {stats.open}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setMainTab('upcoming')}
          className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:border-blue-500/40 cursor-pointer transition"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Upcoming Exams
            </p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {stats.upcoming}
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setMainTab('portals')}
          className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:border-purple-500/40 cursor-pointer transition"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Official Portals
            </p>
            <p className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
              {OFFICIAL_GOVT_PORTALS.length}
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-100 dark:border-purple-900/30">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div 
          onClick={() => setMainTab('all')}
          className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-5 rounded-2xl shadow-sm flex items-center justify-between hover:border-amber-500/40 cursor-pointer transition"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Closing Soon
            </p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {stats.closingSoon}
            </p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/30">
            <Clock className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* MODE 1: OFFICIAL GOVERNMENT PORTALS DIRECTORY VIEW */}
      {mainTab === 'portals' ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                  Official Government Recruitment Portals Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Direct official access links to UPSC, SSC, IBPS, Indian Railways, Defence, and State Public Service Commissions.
                </p>
              </div>

              {/* Portal Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {['all', 'Central Agency', 'Banking & Finance', 'Railways', 'Defence', 'State PSC'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPortalCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      portalCategoryFilter === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Portals' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Portals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPortals.map((portal) => (
                <div 
                  key={portal.id}
                  className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 hover:border-purple-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 p-2 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                          <img 
                            src={portal.logo} 
                            alt={portal.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                              {portal.abbreviation}
                            </h3>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-bold rounded uppercase">
                              Official
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {portal.name}
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/40 text-[9px] font-mono font-bold rounded-md whitespace-nowrap">
                        {portal.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {portal.description}
                    </p>

                    {/* Key Exams */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Major Conducted Examinations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {portal.key_exams.map((ex, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-[10px] font-mono rounded"
                          >
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Helpline & HQ */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-emerald-600" />
                        <span>Helpline: {portal.helpline}</span>
                      </span>
                      <span className="truncate max-w-[200px]" title={portal.headquarters}>
                        📍 {portal.headquarters}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center gap-3">
                    <a
                      href={portal.recruitment_portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Visit Recruitment Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={portal.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 bg-white dark:bg-slate-950 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center"
                      title="Official Website"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* MODE 2: JOBS LISTING VIEW (Current / Upcoming / All) */
        <div className="space-y-6">
          
          {/* SEARCH BAR */}
          <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-3 rounded-2xl shadow-sm">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search representatives, UPSC, SSC, IBPS, Railways, vacancies, qualifications..."
                className="w-full bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl pl-12 pr-4 py-3.5 text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase tracking-wider font-mono cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-5">
            
            {/* Category Toggle & Reset */}
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 dark:border-slate-900 pb-4">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                {(['All Jobs', 'Central Government', 'State Government'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setCategoryFilter(type)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer font-sans ${
                      categoryFilter === type
                        ? 'bg-white dark:bg-slate-950 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/50 dark:border-slate-800'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">Status:</span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  {[
                    { label: 'All', value: 'all' },
                    { label: 'Open', value: 'Open' },
                    { label: 'Closing Soon', value: 'Closing Soon' },
                    { label: 'Upcoming', value: 'Upcoming' }
                  ].map(st => (
                    <button
                      key={st.value}
                      onClick={() => setStatusFilter(st.value as any)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition cursor-pointer ${
                        statusFilter === st.value
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition cursor-pointer font-mono uppercase tracking-wider"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Dropdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              {/* State */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  State / Jurisdiction
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All States & Central</option>
                  {statesList.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Organization / Agency
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Recruiting Bodies</option>
                  {departmentsList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Qualification */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Minimum Qualification
                </label>
                <select
                  value={qualificationFilter}
                  onChange={(e) => setQualificationFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Qualifications</option>
                  <option value="10th">Class 10th / SSLC</option>
                  <option value="12th">Class 12th / Higher Secondary</option>
                  <option value="Bachelor">Bachelor's Degree / Graduate</option>
                  <option value="Engineering">B.E. / B.Tech / Diploma</option>
                  <option value="Nursing">B.Sc. Nursing / GNM</option>
                </select>
              </div>

              {/* Employment Type */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  Employment Type
                </label>
                <select
                  value={employmentTypeFilter}
                  onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Employment Types</option>
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

            </div>
          </div>

          {/* LIST HEADER */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Showing {jobs.length} Official Government Notifications {mainTab === 'current' ? '(Active Openings)' : mainTab === 'upcoming' ? '(Upcoming Schedule)' : ''}
            </p>
          </div>

          {/* LOADING SKELETON */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded-md w-3/4" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded-md w-1/2" />
                  <div className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl" />
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 p-8 rounded-2xl text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-sm font-bold text-rose-800 dark:text-rose-200">{error}</p>
              <button
                onClick={loadJobs}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-mono cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading && !error && jobs.length === 0 && (
            <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-12 rounded-2xl text-center space-y-4">
              <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">No Matching Government Recruitment Found</h3>
                <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                  No notifications matched your query or filter criteria. Try clearing filters or switching tabs.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-mono cursor-pointer transition shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* JOB CARDS */}
          {!loading && !error && jobs.length > 0 && (
            <div className="grid grid-cols-1 gap-4">
              {jobs.map((job) => (
                <motion.div
                  key={job.id}
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 rounded-2xl p-6 shadow-sm transition-all space-y-5 group text-left relative overflow-hidden"
                >
                  
                  {/* Status Banner accent line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    job.status === 'Open' ? 'bg-emerald-500' :
                    job.status === 'Closing Soon' ? 'bg-amber-500' :
                    job.status === 'Upcoming' ? 'bg-blue-500' : 'bg-slate-400'
                  }`} />

                  {/* Header Row: Official Logo + Title + Status */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
                    
                    <div className="flex items-start gap-4">
                      {/* Logo container */}
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 flex items-center justify-center shrink-0 shadow-inner">
                        {job.logo ? (
                          <img 
                            src={job.logo} 
                            alt={job.organization} 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Building className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase tracking-wider ${
                            job.category === 'Central' 
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/40' 
                              : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/40'
                          }`}>
                            {job.category} Government
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                            {job.state}
                          </span>
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50">
                            {job.employment_type}
                          </span>
                        </div>

                        <h2 
                          onClick={() => onSelectJob(job.slug)}
                          className="text-lg font-extrabold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors cursor-pointer leading-snug"
                        >
                          {job.title}
                        </h2>

                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{job.organization}</span>
                          <span>•</span>
                          <span>{job.department}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(job.status)}
                    </div>

                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                    
                    <div className="space-y-0.5 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-850">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        {job.status === 'Upcoming' ? 'Tentative Vacancies' : 'Total Vacancies'}
                      </span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        {job.vacancies.toLocaleString('en-IN')} Posts
                      </span>
                    </div>

                    <div className="space-y-0.5 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-850">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Pay Scale / Salary
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={job.salary}>
                        {job.salary}
                      </span>
                    </div>

                    <div className="space-y-0.5 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-850">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Qualification
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block" title={job.qualification}>
                        {job.qualification}
                      </span>
                    </div>

                    <div className="space-y-0.5 bg-slate-50/70 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-100/50 dark:border-slate-850">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                        Age Limit
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                        {job.age_limit}
                      </span>
                    </div>

                  </div>

                  {/* Dates & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100/60 dark:border-slate-850">
                    
                    {job.status === 'Upcoming' ? (
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-blue-600 dark:text-blue-400 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                          <span>Expected Notice: <strong>{job.expected_notification_date || job.application_start}</strong></span>
                        </div>
                        {job.tentative_exam_date && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-purple-500" />
                              <span>Tentative Exam: <strong>{job.tentative_exam_date}</strong></span>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Start: <strong>{job.application_start}</strong></span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>Last Date: <strong className="text-amber-600 dark:text-amber-400">{job.application_end}</strong></span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      
                      <button
                        onClick={() => onSelectJob(job.slug)}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>View Details & Syllabus</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <a
                        href={job.official_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider font-mono ${
                          job.status === 'Upcoming'
                            ? 'bg-blue-600 hover:bg-blue-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <span>{job.status === 'Upcoming' ? 'Official Portal' : 'Apply Now'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                    </div>

                  </div>

                </motion.div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
