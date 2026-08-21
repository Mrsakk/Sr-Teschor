import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Building2, 
  Sparkles, 
  ArrowUpDown, 
  X, 
  Tag, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { businessApi, categoryApi } from '../api/endpoints';
import BusinessCard from '../components/business/BusinessCard';
import SkeletonCard from '../components/common/SkeletonCard';

export default function Businesses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters from search params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const priceRange = searchParams.get('price_range') || '';
  const minRating = searchParams.get('min_rating') || '';
  const featured = searchParams.get('featured') === 'true';
  const sort = searchParams.get('sort') || 'featured';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    categoryApi.getAll({ type: 'business' })
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          search,
          category,
          price_range: priceRange,
          min_rating: minRating,
          featured,
          sort,
          per_page: 9,
        };
        const res = await businessApi.getAll(params);
        setBusinesses(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          last_page: res.data.last_page,
          total: res.data.total,
        });
      } catch (err) {
        console.error('Error fetching businesses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusinesses();
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

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
            Local Businesses & Hospitality
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mt-3 font-heading">
            Hotels, Cafés & Local Services in Siem Reap
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Support local enterprises! Explore verified boutique retreats, organic dining, licensed temple tour guides, and circus performances.
          </p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 space-y-4">
        
        {/* Search and Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search hotel name, restaurant, tour guide..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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

          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
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
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => updateParam('category', '')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              !category
                ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Businesses
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat.slug
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                className={`px-3 py-1.5 rounded-xl border font-bold transition-colors ${
                  priceRange === tier
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tier}
              </button>
            ))}

            {/* Featured Only */}
            <button
              onClick={() => updateParam('featured', featured ? '' : 'true')}
              className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-colors ${
                featured
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Featured Partners Only</span>
            </button>

            {(search || category || priceRange || minRating || featured) && (
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:underline font-bold text-xs ml-2"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No businesses match your selection</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing selected price tiers.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors shadow-md"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className={`w-10 h-10 rounded-2xl text-xs font-bold transition-all ${
                  page === pageNum
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/25 scale-105'
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
