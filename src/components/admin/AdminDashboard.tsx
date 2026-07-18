import React, { useState, useEffect } from 'react';
import { 
  Users, Image as ImageIcon, Shield, LogOut, LayoutDashboard, 
  MapPin, UserCheck, Settings as SettingsIcon, Database, 
  Menu, X, Sparkles, AlertCircle, CheckCircle2, ChevronRight, 
  Loader2, Moon, Sun, ArrowRight, UserPlus, Info, Copy, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { getSupabase, isSupabaseConfigured, dbService } from '../../lib/supabaseClient';
import { SupabaseLeader, LeaderCategory } from '../../types';
import LeadersCrud from './LeadersCrud';
import ImageLibrary from './ImageLibrary';
import ImageSync from './ImageSync';
import BulkImport from './BulkImport';

type SidebarMenu = 
  | 'dashboard'
  | 'leaders'
  | 'loksabha'
  | 'rajyasabha'
  | 'ministers'
  | 'governors'
  | 'chiefministers'
  | 'parties'
  | 'media'
  | 'sync'
  | 'settings';

export default function AdminDashboard() {
  // Theme settings (mirrors App.tsx but allows local override)
  const [isAdminDark, setIsAdminDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('riva_admin_theme') === 'dark';
  });

  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Layout navigation
  const [activeMenu, setActiveMenu] = useState<SidebarMenu>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Statistics and recently added leaders
  const [leadersData, setLeadersData] = useState<SupabaseLeader[]>([]);
  const [stats, setStats] = useState({
    totalLeaders: 0,
    totalMps: 0,
    totalMinisters: 0,
    totalStates: 0,
    totalParties: 0,
    missingImages: 0
  });
  const [recentLeaders, setRecentLeaders] = useState<SupabaseLeader[]>([]);
  const [partiesSummary, setPartiesSummary] = useState<{ name: string; count: number }[]>([]);

  // SQL Copy states
  const [sqlCopied, setSqlCopied] = useState(false);

  // Sync / Load Dashboard data
  useEffect(() => {
    // Synchronize document dark/light class
    const root = window.document.documentElement;
    if (isAdminDark) {
      root.classList.add('dark');
      localStorage.setItem('riva_admin_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('riva_admin_theme', 'light');
    }
  }, [isAdminDark]);

  // Auth Listener
  useEffect(() => {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setUser(session?.user ?? null);
        setCheckingAuth(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
        setUser(session?.user ?? null);
      });

      return () => subscription.unsubscribe();
    } else {
      // Local session check
      const localSess = localStorage.getItem('riva_admin_session');
      if (localSess) {
        setUser({ email: 'admin@riva.com' });
      }
      setCheckingAuth(false);
    }
  }, []);

  // Fetch metrics data on successful auth
  useEffect(() => {
    if (user) {
      fetchMetrics();
    }
  }, [user]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const allLeaders = await dbService.getLeaders();
      setLeadersData(allLeaders);

      // Total Leaders
      const totalLeaders = allLeaders.length;

      // Total MPs (Lok Sabha + Rajya Sabha)
      const totalMps = allLeaders.filter(l => l.category === 'Lok Sabha MP' || l.category === 'Rajya Sabha MP').length;

      // Total Ministers (Cabinet Minister + Minister of State + Prime Minister)
      const totalMinisters = allLeaders.filter(l => 
        l.category === 'Cabinet Minister' || 
        l.category === 'Minister of State' || 
        l.category === 'Prime Minister'
      ).length;

      // Distinct States
      const states = new Set(allLeaders.map(l => l.state).filter(Boolean));
      const totalStates = states.size;

      // Distinct Parties
      const parties = new Set(allLeaders.map(l => l.party).filter(Boolean));
      const totalParties = parties.size;

      // Missing Images
      const missingImages = allLeaders.filter(l => 
        !l.image || 
        l.image.includes('placeholder') || 
        l.image.includes('unsplash.com/photo-1541872703-74c5e44368f9')
      ).length;

      setStats({
        totalLeaders,
        totalMps,
        totalMinisters,
        totalStates,
        totalParties,
        missingImages
      });

      // Recently added (First 5 profiles ordered by creation or list index)
      setRecentLeaders(allLeaders.slice(0, 5));

      // Parties Summary Breakdown
      const partyCounts: Record<string, number> = {};
      allLeaders.forEach(l => {
        const p = l.party || 'Independent';
        partyCounts[p] = (partyCounts[p] || 0) + 1;
      });
      const partyList = Object.entries(partyCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
      setPartiesSummary(partyList);

    } catch (err) {
      console.error('Failed to resolve database metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setAuthError(error.message);
        }
      } catch (err: any) {
        setAuthError(err.message || 'An unexpected authentication exception occurred.');
      }
    } else {
      // Offline fallback login credentials
      if (email === 'admin@riva.com' && password === 'riva2026') {
        localStorage.setItem('riva_admin_session', 'true');
        setUser({ email: 'admin@riva.com' });
      } else {
        setAuthError('Invalid email or password. Offline sandbox mode: Use admin@riva.com and password riva2026');
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      const supabase = getSupabase();
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('riva_admin_session');
    }
    setUser(null);
  };

  // SQL code to create database schema
  const sqlSchema = `-- SQL Query to create RIVA Leaders Database Schema
-- Run this directly inside your Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.leaders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) DEFAULT 'Leader',
    category VARCHAR(100) DEFAULT 'Cabinet Minister',
    state VARCHAR(150) DEFAULT 'National',
    constituency VARCHAR(150) DEFAULT 'General',
    party VARCHAR(100) DEFAULT 'Independent',
    gender VARCHAR(50) DEFAULT 'Male',
    dob DATE DEFAULT '1975-01-01',
    bio TEXT,
    education VARCHAR(150) DEFAULT 'Graduate',
    profession VARCHAR(150) DEFAULT 'Public Service',
    mobile VARCHAR(50),
    email VARCHAR(150),
    address TEXT,
    facebook VARCHAR(255),
    twitter VARCHAR(255),
    instagram VARCHAR(255),
    youtube VARCHAR(255),
    website VARCHAR(255),
    image TEXT DEFAULT 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400',
    cover_image TEXT,
    gallery TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Turn on Row Level Security (RLS) for public database protection
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;

-- Allow public read access (essential for directory frontend)
CREATE POLICY "Allow public read access" ON public.leaders
    FOR SELECT USING (true);

-- Allow authenticated admins to make updates
CREATE POLICY "Allow authenticated admin write access" ON public.leaders
    FOR ALL TO authenticated USING (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  // Sidebar link map
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leaders', label: 'Leaders Directory', icon: Users },
    { id: 'loksabha', label: 'Lok Sabha MPs', icon: Users, subFilter: 'Lok Sabha MP' },
    { id: 'rajyasabha', label: 'Rajya Sabha MPs', icon: Users, subFilter: 'Rajya Sabha MP' },
    { id: 'ministers', label: 'Cabinet Ministers', icon: Users, subFilter: 'Cabinet Minister' },
    { id: 'governors', label: 'Governors', icon: Users, subFilter: 'Governor' },
    { id: 'chiefministers', label: 'Chief Ministers', icon: Users, subFilter: 'Chief Minister' },
    { id: 'parties', label: 'Political Parties', icon: Shield },
    { id: 'media', label: 'Image Library', icon: ImageIcon },
    { id: 'sync', label: 'Image Sync', icon: RefreshCw },
    { id: 'settings', label: 'SQL & Settings', icon: SettingsIcon }
  ];

  // Map sub-filter categories
  const activeLabel = menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard';

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020705] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" />
          <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Checking Authentication session...</p>
        </div>
      </div>
    );
  }

  // LOGIN PAGE
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020705] flex items-center justify-center p-4 transition-colors duration-300">
        <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-scaleUp">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Toggle dark mode in login */}
          <button
            onClick={() => setIsAdminDark(!isAdminDark)}
            className="absolute top-4 right-4 p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            {isAdminDark ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 mb-3 animate-pulse">
              <Shield className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black font-mono tracking-[0.25em] text-emerald-500 uppercase">RIVA STRATEGIES</p>
            <h2 className="text-xl font-black text-slate-850 dark:text-white uppercase mt-1 tracking-wider">Admin Portal</h2>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 font-medium">Verify login authorization to alter leadership files</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {authError && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-normal">{authError}</p>
              </div>
            )}

            {!isSupabaseConfigured && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-xl leading-relaxed">
                <span className="font-bold">Sandbox Mode Activated:</span> Use local fallback account <strong>admin@riva.com</strong> with password <strong>riva2026</strong>.
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@riva.com"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Secret Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black rounded-xl uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 mt-6 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Auth...</span>
                </>
              ) : (
                <>
                  <span>Sign In To Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isAdminDark ? 'bg-[#020705] text-slate-200 dark' : 'bg-slate-50 text-slate-800'} transition-colors duration-300 font-sans flex flex-col md:flex-row`}>
      
      {/* 1. LEFT SIDEBAR */}
      <aside className={`w-full md:w-64 shrink-0 transition-all ${isAdminDark ? 'bg-[#020d09] border-r border-white/5' : 'bg-white border-r border-slate-200'} md:block ${mobileMenuOpen ? 'block' : 'hidden md:block'} flex flex-col justify-between h-screen sticky top-0 z-40`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Sidebar Brand Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-white/5 h-20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[8px] font-black tracking-widest text-emerald-500 font-mono block">RIVA SYSTEM</span>
                <h1 className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-white">Admin Dashboard</h1>
              </div>
            </div>

            {/* Mobile close trigger */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 md:hidden hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenu === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id as SidebarMenu);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-500' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/1'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account Controls */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 text-xs font-mono font-bold">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none">System Admin</p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5" title={user.email}>{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600/10 hover:bg-red-600/25 border border-red-500/10 text-red-500 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className={`h-20 shrink-0 border-b flex items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md ${isAdminDark ? 'bg-[#020705]/90 border-white/5' : 'bg-white/95 border-slate-150'}`}>
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2.5 md:hidden bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition text-slate-600 dark:text-white"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span className="text-slate-500 dark:text-slate-400">Portal</span>
              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
              <span className="text-slate-700 dark:text-slate-200 font-bold">{activeLabel}</span>
            </div>
          </div>

          {/* Quick Header toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminDark(!isAdminDark)}
              className={`p-2.5 border ${isAdminDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'} rounded-xl transition-all flex items-center justify-center cursor-pointer`}
              title="Toggle Theme"
            >
              {isAdminDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden sm:block text-right">
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20 text-[9px] font-bold font-mono uppercase tracking-wider">
                Auth Secure
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic content scroll frame */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* A. OVERVIEW DASHBOARD */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header card with quick search info */}
              <div className="p-6 bg-gradient-to-r from-emerald-950/80 to-indigo-950/80 rounded-3xl border border-emerald-500/10 relative overflow-hidden text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-black uppercase">National Grid Admin Console</span>
                  <h2 className="text-lg md:text-xl font-black uppercase tracking-wider">Verified Indian Leadership Hub</h2>
                  <p className="text-xs text-slate-300 max-w-xl">Compile and update public directory profiles, constituent statistics, and Cabinet portfolio sheets in the directory catalogs.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveMenu('leaders')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl uppercase tracking-wider transition cursor-pointer shadow-sm"
                  >
                    Manage Profiles
                  </button>
                  <button 
                    onClick={fetchMetrics}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition"
                    title="Reload stats"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Statistics Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                
                <div className="p-4 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl flex items-center gap-3.5 shadow-sm hover:shadow-md transition">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/10">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase leading-none">Total Leaders</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white mt-1.5">{stats.totalLeaders}</p>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl flex items-center gap-3.5 shadow-sm hover:shadow-md transition">
                  <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/10">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase leading-none">Total MPs</p>
                    <p className="text-xl font-black text-emerald-500 mt-1.5">{stats.totalMps}</p>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl flex items-center gap-3.5 shadow-sm hover:shadow-md transition">
                  <div className="p-3 bg-pink-500/10 text-pink-500 rounded-xl border border-pink-500/10">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase leading-none">Total Ministers</p>
                    <p className="text-xl font-black text-pink-500 mt-1.5">{stats.totalMinisters}</p>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl flex items-center gap-3.5 shadow-sm hover:shadow-md transition">
                  <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase leading-none">Total States</p>
                    <p className="text-xl font-black text-amber-500 mt-1.5">{stats.totalStates}</p>
                  </div>
                </div>

                <div className="p-4 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl col-span-2 sm:col-span-1 flex items-center gap-3.5 shadow-sm hover:shadow-md transition">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/10">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono font-bold text-slate-400 uppercase leading-none">Active Parties</p>
                    <p className="text-xl font-black text-purple-500 mt-1.5">{stats.totalParties}</p>
                  </div>
                </div>

              </div>

              {/* Sub-dashboard Section: Recently added & Bulk action shortcut banner */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Recently added profiles */}
                <div className="lg:col-span-2 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Recently Added Profiles</h3>
                    
                    {loading ? (
                      <div className="py-10 text-center text-xs text-slate-400">Loading catalog indicators...</div>
                    ) : recentLeaders.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">No profile files generated yet.</div>
                    ) : (
                      <div className="space-y-3">
                        {recentLeaders.map((leader) => (
                          <div 
                            key={leader.id} 
                            onClick={() => {
                              setActiveMenu('leaders');
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-white/1 hover:bg-slate-50 dark:hover:bg-white/1 cursor-pointer transition text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                <img 
                                  src={leader.image || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=100'} 
                                  alt={leader.name} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{leader.name}</h4>
                                <p className="text-[10px] text-slate-450 mt-0.5">{leader.designation} • <span className="font-mono text-emerald-500 font-bold">{leader.party}</span></p>
                              </div>
                            </div>

                            <span className="text-[9px] font-mono text-slate-400 bg-slate-50 dark:bg-white/5 border border-slate-150 dark:border-white/10 px-2 py-0.5 rounded-md font-bold uppercase">
                              {leader.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveMenu('leaders')}
                    className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-white/1 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View and Edit catalog files</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 2. Shortcuts & Bulk operations */}
                <div className="space-y-6">
                  
                  {/* Bulk import shortcut card */}
                  <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 p-5 rounded-2xl shadow-sm text-xs space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-wider text-slate-800 dark:text-white leading-none">Bulk import tool</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Upload CSV or Excel spreadsheets</p>
                      </div>
                    </div>
                    
                    <p className="text-slate-550 dark:text-slate-400 leading-relaxed font-sans">
                      Quickly insert dozens of politicians, MPs, and cabinets directly from spreadsheets in seconds.
                    </p>

                    <button
                      onClick={() => setActiveMenu('settings')}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-white dark:text-indigo-300 font-black rounded-xl border border-indigo-500/10 transition cursor-pointer text-center uppercase tracking-wider"
                    >
                      Open Import Grid
                    </button>
                  </div>

                  {/* Image sync shortcut card */}
                  <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 p-5 rounded-2xl shadow-sm text-xs space-y-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-wider text-slate-800 dark:text-white leading-none">Missing portrait scanner</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Detect placeholder profiles</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 dark:bg-black/25 p-2 rounded-xl border border-slate-100 dark:border-white/5 font-mono text-[10px]">
                      <span className="text-slate-400 font-bold">Unmapped Profiles:</span>
                      <span className="text-red-500 font-black">{stats.missingImages} profiles</span>
                    </div>

                    <button
                      onClick={() => setActiveMenu('sync')}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl transition cursor-pointer text-center uppercase tracking-wider"
                    >
                      Sync missing photos
                    </button>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* B. LEADERS LISTS AND SUB-FILTER CATEGORIES */}
          {activeMenu === 'leaders' && <LeadersCrud onRefreshStats={fetchMetrics} />}
          {activeMenu === 'loksabha' && <LeadersCrud categoryFilter="Lok Sabha MP" onRefreshStats={fetchMetrics} />}
          {activeMenu === 'rajyasabha' && <LeadersCrud categoryFilter="Rajya Sabha MP" onRefreshStats={fetchMetrics} />}
          {activeMenu === 'ministers' && <LeadersCrud categoryFilter="Cabinet Minister" onRefreshStats={fetchMetrics} />}
          {activeMenu === 'governors' && <LeadersCrud categoryFilter="Governor" onRefreshStats={fetchMetrics} />}
          {activeMenu === 'chiefministers' && <LeadersCrud categoryFilter="Chief Minister" onRefreshStats={fetchMetrics} />}

          {/* C. POLITICAL PARTIES VIEW */}
          {activeMenu === 'parties' && (
            <div className="bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 p-6 rounded-2xl shadow-sm space-y-4 animate-fadeIn text-xs">
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Political Parties Metrics</h2>
                <p className="text-xs text-slate-500">Summary list of political parties derived from your verified database listings</p>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400">Loading catalog lists...</div>
              ) : partiesSummary.length === 0 ? (
                <div className="py-16 text-center text-slate-400">No parties cataloged in the database.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {partiesSummary.map((party) => (
                    <div key={party.name} className="p-4 bg-slate-50 dark:bg-white/1 border border-slate-100 dark:border-white/5 rounded-2xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 text-white flex items-center justify-center font-black font-mono">
                          {party.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-850 dark:text-white">{party.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Political Coalition</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-black text-slate-800 dark:text-white">{party.count}</p>
                        <p className="text-[9px] font-mono text-slate-400 uppercase">Members</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* D. IMAGE ASSETS LIBRARY */}
          {activeMenu === 'media' && <ImageLibrary />}

          {/* E. AUTOMATED PORTRAIT SCANNER SYNC */}
          {activeMenu === 'sync' && <ImageSync onSyncComplete={fetchMetrics} />}

          {/* F. SYSTEM SQL SCHEMAS AND SETTINGS */}
          {activeMenu === 'settings' && (
            <div className="space-y-6 animate-fadeIn text-xs">
              
              {/* Database Schema Setup Instruction */}
              <div className="p-6 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-850 dark:text-white">Database Schema Setup</h3>
                    <p className="text-xs text-slate-500">Run this query inside your Supabase project editor to create the SQL table structure</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SQL Schema Query (RLS policies included)</span>
                    <button
                      onClick={copySqlToClipboard}
                      className="flex items-center gap-1 text-[10px] text-indigo-500 hover:text-indigo-400 font-bold cursor-pointer"
                    >
                      {sqlCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{sqlCopied ? 'Copied to Clipboard' : 'Copy SQL Script'}</span>
                    </button>
                  </div>

                  <pre className="p-4 bg-slate-900 rounded-2xl border border-slate-850 text-[10.5px] text-slate-350 overflow-x-auto max-h-[220px] font-mono select-all leading-relaxed">
                    {sqlSchema}
                  </pre>
                </div>
              </div>

              {/* Excel / CSV Bulk Data Importer embedded inside settings for easy access */}
              <div className="p-6 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl shadow-sm">
                <BulkImport onImportComplete={fetchMetrics} />
              </div>

              {/* System Credentials summary */}
              <div className="p-6 bg-white dark:bg-[#040807] border border-slate-150 dark:border-white/5 rounded-2xl shadow-sm space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white font-mono border-b border-slate-100 dark:border-white/5 pb-3">Database Connection Status</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] text-slate-450 uppercase tracking-widest block font-mono font-bold">Client API State</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold mt-1.5 ${isSupabaseConfigured ? 'text-emerald-500' : 'text-amber-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>{isSupabaseConfigured ? 'Connected to Supabase Project' : 'Offline Sandbox Fallback Mode'}</span>
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
                    <span className="text-[10px] text-slate-450 uppercase tracking-widest block font-mono font-bold">Storage Bucket Name</span>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1.5 block">leader-profiles</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
