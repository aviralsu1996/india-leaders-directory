import React from 'react';
import { isPlaceholderImage, isPlaceholderCover } from '../../lib/supabaseClient';

const getDirectImageUrl = (url?: string) => {
  return url || '';
};

/**
 * High-fidelity vector SVG for the Lion Capital of Ashoka (subtle watermark)
 */
export const AshokaWatermark: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 100 120"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Base Pedestal */}
    <path d="M 30,105 L 70,105 L 65,115 L 35,115 Z" />
    <rect x="33" y="95" width="34" height="10" rx="1" />
    
    {/* Ashoka Chakra in pedestal */}
    <circle cx="50" cy="100" r="4" fill="none" stroke="currentColor" strokeWidth="0.8" />
    <circle cx="50" cy="100" r="1.5" />
    {Array.from({ length: 12 }).map((_, i) => (
      <line
        key={i}
        x1="50"
        y1="100"
        x2={50 + 4 * Math.cos((i * Math.PI) / 6)}
        y2={100 + 4 * Math.sin((i * Math.PI) / 6)}
        stroke="currentColor"
        strokeWidth="0.3"
      />
    ))}
    
    {/* Abacus Animals (Subtle Blocks) */}
    <rect x="36" y="97" width="4" height="3" rx="0.5" />
    <rect x="60" y="97" width="4" height="3" rx="0.5" />
    
    {/* Lotus base */}
    <path d="M 40,95 C 40,90 45,86 50,86 C 55,86 60,90 60,95 Z" />
    <path d="M 35,95 C 37,92 41,90 45,91 C 42,93 40,95 40,95 Z" />
    <path d="M 65,95 C 63,92 59,90 55,91 C 58,93 60,95 60,95 Z" />

    {/* Center pillar joint */}
    <rect x="47" y="80" width="6" height="6" />

    {/* Lion Capitals - Styled Silhouette outline */}
    {/* Left Lion */}
    <path d="M 36,55 C 33,58 31,63 32,68 C 33,73 38,76 43,76 C 45,74 46,70 45,67 C 44,61 40,56 36,55 Z" />
    <path d="M 32,65 C 30,65 28,67 28,70 C 28,73 32,77 35,78 L 36,80 L 40,80 L 40,76 Z" />
    
    {/* Right Lion */}
    <path d="M 64,55 C 67,58 69,63 68,68 C 67,73 62,76 57,76 C 55,74 54,70 55,67 C 56,61 60,56 64,55 Z" />
    <path d="M 68,65 C 70,65 72,67 72,70 C 72,73 68,77 65,78 L 64,80 L 60,80 L 60,76 Z" />

    {/* Center Front Lion */}
    <path d="M 50,40 C 43,40 40,46 41,54 C 42,62 45,78 50,80 C 55,78 58,62 59,54 C 60,46 57,40 50,40 Z" />
    {/* Mane detail */}
    <path d="M 44,48 C 42,52 42,56 45,60 C 47,56 47,52 44,48 Z" />
    <path d="M 56,48 C 58,52 58,56 55,60 C 53,56 53,52 56,48 Z" />
    {/* Eyes & Nose silhouette */}
    <ellipse cx="47" cy="48" rx="1.5" ry="1" />
    <ellipse cx="53" cy="48" rx="1.5" ry="1" />
    <path d="M 49,52 L 51,52 L 50,54 Z" />
    {/* Mouth */}
    <path d="M 46,58 Q 50,61 54,58" fill="none" stroke="currentColor" strokeWidth="1" />
  </svg>
);

/**
 * 24-spoke high-precision Ashoka Chakra
 */
export const AshokaChakra: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="8" />
    <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
    
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const angleRad = (angle * Math.PI) / 180;
      const xOuter = 50 + 40 * Math.cos(angleRad);
      const yOuter = 50 + 40 * Math.sin(angleRad);
      const xLeft = 50 + 6 * Math.cos(angleRad - 0.08);
      const yLeft = 50 + 6 * Math.sin(angleRad - 0.08);
      const xRight = 50 + 6 * Math.cos(angleRad + 0.08);
      const yRight = 50 + 6 * Math.sin(angleRad + 0.08);

      // Arrow tip/triangular spoke detail
      return (
        <g key={i}>
          <path d={`M 50,50 L ${xLeft},${yLeft} L ${xOuter},${yOuter} L ${xRight},${yRight} Z`} />
          <circle cx={50 + 38 * Math.cos(angleRad)} cy={50 + 38 * Math.sin(angleRad)} r="1.5" />
        </g>
      );
    })}
  </svg>
);

/**
 * Default Government Silhouette
 * Used when a leader's profile photo is unavailable
 */
export const GovtSilhouette: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <div className={`relative bg-gradient-to-br from-[#122e26] via-[#15343f] to-[#121c2c] overflow-hidden flex items-end justify-center ${className}`}>
      {/* Subtle background flag stripe effect */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#FF9933] opacity-40" />
      <div className="absolute top-1.5 left-0 right-0 h-1 bg-[#FFFFFF] opacity-20" />
      <div className="absolute top-2.5 left-0 right-0 h-1 bg-[#138808] opacity-30" />

      {/* Subtle Ashoka Chakra watermark centered in avatar */}
      <div className="absolute inset-0 flex items-center justify-center text-white/5 pointer-events-none p-4">
        <AshokaChakra className="w-4/5 h-4/5 animate-[spin_120s_linear_infinite]" />
      </div>

      {/* Styled vector silhouette profile of public servant */}
      <svg
        viewBox="0 0 100 100"
        className="w-[85%] h-[85%] text-slate-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Halo outline */}
        <circle cx="50" cy="38" r="19" fill="none" stroke="#e2e8f0" strokeWidth="0.5" opacity="0.1" />

        {/* Head */}
        <path d="M 50,18 C 39.5,18 37,27 37,36 C 37,45 42,54 50,54 C 58,54 63,45 63,36 C 63,27 60.5,18 50,18 Z" />
        
        {/* Neck */}
        <path d="M 45,50 L 55,50 L 56,58 L 44,58 Z" fill="currentColor" opacity="0.95" />
        
        {/* Collar of formal Bandhgala jacket */}
        <path d="M 44,58 L 56,58 L 58,66 L 42,66 Z" fill="#cbd5e1" />
        {/* Center button line */}
        <line x1="50" y1="58" x2="50" y2="100" stroke="#1e293b" strokeWidth="1.5" />
        
        {/* Shoulders / Suit */}
        <path d="M 18,100 L 22,78 C 24,71 31,64 42,62 L 50,65 L 58,62 C 69,64 76,71 78,78 L 82,100 Z" />
        
        {/* Ashoka pin on lapel */}
        <circle cx="34" cy="74" r="1.8" fill="#FF9933" />
        <circle cx="34" cy="74" r="1.0" fill="#FFFFFF" />
        <circle cx="34" cy="74" r="0.5" fill="#138808" />
      </svg>
    </div>
  );
};

/**
 * Premium Government of India Official Cover Banner
 * Designed strictly matching the user requirement:
 * - Indian Flag
 * - Ashoka Chakra
 * - Satyameva Jayate
 * - Government-style blue/green gradient
 * - Subtle Ashoka emblem watermark
 */
export const GovtCoverBanner: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => {
  return (
    <div className={`relative bg-gradient-to-r from-[#063b2f] via-[#042838] to-[#041a2e] overflow-hidden select-none flex items-center justify-between p-6 sm:p-10 ${className}`}>
      
      {/* 1. Indian Flag Saffron-White-Green elegant curved ribbon on the top-left */}
      <div className="absolute top-0 left-0 w-72 h-16 pointer-events-none overflow-hidden opacity-90">
        <div className="absolute -top-12 -left-12 w-48 h-24 bg-[#FF9933] rounded-full blur-xl mix-blend-screen opacity-50" />
        <div className="flex flex-col w-48 rotate-[-15deg] -translate-x-6 -translate-y-4">
          <div className="h-2 w-full bg-[#FF9933]" />
          <div className="h-2 w-full bg-[#FFFFFF]" />
          <div className="h-2 w-full bg-[#138808]" />
        </div>
      </div>

      {/* 2. Ashoka Emblem Watermark (reduced opacity) */}
      <div className="absolute inset-y-0 right-1/4 sm:right-1/3 flex items-center justify-center text-white/[0.06] pointer-events-none p-2 shrink-0">
        <AshokaWatermark className="w-56 h-56 sm:w-80 sm:h-80" />
      </div>

      {/* 3. Banner text overlay (Satyameva Jayate + India Directory) */}
      <div className="relative z-10 flex flex-col justify-center text-left space-y-2 sm:space-y-4 max-w-lg">
        {/* National Motto: Satyameva Jayate */}
        <div className="flex items-center gap-3">
          <div className="h-[1px] w-8 bg-amber-400/50" />
          <span className="text-amber-400 font-serif tracking-[0.25em] text-xs sm:text-sm font-extrabold drop-shadow">
            सत्यमेव जयते
          </span>
          <span className="text-slate-300 font-mono text-[9px] sm:text-xs tracking-wider font-semibold uppercase opacity-85">
            • SATYAMEVA JAYATE •
          </span>
        </div>

        <div className="space-y-1">
          <h2 className="text-lg sm:text-2xl font-black text-white font-display leading-tight tracking-tight">
            OFFICIAL DIGITAL DIRECTORY
          </h2>
          <p className="text-[10px] sm:text-xs text-emerald-400 font-mono font-bold uppercase tracking-widest leading-none">
            GOVERNMENT OF INDIA • PUBLIC LEADERS INDEX
          </p>
        </div>

        {/* Emblem stamp detail */}
        <p className="text-[9px] sm:text-[10px] text-slate-400 font-sans leading-relaxed max-w-sm border-t border-slate-700/50 pt-2 opacity-80">
          Secured bio-data dossiers, committee assignments, and attendance audits verified via official Secretariat archives and parliamentary bulletins.
        </p>
      </div>

      {/* 4. Ashoka Chakra on the right */}
      <div className="relative z-10 text-[#000080]/80 bg-white/95 p-3 sm:p-5 rounded-full shadow-2xl border-2 border-amber-400/40 shrink-0 hidden md:block">
        <AshokaChakra className="w-14 h-14 sm:w-20 sm:h-20 text-[#000080] animate-[spin_180s_linear_infinite]" />
      </div>

      {/* Bottom elegant color bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] opacity-80" />
    </div>
  );
};

interface LeaderAvatarProps {
  image?: string;
  name?: string;
  className?: string;
}

export const LeaderAvatar: React.FC<LeaderAvatarProps> = ({ image, name = 'Leader', className = 'w-full h-full' }) => {
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setError(false);
  }, [image]);

  if (isPlaceholderImage(image) || error) {
    return <GovtSilhouette className={className} />;
  }

  return (
    <img
      src={getDirectImageUrl(image)}
      alt={name}
      referrerPolicy="no-referrer"
      className={`object-cover object-top ${className}`}
      onError={() => {
        setError(true);
      }}
    />
  );
};

interface LeaderCoverProps {
  coverImage?: string;
  name?: string;
  className?: string;
}

export const LeaderCover: React.FC<LeaderCoverProps> = ({ coverImage, name = 'Leader Cover', className = 'w-full h-full' }) => {
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    setError(false);
  }, [coverImage]);

  if (isPlaceholderCover(coverImage) || error) {
    return <GovtCoverBanner className={className} />;
  }

  return (
    <img
      src={getDirectImageUrl(coverImage)}
      alt={name}
      referrerPolicy="no-referrer"
      className={`object-cover ${className}`}
      onError={() => {
        setError(true);
      }}
    />
  );
};
