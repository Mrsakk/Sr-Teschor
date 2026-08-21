import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Check, Loader2, Compass } from 'lucide-react';
import { tripService } from '../../services';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function AddToTripModal({ isOpen, onClose, destination, business }) {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [notes, setNotes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('09:00 AM');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // New trip quick form
  const [showNewTrip, setShowNewTrip] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripStart, setNewTripStart] = useState('');
  const [newTripEnd, setNewTripEnd] = useState('');

  const targetTitle = destination?.name || business?.name || 'Place';
  const targetImage = destination?.images?.[0]?.image || business?.cover_image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400';

  useEffect(() => {
    if (isOpen) {
      if (!isAuthenticated) {
        onClose();
        navigate('/login');
        return;
      }

      setLoading(true);
      setSuccess(false);
      tripService.getAll()
        .then((res) => {
          const myTrips = res.my_trips || [];
          setTrips(myTrips);
          if (myTrips.length > 0) {
            setSelectedTripId(myTrips[0].id);
          } else {
            setShowNewTrip(true);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleCreateNewTrip = async (e) => {
    e.preventDefault();
    if (!newTripName.trim()) return;

    try {
      setSubmitting(true);
      const res = await tripService.create({
        name: newTripName.trim(),
        start_date: newTripStart || null,
        end_date: newTripEnd || null,
      });
      const createdTrip = res;
      setTrips([createdTrip, ...trips]);
      setSelectedTripId(createdTrip.id);
      setShowNewTrip(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToTrip = async (e) => {
    e.preventDefault();
    if (!selectedTripId) return;

    try {
      setSubmitting(true);
      await tripService.addItem(selectedTripId, {
        destination_id: destination?.id || null,
        business_id: business?.id || null,
        custom_title: targetTitle,
        day_number: parseInt(dayNumber) || 1,
        notes: notes.trim() || null,
        estimated_time: estimatedTime,
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Add to Trip Plan</h3>
              <p className="text-xs text-slate-500">Organize your Siem Reap itinerary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Item Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <img
            src={targetImage}
            alt={targetTitle}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <p className="text-xs font-bold text-slate-900">{targetTitle}</p>
            <p className="text-[11px] text-slate-500">
              {destination?.category?.name || business?.category?.name || 'Siem Reap attraction'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            <p className="text-xs">Loading your trips...</p>
          </div>
        ) : success ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 text-base">Added to Itinerary!</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {targetTitle} is now saved to Day {dayNumber} of your trip.
              </p>
            </div>
          </div>
        ) : showNewTrip ? (
          /* Create New Trip Subform */
          <form onSubmit={handleCreateNewTrip} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900">Create New Travel Plan</span>
              {trips.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewTrip(false)}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  Choose Existing Trip
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Trip Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. 4-Day Angkor Temple Adventure"
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Start Date</label>
                <input
                  type="date"
                  value={newTripStart}
                  onChange={(e) => setNewTripStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">End Date</label>
                <input
                  type="date"
                  value={newTripEnd}
                  onChange={(e) => setNewTripEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create & Continue
            </button>
          </form>
        ) : (
          /* Add to Selected Trip Form */
          <form onSubmit={handleAddToTrip} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Select Trip Itinerary</label>
                <button
                  type="button"
                  onClick={() => setShowNewTrip(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Trip
                </button>
              </div>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white font-medium"
              >
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.items?.length || 0} stops)
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white font-medium"
                >
                  <option value={1}>Day 1 (Morning/Afternoon)</option>
                  <option value={2}>Day 2</option>
                  <option value={3}>Day 3</option>
                  <option value={4}>Day 4</option>
                  <option value={5}>Day 5</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Estimated Time</label>
                <input
                  type="text"
                  placeholder="e.g. 08:30 AM"
                  value={estimatedTime}
                  onChange={(e) => setEstimatedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Personal Notes (Optional)</label>
              <textarea
                rows={2}
                placeholder="e.g. Buy temple pass beforehand, bring sunscreen & camera"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Save to Trip
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
