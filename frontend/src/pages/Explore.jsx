import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Compass, 
  Building2, 
  Star, 
  Sparkles, 
  SlidersHorizontal, 
  X, 
  Grid, 
  Map as MapIcon, 
  Check, 
  Clock, 
  DollarSign, 
  RotateCcw,
  ChevronDown
} from 'lucide-react';
import { destinationService, businessService, destinationService as catService } from '../services';
import DestinationCard from '../components/destination/DestinationCard';
import BusinessCard from '../components/business/BusinessCard';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Map Marker Icons
const createPinIcon = (color) => L.divIcon({
  html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
  </div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const templePin = createPinIcon('#ea580c');
const businessPin = createPinIcon('#2563eb');

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary tab: 'all' | 'destinations' | 'hotels' | 'restaurants' | 'experiences' | 'cafes'
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDistrict, setSelectedDistrict] = useState(searchParams.get('district') || '');
  const [priceFilter, setPriceFilter] = useState(searchParams.get('price') || '');
  const [minRating, setMinRating] = useState(searchParams.get('rating') || '');
  const [openNow, setOpenNow] = useState(searchParams.get('open_now') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recommended');
  
  // View mode: 'grid' | 'map'
  const [viewMode, setViewMode] = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [destinations, setDestinations] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const districts = [
    'Siem Reap City',
    'Banteay Srei',
    'Puok',
    'Angkor Chum',
    'Chi Kraeng',
    'Kralanh',
    'Prasat Bakong',
    'Varin',
    'Soutr Nikom',
  ];

  // Fetch categories on mount
  useEffect(() => {
    catService.getCategories().then((res) => setCategories(res || []));
  }, []);

  // Fetch results based on filters
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        const destParams = {
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          price_type: priceFilter === 'free' ? 'free' : (priceFilter === 'paid' ? 'paid' : undefined),
          min_rating: minRating || undefined,
          sort: sortBy === 'recommended' ? 'popular' : sortBy,
          per_page: 24,
        };

        const bizParams = {
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          per_page: 24,
        };

        const [destRes, bizRes] = await Promise.all([
          destinationService.getAll(destParams),
          businessService.getAll(bizParams),
        ]);

        setDestinations(destRes.data || []);
        setBusinesses(bizRes.data || []);
      } catch (err) {
        console.error('Failed to load explore data', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedDistrict, priceFilter, minRating, sortBy]);

  // Combine items for display
  const filteredDestinations = activeTab === 'all' || activeTab === 'destinations' ? destinations : [];
  const filteredBusinesses = activeTab === 'all' || activeTab !== 'destinations' ? businesses : [];
  const totalCount = filteredDestinations.length + filteredBusinesses.length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedDistrict('');
    setPriceFilter('');
    setMinRating('');
    setOpenNow(false);
    setSortBy('recommended');
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedDistrict || priceFilter || minRating || openNow;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      
      {/* Top Banner & Search Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Siem Reap Discovery Engine
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                  Live Results
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-1">
                Explore Destinations & Local Places
              </h1>
            </div>

            {/* View Mode Toggle & Mobile Filter Button */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
              >
                <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-orange-500" />}
              </button>

              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Grid className="w-4 h-4" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'map'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <MapIcon className="w-4 h-4 text-orange-500" /> Map View
                </button>
              </div>
            </div>
          </div>

          {/* Unified Search Input Bar */}
          <div className="relative max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search attractions, temples, boutique hotels, cafés, tour guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
            {[
              { id: 'all', label: 'All Places' },
              { id: 'destinations', label: 'Attractions & Temples' },
              { id: 'hotels', label: 'Hotels & Homestays' },
              { id: 'restaurants', label: 'Restaurants & Dining' },
              { id: 'cafes', label: 'Cafés & Bakeries' },
              { id: 'experiences', label: 'Tours & Experiences' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Left Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-500" /> Filter Discovery
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Category</label>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      selectedCategory === '' ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        selectedCategory === cat.slug ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* District Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none font-medium"
                >
                  <option value="">All Siem Reap Districts</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Price Tier</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: '', label: 'Any Price' },
                    { id: 'free', label: 'Free ($0)' },
                    { id: 'under5', label: 'Under $5' },
                    { id: 'paid', label: '$5–$20+' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPriceFilter(p.id)}
                      className={`py-1.5 px-2 rounded-xl text-center font-bold border transition-all ${
                        priceFilter === p.id
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Minimum Rating</label>
                <div className="flex items-center gap-1.5 text-xs">
                  {['', '4', '4.5', '5'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRating(r)}
                      className={`flex-1 py-1.5 rounded-xl font-bold border flex items-center justify-center gap-1 transition-all ${
                        minRating === r
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {r === '' ? 'All' : <><Star className="w-3 h-3 fill-current" /> {r}+</>}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Results Column */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Results bar & Sorting */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs font-bold text-slate-600">
                Found <span className="text-slate-900 font-extrabold">{totalCount}</span> places in Siem Reap
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                >
                  <option value="recommended">Recommended</option>
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* View Mode: Map vs Grid */}
            {viewMode === 'map' ? (
              <div className="h-[600px] rounded-xl overflow-hidden border border-slate-200 shadow-lg relative z-0">
                <MapContainer
                  center={[13.3633, 103.8564]}
                  zoom={12}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {filteredDestinations.map((d) => (
                    d.latitude && d.longitude && (
                      <Marker key={`dest-${d.id}`} position={[d.latitude, d.longitude]} icon={templePin}>
                        <Popup>
                          <div className="p-1 space-y-1.5 max-w-[200px]">
                            <img
                              src={d.images?.[0]?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300'}
                              alt={d.name}
                              className="w-full h-24 rounded-lg object-cover"
                            />
                            <p className="font-bold text-xs text-slate-900">{d.name}</p>
                            <p className="text-[10px] text-orange-600 font-semibold">{d.category?.name || 'Attraction'}</p>
                            <Link
                              to={`/destinations/${d.slug}`}
                              className="inline-block w-full py-1 text-center bg-orange-500 text-white rounded text-[10px] font-bold"
                            >
                              View Details
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}

                  {filteredBusinesses.map((b) => (
                    b.latitude && b.longitude && (
                      <Marker key={`biz-${b.id}`} position={[b.latitude, b.longitude]} icon={businessPin}>
                        <Popup>
                          <div className="p-1 space-y-1.5 max-w-[200px]">
                            <img
                              src={b.cover_image || 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=300'}
                              alt={b.name}
                              className="w-full h-24 rounded-lg object-cover"
                            />
                            <p className="font-bold text-xs text-slate-900">{b.name}</p>
                            <p className="text-[10px] text-blue-600 font-semibold">{b.category?.name || 'Business'}</p>
                            <Link
                              to={`/businesses/${b.slug}`}
                              className="inline-block w-full py-1 text-center bg-blue-600 text-white rounded text-[10px] font-bold"
                            >
                              View Business
                            </Link>
                          </div>
                        </Popup>
                      </Marker>
                    )
                  ))}
                </MapContainer>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : totalCount === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-slate-200 shadow-sm text-center">
                <EmptyState
                  icon={Compass}
                  title="No places match your search"
                  description="Try adjusting your keywords, selecting all categories, or resetting the active filters."
                  actionText="Reset All Filters"
                  onAction={handleResetFilters}
                />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Destinations Section */}
                {filteredDestinations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <Compass className="w-5 h-5 text-orange-500" />
                        Attractions & Tourist Destinations
                      </h2>
                      <span className="text-xs font-bold text-slate-400">
                        {filteredDestinations.length} available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDestinations.map((d) => (
                        <DestinationCard key={`dest-${d.id}`} destination={d} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Businesses Section */}
                {filteredBusinesses.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        Hotels, Restaurants & Local Services
                      </h2>
                      <span className="text-xs font-bold text-slate-400">
                        {filteredBusinesses.length} available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBusinesses.map((b) => (
                        <BusinessCard key={`biz-${b.id}`} business={b} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </main>

        </div>
      </div>

    </div>
  );
}
