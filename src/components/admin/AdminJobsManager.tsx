import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, RefreshCw, Download, Upload, Plus, Edit, Trash2, 
  ExternalLink, Search, CheckCircle, AlertCircle, FileText, X, Check,
  Building, MapPin, Calendar, Clock
} from 'lucide-react';
import { Job } from '../../types';
import { dbService } from '../../lib/supabaseClient';

export default function AdminJobsManager() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // CSV Import panel
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [csvInput, setCsvInput] = useState('');

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const [formState, setFormState] = useState<Partial<Job>>({
    title: '',
    organization: '',
    department: '',
    category: 'Central',
    state: 'All India',
    vacancies: 100,
    salary: '',
    qualification: '',
    age_limit: '18 - 30 Years',
    experience: 'Fresher eligible',
    employment_type: 'Permanent',
    notification_number: '',
    notification_pdf: '',
    official_apply_url: '',
    official_website: '',
    application_start: new Date().toISOString().split('T')[0],
    application_end: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
    status: 'Open',
    description: '',
    selection_process: ''
  });

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      setLoading(true);
      const data = await dbService.getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed loading jobs in admin:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSync = async (type: 'central' | 'state' | 'all') => {
    try {
      setIsSyncing(true);
      setSyncLogs(prev => [...prev, `[INIT] Starting ${type.toUpperCase()} recruitment sync...`]);
      const res = await dbService.syncJobs(type);
      setSyncLogs(prev => [...prev, ...res.logs]);
      await loadJobs();
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `[ERROR] Sync failed: ${err.message}`]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await dbService.upsertJob({
        ...editingJob,
        ...formState
      });
      setShowModal(false);
      setEditingJob(null);
      await loadJobs();
    } catch (err) {
      console.error('Failed saving job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recruitment notice?')) return;
    try {
      setLoading(true);
      await dbService.deleteJob(id);
      await loadJobs();
    } catch (err) {
      console.error('Failed deleting job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvInput.trim()) return;
    try {
      setLoading(true);
      const lines = csvInput.trim().split('\n');
      let count = 0;
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 3) {
          const [title, org, dept, cat, state, vac, applyUrl] = parts.map(p => p.trim());
          if (title && org) {
            await dbService.upsertJob({
              title,
              organization: org,
              department: dept || org,
              category: (cat as any) || 'Central',
              state: state || 'All India',
              vacancies: parseInt(vac) || 50,
              official_apply_url: applyUrl || 'https://india.gov.in',
              official_website: applyUrl || 'https://india.gov.in',
            });
            count++;
          }
        }
      }
      alert(`Successfully imported ${count} jobs.`);
      setCsvInput('');
      setShowImportPanel(false);
      await loadJobs();
    } catch (e: any) {
      alert(`Import error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingJob(null);
    setFormState({
      title: '',
      organization: '',
      department: '',
      category: 'Central',
      state: 'All India',
      vacancies: 100,
      salary: 'Level 6 (₹35,400 - ₹1,12,400)',
      qualification: 'Bachelor\'s Degree in any discipline',
      age_limit: '18 - 30 Years',
      experience: 'Fresher eligible',
      employment_type: 'Permanent',
      notification_number: 'GOVT-2026-REC',
      notification_pdf: '',
      official_apply_url: 'https://india.gov.in',
      official_website: 'https://india.gov.in',
      application_start: new Date().toISOString().split('T')[0],
      application_end: new Date(Date.now() + 30*86400000).toISOString().split('T')[0],
      status: 'Open',
      description: '',
      selection_process: 'Written Exam & Interview'
    });
    setShowModal(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setFormState(job);
    setShowModal(true);
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      
      {/* Header & Main Action Bar */}
      <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white font-display flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              <span>Government Jobs Admin Console</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Manage verified recruitment notifications, official apply links, and automatic data sync.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider font-mono cursor-pointer transition shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
        </div>

        {/* Sync & Admin Control Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={() => handleSync('central')}
            disabled={isSyncing}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/50 hover:bg-blue-100 font-bold text-xs rounded-xl font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Central Jobs</span>
          </button>

          <button
            onClick={() => handleSync('state')}
            disabled={isSyncing}
            className="px-4 py-2 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/50 hover:bg-purple-100 font-bold text-xs rounded-xl font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync State Jobs</span>
          </button>

          <button
            onClick={() => handleSync('all')}
            disabled={isSyncing}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync All Jobs</span>
          </button>

          <button
            onClick={() => setShowImportPanel(!showImportPanel)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs rounded-xl font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={loadJobs}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs rounded-xl font-mono uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>

        </div>

        {/* Sync Console Output */}
        {syncLogs.length > 0 && (
          <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto space-y-1">
            <p className="font-bold text-slate-400 border-b border-slate-800 pb-1">Sync Log Output:</p>
            {syncLogs.map((log, idx) => (
              <p key={idx}>{log}</p>
            ))}
          </div>
        )}

        {/* CSV Import Panel */}
        {showImportPanel && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase text-slate-700 dark:text-slate-300">
              Bulk CSV Job Import (Format: Title, Organization, Department, Category, State, Vacancies, ApplyURL)
            </h3>
            <textarea
              rows={4}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="SSC CGL 2026, Staff Selection Commission, Dept of Personnel, Central, All India, 17727, https://ssc.gov.in"
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImportPanel(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 font-mono uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleCSVImport}
                className="px-4 py-1.5 bg-emerald-600 text-white font-bold rounded-lg text-xs font-mono uppercase tracking-wider"
              >
                Process CSV Import
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Table & Search */}
      <div className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
        
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter jobs in table..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 dark:text-white focus:outline-none"
            />
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {filteredJobs.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-900 text-[10px] font-mono uppercase text-slate-400 font-bold">
                <th className="pb-3 pr-2">Recruitment Title</th>
                <th className="pb-3 px-2">Category</th>
                <th className="pb-3 px-2">State</th>
                <th className="pb-3 px-2">Vacancies</th>
                <th className="pb-3 px-2">Last Date</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900/50 text-xs font-sans">
              {filteredJobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  
                  <td className="py-3 pr-2 max-w-[280px]">
                    <p className="font-bold text-slate-800 dark:text-white truncate" title={j.title}>{j.title}</p>
                    <p className="text-[10px] text-slate-400 truncate">{j.organization}</p>
                  </td>

                  <td className="py-3 px-2 font-mono">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${j.category === 'Central' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                      {j.category}
                    </span>
                  </td>

                  <td className="py-3 px-2 font-mono text-slate-600 dark:text-slate-300">
                    {j.state}
                  </td>

                  <td className="py-3 px-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {j.vacancies.toLocaleString('en-IN')}
                  </td>

                  <td className="py-3 px-2 font-mono text-slate-500">
                    {j.application_end}
                  </td>

                  <td className="py-3 px-2 font-mono">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${j.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {j.status}
                    </span>
                  </td>

                  <td className="py-3 pl-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={j.official_apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-emerald-500 transition"
                        title="Official Apply Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => openEditModal(j)}
                        className="p-1.5 text-slate-400 hover:text-blue-500 transition cursor-pointer"
                        title="Edit Job"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(j.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add / Edit Form Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-left shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white font-display">
                  {editingJob ? 'Edit Government Job' : 'Post Government Job'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveJob} className="space-y-4 text-xs font-sans">
                
                <div className="space-y-1">
                  <label className="font-mono font-bold text-slate-500 uppercase">Recruitment Title *</label>
                  <input
                    type="text"
                    required
                    value={formState.title || ''}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g. SSC Combined Graduate Level (CGL) Examination 2026"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Organization *</label>
                    <input
                      type="text"
                      required
                      value={formState.organization || ''}
                      onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                      placeholder="e.g. Staff Selection Commission (SSC)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Department</label>
                    <input
                      type="text"
                      value={formState.department || ''}
                      onChange={(e) => setFormState({ ...formState, department: e.target.value })}
                      placeholder="e.g. Department of Personnel & Training"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Category *</label>
                    <select
                      value={formState.category || 'Central'}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    >
                      <option value="Central">Central Government</option>
                      <option value="State">State Government</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">State *</label>
                    <input
                      type="text"
                      value={formState.state || 'All India'}
                      onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                      placeholder="e.g. Uttar Pradesh / All India"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Vacancies *</label>
                    <input
                      type="number"
                      required
                      value={formState.vacancies || 0}
                      onChange={(e) => setFormState({ ...formState, vacancies: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Salary Range</label>
                    <input
                      type="text"
                      value={formState.salary || ''}
                      onChange={(e) => setFormState({ ...formState, salary: e.target.value })}
                      placeholder="Level 6 (₹35,400 - ₹1,12,400)"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Qualification</label>
                    <input
                      type="text"
                      value={formState.qualification || ''}
                      onChange={(e) => setFormState({ ...formState, qualification: e.target.value })}
                      placeholder="Bachelor Degree / Graduate"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Official Apply URL *</label>
                    <input
                      type="url"
                      required
                      value={formState.official_apply_url || ''}
                      onChange={(e) => setFormState({ ...formState, official_apply_url: e.target.value })}
                      placeholder="https://ssc.gov.in"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Application Start</label>
                    <input
                      type="date"
                      value={formState.application_start || ''}
                      onChange={(e) => setFormState({ ...formState, application_start: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono font-bold text-slate-500 uppercase">Application Last Date</label>
                    <input
                      type="date"
                      value={formState.application_end || ''}
                      onChange={(e) => setFormState({ ...formState, application_end: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-900">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold rounded-xl font-mono uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl font-mono uppercase tracking-wider"
                  >
                    Save Job Notification
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
