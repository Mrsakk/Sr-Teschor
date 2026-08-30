import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  Building2, 
  CheckCircle2, 
  Star, 
  MapPin, 
  ExternalLink, 
  Flame, 
  ArrowRight 
} from 'lucide-react';
import { advertisementApi } from '../../api/endpoints';
import { getFullImageUrl } from '../../utils/imageUrl';
import { DEFAULT_REAL_ADS } from '../../data/defaultRealAds';

export default function SponsoredAdPopup() {
  const [ads, setAds] = useState(() => {
    try {
      const cached = localStorage.getItem('popupAdsCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_REAL_ADS;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // 1. Fetch real Ads from Database via API with seamless fallback
  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        const res = await advertisementApi.getAll({ placement: 'all' });
        const fetchedAds = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        if (isMounted) {
          if (fetchedAds.length > 0) {
            try {
              localStorage.setItem('popupAdsCache', JSON.stringify(fetchedAds));
            } catch {}
            setAds(fetchedAds);
          } else {
            setAds(DEFAULT_REAL_ADS);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAds((prev) => (prev.length > 0 ? prev : DEFAULT_REAL_ADS));
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAds();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Show popup on specific allowed pages (Home & Destinations)
  useEffect(() => {
    const isAllowedPage = 
      location.pathname === '/' || 
      location.pathname.startsWith('/destinations');

    if (isAllowedPage && ads.length > 0) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [location.pathname, ads.length]);

  // 3. Auto-scroll / rotate every 3 seconds (3000ms) if multiple ads exist
  useEffect(() => {
    if (!isOpen || ads.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isOpen, ads.length, isHovered]);

  // If no real ads in database or popup is closed, do not render
  if (!isOpen || ads.length === 0) return null;

  const currentAd = ads[currentIndex % ads.length] || ads[0];
  if (!currentAd) return null;

  const handleAction = () => {
    setIsOpen(false);
    if (!currentAd) return;

    if (currentAd.id) {
      advertisementApi.trackClick(currentAd.id).catch(() => {});
    }

    let targetUrl = currentAd.link_url || '';

    // Smart fallback if link_url is missing
    if (!targetUrl || targetUrl === '/test-ad-url' || targetUrl === '#' || targetUrl.trim() === '') {
      if (currentAd.business?.slug) {
        targetUrl = `/businesses/${currentAd.business.slug}`;
      } else {
        targetUrl = '/businesses';
      }
    }

    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      if (!targetUrl.startsWith('/')) {
        targetUrl = `/${targetUrl}`;
      }
      navigate(targetUrl);
    }
  };

  const adImageUrl = getFullImageUrl(
    currentAd.image,
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80'
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-300">
      <div 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full max-w-lg bg-white p-5 sm:p-6 rounded-[2rem] shadow-xl border border-slate-200 flex flex-col my-auto animate-in zoom-in-95 duration-200 space-y-5"
      >
        
        {/* Top Header Bar (Inline) */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Sponsored Highlight</span>
          </div>

          <div className="flex items-center gap-2">
            {/* 3s Auto-scroll Indicator */}
            {ads.length > 1 && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                {currentIndex + 1} / {ads.length}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ad Image Container (Inset and Rounded) */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-50 rounded-2xl overflow-hidden group border border-slate-100 shadow-sm">
          <img
            key={currentAd.id || currentIndex}
            src={adImageUrl}
            alt={currentAd.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 animate-in fade-in"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none opacity-80" />

          {/* Floating Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-orange-700 text-[10px] font-bold uppercase shadow-sm border border-white/50">
              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
              <span>{currentAd.badge || 'Special Offer'}</span>
            </span>
          </div>

          {currentAd.business?.rating && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold border border-white/20 shadow-sm">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{currentAd.business.rating}</span>
              </span>
            </div>
          )}

          {/* Prev/Next Quick Controls */}
          {ads.length > 1 && (
            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
                }}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center pointer-events-auto transition-transform active:scale-95 shadow-md cursor-pointer backdrop-blur-sm"
                aria-label="Previous Ad"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % ads.length);
                }}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center pointer-events-auto transition-transform active:scale-95 shadow-md cursor-pointer backdrop-blur-sm"
                aria-label="Next Ad"
              >
                ›
              </button>
            </div>
          )}

          {/* Business Name overlay on image */}
          {currentAd.business?.name && (
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-1.5 font-bold text-sm truncate">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate drop-shadow-sm">{currentAd.business.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              {currentAd.business.address && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-200 shrink-0 font-medium">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  <span className="drop-shadow-sm">{currentAd.business.address}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="space-y-3 px-1">
          {/* Carousel Dots Indicator */}
          {ads.length > 1 && (
            <div className="flex items-center gap-1.5 justify-start pb-1">
              {ads.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-orange-500'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading leading-snug">
            {currentAd.title}
          </h3>

          <p className="text-sm text-slate-500 leading-relaxed font-medium">
            {currentAd.business?.short_description || 'Exclusive partner promotion and hospitality experience in Siem Reap.'}
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold text-sm transition-colors cursor-pointer"
          >
            Not Now
          </button>

          <button
            type="button"
            onClick={handleAction}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer active:scale-95"
          >
            <span>Explore Offer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
