import React from 'react';
import { Sparkles } from 'lucide-react';

export default function PageSkeletonLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-6 animate-pulse">
      {/* Brand Spinner & Logo */}
      <div className="relative">
        <div className="w-16 h-16 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-sm animate-bounce">
          <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <div className="absolute -inset-2 rounded-xl bg-emerald-500/20 blur-xl -z-10 animate-pulse" />
      </div>

      {/* Title placeholder */}
      <div className="space-y-2.5 text-center max-w-sm w-full">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mx-auto" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-full w-1/2 mx-auto" />
      </div>

      {/* Card Skeletons Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800/70 rounded-full w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
