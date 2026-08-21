import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
      <div className="h-52 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded-full w-24" />
          <div className="h-4 bg-slate-200 rounded-full w-12" />
        </div>
        <div className="h-6 bg-slate-200 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-200 rounded-md w-full" />
        <div className="h-4 bg-slate-200 rounded-md w-1/2" />
        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded-md w-20" />
          <div className="h-8 bg-slate-200 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}
