import React, { useState } from 'react';
import { X, Calendar, Clock, Users, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { bookingApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/useAuthStore';

export default function BookingModal({ business, service = null, isOpen, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuthStore();
  const [selectedServiceId, setSelectedServiceId] = useState(service?.id || '');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00');
  const [guests, setGuests] = useState(2);
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successBooking, setSuccessBooking] = useState(null);

  if (!isOpen) return null;

  const currentService = business.services?.find((s) => s.id === Number(selectedServiceId)) || service;
  const unitPrice = currentService ? Number(currentService.price) : 0;
  const totalPrice = unitPrice * guests;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please sign in to complete your booking request.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await bookingApi.create({
        business_id: business.id,
        service_id: selectedServiceId ? Number(selectedServiceId) : null,
        booking_date: bookingDate,
        booking_time: bookingTime,
        guests: Number(guests),
        contact_name: contactName,
        contact_phone: contactPhone,
        contact_email: contactEmail,
        notes: notes,
      });

      setSuccessBooking(res.data.booking);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      if (onSuccess) onSuccess(res.data.booking);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit booking request. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-100 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Book / Request Experience
          </div>
          <h3 className="font-extrabold text-xl sm:text-2xl font-heading">
            {business.name}
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            Direct reservation with verified local provider
          </p>
        </div>

        {/* Success Confirmation View */}
        {successBooking ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Booking Request Sent!</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your request has been forwarded to <strong>{business.name}</strong>. You will receive an instant notification as soon as it is confirmed.
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-1.5 text-left border border-slate-100">
              <p className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-mono font-bold text-slate-900">{successBooking.booking_reference}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-800">{successBooking.booking_date} at {successBooking.booking_time || 'Flexible'}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Guests:</span>
                <span className="font-semibold text-slate-800">{successBooking.guests} Person(s)</span>
              </p>
              {successBooking.total_amount > 0 && (
                <p className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Estimated Total:</span>
                  <span className="font-extrabold text-orange-600">${Number(successBooking.total_amount).toFixed(2)}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-md"
            >
              Done & View Bookings
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Service Selection */}
            {business.services && business.services.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Experience or Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="">General Table / Tour Inquiry</option>
                  {business.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ${Number(s.price).toFixed(2)} ({s.duration || 'Per Person'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Guests Counter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Number of Guests
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                >
                  -
                </button>
                <span className="font-extrabold text-slate-900 text-sm w-12 text-center">
                  {guests} {guests === 1 ? 'Guest' : 'Guests'}
                </span>
                <button
                  type="button"
                  onClick={() => setGuests(guests + 1)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Contact Details */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <p className="text-xs font-bold text-slate-900">Your Contact Information</p>
              
              <div>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  required
                  placeholder="Phone / WhatsApp"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  rows="2"
                  placeholder="Special requests, dietary requirements, hotel pickup address..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Pricing Summary */}
            {totalPrice > 0 && (
              <div className="bg-orange-50/70 border border-orange-200/60 rounded-2xl p-3.5 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>${unitPrice.toFixed(2)} × {guests} guests</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-orange-200/50">
                  <span>Estimated Total</span>
                  <span className="text-orange-600">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-400">Pay directly to the provider upon confirmation or arrival.</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Request...' : 'Confirm & Send Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
