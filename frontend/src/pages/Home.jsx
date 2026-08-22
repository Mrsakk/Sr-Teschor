import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Layers
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
  const [categories, setCategories] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [hiddenGems, setHiddenGems] = useState([]);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);

  // Search Bar Form state
  const [searchDestination, setSearchDestination] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceType, setPriceType] = useState('');
  const [minRating, setMinRating] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes, destsRes, gemsRes, bizRes, promoRes, systemRes] = await Promise.allSettled([
          categoryApi.getAll(),
          destinationApi.getAll({ per_page: 4, sort: 'popular' }),
          destinationApi.getAll({ hidden_gems: true, per_page: 4 }),
          businessApi.getAll({ per_page: 4, featured: true }),
          promotionApi.getAll(),
          systemApi.getSettings(),
        ]);

        if (!isMounted) return;

        if (catsRes.status === 'fulfilled') {
          const raw = catsRes.value?.data;
          setCategories(Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []));
        }
        if (destsRes.status === 'fulfilled') {
          const raw = destsRes.value?.data;
          setPopularDestinations(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
        }
        if (gemsRes.status === 'fulfilled') {
          const raw = gemsRes.value?.data;
          setHiddenGems(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
        }
        if (bizRes.status === 'fulfilled') {
          const raw = bizRes.value?.data;
          setFeaturedBusinesses(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []));
        }
        if (promoRes.status === 'fulfilled') {
          const raw = promoRes.value?.data;
          setPromotions(Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.promotions) ? raw.promotions : (Array.isArray(raw) ? raw : [])));
        }
        if (systemRes.status === 'fulfilled') {
          setSettings(systemRes.value?.data || {});
        }
      } catch (err) {
        console.error('Home load error', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

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
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[82vh] sm:min-h-[90vh] flex items-center justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Background Image with Dark & Golden Overlays */}
        <div className="absolute inset-0 z-0 bg-slate-950">
          <img
            src={getFullImageUrl(settings.site_banner, "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&auto=format&fit=crop&q=85")}
            alt="Hero Background"
            className="w-full h-full object-cover scale-105 animate-pulse duration-10000"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&auto=format&fit=crop&q=85";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-black/40" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-4 sm:space-y-6">
          
          {/* Welcome Tag */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-300 text-[11px] sm:text-sm font-bold shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Discover Siem Reap, Cambodia</span>
            <span className="text-white/40">•</span>
            <span className="text-white font-khmer">ស្វាគមន៍មកកាន់សៀមរាប</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight font-heading leading-tight drop-shadow-md">
            Discover Siem Reap <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200">
              Your Way
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-base lg:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-sm px-2">
            {settings.site_tagline || 'Explore ancient temple wonders, boutique garden retreats, organic Khmer dining, and unforgettable local experiences.'}
          </p>

          {/* Large Integrated Search Bar */}
          <div className="max-w-4xl mx-auto pt-2 sm:pt-4">
            <form
              onSubmit={handleHeroSearch}
              className="relative z-50 bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-2.5 sm:p-4 shadow-2xl border border-white/40 text-left grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 items-center"
            >
              {/* Destination Search */}
              <div className="lg:col-span-2 px-2.5 sm:px-3 py-1 border-b sm:border-b-0 sm:border-r border-slate-200">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Where to explore?
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <Search className="w-4 h-4 text-orange-500 shrink-0" />
                  <input
                    type="text"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    placeholder="Angkor Wat, Haven, Cafés..."
                    className="w-full text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="px-2.5 sm:px-3 py-1 border-b sm:border-b-0 sm:border-r border-slate-200">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Category
                </label>
                <CustomSelect
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  placeholder="All Categories"
                  options={categories.map((cat) => ({
                    value: cat.slug,
                    label: cat.name
                  }))}
                />
              </div>

              {/* Price / Entry fee Filter */}
              <div className="px-2.5 sm:px-3 py-1 border-b sm:border-b-0 sm:border-r border-slate-200">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Admission
                </label>
                <CustomSelect
                  value={priceType}
                  onChange={setPriceType}
                  placeholder="Any Price"
                  options={[
                    { value: 'free', label: 'Free Entry' },
                    { value: 'paid', label: 'Ticketed' }
                  ]}
                />
              </div>

              {/* Submit CTA Button */}
              <div className="lg:col-span-1 pt-1 sm:pt-0">
                <button
                  type="submit"
                  className="w-full py-3 sm:py-3.5 px-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
                >
                  <span>Explore Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-[11px] sm:text-xs text-white/90">
              <span className="text-white/60 text-[10px] sm:text-[11px] font-medium">Trending:</span>
              <Link to="/destinations/angkor-wat" className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-colors">
                Angkor Wat Sunrise
              </Link>
              <Link to="/destinations/ta-prohm" className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-colors">
                Ta Prohm
              </Link>
              <Link to="/businesses?category=restaurants-dining" className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-colors">
                Fish Amok Dining
              </Link>
              <Link to="/map" className="px-2.5 py-1 rounded-full bg-orange-500/80 hover:bg-orange-500 text-white font-bold backdrop-blur-md transition-colors flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Live Map
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SIEM REAP LIVE WEATHER & EMERGENCY HUB + AI PLANNER HERO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Weather & Emergency Widget */}
        <EmergencyWeatherWidget />

        {/* Sponsored Hero Banner Ad Placement */}
        <AdBanner placement="hero_banner" className="my-1 sm:my-2" />

        {/* AI Trip Planner Callout Banner */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white p-4.5 sm:p-7 lg:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 border border-orange-400/40">
          <div className="space-y-1.5 sm:space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-[11px] sm:text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart AI Travel Assistant</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white font-heading leading-tight">
              Don't know where to start? Let AI Plan Your Siem Reap Trip!
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 leading-relaxed max-w-2xl">
              Choose your travel duration, budget, and interests, and let AI generate a customized hour-by-hour itinerary in seconds!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAiPlannerOpen(true)}
            className="w-full md:w-auto justify-center px-5 py-3.5 sm:px-6 sm:py-4 rounded-xl sm:rounded-2xl bg-white hover:bg-orange-50 text-orange-700 font-extrabold text-xs sm:text-sm shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 shrink-0 cursor-pointer"
          >
            <span className="text-base sm:text-lg">🤖</span>
            <span>Plan Trip with AI</span>
            <ArrowRight className="w-4 h-4 text-orange-600" />
          </button>
        </div>

        {/* Tourist Smart Tools Hub */}
        <div id="tourist-tools" className="pt-2">
          <TouristToolsHub />
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
              Explore by Category
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
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900 shadow-xs hover:shadow-xl transition-all duration-300 card-hover-effect"
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
              Popular Destinations in Siem Reap
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

      {/* 5. CURRENT PROMOTIONS & SPECIAL OFFERS BANNER */}
      {promotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-orange-950 to-slate-900 rounded-2xl sm:rounded-3xl p-4.5 sm:p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 sm:mb-2">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Limited-Time Deals
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold font-heading leading-tight">
                Special Offers & Weekend Promotions
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Exclusive discounts offered by verified boutique hotels, restaurants, and guided tour operators.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 mt-4 sm:mt-8">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-col justify-between hover:bg-white/15 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] sm:text-xs font-extrabold px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-600 text-white shadow-sm">
                          {promo.discount}
                        </span>
                        {promo.promo_code && (
                          <span className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/20 text-amber-200">
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
                        <p className="text-xs text-amber-300 font-semibold mt-2.5">
                          at {promo.business.name}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-white/10 flex items-center justify-between text-xs">
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
              Featured Hotels, Cafés & Local Businesses
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
        <div className="bg-purple-950/20 border border-purple-200/50 rounded-2xl sm:rounded-3xl p-4.5 sm:p-8 lg:p-10">
          <div className="flex items-end justify-between gap-3 mb-4 sm:mb-8">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-purple-700 mb-0.5 sm:mb-1">
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
              className="text-xs sm:text-sm font-bold text-purple-700 hover:text-purple-900 flex items-center gap-0.5 sm:gap-1 group shrink-0"
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

      {/* 8. INTERACTIVE MAP TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 text-white p-5 sm:p-10 lg:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-3 sm:space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 text-[11px] sm:text-xs font-bold border border-orange-500/30">
              <MapPin className="w-3.5 h-3.5" /> Interactive Spatial Discovery
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading leading-tight">
              Explore Siem Reap on an Interactive Map
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pinpoint temples, boutique hotels, coffee roasters, and boat piers with live distance calculation and turn-by-turn directions.
            </p>
            <div className="pt-1 sm:pt-2">
              <Link
                to="/map"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
              >
                <Compass className="w-4 h-4" /> Open Interactive Map
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 aspect-[16/10] sm:aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80"
              alt="Map Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center p-4">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-white mt-2">50+ Pins in Siem Reap</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. WHY CHOOSE TES CHOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-600">
            Why Tes Chor
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1 leading-tight">
            Built for Travelers & Local Businesses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 sm:mt-2">
            The complete B2B2C tourism platform dedicated to authentic Cambodian experiences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm text-center space-y-2.5 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
              <Compass className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Curated Local Insights</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Handpicked heritage destinations, best sunrise angles, and local timing advice for seamless temple tours.
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm text-center space-y-2.5 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Verified Local Partners</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every hotel, restaurant, and tour guide is verified for quality, authentic pricing, and reliable service.
            </p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm text-center space-y-2.5 sm:space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Smart Trip Planner</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Create multi-day itineraries, calculate distances, and send direct booking inquiries in seconds.
            </p>
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
