import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Compass, ArrowUpRight, Clock } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import Badge from '../common/Badge';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { useAuthStore } from '../../store/useAuthStore';

import { getFullImageUrl } from '../../utils/imageUrl';

export default function DestinationCard({ destination, onRequireAuth }) {
  const { isFavorited, toggleFavorite } = useFavoriteStore();
  const { isAuthenticated } = useAuthStore();
  const [animating, setAnimating] = useState(false);

  const favorited = isFavorited('destination', destination.id);

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
      await toggleFavorite('destination', destination.id);
    } catch (err) {
      console.error(err);
    }
  };

  const rawImage = destination.images?.[0]?.image || destination.primary_image?.image;
  const primaryImage = getFullImageUrl(rawImage);

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full card-hover-effect">
      
      {/* Image Container with Badges & Favorite */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {destination.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
              {destination.category.name}
            </span>
          )}
          {destination.is_hidden_gem && (
            <Badge type="hidden_gem" text="Hidden Gem" />
          )}
          {destination.is_featured && (
            <Badge type="featured" text="Must Visit" />
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

        {/* Bottom Image Overlay Details */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-[11px] font-medium text-slate-200 flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="truncate">{destination.address}</span>
          </p>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Price Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <RatingStars rating={destination.rating} reviewCount={destination.review_count} />
            <span className="text-xs font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {destination.entrance_fee > 0 ? `$${Number(destination.entrance_fee).toFixed(0)} Entry` : 'Free Entry'}
            </span>
          </div>

          {/* Title and Khmer subtitle */}
          <Link to={`/destinations/${destination.slug}`} className="block group-hover:text-orange-600 transition-colors">
            <h3 className="font-bold text-lg text-slate-900 leading-snug group-hover:text-orange-600 transition-colors">
              {destination.name}
            </h3>
            {destination.khmer_name && (
              <p className="text-xs font-khmer text-slate-400 mt-0.5">
                {destination.khmer_name}
              </p>
            )}
          </Link>

          {/* Short description */}
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {destination.short_description || destination.description}
          </p>
        </div>

        {/* Card Footer CTA */}
        <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{destination.best_time ? destination.best_time.split('&')[0] : 'Open Daily'}</span>
          </div>

          <Link
            to={`/destinations/${destination.slug}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 group/btn"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
