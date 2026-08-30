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
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
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
  });

  const destination = data?.destination || (data?.name || data?.id ? data : null);
  const similar = data?.similar || [];
  // Show full-page spinner only on truly first load (no cached data)
  const loading = isLoading && !data;

  const images = destination?.images || [];
  const favorited = isFavorited('destination', destination?.id);
  const rawImages = images.length > 0
    ? images.map(img => getFullImageUrl(img.image || img.url || img.image_url || img)).filter(Boolean)
    : [getFullImageUrl(destination?.cover_image || destination?.image) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80'].filter(Boolean);
  const allImages = rawImages.length > 0 ? rawImages : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80'];
  const heroImage = allImages[activeImageIndex] || allImages[0];

  // Keyboard navigation for Lightbox (always called unconditionally before early returns)
  React.useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setActiveImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
      if (e.key === 'ArrowRight') setActiveImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allImages.length]);

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
    <div className="bg-slate-50 min-h-screen pb-28 sm:pb-16">

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
            <span>Back</span>
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
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <div className="relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2 h-[380px] sm:h-[480px]">
          
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
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-800 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-xs flex items-center gap-2 hover:bg-white transition-colors z-10 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-orange-600" />
            <span>Show all photos ({allImages.length})</span>
          </button>
        </div>
      </div>

      {/* Prominent Sponsored Partner Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdBanner placement="hero_banner" variant="wide" />
      </div>

      {/* ═══════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* ─── LEFT: Main Info ─── */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-10">

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1: Admission */}
              <div className="col-span-1 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Admission</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                    {destination.entrance_fee > 0 ? `$${Number(destination.entrance_fee).toFixed(0)}` : 'Free'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">
                    {destination.fee_notes || 'ក្នុងម្នាក់ (Per person)'}
                  </p>
                </div>
              </div>

              {/* Card 2: Opens */}
              <div className="col-span-1 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 text-slate-700">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">Opening Hours</span>
                </div>
                <div className="space-y-1">
                  <p className="text-base sm:text-xl font-extrabold text-slate-900 leading-tight">
                    {destination.opening_time ? `${destination.opening_time.slice(0,5)}` : '05:00'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight">
                    Close {destination.closing_time ? destination.closing_time.slice(0,5) : '17:30'}
                  </p>
                </div>
              </div>

              {/* Card 3: Best Time */}
              <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">ពេលល្អបំផុត (Best Time)</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {destination.best_time || 'Morning'}
                  </p>
                  <p className="text-[11px] sm:text-xs text-orange-700 font-semibold leading-tight">
                    ★ Best time for travel
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* About */}
            <div className="p-5 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full bg-orange-600" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">About this Place</h2>
              </div>
              <p className="text-slate-600 text-sm leading-[1.8] whitespace-pre-line">
                {destination.description}
              </p>
            </div>

            {/* Facilities */}
            {destination.facilities && destination.facilities.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full bg-emerald-600" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">Facilities</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {destination.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      <span className="text-xs font-semibold text-slate-800">{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 sm:h-6 rounded-full bg-orange-600" />
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                    Reviews <span className="text-slate-400 font-normal text-sm sm:text-base">({destination.reviews?.length || 0})</span>
                  </h2>
                </div>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* Rating Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
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
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{destination.review_count || 0} reviews</p>
                </div>
                <div className="w-full flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = destination.reviews?.filter(r => r.rating === star).length || 0;
                    const pct = destination.reviews?.length ? Math.round((count / destination.reviews.length) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 w-3.5">{star}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 font-semibold w-7 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews list */}
              <div className="space-y-3 sm:space-y-4">
                {(!destination.reviews || destination.reviews.length === 0) ? (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
                    <Star className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm font-bold text-slate-700">Don't have reviews</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Be the first to share your experience!</p>
                  </div>
                ) : (
                  destination.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2.5 hover:border-slate-300 transition-colors">
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
            <div className="sticky top-24 space-y-4">

              {/* Primary CTA Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                  <div>
                    <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-600 block">Plan Your Visit</span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 font-heading">{destination.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(destination.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                      ))}
                      <span className="text-xs text-slate-600 font-bold ml-1">{Number(destination.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Add to Trip CTA */}
                  <button
                    onClick={handleQuickAddToTrip}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      addedToTripSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
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
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-orange-600" />
                    <span>Get GPS Directions</span>
                  </a>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Info list */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2 font-semibold"><Ticket className="w-4 h-4 text-slate-400 shrink-0" /> Price</span>
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
              <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 text-slate-900 space-y-2.5">
                <div className="flex items-center gap-1.5 text-orange-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider">Local Expert Tour</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug">Book a licensed tuk-tuk & temple tour with expert local guides</p>
                <Link
                  to="/businesses/angkor-sunrise-safari"
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-orange-700 transition-colors shadow-xs"
                >
                  View Angkor Safari →
                </Link>
              </div>

              {/* Sponsored Destination Sidebar Ad */}
              <AdBanner placement="destination_sidebar,hero_banner" variant="sidebar" />

              {/* QR Code quick action */}
              <button
                onClick={() => setQrModalOpen(true)}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors hover:bg-orange-50 cursor-pointer bg-white"
              >
                <QrCode className="w-4 h-4" />
                <span>Generate Location QR Code</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SIMILAR DESTINATIONS
      ═══════════════════════════════════════ */}
      {similar.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 py-10 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 mb-1 block">Explore More</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                  Similar Destinations in {destination.category?.name || 'Siem Reap'}
                </h2>
              </div>
              <Link
                to="/destinations"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 shrink-0"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
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

      {/* Lightbox Luxury Glassmorphism Carousel */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar Header */}
          <div 
            className="w-full max-w-6xl mx-auto flex items-center justify-between z-20 pb-2" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg">
                <Camera className="w-3.5 h-3.5 text-orange-400" />
                <span>{activeImageIndex + 1} / {allImages.length} Photos</span>
              </div>
              <span className="hidden sm:inline-block text-white/70 font-semibold text-xs truncate max-w-xs">
                {destination.name}
              </span>
            </div>

            <button 
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white hover:text-orange-400 border border-white/20 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              title="បិទ (ESC)"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Main Image Stage */}
          <div className="relative w-full flex-1 flex items-center justify-center py-2 px-2 sm:px-14">
            <div 
              className="relative max-w-5xl max-h-[72vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                key={activeImageIndex}
                src={allImages[activeImageIndex]} 
                alt={`${destination.name} ${activeImageIndex + 1}`} 
                className="max-w-full max-h-[72vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200"
              />

              {/* Watermark / Place Name pill on active image */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3.5 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/15 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg pointer-events-none">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>{destination.name}</span>
                {destination.khmer_name && (
                  <span className="text-white/60 text-[11px] font-normal font-khmer">({destination.khmer_name})</span>
                )}
              </div>
            </div>

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/60 hover:bg-white text-white hover:text-slate-900 border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer z-30"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-slate-900/60 hover:bg-white text-white hover:text-slate-900 border border-white/20 flex items-center justify-center backdrop-blur-md transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95 cursor-pointer z-30"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
                </button>
              </>
            )}
          </div>

          {/* Floating Bottom Filmstrip Dock */}
          <div 
            className="w-full max-w-3xl mx-auto py-2 z-20" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-white/15 shadow-2xl flex items-center justify-center gap-2 overflow-x-auto no-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`flex-shrink-0 w-14 h-11 sm:w-18 sm:h-13 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    idx === activeImageIndex 
                      ? 'ring-2 ring-orange-500 scale-105 opacity-100 shadow-md border border-white/30' 
                      : 'opacity-50 hover:opacity-100 border border-transparent hover:scale-105'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
