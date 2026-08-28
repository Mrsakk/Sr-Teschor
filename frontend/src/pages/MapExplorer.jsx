import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Compass, 
  Building2, 
  MapPin, 
  Navigation, 
  Star, 
  Layers, 
  ArrowUpRight, 
  SlidersHorizontal,
  Crosshair,
  Sparkles,
  Search,
  List,
  Map as MapIcon,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { searchApi } from '../api/endpoints';
import RatingStars from '../components/common/RatingStars';
import { getFullImageUrl } from '../utils/imageUrl';

// Custom Map Marker Icons using Leaflet DivIcon
const destinationIcon = new L.DivIcon({
  className: 'custom-dest-pin',
  html: `<div style="background: linear-gradient(135deg, #ea580c, #c2410c); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 14px rgba(234,88,12,0.4);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const businessIcon = new L.DivIcon({
  className: 'custom-biz-pin',
  html: `<div style="background: linear-gradient(135deg, #059669, #047857); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 14px rgba(5,150,105,0.4);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const userLocationIcon = new L.DivIcon({
  className: 'custom-user-pin',
  html: `<div style="background-color: #2563eb; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 0 0 8px rgba(37,99,235,0.25);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path></svg></div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -19],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.2 });
    }
  }, [position, map]);
  return null;
}

// Haversine formula to compute distance in kilometers
function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function MapExplorer() {
  const { data: mapData, isLoading } = useQuery({
    queryKey: ['mapLocations'],
    queryFn: () => searchApi.getMapLocations().then(res => res.data),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const destinations = mapData?.destinations || [];
  const businesses = mapData?.businesses || [];
  const loading = isLoading && !mapData;

  const [filterType, setFilterType] = useState('all'); // 'all', 'destinations', 'businesses'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [mobileView, setMobileView] = useState('map'); // 'map' | 'list'

  // Center coordinate: Siem Reap / Angkor region
  const siemReapCenter = [13.4125, 103.8670];

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userPos = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(userPos);
        setSelectedPlace(userPos);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        // Fallback to Pub Street / Siem Reap center
        const fallbackPos = [13.3547, 103.8549];
        setUserLocation(fallbackPos);
        setSelectedPlace(fallbackPos);
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Enrich with distance attribute
  const enrichedDestinations = destinations.map(d => ({
    ...d,
    itemType: 'destination',
    distance: userLocation ? getDistanceKm(userLocation[0], userLocation[1], Number(d.latitude), Number(d.longitude)) : null
  }));

  const enrichedBusinesses = businesses.map(b => ({
    ...b,
    itemType: 'business',
    distance: userLocation ? getDistanceKm(userLocation[0], userLocation[1], Number(b.latitude), Number(b.longitude)) : null
  }));

  // Apply filters
  let visibleDestinations = filterType === 'businesses' ? [] : enrichedDestinations;
  let visibleBusinesses = filterType === 'destinations' ? [] : enrichedBusinesses;

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    visibleDestinations = visibleDestinations.filter(d => 
      (d.name && d.name.toLowerCase().includes(q)) || 
      (d.khmer_name && d.khmer_name.toLowerCase().includes(q)) ||
      (d.address && d.address.toLowerCase().includes(q))
    );
    visibleBusinesses = visibleBusinesses.filter(b => 
      (b.name && b.name.toLowerCase().includes(q)) || 
      (b.khmer_name && b.khmer_name.toLowerCase().includes(q)) ||
      (b.address && b.address.toLowerCase().includes(q))
    );
  }

  // Sort by nearest if userLocation is enabled
  if (userLocation) {
    visibleDestinations.sort((a, b) => (Number(a.distance) || 999) - (Number(b.distance) || 999));
    visibleBusinesses.sort((a, b) => (Number(a.distance) || 999) - (Number(b.distance) || 999));
  }

  const allVisibleItems = [...visibleDestinations, ...visibleBusinesses];
  const totalVisible = allVisibleItems.length;

  const handleSelectItem = (item) => {
    setActiveItem(item);
    if (item.latitude && item.longitude) {
      setSelectedPlace([Number(item.latitude), Number(item.longitude)]);
    }
    if (mobileView === 'list') {
      setMobileView('map');
    }
  };

  return (
    <div className="pt-14 sm:pt-16 lg:pt-20 pb-16 lg:pb-0 h-[100dvh] flex flex-col overflow-hidden bg-slate-900">
      
      {/* ── TOP CONTROL BAR ── */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2 z-20 shrink-0 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          
          {/* Header Title & Switcher Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold shrink-0">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-xs sm:text-base text-white leading-tight flex items-center gap-1.5 truncate">
                  <span translate="no" className="notranslate truncate">ផែនទីសៀមរាប</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-orange-400 border border-slate-700 shrink-0">
                    {loading ? '...' : totalVisible}
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                  រុករកប្រាសាទបុរាណ រមណីយដ្ឋាន ភោជនីយដ្ឋាន និងសណ្ឋាគារ
                </p>
              </div>
            </div>

            {/* Mobile Map / List View Toggle Switcher */}
            <div className="flex sm:hidden items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setMobileView('map')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                  mobileView === 'map'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3 h-3" />
                <span translate="no" className="notranslate">ផែនទី</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                  mobileView === 'list'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3 h-3" />
                <span translate="no" className="notranslate">បញ្ជី ({loading ? '...' : totalVisible})</span>
              </button>
            </div>
          </div>

          {/* Action Filter Pills Bar (Scrollable on Mobile, Hidden Scrollbar) */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            
            {/* Near Me GPS Button */}
            <button
              type="button"
              onClick={handleLocateMe}
              disabled={locating}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                userLocation
                  ? 'bg-blue-600 text-white shadow-lg shadow-sm ring-1 ring-blue-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Crosshair className={`w-3 h-3 text-blue-400 ${locating ? 'animate-spin' : ''}`} />
              <span translate="no" className="notranslate whitespace-nowrap">
                {locating ? 'ស្វែងរក...' : userLocation ? 'GPS ជិតខ្ញុំ' : 'ទីតាំងជិតខ្ញុំ'}
              </span>
            </button>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs font-semibold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-white text-slate-950 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80'
                }`}
              >
                <span translate="no" className="notranslate">ទាំងអស់ ({loading ? '...' : destinations.length + businesses.length})</span>
              </button>
              
              <button
                onClick={() => setFilterType('destinations')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'destinations'
                    ? 'bg-orange-500 text-white font-bold shadow-md shadow-sm'
                    : 'bg-slate-800 text-orange-400 hover:bg-slate-700/80 border border-orange-500/30'
                }`}
              >
                <Compass className="w-3 h-3" />
                <span translate="no" className="notranslate">គោលដៅ ({loading ? '...' : destinations.length})</span>
              </button>

              <button
                onClick={() => setFilterType('businesses')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'businesses'
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-sm'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700/80 border border-emerald-500/30'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span translate="no" className="notranslate">អាជីវកម្ម ({loading ? '...' : businesses.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN BODY: DESKTOP SPLIT / MOBILE SMART SWITCHER ── */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        
        {/* ── LEFT SIDEBAR (DESKTOP ALWAYS, MOBILE WHEN LIST VIEW ACTIVE) ── */}
        <div 
          className={`w-full md:w-88 lg:w-96 bg-slate-900 border-r border-slate-800 h-full flex flex-col shrink-0 z-10 ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Search Box inside Sidebar */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកឈ្មោះប្រាសាទ ភោជនីយដ្ឋាន..."
                className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400 font-medium">
              <span>{userLocation ? '📍 តម្រៀបតាមចម្ងាយជិតអ្នកបំផុត' : 'ចុចលើទីតាំងដើម្បី Zoom លើផែនទី'}</span>
              <span className="font-mono text-orange-400">{allVisibleItems.length} លទ្ធផល</span>
            </div>
          </div>

          {/* Scrollable Places List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
            {allVisibleItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Compass className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                <p className="text-xs">រកមិនឃើញទីតាំងតាមការស្វែងរកនេះទេ</p>
              </div>
            ) : (
              allVisibleItems.map((item) => {
                const isDest = item.itemType === 'destination';
                const rawImg = isDest
                  ? (item.primary_image?.image || item.images?.[0]?.image)
                  : (item.cover_image || item.logo);
                const imgUrl = getFullImageUrl(
                  rawImg,
                  isDest
                    ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80'
                );

                const isSelected = activeItem?.id === item.id && activeItem?.itemType === item.itemType;

                return (
                  <div
                    key={`${item.itemType}-${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 text-left group ${
                      isSelected
                        ? 'bg-slate-800 border-orange-500 shadow-lg shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                      <img
                        src={imgUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = isDest
                            ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80'
                            : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                      <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase text-white ${
                        isDest ? 'bg-orange-600/90' : 'bg-emerald-600/90'
                      }`}>
                        {isDest ? 'គោលដៅ' : 'អាជីវកម្ម'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-[10px] font-bold uppercase truncate ${
                          isDest ? 'text-orange-400' : 'text-emerald-400'
                        }`}>
                          {item.category?.name || (isDest ? 'ទេសចរណ៍' : 'សេវាកម្ម')}
                        </span>
                        {item.distance && (
                          <span className="text-[10px] font-bold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-1.5 py-0.2 rounded shrink-0">
                            {item.distance} km
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h4>
                      {item.khmer_name && (
                        <p className="text-[10px] font-khmer text-slate-400 truncate">
                          {item.khmer_name}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 mt-0.5 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1 font-semibold text-amber-400">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{item.rating || '4.8'}</span>
                        </div>
                        <span className="text-slate-300 font-medium">
                          {isDest 
                            ? (item.entrance_fee > 0 ? `$${item.entrance_fee}` : 'Free Entry') 
                            : (item.price_range || '$$')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── MAP CONTAINER (DESKTOP ALWAYS, MOBILE WHEN MAP VIEW ACTIVE) ── */}
        <div 
          className={`flex-1 h-full w-full relative ${
            mobileView === 'map' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <MapContainer
            center={siemReapCenter}
            zoom={12}
            scrollWheelZoom={true}
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RecenterMap position={selectedPlace} />

            {/* User GPS Location Marker */}
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="p-2 text-center">
                    <p className="font-bold text-xs text-blue-600">📍 ទីតាំងបច្ចុប្បន្នរបស់អ្នក</p>
                    <p className="text-[10px] text-slate-500">You are here in Siem Reap</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Destination Markers */}
            {visibleDestinations.map((dest) => (
              dest.latitude && dest.longitude ? (
                <Marker
                  key={`marker-dest-${dest.id}`}
                  position={[Number(dest.latitude), Number(dest.longitude)]}
                  icon={destinationIcon}
                  eventHandlers={{
                    click: () => setActiveItem(dest)
                  }}
                >
                  <Popup>
                    <div className="w-60 overflow-hidden rounded-xl bg-white text-slate-900 shadow-sm">
                      <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={getFullImageUrl(dest.primary_image?.image || dest.images?.[0]?.image, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80')}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-orange-600 text-white shadow-sm">
                          {dest.category?.name || 'Destination'}
                        </span>
                        {dest.distance && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-600 text-white shadow-sm">
                            {dest.distance} km
                          </span>
                        )}
                      </div>
                      
                      <div className="p-3 space-y-1.5">
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {dest.name}
                        </h4>
                        {dest.khmer_name && (
                          <p className="text-[11px] font-khmer text-slate-500">
                            {dest.khmer_name}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <RatingStars rating={dest.rating || 5} />
                          <span className="font-bold text-orange-600">
                            {dest.entrance_fee > 0 ? `$${dest.entrance_fee}` : 'Free'}
                          </span>
                        </div>
                        <Link
                          to={`/destinations/${dest.slug}`}
                          className="mt-2 w-full py-2 text-center text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <span>មើលព័ត៌មានលម្អិត</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}

            {/* Business Markers */}
            {visibleBusinesses.map((biz) => (
              biz.latitude && biz.longitude ? (
                <Marker
                  key={`marker-biz-${biz.id}`}
                  position={[Number(biz.latitude), Number(biz.longitude)]}
                  icon={businessIcon}
                  eventHandlers={{
                    click: () => setActiveItem(biz)
                  }}
                >
                  <Popup>
                    <div className="w-60 overflow-hidden rounded-xl bg-white text-slate-900 shadow-sm">
                      <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={getFullImageUrl(biz.cover_image || biz.logo, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80')}
                          alt={biz.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-600 text-white shadow-sm">
                          {biz.category?.name || 'Business'}
                        </span>
                        {biz.distance && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-600 text-white shadow-sm">
                            {biz.distance} km
                          </span>
                        )}
                      </div>

                      <div className="p-3 space-y-1.5">
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {biz.name}
                        </h4>
                        {biz.khmer_name && (
                          <p className="text-[11px] font-khmer text-slate-500">
                            {biz.khmer_name}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                          <RatingStars rating={biz.rating || 5} />
                          <span className="font-bold text-emerald-700">
                            {biz.price_range || '$$'}
                          </span>
                        </div>
                        <Link
                          to={`/businesses/${biz.slug}`}
                          className="mt-2 w-full py-2 text-center text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <span>មើលព័ត៌មានអាជីវកម្ម</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}
          </MapContainer>

          {/* ── MOBILE FLOATING ACTIVE CARD DRAWER ── */}
          {activeItem && (
            <div className="md:hidden absolute bottom-4 inset-x-3 z-30 animate-in slide-in-from-bottom-6 duration-300">
              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl p-3 shadow-md flex items-center gap-3 relative">
                <button
                  onClick={() => setActiveItem(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shadow-md text-xs"
                >
                  ✕
                </button>

                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                  <img
                    src={getFullImageUrl(
                      activeItem.itemType === 'destination'
                        ? (activeItem.primary_image?.image || activeItem.images?.[0]?.image)
                        : (activeItem.cover_image || activeItem.logo),
                      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200'
                    )}
                    alt={activeItem.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`text-[10px] font-bold uppercase ${
                      activeItem.itemType === 'destination' ? 'text-orange-400' : 'text-emerald-400'
                    }`}>
                      {activeItem.category?.name}
                    </span>
                    {activeItem.distance && (
                      <span className="text-[10px] font-bold text-blue-400">
                        {activeItem.distance} km
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-white truncate">
                    {activeItem.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{activeItem.rating || '4.9'}</span>
                    </div>
                    <Link
                      to={activeItem.itemType === 'destination' ? `/destinations/${activeItem.slug}` : `/businesses/${activeItem.slug}`}
                      className="px-2.5 py-1 rounded-lg bg-orange-500 text-white font-bold text-[10px] flex items-center gap-1"
                    >
                      <span>បើកមើល</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
