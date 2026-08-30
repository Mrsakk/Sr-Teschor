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
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all duration-300 flex flex-col h-full">
      
      {/* Image Container */}
      <Link to={`/destinations/${destination.slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 block">
        <img
          src={primaryImage}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Single Primary Badge */}
        <div className="absolute top-3 left-3 z-10">
          {destination.category ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/95 text-slate-800 border border-slate-100 shadow-xs backdrop-blur-xs">
              {destination.category.name}
            </span>
          ) : destination.is_featured ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-600 text-white shadow-xs">
              ★ Top Destination
            </span>
          ) : null}
        </div>

        {/* Favorite Heart Button */}
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
      </Link>

      {/* Clean Content Info */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Row 1: Title & Rating */}
          <div className="flex items-start justify-between gap-2">
            <Link to={`/destinations/${destination.slug}`} className="block group-hover:text-orange-600 transition-colors flex-1">
              <h3 className="font-bold text-base text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
                {destination.name}
              </h3>
              {destination.khmer_name && (
                <p className="text-xs font-khmer text-slate-500 mt-0.5 line-clamp-1">
                  {destination.khmer_name}
                </p>
              )}
            </Link>

            {/* Rating */}
            {Number(destination.rating) > 0 && (
              <div className="flex items-center gap-1 shrink-0 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md text-xs font-bold text-slate-800">
                <span className="text-amber-500">★</span>
                <span>{Number(destination.rating).toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Row 2: Location */}
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{destination.address || 'Siem Reap, Cambodia'}</span>
          </p>
        </div>

        {/* Row 3: Price & Action */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Price</span>
            <span translate="no" className="notranslate text-sm font-black text-slate-900">
              {destination.entrance_fee > 0 ? `$${Number(destination.entrance_fee).toFixed(0)}` : 'Free'}
            </span>
          </div>

          <Link
            to={`/destinations/${destination.slug}`}
            className="px-3.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
          >
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
