import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { advertisementApi } from '../../api/endpoints';
import {
  Sparkles,
  ExternalLink,
  ChevronRight,
  Building2,
  CheckCircle2,
  Star,
  MapPin,
  Flame,
} from 'lucide-react';

export default function AdBanner({
  placement = 'hero_banner',
  className = '',
  variant = 'wide', // 'wide', 'compact', 'sidebar'
}) {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchAds = async () => {
      try {
        setLoading(true);
        const res = await advertisementApi.getAll({ placement });
        if (isMounted && res.data?.data?.length > 0) {
          setAds(res.data.data);
        }
      } catch (err) {
        // Silently fail if no ads
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAds();
    return () => {
      isMounted = false;
    };
  }, [placement]);

  // Auto rotate if multiple ads exist
  useEffect(() => {
    if (ads.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 8000); // 8 seconds rotation
    return () => clearInterval(timer);
  }, [ads, isHovered]);

  if (loading || ads.length === 0) return null;

  const currentAd = ads[currentIndex] || ads[0];

  const handleClick = (e) => {
    e.preventDefault();
    if (!currentAd) return;

    // Track click asynchronously
    advertisementApi.trackClick(currentAd.id).catch(() => { });

    // Navigate
    const targetUrl = currentAd.link_url || `/businesses/${currentAd.business?.slug || ''}`;
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate(targetUrl);
    }
  };

  // ──────────────────────────────────────────────
  // SIDEBAR VARIANT
  // ──────────────────────────────────────────────
  if (variant === 'sidebar') {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-4 shadow-sm hover:border-amber-400/60 hover:shadow-md hover:shadow-sm transition-all duration-300 cursor-pointer ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>ដៃគូឧបត្ថម្ភ (Sponsored)</span>
          </div>
          {currentAd.business?.rating && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{currentAd.business.rating}</span>
            </div>
          )}
        </div>

        {currentAd.image && (
          <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3.5 shadow-md">
            <img
              src={currentAd.image}
              alt={currentAd.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            {currentAd.business?.name && (
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-1.5 text-xs font-semibold text-white truncate drop-shadow">
                <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{currentAd.business.name}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              </div>
            )}
          </div>
        )}

        <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors font-heading">
          {currentAd.title}
        </h4>

        {/* Carousel dots indicator if multiple ads */}
        {ads.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {ads.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex
                    ? 'w-6 bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <span className="text-amber-400 font-bold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
            មើលព័ត៌មានលម្អិត
            <ChevronRight className="w-4 h-4" />
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // WIDE HERO / SEARCH BANNER VARIANT
  // ──────────────────────────────────────────────
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-xl sm:rounded-xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 shadow-sm hover:shadow-md hover:shadow-sm hover:border-amber-400/70 transition-all duration-300 cursor-pointer p-3.5 sm:p-5 ${className}`}
    >
      {/* Decorative Ambient Background Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-gradient-to-tr from-orange-600/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-3.5 sm:gap-6">

        {/* 1. VISUAL IMAGE PREVIEW (Left Card) */}
        <div className="relative w-full md:w-56 lg:w-64 h-36 sm:h-44 md:h-36 shrink-0 rounded-xl sm:rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:border-amber-400/40 transition-colors">
          <img
            src={currentAd.image}
            alt={currentAd.title}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

          {/* Floating Tag over Image */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[9px] sm:text-[10px] font-extrabold tracking-wide uppercase shadow">
              <Flame className="w-2.5 h-2.5 text-orange-400 fill-orange-400" />
              <span>Special Offer</span>
            </span>
          </div>

          {currentAd.business?.rating && (
            <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold border border-white/10 shadow">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{currentAd.business.rating}</span>
              </span>
            </div>
          )}

          {/* Partner name on mobile/image overlay */}
          {currentAd.business?.name && (
            <div className="absolute bottom-2 left-2 right-2 sm:bottom-2.5 sm:left-2.5 sm:right-2.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-white drop-shadow truncate">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{currentAd.business.address || 'Siem Reap'}</span>
            </div>
          )}
        </div>

        {/* 2. MAIN CONTENT (Center) */}
        <div className="flex-1 space-y-1.5 sm:space-y-2 text-left w-full min-w-0">

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>ដៃគូឧបត្ថម្ភ • SPONSORED</span>
            </span>

            {currentAd.business?.name && (
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-slate-300 font-semibold bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span className="truncate max-w-[160px] sm:max-w-[200px]">{currentAd.business.name}</span>
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
              </span>
            )}
          </div>

          {/* Headline */}
          <h3 className="text-sm sm:text-base md:text-xl font-extrabold text-white tracking-tight leading-snug group-hover:text-amber-300 transition-colors font-heading line-clamp-2">
            {currentAd.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
            {currentAd.business?.short_description || 'Exclusive partner promotion and luxury experience in Siem Reap.'}
          </p>

          {/* Feature Highlights / Tags */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1 text-[10px] sm:text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Verified Partner</span>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-amber-300">
              <span>⚡ កក់ភ្លាមៗបានភ្លាម</span>
            </span>
          </div>
        </div>

        {/* 3. CALL TO ACTION & CAROUSEL (Right) */}
        <div className="flex sm:flex-col md:flex-col items-center md:items-end justify-between sm:justify-center gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">

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
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex
                      ? 'w-6 bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Glowing CTA Button */}
          <button
            type="button"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-xl bg-amber-600 bg-[length:200%_auto] hover:bg-right text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-sm group-hover:shadow-sm group-hover:scale-102 transition-all duration-300 cursor-pointer"
          >
            <span className="font-khmer font-bold">ស្វែងរក ឬកក់ឥឡូវនេះ</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
