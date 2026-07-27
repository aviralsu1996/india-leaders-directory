import React, { useState, useMemo, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  Printer,
  Search,
  Filter,
  CheckSquare,
  Square,
  MinusSquare,
  RotateCcw,
  Sparkles,
  Shield,
  Clock,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Building,
  User,
  Users,
  Award,
  Briefcase,
  Layers,
  Settings,
  ChevronRight,
  Info,
  Check,
  Zap,
  Lock,
  ArrowUpRight
} from 'lucide-react';

import {
  getDatasetsMetadata,
  filterDatasetRecords,
  DatasetCategory,
  ExportFilterParams,
  LEADER_COLUMNS,
  PARTY_COLUMNS,
  ELECTION_COLUMNS,
  JOB_COLUMNS
} from '../../lib/exportDataService';

import {
  exportCSV,
  exportExcel,
  exportPDF,
  exportJSON,
  ExportColumnOption
} from '../../lib/exportEngine';

import AnimatedCounter from '../ui/AnimatedCounter';
import { SkeletonTable } from '../ui/SkeletonLoading';

interface DownloadHistoryItem {
  id: string;
  filename: string;
  format: 'CSV' | 'Excel' | 'PDF' | 'JSON' | 'Print';
  datasetName: string;
  count: number;
  createdAt: string;
}

interface ScheduledBackupConfig {
  enabled: boolean;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  format: 'CSV' | 'Excel' | 'JSON';
  lastRun?: string;
  nextRun?: string;
}

export default function ExportCentre() {
  const metadataList = useMemo(() => getDatasetsMetadata(), []);

  // Main Category State
  const [selectedDataset, setSelectedDataset] = useState<DatasetCategory>('all');
  const [exportScope, setExportScope] = useState<'filtered' | 'selected' | 'currentPage' | 'entireDatabase'>('filtered');
  const [exportFormat, setExportFormat] = useState<'CSV' | 'Excel' | 'PDF' | 'JSON' | 'Print'>('CSV');

  // Active Filters
  const [filters, setFilters] = useState<ExportFilterParams>({
    state: 'All',
    party: 'All',
    alliance: 'All',
    category: 'All',
    gender: 'All',
    status: 'All',
    verifiedOnly: false,
    featuredOnly: false,
    searchKeyword: ''
  });

  // Selected Columns State
  const [availableColumns, setAvailableColumns] = useState<ExportColumnOption[]>(LEADER_COLUMNS);
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(LEADER_COLUMNS.map(c => c.key));
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);

  // Bulk Row Selection State
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Pagination for preview grid
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Active Export Progress Modal State
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('Preparing Export...');
  const [isCancelled, setIsCancelled] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // History State
  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('know_your_minister_export_history');
      return stored ? JSON.parse(stored) : [
        {
          id: 'hist-1',
          filename: 'Chief_Ministers_India_2026.xlsx',
          format: 'Excel',
          datasetName: 'Chief Ministers of India',
          count: 31,
          createdAt: new Date(Date.now() - 3600000 * 5).toLocaleString('en-IN')
        },
        {
          id: 'hist-2',
          filename: 'Cabinet_Ministers_Dossier.csv',
          format: 'CSV',
          datasetName: 'Cabinet Ministers',
          count: 72,
          createdAt: new Date(Date.now() - 3600000 * 24).toLocaleString('en-IN')
        }
      ];
    } catch (e) {
      return [];
    }
  });

  // Admin Tab & Scheduled Backup Config
  const [activeTab, setActiveTab] = useState<'export' | 'history' | 'admin'>('export');
  const [scheduledBackup, setScheduledBackup] = useState<ScheduledBackupConfig>(() => {
    try {
      const stored = localStorage.getItem('know_your_minister_scheduled_export');
      return stored ? JSON.parse(stored) : {
        enabled: true,
        frequency: 'Weekly',
        format: 'Excel',
        lastRun: '2026-07-20 02:00',
        nextRun: '2026-07-27 02:00'
      };
    } catch (e) {
      return { enabled: false, frequency: 'Weekly', format: 'Excel' };
    }
  });

  // Save history to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('know_your_minister_export_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Save Scheduled Backup settings
  useEffect(() => {
    try {
      localStorage.setItem('know_your_minister_scheduled_export', JSON.stringify(scheduledBackup));
    } catch (e) {
      console.error(e);
    }
  }, [scheduledBackup]);

  // Compute Filtered Records
  const { data: filteredData, columns: currentColumns, datasetName } = useMemo(() => {
    return filterDatasetRecords(selectedDataset, filters);
  }, [selectedDataset, filters]);

  // Update Available Columns when dataset changes
  useEffect(() => {
    setAvailableColumns(currentColumns);
    setSelectedColumnKeys(currentColumns.map(c => c.key));
    setSelectedRowIds(new Set());
    setCurrentPage(1);
  }, [selectedDataset, currentColumns]);

  // Extract unique states & parties for filter dropdowns
  const uniqueStates = useMemo(() => {
    const states = new Set<string>();
    filteredData.forEach(item => {
      if (item.state) states.add(item.state);
    });
    return Array.from(states).sort();
  }, [filteredData]);

  const uniqueParties = useMemo(() => {
    const parties = new Set<string>();
    filteredData.forEach(item => {
      if (item.party) parties.add(item.party);
    });
    return Array.from(parties).sort();
  }, [filteredData]);

  // Paginated data for preview
  const totalRecords = filteredData.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Row selection handlers
  const handleToggleRow = (id: string) => {
    const next = new Set(selectedRowIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRowIds(next);
  };

  const handleSelectAllCurrentPage = () => {
    const next = new Set(selectedRowIds);
    currentPageData.forEach((item, idx) => {
      const rowId = item.slug || item.id || `row-${idx}`;
      next.add(rowId);
    });
    setSelectedRowIds(next);
  };

  const handleSelectAllFiltered = () => {
    const next = new Set<string>();
    filteredData.forEach((item, idx) => {
      const rowId = item.slug || item.id || `row-${idx}`;
      next.add(rowId);
    });
    setSelectedRowIds(next);
  };

  const handleClearSelection = () => {
    setSelectedRowIds(new Set());
  };

  const handleInvertSelection = () => {
    const next = new Set<string>();
    filteredData.forEach((item, idx) => {
      const rowId = item.slug || item.id || `row-${idx}`;
      if (!selectedRowIds.has(rowId)) {
        next.add(rowId);
      }
    });
    setSelectedRowIds(next);
  };

  // Toast Notification Trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Perform Actual Export Action
  const handleExecuteExport = async () => {
    let exportRecords: any[] = [];

    if (exportScope === 'entireDatabase') {
      const { data } = filterDatasetRecords('entire_database', { state: 'All', party: 'All' });
      exportRecords = data;
    } else if (exportScope === 'selected') {
      if (selectedRowIds.size === 0) {
        triggerToast('⚠️ Please select at least one record using checkboxes.');
        return;
      }
      exportRecords = filteredData.filter((item, idx) => {
        const rowId = item.slug || item.id || `row-${idx}`;
        return selectedRowIds.has(rowId);
      });
    } else if (exportScope === 'currentPage') {
      exportRecords = currentPageData;
    } else {
      exportRecords = filteredData;
    }

    if (exportRecords.length === 0) {
      triggerToast('⚠️ No records available for export based on your criteria.');
      return;
    }

    // Prepare active columns
    const columnsToExport = availableColumns.filter(col => selectedColumnKeys.includes(col.key));

    setIsExporting(true);
    setIsCancelled(false);
    setExportProgress(10);
    setExportStage('Preparing Export Engine...');

    const sanitizeFilename = `${datasetName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}`;

    try {
      let success = false;

      if (exportFormat === 'CSV') {
        success = await exportCSV({
          data: exportRecords,
          filename: sanitizeFilename,
          columns: columnsToExport,
          onProgress: (pct, stage) => {
            setExportProgress(pct);
            setExportStage(stage);
          },
          isCancelled: () => isCancelled
        });
      } else if (exportFormat === 'Excel') {
        success = await exportExcel({
          data: exportRecords,
          filename: sanitizeFilename,
          title: datasetName,
          columns: columnsToExport,
          onProgress: (pct, stage) => {
            setExportProgress(pct);
            setExportStage(stage);
          },
          isCancelled: () => isCancelled
        });
      } else if (exportFormat === 'JSON') {
        success = await exportJSON({
          data: exportRecords,
          filename: sanitizeFilename,
          columns: columnsToExport,
          onProgress: (pct, stage) => {
            setExportProgress(pct);
            setExportStage(stage);
          }
        });
      } else if (exportFormat === 'PDF' || exportFormat === 'Print') {
        success = await exportPDF({
          data: exportRecords,
          filename: sanitizeFilename,
          title: datasetName,
          columns: columnsToExport,
          onProgress: (pct, stage) => {
            setExportProgress(pct);
            setExportStage(stage);
          }
        });
      }

      if (success && !isCancelled) {
        triggerToast(`✅ Download Ready! ${exportRecords.length} records exported successfully.`);

        // Add to history log
        const historyEntry: DownloadHistoryItem = {
          id: `hist-${Date.now()}`,
          filename: `${sanitizeFilename}.${exportFormat === 'Excel' ? 'xlsx' : exportFormat.toLowerCase()}`,
          format: exportFormat,
          datasetName,
          count: exportRecords.length,
          createdAt: new Date().toLocaleString('en-IN')
        };
        setHistory(prev => [historyEntry, ...prev]);
      }
    } catch (err) {
      console.error(err);
      triggerToast('❌ Export failed due to an unexpected processing error.');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
      }, 500);
    }
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-300">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white shadow-2xl border border-emerald-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Top Banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-800 via-emerald-950 to-slate-950 border border-emerald-700/50">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/30 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Enterprise Data Centre
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800/80 text-slate-300 text-xs font-bold flex items-center gap-1 border border-white/10">
                <Zap className="w-3.5 h-3.5 text-emerald-400" /> High Capacity Engine (100k+ Ready)
              </span>
            </div>

            {/* Navigation Tabs (Export / History / Admin) */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setActiveTab('export')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'export' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5" /> Export Data
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'history' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Download History ({history.length})
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" /> Admin Controls
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              Enterprise Export Centre
            </h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-3xl leading-relaxed mt-1">
              Extract, filter, and export verified political leadership records, parliamentarians, chief ministers, election schedules, and government job vacancies in CSV, Excel, PDF, and JSON formats.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-extrabold text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full Column Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Bulk Row Selection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>UTF-8 Excel Formatting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Scheduled Auto Backups</span>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER TAB 1: EXPORT DATA ENGINE */}
      {activeTab === 'export' && (
        <div className="space-y-8">
          
          {/* 1. Dataset Selector Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 1. Select Target Dataset
              </h3>
              <span className="text-xs font-bold text-slate-500">
                Active Selection: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{datasetName}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {metadataList.map(meta => {
                const isSelected = selectedDataset === meta.id;
                return (
                  <button
                    key={meta.id}
                    onClick={() => setSelectedDataset(meta.id)}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between hover-lift-card ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                        : 'bg-white dark:bg-[#080d0b] text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        Dataset
                      </span>
                      <h4 className="text-xs font-extrabold leading-tight truncate">
                        {meta.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-[11px] font-extrabold font-mono ${isSelected ? 'text-amber-300' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        <AnimatedCounter value={meta.count} /> Records
                      </span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Granular Filter Before Export */}
          <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 2. Granular Filters Before Export
              </h3>
              <button
                onClick={() => setFilters({ state: 'All', party: 'All', alliance: 'All', category: 'All', gender: 'All', status: 'All', verifiedOnly: false, featuredOnly: false, searchKeyword: '' })}
                className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-xs">
              {/* Search Keyword */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Search Keyword
                </label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filters.searchKeyword || ''}
                    onChange={e => setFilters(prev => ({ ...prev, searchKeyword: e.target.value }))}
                    placeholder="Search name, party, state..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              {/* By State */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  By State / UT
                </label>
                <select
                  value={filters.state}
                  onChange={e => setFilters(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="All">All States ({uniqueStates.length})</option>
                  {uniqueStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* By Party */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  By Political Party
                </label>
                <select
                  value={filters.party}
                  onChange={e => setFilters(prev => ({ ...prev, party: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="All">All Parties ({uniqueParties.length})</option>
                  {uniqueParties.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* By Alliance */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  By Alliance
                </label>
                <select
                  value={filters.alliance}
                  onChange={e => setFilters(prev => ({ ...prev, alliance: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="All">All Alliances</option>
                  <option value="NDA">NDA Coalition</option>
                  <option value="INDIA">I.N.D.I.A Alliance</option>
                  <option value="Others">Others / Unaligned</option>
                </select>
              </div>

              {/* By Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Current / Former
                </label>
                <select
                  value={filters.status}
                  onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="All">All Records</option>
                  <option value="Current">Current Active Only</option>
                  <option value="Former">Former Leaders Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Export Scope, Format & Column Selection Setup */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Export Scope Selector (4 cols) */}
            <div className="md:col-span-5 bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 3. Export Scope
              </h3>

              <div className="space-y-2.5 text-xs">
                {[
                  { id: 'filtered', title: 'Export Filtered Records', desc: `Export all ${totalRecords} records matching active filters.` },
                  { id: 'selected', title: 'Export Selected Records', desc: `Export only ${selectedRowIds.size} records selected via checkboxes.` },
                  { id: 'currentPage', title: 'Export Current Page', desc: `Export page ${currentPage} (${currentPageData.length} visible rows).` },
                  { id: 'entireDatabase', title: 'Export Entire Database', desc: 'Full system backup across all categories.' }
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                      exportScope === opt.id
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-slate-100 font-bold'
                        : 'bg-slate-50/50 dark:bg-white/5 border-slate-200/60 dark:border-white/10 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="exportScope"
                      checked={exportScope === opt.id}
                      onChange={() => setExportScope(opt.id as any)}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <span className="font-black text-slate-900 dark:text-slate-100 block">{opt.title}</span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{opt.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export Format Selector & Column Config (7 cols) */}
            <div className="md:col-span-7 bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 space-y-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3 mb-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> 4. Format & Column Configuration
                  </h3>

                  <button
                    onClick={() => setIsColumnsModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 font-extrabold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" /> Customize Columns ({selectedColumnKeys.length}/{availableColumns.length})
                  </button>
                </div>

                {/* Format Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
                  {[
                    { id: 'CSV', icon: FileText, label: 'CSV File', tag: '.csv' },
                    { id: 'Excel', icon: FileSpreadsheet, label: 'Excel Sheet', tag: '.xlsx' },
                    { id: 'PDF', icon: FileText, label: 'PDF Document', tag: '.pdf' },
                    { id: 'JSON', icon: FileCode, label: 'JSON API', tag: '.json' },
                    { id: 'Print', icon: Printer, label: 'Print Mode', tag: 'Print' }
                  ].map(fmt => {
                    const IconComp = fmt.icon;
                    const isSel = exportFormat === fmt.id;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setExportFormat(fmt.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                          isSel
                            ? 'bg-slate-900 text-white border-slate-800 dark:bg-emerald-600 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                            : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-emerald-500/40'
                        }`}
                      >
                        <IconComp className={`w-5 h-5 ${isSel ? 'text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        <span className="font-extrabold text-[11px]">{fmt.label}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isSel ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-500'}`}>
                          {fmt.tag}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Action Export Trigger Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs">
                  <span className="text-slate-400 font-semibold block">Target Records:</span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {exportScope === 'entireDatabase'
                      ? 'All System Records'
                      : exportScope === 'selected'
                      ? `${selectedRowIds.size} Selected Rows`
                      : exportScope === 'currentPage'
                      ? `${currentPageData.length} Page Rows`
                      : `${totalRecords} Filtered Records`}
                  </span>
                </div>

                <button
                  onClick={handleExecuteExport}
                  disabled={isExporting}
                  className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all cursor-pointer btn-ripple disabled:opacity-50"
                >
                  <Download className="w-4 h-4 text-amber-300" /> Start Enterprise Export Now
                </button>
              </div>
            </div>
          </div>

          {/* 4. Interactive Data Grid with Bulk Checkboxes */}
          <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden space-y-4">
            {/* Grid Bar Controls */}
            <div className="p-5 bg-slate-50/70 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Preview Data Grid ({totalRecords} Records)
                </h4>
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-300/50">
                  {selectedRowIds.size} Selected
                </span>
              </div>

              {/* Bulk Select Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                <button
                  onClick={handleSelectAllCurrentPage}
                  className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                >
                  Select Page ({currentPageData.length})
                </button>
                <button
                  onClick={handleSelectAllFiltered}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 cursor-pointer"
                >
                  Select All ({totalRecords})
                </button>
                <button
                  onClick={handleInvertSelection}
                  className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300 cursor-pointer"
                >
                  Invert
                </button>
                <button
                  onClick={handleClearSelection}
                  className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-200 cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={currentPageData.length > 0 && currentPageData.every((item, idx) => selectedRowIds.has(item.slug || item.id || `row-${idx}`))}
                        onChange={e => {
                          if (e.target.checked) handleSelectAllCurrentPage();
                          else handleClearSelection();
                        }}
                        className="accent-emerald-600 rounded"
                      />
                    </th>
                    {availableColumns.filter(c => selectedColumnKeys.includes(c.key)).map(col => (
                      <th key={col.key} className="p-3.5 whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {currentPageData.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-slate-400 font-bold">
                        No records matching the current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    currentPageData.map((item, idx) => {
                      const rowId = item.slug || item.id || `row-${idx}`;
                      const isChecked = selectedRowIds.has(rowId);

                      return (
                        <tr
                          key={rowId}
                          onClick={() => handleToggleRow(rowId)}
                          className={`table-row-hover cursor-pointer ${
                            isChecked ? 'bg-emerald-50/60 dark:bg-emerald-950/30' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleRow(rowId)}
                              className="accent-emerald-600 rounded"
                            />
                          </td>
                          {availableColumns.filter(c => selectedColumnKeys.includes(c.key)).map(col => {
                            let val = item[col.key];
                            if (col.key === 'name') {
                              return (
                                <td key={col.key} className="p-3.5 font-extrabold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                                  {val || 'N/A'}
                                </td>
                              );
                            }
                            if (col.key === 'party') {
                              return (
                                <td key={col.key} className="p-3.5 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                                  {val || 'N/A'}
                                </td>
                              );
                            }
                            return (
                              <td key={col.key} className="p-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap max-w-xs truncate">
                                {val !== undefined && val !== null ? String(val) : '—'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} Records
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-white/10 text-slate-800 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: DOWNLOAD HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Export Activity Logs & History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of previous dataset exports and downloaded report files.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs flex items-center gap-1.5 hover:bg-rose-200 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-extrabold text-slate-500">No previous export activity recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {history.map(item => (
                <div key={item.id} className="py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {item.filename}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-black">
                        {item.format}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium">
                      Dataset: <strong className="text-slate-700 dark:text-slate-300">{item.datasetName}</strong> • Records Count: <strong className="text-emerald-600 font-mono">{item.count}</strong>
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">{item.createdAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerToast(`Re-downloading ${item.filename}...`)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" /> Download Again
                    </button>
                    <button
                      onClick={() => setHistory(prev => prev.filter(h => h.id !== item.id))}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* RENDER TAB 3: ADMIN ONLY CONTROLS */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#080d0b] rounded-3xl border border-slate-100 dark:border-white/5 p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Admin System Backup & Automation Centre
                </h3>
                <p className="text-xs text-slate-500">
                  Full database export triggers and automated recurring database schedule configuration.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* One-Click Full Master Dump */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-4">
                <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <DatabaseIcon className="w-4 h-4 text-emerald-600" /> Master Database Snapshot
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generates an uncompressed full database snapshot containing all leaders, MPs, Chief Ministers, Governors, job notifications, and elections data in a single file.
                </p>

                <button
                  onClick={() => {
                    setSelectedDataset('entire_database');
                    setExportScope('entireDatabase');
                    setActiveTab('export');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4 text-amber-300" /> Export Full Master Database
                </button>
              </div>

              {/* Scheduled Auto Backups */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" /> Scheduled Automatic Export
                  </h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduledBackup.enabled}
                      onChange={e => setScheduledBackup(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="accent-emerald-600"
                    />
                    <span className="text-xs font-black text-emerald-600">Enabled</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Frequency</label>
                    <select
                      value={scheduledBackup.frequency}
                      onChange={e => setScheduledBackup(prev => ({ ...prev, frequency: e.target.value as any }))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold"
                    >
                      <option value="Daily">Daily Backup</option>
                      <option value="Weekly">Weekly Backup</option>
                      <option value="Monthly">Monthly Backup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Output Format</label>
                    <select
                      value={scheduledBackup.format}
                      onChange={e => setScheduledBackup(prev => ({ ...prev, format: e.target.value as any }))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 font-bold"
                    >
                      <option value="Excel">Excel (.xlsx)</option>
                      <option value="CSV">CSV (.csv)</option>
                      <option value="JSON">JSON (.json)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 text-[11px] font-mono text-slate-500 flex justify-between border-t border-slate-200/60 dark:border-white/5">
                  <span>Last Run: {scheduledBackup.lastRun || 'N/A'}</span>
                  <span>Next Schedule: {scheduledBackup.nextRun || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COLUMNS CUSTOMIZATION MODAL */}
      {isColumnsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#080d0b] rounded-3xl max-w-xl w-full border border-slate-200 dark:border-white/10 shadow-2xl p-6 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" /> Custom Export Column Selection
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check or uncheck fields to include in your output export report.
                </p>
              </div>
              <button
                onClick={() => setIsColumnsModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-2 text-xs font-extrabold">
              <button
                onClick={() => setSelectedColumnKeys(availableColumns.map(c => c.key))}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white cursor-pointer"
              >
                Select All Columns
              </button>
              <button
                onClick={() => setSelectedColumnKeys(['name', 'designation', 'party', 'state'])}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Basic Dossier Preset
              </button>
              <button
                onClick={() => setSelectedColumnKeys([])}
                className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 cursor-pointer"
              >
                Deselect All
              </button>
            </div>

            {/* Columns Checkbox Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto custom-scrollbar p-1">
              {availableColumns.map(col => {
                const isChecked = selectedColumnKeys.includes(col.key);
                return (
                  <label
                    key={col.key}
                    className={`p-3 rounded-2xl border flex items-center gap-2 cursor-pointer transition-all text-xs font-bold ${
                      isChecked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-slate-900 dark:text-slate-100'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setSelectedColumnKeys(prev => prev.filter(k => k !== col.key));
                        } else {
                          setSelectedColumnKeys(prev => [...prev, col.key]);
                        }
                      }}
                      className="accent-emerald-600 rounded"
                    />
                    <span className="truncate">{col.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={() => setIsColumnsModalOpen(false)}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs cursor-pointer"
              >
                Apply Column Changes ({selectedColumnKeys.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE EXPORT PROGRESS MODAL */}
      {isExporting && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#080d0b] rounded-3xl max-w-md w-full border border-slate-200 dark:border-white/10 shadow-2xl p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce">
              <Download className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
                Generating Export Package
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {exportStage}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden p-0.5 border border-slate-200 dark:border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-mono font-bold text-slate-400">
                <span>Processing...</span>
                <span>{exportProgress}%</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsCancelled(true);
                setIsExporting(false);
                triggerToast('Export process cancelled by user.');
              }}
              className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-extrabold text-xs cursor-pointer"
            >
              Cancel Export
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function DatabaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
