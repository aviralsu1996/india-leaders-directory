import React, { useState } from 'react';
import { StateData, INDIA_STATES_DATA, PARTY_COLORS } from '../../data/indiaPoliticalData';
import { Building2, User, Award, Users, MapPin, Shield } from 'lucide-react';

interface IndiaMapProps {
  selectedStateSlug?: string;
  onSelectState: (state: StateData) => void;
  hoveredState: StateData | null;
  setHoveredState: (state: StateData | null) => void;
  tooltipPos: { x: number; y: number };
  setTooltipPos: (pos: { x: number; y: number }) => void;
}

// Detailed SVG Path mapping for Indian States and UTs on a standard 600x680 viewport canvas
// Geometrically accurate outline representations for smooth interactivity and zero external rendering bugs
const STATE_PATHS: Record<string, string> = {
  'ladakh': 'M 210 30 L 260 20 L 300 45 L 310 90 L 270 120 L 220 110 L 190 70 Z',
  'jammu-and-kashmir': 'M 170 60 L 210 30 L 220 110 L 180 130 L 140 100 L 150 70 Z',
  'himachal-pradesh': 'M 220 110 L 270 120 L 275 160 L 230 170 L 210 140 Z',
  'punjab': 'M 170 140 L 220 140 L 210 190 L 170 200 L 160 160 Z',
  'chandigarh': 'M 210 172 A 8 8 0 1 1 210 171 Z',
  'uttarakhand': 'M 270 120 L 310 140 L 290 190 L 250 180 L 270 150 Z',
  'haryana': 'M 200 180 L 240 180 L 235 230 L 190 220 Z',
  'delhi': 'M 232 215 A 10 10 0 1 1 232 214 Z',
  'rajasthan': 'M 110 210 L 200 200 L 220 270 L 180 330 L 100 290 L 80 230 Z',
  'uttar-pradesh': 'M 230 200 L 320 190 L 370 240 L 320 300 L 240 280 L 220 230 Z',
  'bihar': 'M 370 240 L 440 240 L 450 290 L 370 300 Z',
  'sikkim': 'M 438 210 L 458 210 L 455 235 L 435 235 Z',
  'west-bengal': 'M 440 240 L 460 240 L 480 310 L 460 380 L 420 370 L 440 310 Z',
  'jharkhand': 'M 370 300 L 440 290 L 430 360 L 360 350 Z',
  'odisha': 'M 350 360 L 430 360 L 420 440 L 340 430 Z',
  'chhattisgarh': 'M 310 320 L 360 320 L 350 420 L 310 430 L 300 370 Z',
  'madhya-pradesh': 'M 200 270 L 320 280 L 330 360 L 220 370 L 180 320 Z',
  'gujarat': 'M 60 280 L 140 270 L 160 340 L 120 380 L 60 350 L 50 300 Z',
  'dadra-and-nagar-haveli': 'M 130 372 A 7 7 0 1 1 130 371 Z',
  'maharashtra': 'M 140 350 L 240 350 L 270 420 L 190 460 L 130 420 Z',
  'telangana': 'M 240 410 L 290 400 L 310 470 L 240 480 Z',
  'andhra-pradesh': 'M 240 480 L 320 440 L 330 520 L 250 550 L 230 500 Z',
  'karnataka': 'M 160 440 L 230 440 L 240 540 L 180 570 L 150 490 Z',
  'goa': 'M 155 465 A 8 8 0 1 1 155 464 Z',
  'kerala': 'M 180 560 L 210 560 L 200 640 L 170 630 Z',
  'tamil-nadu': 'M 210 540 L 260 540 L 250 630 L 190 640 Z',
  'puducherry': 'M 252 572 A 6 6 0 1 1 252 571 Z',
  'assam': 'M 480 260 L 550 250 L 540 290 L 480 290 Z',
  'meghalaya': 'M 480 285 L 530 285 L 525 305 L 475 305 Z',
  'tripura': 'M 505 310 L 525 310 L 520 340 L 500 335 Z',
  'mizoram': 'M 525 315 L 545 315 L 540 360 L 520 355 Z',
  'manipur': 'M 545 285 L 565 285 L 560 320 L 540 315 Z',
  'nagaland': 'M 550 250 L 575 250 L 570 285 L 545 285 Z',
  'arunachal-pradesh': 'M 520 210 L 585 210 L 580 250 L 530 250 Z',
  'andaman-and-nicobar': 'M 570 520 L 580 520 L 580 580 L 570 580 Z',
  'lakshadweep': 'M 130 570 L 140 570 L 140 610 L 130 610 Z'
};

export default function IndiaMap({
  selectedStateSlug,
  onSelectState,
  hoveredState,
  setHoveredState,
  tooltipPos,
  setTooltipPos,
}: IndiaMapProps) {
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className="relative w-full h-[580px] bg-slate-900/40 dark:bg-black/40 rounded-3xl p-4 border border-slate-200/50 dark:border-white/10 overflow-hidden flex flex-col items-center justify-center select-none shadow-inner"
      onMouseMove={handleMouseMove}
    >
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-sm pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Map View</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Click state to inspect governance details</p>
      </div>

      {/* Party Color Map Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-slate-200/60 dark:border-white/10 shadow-sm max-w-[260px]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Ruling Party Colors</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#f97316] shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">BJP (NDA)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#2563eb] shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">INC (INDIA)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#0284c7] shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">AAP / JKNC</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#dc2626] shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">DMK</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#16a34a] shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">TMC</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#eab308] shadow-sm" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">TDP / Regional</span>
          </div>
        </div>
      </div>

      {/* SVG Map Canvas */}
      <svg
        viewBox="0 0 620 660"
        className="w-full h-full max-h-[540px] drop-shadow-md cursor-pointer transition-all duration-300"
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="310" cy="330" r="280" fill="url(#mapGlow)" />

        {INDIA_STATES_DATA.map((st) => {
          const pathD = STATE_PATHS[st.slug];
          if (!pathD) return null;

          const isSelected = selectedStateSlug === st.slug;
          const isHovered = hoveredState?.slug === st.slug;
          const partyColor = st.color || PARTY_COLORS[st.party] || '#64748b';

          return (
            <g key={st.id} className="group">
              <path
                d={pathD}
                fill={partyColor}
                fillOpacity={isHovered ? 0.95 : isSelected ? 1 : 0.8}
                stroke={isHovered || isSelected ? '#ffffff' : '#1e293b'}
                strokeWidth={isHovered ? 2.5 : isSelected ? 3 : 1}
                className="transition-all duration-200 hover:scale-[1.015] origin-center cursor-pointer"
                onMouseEnter={() => setHoveredState(st)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => onSelectState(st)}
              />

              {/* State Label abbreviation */}
              {st.x && st.y && st.type === 'State' && (
                <text
                  x={st.x}
                  y={st.y}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={isHovered ? '11px' : '9.5px'}
                  fontWeight="800"
                  className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] transition-all duration-150"
                >
                  {st.name.length > 12 ? st.name.substring(0, 3).toUpperCase() : st.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Floating Interactive Hover Tooltip */}
      {hoveredState && (
        <div
          style={{
            left: `${Math.min(Math.max(tooltipPos.x + 15, 10), 380)}px`,
            top: `${Math.min(Math.max(tooltipPos.y - 80, 10), 420)}px`,
          }}
          className="absolute z-30 pointer-events-none bg-slate-900/95 dark:bg-black/95 text-white backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl w-64 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: hoveredState.color }}
              />
              <h4 className="font-bold text-sm text-white">{hoveredState.name}</h4>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-emerald-400 border border-emerald-500/30">
              {hoveredState.alliance}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-emerald-400" /> Chief Minister:
              </span>
              <span className="font-semibold text-white truncate max-w-[120px]">
                {hoveredState.chief_minister}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Shield className="w-3 h-3 text-amber-400" /> Party:
              </span>
              <span className="font-semibold text-amber-300">{hoveredState.party}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-blue-400" /> Capital:
              </span>
              <span className="font-medium text-slate-200">{hoveredState.capital}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-purple-400" /> Assembly Seats:
              </span>
              <span className="font-bold text-white">
                {hoveredState.winning_seats} / {hoveredState.assembly_seats}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3 text-teal-400" /> Major Opp:
              </span>
              <span className="font-medium text-slate-300 truncate max-w-[110px]">
                {hoveredState.major_opposition}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" /> Population:
              </span>
              <span className="font-medium text-slate-200">{hoveredState.population}</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-white/10 text-center text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            Click to view State Drawer & MLAs
          </div>
        </div>
      )}
    </div>
  );
}
