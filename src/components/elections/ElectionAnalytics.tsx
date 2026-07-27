import React from 'react';
import { ElectionRecord } from '../../data/electionsData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp, ShieldAlert, Award } from 'lucide-react';

interface ElectionAnalyticsProps {
  elections: ElectionRecord[];
}

export default function ElectionAnalytics({ elections }: ElectionAnalyticsProps) {
  // 1. Data for Pie Chart: Upcoming Elections by Type
  const typeCounts: Record<string, number> = {};
  elections.forEach((e) => {
    typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
  });

  const pieData = Object.keys(typeCounts).map((type) => ({
    name: type,
    value: typeCounts[type]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  // 2. Data for Bar Chart: Election Count per Year
  const yearCounts: Record<number, number> = {};
  elections.forEach((e) => {
    yearCounts[e.year] = (yearCounts[e.year] || 0) + 1;
  });

  const barData = Object.keys(yearCounts)
    .map((yr) => ({
      year: yr,
      count: yearCounts[Number(yr)]
    }))
    .sort((a, b) => Number(a.year) - Number(b.year));

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chart 1: Pie Chart - Elections by Type */}
        <div className="bg-white dark:bg-[#080d0b] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-emerald-500" /> Elections Distribution by Type
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Breakdown across State Assembly, Lok Sabha, Bye Elections & Upper House
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Table */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-white/5 text-xs">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-black text-slate-900 dark:text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Bar Chart - Elections Count per Year */}
        <div className="bg-white dark:bg-[#080d0b] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" /> Election Cycle Volume per Year
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Number of major elections scheduled or conducted from 2024 to 2029
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="year" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} name="Elections Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Statistical Highlights */}
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Peak Assembly Election Year:</span>
              <span className="font-black text-emerald-600 dark:text-emerald-400">2026 (5 Assembly Polls)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Next Parliamentary General Polls:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">2029 (19th Lok Sabha)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
