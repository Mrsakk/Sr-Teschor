import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ShieldCheck,
  Award
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

  const [business, setBusiness] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState('');
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await businessApi.getBySlug(slug);
        setBusiness(res.data.business);
        setSimilar(res.data.similar || []);
      } catch (err) {
        console.error('Business load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);

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

  const allImages = [
    ...(business.cover_image ? [business.cover_image] : []),
    ...(business.gallery_images || []),
  ].filter(Boolean);

  const rawCover = allImages[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80';
  const coverImg = getFullImageUrl(rawCover, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80');

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
    <div className="pt-16 sm:pt-24 pb-20 sm:pb-24 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* ── 1. TOP BREADCRUMB & ACTION BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link
          to="/businesses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>បញ្ជីអាជីវកម្ម (Businesses)</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* QR Code */}
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
            title="Scan QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">QR Code</span>
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copiedLink ? 'បានចម្លង!' : 'Share'}</span>
          </button>

          {/* Save Favorite Button */}
          <button
            onClick={() => toggleFavorite('business', business.id)}
            className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
              favorited
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
            <span>{favorited ? 'បានរក្សាទុក' : 'រក្សាទុក'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. HERO HEADER BANNER ── */}
      <div className="relative rounded-3xl overflow-hidden min-h-[340px] sm:min-h-[420px] bg-slate-950 shadow-xl flex flex-col justify-end p-5 sm:p-8 md:p-10 border border-slate-800">
        
        {/* Cover Background Image */}
        <img
          src={coverImg}
          alt={business.name}
          className="absolute inset-0 w-full h-full object-cover opacity-75"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-black/30" />

        {/* Content Container */}
        <div className="relative z-10 space-y-4 max-w-3xl text-white">
          
          {/* Category & Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {business.category && (
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30">
                {business.category.name}
              </span>
            )}
            {business.verification_status === 'approved' && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Business</span>
              </span>
            )}
            {business.subscription_plan === 'premium' && (
              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 shadow-sm">
                <Award className="w-3 h-3" />
                <span>Gold Partner</span>
              </span>
            )}
          </div>

          {/* Main Title & Khmer Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-white leading-tight drop-shadow-md">
              {business.name}
            </h1>
            {business.khmer_name && (
              <p className="text-sm sm:text-lg font-khmer text-amber-300 drop-shadow-sm font-medium">
                {business.khmer_name}
              </p>
            )}
          </div>

          {/* Location & Rating Meta Row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-200">
            <div className="flex items-center gap-1 text-amber-400 font-bold bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-xl">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{Number(business.rating || 5).toFixed(1)}</span>
              <span className="text-slate-300 font-normal">({business.review_count || 0} reviews)</span>
            </div>

            <span className="text-white font-bold bg-white/15 px-2 py-0.5 rounded-lg text-xs">
              {business.price_range || '$$ (Moderate)'}
            </span>

            <div className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[280px] sm:max-w-md">{business.address}</span>
            </div>
          </div>

          {/* CTA Action Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenBooking()}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>កក់ទុក ឬសាកសួរ (Book / Inquire Now)</span>
            </button>

            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Call Directly</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTENT GRID (LEFT CONTENT + RIGHT STICKY SIDEBAR) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        
        {/* Left Column: Promotions, About, Gallery, Services, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Promotions Voucher Alert */}
          {business.promotions && business.promotions.length > 0 && (
            <div className="space-y-3">
              {business.promotions.map((p) => (
                <div
                  key={p.id}
                  className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-orange-400/30 relative overflow-hidden"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black shrink-0 border border-white/30">
                      <Tag className="w-6 h-6 text-white" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white text-red-600 px-2.5 py-0.5 rounded-md shadow-xs inline-block">
                        {p.discount}
                      </span>
                      <h4 className="font-extrabold text-base text-white leading-tight font-heading">
                        {p.title}
                      </h4>
                      <p className="text-xs text-orange-100 leading-relaxed max-w-md">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {p.promo_code && (
                    <button
                      type="button"
                      onClick={() => handleCopyPromo(p.promo_code)}
                      className="px-4 py-2 rounded-xl bg-black/30 hover:bg-black/40 border border-white/30 text-amber-200 font-mono font-bold text-xs flex items-center gap-2 self-start sm:self-center shrink-0 transition-all cursor-pointer"
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                ព័ត៌មានលម្អិត (Overview)
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading mt-0.5">
                About {business.name}
              </h3>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {business.description || 'Verified local business in Siem Reap offering authentic Khmer culinary dishes and hospitality services.'}
            </p>
          </div>

          {/* Photo Gallery Grid */}
          {allImages.length > 1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    រូបភាពទេសភាព (Gallery)
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                    Photo Gallery ({allImages.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  Click to view full screen
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setLightboxImg(getFullImageUrl(img))}
                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group bg-slate-100 border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <img
                      src={getFullImageUrl(img)}
                      alt={`${business.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                      <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2.5 py-1 rounded-lg">
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    សេវាកម្ម និងកញ្ចប់ (Services & Menu)
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                    Experiences & Services Offered
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-medium">Instant Booking</span>
              </div>

              <div className="space-y-3">
                {business.services.map((serv) => (
                  <div
                    key={serv.id}
                    className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 sm:p-5 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                        {serv.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {serv.description}
                      </p>
                      {serv.duration && (
                        <span className="text-[11px] font-semibold text-slate-400 block pt-0.5">
                          ⏱️ Duration: {serv.duration}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                      <span className="font-extrabold text-base sm:text-lg text-emerald-700">
                        ${Number(serv.price).toFixed(2)}
                      </span>
                      <Link
                        to={`/checkout/${serv.id}`}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-transform hover:scale-105 flex items-center gap-1"
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  មតិយោបល់ភ្ញៀវទេសចរ (Reviews)
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-heading">
                  Reviews & Customer Ratings ({business.reviews?.length || 0})
                </h3>
                <div className="mt-1">
                  <RatingStars rating={business.rating} reviewCount={business.review_count} size="md" />
                </div>
              </div>

              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors self-start sm:self-center cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4 text-emerald-600" />
                <span>Rate & Review (សរសេរការវាយតម្លៃ)</span>
              </button>
            </div>

            <div className="space-y-4">
              {(!business.reviews || business.reviews.length === 0) ? (
                <div className="text-center py-8 text-slate-400 text-xs space-y-1">
                  <Star className="w-6 h-6 text-slate-300 mx-auto" />
                  <p>មិនទាន់មានការវាយតម្លៃនៅឡើយទេ។ សូមក្លាយជាអ្នកដំបូងដែលសរសេរ Review សម្រាប់ {business.name}!</p>
                </div>
              ) : (
                business.reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={rev.user} size="sm" />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{rev.user?.name || 'Traveler'}</p>
                          <p className="text-[10px] text-slate-400">Verified Customer</p>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                    {/* Business Owner Reply */}
                    {rev.reply && (
                      <div className="bg-white rounded-xl p-3.5 border-l-4 border-emerald-600 text-xs space-y-1 shadow-xs">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>ឆ្លើយតបពី {business.name}</span>
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
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xl space-y-5 sticky top-24">
            
            <div className="border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                ទំនាក់ទំនង & ទីតាំង
              </span>
              <h4 className="font-extrabold text-lg text-slate-900 font-heading mt-0.5">
                Contact & Location
              </h4>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Hours */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">ម៉ោងបើកដំណើរការ (Opening Hours)</span>
                  <span className="text-slate-500 font-medium">{business.opening_hours || 'Open Daily (07:00 AM - 10:00 PM)'}</span>
                </div>
              </div>

              {/* Phone */}
              {business.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 block">អាសយដ្ឋាន (Address)</span>
                  <span className="text-slate-500">{business.address}</span>
                </div>
              </div>

              {/* Location code */}
              {business.location_code && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs font-bold font-mono text-slate-700">
                      {business.location_code}
                    </span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(business.location_code)}
                    className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors text-xs font-bold flex items-center gap-1"
                    title="ចម្លងកូដទីតាំង"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>ចម្លង</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Action CTAs */}
            <div className="pt-3 space-y-2.5 border-t border-slate-100">
              <button
                onClick={() => handleOpenBooking()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-transform hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>ផ្ញើសំណើកក់តុ / សេវាកម្ម</span>
              </button>

              {/* Telegram Inquiry */}
              <a
                href={business.phone ? `https://t.me/+855${business.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}` : 'https://t.me/sr_techor_support'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>ឆាតតាម Telegram (Direct Chat)</span>
              </a>

              {/* GPS Map Link */}
              <a
                href={business.map_link || `https://www.google.com/maps/search/?api=1&query=${business.latitude || 13.3601},${business.longitude || 103.8550}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>មើលផ្លូវលើ Google Maps (GPS)</span>
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

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            onClick={() => setLightboxImg(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImg}
            alt="Gallery preview"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
