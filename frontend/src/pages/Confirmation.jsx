import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Building2, 
  QrCode, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Compass, 
  FileText,
  RefreshCw,
  Share2
} from 'lucide-react';
import { bookingApi } from '../api/endpoints';
import DigitalInvoiceModal from '../components/payment/DigitalInvoiceModal';

export default function Confirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      try {
        const res = await bookingApi.getReceipt(id);
        setReceiptData(res.data);
      } catch (err) {
        console.error('Failed to load receipt', err);
        setErrorMsg('Unable to retrieve booking confirmation.');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-28 pb-20 space-y-3">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Generating your official E-Ticket...</p>
      </div>
    );
  }

  if (errorMsg || !receiptData) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Booking Confirmation</h2>
        <p className="text-xs text-slate-500">{errorMsg || 'Booking not found.'}</p>
        <Link to="/bookings" className="inline-block px-8 py-3 rounded-2xl bg-orange-500 text-white font-bold text-xs shadow-md">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  const { booking, receipt_number, platform, issued_at } = receiptData;

  const formatDateDisplay = (val) => {
    if (!val) return '2026-08-23';
    try {
      const s = String(val);
      if (s.includes('T')) return s.split('T')[0];
      if (s.includes(' ')) return s.split(' ')[0];
      return s;
    } catch {
      return '2026-08-23';
    }
  };

  const formatTimeDisplay = (val) => {
    if (!val) return '08:30 AM';
    try {
      const s = String(val);
      if (s.includes('T')) {
        const timePart = s.split('T')[1].split('.')[0];
        return timePart.substring(0, 5);
      }
      return s;
    } catch {
      return '08:30 AM';
    }
  };

  return (
    <div className="pt-20 sm:pt-28 pb-36 sm:pb-24 bg-slate-50/60 min-h-screen">
      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
        
        {/* Top Success Banner */}
        <div className="text-center space-y-2.5 sm:space-y-3">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-in zoom-in-90 duration-300">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ការកក់ត្រូវបានបញ្ជាក់ជោគជ័យ (Verified)</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-heading">
            ការកក់របស់អ្នកទទួលបានជោគជ័យ!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            សំបុត្រអេឡិចត្រូនិច (E-Ticket) និងបង្កាន់ដៃត្រូវបានផ្ញើជូនទៅកាន់ <strong>{booking.contact_email}</strong>។
          </p>
        </div>

        {/* Printable E-Ticket Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-100 overflow-hidden print:border-none print:shadow-none">
          
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white p-4.5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <span className="text-[9px] sm:text-[10px] font-extrabold tracking-widest text-amber-400 uppercase">
                Official E-Ticket & Boarding Voucher
              </span>
              <h2 className="text-lg sm:text-2xl font-extrabold font-heading text-white mt-0.5">
                SR Tes Chor Tourism Platform
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Siem Reap, Kingdom of Cambodia
              </p>
            </div>
            <div className="self-stretch sm:self-auto sm:text-right bg-white/10 backdrop-blur-md px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-white/20 flex items-center justify-between sm:block">
              <span className="text-[9px] sm:text-[10px] font-semibold text-slate-300 block uppercase">
                លេខយោង (Ref)
              </span>
              <span translate="no" className="notranslate font-mono text-sm sm:text-base font-extrabold text-amber-300">
                #{booking.booking_reference}
              </span>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-4.5 sm:p-8 space-y-4 sm:space-y-6">
            
            {/* Experience & Business Info */}
            <div className="border-b border-slate-100 pb-4 sm:pb-6 space-y-1.5">
              <span className="text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">
                {booking.service_type || 'Reserved Activity'}
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                {booking.service?.name || 'Curated Siem Reap Tour Experience'}
              </h3>
              {booking.business && (
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>រៀបចំដោយ៖ <strong translate="no" className="notranslate text-slate-800">{booking.business.name}</strong></span>
                </p>
              )}
            </div>

            {/* Travel Specs Grid */}
            <div translate="no" className="notranslate grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 py-2 border-b border-slate-100">
              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">កាលបរិច្ឆេទ</span>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">{formatDateDisplay(booking.booking_date)}</span>
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">ម៉ោងចេញដំណើរ</span>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span className="truncate">{formatTimeDisplay(booking.booking_time)}</span>
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">ចំនួនភ្ញៀវ</span>
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>{booking.guests || 1} នាក់</span>
                </div>
              </div>

              <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-xl border border-slate-100/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">ស្ថានភាពទូទាត់</span>
                <div className="text-xs sm:text-sm font-extrabold text-emerald-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-mono">Paid (${Number(booking.total_amount || 0).toFixed(2)})</span>
                </div>
              </div>
            </div>

            {/* Guest & Pickup Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">ភ្ញៀវតំណាង</span>
                <p translate="no" className="notranslate font-bold text-slate-800">{booking.contact_name}</p>
                <p translate="no" className="notranslate text-slate-500">{booking.contact_phone} • {booking.contact_email}</p>
              </div>
              {booking.notes && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">ទីតាំងទទួល & សំណើ</span>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>

            {/* QR Code & Verification Section */}
            <div className="pt-4 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 bg-slate-50/70 p-4 sm:p-6 rounded-2xl">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-700 inline-block">
                  Scan at Venue
                </span>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900">បង្ហាញ QR Code នេះជូនមគ្គុទ្ទេសក៍ ឬសណ្ឋាគារ</h4>
                <p className="text-[11px] text-slate-500 leading-snug">
                  បង្ហាញលើអេក្រង់ទូរស័ព្ទរបស់អ្នក ឬបង្ហាញសំបុត្រដែលបានបោះពុម្ពពេលទៅដល់។
                </p>
                <p className="text-[10px] font-mono text-slate-400 pt-0.5">
                  Receipt ID: {receipt_number} • Issued: {issued_at}
                </p>
              </div>
              <div className="p-2.5 sm:p-3 bg-white rounded-2xl shadow-xs border border-slate-200 text-center shrink-0">
                <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-slate-900 mx-auto" />
                <span className="font-mono text-[8px] sm:text-[9px] font-bold text-slate-500 mt-1 block">
                  VERIFIED #{booking.booking_reference}
                </span>
              </div>
            </div>

          </div>

          {/* Ticket Footer Actions */}
          <div className="bg-slate-50 p-4 sm:px-8 sm:py-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 print:hidden">
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span>Print Ticket</span>
              </button>
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
                <span>E-Invoice</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
              <Link
                to="/my-trips"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs text-center whitespace-nowrap"
              >
                <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
                <span>Trip Plan</span>
              </Link>
              <Link
                to="/bookings"
                className="inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold transition-all shadow-md shadow-orange-500/20 text-center whitespace-nowrap"
              >
                <span>My Bookings</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Digital E-Invoice Modal */}
      {showInvoiceModal && booking && (
        <DigitalInvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          reference={booking.booking_reference}
        />
      )}

    </div>
  );
}
