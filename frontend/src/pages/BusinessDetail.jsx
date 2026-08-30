import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  Clock, 
  Star, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  ArrowLeft, 
  Navigation, 
  MessageSquarePlus, 
  Calendar, 
  Copy, 
  X, 
  QrCode, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft, 
  ShieldCheck, 
  Award, 
  Camera, 
  Building2 
} from 'lucide-react';
import { businessApi } from '../api/endpoints';
import RatingStars from '../components/common/RatingStars';
import Badge from '../components/common/Badge';
import BusinessCard from '../components/business/BusinessCard';
import BookingModal from '../components/booking/BookingModal';
import ReviewModal from '../components/review/ReviewModal';
import LocationQrModal from '../components/common/LocationQrModal';
import UserAvatar from '../components/common/UserAvatar';
import { useFavoriteStore } from '../store/useFavoriteStore';
import { getFullImageUrl } from '../utils/imageUrl';

export default function BusinessDetail() {
  const { slug } = useParams();
  const { isFavorited, toggleFavorite } = useFavoriteStore();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const queryClient = useQueryClient();

  // ── Business Detail — instant from cache on revisit ──
  const { data, isLoading } = useQuery({
    queryKey: ['business', slug],
    queryFn: async () => {
      window.scrollTo(0, 0);
      const res = await businessApi.getBySlug(slug);
      return res.data;
    },
    placeholderData: () => {
      const businessesQueries = queryClient.getQueriesData({ queryKey: ['businesses'] });
      for (const [, queryData] of businessesQueries) {
        let bizList = [];
        if (Array.isArray(queryData)) {
          bizList = queryData;
        } else if (queryData?.data && Array.isArray(queryData.data)) {
          bizList = queryData.data;
        }
        
        const found = bizList.find(b => b.slug === slug);
        if (found) {
          return { business: found, similar: [] };
        }
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
  });

  const business = data?.business || null;
  const similar = data?.similar || [];
  const loading = isLoading && !data;

  const rawImages = business ? [
    ...(business.cover_image ? [business.cover_image] : []),
    ...(business.gallery_images || []),
  ].filter(Boolean) : [];

  const allImages = rawImages.length > 0
    ? rawImages.map(img => getFullImageUrl(img))
    : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80'];

  // Keyboard navigation for Lightbox
  useEffect(() => {
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
      <div className="pt-24 sm:pt-28 pb-20 max-w-7xl mx-auto px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">កំពុងទាញយកព័ត៌មានអាជីវកម្ម...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="pt-24 sm:pt-28 pb-20 max-w-lg mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">រកមិនឃើញអាជីវកម្មនេះទេ</h2>
        <Link to="/businesses" className="inline-block px-6 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md">
          ត្រឡប់ទៅកាន់បញ្ជីអាជីវកម្ម
        </Link>
      </div>
    );
  }

  const favorited = isFavorited('business', business.id);

  const rawCover = allImages[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80';
  const coverImg = getFullImageUrl(rawCover, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80');

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

  const handleOpenBooking = (serviceItem = null) => {
    setSelectedService(serviceItem);
    setBookingModalOpen(true);
  };

  const handleCopyPromo = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedPromo(code);
      setTimeout(() => setCopiedPromo(''), 2500);
    }
  };

  return (
    <div className="pt-16 sm:pt-24 pb-28 sm:pb-24 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
      
      {/* ── 1. TOP BREADCRUMB & ACTION BAR ── */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Link
          to="/businesses"
          className="h-9 sm:h-10 px-3 sm:px-4 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-2xs shrink-0 whitespace-nowrap"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">Back</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* QR Code */}
          <button
            onClick={() => setQrModalOpen(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer"
            title="Scan QR Code"
            aria-label="QR Code"
          >
            <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
          </button>

          {/* Share Button */}
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }
            }}
            className="h-9 sm:h-10 px-3 sm:px-4 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 shrink-0" />
            <span className="whitespace-nowrap">{copiedLink ? 'បានចម្លង!' : 'ចែករំលែក'}</span>
          </button>

          {/* Save Favorite Button */}
          <button
            onClick={() => toggleFavorite('business', business.id)}
            className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs shrink-0 cursor-pointer whitespace-nowrap ${
              favorited
                ? 'bg-rose-500 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${favorited ? 'fill-current' : ''}`} />
            <span className="whitespace-nowrap">{favorited ? 'បានរក្សាទុក' : 'រក្សាទុក'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. HERO HEADER BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden min-h-[300px] sm:min-h-[420px] bg-slate-950 shadow-xs flex flex-col justify-end p-5 sm:p-8 md:p-10 border border-slate-800">
        
        {/* Cover Background Image */}
        <img
          src={coverImg}
          alt={business.name}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-black/30" />

        {/* Content Container */}
        <div className="relative z-10 space-y-3 sm:space-y-4 max-w-3xl text-white">
          
          {/* Category & Status Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {business.category && (
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                {business.category.name}
              </span>
            )}
            {business.verification_status === 'approved' && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                <span>Verified Business</span>
              </span>
            )}
            {business.subscription_plan === 'premium' && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-600 text-white shadow-xs">
                <Award className="w-3 h-3 shrink-0" />
                <span>Featured Partner</span>
              </span>
            )}
          </div>

          {/* Main Title & Khmer Subtitle */}
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-white leading-tight">
              {business.name}
            </h1>
            {business.khmer_name && (
              <p className="text-sm sm:text-lg font-khmer text-orange-200 font-medium">
                {business.khmer_name}
              </p>
            )}
          </div>

          {/* Location & Rating Meta Row */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-slate-200">
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-black/50 backdrop-blur-xs px-2.5 py-1 rounded-xl">
              <Star className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
              <span>{Number(business.rating || 5).toFixed(1)}</span>
              <span className="text-slate-300 font-normal">({business.review_count || 0})</span>
            </div>

            <span className="text-white font-bold bg-white/20 px-2.5 py-1 rounded-xl text-[10px] sm:text-xs">
              {business.price_range || '$$ (Moderate)'}
            </span>

            <div className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-md">{business.address}</span>
            </div>
          </div>

          {/* CTA Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => handleOpenBooking()}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Book / Inquire Now</span>
            </button>

            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Call Directly</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT GRID (LEFT CONTENT + RIGHT STICKY SIDEBAR) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        
        {/* Left Column: Promotions, About, Gallery, Services, Reviews */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          
          {/* Active Promotions Voucher Alert */}
          {business.promotions && business.promotions.some(p => p.status === 'active' && new Date(p.end_date) >= new Date(new Date().setHours(0,0,0,0))) && (
            <div className="space-y-3">
              {business.promotions
                .filter(p => p.status === 'active' && new Date(p.end_date) >= new Date(new Date().setHours(0,0,0,0)))
                .map((p) => (
                <div
                  key={p.id}
                  className="bg-orange-50 rounded-2xl p-5 sm:p-6 text-slate-900 border border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-100 flex items-center justify-center font-black shrink-0 text-orange-600">
                      <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-600 text-white px-2 py-0.5 rounded-md inline-block shadow-xs">
                        {p.discount}
                      </span>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight font-heading">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {p.promo_code && (
                    <button
                      type="button"
                      onClick={() => handleCopyPromo(p.promo_code)}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-orange-700 font-mono font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-colors cursor-pointer shadow-xs"
                      title="Click to copy promo code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedPromo === p.promo_code ? 'Copied Code!' : p.promo_code}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* About Section */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
                Overview
              </span>
              <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 font-heading mt-0.5">
                About {business.name}
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {business.description || 'Verified local business in Siem Reap offering authentic Khmer culinary dishes and hospitality services.'}
            </p>
          </div>

          {/* Photo Gallery Grid */}
          {allImages.length > 1 && (
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Gallery
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                    Photo Gallery ({allImages.length})
                  </h3>
                </div>
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium hidden sm:inline">
                  Click to view full screen
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="relative aspect-[4/3] rounded-xl overflow-hidden group bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    <img
                      src={img}
                      alt={`${business.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-2.5 py-1 rounded-lg">
                        View Photo
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Services / Menu Packages */}
          {business.services && business.services.length > 0 && (
            <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Services & Menu
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                    Experiences & Services Offered
                  </h3>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">Instant Booking</span>
              </div>

              <div className="space-y-3">
                {business.services.map((serv) => (
                  <div
                    key={serv.id}
                    className="bg-slate-50 hover:bg-slate-100/70 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-xs sm:text-base text-slate-900 leading-snug">
                        {serv.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {serv.description}
                      </p>
                      {serv.duration && (
                        <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block pt-0.5">
                          ⏱️ Duration: {serv.duration}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <span className="font-extrabold text-sm sm:text-lg text-emerald-700">
                        ${Number(serv.price).toFixed(2)}
                      </span>
                      <Link
                        to={`/checkout/${serv.id}`}
                        state={{ item: serv, business }}
                        className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1"
                      >
                        <span>Book Now</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Reviews
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-heading">
                  Reviews & Customer Ratings ({business.reviews?.length || 0})
                </h3>
                <div className="mt-1">
                  <RatingStars rating={business.rating} reviewCount={business.review_count} size="md" />
                </div>
              </div>

              <button
                onClick={() => setReviewModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
              >
                <MessageSquarePlus className="w-4 h-4 text-emerald-700" />
                <span>Write a Review</span>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {(!business.reviews || business.reviews.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-xs space-y-1 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <Star className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                  <p>No reviews yet. Be the first to share your experience at {business.name}!</p>
                </div>
              ) : (
                business.reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar user={rev.user} size="sm" />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{rev.user?.name || 'Traveler'}</p>
                          <p className="text-[10px] text-slate-400">Verified Customer</p>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                    {/* Business Owner Reply */}
                    {rev.reply && (
                      <div className="bg-white rounded-xl p-3 border-l-4 border-emerald-600 text-xs space-y-0.5 shadow-2xs">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Reply from {business.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {rev.reply_date ? new Date(rev.reply_date).toLocaleDateString() : ''}
                          </span>
                        </p>
                        <p className="text-slate-600">{rev.reply}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* ── RIGHT COLUMN: CONTACT, OPENING HOURS & GPS MAP CARD ── */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5 sticky top-24">
            
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
                Contact & Location
              </span>
              <h4 className="font-extrabold text-base sm:text-lg text-slate-900 font-heading mt-0.5">
                Business Information
              </h4>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Hours */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Opening Hours</span>
                  <span className="text-slate-500 font-medium">{business.opening_hours || 'Open Daily (07:00 AM - 10:00 PM)'}</span>
                </div>
              </div>

              {/* Phone */}
              {business.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Phone / WhatsApp</span>
                    <a href={`tel:${business.phone}`} className="text-emerald-700 hover:underline font-bold text-sm">
                      {business.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* Official Website */}
              {business.website && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Official Website</span>
                    <a 
                      href={business.website} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-emerald-700 hover:underline font-semibold truncate block max-w-[200px]"
                    >
                      {business.website.replace('https://', '')}
                    </a>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">Address</span>
                  <span className="text-slate-500">{business.address}</span>
                </div>
              </div>

              {/* Location code */}
              {business.location_code && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold font-mono text-slate-700">
                      {business.location_code}
                    </span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(business.location_code)}
                    className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Copy location code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Action CTAs */}
            <div className="pt-3 space-y-2.5 border-t border-slate-100">
              <button
                onClick={() => handleOpenBooking()}
                className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Send Booking / Inquiry</span>
              </button>

              {/* Telegram Inquiry */}
              <a
                href={business.phone ? `https://t.me/+855${business.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}` : 'https://t.me/sr_techor_support'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Telegram Direct Chat</span>
              </a>

              {/* GPS Map Link */}
              <a
                href={business.map_link || `https://www.google.com/maps/search/?api=1&query=${business.latitude || 13.3601},${business.longitude || 103.8550}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                <span>Google Maps (GPS)</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* ── MODALS ── */}
      {/* Booking Modal */}
      <BookingModal
        business={business}
        service={selectedService}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      {/* Review Modal */}
      <ReviewModal
        type="business"
        target={business}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={(newReview) => {
          setBusiness((prev) => ({
            ...prev,
            reviews: [newReview, ...(prev.reviews || [])],
            review_count: (prev.review_count || 0) + 1,
          }));
        }}
      />

      {/* Location QR Modal */}
      <LocationQrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        placeName={business.name}
        khmerName={business.khmer_name}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />

      {/* Lightbox Luxury Glassmorphism Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-20 pb-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg">
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>📸 {activeImageIndex + 1} / {allImages.length} រូបភាព</span>
              </div>
              <span className="hidden sm:inline-block text-white/70 font-semibold text-xs truncate max-w-xs">
                {business.name}
              </span>
            </div>

            <button
              type="button"
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white hover:text-orange-400 border border-white/20 transition-all duration-200 cursor-pointer shadow-lg active:scale-95"
              onClick={() => setLightboxOpen(false)}
              title="បិទ (ESC)"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Main Image Stage with Next/Prev Controls */}
          <div className="relative w-full flex-1 flex items-center justify-center p-2 sm:p-6">
            
            {/* Prev Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                className="absolute left-2 sm:left-6 z-20 p-3 sm:p-4 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 hover:border-emerald-400 transition-all duration-200 cursor-pointer shadow-2xl hover:scale-110 active:scale-95"
                onClick={handlePrevImage}
                title="រូបមុន (Arrow Left)"
              >
                <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
              </button>
            )}

            <div className="relative max-w-5xl max-h-[72vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={allImages[activeImageIndex]}
                alt={`${business.name} full view`}
                className="max-w-full max-h-[72vh] object-contain rounded-2xl sm:rounded-3xl shadow-2xl border border-white/15 animate-in zoom-in-95 duration-200"
              />

              {/* Watermark / Place Name pill */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3.5 py-1.5 rounded-xl bg-slate-950/70 backdrop-blur-md border border-white/15 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg pointer-events-none">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{business.name}</span>
                {business.khmer_name && (
                  <span className="text-white/60 text-[11px] font-normal font-khmer">({business.khmer_name})</span>
                )}
              </div>
            </div>

            {/* Next Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                className="absolute right-2 sm:right-6 z-20 p-3 sm:p-4 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 hover:border-emerald-400 transition-all duration-200 cursor-pointer shadow-2xl hover:scale-110 active:scale-95"
                onClick={handleNextImage}
                title="រូបបន្ទាប់ (Arrow Right)"
              >
                <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Filmstrip Dock */}
          {allImages.length > 1 && (
            <div className="w-full max-w-2xl mx-auto z-20 pt-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-center gap-2 p-2 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/15 overflow-x-auto shadow-2xl">
                {allImages.map((thumb, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 transition-all duration-200 cursor-pointer ${
                      idx === activeImageIndex
                        ? 'ring-2 ring-emerald-500 scale-105 border-2 border-white'
                        : 'opacity-50 hover:opacity-100 hover:scale-100'
                    }`}
                  >
                    <img src={thumb} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
