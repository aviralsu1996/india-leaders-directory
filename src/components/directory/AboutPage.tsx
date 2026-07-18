import React from 'react';
import { Shield, Award, Users, MapPin, CheckCircle, Sparkles } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12 text-left py-4 max-w-4xl">
      {/* 1. Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>About This Utility</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white font-display">
          Constitutional Public Service Directory
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm font-sans font-medium">
          India's high-fidelity political leadership index and verification framework.
        </p>
      </div>

      {/* 2. Philosophy card */}
      <section className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-8 rounded-2xl shadow-sm space-y-6">
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
          Our Objective
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
          The India Political Leaders Directory is a central, non-partisan, public interest catalog dedicated to bringing maximum structural transparency to Indian representative politics. We systematically aggregate, compile, and format critical governance data from verified public portals, legislative filings, and news channels into structured personal profiles.
        </p>
      </section>

      {/* 3. Core features breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-xl space-y-3 shadow-sm">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-lg w-10 h-10 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Verified Grounding</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs leading-normal">
            Every record maps directly back to state-level assembly journals, parliamentary transcripts, and verified national cabinet rolls.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-xl space-y-3 shadow-sm">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-600 rounded-lg w-10 h-10 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Professional Media</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs leading-normal">
            Leveraging our Python image processing pipeline, we download, center-crop, compress, and store clean public portraits in WebP.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-900 p-6 rounded-xl space-y-3 shadow-sm">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 rounded-lg w-10 h-10 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm">Constituency Maps</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs leading-normal">
            Cross-references geographical legislative jurisdictions and constituency demographics for absolute context.
          </p>
        </div>
      </section>
    </div>
  );
}
