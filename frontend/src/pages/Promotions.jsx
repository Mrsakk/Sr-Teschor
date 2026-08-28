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
    <div className="pt-20 sm:pt-28 pb-20 sm:pb-24 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Banner */}
      <div className="bg-red-600 rounded-xl p-6 sm:p-12 text-white shadow-sm">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
            Exclusive Traveler Savings
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading">
            Current Promotions & Special Offers
          </h1>
          <p className="text-sm text-red-100">
            Enjoy discounts, complimentary drinks, and seasonal resort packages directly from verified Siem Reap businesses.
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading active promotions...</div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-16 text-xs text-slate-400">No active promotions right now. Check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-sm transition-all duration-300 flex flex-col justify-between card-hover-effect"
            >
              <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                <img
                  src={promo.image || promo.business?.cover_image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white font-extrabold text-xs shadow-md">
                    {promo.discount}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 leading-snug">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {promo.description}
                  </p>
                  {promo.business && (
                    <p className="text-xs font-bold text-orange-600 mt-3 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{promo.business.name}</span>
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
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
