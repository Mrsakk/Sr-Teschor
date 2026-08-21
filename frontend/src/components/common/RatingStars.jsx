import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 5, reviewCount = null, size = 'sm' }) {
  const numericRating = Number(rating) || 0;
  const fullStars = Math.floor(numericRating);
  const sizeClasses = size === 'lg' ? 'w-5 h-5' : (size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5');

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses} ${
              star <= fullStars
                ? 'fill-amber-400 text-amber-400'
                : (star - numericRating < 1
                  ? 'fill-amber-300 text-amber-400 opacity-70'
                  : 'text-slate-300')
            }`}
          />
        ))}
      </div>
      <span className={`font-bold text-slate-900 ${size === 'lg' ? 'text-base' : 'text-xs'}`}>
        {numericRating.toFixed(1)}
      </span>
      {reviewCount !== null && (
        <span className="text-slate-400 text-xs font-normal">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
