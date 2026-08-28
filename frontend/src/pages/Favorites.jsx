import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Compass, Building2, Sparkles, ArrowRight } from 'lucide-react';
import { favoriteApi } from '../api/endpoints';
import DestinationCard from '../components/destination/DestinationCard';
import BusinessCard from '../components/business/BusinessCard';
import SkeletonCard from '../components/common/SkeletonCard';
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
      <div className="pt-24 sm:pt-32 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-sm">
          <Heart className="w-8 h-8 fill-red-500/20" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
          រក្សាទុកកន្លែងដែលអ្នកពេញចិត្ត
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          សូមចូលគណនី (Sign in) ដើម្បីកត់ចំណាំប្រាសាទ សណ្ឋាគារ និងភោជនីយដ្ឋានដែលអ្នកចូលចិត្តសម្រាប់រៀបចំដំណើរកម្សាន្ត។
        </p>
        <div className="pt-2">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-sm hover:scale-102 transition-all"
          >
            <span>ចូលគណនីឥឡូវនេះ (Sign In)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const totalCount = destinations.length + businesses.length;

  return (
    <div className="pt-20 sm:pt-28 pb-28 sm:pb-24 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-red-500" /> បណ្តុំរក្សាទុក (Saved Collection)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
            កន្លែងពេញចិត្ត ({totalCount})
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ប្រាសាទបូរាណ សណ្ឋាគារ និងហាងអាហារដែលអ្នកបានរក្សាទុក
          </p>
        </div>

        {/* Responsive Tabs (3-column grid on mobile) */}
        <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] sm:text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-3 sm:px-4 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ទាំងអស់ ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('destinations')}
            className={`py-2 px-3 sm:px-4 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'destinations' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ប្រាសាទ ({destinations.length})
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`py-2 px-3 sm:px-4 rounded-xl transition-all text-center cursor-pointer ${
              activeTab === 'businesses' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            អាជីវកម្ម ({businesses.length})
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && totalCount === 0 && (
        <div className="bg-white rounded-xl sm:rounded-xl p-8 sm:p-16 text-center border border-slate-100 max-w-lg mx-auto space-y-3 sm:space-y-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto shadow-xs">
            <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
            អ្នកមិនទាន់បានរក្សាទុកកន្លែងណាមួយនៅឡើយទេ
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            ចុចលើប៊ូតុងបេះដូង ❤️ នៅលើកាតគោលដៅទេសចរណ៍ ឬហាងអាជីវកម្ម ដើម្បីរក្សាទុកក្នុងបណ្តុំកន្លែងពេញចិត្តរបស់អ្នក។
          </p>
          <div className="pt-2">
            <Link
              to="/destinations"
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-md"
            >
              <Compass className="w-4 h-4" /> ស្វែងរកគោលដៅទេសចរណ៍
            </Link>
          </div>
        </div>
      )}

      {/* Destinations Section */}
      {!loading && (activeTab === 'all' || activeTab === 'destinations') && destinations.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2 font-heading">
            <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <span>គោលដៅទេសចរណ៍ ({destinations.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {destinations.map((d) => (
              <DestinationCard key={`fav-dest-${d.id}`} destination={d} />
            ))}
          </div>
        </div>
      )}

      {/* Businesses Section */}
      {!loading && (activeTab === 'all' || activeTab === 'businesses') && businesses.length > 0 && (
        <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2 font-heading">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
            <span>អាជីវកម្ម និងសេវាកម្មក្នុងស្រុក ({businesses.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {businesses.map((b) => (
              <BusinessCard key={`fav-biz-${b.id}`} business={b} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
