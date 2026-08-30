import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Sparkles, 
  Clock, 
  Users, 
  CheckCircle2, 
  Star, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  MapPin,
  Tag,
  RefreshCw
} from 'lucide-react';
import { packageApi } from '../api/endpoints';

export default function TravelPackages() {
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['packages'],
    queryFn: () => packageApi.getAll().then(res => res.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: prev => prev,
    refetchOnMount: true,
  });

  const packages = Array.isArray(packagesData) ? packagesData : (packagesData?.data || []);
  const loading = isLoading && !packagesData;

  return (
    <div className="pt-24 sm:pt-28 pb-20 sm:pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Header Hero Banner */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-10 lg:p-12 text-center max-w-4xl mx-auto space-y-3 shadow-xs">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-extrabold uppercase tracking-wider border border-orange-200/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>All-Inclusive Handpicked Journeys</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
            Curated Siem Reap Travel Packages
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Full-day temple expeditions, floating lake boat cruises, and sacred jungle waterfall adventures. Includes private transport, certified guides, and verified Khmer dining.
          </p>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-semibold">Loading travel packages...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Image & Price Overlay */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 backdrop-blur-xs text-slate-900 shadow-xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-600" />
                        {pkg.duration}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] text-slate-300 block font-semibold">Starting from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-white">
                            ${Number(pkg.selling_price).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-300">/ person</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-lg text-xs font-bold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pkg.rating}</span>
                        <span className="text-white/60 text-[10px]">({pkg.reviews_count})</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3.5">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {pkg.description}
                    </p>

                    {/* Includes List */}
                    {Array.isArray(pkg.includes) && pkg.includes.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                          Package Highlights:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {pkg.includes.slice(0, 4).map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <Link
                    to={`/checkout/${pkg.id}?type=package`}
                    state={{ item: pkg, isPackage: true }}
                    className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Book Package Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
