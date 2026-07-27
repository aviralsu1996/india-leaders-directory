import React from 'react';

interface GovernmentEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'gold' | 'dark' | 'original';
}

export default function GovernmentEmblem({ 
  className = '', 
  size = 'md', 
  showText = false,
  variant = 'gold'
}: GovernmentEmblemProps) {
  const sizeMap = {
    sm: 'w-7 h-9',
    md: 'w-10 h-13',
    lg: 'w-14 h-18',
    xl: 'w-24 h-30'
  };

  const dimensions = sizeMap[size] || sizeMap.md;

  const filterClass = variant === 'gold' 
    ? 'filter drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)] brightness-[0.95] sepia-[0.3] hue-rotate-[10deg] saturate-[1.8]' 
    : variant === 'dark'
    ? 'filter brightness-0 dark:invert'
    : 'filter contrast-[1.1]';

  return (
    <span className={`inline-flex flex-col items-center justify-center shrink-0 ${className}`}>
      <span className={`relative ${dimensions} flex items-center justify-center transition-all hover:scale-105 duration-300`}>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/1024px-Emblem_of_India.svg.png"
          alt="State Emblem of India - Satyameva Jayate"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-contain ${filterClass}`}
          onError={(e) => {
            // If primary URL fails, try direct SVG
            const target = e.currentTarget;
            if (!target.dataset.retried) {
              target.dataset.retried = 'true';
              target.src = 'https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg';
            }
          }}
        />
      </span>
      {showText && (
        <span className="text-[9px] font-black tracking-widest text-[#D4AF37] uppercase font-serif mt-0.5">
          सत्यमेव जयते
        </span>
      )}
    </span>
  );
}

