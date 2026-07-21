import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, MapPin, Award, Users, Shield, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { SupabaseLeader, LeaderCategory } from '../../types';
import { dbService } from '../../lib/supabaseClient';
import { getDirectImageUrl } from '../KnowYourMinister';
import { LeaderAvatar, LeaderCover } from './GovtDesignSystem';

interface SearchPageProps {
  initialFilters?: {
    category?: string;
    state?: string;
    query?: string;
  };
  onSelectLeader: (slug: string) => void;
}

export default function SearchPage({ initialFilters, onSelectLeader }: SearchPageProps) {
  const [leaders, setLeaders] = useState<SupabaseLeader[]>([]);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [aiSearchInterpretation, setAiSearchInterpretation] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialFilters?.query || '');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || 'all');
  const [selectedState, setSelectedState] = useState(initialFilters?.state || 'all');
  const [selectedParty, setSelectedParty] = useState('all');
  const [selectedFeatured, setSelectedFeatured] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  // Natural Language Parser for AI Search
  const parseNaturalLanguageQuery = (query: string) => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return null;

    const parsed: {
      category?: string;
      state?: string;
      party?: string;
      gender?: string;
      keyword?: string;
    } = {};

    // Detect States
    const statesList = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 
      'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
      'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
      'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];
    for (const st of statesList) {
      if (normalized.includes(st.toLowerCase())) {
        parsed.state = st;
        break;
      }
    }

    // Detect Parties
    const partiesList = [
      { name: 'BJP', terms: ['bjp', 'bharatiya janata'] },
      { name: 'INC', terms: ['congress', 'inc', 'indian national congress'] },
      { name: 'TMC', terms: ['trinamool', 'tmc'] },
      { name: 'AAP', terms: ['aap', 'aam aadmi'] },
      { name: 'SP', terms: ['samajwadi', 'sp'] },
      { name: 'DMK', terms: ['dmk', 'dravida munnetra'] }
    ];
    for (const p of partiesList) {
      if (p.terms.some(t => normalized.includes(t))) {
        parsed.party = p.name;
        break;
      }
    }

    // Detect Categories
    if (normalized.includes('chief minister') || normalized.includes('cm')) {
      parsed.category = 'Chief Minister';
    } else if (normalized.includes('prime minister') || normalized.includes('pm')) {
      parsed.category = 'Prime Minister';
    } else if (normalized.includes('cabinet minister') || normalized.includes('cabinet ministers')) {
      parsed.category = 'Cabinet Minister';
    } else if (normalized.includes('deputy chief minister') || normalized.includes('deputy cm')) {
      parsed.category = 'Deputy Chief Minister';
    } else if (normalized.includes('governor') || normalized.includes('governors')) {
      parsed.category = 'Governor';
    } else if (normalized.includes('mp') || normalized.includes('mps') || normalized.includes('member of parliament')) {
      if (normalized.includes('rajya sabha')) {
        parsed.category = 'Rajya Sabha MP';
      } else {
        parsed.category = 'Lok Sabha MP';
      }
    }

    // Detect Gender
    if (normalized.includes('women') || normalized.includes('woman') || normalized.includes('female') || normalized.includes('lady') || normalized.includes('ladies')) {
      parsed.gender = 'Female';
    } else if (normalized.includes('men') || normalized.includes('man') || normalized.includes('male') || normalized.includes('gentleman')) {
      parsed.gender = 'Male';
    }

    // Keyword parsing
    let keywordCleaned = normalized;
    if (parsed.state) keywordCleaned = keywordCleaned.replace(parsed.state.toLowerCase(), '');
    if (parsed.category) keywordCleaned = keywordCleaned.replace(parsed.category.toLowerCase(), '');
    if (parsed.party) keywordCleaned = keywordCleaned.replace(parsed.party.toLowerCase(), '');
    if (parsed.gender) {
      keywordCleaned = keywordCleaned.replace('women', '').replace('woman', '').replace('female', '').replace('lady', '').replace('ladies', '');
    }
    keywordCleaned = keywordCleaned
      .replace(/\bfrom\b/g, '')
      .replace(/\bof\b/g, '')
      .replace(/\bin\b/g, '')
      .replace(/\belected after\b/g, '')
      .replace(/\belected\b/g, '')
      .replace(/\bminister\b/g, '')
      .replace(/\bministers\b/g, '')
      .replace(/\bwho is\b/g, '')
      .replace(/\bshow me\b/g, '')
      .trim();

    if (keywordCleaned.length > 2) {
      parsed.keyword = keywordCleaned;
    }

    return parsed;
  };

  // Load and apply filters
  const loadFilteredLeaders = async () => {
    setError(null);
    try {
      setLoading(true);
      
      // Parse query for natural language elements
      const nlp = parseNaturalLanguageQuery(searchQuery);
      
      const queryCategory = nlp?.category || selectedCategory;
      const queryState = nlp?.state || selectedState;
      const queryParty = nlp?.party || selectedParty;
      const querySearch = nlp?.keyword || (nlp ? '' : searchQuery);

      // Display AI interpretation explanation
      if (nlp && (nlp.category || nlp.state || nlp.party || nlp.gender || nlp.keyword)) {
        const parts: string[] = [];
        if (nlp.category) parts.push(`Category: "${nlp.category}"`);
        if (nlp.state) parts.push(`State: "${nlp.state}"`);
        if (nlp.party) parts.push(`Party: "${nlp.party}"`);
        if (nlp.gender) parts.push(`Gender: "${nlp.gender}"`);
        if (nlp.keyword) parts.push(`Topic Search: "${nlp.keyword}"`);
        setAiSearchInterpretation(`🔍 AI Semantic Parser matched parameters: ${parts.join(', ')}`);
      } else {
        setAiSearchInterpretation(null);
      }

      const filters: any = {
        category: queryCategory,
        state: queryState,
        party: queryParty,
        search: querySearch
      };
      if (selectedFeatured === 'yes') {
        filters.featured = true;
      }
      
      let data = await dbService.getLeaders(filters);
      
      // Secondary client-side filters for finer search like Gender
      if (nlp?.gender) {
        data = data.filter(l => (l.gender || 'Male').toLowerCase() === nlp.gender?.toLowerCase());
      }

      // Public directory page should only view Published leaders
      setLeaders(data || []);
      setCurrentPage(1); // Reset page to 1 when filters change
    } catch (err: any) {
      console.error('Failed to load search list:', err);
      setError('Failed to load leader data.');
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilteredLeaders();
  }, [selectedCategory, selectedState, selectedParty, selectedFeatured, searchQuery]);

  // List of states & parties in our seed data for selection
  const filterStates = [
    'all',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
  ];

  const filterParties = [
    'all',
    'BJP',
    'INC',
    'TMC',
    'AAP',
    'SHS',
    'NCP',
    'TDP',
    'JSP',
    'JD(S)',
    'HAM',
    'JD(U)',
    'LJP',
    'JMM',
    'CPI(M)',
    'NPP',
    'ZPM',
    'NDPP',
    'SKM',
    'DMK',
    'SP',
    'Independent'
  ];

  const filterCategories = [
    'all', 'Prime Minister', 'Chief Minister', 'Deputy Chief Minister', 'Cabinet Minister', 'Minister of State', 'Lok Sabha MP', 'Rajya Sabha MP', 'Governor'
  ];

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedState('all');
    setSelectedParty('all');
    setSelectedFeatured('all');
  };

  return (
    <div className="space-y-8 text-left py-4">
      {/* 1. HEADER SECTION */}
      <div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white font-display">
          Search Directory
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
          Apply administrative and demographic filters to find legislative profiles.
        </p>
      </div>

      {/* 2. ADVANCED FILTER PANEL */}
      <section className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl shadow-sm space-y-4">
        {/* Row 1: Search Text */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type name, constituency, keywords or ministry details..."
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 pl-12 pr-4 py-3 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        {/* Row 2: Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Category */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none cursor-pointer"
            >
              {filterCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none cursor-pointer"
            >
              {filterStates.map((st, idx) => (
                <option key={idx} value={st}>{st === 'all' ? 'All States' : st}</option>
              ))}
            </select>
          </div>

          {/* Party */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Party Alliance</label>
            <select
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none cursor-pointer"
            >
              {filterParties.map((p, idx) => (
                <option key={idx} value={p}>{p === 'all' ? 'All Parties' : p}</option>
              ))}
            </select>
          </div>

          {/* Featured */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Profile Type</label>
            <select
              value={selectedFeatured}
              onChange={(e) => setSelectedFeatured(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Profiles</option>
              <option value="yes">Featured Only</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {aiSearchInterpretation && (
          <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-850/60 rounded-xl text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 flex items-center gap-2 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
            <span className="font-sans">{aiSearchInterpretation}</span>
          </div>
        )}
      </section>

      {/* 3. SEARCH RESULTS LISTING */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 font-mono text-xs">
          Loading filtered results...
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-16 rounded-2xl shadow-sm text-center space-y-3">
          <p className="text-slate-400 text-sm font-medium">{error}</p>
        </div>
      ) : leaders.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-16 rounded-2xl shadow-sm text-center space-y-3">
          <p className="text-slate-400 text-sm font-medium">No leaders found.</p>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer hover:bg-emerald-500"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((leader) => {
              console.log("Rendering leader photo (Search):", leader.name, "->", leader.image);
              return (
                <motion.div
                key={leader.id}
                whileHover={{ y: -3 }}
                className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm flex flex-col"
              >
                <div className="h-32 bg-slate-50 relative overflow-hidden">
                  <LeaderCover
                    coverImage={leader.cover_image}
                    name={leader.name}
                    className="w-full h-full object-cover filter brightness-75"
                  />
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-emerald-600 text-white font-bold text-[8px] rounded uppercase font-mono tracking-wider">
                    {leader.party}
                  </span>
                </div>

                <div className="px-5 pb-5 relative -mt-8 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 border-2 border-white dark:border-slate-950 shadow-md">
                      <LeaderAvatar
                        image={leader.image}
                        name={leader.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white leading-tight">
                        {leader.name}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono leading-tight">
                        {leader.designation}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pt-1.5">
                        {leader.bio}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 dark:border-slate-900/40 flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono truncate max-w-[60%]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{leader.constituency}</span>
                    </div>
                    <button
                      onClick={() => onSelectLeader(leader.slug)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 hover:text-slate-900 dark:text-emerald-400 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      View Dossier
                    </button>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {leaders.length > itemsPerPage && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-900">
              <div className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(leaders.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(leaders.length, currentPage * itemsPerPage)}</span> of <span className="font-bold text-slate-800 dark:text-slate-200">{leaders.length}</span> profiles
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer`}
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                  Page {currentPage} of {Math.ceil(leaders.length / itemsPerPage)}
                </div>
                <button
                  disabled={currentPage === Math.ceil(leaders.length / itemsPerPage)}
                  onClick={() => {
                    setCurrentPage(prev => Math.min(Math.ceil(leaders.length / itemsPerPage), prev + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer`}
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
