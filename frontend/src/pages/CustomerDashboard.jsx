import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { userService } from '../services';
import DestinationCard from '../components/destination/DestinationCard';
import EmptyState from '../components/common/EmptyState';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getDashboardSummary()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Welcome Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white p-8 sm:p-10 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-orange-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" /> Customer Travel Hub
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-heading">
                Good day, {firstName}! 👋
              </h1>
              <p className="text-sm text-slate-300 max-w-xl">
                Ready to explore Siem Reap? Plan itineraries, manage your reservations, and uncover hidden temple treasures.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/my-trips"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" /> Create New Trip
              </Link>
              <Link
                to="/explore"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 backdrop-blur-md transition-all"
              >
                <Compass className="w-4 h-4" /> Explore Destinations
              </Link>
            </div>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <Link
            to="/favorites"
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Places</span>
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5 fill-current" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-heading">
              {stats.saved_count}
            </p>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
              View wishlist <ChevronRight className="w-3 h-3 text-rose-500" />
            </span>
          </Link>

          <Link
            to="/my-trips"
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Trips</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-heading">
              {stats.trips_count}
            </p>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
              Manage plans <ChevronRight className="w-3 h-3 text-amber-600" />
            </span>
          </Link>

          <Link
            to="/bookings"
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bookings</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-heading">
              {stats.bookings_count}
            </p>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
              Active reservations <ChevronRight className="w-3 h-3 text-blue-500" />
            </span>
          </Link>

          <Link
            to="/my-reviews"
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Reviews</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-5 h-5 fill-current" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-heading">
              {stats.reviews_count}
            </p>
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
              Shared insights <ChevronRight className="w-3 h-3 text-emerald-600" />
            </span>
          </Link>

        </div>

        {/* 2-Column Split: Upcoming Trip & Upcoming Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upcoming Trip Widget */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-slate-900 text-base">Upcoming Trip Itinerary</h2>
              </div>
              <Link to="/my-trips" className="text-xs font-bold text-orange-600 hover:underline">
                View All Trips
              </Link>
            </div>

            {upcomingTrips.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-500">You don't have any upcoming trips planned yet.</p>
                <Link
                  to="/my-trips"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 text-orange-600 font-bold text-xs hover:bg-orange-100"
                >
                  <Plus className="w-3.5 h-3.5" /> Start Planning a Trip
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-sm text-slate-900">{trip.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'Dates flexible'}</span>
                        <span>•</span>
                        <span>{trip.items?.length || 0} stops planned</span>
                      </p>
                    </div>
                    <Link
                      to={`/trips/${trip.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Bookings Widget */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-slate-900 text-base">Recent Bookings</h2>
              </div>
              <Link to="/bookings" className="text-xs font-bold text-blue-600 hover:underline">
                View All Bookings
              </Link>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-slate-500">No active hotel or tour bookings found.</p>
                <Link
                  to="/businesses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100"
                >
                  <Compass className="w-3.5 h-3.5" /> Book a Stay or Tour
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">{b.business?.name}</h4>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {b.booking_date} {b.booking_time ? `at ${b.booking_time}` : ''} • {b.guests} Guests • Ref: #{b.booking_reference}
                      </p>
                    </div>
                    <Link
                      to={`/bookings/${b.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors shadow-sm"
                    >
                      Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Recommended for You Section */}
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">Personalized Insights</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                  Recommended For You
                </h2>
              </div>
              <Link to="/destinations" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
                Explore More <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((d) => (
                <DestinationCard key={d.id} destination={d} />
              ))}
            </div>
          </div>
        )}

        {/* Promotions Carousel / Section */}
        {promotions.length > 0 && (
          <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-200">Exclusive Travel Deals</span>
                <h2 className="text-2xl font-extrabold font-heading">Special Promotions for You</h2>
              </div>
              <Link
                to="/promotions"
                className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold backdrop-blur-md transition-all"
              >
                View All Deals
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promotions.map((p) => (
                <div key={p.id} className="bg-white text-slate-900 rounded-2xl p-4 shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                      {p.discount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Valid till {p.end_date}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1">{p.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{p.description || `Special offer by ${p.business?.name}`}</p>
                  <p className="text-[11px] font-bold text-orange-600">{p.business?.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
