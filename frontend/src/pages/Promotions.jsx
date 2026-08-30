import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Sparkles, Clock, Building2, ArrowRight } from 'lucide-react';
import { promotionApi } from '../api/endpoints';

import { useQuery } from '@tanstack/react-query';

export default function Promotions() {
  const { data, isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionApi.getAll().then(r => r.data),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const promotions = data?.data || [];
  const loading = isLoading && !data;

  return (
    <div className="pt-24 sm:pt-28 pb-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Clean Light SaaS Banner */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-10 lg:p-12 text-slate-900 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80">
            <Tag className="w-3.5 h-3.5" />
            Exclusive Traveler Savings
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 leading-tight pt-1">
            Current Promotions & Special Offers
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Enjoy discounts, complimentary drinks, and seasonal resort packages directly from verified Siem Reap businesses.
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500 font-semibold">Loading active promotions...</div>
      ) : promotions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No active promotions right now</h3>
          <p className="text-xs text-slate-500">Check back soon for new discounts and seasonal deals.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={promo.image || promo.business?.cover_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-orange-600 text-white font-extrabold text-xs shadow-xs">
                    {promo.discount}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {promo.description}
                  </p>
                  {promo.business && (
                    <p className="text-xs font-bold text-slate-800 mt-3 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{promo.business.name}</span>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Valid till {promo.end_date}
                  </span>
                  {promo.business && (
                    <Link
                      to={`/businesses/${promo.business.slug}`}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <span>View Offer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
