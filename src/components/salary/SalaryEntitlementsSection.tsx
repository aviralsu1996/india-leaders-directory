import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Home, Car, Shield, Heart, Phone, Wifi, FileText, 
  Award, Download, Scale, RefreshCw, CheckCircle2, ChevronDown, 
  Sparkles, ExternalLink, Info, Building, User, Briefcase, Calendar
} from 'lucide-react';
import { SupabaseLeader, SalaryStructure } from '../../types';
import { salaryService } from '../../lib/salaryService';
import { exportSalaryCSV, exportSalaryExcel, exportSalaryJSON, exportSalaryPDF } from '../../lib/salaryExport';
import SalaryComparisonModal from './SalaryComparisonModal';

interface SalaryEntitlementsSectionProps {
  leader: SupabaseLeader;
}

export default function SalaryEntitlementsSection({ leader }: SalaryEntitlementsSectionProps) {
  const [salary, setSalary] = useState<SalaryStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [exportMenuOpen, setExportMenuOpen] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  useEffect(() => {
    loadSalaryData();
  }, [leader.id, leader.designation, leader.state]);

  const loadSalaryData = () => {
    setLoading(true);
    try {
      // Automatically fetch salary according to Designation, State, and Position from salaryService
      const data = salaryService.getSalaryByLeader(leader);
      setSalary(data);
    } catch (e) {
      console.warn('Error fetching salary structure:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      const res = await salaryService.syncSalary();
      loadSalaryData();
      setSyncNotice(`Synced ${res.syncedCount} records from Gazette & Parliament sources.`);
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (e) {
      console.error('Salary sync error:', e);
    } finally {
      setSyncing(false);
    }
  };

  if (loading || !salary) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 animate-pulse space-y-4 text-left">
        <div className="h-6 w-64 bg-slate-200 dark:bg-white/10 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 dark:bg-white/10 rounded-2xl" />
          <div className="h-24 bg-slate-200 dark:bg-white/10 rounded-2xl" />
          <div className="h-24 bg-slate-200 dark:bg-white/10 rounded-2xl" />
          <div className="h-24 bg-slate-200 dark:bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalAllowances = salary.constituency_allowance + salary.office_allowance + salary.staff_allowance + salary.travel_allowance;
  const totalMonthly = salary.basic_salary + totalAllowances;

  return (
    <div className="space-y-6 text-left my-8 animate-in fade-in duration-300">
      {/* Section Header */}
      <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider">
                  Official Gazette Data
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Ref: {salary.source}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                Salary, Benefits & Official Entitlements
              </h3>
            </div>
          </div>

          {/* Action Bar: Compare & Export */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowComparison(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200/60 dark:border-white/10"
            >
              <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Compare Salaries
            </button>

            {/* Sync Engine Button */}
            <button
              onClick={handleTriggerSync}
              disabled={syncing}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Sync latest salary updates from Government Gazette"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync'}
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export
                <ChevronDown className="w-3 h-3" />
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-30 py-2 text-xs font-bold space-y-1">
                  <button
                    onClick={() => { exportSalaryCSV(salary, leader.name); setExportMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
                  </button>
                  <button
                    onClick={() => { exportSalaryExcel(salary, leader.name); setExportMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Export Excel
                  </button>
                  <button
                    onClick={() => { exportSalaryJSON(salary, leader.name); setExportMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" /> Export JSON
                  </button>
                  <button
                    onClick={() => { exportSalaryPDF(salary, leader.name); setExportMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2 cursor-pointer border-t border-slate-100 dark:border-white/5 pt-2"
                  >
                    <Download className="w-3.5 h-3.5 text-red-600" /> Download PDF / Print
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {syncNotice && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {syncNotice}
          </div>
        )}

        {/* Top 4 Premium Salary Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Monthly Basic Salary */}
          <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/40 hover:-translate-y-1 transition-all group">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Monthly Salary
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              ₹{salary.basic_salary.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
              Statutory Monthly Base Pay
            </span>
          </div>

          {/* Annual Salary */}
          <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/40 hover:-translate-y-1 transition-all group">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Annual Salary
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              ₹{salary.annual_salary.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
              Annual Base Pay (Excluding Allowances)
            </span>
          </div>

          {/* Total Allowances */}
          <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-emerald-500/40 hover:-translate-y-1 transition-all group">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Monthly Allowances
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block font-mono group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              ₹{totalAllowances.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-1 block">
              Constituency, Office & Travel Allowances
            </span>
          </div>

          {/* Total Estimated Monthly Package Highlight Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white p-5 rounded-2xl border border-emerald-500/30 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-600/20 transition-all relative overflow-hidden group">
            <div className="absolute top-2 right-2 p-1 bg-white/10 rounded-lg">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-100 block">
              Total Estimated Monthly Package
            </span>
            <span className="text-2xl font-black text-white mt-1 block font-mono">
              ₹{totalMonthly.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-100/80 font-medium mt-1 block">
              Comprehensive Combined Monthly Entitlement
            </span>
          </div>
        </div>

        {/* Detailed Entitlements Grid (16 Key Items) */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Complete Constitutional & Government Entitlements Schedule
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* 1. Basic Monthly Salary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Basic Monthly Salary</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">₹{salary.basic_salary.toLocaleString('en-IN')} / month</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Statutory base salary passed under State/Central Remuneration Act.</span>
              </div>
            </div>

            {/* 2. Total Monthly Salary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <DollarSign className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Total Monthly Salary</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">₹{totalMonthly.toLocaleString('en-IN')} / month</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Net monthly package including all fixed constitutional allowances.</span>
              </div>
            </div>

            {/* 3. Annual Salary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Annual Salary</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">₹{salary.annual_salary.toLocaleString('en-IN')} / annum</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Cumulative base salary per financial year.</span>
              </div>
            </div>

            {/* 4. Constituency Allowance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Building className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Constituency Allowance</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">₹{salary.constituency_allowance.toLocaleString('en-IN')} / month</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">For constituency visits, public meetings, and local constituent outreach.</span>
              </div>
            </div>

            {/* 5. Office Allowance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Briefcase className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Office Allowance</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">₹{salary.office_allowance.toLocaleString('en-IN')} / month</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Stationery, printing, postage, and constituent office maintenance.</span>
              </div>
            </div>

            {/* 6. Staff Allowance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <User className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Staff Allowance</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">₹{salary.staff_allowance.toLocaleString('en-IN')} / month</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Salaries for secretarial staff, research assistants, and office clerks.</span>
              </div>
            </div>

            {/* 7. Travel Allowance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Car className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Travel Allowance</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">₹{salary.travel_allowance.toLocaleString('en-IN')} / month</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Fuel reimbursement, official state travel, and transport coupons.</span>
              </div>
            </div>

            {/* 8. Daily Allowance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Daily Allowance (Session Days)</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">₹{salary.daily_allowance.toLocaleString('en-IN')} / day</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Applicable during active legislative assembly / parliamentary sessions.</span>
              </div>
            </div>

            {/* 9. Housing Facility & Residence */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Home className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Housing Facility & Official Residence</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{salary.housing}</span>
              </div>
            </div>

            {/* 10. Official Vehicle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Car className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Official Vehicle</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{salary.vehicle}</span>
              </div>
            </div>

            {/* 11. Security Category */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Security Category</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{salary.security}</span>
              </div>
            </div>

            {/* 12. Medical Benefits */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Heart className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Medical Benefits</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{salary.medical}</span>
              </div>
            </div>

            {/* 13. Pension Eligibility */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Pension Eligibility</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{salary.pension}</span>
              </div>
            </div>

            {/* 14. Official Residence */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Home className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Official Residence Provision</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{salary.housing}</span>
              </div>
            </div>

            {/* 15. Communication Allowance */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Communication Allowance</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{salary.telephone} | {salary.internet}</span>
              </div>
            </div>

            {/* 16. Other Government Benefits */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Other Government Benefits</span>
                <span className="text-slate-700 dark:text-slate-300 block mt-0.5">{salary.other_benefits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Official Notification Footer Link */}
        <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>Effective Date: <strong className="text-slate-700 dark:text-slate-300">{salary.effective_from}</strong> (Last Audited: {salary.last_updated})</span>
          <a
            href={salary.official_notification}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold inline-flex items-center gap-1"
          >
            Official Gazette Source <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Required Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
          <strong>Disclaimer:</strong> Salary and allowances are based on officially published government notifications. Actual amounts may vary according to revisions, state-specific rules, allowances, and government orders.
        </div>
      </div>

      {/* Salary Comparison Modal */}
      <SalaryComparisonModal
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        currentLeaderSalary={salary}
      />
    </div>
  );
}
