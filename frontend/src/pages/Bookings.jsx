import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Compass 
} from 'lucide-react';
import { bookingApi } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';

export default function Bookings() {
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getAll({ status: statusFilter || undefined });
      setBookings(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      await bookingApi.updateStatus(id, { status: 'cancelled' });
      fetchBookings();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Manage Your Bookings</h2>
        <p className="text-xs text-slate-500">Sign in to view your tour reservations, hotel requests, and dinner tables.</p>
        <Link to="/login" className="inline-block px-8 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Confirmed</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-blue-100 text-blue-800">Completed</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-800"><AlertCircle className="w-3.5 h-3.5" /> Pending Confirmation</span>;
    }
  };

  return (
    <div className="pt-20 sm:pt-28 pb-20 sm:pb-24 max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
            Reservations & Inquiries
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 font-heading mt-1">
            My Bookings ({bookings.length})
          </h1>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading your reservations...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 max-w-md mx-auto space-y-4">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">You don't have any bookings yet</h3>
          <p className="text-xs text-slate-500">
            Explore verified hotels, authentic dining, and safari tour guides to book an unforgettable experience.
          </p>
          <Link
            to="/businesses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md"
          >
            <Building2 className="w-4 h-4" /> Explore Local Experiences
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    Ref: #{booking.booking_reference}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>

                <h3 className="font-bold text-lg text-slate-900">
                  {booking.business?.name || 'Local Business'}
                </h3>
                {booking.service && (
                  <p className="text-xs font-semibold text-orange-600">
                    Experience: {booking.service.name}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {booking.booking_date
                      ? new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </span>
                  {booking.booking_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {booking.booking_time}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {booking.guests} Guests
                  </span>
                </div>

                {booking.business_response_notes && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs mt-2 border border-emerald-100">
                    <strong>Business Note:</strong> {booking.business_response_notes}
                  </div>
                )}
              </div>

              {/* Price & Actions */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {booking.total_amount > 0 && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">Total Paid</span>
                    <span className="font-extrabold text-xl text-slate-900">
                      ${Number(booking.total_amount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Link
                    to={`/booking/confirmation/${booking.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>View E-Ticket</span>
                  </Link>

                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
