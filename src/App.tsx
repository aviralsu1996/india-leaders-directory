import React, { useState, useEffect } from 'react';
import { Shield, Sun, Moon, Download } from 'lucide-react';
import GoogleAd from './components/GoogleAd';
import ContactUs from './components/ContactUs';
import GovernmentEmblem from './components/GovernmentEmblem';

// Import newly created Political leaders directory modules
import DirectoryHome from './components/directory/DirectoryHome';
import LeaderDetailsPage from './components/directory/LeaderDetailsPage';
import SearchPage from './components/directory/SearchPage';
import AboutPage from './components/directory/AboutPage';
import ContactPage from './components/directory/ContactPage';
import DirectoryAdmin from './components/directory/DirectoryAdmin';
import JobsDirectory from './components/jobs/JobsDirectory';
import JobDetailsPage from './components/jobs/JobDetailsPage';
import PoliticalMapDashboard from './components/map/PoliticalMapDashboard';
import StateDetailPage from './components/map/StateDetailPage';
import ElectionsDashboard from './components/elections/ElectionsDashboard';
import ElectionDetailPage from './components/elections/ElectionDetailPage';
import ExportCentre from './components/export/ExportCentre';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Simple clean router to support /admin path independently
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/map-dashboard') {
        setDirectoryView('map-dashboard');
      } else if (path === '/elections') {
        setDirectoryView('elections');
      } else if (path.startsWith('/elections/')) {
        const slug = path.replace('/elections/', '');
        if (slug) {
          setSelectedElectionSlug(slug);
          setDirectoryView('election-details');
        }
      } else if (path.startsWith('/state/')) {
        const slug = path.replace('/state/', '');
        if (slug) {
          setSelectedStateSlug(slug);
          setDirectoryView('state-detail');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    handlePopState();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Directory sub-page routing: 'home' | 'map-dashboard' | 'search' | 'details' | 'about' | 'contact' | 'jobs' | 'job-details' | 'state-detail' | 'elections' | 'election-details' | 'export'
  const [directoryView, setDirectoryView] = useState<'home' | 'map-dashboard' | 'search' | 'details' | 'about' | 'contact' | 'jobs' | 'job-details' | 'state-detail' | 'elections' | 'election-details' | 'export'>('home');
  const [selectedLeaderSlug, setSelectedLeaderSlug] = useState<string>('');
  const [selectedJobSlug, setSelectedJobSlug] = useState<string>('');
  const [selectedStateSlug, setSelectedStateSlug] = useState<string>('uttar-pradesh');
  const [selectedElectionSlug, setSelectedElectionSlug] = useState<string>('');
  const [searchParams, setSearchParams] = useState<any>(null);

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
    const buildSitemapJsonLd = () => {
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "INDIAN GOVERNMENT DIRECTORY",
        "url": window.location.origin,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${window.location.origin}/search?query={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
    };

    let title = "INDIAN GOVERNMENT DIRECTORY — India's Unified Government Information Portal";
    let desc = "India's comprehensive digital platform for verified Government Representatives, Elections, Government Jobs, Ministries, Legislative Bodies, Public Administration, Governance Analytics and Official Public Information.";
    let schemaData: any = buildSitemapJsonLd();

    if (directoryView === 'details' && selectedLeaderSlug) {
      const localList = localStorage.getItem('know_your_minister_leaders');
      if (localList) {
        try {
          const list = JSON.parse(localList);
          const leader = list.find((l: any) => l.slug === selectedLeaderSlug);
          if (leader) {
            title = `${leader.name} - ${leader.designation} (${leader.party}, ${leader.constituency}) | Government Representative Profile`;
            desc = `Official dossier for ${leader.name}, serving as ${leader.designation} representing ${leader.constituency}, ${leader.state}. View debates record, speech logs, salary entitlements, and official records.`;
            schemaData = [
              schemaData,
              {
                "@context": "https://schema.org",
                "@type": "Person",
                "name": leader.name,
                "jobTitle": leader.designation,
                "image": leader.image,
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
        } catch (e) {
          console.error(e);
        }
      }
    } else if (directoryView === 'jobs') {
      title = "Government Jobs 2026 - Central & State Government Recruitment Notifications";
      desc = "Search official, verified Central and State Government job notifications across India. SSC, UPSC, Railways, Banking, Defence, State PSC recruitment updates.";
    } else if (directoryView === 'job-details') {
      title = "Official Government Job Recruitment Details & Notification";
      desc = "View complete government job specifications, vacancies, pay scale, eligibility, and direct official apply link.";
    } else if (directoryView === 'search') {
      title = "Search Government Representatives, Ministries & Constituencies | Indian Government Directory";
      desc = "Advanced search and filtering catalog across Lok Sabha, Rajya Sabha, Cabinet Ministers, State Governors, Chief Ministers and MLAs.";
    } else if (directoryView === 'about') {
      title = "About Indian Government Directory — Unified Government Information Portal";
      desc = "The public utility framework compiling verified cabinet portfolios, biographies, constituency statistics, and social accountability trackers.";
    }

    // Apply titles & descriptions to document headers
    document.title = title;
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    // Inject dynamic Schema.org Graphs
    let scriptTag = document.getElementById('schema-jsonld') as HTMLScriptElement;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'schema-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData, null, 2);

  }, [directoryView, selectedLeaderSlug]);

  // Handle nested sub-navigation in our directory
  const handleNavigateTo = (page: string, params?: any) => {
    if (page === 'search') {
      setSearchParams(params || null);
      setDirectoryView('search');
    } else {
      setDirectoryView(page as any);
    }
  };

  const handleSelectLeader = (slug: string) => {
    setSelectedLeaderSlug(slug);
    setDirectoryView('details');
  };

  const handleSelectJob = (slug: string) => {
    setSelectedJobSlug(slug);
    setDirectoryView('job-details');
  };

  // If path starts with /admin, bypass the public layout completely to keep them 100% independent
  if (currentPath.startsWith('/admin')) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#020705] text-slate-200 dark' : 'bg-slate-50 text-slate-800'} transition-colors duration-300 font-sans p-4 md:p-8 max-w-7xl mx-auto`}>
        <DirectoryAdmin onSelectLeader={handleSelectLeader} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#020705] text-slate-200 dark' : 'bg-white text-slate-800'} transition-colors duration-300 font-sans flex flex-col justify-between`}>
      
      {/* Premium Dedicated Header */}
      <header className={`sticky top-0 z-40 transition-colors duration-300 backdrop-blur-md shadow-sm border-b ${isDarkMode ? 'bg-[#020d09]/95 text-white border-white/5' : 'bg-white/95 text-slate-900 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between py-3 md:h-20 gap-4">
          
          {/* Left: Brand Identification with Satyameva Jayate Emblem */}
          <div 
            onClick={() => setDirectoryView('home')} 
            className="flex items-center gap-3.5 text-left cursor-pointer group"
          >
            <GovernmentEmblem size="md" className="shrink-0" />
            <div>
              <span className={`text-[9px] font-black tracking-[0.2em] ${isDarkMode ? 'text-amber-400' : 'text-emerald-700'} block font-mono uppercase`}>
                GOVERNMENT OF INDIA PORTAL
              </span>
              <h1 className={`text-base md:text-xl font-sans font-black tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-none uppercase group-hover:text-emerald-600 transition-colors`}>
                INDIAN GOVERNMENT DIRECTORY
              </h1>
              <p className={`hidden sm:block text-[8px] md:text-[9.5px] tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-sans mt-0.5 font-bold`}>
                India's Unified Government Information Portal
              </p>
            </div>
          </div>

          {/* Center-Right tab bar navigation */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <button
              onClick={() => setDirectoryView('export')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer btn-ripple"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" /> Export Data
            </button>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2.5 border ${isDarkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'} rounded-xl transition-all flex items-center justify-center cursor-pointer`}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="space-y-6">
          {/* Top Leaderboard Ad Slot */}
          <GoogleAd slot="top-leaderboard-01" format="horizontal" className="mb-4" />
          
          <div className="space-y-6">
            {/* Secondary sub-nav for directory */}
            <div className="flex bg-white dark:bg-[#040807] border border-slate-100 dark:border-white/5 p-1.5 rounded-xl justify-start gap-1 overflow-x-auto">
              <button
                onClick={() => setDirectoryView('home')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  directoryView === 'home'
                    ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Home Portal
              </button>
              <button
                onClick={() => setDirectoryView('map-dashboard')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  directoryView === 'map-dashboard' || directoryView === 'state-detail'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black border border-emerald-200/50 dark:border-emerald-900/30'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Election Updates
              </button>
              <button
                onClick={() => handleNavigateTo('search')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  directoryView === 'search'
                    ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Government Directory
              </button>
              <button
                onClick={() => setDirectoryView('jobs')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  directoryView === 'jobs' || directoryView === 'job-details'
                    ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Government Jobs
              </button>
              <button
                onClick={() => setDirectoryView('elections')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  directoryView === 'elections' || directoryView === 'election-details'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-black border border-emerald-200/50 dark:border-emerald-900/30'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Elections
              </button>

              <button
                onClick={() => setDirectoryView('about')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  directoryView === 'about'
                    ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Objective & Methodology
              </button>
              <button
                onClick={() => setDirectoryView('contact')}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer ${
                  directoryView === 'contact'
                    ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-black'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Verification System
              </button>
            </div>

            {/* RENDER CURRENT SUB-VIEW */}
            {directoryView === 'home' && (
              <DirectoryHome
                onSelectLeader={handleSelectLeader}
                onNavigateTo={handleNavigateTo}
              />
            )}

            {directoryView === 'map-dashboard' && (
              <PoliticalMapDashboard
                onSelectStateSlug={(slug) => {
                  setSelectedStateSlug(slug);
                  setDirectoryView('state-detail');
                }}
                onViewMLAsForState={(stateName) => {
                  handleNavigateTo('search', { state: stateName, category: 'MLA' });
                }}
              />
            )}

            {directoryView === 'state-detail' && (
              <StateDetailPage
                slug={selectedStateSlug}
                onBack={() => setDirectoryView('map-dashboard')}
                onSelectLeader={handleSelectLeader}
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
                onBack={() => setDirectoryView('home')}
                onSelectLeader={handleSelectLeader}
              />
            )}

            {directoryView === 'jobs' && (
              <JobsDirectory onSelectJob={handleSelectJob} />
            )}

            {directoryView === 'job-details' && (
              <JobDetailsPage
                slug={selectedJobSlug}
                onBack={() => setDirectoryView('jobs')}
                onSelectJob={handleSelectJob}
              />
            )}

            {directoryView === 'elections' && (
              <ElectionsDashboard
                onSelectElection={(slug) => {
                  setSelectedElectionSlug(slug);
                  setDirectoryView('election-details');
                }}
              />
            )}

            {directoryView === 'election-details' && (
              <ElectionDetailPage
                slug={selectedElectionSlug}
                onBack={() => setDirectoryView('elections')}
              />
            )}

            {directoryView === 'export' && <ExportCentre />}

            {directoryView === 'about' && <AboutPage />}

            {directoryView === 'contact' && <ContactPage />}
          </div>
          
          {/* Bottom Dynamic Ad Slot */}
          <GoogleAd slot="bottom-display-02" format="auto" className="mt-8" />
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDarkMode ? 'bg-[#010604] border-slate-900 text-slate-500' : 'bg-slate-50 text-slate-500 border-slate-100'} py-8 text-center text-xs font-mono transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <GovernmentEmblem size="sm" />
              <span>INDIAN GOVERNMENT DIRECTORY — National Audit Grid v3.1</span>
            </div>
            <p className="text-[10px] text-slate-500">
              Aggregated from verified public records, official gazettes, parliamentary records, and cabinet documents.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20 font-bold uppercase tracking-wider">
              OFFICIAL GOVERNMENT PORTAL
            </span>
            <span className="text-slate-300 dark:text-slate-800">•</span>
            <span>© 2026 Indian Government Directory. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Render Contact Us Modal */}
      <ContactUs isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

    </div>
  );
}

