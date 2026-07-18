import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Image as ImageIcon, CheckCircle, FileText, AlertCircle, 
  Plus, Edit, Trash2, Search, Filter, Upload, Download, RefreshCw, 
  Trash, Eye, ShieldAlert, Sparkles, X, Check, ArrowRight, Crop, HelpCircle
} from 'lucide-react';
import { SupabaseLeader, LeaderCategory } from '../../types';
import { dbService } from '../../lib/supabaseClient';
import { getProxiedImageUrl } from '../KnowYourMinister';

interface DirectoryAdminProps {
  onSelectLeader: (slug: string) => void;
}

export default function DirectoryAdmin({ onSelectLeader }: DirectoryAdminProps) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Main Admin Lists
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats / Metrics
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    published: 0,
    drafts: 0,
    missing: 0,
  });

  // Table Selection & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterState, setFilterState] = useState('all');
  const [filterParty, setFilterParty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Submodules
  const [adminTab, setAdminTab] = useState<'overview' | 'leaders' | 'media' | 'sync'>('overview');

  // Form Modals
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState<SupabaseLeader | null>(null);
  
  // Bulk CSV panel
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [importReport, setImportReport] = useState<{ count: number; logs: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  // Sync / Thread console
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  // Media Library state
  const [mediaList, setMediaList] = useState<string[]>([
    'https://upload.wikimedia.org/wikipedia/commons/5/5f/The_official_portrait_of_Shri_Narendra_Modi%2C_the_Prime_Minister_of_the_Republic_of_India.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/ab/Yogi_Adityanath_in_2023.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/ef/Mamata_Banerjee_portrait_2019.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/3/36/Nitin_Gadkari_Official_Portrait_2024.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/e/e3/Amit_Shah_Official_Portrait_2024.jpg'
  ]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 200, h: 200 });

  // Leader Form State
  const [formState, setFormState] = useState({
    name: '', designation: '', category: 'Cabinet Minister' as LeaderCategory,
    state: 'Delhi', constituency: 'National Seat', party: 'Independent', gender: 'Male',
    dob: '1975-01-01', bio: '', education: 'Graduate', profession: 'Public Service',
    mobile: '', email: '', address: '', facebook: '', twitter: '', instagram: '',
    youtube: '', website: '', image: '', cover_image: '', featured: false, status: 'Draft' as 'Published' | 'Draft'
  });

  // Load and refresh lists
  const loadAdminData = async () => {
    try {
      setLoading(true);
      const data = await dbService.getLeaders();
      setLeaders(data);

      // Calc stats
      const total = data.length;
      const published = data.filter(l => l.status === 'Published').length;
      const drafts = data.filter(l => l.status === 'Draft').length;
      const images = data.filter(l => l.image && !l.image.includes('placeholder')).length;
      const missing = data.filter(l => !l.image || l.image.includes('placeholder')).length;

      setStats({ total, images, published, drafts, missing });
    } catch (err) {
      console.error('Failed to load admin dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadAdminData();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Administrator Access Key.');
    }
  };

  // Submit Add or Edit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLeader) {
        await dbService.updateLeader(editingLeader.id, formState);
      } else {
        await dbService.createLeader(formState);
      }
      setShowAddEditModal(false);
      setEditingLeader(null);
      loadAdminData();
    } catch (err) {
      console.error('Failed to submit form:', err);
    }
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    setEditingLeader(null);
    setFormState({
      name: '', designation: '', category: 'Cabinet Minister',
      state: 'Delhi', constituency: '', party: 'Independent', gender: 'Male',
      dob: '', bio: '', education: '', profession: '',
      mobile: '', email: '', address: '', facebook: '', twitter: '', instagram: '',
      youtube: '', website: '', image: '', cover_image: '', featured: false, status: 'Draft'
    });
    setShowAddEditModal(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (leader: SupabaseLeader) => {
    setEditingLeader(leader);
    setFormState({
      name: leader.name, designation: leader.designation, category: leader.category,
      state: leader.state, constituency: leader.constituency, party: leader.party, gender: leader.gender,
      dob: leader.dob, bio: leader.bio, education: leader.education, profession: leader.profession,
      mobile: leader.mobile, email: leader.email, address: leader.address, facebook: leader.facebook,
      twitter: leader.twitter, instagram: leader.instagram, youtube: leader.youtube,
      website: leader.website, image: leader.image, cover_image: leader.cover_image,
      featured: leader.featured, status: leader.status
    });
    setShowAddEditModal(true);
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (confirm('Are you absolutely sure you want to delete this leader profile?')) {
      await dbService.deleteLeader(id);
      loadAdminData();
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (confirm(`Are you sure you want to bulk-delete ${selectedIds.length} leaders?`)) {
      await dbService.bulkDelete(selectedIds);
      setSelectedIds([]);
      loadAdminData();
    }
  };

  // Export to CSV simulation
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Category,Designation,Party,State,Constituency,Status,Featured\n";
    leaders.forEach(l => {
      csvContent += `"${l.name}","${l.category}","${l.designation}","${l.party}","${l.state}","${l.constituency}","${l.status}","${l.featured}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "india_political_leaders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to Excel simulation
  const handleExportExcel = () => {
    alert("Excel Export successfully generated. Starting download: 'india_political_leaders.xlsx'");
    // Mocking an xlsx download triggers
    const link = document.createElement("a");
    link.href = "#";
    link.click();
  };

  // Bulk Import CSV submit
  const handleCSVImport = async () => {
    if (!csvInput.trim()) return;
    try {
      setImporting(true);
      const res = await dbService.bulkImportCSV(csvInput);
      setImportReport({
        count: res.importedCount,
        logs: res.logs
      });
      setCsvInput('');
      loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  // Trigger Administrative Sync Simulation
  const handleTriggerSync = async (leaderId?: string) => {
    try {
      setSyncing(true);
      setSyncLogs([`Executing Python automation process...`]);
      const res = await dbService.triggerSync(leaderId);
      
      // Gradually print sync log blocks for high fidelity scrolling
      let idx = 0;
      const interval = setInterval(() => {
        if (idx < res.logs.length) {
          setSyncLogs(prev => [...prev, res.logs[idx]]);
          idx++;
        } else {
          clearInterval(interval);
          setSyncing(false);
          loadAdminData();
        }
      }, 300);
    } catch (err) {
      console.error(err);
      setSyncing(false);
    }
  };

  // Handle Mock Image Upload
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadingImage(true);
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTimeout(() => {
            setMediaList(prev => [event.target?.result as string, ...prev]);
            setUploadingImage(false);
          }, 800);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Mock Crop & Upload to Supabase as WebP
  const handleSaveCrop = () => {
    if (!croppingImage) return;
    // Simulate WebP cropping, compression and upload
    setUploadingImage(true);
    const targetImg = croppingImage;
    setCroppingImage(null);
    setTimeout(() => {
      // Add cropped WebP URL back to media list
      setMediaList(prev => [targetImg, ...prev]);
      setUploadingImage(false);
      alert("Image successfully facial cropped, normalized to 500x500 WebP, and uploaded to bucket 'leaders/images'!");
    }, 1000);
  };

  // Filter local leaders lists
  const filteredLeaders = leaders.filter(l => {
    if (filterCategory !== 'all' && l.category !== filterCategory) return false;
    if (filterState !== 'all' && l.state.toLowerCase() !== filterState.toLowerCase()) return false;
    if (filterParty !== 'all' && l.party.toLowerCase() !== filterParty.toLowerCase()) return false;
    if (filterStatus !== 'all' && l.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      return l.name.toLowerCase().includes(q) || l.designation.toLowerCase().includes(q);
    }
    return true;
  });

  const filterStates = [
    'all', 'Uttar Pradesh', 'Maharashtra', 'West Bengal', 'Gujarat', 'Delhi', 'Bihar', 'Tamil Nadu', 'Karnataka'
  ];

  const filterParties = [
    'all', 'BJP', 'INC', 'TMC', 'AAP', 'SP', 'NCP', 'Independent'
  ];

  const filterCategories = [
    'all', 'Prime Minister', 'Chief Minister', 'Deputy Chief Minister', 'Cabinet Minister', 'Minister of State', 'Lok Sabha MP', 'Rajya Sabha MP', 'Governor'
  ];

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-16 text-left">
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto border border-red-100 dark:border-red-900/30">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white font-display">
              Registry War-Room Entrance
            </h2>
            <p className="text-slate-400 text-xs font-medium">
              Provide administrative gatekeeper keys to gain CRUD and system credentials.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Administrative Access Key</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3.5 py-2.5 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                placeholder="Enter access passcode (e.g., admin123)"
              />
            </div>

            {loginError && (
              <p className="text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl shadow cursor-pointer transition-all"
            >
              Unlock Terminal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left py-4">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span>EXECUTIVE BACKPLANE ACTIVE</span>
          </div>
          <h1 className="text-3xl font-black text-slate-850 dark:text-white font-display mt-2">
            Leaders Directory Admin Panel
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
            Perform CRUD operations, manage media buckets, trigger bulk image downloads, and import CSV lists.
          </p>
        </div>

        {/* Sync panel trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTriggerSync()}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all uppercase tracking-wider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>One Click Sync</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1 px-4 py-2 bg-slate-50 border border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-500" />
            <span>Add Leader</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB CONTROLS */}
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 dark:border-slate-900 pb-3">
        {(['overview', 'leaders', 'media', 'sync'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            className={`pb-2.5 font-bold text-xs uppercase tracking-wider font-mono cursor-pointer transition-all border-b-2 ${
              adminTab === tab
                ? 'border-emerald-600 text-slate-900 dark:text-white'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUBMODULE: OVERVIEW (METRICS GRID & STATS) */}
      {adminTab === 'overview' && (
        <div className="space-y-8">
          {/* Metrics Column */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm text-left">
              <Users className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Total Leaders</p>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white leading-none font-display">{stats.total}</h3>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm text-left">
              <ImageIcon className="w-5 h-5 text-indigo-600 mb-2" />
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Total Images</p>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white leading-none font-display">{stats.images}</h3>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm text-left">
              <CheckCircle className="w-5 h-5 text-teal-600 mb-2" />
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Published</p>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white leading-none font-display">{stats.published}</h3>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm text-left">
              <FileText className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Draft Files</p>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white leading-none font-display">{stats.drafts}</h3>
            </div>

            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm text-left">
              <AlertCircle className="w-5 h-5 text-rose-600 mb-2" />
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-[9px] font-mono leading-none mb-1">Missing Images</p>
              <h3 className="text-2xl font-black text-slate-850 dark:text-white leading-none font-display">{stats.missing}</h3>
            </div>
          </div>

          {/* BULK CSV IMPORT PANEL TRIGGER */}
          <section className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Bulk CSV Import Engine</h3>
                <p className="text-slate-400 text-xs font-medium">Upload CSV text files containing custom records for rapid portfolio processing.</p>
              </div>
              <button
                onClick={() => setShowImportPanel(!showImportPanel)}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                {showImportPanel ? 'Hide Panel' : 'Open Panel'}
              </button>
            </div>

            <AnimatePresence>
              {showImportPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-900/40 overflow-hidden text-xs text-left"
                >
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Paste CSV File Data</label>
                    <textarea
                      rows={6}
                      value={csvInput}
                      onChange={(e) => setCsvInput(e.target.value)}
                      placeholder="Name,Category,Designation,Party,State,Constituency,Bio,Gender,Dob&#10;Amit Shah,Cabinet Minister,Minister of Home Affairs,BJP,Gujarat,Gandhinagar,Full bio information,Male,1964-10-22"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3.5 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCSVImport}
                      disabled={importing}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{importing ? 'Processing...' : 'Run Import'}</span>
                    </button>
                  </div>

                  {importReport && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 border border-slate-200/40">
                      <h4 className="font-bold text-slate-800 dark:text-white">Import Report Card:</h4>
                      <p className="font-bold text-emerald-600">Successfully imported {importReport.count} records.</p>
                      <div className="max-h-40 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1">
                        {importReport.logs.map((log, lIdx) => (
                          <p key={lIdx}>{log}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      )}

      {/* SUBMODULE: LEADERS LIST (GRID + FILTERS + BULK ACTIONS) */}
      {adminTab === 'leaders' && (
        <div className="space-y-6">
          {/* FILTER BAR */}
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-4 rounded-xl flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, designation..."
                className="w-full bg-slate-50 dark:bg-slate-900 pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-850 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-bold focus:outline-none cursor-pointer"
            >
              {filterCategories.map((c, idx) => (
                <option key={idx} value={c}>{c === 'all' ? 'Category Filter' : c}</option>
              ))}
            </select>

            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-bold focus:outline-none cursor-pointer"
            >
              {filterStates.map((s, idx) => (
                <option key={idx} value={s}>{s === 'all' ? 'State Filter' : s}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* BULK SELECTION ACTION STRIP */}
          {selectedIds.length > 0 && (
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
              <span className="text-xs font-mono font-bold">{selectedIds.length} leader files selected</span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Bulk Delete</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Selection</span>
                </button>
              </div>
            </div>
          )}

          {/* TABLE ACTIONS STRIP */}
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500">
            <span>Showing {filteredLeaders.length} representatives</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 hover:text-emerald-600 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
              <span>|</span>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 hover:text-emerald-600 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* LEADERS GRID TABLE */}
          <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs font-mono">Loading lists...</div>
            ) : filteredLeaders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs font-mono">No matching records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 font-mono font-bold border-b border-slate-100 dark:border-slate-900 uppercase text-[9px] tracking-wider">
                      <th className="py-4 px-6 w-12">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredLeaders.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(filteredLeaders.map(l => l.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="py-4 px-4">Leader Profile</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Constituency & State</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaders.map((leader) => (
                      <tr key={leader.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 font-medium">
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(leader.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds(prev => [...prev, leader.id]);
                              } else {
                                setSelectedIds(prev => prev.filter(id => id !== leader.id));
                              }
                            }}
                          />
                        </td>
                        <td className="py-4 px-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-150 shrink-0">
                            <img
                              src={getProxiedImageUrl(leader.image)}
                              alt={leader.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-top"
                            />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-850 dark:text-white leading-none mb-1">{leader.name}</p>
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-900 text-[9px] font-mono font-bold rounded uppercase text-slate-500">{leader.party}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-500">{leader.category}</td>
                        <td className="py-4 px-4 text-slate-500">{leader.constituency}, {leader.state}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase ${
                            leader.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                            {leader.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-1">
                          <button
                            onClick={() => handleTriggerSync(leader.id)}
                            className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded-lg"
                            title="Download Portait Automation"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(leader)}
                            className="p-1.5 hover:bg-slate-100 text-slate-600 dark:text-slate-400 rounded-lg"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(leader.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBMODULE: MEDIA LIBRARY & CROPPING CANVAS */}
      {adminTab === 'media' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Supabase Storage Media Library</h3>
              <p className="text-slate-400 text-xs font-medium">Upload photos directly, crop, auto-resize to 500x500 WebP and manage your storage bucket.</p>
            </div>
            {/* Upload form trigger */}
            <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5 uppercase tracking-wider">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* MEDIA LISTING GRID */}
          {uploadingImage ? (
            <div className="py-24 text-center text-slate-400 text-xs font-mono">Running compression and uploads...</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaList.map((url, idx) => (
                <div key={idx} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-150 shadow-sm relative group">
                  <img
                    src={getProxiedImageUrl(url)}
                    alt="Bucket item"
                    className="w-full h-full object-cover"
                  />
                  {/* Action overlays */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setCroppingImage(url)}
                      className="p-2 bg-white hover:bg-slate-100 rounded-xl text-slate-700"
                      title="Simulate Center Face Crop & Compress"
                    >
                      <Crop className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete media file?')) {
                          setMediaList(prev => prev.filter((_, i) => i !== idx));
                        }
                      }}
                      className="p-2 bg-white hover:bg-red-50 rounded-xl text-red-600"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CROPPING CANVAS WORKSPACE WORKSTATION */}
          <AnimatePresence>
            {croppingImage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 text-xs text-slate-700 text-left shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-850">Image Processing Crop Workspace</h3>
                      <p className="text-slate-400 text-[10px]">Verify center facial crop dimensions before WebP database sync.</p>
                    </div>
                    <button
                      onClick={() => setCroppingImage(null)}
                      className="p-1.5 hover:bg-slate-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Crop stage */}
                  <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200">
                    <img
                      src={getProxiedImageUrl(croppingImage)}
                      alt="Crop Stage"
                      className="w-full h-full object-cover blur-[1px]"
                    />
                    {/* Bounding Crop Box Overlay */}
                    <div 
                      className="absolute border-2 border-emerald-500 shadow-2xl rounded-xl cursor-move flex items-center justify-center"
                      style={{
                        left: `${cropBox.x}px`,
                        top: `${cropBox.y}px`,
                        width: `${cropBox.w}px`,
                        height: `${cropBox.h}px`
                      }}
                    >
                      <span className="px-2 py-1 bg-emerald-600 text-white font-bold font-mono text-[9px] rounded uppercase shadow-md leading-none">
                        500 X 500 WEBP CROP
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => setCroppingImage(null)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCrop}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1 uppercase tracking-wider"
                    >
                      <Check className="w-4 h-4" />
                      <span>Crop & Convert</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* SUBMODULE: THREAD CONSOLE LOG RUNNER */}
      {adminTab === 'sync' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-900 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-white text-base">Image Downloader & Processing Automation</h3>
              <p className="text-slate-400 text-xs font-medium">Logs from execution of download_images.py automation cycle.</p>
            </div>
            <button
              onClick={() => handleTriggerSync()}
              disabled={syncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer uppercase tracking-wider flex items-center gap-1"
            >
              <RefreshCw className={syncing ? 'animate-spin' : ''} />
              <span>{syncing ? 'Running Automation...' : 'Trigger Sync'}</span>
            </button>
          </div>

          <div className="bg-slate-900 text-slate-200 p-6 rounded-2xl font-mono text-xs max-h-[420px] overflow-y-auto space-y-1 text-left shadow-inner">
            {syncLogs.length === 0 ? (
              <p className="text-slate-500 italic">No synchronization logs generated. Trigger "One Click Sync" to initiate.</p>
            ) : (
              syncLogs.map((log, logIdx) => (
                <p key={logIdx} className={log.includes('Success') || log.includes('updated') ? 'text-emerald-400' : log.includes('Starting') ? 'text-indigo-300 font-bold' : ''}>
                  {log}
                </p>
              ))
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT LEADER MODAL OVERLAY */}
      <AnimatePresence>
        {showAddEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto text-xs text-slate-700 dark:text-slate-300 text-left shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddEditModal(false)}
                className="absolute top-6 right-6 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full cursor-pointer text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1 border-b border-slate-50 dark:border-slate-900 pb-4 mb-6">
                <h3 className="text-lg font-extrabold text-slate-850 dark:text-white">
                  {editingLeader ? `Edit Profile: ${editingLeader.name}` : 'Create New Representative Dossier'}
                </h3>
                <p className="text-slate-400 text-xs">Fill out demographic, geographic, and educational credentials.</p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* 1. Basic Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. Narendra Modi"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Designation *</label>
                    <input
                      type="text"
                      required
                      value={formState.designation}
                      onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. Prime Minister"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Category *</label>
                    <select
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 p-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-bold"
                    >
                      {filterCategories.filter(c => c !== 'all').map((c, idx) => (
                        <option key={idx} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Geographic & Party Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">State *</label>
                    <input
                      type="text"
                      required
                      value={formState.state}
                      onChange={(e) => setFormState({ ...formState, state: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. Uttar Pradesh"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Constituency *</label>
                    <input
                      type="text"
                      required
                      value={formState.constituency}
                      onChange={(e) => setFormState({ ...formState, constituency: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. Varanasi"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Party Alliance *</label>
                    <input
                      type="text"
                      required
                      value={formState.party}
                      onChange={(e) => setFormState({ ...formState, party: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. BJP"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Gender *</label>
                    <select
                      value={formState.gender}
                      onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 p-2.5 rounded-xl"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* 3. Biography */}
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Biography / Career Journey *</label>
                  <textarea
                    rows={4}
                    required
                    value={formState.bio}
                    onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-950 dark:text-white"
                    placeholder="Enter detailed career achievements, timeline and roles..."
                  />
                </div>

                {/* 4. Background Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Date of Birth</label>
                    <input
                      type="date"
                      value={formState.dob}
                      onChange={(e) => setFormState({ ...formState, dob: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Education</label>
                    <input
                      type="text"
                      value={formState.education}
                      onChange={(e) => setFormState({ ...formState, education: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. Master of Arts"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Profession</label>
                    <input
                      type="text"
                      value={formState.profession}
                      onChange={(e) => setFormState({ ...formState, profession: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="e.g. Agriculturist, Advocate"
                    />
                  </div>
                </div>

                {/* 5. Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Mobile</label>
                    <input
                      type="text"
                      value={formState.mobile}
                      onChange={(e) => setFormState({ ...formState, mobile: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="+91 11 ..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email</label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="office@..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Official Address</label>
                    <input
                      type="text"
                      value={formState.address}
                      onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="Delhi Residence,..."
                    />
                  </div>
                </div>

                {/* 6. Media Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Portrait Image URL</label>
                    <input
                      type="text"
                      value={formState.image}
                      onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Cover Banner Image URL</label>
                    <input
                      type="text"
                      value={formState.cover_image}
                      onChange={(e) => setFormState({ ...formState, cover_image: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-900 dark:text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* 7. Settings checkboxes */}
                <div className="flex gap-6 items-center pt-2">
                  <label className="flex items-center gap-2 font-bold cursor-pointer font-mono text-[10px]">
                    <input
                      type="checkbox"
                      checked={formState.featured}
                      onChange={(e) => setFormState({ ...formState, featured: e.target.checked })}
                    />
                    <span>Featured Profile</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-[10px] text-slate-400">STATUS:</span>
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Published"
                        checked={formState.status === 'Published'}
                        onChange={() => setFormState({ ...formState, status: 'Published' })}
                      />
                      <span>Published</span>
                    </label>
                    <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Draft"
                        checked={formState.status === 'Draft'}
                        onChange={() => setFormState({ ...formState, status: 'Draft' })}
                      />
                      <span>Draft</span>
                    </label>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="flex justify-end gap-2 border-t border-slate-50 dark:border-slate-900 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddEditModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer uppercase tracking-wider"
                  >
                    Save Dossier
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
