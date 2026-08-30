import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Share2, 
  Printer, 
  CheckCircle2, 
  DollarSign, 
  Sparkles, 
  Compass,
  FileText,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { tripService, destinationService } from '../services';
import ShareModal from '../components/common/ShareModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const stopPin = L.divIcon({
  html: `<div style="background-color: #f59e0b; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
    📍
  </div>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);

  // Add stop modal state
  const [addStopModalOpen, setAddStopModalOpen] = useState(false);
  const [selectedDestId, setSelectedDestId] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState('09:00 AM');
  const [stopNotes, setStopNotes] = useState('');
  const [submittingStop, setSubmittingStop] = useState(false);

  // 1. Fetch Trip details (instant 0ms cached display)
  const {
    data: trip,
    isLoading: loading,
    refetch: fetchTrip,
  } = useQuery({
    queryKey: ['trip', id],
    queryFn: () => tripService.getById(id),
    staleTime: 1000 * 60 * 3,
    placeholderData: prev => prev,
    refetchOnMount: true,
  });

  // 2. Fetch Available Destinations
  const { data: destsResponse } = useQuery({
    queryKey: ['destinations', 'lookup'],
    queryFn: () => destinationService.getAll({ per_page: 50 }),
    staleTime: 1000 * 60 * 5,
    placeholderData: prev => prev,
  });

  const availableDestinations = destsResponse?.data || [];

  const handleRemoveStop = async (itemId) => {
    if (!confirm('Remove this stop from itinerary?')) return;
    try {
      await tripService.removeItem(trip.id, itemId);
      fetchTrip();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedDestId) return;

    try {
      setSubmittingStop(true);
      const chosen = availableDestinations.find((d) => d.id === parseInt(selectedDestId));
      await tripService.addItem(trip.id, {
        destination_id: chosen?.id,
        custom_title: chosen?.name,
        day_number: parseInt(dayNumber) || 1,
        estimated_time: estimatedTime,
        notes: stopNotes || null,
      });

      setAddStopModalOpen(false);
      setStopNotes('');
      fetchTrip();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingStop(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <p className="text-xs font-semibold">Loading travel itinerary...</p>
      </div>
    );
  }

  if (!trip) return null;

  // Group items by day_number
  const daysMap = {};
  (trip.items || []).forEach((item) => {
    const day = item.day_number || 1;
    if (!daysMap[day]) daysMap[day] = [];
    daysMap[day].push(item);
  });

  const sortedDays = Object.keys(daysMap).sort((a, b) => Number(a) - Number(b));
  const validPins = (trip.items || [])
    .filter((item) => item.destination?.latitude && item.destination?.longitude)
    .map((item) => ({
      name: item.destination.name,
      lat: item.destination.latitude,
      lng: item.destination.longitude,
      image: item.destination.images?.[0]?.image,
      day: item.day_number,
      time: item.estimated_time,
    }));

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/my-trips"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" /> Print Itinerary
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share Trip
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold">
                <Compass className="w-3.5 h-3.5" /> Siem Reap Travel Plan
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
                {trip.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                {trip.description || 'Personalized itinerary designed on Tes Chor.'}
              </p>
            </div>

            <button
              onClick={() => setAddStopModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Destination
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-slate-200/80 text-center">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Stops</span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5 font-heading">{trip.items?.length || 0} Places</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5 font-heading">{sortedDays.length || 1} Days</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5 font-heading">{trip.start_date || 'Flexible'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Visibility</span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5 font-heading">{trip.is_public ? 'Public' : 'Private'}</p>
            </div>
          </div>
        </div>

        {/* 2-Column: Day-by-Day Timeline + Live Map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Day-by-Day Timeline (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {sortedDays.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3 shadow-xs">
                <p className="text-xs text-slate-500">Your itinerary is currently empty.</p>
                <button
                  onClick={() => setAddStopModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Your First Attraction
                </button>
              </div>
            ) : (
              sortedDays.map((day) => (
                <div key={`day-${day}`} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                        D{day}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 font-heading">
                        Day {day} Schedule
                      </h3>
                    </div>
                    <span className="text-xs text-slate-400 font-bold">
                      {daysMap[day].length} stops
                    </span>
                  </div>

                  <div className="space-y-3">
                    {daysMap[day].map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={item.destination?.images?.[0]?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=300'}
                            alt={item.custom_title}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-orange-600">
                                {item.estimated_time || 'Morning'}
                              </span>
                              <span className="text-slate-300">•</span>
                              <h4 className="font-extrabold text-sm text-slate-900 font-heading">
                                {item.destination?.name || item.custom_title}
                              </h4>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {item.destination?.address || 'Siem Reap'}
                            </p>
                            {item.notes && (
                              <p className="text-[11px] text-orange-800 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 inline-block">
                                💡 {item.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.destination?.slug && (
                            <Link
                              to={`/destinations/${item.destination.slug}`}
                              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-xs"
                            >
                              Details
                            </Link>
                          )}
                          <button
                            onClick={() => handleRemoveStop(item.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Map Column (1 Column) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 sticky top-24">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-sm text-slate-900 font-heading">Itinerary Route Map</h3>
              </div>

              <div className="h-[400px] rounded-xl overflow-hidden border border-slate-200 relative z-0">
                <MapContainer
                  center={[13.3633, 103.8564]}
                  zoom={11}
                  scrollWheelZoom={false}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {validPins.map((p, i) => (
                    <Marker key={i} position={[p.lat, p.lng]} icon={stopPin}>
                      <Popup>
                        <div className="p-1 text-xs">
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-orange-600">Day {p.day} • {p.time}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Add Stop Modal */}
      {addStopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-xl shadow-md border border-slate-100 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Add Stop to Itinerary</h3>
              <button
                onClick={() => setAddStopModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStop} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Choose Attraction</label>
                <select
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                >
                  {availableDestinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.category?.name || 'Attraction'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Day in Trip</label>
                  <select
                    value={dayNumber}
                    onChange={(e) => setDayNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value={1}>Day 1</option>
                    <option value={2}>Day 2</option>
                    <option value={3}>Day 3</option>
                    <option value={4}>Day 4</option>
                    <option value={5}>Day 5</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Time</label>
                  <input
                    type="text"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={stopNotes}
                  onChange={(e) => setStopNotes(e.target.value)}
                  placeholder="e.g. Wear temple clothes, pack water bottle"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddStopModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingStop}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {submittingStop ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={trip.name}
        description={`Check out my Siem Reap travel itinerary "${trip.name}" on Tes Chor!`}
      />

    </div>
  );
}
