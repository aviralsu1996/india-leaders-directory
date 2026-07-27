import React, { useState } from 'react';
import { X, BarChart2, DollarSign, Download, ArrowRight, ShieldCheck, Building, Check, SlidersHorizontal, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { SalaryStructure } from '../../types';
import { salaryService } from '../../lib/salaryService';
import { exportSalaryCSV, exportSalaryExcel, exportSalaryJSON, exportSalaryPDF } from '../../lib/salaryExport';

interface SalaryComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLeaderSalary?: SalaryStructure;
}

export default function SalaryComparisonModal({ isOpen, onClose, currentLeaderSalary }: SalaryComparisonModalProps) {
  const [filterDesignation, setFilterDesignation] = useState<string>('All');
  const [metric, setMetric] = useState<'total' | 'basic' | 'annual'>('total');

  if (!isOpen) return null;

  const allSalaries = salaryService.getAllSalaries();

  const filteredSalaries = allSalaries.filter(s => {
    if (filterDesignation === 'All') return true;
    return s.designation.toLowerCase().includes(filterDesignation.toLowerCase());
  });

  const chartData = filteredSalaries.map(s => {
    const allowances = s.constituency_allowance + s.office_allowance + s.staff_allowance + s.travel_allowance;
    const totalMonthly = s.basic_salary + allowances;
    return {
      name: `${s.designation} (${s.state})`,
      shortName: s.state !== 'National / Central' && s.state !== 'All India Default' ? `${s.designation} - ${s.state}` : s.designation,
      basic: s.basic_salary,
      allowances: allowances,
      totalMonthly: totalMonthly,
      annual: s.annual_salary,
      raw: s
    };
  });

  // Sort by total monthly package descending
  chartData.sort((a, b) => b.totalMonthly - a.totalMonthly);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c120e] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-left">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-[#0c120e] z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Official Constitutional Salary & Package Benchmark Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparative breakdown of Monthly Salaries, Allowances, and Perquisites across Constitutional Authorities in India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Filter Position:</span>
              <select
                value={filterDesignation}
                onChange={(e) => setFilterDesignation(e.target.value)}
                className="bg-white dark:bg-slate-900 text-xs font-bold border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Positions (PM, CMs, MPs, MLAs, Governors)</option>
                <option value="Chief Minister">Chief Ministers</option>
                <option value="MLA">MLAs</option>
                <option value="Minister">Cabinet Ministers & MoS</option>
                <option value="MP">MPs (Lok Sabha & Rajya Sabha)</option>
                <option value="Governor">Governors</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold">
              <button
                onClick={() => setMetric('total')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metric === 'total' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Total Monthly Package
              </button>
              <button
                onClick={() => setMetric('basic')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metric === 'basic' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Basic Monthly
              </button>
              <button
                onClick={() => setMetric('annual')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  metric === 'annual' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Annual Salary
              </button>
            </div>
          </div>

          {/* Recharts Bar Chart Visualization */}
          <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Comparative Monthly Package Visualization (₹ INR)
              </h3>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                Official Government Notifications
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="shortName"
                    stroke="#94a3b8"
                    fontSize={10}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, metric === 'total' ? 'Total Monthly Package' : metric === 'basic' ? 'Basic Monthly' : 'Annual Salary']}
                  />
                  <Bar
                    dataKey={metric === 'total' ? 'totalMonthly' : metric === 'basic' ? 'basic' : 'annual'}
                    radius={[6, 6, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.raw.designation === currentLeaderSalary?.designation
                            ? '#10b981' // Highlight current leader position
                            : index % 2 === 0 ? '#059669' : '#0284c7'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Comparative Data Table */}
          <div className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-extrabold uppercase border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-3.5">Designation</th>
                    <th className="p-3.5">State / Level</th>
                    <th className="p-3.5 text-right">Basic Monthly</th>
                    <th className="p-3.5 text-right">Allowances</th>
                    <th className="p-3.5 text-right">Total Monthly</th>
                    <th className="p-3.5 text-right">Annual Package</th>
                    <th className="p-3.5 text-center">Export</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200 font-medium">
                  {chartData.map((item, idx) => {
                    const isCurrent = currentLeaderSalary && item.raw.id === currentLeaderSalary.id;
                    return (
                      <tr key={idx} className={isCurrent ? 'bg-emerald-50/80 dark:bg-emerald-950/40 font-bold' : 'hover:bg-slate-50 dark:hover:bg-white/5'}>
                        <td className="p-3.5 flex items-center gap-2">
                          {isCurrent && <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] uppercase font-black">Current</span>}
                          <span>{item.raw.designation}</span>
                        </td>
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">{item.raw.state}</td>
                        <td className="p-3.5 text-right font-mono">₹{item.basic.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right font-mono text-slate-500">₹{item.allowances.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{item.totalMonthly.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right font-mono text-slate-600 dark:text-slate-300">₹{item.annual.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => exportSalaryCSV(item.raw)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            CSV
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed italic">
            <strong>Official Disclaimer:</strong> Salary and allowances are based on officially published government notifications. Actual amounts may vary according to revisions, state-specific rules, allowances, and government orders.
          </div>
        </div>
      </div>
    </div>
  );
}
