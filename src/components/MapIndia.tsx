import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Users, Award, ExternalLink, ArrowRight } from 'lucide-react';
import { Campaign } from '../types';

interface MapIndiaProps {
  campaigns: Campaign[];
  onSelectCampaign: (id: string) => void;
}

interface StateData {
  name: string;
  id: string;
  color: string;
  capital: string;
  votersReached: string;
  projectsCount: number;
  featuredCampaignId?: string;
  description: string;
}

export default function MapIndia({ campaigns, onSelectCampaign }: MapIndiaProps) {
  const [selectedState, setSelectedState] = useState<string>('Uttar Pradesh');

  const statesList: StateData[] = [
    {
      id: 'up',
      name: 'Uttar Pradesh',
      color: '#F97316',
      capital: 'Lucknow',
      votersReached: '45 Million',
      projectsCount: 22,
      featuredCampaignId: 'up-digital-blitz-2024',
      description: 'India\'s largest state campaign setup. Led narrative grid management across 75 districts, managing booth messaging, and digital volunteer structures.'
    },
    {
      id: 'wb',
      name: 'West Bengal',
      color: '#10B981',
      capital: 'Kolkata',
      votersReached: '35 Million',
      projectsCount: 15,
      featuredCampaignId: 'wb-sonar-bangla-2021',
      description: 'Pioneered sub-national pride narratives, managing massive music, audio, and visual flashmob assets alongside centralized feedback hotlines.'
    },
    {
      id: 'delhi',
      name: 'Delhi',
      color: '#0284C7',
      capital: 'New Delhi',
      votersReached: '12 Million',
      projectsCount: 8,
      featuredCampaignId: 'delhi-school-showcase-2025',
      description: 'Created walkthrough development trackers, parent testimonials, and QR integrated visual newspaper models.'
    },
    {
      id: 'goa',
      name: 'Goa',
      color: '#EC4899',
      capital: 'Panaji',
      votersReached: '1.2 Million',
      projectsCount: 4,
      featuredCampaignId: 'goa-wavemakers-2022',
      description: 'Eco-preservation local campaigns, setting up mobile survey nodes and digital environmental pledges.'
    },
    {
      id: 'punjab',
      name: 'Punjab',
      color: '#8B5CF6',
      capital: 'Chandigarh',
      votersReached: '18 Million',
      projectsCount: 11,
      featuredCampaignId: 'punjab-youth-connect-2022',
      description: 'Empowered youth engagement grids, focusing on employment narratives, sports forums, and video debate templates.'
    },
    {
      id: 'ap',
      name: 'Andhra Pradesh',
      color: '#14B8A6',
      capital: 'Amaravati',
      votersReached: '28 Million',
      projectsCount: 14,
      featuredCampaignId: 'ap-navaratnalu-tracker-2024',
      description: 'Designed direct fiscal calculators tracking welfare scheme benefits, alongside automated high-volume IVR operations.'
    },
    {
      id: 'tn',
      name: 'Tamil Nadu',
      color: '#EF4444',
      capital: 'Chennai',
      votersReached: '32 Million',
      projectsCount: 13,
      featuredCampaignId: 'tn-rising-sun-2021',
      description: 'Maintained deep localized street-level WhatsApp grids with customized Dravidian welfare infographics and state-autonomy essays.'
    },
    {
      id: 'karnataka',
      name: 'Karnataka',
      color: '#F59E0B',
      capital: 'Bengaluru',
      votersReached: '25 Million',
      projectsCount: 12,
      description: 'Spearheaded voter connect modules, digital townhalls for tech-corridors, and centralized candidate rating surveys.'
    },
    {
      id: 'hp',
      name: 'Himachal Pradesh',
      color: '#6366F1',
      capital: 'Shimla',
      votersReached: '4.5 Million',
      projectsCount: 6,
      description: 'Dealt with mountain-region communication challenges, establishing satellite war-rooms and local folk music narrative integrations.'
    },
    {
      id: 'uttarakhand',
      name: 'Uttarakhand',
      color: '#3B82F6',
      capital: 'Dehradun',
      votersReached: '6 Million',
      projectsCount: 7,
      description: 'Devised holy-corridor pilgrim outreach and local army veteran welfare communication channels.'
    }
  ];

  const activeStateObj = statesList.find(s => s.name === selectedState) || statesList[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="election-experience-section">
      {/* Schematic Interactive Map (SVG) */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden min-h-[500px] shadow-sm">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white font-sans">Interactive Client Campaign Map</h4>
              <p className="text-[11px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">Select a state to explore regional campaign case files & creative projects</p>
            </div>
            <span className="px-3 py-1 bg-sky-600 text-white text-[10px] tracking-widest uppercase rounded-full font-mono font-bold shadow-sm shadow-sky-600/10">
              National Footprint
            </span>
          </div>
        </div>

        {/* Schematic India Map SVG */}
        <div className="flex-1 flex items-center justify-center py-6 relative z-10 min-h-[360px]">
          <svg
            viewBox="0 0 600 650"
            className="w-full max-w-[420px] h-auto drop-shadow-[0_4px_12px_rgba(15,23,42,0.05)]"
          >
            {/* Outline of India (Generalized schematic borders for stable, robust, beautiful display) */}
            <g fill="none" stroke="#e2e8f0" strokeWidth="1.5">
              {/* Schematic Outer Grid Lines */}
              <circle cx="300" cy="325" r="280" stroke="#f1f5f9" strokeDasharray="4 4" />
            </g>

            {/* Stylized State Polygons representing states geographically */}
            {/* North States */}
            {/* Himachal Pradesh */}
            <path
              d="M 280 110 L 310 110 L 320 130 L 290 140 Z"
              fill={selectedState === 'Himachal Pradesh' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Himachal Pradesh' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'Himachal Pradesh' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('Himachal Pradesh')}
            />
            {/* Uttarakhand */}
            <path
              d="M 310 130 L 340 140 L 330 170 L 300 160 Z"
              fill={selectedState === 'Uttarakhand' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Uttarakhand' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'Uttarakhand' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('Uttarakhand')}
            />
            {/* Punjab */}
            <path
              d="M 240 120 L 280 110 L 290 140 L 250 150 Z"
              fill={selectedState === 'Punjab' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Punjab' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'Punjab' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('Punjab')}
            />
            {/* Delhi */}
            <circle
              cx="290"
              cy="175"
              r="14"
              fill={selectedState === 'Delhi' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Delhi' ? '#ffffff' : '#0ea5e9'}
              strokeWidth={selectedState === 'Delhi' ? 2.5 : 1.5}
              className="cursor-pointer transition-all duration-300 hover:scale-125"
              onClick={() => setSelectedState('Delhi')}
            />
            {/* Uttar Pradesh */}
            <path
              d="M 290 185 L 360 170 L 410 230 L 360 260 L 320 230 Z"
              fill={selectedState === 'Uttar Pradesh' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Uttar Pradesh' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'Uttar Pradesh' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('Uttar Pradesh')}
            />
            {/* West Bengal */}
            <path
              d="M 430 250 L 460 240 L 470 310 L 440 330 L 420 290 Z"
              fill={selectedState === 'West Bengal' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'West Bengal' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'West Bengal' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('West Bengal')}
            />
            {/* Goa */}
            <circle
              cx="220"
              cy="460"
              r="12"
              fill={selectedState === 'Goa' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Goa' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'Goa' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('Goa')}
            />
            {/* Karnataka */}
            <path
              d="M 220 480 L 260 470 L 280 540 L 240 560 Z"
              fill={selectedState === 'Karnataka' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Karnataka' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'Karnataka' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('Karnataka')}
            />
            {/* Andhra Pradesh */}
            <path
              d="M 270 450 L 310 430 L 320 520 L 280 530 Z"
              fill={selectedState === 'Andhra Pradesh' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Andhra Pradesh' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'Andhra Pradesh' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('Andhra Pradesh')}
            />
            {/* Tamil Nadu */}
            <path
              d="M 270 550 L 300 540 L 290 620 L 260 590 Z"
              fill={selectedState === 'Tamil Nadu' ? activeStateObj.color : '#f8fafc'}
              stroke={selectedState === 'Tamil Nadu' ? '#ffffff' : '#cbd5e1'}
              strokeWidth={selectedState === 'Tamil Nadu' ? 2 : 1.2}
              className="cursor-pointer transition-all duration-300 hover:opacity-85"
              onClick={() => setSelectedState('Tamil Nadu')}
            />

            {/* General schematic outlines of neighboring non-highlighted regions for balance */}
            {/* Rajasthan */}
            <path d="M 180 180 L 250 160 L 270 230 L 200 250 Z" fill="#f8fafc" stroke="#e2e8f0" opacity="0.6" />
            {/* Gujarat */}
            <path d="M 150 260 L 200 250 L 210 320 L 160 320 Z" fill="#f8fafc" stroke="#e2e8f0" opacity="0.6" />
            {/* Madhya Pradesh */}
            <path d="M 240 260 L 330 240 L 340 320 L 260 340 Z" fill="#f8fafc" stroke="#e2e8f0" opacity="0.6" />
            {/* Maharashtra */}
            <path d="M 210 340 L 290 330 L 270 440 L 210 420 Z" fill="#f8fafc" stroke="#e2e8f0" opacity="0.6" />

            {/* Visual State Markers */}
            <g transform="translate(330, 215)" className="pointer-events-none">
              <circle r="3" fill="#111c4e" />
              <line x1="0" y1="0" x2="30" y2="-20" stroke="#111c4e" strokeWidth="1" opacity="0.3" />
              <text x="35" y="-16" fill="#111c4e" fontSize="10" fontWeight="bold" fontFamily="monospace">UP</text>
            </g>
            <g transform="translate(450, 280)" className="pointer-events-none">
              <circle r="3" fill="#111c4e" />
              <line x1="0" y1="0" x2="30" y2="10" stroke="#111c4e" strokeWidth="1" opacity="0.3" />
              <text x="35" y="14" fill="#111c4e" fontSize="10" fontWeight="bold" fontFamily="monospace">WB</text>
            </g>
          </svg>
        </div>

        <div className="flex gap-2 flex-wrap relative z-10 pt-3 border-t border-slate-100">
          {statesList.map((st) => (
            <button
              key={st.name}
              onClick={() => setSelectedState(st.name)}
              className={`px-2.5 py-1 text-xs rounded-lg transition-all duration-200 border font-sans font-semibold ${
                selectedState === st.name
                  ? 'bg-sky-600 border-sky-600 text-white shadow-sm shadow-sky-600/10'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-slate-100'
              }`}
            >
              {st.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected State Campaign Highlights Panel */}
      <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
        <div>
          {/* Accent Header */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: activeStateObj.color }}
            />
            <span className="text-xs tracking-wider text-slate-500 font-mono font-bold uppercase">
              STATE PROFILE
            </span>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            {activeStateObj.name}
          </h3>
          <p className="text-sm text-slate-500 font-mono mt-1">Capital: {activeStateObj.capital}</p>

          <div className="my-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-mono font-bold">Public Reach</p>
                  <p className="text-lg font-bold text-slate-900">{activeStateObj.votersReached}</p>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-mono font-bold">Campaigns Run</p>
                  <p className="text-lg font-bold text-slate-900">{activeStateObj.projectsCount}</p>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-xs uppercase text-slate-400 font-mono font-bold tracking-wider mb-2">
                ELECTION SUMMARY
              </h5>
              <p className="text-slate-600 text-sm leading-relaxed">
                {activeStateObj.description}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Campaign Trigger if it exists */}
        <div>
          {activeStateObj.featuredCampaignId ? (
            <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase tracking-wider text-orange-400 font-mono font-bold">
                  ACTIVE CASE STUDY
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Year: {campaigns.find(c => c.id === activeStateObj.featuredCampaignId)?.year || 2024}
                </span>
              </div>
              <h4 className="text-sm font-bold truncate">
                {campaigns.find(c => c.id === activeStateObj.featuredCampaignId)?.title || 'State Campaign Grid'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                {campaigns.find(c => c.id === activeStateObj.featuredCampaignId)?.description}
              </p>
              <button
                onClick={() => onSelectCampaign(activeStateObj.featuredCampaignId!)}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-bold transition-all duration-200 shadow-sm"
              >
                <span>View Full Campaign Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-slate-200 text-slate-500 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700">Custom Deployment Available</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Deploy a dedicated digital war room in {activeStateObj.name} within 10 business days.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
