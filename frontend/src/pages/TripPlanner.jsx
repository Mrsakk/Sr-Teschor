import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  Share2, 
  Compass, 
  Sparkles, 
  Building2, 
  Check, 
  ArrowRight,
  Printer,
  Download,
  FileText
} from 'lucide-react';
import { tripApi, destinationApi } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import AITripPlannerModal from '../components/common/AITripPlannerModal';

export default function TripPlanner() {
  const { isAuthenticated } = useAuthStore();
  const [myTrips, setMyTrips] = useState([]);
  const [publicTrips, setPublicTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiPlannerOpen, setAiPlannerOpen] = useState(false);

  // New Trip form state
  const [newTripName, setNewTripName] = useState('');
  const [newTripDesc, setNewTripDesc] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Add Item state
  const [selectedDestId, setSelectedDestId] = useState('');
  const [itemDay, setItemDay] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);

  const handlePrintItinerary = () => {
    window.print();
  };

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      try {
        const [tripsRes, destsRes] = await Promise.all([
          isAuthenticated ? tripApi.getAll() : Promise.resolve({ data: { my_trips: [], public_trips: [] } }),
          destinationApi.getAll({ per_page: 50 }),
        ]);

        const trips = tripsRes.data.my_trips || [];
        setMyTrips(trips);
        setPublicTrips(tripsRes.data.public_trips || []);
        if (trips.length > 0) {
          setSelectedTrip(trips[0]);
        }
        setDestinations(destsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [isAuthenticated]);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    try {
      const res = await tripApi.create({
        name: newTripName.trim(),
        description: newTripDesc.trim(),
        is_public: true,
      });

      const newT = res.data;
      setMyTrips([newT, ...myTrips]);
      setSelectedTrip(newT);
      setCreateModalOpen(false);
      setNewTripName('');
      setNewTripDesc('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedTrip || !selectedDestId) return;

    try {
      const res = await tripApi.addItem(selectedTrip.id, {
        destination_id: Number(selectedDestId),
        day_number: Number(itemDay),
        notes: itemNotes,
        estimated_time: '2 Hours',
      });

      const updatedItems = [...(selectedTrip.items || []), res.data];
      const updatedTrip = { ...selectedTrip, items: updatedItems };
      setSelectedTrip(updatedTrip);
      setMyTrips(myTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
      setAddItemModalOpen(false);
      setSelectedDestId('');
      setItemNotes('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!selectedTrip) return;
    try {
      await tripApi.removeItem(selectedTrip.id, itemId);
      const updatedItems = selectedTrip.items.filter((i) => i.id !== itemId);
      const updatedTrip = { ...selectedTrip, items: updatedItems };
      setSelectedTrip(updatedTrip);
      setMyTrips(myTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
    } catch (e) {
      console.error(e);
    }
  };

  // Group items by day
  const itemsByDay = (selectedTrip?.items || []).reduce((acc, item) => {
    const day = item.day_number || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  return (
    <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Multi-Day Itinerary Planner
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading mt-1">
            Trip Planner
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize temple visits, floating village sunset cruises, and dinner reservations day by day
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setAiPlannerOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Generate with AI</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create New Itinerary
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Trip Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedTrip ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
              
              {/* Itinerary Title Banner */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
                    {selectedTrip.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {selectedTrip.description || 'Custom itinerary in Siem Reap'}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
                    <span>{selectedTrip.items?.length || 0} Total Stops</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">Public Itinerary</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrintItinerary}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Print or Save PDF for Offline Access"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Print / PDF (Offline)</span>
                  </button>

                  <button
                    onClick={() => setAddItemModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Destination</span>
                  </button>
                </div>
              </div>

              {/* Day-by-Day Timeline */}
              {Object.keys(itemsByDay).length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">Your itinerary is empty</p>
                  <p className="text-xs text-slate-400">Add Angkor Wat, Bayon, or local dining to start planning.</p>
                  <button
                    onClick={() => setAddItemModalOpen(true)}
                    className="px-5 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md"
                  >
                    Add First Stop
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(itemsByDay).map(([dayNumber, items]) => (
                    <div key={dayNumber} className="space-y-4">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-black">
                        Day {dayNumber}
                      </div>

                      <div className="space-y-3 pl-2 border-l-2 border-orange-200">
                        {items.map((item, index) => {
                          const place = item.destination || item.business;
                          return (
                            <div
                              key={item.id}
                              className="relative pl-6 bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 border border-slate-100 flex items-center justify-between gap-4 transition-all"
                            >
                              <div className="absolute -left-[9px] top-6 w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-xs" />
                              
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <div>
                                  <h4 className="font-bold text-sm text-slate-900 truncate">
                                    {place?.name || item.custom_title || 'Stop'}
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    {item.notes || place?.address || 'Scheduled stop'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                                  {item.estimated_time || '2 Hours'}
                                </span>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Remove stop"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-lg text-slate-900">No Itinerary Created</h3>
              <p className="text-xs text-slate-500">Sign in and create your custom itinerary.</p>
            </div>
          )}

        </div>

        {/* Right Col: Sample Curated Itineraries */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Recommended Sample Itineraries</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-200/60 px-2 py-0.5 rounded-md">
                  Classic 3-Day Tour
                </span>
                <h4 className="font-bold text-sm text-slate-900">The Grand Angkor & Floating Village</h4>
                <p className="text-xs text-slate-600">
                  Day 1: Angkor Wat Sunrise → Bayon → Haven Dining<br/>
                  Day 2: Ta Prohm → Kampong Phluk Boat Cruise → Phare Circus<br/>
                  Day 3: Phnom Kulen Waterfalls → Banteay Srei
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-200/60 px-2 py-0.5 rounded-md">
                  Hidden Gems 2-Day
                </span>
                <h4 className="font-bold text-sm text-slate-900">Jungle Explorer & Cultural Arts</h4>
                <p className="text-xs text-slate-600">
                  Day 1: Beng Mealea Jungle Ruins → Angkor National Museum<br/>
                  Day 2: Kbal Spean River of 1,000 Lingas → Sister Srey Café
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal: Create Trip */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-900">Create New Trip Itinerary</h3>
            <form onSubmit={handleCreateTrip} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Itinerary Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Siem Reap Explorer Trip"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Optional notes or goals for this trip..."
                  value={newTripDesc}
                  onChange={(e) => setNewTripDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 shadow-md"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Add Destination to Day {itemDay}</h3>
            
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Select Destination</label>
                <select
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                >
                  <option value="">-- Choose a Destination --</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.category?.name || 'Sight'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Day Number</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={itemDay}
                  onChange={(e) => setItemDay(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Notes / Plan</label>
                <textarea
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="e.g. Watch sunrise, take photos at south gate..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddItemModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Trip Planner Modal */}
      <AITripPlannerModal
        isOpen={aiPlannerOpen}
        onClose={() => setAiPlannerOpen(false)}
      />

    </div>
  );
}
