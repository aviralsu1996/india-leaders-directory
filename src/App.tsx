import React, { useState, useEffect } from 'react';
import { Shield, Sun, Moon, Mail, BookOpen, Sparkles, Terminal, Info } from 'lucide-react';
import KnowYourMinister from './components/KnowYourMinister';
import GoogleAd from './components/GoogleAd';
import ContactUs from './components/ContactUs';

// Import newly created Political leaders directory modules
import DirectoryHome from './components/directory/DirectoryHome';
import LeaderDetailsPage from './components/directory/LeaderDetailsPage';
import SearchPage from './components/directory/SearchPage';
import AboutPage from './components/directory/AboutPage';
import ContactPage from './components/directory/ContactPage';
import DirectoryAdmin from './components/directory/DirectoryAdmin';
import AdminDashboard from './components/admin/AdminDashboard';
import { dbService } from './lib/supabaseClient';

/** Leader detail pages live at /leaders/<slug> so they have a real, shareable, crawlable URL. */
const LEADER_PATH_PATTERN = /^\/leaders\/([^/]+)\/?$/;

function parseInitialLeaderSlug(): string | null {
  const match = window.location.pathname.match(LEADER_PATH_PATTERN);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Simple clean router to support /admin path independently
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const initialLeaderSlug = parseInitialLeaderSlug();

  // Main navigation tabs: 'directory' | 'ai-grounding' | 'admin'
  const [mainTab, setMainTab] = useState<'directory' | 'ai-grounding' | 'admin'>('directory');

  // Directory sub-page routing: 'home' | 'search' | 'details' | 'about' | 'contact'
  const [directoryView, setDirectoryView] = useState<'home' | 'search' | 'details' | 'about' | 'contact'>(
    initialLeaderSlug ? 'details' : 'home'
  );
  const [selectedLeaderSlug, setSelectedLeaderSlug] = useState<string>(initialLeaderSlug || '');
  const [searchParams, setSearchParams] = useState<any>(null);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      const slug = parseInitialLeaderSlug();
      if (slug) {
        setMainTab('directory');
        setDirectoryView('details');
        setSelectedLeaderSlug(slug);
      } else if (window.location.pathname === '/' || window.location.pathname === '') {
        setDirectoryView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Apply dark/light theme class to document elements
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Dynamic SEO, Sitemap, & Schema.org Graph Automation Engine
  useEffect(() => {
    let cancelled = false;

    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const upsertCanonical = (href: string) => {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    const buildSitemapJsonLd = () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "India Leaders Directory",
      "url": window.location.origin,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${window.location.origin}/search?query={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });

    async function applySeo() {
      let title = "India Political Leaders Directory - AI Intelligence Platform";
      let desc = "Track cabinet portfolios, parliamentary questions, assets affidavits, and official statement logs of India's political leaders.";
      let image = `${window.location.origin}/favicon.svg`;
      let canonicalPath = '/';
      let schemaData: any = buildSitemapJsonLd();

      if (mainTab === 'directory') {
        if (directoryView === 'details' && selectedLeaderSlug) {
          canonicalPath = `/leaders/${encodeURIComponent(selectedLeaderSlug)}`;
          try {
            const leader = await dbService.getLeaderBySlug(selectedLeaderSlug);
            if (leader && !cancelled) {
              title = `${leader.name} - ${leader.designation} (${leader.party}, ${leader.constituency}) | Verified Public Profile`;
              desc = `Official public dossier for ${leader.name}, serving as ${leader.designation} representing ${leader.constituency}, ${leader.state}. View assets, debates record, speech logs, and live news coverage.`;
              if (leader.image) image = leader.image;
              schemaData = [
                schemaData,
                {
                  "@context": "https://schema.org",
                  "@type": "Person",
                  "name": leader.name,
                  "jobTitle": leader.designation,
                  "image": leader.image || undefined,
                  "affiliation": {
                    "@type": "Organization",
                    "name": leader.party
                  },
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": leader.constituency,
                    "addressRegion": leader.state
                  },
                  "description": leader.bio
                },
                {
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": `What is the political party of ${leader.name}?`,
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": `${leader.name} belongs to the ${leader.party} political party.`
                      }
                    },
                    {
                      "@type": "Question",
                      "name": `What designation does ${leader.name} hold?`,
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": `${leader.name} currently holds the portfolio designation of ${leader.designation}.`
                      }
                    }
                  ]
                }
              ];
            }
          } catch (err) {
            console.error('Failed to load leader for SEO tags:', err);
          }
        } else if (directoryView === 'search') {
          canonicalPath = '/search';
          title = "Search Indian Legislators, MPs, and Chief Ministers | Live Directory";
          desc = "Advanced search and filtering catalog across Lok Sabha, Rajya Sabha, Cabinet Ministers, and state governors.";
        } else if (directoryView === 'about') {
          canonicalPath = '/about';
          title = "About Riva Analytica Political Intelligence Platform";
          desc = "The public utility framework compiling verified cabinet portfolios, biographies, constituency statistics, and social accountability trackers.";
        } else if (directoryView === 'contact') {
          canonicalPath = '/contact';
        }
      } else if (mainTab === 'ai-grounding') {
        title = "AI Intelligence Grounding Center - India Leaders Directory";
        desc = "Continuous AI-grounded news verification feeds compiled across regional press releases, gazettes, and official government announcements.";
      }

      if (cancelled) return;

      // Title, description, canonical
      document.title = title;
      upsertMeta('name', 'description', desc);
      upsertCanonical(`${window.location.origin}${canonicalPath}`);

      // Open Graph
      upsertMeta('property', 'og:title', title);
      upsertMeta('property', 'og:description', desc);
      upsertMeta('property', 'og:type', directoryView === 'details' ? 'profile' : 'website');
      upsertMeta('property', 'og:url', `${window.location.origin}${canonicalPath}`);
      upsertMeta('property', 'og:image', image);
      upsertMeta('property', 'og:site_name', 'India Leaders Directory');

      // Twitter Card
      upsertMeta('name', 'twitter:card', 'summary_large_image');
      upsertMeta('name', 'twitter:title', title);
      upsertMeta('name', 'twitter:description', desc);
      upsertMeta('name', 'twitter:image', image);

      // Inject dynamic Schema.org Graphs
      let scriptTag = document.getElementById('schema-jsonld') as HTMLScriptElement;
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'schema-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaData, null, 2);
    }

    applySeo();
    return () => {
      cancelled = true;
    };
  }, [mainTab, directoryView, selectedLeaderSlug]);

  // Handle nested sub-navigation in our directory
  const handleNavigateTo = (page: string, params?: any) => {
    if (page === 'search') {
      setSearchParams(params || null);
      setDirectoryView('search');
    } else {
      setDirectoryView(page as any);
    }
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  const handleSelectLeader = (slug: string) => {
    setSelectedLeaderSlug(slug);
    setDirectoryView('details');
    const path = `/leaders/${encodeURIComponent(slug)}`;
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  const handleBackToHome = () => {
    setDirectoryView('home');
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
    }
  };

  // If path starts with /admin, bypass the public layout completely to keep them 100% independent
  if (currentPath.startsWith('/admin')) {
    return <AdminDashboard />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#020705] text-slate-200 dark' : 'bg-white text-slate-800'} transition-colors duration-300 font-sans flex flex-col justify-between`}>
      
      {/* Premium Dedicated Header */}
      <header className={`sticky top-0 z-40 transition-colors duration-300 backdrop-blur-md shadow-sm border-b ${isDarkMode ? 'bg-[#020d09]/95 text-white border-white/5' : 'bg-white/95 text-slate-900 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between py-4 md:h-20 gap-4">
          
          {/* Left: Brand Identification */}
          <div className="flex items-center gap-3 text-left">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md border border-emerald-400/20 text-white flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className={`text-[9px] font-black tracking-[0.2em] ${isDarkMode ? 'text-amber-400' : 'text-emerald-600'} block font-mono`}>
                RIVA ANALYTICA SYSTEM
              </span>
              <h1 className={`text-base md:text-xl font-sans font-black tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'} leading-none uppercase`}>
                India Leaders Directory
              </h1>
              <p className={`hidden sm:block text-[8px] md:text-[9px] tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-sans mt-0.5 font-bold`}>
                India's Verified Leadership Directory
              </p>
            </div>
          </div>

          {/* Center-Right tab bar navigation */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <nav className="flex items-center gap-1 p-1 bg-slate-100/80 dark:bg-white/5 backdrop-blur-md rounded-xl border border-slate-200/60 dark:border-white/10">
              <button
                onClick={() => { setMainTab('directory'); setDirectoryView('home'); }}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  mainTab === 'directory'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Directory</span>
              </button>

              <button
                onClick={() => setMainTab('ai-grounding')}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  mainTab === 'ai-grounding'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Grounding</span>
              </button>

              <button
                onClick={() => setMainTab('admin')}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  mainTab === 'admin'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </nav>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 border ${isDarkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'} rounded-xl transition-all flex items-center justify-center cursor-pointer`}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="space-y-6">
          {/* Top Leaderboard Ad Slot */}
          <GoogleAd slot="top-leaderboard-01" format="horizontal" className="mb-4" />
          
          {/* MAIN TAB SWITCHER */}
          {mainTab === 'directory' && (
            <div className="space-y-6">
              {/* Secondary sub-nav for directory */}
              <div className="flex bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-1.5 rounded-xl justify-start gap-1 overflow-x-auto">
                <button
                  onClick={() => setDirectoryView('home')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                    directoryView === 'home'
                      ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Home Portal
                </button>
                <button
                  onClick={() => handleNavigateTo('search')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                    directoryView === 'search'
                      ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Search Catalog
                </button>
                <button
                  onClick={() => setDirectoryView('about')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                    directoryView === 'about'
                      ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Objective & Methodology
                </button>
                <button
                  onClick={() => setDirectoryView('contact')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                    directoryView === 'contact'
                      ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Raise Verification Query
                </button>
              </div>

              {/* RENDER CURRENT SUB-VIEW */}
              {directoryView === 'home' && (
                <DirectoryHome
                  onSelectLeader={handleSelectLeader}
                  onNavigateTo={handleNavigateTo}
                />
              )}

              {directoryView === 'search' && (
                <SearchPage
                  initialFilters={searchParams}
                  onSelectLeader={handleSelectLeader}
                />
              )}

              {directoryView === 'details' && (
                <LeaderDetailsPage
                  slug={selectedLeaderSlug}
                  onBack={handleBackToHome}
                  onSelectLeader={handleSelectLeader}
                />
              )}

              {directoryView === 'about' && <AboutPage />}

              {directoryView === 'contact' && <ContactPage />}
            </div>
          )}

          {mainTab === 'ai-grounding' && (
            <KnowYourMinister />
          )}

          {mainTab === 'admin' && (
            <DirectoryAdmin onSelectLeader={handleSelectLeader} />
          )}
          
          {/* Bottom Dynamic Ad Slot */}
          <GoogleAd slot="bottom-display-02" format="auto" className="mt-8" />
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDarkMode ? 'bg-[#010604] border-slate-900 text-slate-500' : 'bg-slate-50 text-slate-500 border-slate-100'} py-8 text-center text-xs font-mono transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <p className="font-bold text-slate-400 dark:text-slate-300">
              National Leader Audit Grid — Platform v3.1
            </p>
            <p className="text-[10px] text-slate-500">
              Aggregated from verified public records, cabinet sheets, and official Wikipedia publications.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20 font-bold uppercase tracking-wider">
              Protected by RIVA
            </span>
            <span className="text-slate-300 dark:text-slate-800">•</span>
            <span>© 2026 RIVA Strategies. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Render Contact Us Modal */}
      <ContactUs isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

    </div>
  );
}
