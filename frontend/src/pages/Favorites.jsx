import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, Building2, Trash2, ArrowRight } from 'lucide-react';
import { favoriteApi } from '../api/endpoints';
import DestinationCard from '../components/destination/DestinationCard';
import BusinessCard from '../components/business/BusinessCard';
import { useAuthStore } from '../store/useAuthStore';

export default function Favorites() {
  const { isAuthenticated } = useAuthStore();
  const [destinations, setDestinations] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'destinations', 'businesses'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      favoriteApi.getAll()
        .then((res) => {
          setDestinations(res.data.destinations || []);
          setBusinesses(res.data.businesses || []);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Save Your Favorite Places</h2>
        <p className="text-xs text-slate-500">
          Sign in or create an account to bookmark destinations, hotels, and restaurants to plan your trip.
        </p>
        <Link
          to="/login"
          className="inline-block px-8 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md hover:bg-orange-600 transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const totalCount = destinations.length + businesses.length;

  return (
    <div className="pt-20 sm:pt-28 pb-20 sm:pb-24 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
            <Heart className="w-4 h-4 fill-red-500" /> Saved Collection
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading mt-1">
            My Favorites ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your saved destinations, boutique stays, and Khmer dining spots
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'destinations' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Destinations ({destinations.length})
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === 'businesses' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Businesses ({businesses.length})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {totalCount === 0 && !loading && (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">You haven't saved any places yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the ❤️ heart button on any destination or business card to keep it in your saved places collection.
          </p>
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-md"
          >
            <Compass className="w-4 h-4" /> Explore Destinations
          </Link>
        </div>
      )}

      {/* Destinations Grid */}
      {(activeTab === 'all' || activeTab === 'destinations') && destinations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-orange-500" />
            <span>Destinations ({destinations.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((d) => (
              <DestinationCard key={`fav-dest-${d.id}`} destination={d} />
            ))}
          </div>
        </div>
      )}

      {/* Businesses Grid */}
      {(activeTab === 'all' || activeTab === 'businesses') && businesses.length > 0 && (
        <div className="space-y-4 pt-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <span>Local Businesses ({businesses.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((b) => (
              <BusinessCard key={`fav-biz-${b.id}`} business={b} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
