import React, { useState } from 'react';
import angkorwatBg from '../assets/angkorwat.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  MapPin, 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Calendar, 
  Star, 
  Tag, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Award,
  Shield,
  Layers,
  Navigation
} from 'lucide-react';
import { categoryApi, destinationApi, businessApi, promotionApi, systemApi } from '../api/endpoints';
import DestinationCard from '../components/destination/DestinationCard';
import BusinessCard from '../components/business/BusinessCard';
import SkeletonCard from '../components/common/SkeletonCard';
import Badge from '../components/common/Badge';
import CustomSelect from '../components/common/CustomSelect';
import AITripPlannerModal from '../components/common/AITripPlannerModal';
import EmergencyWeatherWidget from '../components/common/EmergencyWeatherWidget';
import AdBanner from '../components/ads/AdBanner';
import TouristToolsHub from '../components/tourist/TouristToolsHub';
import { getFullImageUrl } from '../utils/imageUrl';

export default function Home({ onOpenSearch }) {
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);
  const [searchDestination, setSearchDestination] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceType, setPriceType] = useState('');
  const [minRating, setMinRating] = useState('');
  const navigate = useNavigate();

  // ── All Home data with TanStack Query (Instant 0ms cached display & smooth background sync) ──
  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then(r => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });
  const { data: popularRaw, isLoading: loadingPopular } = useQuery({
    queryKey: ['destinations', { per_page: 4, sort: 'popular' }],
    queryFn: () => destinationApi.getAll({ per_page: 4, sort: 'popular' }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });
  const { data: gemsRaw } = useQuery({
    queryKey: ['destinations', { hidden_gems: true, per_page: 4 }],
    queryFn: () => destinationApi.getAll({ hidden_gems: true, per_page: 4 }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });
  const { data: bizRaw } = useQuery({
    queryKey: ['businesses', { per_page: 4, featured: true }],
    queryFn: () => businessApi.getAll({ per_page: 4, featured: true }).then(r => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });
  const { data: promoRaw } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => promotionApi.getAll().then(r => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });
  const getCachedSettings = () => {
    try {
      const stored = localStorage.getItem('system_settings');
      return stored ? JSON.parse(stored) : undefined;
    } catch {
      return undefined;
    }
  };

  const { data: systemRaw } = useQuery({
    queryKey: ['settings'],
    queryFn: () => systemApi.getSettings().then(r => {
      try { localStorage.setItem('system_settings', JSON.stringify(r.data)); } catch {}
      return r.data;
    }),
    initialData: getCachedSettings(),
    staleTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
    refetchOnMount: true,
  });

  // Normalize data safely
  const categories = Array.isArray(categoriesRaw) ? categoriesRaw : (Array.isArray(categoriesRaw?.data) ? categoriesRaw.data : []);
  const popularDestinations = Array.isArray(popularRaw?.data) ? popularRaw.data : (Array.isArray(popularRaw) ? popularRaw : []);
  const hiddenGems = Array.isArray(gemsRaw?.data) ? gemsRaw.data : (Array.isArray(gemsRaw) ? gemsRaw : []);
  const featuredBusinesses = Array.isArray(bizRaw?.data) ? bizRaw.data : (Array.isArray(bizRaw) ? bizRaw : []);
  const promotions = Array.isArray(promoRaw?.data) ? promoRaw.data : (Array.isArray(promoRaw?.promotions) ? promoRaw.promotions : (Array.isArray(promoRaw) ? promoRaw : []));
  const settings = systemRaw || {};
  // Only true loading = first load with no cached data
  const loading = loadingPopular && !popularRaw;

  // Calculate actual totals for display from categories
  const totalDestinations = categories.reduce((sum, cat) => sum + (cat.destinations_count || 0), 0) || 50;
  const totalBusinesses = categories.reduce((sum, cat) => sum + (cat.businesses_count || 0), 0) || 120;

  const handleHeroSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchDestination.trim()) params.set('search', searchDestination.trim());
    if (selectedCategory) params.set('category', selectedCategory);
    if (priceType) params.set('price_type', priceType);
    if (minRating) params.set('min_rating', minRating);

    navigate(`/destinations?${params.toString()}`);
  };

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 pb-16 sm:pb-20">
      
      {/* 1. HERO SECTION WITH CINEMATIC BANNER */}
      <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center pt-24 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-slate-900">
        
        {/* Background Banner Image with Clean Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={settings.site_banner ? getFullImageUrl(settings.site_banner, angkorwatBg) : angkorwatBg}
            alt="Hero Background — Angkor Wat Sunrise, Siem Reap"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = angkorwatBg;
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 mt-8">
          
          {/* Welcome Pill Badge */}
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/20 text-white/90 text-[10px] sm:text-xs uppercase tracking-widest backdrop-blur-md">
            <span>Welcome to Siem Reap</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-tight">
            Explore tourist destinations and local cultural sites <br className="hidden sm:block" />
            <span className="font-light text-white/90">
             in Siem Reap
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            {settings.site_tagline || 'Explore ancient temple wonders, boutique garden retreats, organic Khmer dining, and unforgettable local experiences.'}
          </p>

          {/* Simple Integrated Search Bar */}
          <div className="max-w-3xl mx-auto pt-4 sm:pt-6">
            <form
              onSubmit={handleHeroSearch}
              className="relative z-20 bg-white rounded-2xl sm:rounded-full p-2 shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/20"
            >
              {/* Destination Search */}
              <div className="flex-1 flex items-center px-4 py-2 sm:py-0 w-full border-b sm:border-b-0 sm:border-r border-slate-100">
                <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="Where to explore?"
                  className="w-full text-sm font-medium text-slate-900 placeholder-slate-400 bg-transparent focus:outline-none"
                />
              </div>

              {/* Category Dropdown */}
              <div className="w-full sm:w-auto px-4 py-2 sm:py-0">
                <CustomSelect
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="All Categories"
                  triggerClassName="text-slate-600 bg-transparent font-medium text-sm w-full sm:w-40 border-0 p-0"
                  iconClassName="text-slate-400"
                  options={categories.map((cat) => ({
                    value: cat.slug,
                    label: cat.name
                  }))}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white rounded-xl sm:rounded-full flex items-center justify-center gap-2 font-bold text-sm transition-colors py-3 px-8 shadow-md cursor-pointer active:scale-95 shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Links / Trending */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">Trending:</span>
            <Link to="/destinations?search=Angkor Wat" className="text-xs sm:text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 transition-all">Angkor Wat</Link>
            <span className="text-white/20">•</span>
            <Link to="/destinations?search=Ta Prohm" className="text-xs sm:text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 transition-all">Ta Prohm</Link>
            <span className="text-white/20">•</span>
            <Link to="/businesses?search=Khmer" className="text-xs sm:text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 transition-all">Khmer Dining</Link>
          </div>
        </div>
      </section>

      {/* 2. SIEM REAP SPONSORED HIGHLIGHTS & LIVE SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Sponsored Hero Banner Ad Placement - Shown Immediately (Displays all active ads) */}
        <AdBanner placement="all" className="my-1 sm:my-2" />

        {/* Side-by-Side: Weather/Emergency & AI Trip Planner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          
          {/* Weather & Emergency Widget */}
          <div className="flex h-full">
            <EmergencyWeatherWidget className="w-full h-full" />
          </div>

          {/* AI Trip Planner Callout Banner — SaaS Card */}
          <div className="relative rounded-[1.5rem] overflow-hidden bg-white text-slate-900 p-5 sm:p-6 lg:p-7 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-xs h-full">
            <div className="space-y-1.5 sm:space-y-2 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart AI Travel Assistant</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading leading-tight">
                Don't know where to start? Let AI Plan Your Siem Reap Trip!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Choose your travel duration, budget, and interests, and let AI generate a customized hour-by-hour itinerary in seconds!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAiPlannerOpen(true)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs active:scale-95"
            >
              <span>Plan Trip with AI</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
          
        </div>



      </section>

      {/* 3. EXPLORE BY CATEGORIES */}
      {/* 3. EXPLORE BY CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-4 sm:mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 mb-0.5 sm:mb-1">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Tailored Experiences
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
              Explore Categories
            </h2>
          </div>
          <Link
            to="/destinations"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 sm:gap-1 group shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/destinations?category=${category.slug}`}
              className="group relative rounded-xl sm:rounded-xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-xs hover:shadow-sm transition-all duration-300 card-hover-effect"
            >
              <img
                src={getFullImageUrl(category.image, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80')}
                alt={category.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-75 group-hover:opacity-60"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 text-white">
                <h3 className="font-bold text-xs sm:text-base leading-tight group-hover:text-amber-300 transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-[9px] sm:text-[10px] text-slate-300 mt-0.5">
                  {(category.destinations_count || 0) + (category.businesses_count || 0)} Places
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. POPULAR DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-4 sm:mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 mb-0.5 sm:mb-1">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> World-Class Wonders
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
              Destinations Tourism
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">
              Iconic UNESCO archaeological sites, ancient city gates, and sacred waterways
            </p>
          </div>
          <Link
            to="/destinations"
            className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5 sm:gap-1 group shrink-0"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : popularDestinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} onRequireAuth={onOpenSearch} />
              ))}
        </div>
      </section>

      {/* 5. CURRENT PROMOTIONS & SPECIAL OFFERS BANNER — SaaS Style */}
      {promotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-2xl p-5 sm:p-8 lg:p-10 text-white border border-slate-800 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 sm:mb-2">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Limited-Time Deals
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-heading leading-tight">
                Special Offers & Weekend Promotions
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Exclusive discounts offered by verified boutique hotels, restaurants, and guided tour operators.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 mt-4 sm:mt-6">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-slate-800/80 rounded-xl p-4 sm:p-5 border border-slate-700 flex flex-col justify-between hover:border-slate-600 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-rose-600 text-white">
                          {promo.discount}
                        </span>
                        {promo.promo_code && (
                          <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-700 text-amber-300 border border-slate-600">
                            Code: {promo.promo_code}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm sm:text-base text-white mt-1">
                        {promo.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1.5 line-clamp-2">
                        {promo.description}
                      </p>
                      {promo.business && (
                        <p className="text-xs text-slate-400 font-medium mt-2">
                          at <span className="text-white font-semibold">{promo.business.name}</span>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-slate-700 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[10px] sm:text-[11px]">
                        Valid till {promo.end_date}
                      </span>
                      {promo.business && (
                        <Link
                          to={`/businesses/${promo.business.slug}`}
                          className="font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 text-xs"
                        >
                          Claim Offer →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </section>
      )}


      {/* 6. FEATURED LOCAL BUSINESSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-3 mb-4 sm:mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600 mb-0.5 sm:mb-1">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Local Economy & Hospitality
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
              Businesses
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1 hidden sm:block">
              Verified boutique hotels, authentic Khmer culinary gems, and licensed services
            </p>
          </div>
          <Link
            to="/businesses"
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 sm:gap-1 group shrink-0"
          >
            <span>Explore All</span>
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : featuredBusinesses.map((biz) => (
                <BusinessCard key={biz.id} business={biz} onRequireAuth={onOpenSearch} />
              ))}
        </div>
      </section>

      {/* 7. HIDDEN GEMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-3 mb-4 sm:mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 mb-0.5 sm:mb-1">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Off The Beaten Path
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
                Hidden Gems in Siem Reap
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 sm:mt-1 hidden sm:block">
                Untouched jungle ruins, sacred riverbed carvings, and tranquil floating settlements away from crowds
              </p>
            </div>
            <Link
              to="/destinations?hidden_gems=true"
              className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 sm:gap-1 group shrink-0"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : hiddenGems.map((gem) => (
                  <DestinationCard key={gem.id} destination={gem} onRequireAuth={onOpenSearch} />
                ))}
          </div>
        </div>
      </section>

      {/* 8. INTERACTIVE MAP TEASER (Luxury Glassmorphic Redesign) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-6 sm:p-10 lg:p-12 border border-slate-800/80 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-12">
          
          {/* Ambient Background Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Left Content Column */}
          <div className="relative z-10 space-y-4 sm:space-y-5 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Digital Interactive Map</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading leading-tight tracking-tight text-white">
                Search for tourist destinations on an interactive map
              </h2>
              <span className="block text-xs sm:text-sm font-semibold text-slate-400">
                Interactive Spatial Map & Live GPS Route Explorer
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Discover ancient temples, boutique hotels, cafes, and boat piers with live distance calculation and clear navigation directions.
            </p>

            {/* Feature Highlights Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 shadow-2xs">
                50+ Tourist Locations
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 shadow-2xs">
                Distance & Route Calculation
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5 shadow-2xs">
                Instant Search
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                to="/map"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs transition-all duration-300 shadow-lg shadow-orange-600/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Discover Siem Reap on Interactive Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setAiPlannerOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-colors cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Create a Travel Plan with AI</span>
              </button>
            </div>
          </div>

          {/* Right Interactive Map Visual Mockup */}
          <div className="relative z-10 w-full lg:w-[420px] aspect-[4/3] sm:aspect-[16/10] lg:aspect-square rounded-2xl overflow-hidden border border-white/15 shadow-2xl shrink-0 group">
            
            {/* Background Satellite Map Visual */}
            <img
              src={angkorwatBg}
              alt="Angkor Wat Sunrise — Siem Reap Interactive Map"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/50 pointer-events-none" />

            {/* 2. Interactive Pin 1 (Angkor Wat) */}
            <div className="absolute top-[35%] left-[25%] flex items-center gap-1.5 animate-bounce">
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-orange-600/30">
                <MapPin className="w-4 h-4 fill-current" />
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md border border-orange-500/40 text-white text-[10px] font-bold shadow-md whitespace-nowrap">
                Angkor Wat Temple
              </div>
            </div>


            {/* 4. Bottom Floating Live Route Badge */}
                    <div className="absolute bottom-3.5 left-3.5 right-3.5 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/15 text-white flex items-center justify-between shadow-xl pointer-events-none">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold text-white truncate">50+ Siem Reap Locations</p>
                  <p className="text-[9px] text-slate-400">Short distance & real time</p>
                </div>
              </div>
              <Link
                to="/map"
                className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-[10px] font-bold hover:bg-orange-700 transition-colors pointer-events-auto shrink-0 shadow-xs"
              >
                View Map
              </Link>
            </div>

          </div>
 
        </div>

        {/* Tourist Smart Tools Hub */}
        <div id="tourist-tools" className="pt-2">
          <TouristToolsHub />
        </div>
        
      </section>

      {/* 9. WHY CHOOSE TES CHOR (Premium Bento Cards Redesign) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>Why Choose Tes Chor?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 font-heading leading-tight">
            Built for <span className="text-orange-600">Travelers</span> &{' '}
            <span className="text-emerald-600">Local Businesses</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 sm:mt-3 leading-relaxed">
            100% Local-First Tourism Platform — From Angkor Wat to Tonle Sap
          </p>
        </div>

        {/* Bento Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

          {/* Card 1: Curated Local Insights */}
          <div className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-200 group-hover:scale-110 transition-transform duration-300">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mb-1">Curated Local Insights</h3>
                <p className="text-xs text-slate-400 font-semibold mb-2">The Best of Siem Reap</p>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Explore the temples, sunrise spots, and the best times to visit for a magical journey.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-orange-600 text-xs font-bold pt-1">
                <span className="text-xl font-black">{totalDestinations}</span>
                <span> Destinations</span>
              </div>
            </div>
          </div>

          {/* Card 2: Verified Partners — HIGHLIGHTED CENTER */}
          <div className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-700/60 shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-900/30 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold mb-2">
                  <CheckCircle2 className="w-3 h-3" /> Verified Local Partners
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white mb-1">Trusted Local Partners</h3>
                <p className="text-xs text-slate-400 font-semibold mb-2">Verified Local Partners</p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Hotels, restaurants, and guides — all thoroughly verified for quality.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="text-center">
                  <p className="text-xl font-black text-white">{totalBusinesses}</p>
                  <p className="text-[10px] text-slate-400">Local Partners</p>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <p className="text-xl font-black text-emerald-400">100%</p>
                  <p className="text-[10px] text-slate-400">KYC Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Smart Trip Planner */}
          <div className="group relative bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-200 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mb-1">AI-Powered Trip Planning</h3>
                <p className="text-xs text-slate-400 font-semibold mb-2">Smart AI Trip Planner</p>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Generate 2-7 day itineraries automatically with AI — customizable by interest, budget, and trip type.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold pt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Powered Planning</span>
                <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-extrabold border border-amber-200">ថ្មី!</span>
              </div>
            </div>
          </div>

        </div>



      </section>

      {/* AI Trip Planner Modal Dialog */}
      <AITripPlannerModal
        isOpen={aiPlannerOpen}
        onClose={() => setAiPlannerOpen(false)}
      />

    </div>
  );
}
