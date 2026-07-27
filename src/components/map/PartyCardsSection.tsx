import React from 'react';
import { POLITICAL_PARTIES } from '../../data/indiaPoliticalData';
import { Shield, Building2, Users, Award, ExternalLink } from 'lucide-react';

export default function PartyCardsSection() {
  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" /> Recognized Political Parties & Representation
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">National and major regional political party parliamentary strength</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Showing {POLITICAL_PARTIES.length} Major Parties
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {POLITICAL_PARTIES.map((party) => (
          <div
            key={party.id}
            className="bg-white dark:bg-[#080d0b] rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 p-2 border border-slate-100 dark:border-white/5 flex items-center justify-center shrink-0">
                    <img
                      src={party.logo}
                      alt={party.name}
                      className="w-full h-full object-contain"
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg';
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {party.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                        ({party.abbreviation})
                      </span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: party.color }}
                      >
                        {party.alliance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5 my-4 text-xs">
                <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-emerald-500" /> States Governed
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {party.states_governed} {party.states_governed === 1 ? 'State' : 'States'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-amber-500" /> Chief Ministers
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {party.chief_ministers_count} CMs
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Award className="w-3 h-3 text-blue-500" /> Lok Sabha MPs
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {party.lok_sabha_mps} MPs
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                    <Award className="w-3 h-3 text-purple-500" /> Rajya Sabha MPs
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                    {party.rajya_sabha_mps} MPs
                  </span>
                </div>
              </div>
            </div>

            {/* Governed States pills */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                Key Governed Territories:
              </span>
              <div className="flex flex-wrap gap-1">
                {party.governedStateNames.slice(0, 4).map((st) => (
                  <span
                    key={st}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300"
                  >
                    {st}
                  </span>
                ))}
                {party.governedStateNames.length > 4 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                    +{party.governedStateNames.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
