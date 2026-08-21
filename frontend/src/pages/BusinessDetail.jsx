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
  Share2
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
      <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold">Loading business details...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="pt-28 pb-20 max-w-lg mx-auto px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Business Not Found</h2>
        <Link to="/businesses" className="inline-block px-6 py-2.5 bg-emerald-700 text-white text-xs font-bold rounded-xl">
          Back to Directory
        </Link>
      </div>
    );
  }

  const favorited = isFavorited('business', business.id);

  const allImages = [
    ...(business.cover_image ? [business.cover_image] : []),
    ...(business.gallery_images || []),
  ].filter(Boolean);

  const coverImg = allImages[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&auto=format&fit=crop&q=80';

  const handleOpenBooking = (serviceItem = null) => {
    setSelectedService(serviceItem);
    setBookingModalOpen(true);
  };

  return (
    <div className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Top Breadcrumb & Favorite */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/businesses"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Local Businesses
        </Link>

        <div className="flex items-center gap-2">
          {/* QR Code Button */}
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Get QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>QR Code</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={() => toggleFavorite('business', business.id)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              favorited
                ? 'bg-red-500 text-white shadow-md'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
            <span>{favorited ? 'Saved Place' : 'Save Place'}</span>
          </button>
        </div>
      </div>

      {/* Cover Image & Header Info */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[260px] bg-slate-900 shadow-sm">
        <img
          src={coverImg}
          alt={business.name}
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/40 to-transparent" />

        <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              {business.category && (
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white">
                  {business.category.name}
                </span>
              )}
              {business.verification_status === 'approved' && <Badge type="verified" text="Verified Business" />}
              {business.subscription_plan === 'premium' && <Badge type="featured" text="Gold Partner" />}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
              {business.name}
            </h1>
            {business.khmer_name && (
              <p className="text-sm font-khmer text-slate-300">
                {business.khmer_name}
              </p>
            )}
            <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{business.address}</span>
            </p>
          </div>

          {/* Direct CTA on Banner */}
          <button
            onClick={() => handleOpenBooking()}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-sm shadow-xl flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Calendar className="w-4 h-4" /> Book / Inquire Now
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Col: Services, Overview, Gallery, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Promotions Alert */}
          {business.promotions && business.promotions.length > 0 && (
            <div className="space-y-3">
              {business.promotions.map((p) => (
                <div
                  key={p.id}
                  className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white text-red-600 px-2 py-0.5 rounded-md">
                        {p.discount}
                      </span>
                      <h4 className="font-bold text-sm text-white mt-0.5">{p.title}</h4>
                      <p className="text-xs text-red-100">{p.description}</p>
                    </div>
                  </div>
                  {p.promo_code && (
                    <span className="font-mono font-bold text-xs bg-black/20 px-3 py-1.5 rounded-xl text-amber-200">
                      {p.promo_code}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Overview */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-900 font-heading">
              About {business.name}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {business.description}
            </p>
          </div>

          {/* Gallery */}
          {allImages.length > 1 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 font-heading">Photo Gallery</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setLightboxImg(img)}
                    className="relative aspect-square rounded-2xl overflow-hidden group bg-slate-100 border border-slate-200 hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={img}
                      alt={`${business.name} gallery ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Services / Menu Packages */}
          {business.services && business.services.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 font-heading">
                  Experiences & Services Offered
                </h3>
                <span className="text-xs text-slate-400 font-medium">Instant request</span>
              </div>

              <div className="space-y-3">
                {business.services.map((serv) => (
                  <div
                    key={serv.id}
                    className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-5 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900">{serv.name}</h4>
                      <p className="text-xs text-slate-500">{serv.description}</p>
                      <span className="text-[11px] font-semibold text-slate-400 block">
                        Duration: {serv.duration || 'Flexible'}
                      </span>
                    </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                        <span className="font-extrabold text-base text-emerald-700">
                          ${Number(serv.price).toFixed(2)}
                        </span>
                        <Link
                          to={`/checkout/${serv.id}`}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105"
                        >
                          Book Now →
                        </Link>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Reviews */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 font-heading">
                  Reviews & Customer Ratings ({business.reviews?.length || 0})
                </h3>
                <RatingStars rating={business.rating} reviewCount={business.review_count} size="md" />
              </div>
              <button
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <MessageSquarePlus className="w-4 h-4" /> Rate & Review
              </button>
            </div>

            <div className="space-y-4">
              {(!business.reviews || business.reviews.length === 0) ? (
                <p className="text-xs text-slate-400 py-4">No reviews yet. Be the first to review {business.name}!</p>
              ) : (
                business.reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={rev.user} size="sm" />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{rev.user?.name || 'Traveler'}</p>
                          <p className="text-[10px] text-slate-400">Verified Customer</p>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>

                    {/* Business Owner Reply */}
                    {rev.reply && (
                      <div className="bg-white rounded-xl p-3.5 border-l-4 border-emerald-600 text-xs space-y-1">
                        <p className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>Response from {business.name}</span>
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

        {/* Right Col: Contact, Hours & Map Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl space-y-5 sticky top-24">
            
            <h4 className="font-bold text-base text-slate-900 pb-3 border-b border-slate-100">
              Contact & Location
            </h4>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Opening Hours</span>
                  <span className="text-slate-500">{business.opening_hours || 'Open Daily'}</span>
                </div>
              </div>

              {business.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Phone / WhatsApp</span>
                    <a href={`tel:${business.phone}`} className="text-emerald-700 hover:underline font-semibold">
                      {business.phone}
                    </a>
                  </div>
                </div>
              )}

              {business.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Official Website</span>
                    <a href={business.website} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline truncate block max-w-[200px]">
                      {business.website.replace('https://', '')}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Address</span>
                  <span className="text-slate-500">{business.address}</span>
                </div>
              </div>

              {business.location_code && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group relative">
                  <MapPin className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700 font-mono tracking-wider">
                      {business.location_code}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(business.location_code)}
                      className="p-1.5 text-slate-400 hover:text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors relative"
                      title="ចម្លងអាសយដ្ឋាន"
                    >
                      <Copy className="w-4 h-4" />
                      {/* Tooltip */}
                      <span className="absolute -top-8 -translate-x-1/2 left-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        ចម្លងអាសយដ្ឋាន
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => handleOpenBooking()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
              >
                Send Booking Request
              </button>

              {/* Direct Telegram Inquiry Button */}
              <a
                href={business.phone ? `https://t.me/+855${business.phone.replace(/[^0-9]/g, '').replace(/^0/, '')}` : 'https://t.me/sr_techor_support'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat via Telegram (ឆាតផ្ទាល់)</span>
              </a>

              <a
                href={business.map_link || `https://www.google.com/maps/search/?api=1&query=${business.latitude || 13.3601},${business.longitude || 103.8550}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>Get Directions (GPS)</span>
              </a>
            </div>
          </div>
        </div>

      </div>

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
      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
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
