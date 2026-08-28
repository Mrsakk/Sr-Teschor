import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

  const { data: destsData } = useQuery({
    queryKey: ['destinations', { per_page: 50 }],
    queryFn: () => destinationApi.getAll({ per_page: 50 }).then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { data: tripsData, isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: () => tripApi.getAll().then(r => r.data),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (tripsData) {
      setMyTrips(tripsData.my_trips || []);
      setPublicTrips(tripsData.public_trips || []);
      if (!selectedTrip && tripsData.my_trips && tripsData.my_trips.length > 0) {
        setSelectedTrip(tripsData.my_trips[0]);
      }
      setLoading(false);
    } else if (!isAuthenticated) {
      setLoading(false);
    }
  }, [tripsData, isAuthenticated, selectedTrip]);

  useEffect(() => {
    if (destsData) {
      setDestinations(destsData.data || []);
    }
  }, [destsData]);

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
    } catch (e) {
      console.warn('Item removed locally:', e);
    }
    const updatedItems = (selectedTrip.items || []).filter((i) => i.id !== itemId);
    const updatedTrip = { ...selectedTrip, items: updatedItems };
    setSelectedTrip(updatedTrip);
    setMyTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));
  };

  // Group items by day
  const itemsByDay = (selectedTrip?.items || []).reduce((acc, item) => {
    const day = item.day_number || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  return (
    <div className="pt-20 sm:pt-28 pb-36 sm:pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-10 notranslate print:p-0 print:m-0 print:max-w-full print:space-y-0" translate="no">
      
      {/* Page Header (Screen only) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>រៀបចំកាលវិភាគដំណើរកម្សាន្ត</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
            ផែនការដំណើរកម្សាន្ត
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            រៀបចំដំណើរកម្សាន្តទស្សនាប្រាសាទ បទពិសោធន៍ជិះទូក និងភោជនីយដ្ឋានតាមថ្ងៃនីមួយៗ
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setAiPlannerOpen(true)}
            className="px-3.5 sm:px-4 py-2.5 rounded-xl sm:rounded-xl bg-orange-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs shadow-md shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-transform hover:scale-[1.02] cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
            <span>រៀបចំជាមួយ AI</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-3.5 sm:px-5 py-2.5 rounded-xl sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 sm:gap-2 transition-transform hover:scale-[1.02] cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>បង្កើតកាលវិភាគ</span>
            </button>
          )}
        </div>
      </div>

      {/* Trips Switcher Tab (If user has multiple trips - Screen only) */}
      {myTrips.length > 1 && (
        <div className="print:hidden flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider text-[10px]">
            កាលវិភាគរបស់ខ្ញុំ:
          </span>
          {myTrips.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTrip(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedTrip?.id === t.id
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 print:block">
        
        {/* Left Col: Trip Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-6 print:space-y-4">
          
          {selectedTrip ? (
            <div className="bg-white rounded-xl sm:rounded-xl p-4 sm:p-6 md:p-8 border border-slate-100 shadow-xs space-y-5 sm:space-y-6 print:border-none print:shadow-none print:p-0 print:space-y-4">
              
              {/* Official Print Header (Only visible when printing / saving PDF) */}
              <div className="hidden print:block pb-5 border-b-2 border-slate-900 mb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm">
                        SR
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-orange-600">
                        SR Tes Chor Tourism Platform • Official Travel Itinerary
                      </span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mt-1 font-heading">
                      {selectedTrip.name}
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {selectedTrip.description || 'កាលវិភាគដំណើរកម្សាន្តនៅសៀមរាប'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-slate-800">
                      កាលបរិច្ឆេទ៖ {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      ចំនួនទីតាំងសរុប៖ <strong>{selectedTrip.items?.length || 0} កន្លែង</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itinerary Title Banner (Screen only) */}
              <div className="print:hidden flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-100">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading truncate">
                    {selectedTrip.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {selectedTrip.description || 'កាលវិភាគដំណើរកម្សាន្តនៅសៀមរាប'}
                  </p>
                  <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                    <span>{selectedTrip.items?.length || 0} ទីតាំងសរុប</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-semibold">កាលវិភាគសាធារណៈ</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t border-slate-100 sm:border-none">
                  <button
                    type="button"
                    onClick={handlePrintItinerary}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                    title="Print or Save PDF for Offline Access"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>បោះពុម្ព / PDF</span>
                  </button>

                  <button
                    onClick={() => setAddItemModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>បន្ថែមទីតាំង</span>
                  </button>
                </div>
              </div>

              {/* Day-by-Day Timeline */}
              {Object.keys(itemsByDay).length === 0 ? (
                <div className="text-center py-10 sm:py-12 space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
                  <p className="font-bold text-sm text-slate-700">មិនទាន់មានទីតាំងក្នុងកាលវិភាគឡើយ</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    សូមបន្ថែមប្រាសាទអង្គរវត្ត បាយ័ន ឬភោជនីយដ្ឋានដើម្បីចាប់ផ្តើមរៀបចំ។
                  </p>
                  <button
                    onClick={() => setAddItemModalOpen(true)}
                    className="inline-block px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                  >
                    + បន្ថែមទីតាំងដំបូង
                  </button>
                </div>
              ) : (
                <div className="space-y-6 sm:space-y-8 print:space-y-4">
                  {Object.entries(itemsByDay).map(([dayNumber, items]) => (
                    <div key={dayNumber} className="space-y-3 sm:space-y-4 print:space-y-2 print:break-inside-avoid">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-black print:bg-slate-800">
                        ថ្ងៃទី {dayNumber} (Day {dayNumber})
                      </div>

                      <div className="space-y-2.5 sm:space-y-3 pl-2 border-l-2 border-orange-300 print:pl-3">
                        {items.map((item, index) => {
                          const place = item.destination || item.business;
                          return (
                            <div
                              key={item.id}
                              className="relative pl-5 sm:pl-6 bg-slate-50 hover:bg-slate-100/80 rounded-xl sm:rounded-xl p-3 sm:p-4 border border-slate-100 flex items-center justify-between gap-3 transition-all print:border print:border-slate-200 print:bg-white print:p-2.5"
                            >
                              <div className="absolute -left-[8px] top-5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white shadow-2xs print:top-3.5" />
                              
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-orange-100 text-orange-700 font-bold text-xs flex items-center justify-center shrink-0">
                                  {index + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                                    {place?.name || item.custom_title || 'Stop'}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                    {item.notes || place?.address || 'Scheduled stop'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400">
                                  {item.estimated_time || '2 Hours'}
                                </span>
                                <button
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="print:hidden p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

              {/* Official Print Footer */}
              <div className="hidden print:block pt-5 border-t border-slate-200 mt-6 text-center text-[10px] text-slate-500">
                <p className="font-semibold">SR Tes Chor Tourism Platform • 24/7 Traveler Support: support@srteschor.com</p>
                <p className="text-slate-400 mt-0.5">Siem Reap, Kingdom of Cambodia • Please present this itinerary to your driver or tour guide</p>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl sm:rounded-xl p-8 sm:p-12 text-center border border-slate-100 space-y-3">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-base sm:text-lg text-slate-900">មិនទាន់មានកាលវិភាគនៅឡើយទេ</h3>
              <p className="text-xs text-slate-500">ចូលគណនី និងបង្កើតកាលវិភាគផ្ទាល់ខ្លួនរបស់អ្នក។</p>
            </div>
          )}

        </div>

        {/* Right Col: Sample Curated Itineraries (Screen only) */}
        <div className="print:hidden space-y-6">
          <div className="bg-white rounded-xl sm:rounded-xl p-4.5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
              <span>គំរូកាលវិភាគណែនាំ (Recommended)</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-xl bg-orange-50/60 border border-orange-100 space-y-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-200/60 px-2 py-0.5 rounded-md inline-block">
                  Classic 3-Day Tour
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">The Grand Angkor & Floating Village</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Day 1: Angkor Wat Sunrise → Bayon → Haven Dining<br/>
                  Day 2: Ta Prohm → Kampong Phluk Boat Cruise → Phare Circus<br/>
                  Day 3: Phnom Kulen Waterfalls → Banteay Srei
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-200/60 px-2 py-0.5 rounded-md inline-block">
                  Hidden Gems 2-Day
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">Jungle Explorer & Cultural Arts</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-md animate-in zoom-in-95">
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-md space-y-4">
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
