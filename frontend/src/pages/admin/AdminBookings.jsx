import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import {
  CalendarCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Building2,
  Calendar,
  X,
  Eye,
  Download,
} from 'lucide-react';

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToastStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'bookings', statusFilter, page],
    queryFn: () => adminApi.getBookings({ page, status: statusFilter || undefined }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
    placeholderData: prev => prev,
    refetchOnMount: true,
  });

  const bookings = data?.data || [];
  const pagination = { current_page: data?.current_page || 1, last_page: data?.last_page || 1, total: data?.total || 0 };
  const fetchBookings = (p = 1) => setPage(p);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setActionLoading(true);
      await adminApi.updateBookingStatus(bookingId, { status: newStatus });
      toast.success(`Booking status updated to ${newStatus}.`);
      setIsDetailOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    } catch (err) {
      toast.error('Failed to update booking status.');
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Booking Reference,Customer,Business,Service,Guests,Total ($),Commission ($),Date,Status,Payment'];
    const rows = bookings.map(b => `"${b.booking_reference}","${b.contact_name}","${b.business?.name || ''}","${b.service?.name || ''}","${b.guests}","${b.total_amount}","${b.commission_amount}","${b.booking_date}","${b.status}","${b.payment_status}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tes_chor_bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Bookings exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Booking & Reservation Desk</h2>
          <p className="text-xs text-slate-400">
            Total {pagination.total || 0} tour reservations, dining bookings, and villa bookings across Siem Reap.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All Reservations', value: '' },
            { label: 'Pending', value: 'pending' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Ref #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Partner Business</th>
                <th className="px-5 py-3.5">Service / Experience</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5">Amount & Comm.</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading reservations...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No bookings found in this view.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-transparent hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      #{b.booking_reference}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-700">{b.contact_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{b.contact_phone || b.contact_email}</p>
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {b.business?.name}
                    </td>

                    <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">
                      {b.service?.name || 'Custom Booking'} ({b.guests} Guests)
                    </td>

                    <td className="px-5 py-3.5 text-slate-700">
                      <p className="font-medium text-slate-900">{b.booking_date}</p>
                      <p className="text-[10px] text-slate-400">{b.booking_time}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-emerald-600">${b.total_amount}</p>
                      <p className="text-[10px] text-amber-600 font-semibold">+${b.commission_amount} (10%)</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : b.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedBooking(b);
                          setIsDetailOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {isDetailOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-md relative text-left">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Booking #{selectedBooking.booking_reference}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedBooking.business?.name}</p>

            <div className="space-y-3 text-xs bg-transparent hover:bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Name:</span>
                <span className="font-semibold text-slate-900">{selectedBooking.contact_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Email:</span>
                <span className="font-mono text-slate-700">{selectedBooking.contact_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Phone:</span>
                <span className="text-slate-700">{selectedBooking.contact_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="font-semibold text-slate-900">{selectedBooking.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Guests:</span>
                <span className="text-slate-700">{selectedBooking.guests} Person(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Price:</span>
                <span className="font-bold text-emerald-600">${selectedBooking.total_amount}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2">
                <span className="text-slate-400">10% Platform Revenue:</span>
                <span className="font-bold text-amber-600">${selectedBooking.commission_amount}</span>
              </div>
              {selectedBooking.notes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Special Requests / Notes:</span>
                  <p className="text-slate-700 italic">"{selectedBooking.notes}"</p>
                </div>
              )}
            </div>

            {/* Quick Status Modifiers */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase text-slate-400">Change Booking Status:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                  className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                >
                  Complete
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
