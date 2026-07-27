import React from 'react';

export function SkeletonCard({ className = '' }: { className?: string; key?: React.Key }) {
  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-[#080d0b] border border-slate-100 dark:border-white/5 space-y-4 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full skeleton-shimmer shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/4 rounded skeleton-shimmer" />
          <div className="h-3 w-1/2 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full rounded skeleton-shimmer" />
        <div className="h-3 w-5/6 rounded skeleton-shimmer" />
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-white/5">
        <div className="h-5 w-20 rounded-lg skeleton-shimmer" />
        <div className="h-8 w-24 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
}

export function SkeletonRow({ className = '' }: { className?: string; key?: React.Key }) {
  return (
    <div className={`p-4 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 ${className}`}>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-9 h-9 rounded-full skeleton-shimmer shrink-0" />
        <div className="space-y-1.5 flex-1 max-w-sm">
          <div className="h-3.5 w-2/3 rounded skeleton-shimmer" />
          <div className="h-2.5 w-1/3 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="h-3 w-28 rounded skeleton-shimmer hidden md:block" />
      <div className="h-3 w-20 rounded skeleton-shimmer hidden sm:block" />
      <div className="h-6 w-16 rounded-lg skeleton-shimmer" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-[#080d0b] rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
      <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex justify-between">
        <div className="h-4 w-32 rounded skeleton-shimmer" />
        <div className="h-4 w-20 rounded skeleton-shimmer" />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-white/5">
        {Array.from({ length: rows }).map((_, idx) => (
          <SkeletonRow key={idx} />
        ))}
      </div>
    </div>
  );
}
