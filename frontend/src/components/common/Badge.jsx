import React from 'react';
import { Sparkles, ShieldCheck, Tag, Compass, Flame } from 'lucide-react';

export default function Badge({ type, text, className = '' }) {
  if (type === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}>
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        {text || 'Verified'}
      </span>
    );
  }

  if (type === 'featured' || type === 'premium') {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs ${className}`}>
        <Sparkles className="w-3 h-3 text-amber-600" />
        {text || 'Featured'}
      </span>
    );
  }

  if (type === 'hidden_gem') {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
        <Compass className="w-3 h-3 text-purple-600" />
        {text || 'Hidden Gem'}
      </span>
    );
  }

  if (type === 'promo') {
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 ${className}`}>
        <Tag className="w-3 h-3 text-red-600" />
        {text || 'Special Offer'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 ${className}`}>
      {text}
    </span>
  );
}
