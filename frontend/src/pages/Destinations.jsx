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

  // ── Categories (cached forever in session) ──
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then(r => r.data),
    staleTime: Infinity, // categories rarely change
  });
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  // ── Destinations (instant from cache on revisit) ──
  const { data: destData, isLoading, isFetching } = useQuery({
    queryKey: ['destinations', queryParams],
    queryFn: () => destinationApi.getAll(queryParams).then(r => r.data),
    placeholderData: (prev) => prev, // Keep old data visible while fetching new page
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
    <div className="pt-20 sm:pt-28 pb-16 sm:pb-24 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-xl p-5 sm:p-10 lg:p-12 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-1 sm:space-y-2">
          <span className="inline-flex items-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-slate-100 border border-white/20">
            Heritage & Exploration
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-heading leading-tight pt-1">
            Tourist Destinations in Siem Reap
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Discover ancient Angkorian temples, scenic sacred mountains, floating lake villages, and hidden architectural gems across Cambodia.
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-xl sm:rounded-xl p-3.5 sm:p-6 shadow-xs border border-slate-100 space-y-3 sm:space-y-4">
        
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search temple name, history, location..."
              className="w-full pl-9 sm:pl-10 pr-8 sm:pr-4 py-2 sm:py-2.5 rounded-xl sm:rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
            <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 rounded-xl sm:rounded-xl bg-slate-50 border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-orange-500" />
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
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-2 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              !category
                ? 'bg-orange-500 text-white shadow-md shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ប្រភេទទាំងអស់ (All)
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                category === cat.slug
                  ? 'bg-orange-500 text-white shadow-md shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 sm:pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Hidden gems toggle */}
            <button
              onClick={() => updateParam('hidden_gems', hiddenGems ? '' : 'true')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                hiddenGems
                  ? 'bg-purple-100 border-purple-300 text-purple-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
              <span>កន្លែងកម្រស្គាល់ (Hidden Gems)</span>
            </button>

            {/* Free entry filter */}
            <button
              onClick={() => updateParam('price_type', priceType === 'free' ? '' : 'free')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                priceType === 'free'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ចូលទស្សនាឥតគិតថ្លៃ (Free)
            </button>

            {/* 4.5+ Rating Filter */}
            <button
              onClick={() => updateParam('min_rating', minRating === '4.5' ? '' : '4.5')}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer ${
                minRating === '4.5'
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⭐ ៤.៥+ (Top Rated)
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:underline font-bold text-[11px] sm:text-xs ml-1 cursor-pointer"
              >
                កំណត់ឡើងវិញ (Reset)
              </button>
            )}
          </div>

          <div className="text-slate-500 text-[11px] sm:text-xs font-semibold">
            បង្ហាញ {destinations.length} ក្នុងចំណោម {pagination.total} ទីតាំង
          </div>
        </div>
      </div>

      {/* Sponsored Search Top Ad Banner */}
      <AdBanner placement="search_top" className="mb-4 sm:mb-6" />

      {/* Destinations Listing Grid */}
      {/* Subtle background-refresh indicator (only when data exists + refetching) */}
      {isFetching && !loading && (
        <div className="flex items-center justify-center gap-2 text-xs text-orange-500 font-semibold py-1">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>កំពុងធ្វើបច្ចុប្បន្នភាព...</span>
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl sm:rounded-xl p-6 sm:p-12 text-center border border-slate-100 max-w-lg mx-auto space-y-3 sm:space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">We couldn't find what you're looking for</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing filters, or explore our curated categories.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-md cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                  page === pageNum
                    ? 'bg-orange-500 text-white shadow-md shadow-sm scale-105'
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
