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

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Simple clean router to support /admin path independently
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Main navigation tabs: 'directory' | 'ai-grounding' | 'admin'
  const [mainTab, setMainTab] = useState<'directory' | 'ai-grounding' | 'admin'>('directory');

  // Directory sub-page routing: 'home' | 'search' | 'details' | 'about' | 'contact'
  const [directoryView, setDirectoryView] = useState<'home' | 'search' | 'details' | 'about' | 'contact'>('home');
  const [selectedLeaderSlug, setSelectedLeaderSlug] = useState<string>('');
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
                  onBack={() => setDirectoryView('home')}
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
