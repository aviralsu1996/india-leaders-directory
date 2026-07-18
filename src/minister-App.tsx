import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft, Sun, Moon, Sparkles, Globe, Heart, Mail } from 'lucide-react';
import KnowYourMinister from './components/KnowYourMinister';
import ContactUs from './components/ContactUs';

export default function MinisterApp() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Apply dark mode class to HTML element for Tailwind dark prefix to work perfectly
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#020705] text-slate-100 dark' : 'bg-white text-slate-800'} transition-colors duration-300 font-sans flex flex-col justify-between`}>
      
      {/* Dedicate Premium Header */}
      <header className={`sticky top-0 z-50 transition-colors duration-300 backdrop-blur-md shadow-sm border-b ${isDarkMode ? 'bg-[#020d09]/95 text-white border-white/5' : 'bg-white/95 text-slate-900 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
          
          {/* Left: Brand Identification */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-md border border-emerald-400/20 text-white flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div className="text-left">
              <span className={`text-[10px] font-black tracking-[0.2em] ${isDarkMode ? 'text-amber-400' : 'text-emerald-600'} block font-mono`}>
                RIVA ANALYTICA CORE
              </span>
              <h1 className={`text-sm md:text-lg font-sans font-black tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-none`}>
                KNOW YOUR MINISTER
              </h1>
              <p className={`hidden sm:block text-[8px] md:text-[9px] tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-sans mt-0.5`}>
                India's Verified Leadership Directory
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Contact Us Option */}
            <button
              onClick={() => setIsContactOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg shadow-md border border-white/5 cursor-pointer transition-all"
              title="Contact Us / Raise Query"
            >
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Contact Us</span>
            </button>

            {/* Back to main agency link */}
            <a 
              href="/"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'} text-xs font-bold rounded-lg transition-all border`}
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">RIVA Agency Hub</span>
            </a>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 border ${isDarkMode ? 'border-white/10 hover:bg-white/5 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-700'} rounded-lg transition-all flex items-center justify-center cursor-pointer`}
              title="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Container - Renders the standalone search panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-6">
          <KnowYourMinister />
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t ${isDarkMode ? 'bg-[#010604] border-slate-900 text-slate-500' : 'bg-slate-100 text-slate-600 border-slate-200'} py-8 text-center text-xs font-mono`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <p className="font-bold text-slate-400 dark:text-slate-300">
              National Leader Audit Grid — Platform v2.8
            </p>
            <p className="text-[10px] text-slate-500">
              Direct connection with real-time Internet Grounding & Election Affidavits via Gemini 3.5.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 font-bold uppercase tracking-wider">
              Protected by RIVA
            </span>
            <span className="text-slate-500">•</span>
            <span>© 2026 RIVA Strategies. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Render Contact Us Modal */}
      <ContactUs isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

    </div>
  );
}
