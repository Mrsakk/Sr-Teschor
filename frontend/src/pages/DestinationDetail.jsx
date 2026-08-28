import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  MapPin, 
  Clock, 
  DollarSign, 
  Share2, 
  Calendar, 
  Compass, 
  Star, 
  Check, 
  Sparkles, 
  Navigation,
  ArrowLeft,
  MessageSquarePlus,
  QrCode,
  Camera,
  ChevronLeft,
  ChevronRight,
  Sun,
  Users,
  Ticket,
  Wifi,
  Globe,
  TrendingUp,
  ExternalLink,
  X
} from 'lucide-react';
import { destinationApi, tripApi } from '../api/endpoints';
import RatingStars from '../components/common/RatingStars';
import Badge from '../components/common/Badge';
import DestinationCard from '../components/destination/DestinationCard';
import ReviewModal from '../components/review/ReviewModal';
import AdBanner from '../components/ads/AdBanner';
import UserAvatar from '../components/common/UserAvatar';
import LocationQrModal from '../components/common/LocationQrModal';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { useAuthStore } from '../store/useAuthStore';

import { getFullImageUrl } from '../utils/imageUrl';

export default function DestinationDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isFavorited, toggleFavorite } = useFavoriteStore();
  const { isAuthenticated } = useAuthStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [addedToTripSuccess, setAddedToTripSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const queryClient = useQueryClient();

  // ── Destination Detail — instant from cache on revisit ──
  const { data, isLoading } = useQuery({
    queryKey: ['destination', slug],
    queryFn: async () => {
      window.scrollTo(0, 0);
      const res = await destinationApi.getBySlug(slug);
      return res.data;
    },
    placeholderData: () => {
      const destinationsQueries = queryClient.getQueriesData({ queryKey: ['destinations'] });
      for (const [, queryData] of destinationsQueries) {
        let dests = [];
        if (Array.isArray(queryData)) {
          dests = queryData;
        } else if (queryData?.data && Array.isArray(queryData.data)) {
          dests = queryData.data;
        }
        
        const found = dests.find(d => d.slug === slug);
        if (found) {
          return { destination: found, similar: [] };
        }
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 3, // 3 minutes — detail page stale slightly faster
  });

  const destination = data?.destination || null;
  const similar = data?.similar || [];
  // Show full-page spinner only on truly first load (no cached data)
  const loading = isLoading && !data;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-semibold">Loading destination...</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <Compass className="w-14 h-14 text-slate-300 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Destination Not Found</h2>
          <p className="text-sm text-slate-500">This destination may have been removed or relocated.</p>
          <Link to="/destinations" className="inline-block px-6 py-3 bg-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sm hover:bg-orange-600 transition-colors">
            Browse Destinations
          </Link>
        </div>
      </div>
    );
  }

  const images = destination.images || [];
  const favorited = isFavorited('destination', destination.id);
  const allImages = images.map(img => getFullImageUrl(img.image)).filter(Boolean);
  const heroImage = allImages[activeImageIndex] || allImages[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80';

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const openLightbox = (index) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
  };

  const handleQuickAddToTrip = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      const res = await tripApi.getAll();
      let trip = res.data.my_trips?.[0];
      if (!trip) {
        const createRes = await tripApi.create({ name: 'My Siem Reap Trip', description: 'Custom itinerary created on Tes Chor', is_public: false });
        trip = createRes.data;
      }
      await tripApi.addItem(trip.id, { destination_id: destination.id, day_number: 1, notes: `Visit ${destination.name}`, estimated_time: '2-3 Hours' });
      setAddedToTripSuccess(true);
      setTimeout(() => setAddedToTripSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-28 sm:pb-16">

      {/* ═══════════════════════════════════════
          HEADER: Title & Actions
      ═══════════════════════════════════════ */}
      <div className="pt-20 sm:pt-28 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back */}
        <div className="mb-4">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ត្រឡប់ក្រោយ (Back)</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="flex-1">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
              {destination.category && (
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {destination.category.name}
                </span>
              )}
              {destination.is_hidden_gem && (
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 sm:py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  ✦ Hidden Gem
                </span>
              )}
              {destination.is_featured && (
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 sm:py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  ★ Must Visit
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight font-heading">
              {destination.name}
            </h1>
            {destination.khmer_name && (
              <p className="text-lg text-slate-500 font-khmer mt-1">{destination.khmer_name}</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-slate-600 text-[13px] sm:text-sm font-semibold">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                <span className="text-slate-900">{Number(destination.rating || 0).toFixed(1)}</span>
                <span className="underline decoration-slate-300">({destination.review_count || 0} reviews)</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="truncate underline decoration-slate-300">{destination.address || 'Siem Reap, Cambodia'}</span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2 transition-colors border border-slate-200 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? 'បានចម្លង!' : 'Share'}</span>
            </button>

            <button
              onClick={() => toggleFavorite('destination', destination.id)}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center gap-2 transition-colors border border-slate-200 shadow-sm"
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{favorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          GRID GALLERY
      ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 h-[400px] sm:h-[500px]">
          
          {/* Main Image (Left, spans 2 cols on lg) */}
          <div className="col-span-1 md:col-span-1 lg:col-span-2 h-full relative group cursor-pointer" onClick={() => openLightbox(0)}>
            <img 
              src={allImages[0] || heroImage} 
              alt="Main view" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>

          {/* Right side grid (Only shows on larger screens) */}
          <div className="hidden lg:grid col-span-2 grid-rows-2 gap-1.5 sm:gap-2 h-full">
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 h-full">
              <div className="relative group cursor-pointer h-full" onClick={() => openLightbox(1)}>
                <img src={allImages[1] || heroImage} alt="View 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="relative group cursor-pointer h-full" onClick={() => openLightbox(2)}>
                <img src={allImages[2] || heroImage} alt="View 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 h-full">
              <div className="relative group cursor-pointer h-full" onClick={() => openLightbox(3)}>
                <img src={allImages[3] || heroImage} alt="View 4" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <div className="relative group cursor-pointer h-full" onClick={() => openLightbox(4)}>
                <img src={allImages[4] || heroImage} alt="View 5" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            </div>
          </div>

          {/* Show all photos button */}
          <button 
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-slate-200 text-slate-800 px-4 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 hover:bg-white transition-colors z-10"
          >
            <Camera className="w-4 h-4" />
            <span>Show all photos ({allImages.length})</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* ─── LEFT: Main Info ─── */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1: Admission */}
              <div className="col-span-1 p-4 rounded-xl border bg-gradient-to-br from-orange-50/90 to-amber-50/40 border-orange-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-100/90 flex items-center justify-center flex-shrink-0 text-orange-600 shadow-inner">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Admission</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                    {destination.entrance_fee > 0 ? `$${Number(destination.entrance_fee).toFixed(0)}` : 'Free Entry'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">
                    {destination.fee_notes || 'Per person'}
                  </p>
                </div>
              </div>

              {/* Card 2: Opens */}
              <div className="col-span-1 p-4 rounded-xl border bg-gradient-to-br from-blue-50/90 to-indigo-50/40 border-blue-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/90 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-inner">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Opens</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                    {destination.opening_time ? `${destination.opening_time.slice(0,5)}` : '05:00'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">
                    Closes {destination.closing_time ? destination.closing_time.slice(0,5) : '17:30'}
                  </p>
                </div>
              </div>

              {/* Card 3: Best Time (Spans full 2 columns on mobile for readable text) */}
              <div className="col-span-2 sm:col-span-1 p-4 rounded-xl border bg-gradient-to-br from-amber-50/90 to-yellow-50/40 border-amber-100 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100/90 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-inner">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Best Time</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {destination.best_time || 'Early Morning'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-amber-700/80 font-medium leading-tight">
                    Recommended
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-orange-500" />
                <h2 className="text-2xl font-extrabold text-slate-900">About this Place</h2>
              </div>
              <p className="text-slate-600 text-sm leading-[1.9] whitespace-pre-line">
                {destination.description}
              </p>
            </div>

            {/* Facilities */}
            {destination.facilities && destination.facilities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-emerald-500" />
                  <h2 className="text-xl font-extrabold text-slate-900">Facilities & Services</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {destination.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 sm:h-6 rounded-full bg-amber-500" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                    Reviews <span className="text-slate-400 font-normal text-sm sm:text-base">({destination.reviews?.length || 0})</span>
                  </h2>
                </div>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* Rating Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="text-center shrink-0">
                  <div className="text-4xl sm:text-5xl font-black text-slate-900">{Number(destination.rating || 0).toFixed(1)}</div>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < Math.round(destination.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{destination.review_count || 0} reviews</p>
                </div>
                <div className="w-full flex-1 space-y-1 sm:space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = destination.reviews?.filter(r => r.rating === star).length || 0;
                    const pct = destination.reviews?.length ? Math.round((count / destination.reviews.length) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 w-3.5">{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-400 w-7 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-3 sm:space-y-4">
                {(!destination.reviews || destination.reviews.length === 0) ? (
                  <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <Star className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm font-semibold text-slate-400">No reviews yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Be the first to share your experience!</p>
                  </div>
                ) : (
                  destination.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 sm:p-5 rounded-xl bg-white border border-slate-100 shadow-xs space-y-2.5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <UserAvatar user={rev.user} size="md" />
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-slate-900">{rev.user?.name || 'Traveler'}</p>
                            <p className="text-[10px] sm:text-[11px] text-slate-400">Visited recently</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Sticky Action Card ─── */}
          <div className="space-y-4 sm:space-y-5">
            <div className="sticky top-24 space-y-3.5 sm:space-y-4">

              {/* Primary CTA Card */}
              <div className="bg-white rounded-xl sm:rounded-xl border border-slate-100 shadow-sm shadow-sm overflow-hidden">
                {/* Card header accent */}
                <div className="h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                
                <div className="p-4.5 sm:p-6 space-y-4 sm:space-y-5">
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-500">Plan Your Visit</p>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 font-heading">{destination.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(destination.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">{Number(destination.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Add to Trip CTA */}
                  <button
                    onClick={handleQuickAddToTrip}
                    className={`w-full py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                      addedToTripSuccess
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm hover:shadow-sm hover:-translate-y-0.5'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    {addedToTripSuccess ? '✓ Added to Your Trip!' : 'Add to My Trip Itinerary'}
                  </button>

                  {/* GPS Directions */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${destination.latitude || 13.4125},${destination.longitude || 103.8670}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-xl border-2 border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Navigation className="w-4 h-4 text-orange-500" />
                    Get GPS Directions
                  </a>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Info list */}
                  <div className="space-y-2.5 sm:space-y-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2 font-semibold"><Ticket className="w-4 h-4 text-slate-400 shrink-0" />Admission Fee</span>
                      <span className="font-extrabold text-slate-900">
                        {destination.entrance_fee > 0 ? `$${Number(destination.entrance_fee).toFixed(0)}` : 'Free'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2 font-semibold"><Clock className="w-4 h-4 text-slate-400 shrink-0" />Opening Hours</span>
                      <span className="font-extrabold text-slate-900">
                        {destination.opening_time ? `${destination.opening_time.slice(0,5)} – ${(destination.closing_time || '17:30').slice(0,5)}` : '05:00 – 17:30'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2 font-semibold"><MapPin className="w-4 h-4 text-slate-400 shrink-0" />Location</span>
                      <span className="font-extrabold text-slate-900 text-right max-w-[130px] truncate">
                        {destination.address || 'Siem Reap'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Guide Card */}
              <div className="p-4 sm:p-5 rounded-xl sm:rounded-xl bg-orange-600 text-white shadow-sm shadow-sm space-y-2.5 sm:space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest opacity-90">Local Expert Guide</span>
                </div>
                <p className="text-xs sm:text-sm font-bold leading-snug">Book a licensed tuk-tuk & temple tour with expert local guides</p>
                <Link
                  to="/businesses/angkor-sunrise-safari"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold bg-white text-orange-600 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl hover:bg-orange-50 transition-colors"
                >
                  View Angkor Sunrise Safari →
                </Link>
              </div>

              {/* Sponsored Destination Sidebar Ad */}
              <AdBanner placement="destination_sidebar,hero_banner" variant="sidebar" />

              {/* QR Code quick action */}
              <button
                onClick={() => setQrModalOpen(true)}
                className="w-full p-3.5 sm:p-4 rounded-xl sm:rounded-xl border-2 border-dashed border-slate-200 hover:border-orange-300 text-slate-500 hover:text-orange-500 text-xs font-bold flex items-center justify-center gap-2 transition-all hover:bg-orange-50 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                Generate Location QR Code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SIMILAR DESTINATIONS
      ═══════════════════════════════════════ */}
      {similar.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-100 py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-500 mb-0.5 sm:mb-1">Explore More</p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                  Similar Destinations in {destination.category?.name || 'Siem Reap'}
                </h2>
              </div>
              <Link
                to="/destinations"
                className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 shrink-0"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {similar.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReviewModal
        type="destination"
        target={destination}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={(newReview) => {
          setDestination((prev) => ({
            ...prev,
            reviews: [newReview, ...(prev.reviews || [])],
            review_count: (prev.review_count || 0) + 1,
          }));
        }}
      />

      <LocationQrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        placeName={destination.name}
        khmerName={destination.khmer_name}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Lightbox Carousel */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex justify-between items-center z-10" onClick={(e) => e.stopPropagation()}>
            <div className="text-white/80 text-sm font-semibold">
              {activeImageIndex + 1} / {allImages.length}
            </div>
            <button 
              className="text-white/70 hover:text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image */}
          <div className="relative w-full flex-1 flex items-center justify-center p-4 sm:p-8">
            <img 
              src={allImages[activeImageIndex]} 
              alt={`View ${activeImageIndex + 1}`} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>

          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-10"
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </button>
            </>
          )}

          {/* Thumbnails (Optional) */}
          <div className="w-full h-24 bg-black/50 p-4 flex justify-center gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === activeImageIndex ? 'border-orange-500 opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
