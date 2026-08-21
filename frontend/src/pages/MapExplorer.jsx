import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Sparkles
} from 'lucide-react';
import { searchApi } from '../api/endpoints';
import RatingStars from '../components/common/RatingStars';

// Custom Map Marker Icons using Leaflet DivIcon
const destinationIcon = new L.DivIcon({
  className: 'custom-dest-pin',
  html: `<div style="background-color: #ea580c; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 19 21 12 17 5 21 12 2"></polygon></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const businessIcon = new L.DivIcon({
  className: 'custom-biz-pin',
  html: `<div style="background-color: #059669; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22.01"></line><line x1="15" y1="22" x2="15" y2="22.01"></line></svg></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const userLocationIcon = new L.DivIcon({
  className: 'custom-user-pin',
  html: `<div style="background-color: #2563eb; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 0 0 6px rgba(37,99,235,0.3);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3"></path></svg></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.2 });
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
  const [destinations, setDestinations] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'destinations', 'businesses'
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);

  // Center coordinate: Siem Reap / Angkor region
  const siemReapCenter = [13.4125, 103.8670];

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await searchApi.getMapLocations();
        setDestinations(res.data.destinations || []);
        setBusinesses(res.data.businesses || []);
      } catch (err) {
        console.error('Failed to load map locations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

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

  // Add distance attribute if userLocation is available
  const enrichedDestinations = destinations.map(d => ({
    ...d,
    distance: userLocation ? getDistanceKm(userLocation[0], userLocation[1], Number(d.latitude), Number(d.longitude)) : null
  }));

  const enrichedBusinesses = businesses.map(b => ({
    ...b,
    distance: userLocation ? getDistanceKm(userLocation[0], userLocation[1], Number(b.latitude), Number(b.longitude)) : null
  }));

  let visibleDestinations = filterType === 'businesses' ? [] : enrichedDestinations;
  let visibleBusinesses = filterType === 'destinations' ? [] : enrichedBusinesses;

  // Sort by nearest if userLocation is enabled
  if (userLocation) {
    visibleDestinations.sort((a, b) => (Number(a.distance) || 999) - (Number(b.distance) || 999));
    visibleBusinesses.sort((a, b) => (Number(a.distance) || 999) - (Number(b.distance) || 999));
  }

  const totalVisible = visibleDestinations.length + visibleBusinesses.length;

  return (
    <div className="pt-20 pb-6 h-[calc(100vh-4rem)] flex flex-col">
      
      {/* Top Filter Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 z-20 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900 leading-tight">
              Interactive Map of Siem Reap
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {totalVisible} locations pinned (Temples, Resorts, Dining, Experiences)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Near Me Button */}
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={locating}
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              userLocation
                ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/30'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'Locating...' : userLocation ? 'Near Me Active (GPS)' : 'Find Near Me'}</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({destinations.length + businesses.length})
            </button>
            <button
              onClick={() => setFilterType('destinations')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'destinations'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Destinations ({destinations.length})
            </button>
            <button
              onClick={() => setFilterType('businesses')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'businesses'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Businesses ({businesses.length})
            </button>
          </div>
        </div>
      </div>

      {/* Map and Synchronized Sidebar Container */}
      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Sidebar List on Desktop */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 h-48 md:h-full overflow-y-auto p-3 space-y-2 shrink-0 z-10">
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {userLocation ? '📍 តម្រៀបតាមទីតាំងដែលនៅជិតអ្នកបំផុត' : 'ចុចលើទីតាំងដើម្បីមើលលើផែនទី'}
            </p>
            {userLocation && (
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Closest First
              </span>
            )}
          </div>

          {/* Destinations */}
          {visibleDestinations.map((d) => (
            <button
              key={`dest-${d.id}`}
              onClick={() => setSelectedPlace([Number(d.latitude), Number(d.longitude)])}
              className="w-full p-3 rounded-2xl border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 flex items-center gap-3 text-left transition-all group cursor-pointer"
            >
              <img
                src={d.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=200&auto=format&fit=crop&q=80'}
                alt={d.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase">
                    {d.category?.name}
                  </span>
                  {d.distance && (
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {d.distance} km
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-orange-600">
                  {d.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{d.address}</p>
              </div>
            </button>
          ))}

          {/* Businesses */}
          {visibleBusinesses.map((b) => (
            <button
              key={`biz-${b.id}`}
              onClick={() => setSelectedPlace([Number(b.latitude), Number(b.longitude)])}
              className="w-full p-3 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 flex items-center gap-3 text-left transition-all group cursor-pointer"
            >
              <img
                src={b.cover_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80'}
                alt={b.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">
                    {b.category?.name}
                  </span>
                  {b.distance && (
                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                      {b.distance} km
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-emerald-700">
                  {b.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{b.address}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Leaflet Map Canvas */}
        <div className="flex-1 h-full w-full relative">
          <MapContainer
            center={siemReapCenter}
            zoom={12}
            scrollWheelZoom={true}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {selectedPlace && <RecenterMap position={selectedPlace} />}

            {/* User GPS Pin */}
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="p-2 text-center">
                    <span className="text-xs font-bold text-blue-700 block">Your Current Location (GPS)</span>
                    <span className="text-[10px] text-slate-500">Siem Reap Region</span>
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
                >
                  <Popup>
                    <div className="w-56 overflow-hidden rounded-xl">
                      <img
                        src={dest.primary_image?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80'}
                        alt={dest.name}
                        className="w-full h-24 object-cover"
                      />
                      <div className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                            {dest.category?.name}
                          </span>
                          {dest.distance && (
                            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                              {dest.distance} km
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {dest.name}
                        </h4>
                        <div className="flex items-center justify-between pt-1">
                          <RatingStars rating={dest.rating} />
                          <span className="text-xs font-bold text-slate-800">
                            {dest.entrance_fee > 0 ? `$${dest.entrance_fee}` : 'Free'}
                          </span>
                        </div>
                        <Link
                          to={`/destinations/${dest.slug}`}
                          className="mt-2 block w-full py-1.5 text-center text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                        >
                          View Destination Details
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
                >
                  <Popup>
                    <div className="w-56 overflow-hidden rounded-xl">
                      <img
                        src={biz.cover_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&auto=format&fit=crop&q=80'}
                        alt={biz.name}
                        className="w-full h-24 object-cover"
                      />
                      <div className="p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                            {biz.category?.name}
                          </span>
                          {biz.distance && (
                            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                              {biz.distance} km
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {biz.name}
                        </h4>
                        <div className="flex items-center justify-between pt-1">
                          <RatingStars rating={biz.rating} />
                          <span className="text-xs font-black text-slate-700">
                            {biz.price_range || '$$'}
                          </span>
                        </div>
                        <Link
                          to={`/businesses/${biz.slug}`}
                          className="mt-2 block w-full py-1.5 text-center text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors"
                        >
                          View Business Details
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
