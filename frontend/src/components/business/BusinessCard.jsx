import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Building2, Tag, ArrowUpRight, Phone } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useAuthStore } from '../../store/useAuthStore';

import { getFullImageUrl } from '../../utils/imageUrl';

export default function BusinessCard({ business, onRequireAuth, onQuickBook }) {
  const { isFavorited, toggleFavorite } = useFavoriteStore();
  const { isAuthenticated } = useAuthStore();
  const [animating, setAnimating] = useState(false);

  const favorited = isFavorited('business', business.id);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);
    try {
      await toggleFavorite('business', business.id);
    } catch (err) {
      console.error(err);
    }
  };

  const activePromo = business.promotions?.find(p => p.status === 'active' && new Date(p.end_date) >= new Date(new Date().setHours(0,0,0,0)));
  const rawCover = business.cover_image || (business.gallery_images && business.gallery_images[0]);
  const coverImg = getFullImageUrl(rawCover, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80');

  const formatPriceDisplay = (biz) => {
    if (biz.services && biz.services.length > 0) {
      const prices = biz.services.map(s => Number(s.price)).filter(p => !isNaN(p) && p > 0);
      if (prices.length > 0) {
        return `From $${Math.min(...prices).toFixed(0)}`;
      }
    }
    if (biz.starting_price && Number(biz.starting_price) > 0) {
      return `From $${Number(biz.starting_price).toFixed(0)}`;
    }
    const range = biz.price_range;
    if (range === '$') return '$1 - $10';
    if (range === '$$') return '$10 - $25';
    if (range === '$$$') return '$25 - $50';
    if (range === '$$$$') return '$50+';
    if (range && range.includes('$')) return range;
    return '$10 - $25';
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all duration-300 flex flex-col h-full">
      
      {/* Cover Image Container */}
      <Link to={`/businesses/${business.slug}`} className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 block">
        <img
          src={coverImg}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          {business.category && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 border border-slate-100 shadow-xs backdrop-blur-xs">
              {business.category.name}
            </span>
          )}
          {business.verification_status === 'approved' && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
              Verified ✔
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Save to favorites"
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs ${
            favorited
              ? 'bg-rose-500 text-white'
              : 'bg-white/90 hover:bg-white text-slate-600 hover:text-rose-500 border border-slate-100 backdrop-blur-xs'
          } ${animating ? 'scale-125' : 'scale-100'}`}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Active Promotion Pill */}
        {activePromo && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-600 text-white shadow-xs">
              <Tag className="w-3 h-3" /> {activePromo.discount}
            </span>
          </div>
        )}
      </Link>

      {/* Content Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Row 1: Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <Link to={`/businesses/${business.slug}`} className="block group-hover:text-emerald-700 transition-colors flex-1">
              <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1">
                {business.name}
              </h3>
              {business.khmer_name && (
                <p className="text-xs font-khmer text-slate-500 mt-0.5 line-clamp-1">
                  {business.khmer_name}
                </p>
              )}
            </Link>

            {/* Rating */}
            {Number(business.rating) > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-xs font-bold text-slate-800">
                <span className="text-amber-500">★</span>
                <span>{Number(business.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Row 2: Address */}
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{business.address || 'Siem Reap, Cambodia'}</span>
          </p>
        </div>

        {/* Row 3: Price / Hours & View Button */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Price</span>
            <span translate="no" className="notranslate text-xs font-extrabold text-slate-800">
              {formatPriceDisplay(business)}
            </span>
          </div>

          <Link
            to={`/businesses/${business.slug}`}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-700 text-emerald-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
          >
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
