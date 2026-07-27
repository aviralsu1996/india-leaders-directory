import React, { useState, useEffect } from 'react';
import { INDIA_STATES_DATA, StateData } from '../../data/indiaPoliticalData';
import { dbService } from '../../lib/supabaseClient';
import { SupabaseLeader } from '../../types';
import { LeaderAvatar, LeaderCover } from '../directory/GovtDesignSystem';
import {
  ArrowLeft,
  Building,
  User,
  Shield,
  Award,
  Users,
  MapPin,
  ExternalLink,
  Search,
  FileText
} from 'lucide-react';

interface StateDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectLeader: (slug: string) => void;
}

export default function StateDetailPage({
  slug,
  onBack,
  onSelectLeader
}: StateDetailPageProps) {
  const [stateData, setStateData] = useState<StateData | null>(null);
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'mlas' | 'cabinet' | 'mps' | 'departments'>('mlas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const found = INDIA_STATES_DATA.find(s => s.slug === slug || s.id === slug);
    if (found) {
      setStateData(found);
      loadStateLeaders(found.name);
    } else {
      setStateData(INDIA_STATES_DATA[0]);
      loadStateLeaders(INDIA_STATES_DATA[0].name);
    }
  }, [slug]);

  const loadStateLeaders = async (stateName: string) => {
    setLoading(true);
    try {
      const data = await dbService.getLeaders({ state: stateName });
      setLeaders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!stateData) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Loading State Dossier...</p>
      </div>
    );
  }

  const filteredLeaders = searchQuery
    ? leaders.filter(l =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.constituency.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.party.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leaders;

  const mlas = filteredLeaders.filter(l => l.category === 'MLA' || l.designation.includes('MLA'));
  const cabinet = filteredLeaders.filter(l => l.category === 'Chief Minister' || l.category === 'Deputy Chief Minister' || l.category === 'Cabinet Minister');
  const mps = filteredLeaders.filter(l => l.category === 'Lok Sabha MP' || l.category === 'Rajya Sabha MP');

  const govtDepartments = [
    { name: `${stateData.name} General Administration Dept`, url: `${stateData.official_website}/gad` },
    { name: `${stateData.name} Finance & Revenue Department`, url: `${stateData.official_website}/finance` },
    { name: `${stateData.name} Home Affairs & Public Safety`, url: `${stateData.official_website}/home` },
    { name: `${stateData.name} Higher & School Education Dept`, url: `${stateData.official_website}/education` },
    { name: `${stateData.name} Health & Family Welfare Dept`, url: `${stateData.official_website}/health` },
    { name: `${stateData.name} Agriculture & Rural Development`, url: `${stateData.official_website}/agriculture` },
  ];

  const renderLeaderCard = (leader: SupabaseLeader) => (
    <div
      key={leader.id}
      className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow text-left"
    >
      <div className="h-28 bg-slate-50 relative overflow-hidden">
        <LeaderCover
          coverImage={leader.cover_image}
          name={leader.name}
          className="w-full h-full object-cover filter brightness-75"
        />
        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-emerald-600 text-white font-bold text-[8px] rounded uppercase font-mono tracking-wider">
          {leader.party}
        </span>
      </div>

      <div className="px-5 pb-5 relative -mt-7 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border-2 border-white dark:border-slate-950 shadow-md">
            <LeaderAvatar
              image={leader.image}
              name={leader.name}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="space-y-1 text-left">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
              {leader.name}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono leading-tight">
              {leader.designation}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1">
              {leader.bio}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-50 dark:border-slate-900/40 flex items-center justify-between mt-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {leader.constituency} ({leader.state})
            </span>
          </div>
          <button
            onClick={() => onSelectLeader(leader.slug)}
            className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            View Dossier
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 py-6 text-left animate-in fade-in duration-300">
      {/* Back Button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#080d0b] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-500" /> Back to Political Dashboard
        </button>
      </div>

      {/* LARGE BANNER */}
      <div
        className="relative rounded-3xl p-8 sm:p-12 text-white overflow-hidden shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${stateData.color}, #0f172a)`
        }}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl pointer-events-none -mr-30 -mt-30" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-black/40 text-white font-bold text-xs uppercase tracking-wider border border-white/20">
              {stateData.type} Dossier
            </span>
            <span className="px-3.5 py-1 rounded-full bg-emerald-500 text-white font-black text-xs uppercase tracking-wider">
              {stateData.party} ({stateData.alliance})
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {stateData.name}
          </h1>

          {/* Key Leadership Banner details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/15 text-xs text-white/90">
            <div className="bg-black/20 p-3 rounded-xl border border-white/10">
              <span className="text-white/60 block text-[10px] uppercase font-bold">Chief Minister</span>
              <span className="font-bold text-sm text-white mt-0.5 block">{stateData.chief_minister}</span>
            </div>

            <div className="bg-black/20 p-3 rounded-xl border border-white/10">
              <span className="text-white/60 block text-[10px] uppercase font-bold">Governor</span>
              <span className="font-bold text-sm text-white mt-0.5 block">{stateData.governor}</span>
            </div>

            <div className="bg-black/20 p-3 rounded-xl border border-white/10">
              <span className="text-white/60 block text-[10px] uppercase font-bold">Capital & Population</span>
              <span className="font-bold text-sm text-white mt-0.5 block">{stateData.capital} ({stateData.population})</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <a
              href={stateData.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm"
            >
              Official State Portal <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </a>
          </div>
        </div>
      </div>

      {/* POLITICAL STATISTICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">Assembly Majority</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
            {stateData.winning_seats} / {stateData.assembly_seats}
          </span>
          <span className="text-[10px] text-emerald-500 font-bold mt-1 block">Winning Seats</span>
        </div>

        <div className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">Lok Sabha Strength</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
            {stateData.lok_sabha_seats} MPs
          </span>
          <span className="text-[10px] text-blue-500 font-bold mt-1 block">Parliament Representatives</span>
        </div>

        <div className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">Rajya Sabha Strength</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
            {stateData.rajya_sabha_seats} MPs
          </span>
          <span className="text-[10px] text-purple-500 font-bold mt-1 block">Upper House</span>
        </div>

        <div className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block">Major Opposition</span>
          <span className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 block truncate">
            {stateData.major_opposition}
          </span>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Legislative Opposition</span>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="bg-white dark:bg-[#080d0b] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('mlas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mlas'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              MLAs ({mlas.length})
            </button>
            <button
              onClick={() => setActiveTab('cabinet')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'cabinet'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Cabinet Ministers
            </button>
            <button
              onClick={() => setActiveTab('mps')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'mps'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              MPs ({mps.length})
            </button>
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Government Departments
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${stateData.name} representatives...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === 'mlas' && (
          <div>
            {loading ? (
              <p className="text-slate-400 text-xs py-8 text-center">Fetching MLAs of {stateData.name}...</p>
            ) : mlas.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <p className="text-sm font-semibold">No MLA records indexed yet for {stateData.name}.</p>
                <p className="text-xs text-slate-500">You can add new MLAs using the Verification Query or Admin Portal.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mlas.map(renderLeaderCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cabinet' && (
          <div>
            {cabinet.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold">Chief Minister: {stateData.chief_minister}</p>
                <p className="text-xs text-slate-500 mt-1">Governor: {stateData.governor}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cabinet.map(renderLeaderCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mps' && (
          <div>
            {mps.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-semibold">Lok Sabha MPs: {stateData.lok_sabha_seats} | Rajya Sabha MPs: {stateData.rajya_sabha_seats}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mps.map(renderLeaderCard)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {govtDepartments.map((dept, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{dept.name}</h4>
                    <span className="text-[10px] text-slate-400">Official Government Department</span>
                  </div>
                </div>

                <a
                  href={dept.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
