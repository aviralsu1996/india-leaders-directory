import React from 'react';
import { StateData } from '../../data/indiaPoliticalData';
import {
  X,
  Building,
  User,
  Shield,
  MapPin,
  Users,
  Award,
  Globe,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface StateDrawerProps {
  state: StateData | null;
  onClose: () => void;
  onViewMLAs: (stateName: string) => void;
  onViewStateDetail: (slug: string) => void;
}

export default function StateDrawer({
  state,
  onClose,
  onViewMLAs,
  onViewStateDetail
}: StateDrawerProps) {
  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Panel */}
      <div className="w-full max-w-md bg-white dark:bg-[#080d0b] h-full shadow-2xl border-l border-slate-200 dark:border-white/10 flex flex-col overflow-y-auto animate-in slide-in-from-right duration-300 text-left">
        {/* Header */}
        <div
          className="relative p-6 text-white overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${state.color}dd, #0f172a)`
          }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="px-3 py-1 rounded-full bg-black/40 text-white font-bold text-xs uppercase tracking-wider border border-white/20">
              {state.type} • {state.alliance}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight relative z-10">{state.name}</h2>
          <p className="text-xs text-white/80 mt-1 relative z-10 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" /> Capital: <span className="font-semibold text-white">{state.capital}</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 flex-1">
          {/* Executive Leadership Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Executive Leadership</h3>
            
            <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-100 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-500" /> Chief Minister
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{state.chief_minister}</span>
              </div>
              {state.deputy_chief_minister && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-teal-500" /> Deputy CM
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{state.deputy_chief_minister}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" /> Governor
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{state.governor}</span>
            </div>
          </div>

          {/* Political Power Metrics */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Political Power & Representation</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Ruling Party</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{state.party}</span>
                <span className="text-[10px] text-slate-400">({state.alliance} Alliance)</span>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Assembly Majority</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                  {state.winning_seats} / {state.assembly_seats}
                </span>
                <span className="text-[10px] text-slate-400">Assembly Seats</span>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Lok Sabha Seats</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">{state.lok_sabha_seats} MPs</span>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Rajya Sabha Seats</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">{state.rajya_sabha_seats} MPs</span>
              </div>
            </div>
          </div>

          {/* Demographics & Opposition */}
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Major Opposition:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{state.major_opposition}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Total Population:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{state.population}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Official Portal:</span>
              <a
                href={state.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                {state.official_website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 space-y-2.5 bg-slate-50/50 dark:bg-black/20">
          <button
            onClick={() => onViewStateDetail(state.slug)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            View Full State Profile <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewMLAs(state.name)}
            className="w-full py-3 px-4 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            View All MLAs of {state.name} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
