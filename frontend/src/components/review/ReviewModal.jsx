import React, { useState } from 'react';
import { X, Star, AlertCircle, Sparkles } from 'lucide-react';
import { reviewApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/useAuthStore';

export default function ReviewModal({ type, target, isOpen, onClose, onSuccess }) {
  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please log in to submit a review.');
      return;
    }

    if (comment.trim().length < 5) {
      setError('Please write at least 5 characters about your experience.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await reviewApi.submitReview({
        type: type, // 'destination' or 'business'
        id: target.id,
        rating: rating,
        comment: comment.trim(),
      });

      if (onSuccess) onSuccess(res.data.review);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Rate & Review
          </div>
          <h3 className="font-extrabold text-xl font-heading text-white">
            {target.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Share your authentic travel experience with other travelers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Star Rating */}
          <div className="text-center py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              How would you rate your experience?
            </p>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-extrabold text-slate-700 mt-2">
              {rating === 5 && '🌟 Exceptional! Loved everything.'}
              {rating === 4 && '✨ Very Good experience.'}
              {rating === 3 && '👍 Average / Good.'}
              {rating === 2 && '👎 Disappointing.'}
              {rating === 1 && '⚠️ Poor experience.'}
            </p>
          </div>

          {/* Comment Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Review & Advice
            </label>
            <textarea
              required
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What made this place special? Any tips on best time, photography angles, or favorite dishes?"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Review...' : 'Publish Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
