import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Compass, 
  Heart, 
  Calendar, 
  Star, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Tag, 
  Plus, 
  User, 
  ShieldCheck, 
  Building2,
  ChevronRight,
  TrendingUp,
  Map,
  Package,
  Gift,
  Bot
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { userService } from '../services';
import DestinationCard from '../components/destination/DestinationCard';
import EmptyState from '../components/common/EmptyState';
import AdBanner from '../components/ads/AdBanner';
import UserAvatar from '../components/common/UserAvatar';

export default function CustomerDashboard() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['customer-dashboard'],
    queryFn: () => userService.getDashboardSummary(),
    staleTime: 1000 * 60 * 3,
    placeholderData: prev => prev,
    refetchOnMount: true,
  });

  const loading = isLoading && !data;

  const stats = data?.stats || {
    saved_count: 0,
    trips_count: 0,
    bookings_count: 0,
    reviews_count: 0,
  };

  const upcomingTrips = data?.upcoming_trips || [];
  const upcomingBookings = data?.upcoming_bookings || [];
  const recommendations = data?.recommendations || [];
  const nearbyPlaces = data?.nearby_places || [];
  const promotions = data?.promotions || [];

  const firstName = user?.name ? user.name.split(' ')[0] : 'Traveler';

  return (
    <div className="min-h-screen bg-slate-50/60 pt-24 sm:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* ── 1. WELCOME HEADER PROFILE CARD ── */}
        <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200/90 p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: User Identity & Welcome */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <UserAvatar user={user} size="lg" className="w-16 h-16 sm:w-20 sm:h-20 ring-4 ring-orange-500/10 shadow-sm" />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  <span>Traveler Member Portal</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                  Welcome back, <span className="text-orange-600">{firstName}</span>! 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
                  {user?.email} • Discover sacred Angkor temples, boutique resorts, and tailor-made Cambodian journeys.
                </p>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 lg:self-center shrink-0">
              <Link
                to="/my-trips"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold shadow-sm shadow-orange-500/20 transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Trip</span>
              </Link>
              <Link
                to="/destinations"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-extrabold border border-slate-200 transition-all shadow-xs"
              >
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>Explore Places</span>
              </Link>
            </div>

          </div>
        </div>

        {/* ── 2. KPI SUMMARY METRICS (4 CARDS) ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
          
          <Link
            to="/favorites"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Places</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 mt-2 font-heading">
              {stats.saved_count}
            </p>
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1 group-hover:text-rose-600 transition-colors">
              <span>View wishlist</span> <ChevronRight className="w-3 h-3 text-rose-500" />
            </span>
          </Link>

          <Link
            to="/my-trips"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">My Trips</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 mt-2 font-heading">
              {stats.trips_count}
            </p>
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1 group-hover:text-orange-600 transition-colors">
              <span>Manage plans</span> <ChevronRight className="w-3 h-3 text-orange-600" />
            </span>
          </Link>

          <Link
            to="/bookings"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 mt-2 font-heading">
              {stats.bookings_count}
            </p>
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1 group-hover:text-sky-600 transition-colors">
              <span>Reservations</span> <ChevronRight className="w-3 h-3 text-sky-600" />
            </span>
          </Link>

          <Link
            to="/profile"
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Community Insights</span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 mt-2 font-heading">
              {stats.reviews_count}
            </p>
            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1 group-hover:text-emerald-700 transition-colors">
              <span>Shared reviews</span> <ChevronRight className="w-3 h-3 text-emerald-700" />
            </span>
          </Link>

        </div>

        {/* ── 3. MAIN DASHBOARD CONTENT GRID (2-COLUMN BENTO) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          
          {/* LEFT COLUMN: Travel Plans & Recent Bookings (7 of 12 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            
            {/* Upcoming Trip Widget */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base font-heading">Upcoming Trip Itinerary</h2>
                    <p className="text-[11px] text-slate-400">Your scheduled stops and destinations</p>
                  </div>
                </div>
                <Link to="/my-trips" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  <span>View All</span> <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {upcomingTrips.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">You don't have any upcoming trips planned yet.</p>
                  <Link
                    to="/my-trips"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Start Planning a Trip
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-orange-300 hover:bg-white transition-all flex items-center justify-between gap-4 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                          {trip.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="font-medium text-slate-600">{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'Dates flexible'}</span>
                          <span>•</span>
                          <span className="text-orange-600 font-bold">{trip.items?.length || 0} stops planned</span>
                        </p>
                      </div>
                      <Link
                        to={`/trips/${trip.id}`}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-xs shrink-0"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Bookings Widget */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base font-heading">Recent Bookings & Passes</h2>
                    <p className="text-[11px] text-slate-400">Hotels, guides, transportation & dining</p>
                  </div>
                </div>
                <Link to="/bookings" className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1">
                  <span>View All</span> <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {upcomingBookings.length === 0 ? (
                <div className="py-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-700 flex items-center justify-center mx-auto">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">No active hotel or tour reservations found.</p>
                  <Link
                    to="/businesses"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs shadow-xs transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5" /> Book a Stay or Tour
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-white transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">{b.business?.name}</h4>
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {b.booking_date} {b.booking_time ? `at ${b.booking_time}` : ''} • {b.guests} Guests • Ref: #{b.booking_reference}
                        </p>
                      </div>
                      <Link
                        to={`/bookings`}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-extrabold text-xs hover:bg-sky-50 hover:text-sky-700 hover:border-sky-200 transition-all shadow-xs shrink-0"
                      >
                        Voucher
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Quick Explorer Shortcuts & Sponsored Ads (5 of 12 cols) */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            
            {/* Quick Action Shortcuts */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base font-heading">Quick Travel Tools</h3>
                  <p className="text-[11px] text-slate-400">Interactive tools for your Siem Reap trip</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/map"
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-200/90 hover:border-orange-200 transition-all text-left space-y-1.5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-orange-600 flex items-center justify-center border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
                    <Map className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                    Interactive Map
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">Locate temples & amenities</p>
                </Link>

                <Link
                  to="/packages"
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/90 hover:border-emerald-200 transition-all text-left space-y-1.5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
                    <Package className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Tour Packages
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">All-inclusive guided tours</p>
                </Link>

                <Link
                  to="/promotions"
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/90 hover:border-rose-200 transition-all text-left space-y-1.5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-rose-600 flex items-center justify-center border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
                    <Gift className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
                    Special Offers
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">Discounts & coupons</p>
                </Link>

                <Link
                  to="/favorites"
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200/90 hover:border-purple-200 transition-all text-left space-y-1.5 group"
                >
                  <div className="w-8 h-8 rounded-xl bg-white text-purple-700 flex items-center justify-center border border-slate-200 shadow-xs group-hover:scale-105 transition-transform">
                    <Heart className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                    Saved Places
                  </p>
                  <p className="text-[10px] text-slate-500 leading-tight">Your custom wishlist</p>
                </Link>
              </div>
            </div>

            {/* Sponsored Partner Spotlight (AdBanner) */}
            <AdBanner placement="all" variant="sidebar" className="rounded-3xl shadow-xs" />

          </div>

        </div>

        {/* ── 4. RECOMMENDED FOR YOU (4-COLUMN GRID) ── */}
        {recommendations.length > 0 && (
          <div className="space-y-5 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-orange-600">Tailored For Your Travel Style</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight mt-0.5">
                  Recommended Destinations For You
                </h2>
              </div>
              <Link to="/destinations" className="text-xs font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1">
                <span>Explore All Destinations</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {recommendations.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          </div>
        )}

        {/* ── SPONSORED FULL-WIDTH SHOWCASE BANNER ── */}
        <div className="pt-2">
          <AdBanner placement="all" variant="wide" />
        </div>

        {/* ── 5. EXCLUSIVE TRAVEL DEALS & PROMOTIONS ── */}
        {promotions.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">Special Vouchers & Discounts</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">Exclusive Member Promotions</h2>
              </div>
              <Link
                to="/promotions"
                className="px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-extrabold transition-colors shadow-xs self-start sm:self-auto"
              >
                View All Deals ({promotions.length})
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {promotions.map((p) => (
                <div key={p.id} className="bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all space-y-3 group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-orange-600 text-white shadow-xs">
                      {p.discount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Valid till {p.end_date}</span>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 font-heading group-hover:text-orange-600 transition-colors">
                      {p.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {p.description || `Special offer by ${p.business?.name}`}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 truncate">{p.business?.name}</span>
                    {p.promo_code && (
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-slate-200 text-slate-800 rounded-md">
                        {p.promo_code}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
