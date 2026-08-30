import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Compass, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Sparkles, 
  ArrowUpDown,
  X,
  RefreshCw
} from 'lucide-react';
import { destinationApi, categoryApi } from '../api/endpoints';
import DestinationCard from '../components/destination/DestinationCard';
import SkeletonCard from '../components/common/SkeletonCard';
import AdBanner from '../components/ads/AdBanner';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');

  // Filter states from searchParams
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const priceType = searchParams.get('price_type') || '';
  const minRating = searchParams.get('min_rating') || '';
  const hiddenGems = searchParams.get('hidden_gems') === 'true';
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const queryParams = { page, search, category, price_type: priceType, min_rating: minRating, hidden_gems: hiddenGems, sort, per_page: 18 };

  // ── Categories (cached in session) ──
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then(r => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // ── Destinations (instant 0ms from cache on open) ──
  const { data: destData, isLoading, isFetching } = useQuery({
    queryKey: ['destinations', queryParams],
    queryFn: () => destinationApi.getAll(queryParams).then(r => r.data),
    staleTime: 1000 * 60 * 3,
    placeholderData: (prev) => prev, // Keep old data visible while fetching new page
    refetchOnMount: true,
  });

  const destinations = destData?.data || [];
  const pagination = {
    current_page: destData?.current_page || 1,
    last_page: destData?.last_page || 1,
    total: destData?.total || 0,
  };
  // Only show skeleton on FIRST load (no cached data yet)
  const loading = isLoading && !destData;

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

  const activeFiltersCount = [search, category, priceType, minRating, hiddenGems].filter(Boolean).length;

  return (
    <div className="pt-24 sm:pt-28 pb-16 sm:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Clean SaaS Header Banner */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-10 lg:p-12 text-slate-900 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80">
            <Compass className="w-3.5 h-3.5" />
            Heritage & Exploration
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 leading-tight pt-1">
            Tourist Destinations in Siem Reap
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Discover ancient Angkorian temples, scenic sacred mountains, floating lake villages, and hidden architectural gems across Cambodia.
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200 space-y-4">
        
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search temple name, history, location..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => updateParam('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-orange-600" />
                <span>Sort:</span>
              </div>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-bold text-xs"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price_low">Entrance Fee: Low to High</option>
                <option value="price_high">Entrance Fee: High to Low</option>
                <option value="newest">Newest Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              !category
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                category === cat.slug
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden gems toggle */}
            <button
              onClick={() => updateParam('hidden_gems', hiddenGems ? '' : 'true')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                hiddenGems
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✦ Hidden Gems</span>
            </button>

            {/* Free entry filter */}
            <button
              onClick={() => updateParam('price_type', priceType === 'free' ? '' : 'free')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                priceType === 'free'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Free Entry
            </button>

            {/* 4.5+ Rating Filter */}
            <button
              onClick={() => updateParam('min_rating', minRating === '4.5' ? '' : '4.5')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                minRating === '4.5'
                  ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              ★ 4.5+ Top Rated
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-orange-600 hover:underline font-bold text-xs ml-1 cursor-pointer"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="text-slate-500 text-xs font-semibold">
            Showing {destinations.length} of {pagination.total} destinations
          </div>
        </div>
      </div>

      {/* Sponsored Search Top Ad Banner */}
      <AdBanner placement="search_top" className="mb-4 sm:mb-6" />

      {/* Destinations Listing Grid */}
      {isFetching && !loading && (
        <div className="flex items-center justify-center gap-2 text-xs text-orange-600 font-semibold py-1">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Updating results...</span>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto border border-orange-100">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No destinations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing filters, or explore our curated categories.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors shadow-xs cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {destinations.map((dest) => (
            <DestinationCard key={dest.id} destination={dest} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
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
                    ? 'bg-orange-600 text-white shadow-xs font-extrabold'
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
