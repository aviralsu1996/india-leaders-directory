import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, Upload, CheckCircle2, AlertCircle, 
  Trash2, Play, Download, Loader2, ArrowRight, HelpCircle
} from 'lucide-react';
import { dbService, getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { SupabaseLeader, LeaderCategory } from '../../types';

interface BulkImportProps {
  onImportComplete: () => void;
}

interface PreviewRecord {
  id_temp: string;
  name: string;
  slug: string;
  designation: string;
  category: LeaderCategory;
  state: string;
  constituency: string;
  party: string;
  bio: string;
  image: string;
  isValid: boolean;
  errors: string[];
  isDuplicate: boolean;
  duplicateAction: 'skip' | 'update';
}

export default function BulkImport({ onImportComplete }: BulkImportProps) {
  const [records, setRecords] = useState<PreviewRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [updateExisting, setUpdateExisting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [logs, setLogs] = useState<{ type: 'info' | 'success' | 'error'; text: string }[]>([]);
  const [importStats, setImportStats] = useState<{ success: number; failed: number; skipped: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse CSV helper function with robust quote handling
  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r?\n/);
    const result: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const row: string[] = [];
      let inQuotes = false;
      let currentValue = '';

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      row.push(currentValue.trim());
      result.push(row);
    }
    return result;
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setLogs([]);
    setImportStats(null);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length <= 1) {
          setLogs([{ type: 'error', text: 'CSV is empty or only contains header columns.' }]);
          setLoading(false);
          return;
        }

        // Map header column indices
        const headers = parsed[0].map(h => h.toLowerCase().trim());
        const colIndices = {
          name: headers.findIndex(h => h === 'name' || h.includes('full_name') || h === 'leader name'),
          designation: headers.findIndex(h => h === 'designation' || h.includes('role')),
          category: headers.findIndex(h => h === 'category' || h.includes('portfolio')),
          state: headers.findIndex(h => h === 'state' || h === 'state_name'),
          constituency: headers.findIndex(h => h === 'constituency' || h === 'constituency_name'),
          party: headers.findIndex(h => h === 'political party' || h === 'political_party' || h === 'party'),
          bio: headers.findIndex(h => h === 'biography' || h === 'bio' || h === 'description'),
          image: headers.findIndex(h => h === 'profile image url' || h === 'profile_image' || h === 'image' || h === 'photo')
        };

        // Check if we at least matched "name" column
        if (colIndices.name === -1) {
          setLogs([{ type: 'error', text: "Critical: Could not locate the 'Name' or 'full_name' column. Please check column headers." }]);
          setLoading(false);
          return;
        }

        // Get existing leaders to check for duplicate slug/name
        let existingLeaders: SupabaseLeader[] = [];
        try {
          existingLeaders = await dbService.getLeaders();
        } catch (err) {
          console.warn('Failed to pre-fetch existing leaders for duplicate check:', err);
        }

        const validCategories: LeaderCategory[] = [
          'Prime Minister', 'Chief Minister', 'Deputy Chief Minister', 
          'Cabinet Minister', 'Minister of State', 'Lok Sabha MP', 
          'Rajya Sabha MP', 'Governor'
        ];

        const parsedRecords: PreviewRecord[] = [];

        for (let r = 1; r < parsed.length; r++) {
          const row = parsed[r];
          if (row.length === 0 || !row[colIndices.name]) continue;

          const name = row[colIndices.name] || '';
          const designation = colIndices.designation !== -1 ? row[colIndices.designation] || 'Leader' : 'Leader';
          let category = (colIndices.category !== -1 ? row[colIndices.category] : 'Cabinet Minister') as any;
          const state = colIndices.state !== -1 ? row[colIndices.state] || 'National' : 'National';
          const constituency = colIndices.constituency !== -1 ? row[colIndices.constituency] || 'General' : 'General';
          const party = colIndices.party !== -1 ? row[colIndices.party] || 'Independent' : 'Independent';
          const bio = colIndices.bio !== -1 ? row[colIndices.bio] || '' : '';
          const image = colIndices.image !== -1 ? row[colIndices.image] || '' : '';

          // Generate Slug
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

          // Normalize and validate category
          let matchedCategory: LeaderCategory = 'Cabinet Minister';
          const catNorm = category.toLowerCase().trim();
          if (catNorm.includes('prime')) matchedCategory = 'Prime Minister';
          else if (catNorm.includes('chief minister') || catNorm === 'cm') matchedCategory = 'Chief Minister';
          else if (catNorm.includes('deputy chief') || catNorm.includes('deputy cm')) matchedCategory = 'Deputy Chief Minister';
          else if (catNorm.includes('state')) matchedCategory = 'Minister of State';
          else if (catNorm.includes('lok sabha') || catNorm.includes('mp')) matchedCategory = 'Lok Sabha MP';
          else if (catNorm.includes('rajya sabha')) matchedCategory = 'Rajya Sabha MP';
          else if (catNorm.includes('governor')) matchedCategory = 'Governor';
          else if (catNorm.includes('cabinet') || catNorm.includes('minister')) matchedCategory = 'Cabinet Minister';

          const errors: string[] = [];
          if (!name.trim()) errors.push('Name field is completely empty.');
          if (slug.length < 2) errors.push('Generated slug is invalid.');

          // Check duplication
          const isDuplicate = existingLeaders.some(l => l.slug === slug || l.name.toLowerCase() === name.toLowerCase());

          parsedRecords.push({
            id_temp: `temp-${r}-${Date.now()}`,
            name: name.trim(),
            slug,
            designation: designation.trim(),
            category: matchedCategory,
            state: state.trim(),
            constituency: constituency.trim(),
            party: party.trim(),
            bio: bio.trim(),
            image: image.trim(),
            isValid: errors.length === 0,
            errors,
            isDuplicate,
            duplicateAction: isDuplicate ? (updateExisting ? 'update' : 'skip') : 'skip'
          });
        }

        setRecords(parsedRecords);
        setLogs([
          { type: 'info', text: `Loaded ${parsedRecords.length} records from CSV. Headers resolved successfully.` },
          { type: 'info', text: `Found ${parsedRecords.filter(r => r.isDuplicate).length} potential duplicates in your database.` }
        ]);

      } catch (err: any) {
        setLogs([{ type: 'error', text: `Parsing failure: ${err.message || 'Check CSV structure and quotation marks.'}` }]);
      } finally {
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Run the full bulk import execution
  const executeBulkImport = async () => {
    if (records.length === 0) return;
    setImporting(true);
    setProgress(5);
    setLogs(prev => [...prev, { type: 'info', text: 'Launching bulk profile import task thread...' }]);

    let successCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    const supabase = getSupabase();

    for (let i = 0; i < records.length; i++) {
      const rec = records[i];
      setProgress(Math.round(((i + 1) / records.length) * 100));

      if (!rec.isValid) {
        setLogs(prev => [...prev, { type: 'error', text: `Row ${i + 1} (${rec.name}) skipped: ${rec.errors.join(', ')}` }]);
        failedCount++;
        continue;
      }

      if (rec.isDuplicate && !updateExisting) {
        setLogs(prev => [...prev, { type: 'info', text: `Row ${i + 1} (${rec.name}) skipped: Leader already exists (Skip Duplicates).` }]);
        skippedCount++;
        continue;
      }

      try {
        const payload: any = {
          name: rec.name,
          slug: rec.slug,
          designation: rec.designation,
          category: rec.category,
          state: rec.state,
          constituency: rec.constituency,
          party: rec.party,
          bio: rec.bio,
          image: rec.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400',
          status: 'Published' as const,
          gender: 'Male',
          dob: '1970-01-01',
          education: 'Graduate',
          profession: 'Public Service',
          mobile: '',
          email: '',
          address: '',
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: '',
          website: '',
          cover_image: '',
          gallery: [],
          featured: false
        };

        if (isSupabaseConfigured && supabase) {
          if (rec.isDuplicate && updateExisting) {
            // Overwrite existing record
            const { error } = await supabase
              .from('leaders')
              .update(payload)
              .eq('slug', rec.slug);
            if (error) throw error;
            setLogs(prev => [...prev, { type: 'success', text: `Updated Leader Profile: ${rec.name}` }]);
          } else {
            // Insert new record
            const { error } = await supabase
              .from('leaders')
              .insert([payload]);
            if (error) throw error;
            setLogs(prev => [...prev, { type: 'success', text: `Imported New Leader Profile: ${rec.name}` }]);
          }
        } else {
          // Offline local storage fallback simulation
          if (rec.isDuplicate && updateExisting) {
            setLogs(prev => [...prev, { type: 'success', text: `[Offline Sim] Updated Profile: ${rec.name}` }]);
          } else {
            setLogs(prev => [...prev, { type: 'success', text: `[Offline Sim] Imported Profile: ${rec.name}` }]);
          }
        }
        successCount++;
      } catch (err: any) {
        setLogs(prev => [...prev, { type: 'error', text: `Row ${i + 1} (${rec.name}) DB error: ${err.message || 'Check database permissions.'}` }]);
        failedCount++;
      }
    }

    setImportStats({ success: successCount, failed: failedCount, skipped: skippedCount });
    setImporting(false);
    setProgress(100);
    setRecords([]); // Clear preview
    onImportComplete(); // Refresh parent listings

    if (successCount > 0) {
      dbService.triggerGitHubCommit(`Admin bulk imported ${successCount} leader profiles`).then(() => {
        dbService.triggerVercelDeploy();
      });
    }
  };

  // Download exportable Error / Diagnostic Report CSV
  const exportErrorReport = () => {
    const errorLogs = logs.filter(l => l.type === 'error' || l.type === 'info');
    if (errorLogs.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Type,Message\n"
      + errorLogs.map(l => `"${l.type.toUpperCase()}","${l.text.replace(/"/g, '""')}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leaders_import_diagnostic_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="bulk-import-root">
      <div>
        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">CSV/Excel Bulk Data Importer</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Import hundreds of leadership profiles and constituency metrics in a single structured transaction</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Upload box */}
        <div className="md:col-span-2">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all bg-white dark:bg-[#040807] ${
              dragActive 
                ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10' 
                : 'border-slate-200 dark:border-white/10'
            }`}
            id="csv-drag-box"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".csv"
              className="hidden"
              id="csv-file-selector"
            />

            <div className="flex flex-col items-center">
              <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-500 mb-3 border border-indigo-500/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Drag & Drop leader dataset .CSV here, or <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer underline hover:text-indigo-500" onClick={() => fileInputRef.current?.click()}>browse file</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Accepts standard Comma-Separated Values (CSV). UTF-8 encoded is best.</p>
            </div>
          </div>
        </div>

        {/* Option Panel */}
        <div className="p-4 bg-slate-50 dark:bg-white/1 border border-slate-200 dark:border-white/5 rounded-2xl space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Import Controls</h4>
          
          <div className="space-y-3.5">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="update-existing-check"
                checked={updateExisting}
                onChange={(e) => setUpdateExisting(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs leading-none">
                <label htmlFor="update-existing-check" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">Update Existing Slugs</label>
                <p className="text-[10px] text-slate-400 mt-1">If enabled, existing leaders with identical names/slugs will be updated/overwritten. If disabled, they are skipped.</p>
              </div>
            </div>

            <button
              onClick={executeBulkImport}
              disabled={records.length === 0 || importing}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-white/5 disabled:text-slate-400 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition uppercase tracking-wider cursor-pointer"
            >
              {importing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Importing... {progress}%</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Bulk Import ({records.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      {importing && (
        <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-mono font-bold">Import Transaction Progress</span>
            <span className="text-indigo-400 font-mono font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Stats Summary after execution */}
      {importStats && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Successfully Imported</p>
            <p className="text-xl font-black text-emerald-500">{importStats.success}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Skipped Duplicates</p>
            <p className="text-xl font-black text-amber-500">{importStats.skipped}</p>
          </div>
          <div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Failed Rows</p>
            <p className="text-xl font-black text-red-500">{importStats.failed}</p>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {records.length > 0 && (
        <div className="space-y-3 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Records Preview ({records.length})</h3>
            <button
              onClick={() => setRecords([])}
              className="text-xs text-red-500 hover:underline font-bold"
            >
              Clear Upload
            </button>
          </div>

          <div className="border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#020504]">
            <div className="max-h-[300px] overflow-y-auto overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-white/1 text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider sticky top-0 border-b border-slate-150 dark:border-white/5">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Constituency</th>
                    <th className="p-3">Party</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {records.map((rec) => (
                    <tr key={rec.id_temp} className={`hover:bg-slate-50/50 dark:hover:bg-white/1 ${!rec.isValid ? 'bg-red-500/5' : ''}`}>
                      <td className="p-3">
                        {!rec.isValid ? (
                          <span className="px-2 py-0.5 bg-red-500/15 text-red-500 rounded text-[9px] font-bold">Invalid</span>
                        ) : rec.isDuplicate ? (
                          <span className="px-2 py-0.5 bg-amber-500/15 text-amber-500 rounded text-[9px] font-bold">Duplicate</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-500 rounded text-[9px] font-bold">Ready</span>
                        )}
                      </td>
                      <td className="p-3 font-bold">
                        <div>
                          <p className="text-slate-700 dark:text-slate-200">{rec.name}</p>
                          <p className="text-[9px] text-slate-400 font-mono">slug: {rec.slug}</p>
                        </div>
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400">{rec.designation}</td>
                      <td className="p-3 font-mono text-[10px] text-slate-500">{rec.category}</td>
                      <td className="p-3 text-slate-500">{rec.constituency}, {rec.state}</td>
                      <td className="p-3 font-bold text-slate-600 dark:text-slate-400">{rec.party}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic Console Logs */}
      {logs.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Diagnostic Transaction Log</h3>
            <button
              onClick={exportErrorReport}
              className="text-xs text-indigo-500 hover:underline font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Diagnostic CSV</span>
            </button>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-[11px] leading-relaxed max-h-[220px] overflow-y-auto space-y-1 text-slate-300">
            {logs.map((log, i) => (
              <div 
                key={i} 
                className={
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-emerald-400' : 
                  'text-slate-400'
                }
              >
                [{new Date().toLocaleTimeString()}] {log.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
