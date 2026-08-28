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
        <Link to="/login" className="inline-block px-8 py-3 rounded-xl bg-orange-500 text-white font-bold text-xs shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-800"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> បានបញ្ជាក់ (Confirmed)</span>;
      case 'completed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 sm:px-3 py-1 rounded-full bg-blue-100 text-blue-800"><CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> បានបញ្ចប់ (Completed)</span>;
      case 'rejected':
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 sm:px-3 py-1 rounded-full bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5 shrink-0" /> បានបោះបង់ ({status})</span>;
      case 'pending':
      default:
        return <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 sm:px-3 py-1 rounded-full bg-amber-100 text-amber-800"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> រង់ចាំការបញ្ជាក់</span>;
    }
  };

  const filterTabs = [
    { id: '', label: 'ទាំងអស់ (All)' },
    { id: 'pending', label: 'រង់ចាំ (Pending)' },
    { id: 'confirmed', label: 'បានបញ្ជាក់ (Confirmed)' },
    { id: 'completed', label: 'បានបញ្ចប់ (Done)' },
    { id: 'cancelled', label: 'បានបោះបង់ (Cancelled)' },
  ];

  return (
    <div className="pt-20 sm:pt-28 pb-36 sm:pb-24 max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 notranslate" translate="no">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200">
        <div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-600 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>ការកក់ & សំបុត្រទេសចរណ៍ (My Bookings)</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
            ការកក់របស់ខ្ញុំ ({bookings.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            គ្រប់គ្រងសំបុត្រទស្សនា ការកក់តុអាហារ និងសណ្ឋាគារដែលអ្នកបានកក់
          </p>
        </div>

        {/* Filter Pills (Scrollable on mobile) */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar w-full sm:w-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-[11px] sm:text-xs ${
                statusFilter === tab.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400">កំពុងផ្ទុកបញ្ជីការកក់របស់អ្នក...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl sm:rounded-xl p-8 sm:p-12 text-center border border-slate-100 max-w-md mx-auto space-y-4 shadow-2xs">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900">អ្នកមិនទាន់មានការកក់ណាមួយឡើយ</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            ស្វែងរកសេវាកម្មសណ្ឋាគារ ភោជនីយដ្ឋានឆ្ងាញ់ៗ និងមគ្គុទ្ទេសក៍ទេសចរណ៍ដែលផ្ទៀងផ្ទាត់រួច ដើម្បីកក់បទពិសោធន៍ដ៏អស្ចារ្យ។
          </p>
          <Link
            to="/businesses"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>ស្វែងរកសេវាកម្មទេសចរណ៍</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-xl sm:rounded-xl p-4 sm:p-6 border border-slate-100 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
            >
              <div className="space-y-2 w-full sm:w-auto min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    #{booking.booking_reference}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>

                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 truncate">
                  {booking.business?.name || 'Local Business'}
                </h3>
                {booking.service && (
                  <p className="text-xs font-bold text-orange-600">
                    សេវាកម្ម៖ {booking.service.name}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {booking.booking_date
                        ? new Date(booking.booking_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </span>
                  {booking.booking_time && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{booking.booking_time}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{booking.guests} នាក់ (Guests)</span>
                  </span>
                </div>

                {booking.business_response_notes && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs mt-2 border border-emerald-100">
                    <strong>កំណត់ចំណាំ៖</strong> {booking.business_response_notes}
                  </div>
                )}
              </div>

              {/* Price & Actions */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                {booking.total_amount > 0 && (
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold">តម្លៃសរុប</span>
                    <span className="font-extrabold text-lg sm:text-xl text-slate-900">
                      ${Number(booking.total_amount).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Link
                    to={`/booking/confirmation/${booking.id}`}
                    className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>មើលសំបុត្រ E-Ticket</span>
                  </Link>

                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      បោះបង់
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
