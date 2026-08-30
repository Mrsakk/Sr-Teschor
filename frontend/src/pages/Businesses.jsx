import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Building2, 
  Sparkles, 
  ArrowUpDown, 
  X, 
  Tag, 
  ShieldCheck,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { businessApi, categoryApi } from '../api/endpoints';
import BusinessCard from '../components/business/BusinessCard';
import SkeletonCard from '../components/common/SkeletonCard';

export default function Businesses() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters from search params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const priceRange = searchParams.get('price_range') || '';
  const minRating = searchParams.get('min_rating') || '';
  const featured = searchParams.get('featured') === 'true';
  const sort = searchParams.get('sort') || 'featured';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const queryParams = { page, search, category, price_range: priceRange, min_rating: minRating, featured, sort, per_page: 9 };

  // ── Categories (cached forever) ──
  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'business'],
    queryFn: () => categoryApi.getAll({ type: 'business' }).then(r => r.data),
    staleTime: Infinity,
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // ── Businesses (instant from cache on revisit) ──
  const { data: bizData, isLoading, isFetching } = useQuery({
    queryKey: ['businesses', queryParams],
    queryFn: () => businessApi.getAll(queryParams).then(r => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });

  const businesses = bizData?.data || [];
  const pagination = {
    current_page: bizData?.current_page || 1,
    last_page: bizData?.last_page || 1,
    total: bizData?.total || 0,
  };
  const loading = isLoading && !bizData;

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="pt-24 sm:pt-28 pb-20 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Clean Light SaaS Header Banner */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-10 lg:p-12 text-slate-900 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <Building2 className="w-3.5 h-3.5" />
            Local Businesses & Hospitality
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 leading-tight pt-1">
            Hotels, Cafés & Local Services in Siem Reap
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Support local enterprises! Explore verified boutique retreats, organic dining, licensed temple tour guides, and circus performances.
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200 space-y-4">
        
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search hotel name, restaurant, tour guide..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-600 focus:outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => updateParam('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sort:</span>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-bold"
            >
              <option value="featured">Featured / Top Partner</option>
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              !category
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Businesses
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                category === cat.slug
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Price Tier & Quality Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Price ranges */}
            {['$', '$$', '$$$', '$$$$'].map((tier) => (
              <button
                key={tier}
                onClick={() => updateParam('price_range', priceRange === tier ? '' : tier)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer ${
                  priceRange === tier
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tier}
              </button>
            ))}

            {/* Featured Only */}
            <button
              onClick={() => updateParam('featured', featured ? '' : 'true')}
              className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                featured
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>★ Featured Partners</span>
            </button>

            {(search || category || priceRange || minRating || featured) && (
              <button
                onClick={clearAllFilters}
                className="text-orange-600 hover:underline font-bold text-xs ml-2 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-slate-500 text-xs font-semibold">
            Showing {businesses.length} of {pagination.total} Businesses
          </div>
        </div>
      </div>

      {/* Listing Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-100">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No businesses found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing selected price tiers.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {businesses.map((biz) => (
            <BusinessCard key={biz.id} business={biz} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {Array.from({ length: pagination.last_page }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => updateParam('page', pageNum.toString())}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  page === pageNum
                    ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}

    </div>
  );
}
