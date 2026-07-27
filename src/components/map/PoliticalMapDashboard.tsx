import React, { useState } from 'react';
import { INDIA_STATES_DATA, StateData } from '../../data/indiaPoliticalData';
import IndiaMap from './IndiaMap';
import PoliticalAnalyticsPanel from './PoliticalAnalyticsPanel';
import StateDrawer from './StateDrawer';
import PartyCardsSection from './PartyCardsSection';
import { Building, User, Shield, Users, MapPin, Search } from 'lucide-react';

interface PoliticalMapDashboardProps {
  onSelectStateSlug: (slug: string) => void;
  onViewMLAsForState: (stateName: string) => void;
}

export default function PoliticalMapDashboard({
  onSelectStateSlug,
  onViewMLAsForState
}: PoliticalMapDashboardProps) {
  const [selectedDrawerState, setSelectedDrawerState] = useState<StateData | null>(null);
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [stateFilter, setStateFilter] = useState<string>('');

  // Key KPI values
  const totalStatesAndUTs = INDIA_STATES_DATA.length; // 36
  const totalChiefMinisters = INDIA_STATES_DATA.filter(s => s.chief_minister && !s.chief_minister.includes('Central Governance')).length; // 30
  const totalPartiesCount = new Set(INDIA_STATES_DATA.map(s => s.party)).size; // Unique ruling parties
  const totalPopulationStr = '1.4+ Billion';

  const filteredStates = stateFilter
    ? INDIA_STATES_DATA.filter(s =>
        s.name.toLowerCase().includes(stateFilter.toLowerCase()) ||
        s.chief_minister.toLowerCase().includes(stateFilter.toLowerCase()) ||
        s.party.toLowerCase().includes(stateFilter.toLowerCase())
      )
    : INDIA_STATES_DATA;

  return (
    <div className="space-y-10 py-6 text-left animate-in fade-in duration-300">
      {/* 1. PAGE HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-sm border border-slate-800">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-3xl">
          <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/30 mb-4 inline-block">
            National Political Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            India Political Dashboard
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Live political representation across all Indian States and Union Territories.
          </p>
        </div>
      </div>

      {/* 2. TOP SECTION: 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-[#080d0b] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Total States & UTs
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {totalStatesAndUTs}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">
              28 States + 8 UTs
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Building className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-[#080d0b] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Chief Ministers
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {totalChiefMinisters}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1 block">
              Active Executive Heads
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <User className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-[#080d0b] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Political Parties
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {totalPartiesCount} Major
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 block">
              Governing Alliances
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-[#080d0b] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
              Population Covered
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
              {totalPopulationStr}
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1 block">
              Electoral Constituency
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. MAIN LAYOUT: DESKTOP LEFT (65%) & RIGHT (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDE (65% -> 8 cols out of 12) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-[#080d0b] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Interactive India Political Map
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hover state for quick dossier or click to inspect full legislature and cabinet
                </p>
              </div>

              {/* Quick Search State Input */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick find state..."
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* SVG Map Render */}
            <IndiaMap
              selectedStateSlug={selectedDrawerState?.slug}
              onSelectState={(state) => setSelectedDrawerState(state)}
              hoveredState={hoveredState}
              setHoveredState={setHoveredState}
              tooltipPos={tooltipPos}
              setTooltipPos={setTooltipPos}
            />

            {/* Quick State Grid Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Direct State Quick Select ({filteredStates.length} States & UTs):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredStates.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedDrawerState(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                      selectedDrawerState?.id === st.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                    {st.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (35% -> 4 cols out of 12) */}
        <div className="lg:col-span-4">
          <PoliticalAnalyticsPanel />
        </div>
      </div>

      {/* 4. BOTTOM SECTION: POLITICAL PARTY CARDS */}
      <PartyCardsSection />

      {/* State Detail Drawer Modal */}
      <StateDrawer
        state={selectedDrawerState}
        onClose={() => setSelectedDrawerState(null)}
        onViewMLAs={(stateName) => {
          setSelectedDrawerState(null);
          onViewMLAsForState(stateName);
        }}
        onViewStateDetail={(slug) => {
          setSelectedDrawerState(null);
          onSelectStateSlug(slug);
        }}
      />
    </div>
  );
}
