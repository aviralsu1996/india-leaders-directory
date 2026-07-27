import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { INDIA_STATES_DATA, POLITICAL_TIMELINE_EVENTS, PARTY_COLORS } from '../../data/indiaPoliticalData';
import { Shield, Clock, TrendingUp, Award, Layers } from 'lucide-react';

export default function PoliticalAnalyticsPanel() {
  // 1. Calculate Government Distribution (by Party)
  const partyCounts: Record<string, number> = {};
  INDIA_STATES_DATA.forEach((s) => {
    partyCounts[s.party] = (partyCounts[s.party] || 0) + 1;
  });

  const pieChartData = Object.keys(partyCounts).map((party) => ({
    name: party,
    value: partyCounts[party],
    color: PARTY_COLORS[party] || '#64748b'
  })).sort((a, b) => b.value - a.value);

  // 2. Calculate Alliance Distribution
  const allianceCounts: Record<string, number> = {
    NDA: 0,
    'I.N.D.I.A': 0,
    'Un-aligned': 0,
  };

  INDIA_STATES_DATA.forEach((s) => {
    if (s.alliance === 'NDA') allianceCounts['NDA']++;
    else if (s.alliance === 'I.N.D.I.A') allianceCounts['I.N.D.I.A']++;
    else allianceCounts['Un-aligned']++;
  });

  const allianceData = [
    { name: 'NDA Alliance', value: allianceCounts['NDA'], color: '#f97316' },
    { name: 'I.N.D.I.A Alliance', value: allianceCounts['I.N.D.I.A'], color: '#2563eb' },
    { name: 'Un-aligned / Others', value: allianceCounts['Un-aligned'], color: '#64748b' },
  ];

  // 3. State-wise Party Control (Bar Chart Data)
  const barChartData = pieChartData.slice(0, 6).map((item) => ({
    party: item.name,
    States: item.value,
    fill: item.color
  }));

  return (
    <div className="space-y-6 text-left">
      {/* Widget Header */}
      <div className="flex items-center justify-between bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" /> Political Analytics & Power Share
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real-time breakdown across 36 Indian States & UTs</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-200/50 dark:border-emerald-900/30">
          2026 Live
        </span>
      </div>

      {/* 1. Pie Chart: Current Government Distribution */}
      <div className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-500" /> Current Government Distribution (Party-wise)
        </h4>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(val: any, name: any) => [`${val} State(s)`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Custom Legend */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-white/5 text-[11px]">
          {pieChartData.slice(0, 6).map((item) => (
            <div key={item.name} className="flex items-center space-x-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{item.name}:</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Second Chart: Alliance Distribution */}
      <div className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-blue-500" /> Alliance Distribution (NDA vs I.N.D.I.A)
        </h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={allianceData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, value }) => `${name.split(' ')[0]}: ${value}`}
              >
                {allianceData.map((entry, index) => (
                  <Cell key={`alliance-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Third Chart: State-wise Party Control */}
      <div className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-purple-500" /> Top Parties by States Governed
        </h4>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="party" type="category" stroke="#94a3b8" fontSize={11} width={60} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="States" radius={[0, 8, 8, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Fourth Widget: Political Timeline */}
      <div className="bg-white dark:bg-[#080d0b] p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-500" /> Recent Political Updates & Swearing-In Timeline
        </h4>
        <div className="space-y-3.5">
          {POLITICAL_TIMELINE_EVENTS.map((evt) => (
            <div key={evt.id} className="relative pl-4 border-l-2 border-emerald-500/40 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-900 dark:text-slate-100">{evt.state}</span>
                <span className="text-slate-400 font-mono">{evt.date}</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{evt.title}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {evt.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
