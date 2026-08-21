import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Compass, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Sparkles, 
  ArrowUpDown,
  X
} from 'lucide-react';
import { destinationApi, categoryApi } from '../api/endpoints';
import DestinationCard from '../components/destination/DestinationCard';
import SkeletonCard from '../components/common/SkeletonCard';
import AdBanner from '../components/ads/AdBanner';

export default function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter states from searchParams
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const priceType = searchParams.get('price_type') || '';
  const minRating = searchParams.get('min_rating') || '';
  const hiddenGems = searchParams.get('hidden_gems') === 'true';
  const sort = searchParams.get('sort') || 'popular';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          search,
          category,
          price_type: priceType,
          min_rating: minRating,
          hidden_gems: hiddenGems,
          sort,
          per_page: 18,
        };
        const res = await destinationApi.getAll(params);
        setDestinations(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          total: res.data.total,
        });
      } catch (err) {
        console.error('Error fetching destinations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDestinations();
  }, [searchParams]);

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
    <div className="pt-20 sm:pt-28 pb-20 sm:pb-24 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 rounded-3xl p-6 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-orange-500/30 text-orange-300 border border-orange-500/40">
            Heritage & Exploration
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 font-heading">
            Tourist Destinations in Siem Reap
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Discover ancient Angkorian temples, scenic sacred mountains, floating lake villages, and hidden architectural gems across Cambodia.
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        
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
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => updateParam('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-orange-500" />
              <span>Sort:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-slate-900 font-bold"
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !category
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat.slug
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden gems toggle */}
            <button
              onClick={() => updateParam('hidden_gems', hiddenGems ? '' : 'true')}
              className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${
                hiddenGems
                  ? 'bg-purple-100 border-purple-300 text-purple-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Hidden Gems Only</span>
            </button>

            {/* Free entry filter */}
            <button
              onClick={() => updateParam('price_type', priceType === 'free' ? '' : 'free')}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                priceType === 'free'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Free Entry
            </button>

            {/* 4.5+ Rating Filter */}
            <button
              onClick={() => updateParam('min_rating', minRating === '4.5' ? '' : '4.5')}
              className={`px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                minRating === '4.5'
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              ⭐ 4.5+ Rated
            </button>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:underline font-bold text-xs ml-2"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="text-slate-500 text-xs font-semibold">
            Showing {destinations.length} of {pagination.total} Places
          </div>
        </div>
      </div>

      {/* Sponsored Search Top Ad Banner */}
      <AdBanner placement="search_top" className="mb-6" />

      {/* Destinations Listing Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">We couldn't find what you're looking for</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing filters, or explore our curated categories.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-md"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all ${
                  page === pageNum
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-105'
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
