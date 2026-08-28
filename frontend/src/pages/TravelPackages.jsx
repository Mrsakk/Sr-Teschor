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
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const packages = Array.isArray(packagesData) ? packagesData : (packagesData?.data || []);
  const loading = isLoading && !packagesData;

  return (
    <div className="pt-20 sm:pt-28 pb-20 sm:pb-24 bg-slate-50/60 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Header Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-extrabold uppercase tracking-wider shadow-xs">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>All-Inclusive Handpicked Journeys</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 font-heading tracking-tight">
            Curated Siem Reap Travel Packages
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Full-day temple expeditions, floating lake boat cruises, and sacred jungle waterfall adventures. Includes private transport, certified guides, and verified Khmer dining.
          </p>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading travel packages...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
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
                    
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white/90 backdrop-blur-md text-slate-900 shadow-sm flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-500" />
                        {pkg.duration}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[11px] text-slate-300 block font-semibold">Starting from</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-amber-300">
                            ${Number(pkg.selling_price).toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-300">/ person</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl text-xs font-bold text-amber-300">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pkg.rating}</span>
                        <span className="text-white/60 text-[10px]">({pkg.reviews_count})</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
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
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 pt-0">
                  <Link
                    to={`/checkout/${pkg.id}?type=package`}
                    className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-lg shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-102"
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
