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

  const activePromo = business.promotions?.[0];
  const rawCover = business.cover_image || (business.gallery_images && business.gallery_images[0]);
  const coverImg = getFullImageUrl(rawCover, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80');

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full card-hover-effect">
      
      {/* Cover Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={coverImg}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {business.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
              {business.category.name}
            </span>
          )}
          {business.is_featured && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md flex items-center gap-1">
              <span>⭐ Featured</span>
            </span>
          )}
          {business.verification_status === 'approved' && (
            <Badge type="verified" text="Verified ✔️" />
          )}
          {business.subscription_plan === 'premium' && !business.is_featured && (
            <Badge type="featured" text="VIP Partner" />
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          aria-label="Save to favorites"
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
            favorited
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-black/30 text-white hover:bg-black/50'
          } ${animating ? 'scale-125' : 'scale-100'}`}
        >
          <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        {/* Promotion tag if available */}
        {activePromo && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-red-600 text-white shadow-md">
              <Tag className="w-3 h-3" /> {activePromo.discount}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header with Rating & Price tier */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <RatingStars rating={business.rating} reviewCount={business.review_count} />
            <span className="text-xs font-black tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {business.price_range || '$$'}
            </span>
          </div>

          {/* Title */}
          <Link to={`/businesses/${business.slug}`} className="block group-hover:text-emerald-700 transition-colors">
            <h3 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
              {business.name}
            </h3>
            {business.khmer_name && (
              <p className="text-xs font-khmer text-slate-400 mt-0.5">
                {business.khmer_name}
              </p>
            )}
          </Link>

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {business.short_description || business.description}
          </p>

          <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{business.address}</span>
          </p>
        </div>

        {/* Footer actions */}
        <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
            {business.opening_hours || 'Open Daily'}
          </span>

          <Link
            to={`/businesses/${business.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 group/btn"
          >
            <span>View Place</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
