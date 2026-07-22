import React, { useState, useEffect } from 'react';
import { 
  Newspaper, RefreshCw, Check, X, Edit, Trash2, Pin, Star, Search, Plus, ExternalLink, Calendar, Filter, Save, AlertCircle
} from 'lucide-react';
import { newsRepository } from '../../news/NewsRepository';
import { newsService } from '../../news/NewsService';
import { NewsItem } from '../../news/types';
import { SupabaseLeader } from '../../types';
import { dbService } from '../../lib/supabaseClient';

export default function AdminNewsManager() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingSlug, setSyncingSlug] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLeader, setFilterLeader] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Editing state
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formState, setFormState] = useState<Partial<NewsItem>>({});

  // Fetch leaders and news items
  const loadData = async () => {
    try {
      setLoading(true);
      const allLeaders = await dbService.getLeaders();
      setLeaders(allLeaders);
      const allNews = await newsRepository.getAllNews();
      setNews(allNews);
    } catch (err) {
      console.error('Failed to load news admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      const updated = await newsRepository.updateNewsItem(id, { status });
      setNews(prev => prev.map(item => item.id === id ? updated : item));
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (item: NewsItem) => {
    try {
      const updated = await newsRepository.updateNewsItem(item.id, { is_pinned: !item.is_pinned });
      setNews(prev => prev.map(n => n.id === item.id ? updated : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (item: NewsItem) => {
    try {
      const updated = await newsRepository.updateNewsItem(item.id, { is_featured: !item.is_featured });
      setNews(prev => prev.map(n => n.id === item.id ? updated : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    try {
      const success = await newsRepository.deleteNewsItem(id);
      if (success) {
        setNews(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncNews = async (leader: SupabaseLeader) => {
    try {
      setSyncingSlug(leader.slug);
      setSyncLogs([`[INIT] Triggering real-time sequential fallback sync for ${leader.name}...`]);
      
      const res = await newsService.syncLeaderNews(leader);
      setSyncLogs(res.logs);
      
      if (res.success) {
        // Reload news list
        const allNews = await newsRepository.getAllNews();
        setNews(allNews);
      }
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `[CRITICAL ERROR] Sync failed: ${err.message || err}`]);
    } finally {
      setSyncingSlug(null);
    }
  };

  const handleStartEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormState({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    try {
      const updated = await newsRepository.updateNewsItem(editingItem.id, formState);
      setNews(prev => prev.map(item => item.id === editingItem.id ? updated : item));
      setEditingItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMockNews = async () => {
    if (leaders.length === 0) return;
    const firstLeader = leaders[0];
    const mock: Omit<NewsItem, 'id' | 'created_at' | 'updated_at'> = {
      leader_slug: firstLeader.slug,
      title: `Strategic growth plan announced for ${firstLeader.state}`,
      summary: `Administrative briefing detail on standard portfolio advancements.`,
      content: `A custom-authored ministerial update highlighting progressive constituency targets and infrastructural milestones designed for national growth.`,
      source: 'State Information Wing',
      source_url: 'https://example.com/briefings',
      image_url: '',
      category: 'Policy',
      published_at: new Date().toISOString(),
      is_pinned: false,
      is_featured: false,
      status: 'Approved'
    };

    const created = await newsRepository.createNewsItem(mock);
    setNews(prev => [created, ...prev]);
  };

  const filteredNews = news.filter(item => {
    if (filterLeader !== 'all' && item.leader_slug !== filterLeader) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        (item.summary || '').toLowerCase().includes(q) ||
        item.leader_slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black font-display flex items-center gap-2 text-slate-800 dark:text-white">
            <Newspaper className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Strategic Press & News Board Manager</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Synchronize direct news feeds using Google News RSS, GNews, NewsAPI, and Mediastack, with active editorial oversight.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateMockNews}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Author News</span>
          </button>
          <button
            onClick={loadData}
            className="p-1.5 bg-slate-50 border border-slate-250 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SYNC LEADER NEWS PANEL */}
      <section className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 p-4 rounded-2xl space-y-3 text-xs">
        <h4 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider font-mono text-[10px]">Synchronize News Feed by Leader Portfolio</h4>
        <div className="flex flex-wrap gap-2">
          {leaders.map(l => (
            <button
              key={l.slug}
              onClick={() => handleSyncNews(l)}
              disabled={syncingSlug !== null}
              className={`px-3 py-1.5 rounded-lg font-medium border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                syncingSlug === l.slug
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-white dark:bg-slate-950 hover:bg-slate-50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${syncingSlug === l.slug ? 'animate-spin text-amber-700' : 'text-slate-400'}`} />
              <span>{l.name}</span>
            </button>
          ))}
        </div>

        {syncLogs.length > 0 && (
          <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] p-3 rounded-xl max-h-40 overflow-y-auto space-y-1 mt-3">
            {syncLogs.map((log, idx) => (
              <p key={idx} className={log.includes('[ERROR]') || log.includes('[FAIL]') ? 'text-rose-400' : log.includes('[SUCCESS]') ? 'text-emerald-300 font-bold' : ''}>
                {log}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm text-xs">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search news by keyword..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 pl-9 pr-3 py-2 rounded-xl focus:outline-none"
          />
        </div>

        <div>
          <select
            value={filterLeader}
            onChange={(e) => setFilterLeader(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">Filter by Leader (All)</option>
            {leaders.map(l => (
              <option key={l.slug} value={l.slug}>{l.name}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl focus:outline-none"
          >
            <option value="all">Filter by Status (All)</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="flex items-center justify-end text-slate-400 font-mono text-[10px]">
          <span>Showing {filteredNews.length} of {news.length} articles</span>
        </div>
      </div>

      {/* SPREADSHEET ARTICLES GRID */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <span>Synchronizing administrative newsboard logs...</span>
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-12 rounded-3xl text-center text-slate-400 italic">
          No matching strategic articles located in general ledger records.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNews.map(item => (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-slate-950 p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm ${
                item.status === 'Approved' 
                  ? 'border-slate-100 dark:border-slate-900' 
                  : item.status === 'Rejected'
                    ? 'border-rose-100/30 dark:border-rose-950/20 bg-rose-50/10'
                    : 'border-amber-100/40 bg-amber-50/5'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                {item.image_url && (
                  <img 
                    src={item.image_url} 
                    alt={item.title} 
                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-50"
                  />
                )}
                <div className="space-y-1.5 text-left">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded">
                      {item.source}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.leader_slug.replace(/-/g, ' ')}
                    </span>
                    {item.is_pinned && (
                      <span className="flex items-center gap-0.5 px-1 py-0.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded text-[9px] font-bold font-mono">
                        <Pin className="w-2.5 h-2.5 fill-current" />
                        <span>PINNED</span>
                      </span>
                    )}
                    {item.is_featured && (
                      <span className="flex items-center gap-0.5 px-1 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-bold font-mono">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>FEATURED</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-1 leading-relaxed">
                    {item.summary || item.content}
                  </p>
                </div>
              </div>

              {/* ACTIONS CONTROLS */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Status Toggles */}
                <div className="flex bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-0.5 rounded-xl text-[10px] font-bold font-mono">
                  <button
                    onClick={() => handleStatusChange(item.id, 'Approved')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-0.5 transition-all cursor-pointer ${
                      item.status === 'Approved'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>APP</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(item.id, 'Rejected')}
                    className={`px-2.5 py-1 rounded-lg flex items-center gap-0.5 transition-all cursor-pointer ${
                      item.status === 'Rejected'
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <X className="w-3 h-3" />
                    <span>REJ</span>
                  </button>
                </div>

                {/* Edit & Settings */}
                <button
                  onClick={() => handleTogglePin(item)}
                  title="Toggle Pin Status"
                  className={`p-1.5 rounded-lg border transition-all ${
                    item.is_pinned
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleToggleFeatured(item)}
                  title="Toggle Feature Status"
                  className={`p-1.5 rounded-lg border transition-all ${
                    item.is_featured
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleStartEdit(item)}
                  className="p-1.5 bg-slate-50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-100"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 bg-rose-50 border border-rose-100 dark:border-rose-900 text-rose-600 rounded-lg hover:bg-rose-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-900 p-6 max-w-xl w-full text-left space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
              <h3 className="font-bold font-display text-slate-800 dark:text-white">Edit Administrative Press Briefing</h3>
              <button onClick={() => setEditingItem(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Article Title</label>
                <input
                  type="text"
                  value={formState.title || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Source name</label>
                  <input
                    type="text"
                    value={formState.source || ''}
                    onChange={(e) => setFormState(prev => ({ ...prev, source: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Category</label>
                  <input
                    type="text"
                    value={formState.category || ''}
                    onChange={(e) => setFormState(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Source Link URL</label>
                <input
                  type="text"
                  value={formState.source_url || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, source_url: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Image URL</label>
                <input
                  type="text"
                  value={formState.image_url || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, image_url: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Summary</label>
                <textarea
                  rows={2}
                  value={formState.summary || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, summary: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Content (Full Report)</label>
                <textarea
                  rows={3}
                  value={formState.content || ''}
                  onChange={(e) => setFormState(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-900 pt-3">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
