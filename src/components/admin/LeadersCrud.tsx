import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Plus, Edit2, Trash2, Eye, ChevronLeft, 
  ChevronRight, AlertCircle, CheckCircle2, Loader2, X, RefreshCw, 
  ExternalLink, Globe, Mail, Phone as PhoneIcon, Facebook, Twitter, 
  Instagram, Youtube, Image as ImageIcon
} from 'lucide-react';
import { dbService, getSupabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { SupabaseLeader, LeaderCategory } from '../../types';
import ImageLibrary from './ImageLibrary';

interface LeadersCrudProps {
  categoryFilter?: string;
  onRefreshStats: () => void;
}

export default function LeadersCrud({ categoryFilter = 'all', onRefreshStats }: LeadersCrudProps) {
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination & Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFilter);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedParty, setSelectedParty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected row state for bulk delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Panels
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [activeLeader, setActiveLeader] = useState<SupabaseLeader | null>(null);

  // Notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const initialFormState = {
    id: '',
    name: '',
    slug: '',
    designation: '',
    category: 'Cabinet Minister' as LeaderCategory,
    state: 'Delhi',
    constituency: 'National Seat',
    party: 'Independent',
    gender: 'Male',
    dob: '1975-01-01',
    bio: '',
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
    image: '',
    cover_image: '',
    featured: false,
    status: 'Published' as 'Published' | 'Draft'
  };
  const [formState, setFormState] = useState(initialFormState);

  // Dynamic filter lists
  const [statesList, setStatesList] = useState<string[]>([]);
  const [partiesList, setPartiesList] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCategory(categoryFilter);
    setCurrentPage(1);
  }, [categoryFilter]);

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory, selectedState, selectedParty, selectedStatus, currentPage]);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const filters = {
        category: selectedCategory,
        state: selectedState,
        party: selectedParty,
        status: selectedStatus,
        search: searchQuery
      };

      const allData = await dbService.getLeaders(filters);
      
      // Calculate distinct lists dynamically
      const uniqueStates = Array.from(new Set(allData.map(l => l.state).filter(Boolean))) as string[];
      const uniqueParties = Array.from(new Set(allData.map(l => l.party).filter(Boolean))) as string[];
      setStatesList(uniqueStates.sort());
      setPartiesList(uniqueParties.sort());

      // Client-side pagination
      setTotalCount(allData.length);
      const startIdx = (currentPage - 1) * itemsPerPage;
      const paginatedData = allData.slice(startIdx, startIdx + itemsPerPage);
      
      setLeaders(paginatedData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load leader directory records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(leaders.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(rowId => rowId !== id));
    }
  };

  // Generate slug dynamically from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    setFormState(prev => ({
      ...prev,
      name: val,
      slug: cleanSlug
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) {
      setErrorMsg('Name is a required field.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload: Omit<SupabaseLeader, 'id' | 'created_at' | 'updated_at'> = {
      name: formState.name,
      slug: formState.slug || formState.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      designation: formState.designation || 'Leader',
      category: formState.category,
      state: formState.state,
      constituency: formState.constituency,
      party: formState.party,
      gender: formState.gender,
      dob: formState.dob,
      bio: formState.bio,
      education: formState.education,
      profession: formState.profession,
      mobile: formState.mobile,
      email: formState.email,
      address: formState.address,
      facebook: formState.facebook,
      twitter: formState.twitter,
      instagram: formState.instagram,
      youtube: formState.youtube,
      website: formState.website,
      image: formState.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400',
      cover_image: formState.cover_image,
      gallery: [],
      featured: formState.featured,
      status: formState.status
    };

    try {
      if (formState.id) {
        // Edit mode
        await dbService.updateLeader(formState.id, payload);
        setSuccessMsg(`Successfully updated leader profile for ${formState.name}.`);
        dbService.triggerGitHubCommit(`Admin updated leader profile: ${formState.name}`).then(() => {
          dbService.triggerVercelDeploy();
        });
      } else {
        // Add Mode
        await dbService.createLeader(payload);
        setSuccessMsg(`Successfully created leader profile for ${formState.name}.`);
        dbService.triggerGitHubCommit(`Admin created leader profile: ${formState.name}`).then(() => {
          dbService.triggerVercelDeploy();
        });
      }

      setShowFormModal(false);
      onRefreshStats();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Database transaction error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async (leader: SupabaseLeader) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${leader.name}"? This action cannot be undone.`)) return;

    try {
      await dbService.deleteLeader(leader.id);
      setSuccessMsg(`Deleted "${leader.name}" successfully.`);
      dbService.triggerGitHubCommit(`Admin deleted leader profile: ${leader.name}`).then(() => {
        dbService.triggerVercelDeploy();
      });
      onRefreshStats();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete leader.');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected leadership profile(s)?`)) return;

    try {
      await dbService.bulkDelete(selectedIds);
      setSuccessMsg(`Deleted ${selectedIds.length} profile(s) successfully.`);
      setSelectedIds([]);
      onRefreshStats();
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete bulk deletion.');
    }
  };

  const openAddModal = () => {
    setFormState(initialFormState);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowFormModal(true);
  };

  const openEditModal = (leader: SupabaseLeader) => {
    setFormState({
      id: leader.id,
      name: leader.name,
      slug: leader.slug,
      designation: leader.designation,
      category: leader.category,
      state: leader.state || 'Delhi',
      constituency: leader.constituency || 'National Seat',
      party: leader.party || 'Independent',
      gender: leader.gender || 'Male',
      dob: leader.dob || '1975-01-01',
      bio: leader.bio || '',
      education: leader.education || 'Graduate',
      profession: leader.profession || 'Public Service',
      mobile: leader.mobile || '',
      email: leader.email || '',
      address: leader.address || '',
      facebook: leader.facebook || '',
      twitter: leader.twitter || '',
      instagram: leader.instagram || '',
      youtube: leader.youtube || '',
      website: leader.website || '',
      image: leader.image || '',
      cover_image: leader.cover_image || '',
      featured: leader.featured || false,
      status: leader.status || 'Published'
    });
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowFormModal(true);
  };

  const openViewModal = (leader: SupabaseLeader) => {
    setActiveLeader(leader);
    setShowViewModal(true);
  };

  const handleSelectFromLibrary = (url: string) => {
    setFormState(prev => ({ ...prev, image: url }));
    setShowMediaPicker(false);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="space-y-6" id="leaders-crud-container">
      {/* Table Filters Header */}
      <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 p-4 rounded-2xl space-y-4">
        
        {/* Row 1: Search & Actions */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Designation, Constituency..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}

            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer uppercase tracking-wider shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Leader</span>
            </button>
          </div>
        </div>

        {/* Row 2: Advanced Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="Prime Minister">Prime Minister</option>
              <option value="Chief Minister">Chief Minister</option>
              <option value="Deputy Chief Minister">Deputy Chief Minister</option>
              <option value="Cabinet Minister">Cabinet Minister</option>
              <option value="Minister of State">Minister of State</option>
              <option value="Lok Sabha MP">Lok Sabha MP</option>
              <option value="Rajya Sabha MP">Rajya Sabha MP</option>
              <option value="Governor">Governor</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
            >
              <option value="all">All States ({statesList.length})</option>
              {statesList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Political Party</label>
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
            >
              <option value="all">All Parties ({partiesList.length})</option>
              {partiesList.map(py => (
                <option key={py} value={py}>{py}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Profile Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs flex gap-2.5 items-center">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p className="font-bold">{successMsg}</p>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex gap-2.5 items-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="font-bold">{errorMsg}</p>
        </div>
      )}

      {/* Table Component */}
      <div className="border border-slate-150 dark:border-white/5 rounded-2xl overflow-hidden bg-white dark:bg-[#020504]">
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-mono">Synchronizing profiles from database...</p>
          </div>
        ) : leaders.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No leadership records matched</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your advanced filter criteria or text query</p>
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-white/1 text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider sticky top-0 border-b border-slate-100 dark:border-white/5">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === leaders.length && leaders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-3.5">Leader Profile</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Constituency & State</th>
                  <th className="p-3.5">Party</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {leaders.map((leader) => (
                  <tr key={leader.id} className="hover:bg-slate-50/50 dark:hover:bg-white/1 transition">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(leader.id)}
                        onChange={(e) => handleSelectRow(leader.id, e.target.checked)}
                        className="rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 shadow-sm shrink-0">
                          <img 
                            src={leader.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=100'} 
                            alt={leader.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=100';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{leader.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{leader.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-500/10 text-[9px] font-bold font-mono">
                        {leader.category}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-slate-700 dark:text-slate-300">{leader.constituency || 'General'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{leader.state || 'National'}</p>
                    </td>
                    <td className="p-3.5 font-bold text-slate-600 dark:text-slate-400">
                      {leader.party || 'Independent'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold font-mono border ${
                        leader.status === 'Published' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15' 
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15'
                      }`}>
                        {leader.status || 'Published'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => openViewModal(leader)}
                        className="p-1.5 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 rounded-lg transition inline-flex cursor-pointer"
                        title="View Full Profile Card"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(leader)}
                        className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition inline-flex cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSingle(leader)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg transition inline-flex cursor-pointer"
                        title="Delete Record"
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

        {/* Pagination Bar */}
        {!loading && totalPages > 1 && (
          <div className="bg-slate-50 dark:bg-white/1 px-4 py-3.5 flex items-center justify-between border-t border-slate-100 dark:border-white/5 text-xs text-slate-500">
            <p>Showing <span className="font-bold text-slate-700 dark:text-white">{(currentPage-1)*itemsPerPage+1}</span> to <span className="font-bold text-slate-700 dark:text-white">{Math.min(currentPage*itemsPerPage, totalCount)}</span> of <span className="font-bold text-slate-700 dark:text-white">{totalCount}</span> leadership records</p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-600 dark:text-slate-400 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono font-bold text-slate-700 dark:text-white">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white text-slate-600 dark:text-slate-400 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* VIEW MODAL PANEL */}
      {showViewModal && activeLeader && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#040807] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Header banner */}
            <div className="h-28 bg-gradient-to-r from-indigo-900 via-indigo-950 to-emerald-950 relative p-6 flex items-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-4 right-4 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-4 translate-y-8">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-emerald-500 shadow-lg bg-slate-100">
                  <img 
                    src={activeLeader.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=200'} 
                    alt={activeLeader.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-none uppercase tracking-wider">{activeLeader.name}</h3>
                  <p className="text-xs text-indigo-200 font-medium mt-1">{activeLeader.designation} • <span className="font-bold">{activeLeader.party}</span></p>
                </div>
              </div>
            </div>

            {/* Profile Grid Contents */}
            <div className="p-6 pt-12 space-y-5 overflow-y-auto max-h-[450px]">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 bg-slate-50 dark:bg-white/1 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Category Profile</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeLeader.category}</span>
                </div>
                <div className="space-y-1 bg-slate-50 dark:bg-white/1 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Constituency, State</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{activeLeader.constituency || 'General'}, {activeLeader.state || 'National'}</span>
                </div>
              </div>

              {activeLeader.bio && (
                <div className="space-y-1.5 bg-slate-50 dark:bg-white/1 p-3.5 rounded-xl border border-slate-100 dark:border-white/5 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Biography Statement</span>
                  <p className="text-slate-600 dark:text-slate-350 leading-relaxed font-sans">{activeLeader.bio}</p>
                </div>
              )}

              {/* Social links & contact */}
              <div className="space-y-2 border-t border-slate-100 dark:border-white/5 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono mb-2">Verified Communications & Contacts</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  {activeLeader.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="truncate">{activeLeader.email}</span>
                    </div>
                  )}
                  {activeLeader.mobile && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{activeLeader.mobile}</span>
                    </div>
                  )}
                  {activeLeader.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                      <a href={activeLeader.website} target="_blank" rel="noreferrer" className="underline truncate hover:text-indigo-400 flex items-center gap-0.5">
                        <span>Official website</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {activeLeader.twitter && (
                    <a href={activeLeader.twitter} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-300 flex items-center gap-1 text-[10px]">
                      <Twitter className="w-3 h-3 text-sky-400" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {activeLeader.facebook && (
                    <a href={activeLeader.facebook} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-300 flex items-center gap-1 text-[10px]">
                      <Facebook className="w-3 h-3 text-blue-500" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {activeLeader.instagram && (
                    <a href={activeLeader.instagram} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-300 flex items-center gap-1 text-[10px]">
                      <Instagram className="w-3 h-3 text-pink-500" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {activeLeader.youtube && (
                    <a href={activeLeader.youtube} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-300 flex items-center gap-1 text-[10px]">
                      <Youtube className="w-3 h-3 text-red-500" />
                      <span>YouTube</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-white/1 border-t border-slate-150 dark:border-white/5 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#040807] border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scaleUp">
            
            <div className="bg-slate-50 dark:bg-white/1 px-6 py-4 border-b border-slate-150 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{formState.id ? 'Edit Leadership Profile' : 'Register New Leader Profile'}</span>
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-black text-base"
              >
                ×
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[480px]">
              
              {/* Row 1: Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Leader Name *</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={handleNameChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
                    placeholder="e.g. Narendra Modi"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">URL Identifier Slug *</label>
                  <input
                    type="text"
                    required
                    value={formState.slug}
                    onChange={(e) => setFormState(prev => ({ ...prev, slug: e.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 font-mono text-xs focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
                    placeholder="e.g. narendra-modi"
                  />
                </div>
              </div>

              {/* Row 2: Designation, Category, State, Constituency */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Designation</label>
                  <input
                    type="text"
                    value={formState.designation}
                    onChange={(e) => setFormState(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
                    placeholder="e.g. Prime Minister"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Category *</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value as LeaderCategory }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
                  >
                    <option value="Prime Minister">Prime Minister</option>
                    <option value="Chief Minister">Chief Minister</option>
                    <option value="Deputy Chief Minister">Deputy Chief Minister</option>
                    <option value="Cabinet Minister">Cabinet Minister</option>
                    <option value="Minister of State">Minister of State</option>
                    <option value="Lok Sabha MP">Lok Sabha MP</option>
                    <option value="Rajya Sabha MP">Rajya Sabha MP</option>
                    <option value="Governor">Governor</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">State</label>
                  <input
                    type="text"
                    value={formState.state}
                    onChange={(e) => setFormState(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
                    placeholder="e.g. Uttar Pradesh"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Constituency</label>
                  <input
                    type="text"
                    value={formState.constituency}
                    onChange={(e) => setFormState(prev => ({ ...prev, constituency: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
                    placeholder="e.g. Varanasi"
                  />
                </div>
              </div>

              {/* Row 3: Political Party & Portrait Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Political Party</label>
                  <input
                    type="text"
                    value={formState.party}
                    onChange={(e) => setFormState(prev => ({ ...prev, party: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white"
                    placeholder="e.g. BJP, INC, AAP"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Profile Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formState.image}
                      onChange={(e) => setFormState(prev => ({ ...prev, image: e.target.value }))}
                      className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white font-mono text-xs"
                      placeholder="https://..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-white dark:text-indigo-300 font-bold rounded-xl border border-indigo-500/10 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Select From Library</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bio block */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Biography & Career Summary</label>
                <textarea
                  value={formState.bio}
                  onChange={(e) => setFormState(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-3.5 focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-white leading-relaxed"
                  placeholder="Insert verified historical biography, public achievements, portfolio reviews..."
                />
              </div>

              {/* Additional Details Header */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono mb-3">Additional Details & Verified Contacts</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Gender</label>
                    <select
                      value={formState.gender}
                      onChange={(e) => setFormState(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-2 text-slate-700 dark:text-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Date of Birth</label>
                    <input
                      type="date"
                      value={formState.dob}
                      onChange={(e) => setFormState(prev => ({ ...prev, dob: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-2 text-slate-700 dark:text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Email Address</label>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-2 text-slate-700 dark:text-white"
                      placeholder="email@domain.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Phone/Mobile</label>
                    <input
                      type="tel"
                      value={formState.mobile}
                      onChange={(e) => setFormState(prev => ({ ...prev, mobile: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl p-2 text-slate-700 dark:text-white"
                      placeholder="+91..."
                    />
                  </div>
                </div>
              </div>

              {/* Social Channels and status */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs border-t border-slate-100 dark:border-white/5 pt-3">
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Twitter Url</label>
                  <input
                    type="text"
                    value={formState.twitter}
                    onChange={(e) => setFormState(prev => ({ ...prev, twitter: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-1.5"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Facebook Url</label>
                  <input
                    type="text"
                    value={formState.facebook}
                    onChange={(e) => setFormState(prev => ({ ...prev, facebook: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-1.5"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Instagram Url</label>
                  <input
                    type="text"
                    value={formState.instagram}
                    onChange={(e) => setFormState(prev => ({ ...prev, instagram: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-1.5"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">YouTube Url</label>
                  <input
                    type="text"
                    value={formState.youtube}
                    onChange={(e) => setFormState(prev => ({ ...prev, youtube: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-1.5"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-mono text-slate-400 uppercase font-bold">Official Site</label>
                  <input
                    type="text"
                    value={formState.website}
                    onChange={(e) => setFormState(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg p-1.5"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Status toggle & Featured */}
              <div className="border-t border-slate-100 dark:border-white/5 pt-4 flex flex-wrap gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={formState.featured}
                    onChange={(e) => setFormState(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="featured-check" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    Feature this Profile on Home Portal
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-mono text-[10px] uppercase">Publication Status:</span>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as 'Published' | 'Draft' }))}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-lg px-2 py-1 font-bold font-mono"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

            </form>

            {/* Footer */}
            <div className="bg-slate-50 dark:bg-white/1 px-6 py-4 border-t border-slate-150 dark:border-white/5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-750 text-slate-700 dark:text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-250 text-white text-xs font-black rounded-xl transition cursor-pointer uppercase tracking-wider"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Profile'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MEDIA LIBRARY PICKER POPUP */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#040807] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-scaleUp">
            <div className="bg-slate-50 dark:bg-white/1 px-6 py-4 border-b border-slate-150 dark:border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">Select Portrait from Storage Library</h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-black text-lg"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[500px]">
              <ImageLibrary onSelectImage={handleSelectFromLibrary} selectedUrl={formState.image} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
