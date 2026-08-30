import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { advertisementApi } from '../../api/endpoints';
import {
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Building2,
  CheckCircle2,
  Star,
  MapPin,
  Flame,
} from 'lucide-react';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function AdBanner({
  placement = 'all',
  className = '',
  variant = 'wide', // 'wide', 'compact', 'sidebar'
}) {
  const [ads, setAds] = useState(() => {
    try {
      const cached = localStorage.getItem(`ads_${placement}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAllowedPage = 
    location.pathname === '/' ||
    location.pathname.startsWith('/destinations') ||
    location.pathname.startsWith('/my-trips') ||
    location.pathname.startsWith('/businesses') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/customer');

  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        // First try to get ads for the specific placement
        const res = await advertisementApi.getAll({ placement });
        let fetchedAds = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];

        // If no ads for this specific placement, fall back to all active ads
        if (fetchedAds.length === 0 && placement !== 'all') {
          try {
            const fallbackRes = await advertisementApi.getAll({ placement: 'all' });
            fetchedAds = Array.isArray(fallbackRes.data?.data)
              ? fallbackRes.data.data
              : Array.isArray(fallbackRes.data)
              ? fallbackRes.data
              : [];
          } catch {}
        }

        if (isMounted) {
          if (fetchedAds.length > 0) {
            try {
              localStorage.setItem(`ads_${placement}`, JSON.stringify(fetchedAds));
            } catch {}
            setAds(fetchedAds);
          } else {
            setAds([]);
            localStorage.removeItem(`ads_${placement}`);
          }
        }
      } catch (err) {
        if (isMounted && ads.length === 0) {
          setAds([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAds();
    return () => {
      isMounted = false;
    };
  }, [placement]);

  // Auto-scroll / rotate every 3 seconds (3000ms) if multiple ads exist
  useEffect(() => {
    if (ads.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [ads.length, isHovered]);

  // Show only real ads from database
  if (!isAllowedPage || ads.length === 0) return null;

  const currentAd = ads[currentIndex % ads.length] || ads[0];
  if (!currentAd) return null;

  const handleClick = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
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

  const adImage = getFullImageUrl(
    currentAd.image,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80'
  );

  // ──────────────────────────────────────────────
  // SIDEBAR VARIANT
  // ──────────────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-orange-600" />
            <span>Sponsored</span>
          </div>

          <div className="flex items-center gap-2">
            {ads.length > 1 && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                {currentIndex + 1}/{ads.length} (3s)
              </span>
            )}
            {currentAd.business?.rating && (
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{currentAd.business.rating}</span>
              </div>
            )}
          </div>
        </div>

        {adImage && (
          <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3.5 bg-slate-100 border border-slate-200">
            <img
              key={currentAd.id || currentIndex}
              src={adImage}
              alt={currentAd.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out animate-in fade-in"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {currentAd.business?.name && (
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-lg truncate">
                <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{currentAd.business.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
            )}
          </div>
        )}

        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors font-heading">
          {currentAd.title}
        </h4>

        {currentAd.business?.short_description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5">
            {currentAd.business.short_description}
          </p>
        )}

        {/* Carousel Dots if multiple ads */}
        {ads.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-slate-100">
            {ads.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  i === currentIndex ? 'w-5 bg-orange-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between pt-2 text-xs">
          <span className="text-orange-600 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            View More
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // WIDE HERO / SEARCH BANNER VARIANT (Single Card Auto-Scroll)
  // ──────────────────────────────────────────────
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer p-5 sm:p-6 lg:p-7 ${className}`}
    >
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 sm:gap-6">

        {/* 1. VISUAL IMAGE PREVIEW (Left Card) */}
        <div className="relative w-full md:w-56 lg:w-64 h-36 sm:h-44 md:h-36 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 group-hover:border-slate-300 transition-colors">
          <img
            key={currentAd.id || currentIndex}
            src={adImage}
            alt={currentAd.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-all duration-500 ease-out animate-in fade-in"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80';
            }}
          />

          {/* Floating Tag over Image */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-sm text-amber-300 text-[10px] font-bold tracking-wide uppercase shadow-xs">
              <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
              <span>Special Offer</span>
            </span>
          </div>

          {currentAd.business?.rating && (
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-slate-900 text-[11px] font-bold border border-slate-200 shadow-xs">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{currentAd.business.rating}</span>
              </span>
            </div>
          )}

          {/* Partner name on image overlay */}
          {currentAd.business?.name && (
            <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 text-[11px] font-bold text-white bg-slate-900/85 backdrop-blur-sm px-2.5 py-1 rounded-lg truncate shadow-xs">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="truncate">{currentAd.business.address || 'Siem Reap'}</span>
            </div>
          )}

          {/* Prev/Next Quick Controls on Image hover if multiple ads */}
          {ads.length > 1 && (
            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
                }}
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center pointer-events-auto transition-transform active:scale-95 shadow-md cursor-pointer"
                aria-label="Previous Ad"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex((prev) => (prev + 1) % ads.length);
                }}
                className="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center pointer-events-auto transition-transform active:scale-95 shadow-md cursor-pointer"
                aria-label="Next Ad"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* 2. MAIN CONTENT (Center) */}
        <div className="flex-1 space-y-1.5 sm:space-y-2 text-left w-full min-w-0">

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-orange-600" />
              <span>SPONSORED</span>
            </span>

            {ads.length > 1 && (
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                ⚡ 3s Auto-Scroll ({currentIndex + 1}/{ads.length})
              </span>
            )}

            {currentAd.business?.name && (
              <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-semibold bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span className="truncate max-w-[180px] sm:max-w-[220px]">{currentAd.business.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              </span>
            )}
          </div>

          {/* Headline */}
          <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-orange-600 transition-colors font-heading line-clamp-2">
            {currentAd.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
            {currentAd.business?.short_description || 'Exclusive partner promotion and luxury experience in Siem Reap.'}
          </p>

          {/* Feature Highlights / Tags */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Partner</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-orange-700 font-semibold">
              <span>⚡ Book Instantly</span>
            </span>
          </div>
        </div>

        {/* 3. CALL TO ACTION & CAROUSEL (Right) */}
        <div className="flex sm:flex-col md:flex-col items-center md:items-end justify-between sm:justify-center gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">

          {/* Carousel dots indicator if multiple ads */}
          {ads.length > 1 && (
            <div className="flex items-center gap-1.5 md:mb-1">
              {ads.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    i === currentIndex ? 'w-6 bg-orange-600' : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
          >
            <span className="font-khmer font-bold">View More</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
