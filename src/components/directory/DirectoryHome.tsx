import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, MapPin, Users, Award, Shield, ArrowRight, 
  Sparkles, Building, ChevronRight, Activity 
} from 'lucide-react';
import { SupabaseLeader, LeaderCategory } from '../../types';
import { dbService } from '../../lib/supabaseClient';

const getDirectImageUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http') && (url.includes('wikimedia.org') || url.includes('wikipedia.org'))) {
    return `/api/directory/proxy-image?url=${encodeURIComponent(url)}`;
  }
  return url;
};

interface DirectoryHomeProps {
  onSelectLeader: (slug: string) => void;
  onNavigateTo: (page: string, params?: any) => void;
}

export default function DirectoryHome({ onSelectLeader, onNavigateTo }: DirectoryHomeProps) {
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load featured leaders on mount
  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        const data = await dbService.getLeaders({ featured: true });
        setLeaders(data);
      } catch (err) {
        console.error('Failed to load featured leaders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  // Handler for quick search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateTo('search', { query: searchQuery });
  };

  const categories: { title: LeaderCategory; desc: string; icon: any; count: number }[] = [
    { title: 'Prime Minister', desc: 'Head of Government of the Republic of India', icon: Shield, count: 1 },
    { title: 'Chief Minister', desc: 'Executive heads of states and union territories', icon: Building, count: 28 },
    { title: 'Cabinet Minister', desc: 'Central cabinet decision-makers and portfolio heads', icon: Users, count: 30 },
    { title: 'Lok Sabha MP', desc: 'Elected lawmakers representing constituencies', icon: Award, count: 543 },
    { title: 'Governor', desc: 'Constitutional heads representing the President', icon: MapPin, count: 28 },
  ];

  const states = [
    { name: 'Uttar Pradesh', count: 80, code: 'UP', image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400' },
    { name: 'Maharashtra', count: 48, code: 'MH', image: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=400' },
    { name: 'West Bengal', count: 42, code: 'WB', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400' },
    { name: 'Gujarat', count: 26, code: 'GJ', image: 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?w=400' },
  ];

  return (
    <div className="space-y-16 py-6 text-left">
      {/* 1. HERO SEARCH SECTION */}
      <section className="relative bg-white dark:bg-[#040807] rounded-3xl p-8 sm:p-16 border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Verified Public Servant Database</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-slate-800 dark:text-white font-display">
              India Political <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Leaders Directory</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl font-sans font-medium">
              A public utility framework compiling verified cabinet portfolios, state legislatures, biographies, constituency statistics, and social accountability trackers. Powered by dynamic Google Grounding, verified affidavits, and media records.
            </p>
          </div>

          {/* Direct Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl">
            <div className="relative bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  required
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search leaders by name, state, constituency, or party..."
                  className="w-full bg-transparent pl-12 pr-4 py-3 text-sm focus:outline-none text-slate-900 dark:text-white font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all uppercase tracking-wider"
              >
                Search Directory
              </button>
            </div>
          </form>

          {/* Quick Metrics */}
          <div className="pt-4 flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>DURABLE CLOUD SYNCED</span>
            </div>
            <span>•</span>
            <span>790+ PARLIAMENT REPRESENTATIVES</span>
            <span>•</span>
            <span>31 LEGISLATIVE ASSEMBLIES</span>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY QUICK-NAV CARD GRID */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-display">
            Browse by Administrative Category
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
            Select an administrative branch to view lists of verified office-holders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ y: -4 }}
                onClick={() => onNavigateTo('search', { category: cat.title })}
                className="p-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl shadow-sm text-left flex flex-col justify-between h-44 cursor-pointer hover:border-emerald-500/30 transition-all group"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 rounded-xl w-12 h-12 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-tight">
                    {cat.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED LEADERS BENTO SECTIONS */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white font-display">
              Featured Leadership Profiles
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
              In-depth public dossier tracking of key national decision makers.
            </p>
          </div>
          <button
            onClick={() => onNavigateTo('search')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs font-mono">
            Loading directory profiles...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaders.map((leader) => {
              console.log("Rendering leader photo:", leader.name, "->", leader.image);
              return (
                <motion.div
                key={leader.id}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                {/* Image Banner */}
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={leader.cover_image}
                    alt={leader.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover brightness-75"
                  />
                  <span className="absolute top-4 left-4 px-2.5 py-1 bg-emerald-600 text-white font-bold text-[9px] rounded-md uppercase tracking-wider font-mono">
                    {leader.party}
                  </span>
                  <span className="absolute top-4 right-4 px-2.5 py-1 bg-black/40 text-white font-bold text-[9px] rounded-md uppercase tracking-wider font-mono">
                    {leader.category}
                  </span>
                </div>

                {/* Avatar Overlay */}
                <div className="px-6 relative -mt-12 flex-1 pb-6 space-y-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 border-4 border-white dark:border-slate-950 shadow-md">
                    <img
                      src={getDirectImageUrl(leader.image)}
                      alt={leader.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=400';
                      }}
                    />
                  </div>

                  <div className="space-y-1.5 text-left">
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">
                      {leader.name}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                      {leader.designation}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {leader.bio}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="pt-2 border-t border-slate-50 dark:border-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{leader.constituency}, {leader.state}</span>
                    </div>
                    <button
                      onClick={() => onSelectLeader(leader.slug || leader.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      <span>Full Bio</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. STATE WISE BENTO BLOCK */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-display">
            Browse by State Jurisdiction
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
            Filter public representatives by state governance domains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {states.map((st, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.01 }}
              onClick={() => onNavigateTo('search', { state: st.name })}
              className="group relative h-36 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-900 text-left cursor-pointer shadow-sm"
            >
              <img
                src={st.image}
                alt={st.name}
                className="w-full h-full object-cover filter brightness-50 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
                  {st.code} ASSEMBLY
                </span>
                <h3 className="font-extrabold text-white text-base leading-none mt-1">
                  {st.name}
                </h3>
                <p className="text-[10px] text-slate-300 font-medium mt-1">
                  {st.count} Verified Representatives
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
}
