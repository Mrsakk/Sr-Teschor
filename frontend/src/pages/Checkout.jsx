import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Sparkles, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  Lock, 
  ArrowLeft, 
  AlertCircle, 
  Building2, 
  Info,
  ChevronRight,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { bookingApi, serviceApi, packageApi } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import KhqrPaymentModal from '../components/payment/KhqrPaymentModal';

export default function Checkout() {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const isPackage = searchParams.get('type') === 'package';
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [item, setItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(true);
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [khqrReference, setKhqrReference] = useState('');

  // Form State
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('08:30 AM');
  const [guests, setGuests] = useState(2);
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+855 ');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [pickupLocation, setPickupLocation] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('khqr');

  // Calculation Quote from Server
  const [quote, setQuote] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Service or Package
  useEffect(() => {
    const fetchTarget = async () => {
      setLoadingItem(true);
      try {
        if (isPackage) {
          const res = await packageApi.getById(serviceId);
          setItem(res.data);
        } else {
          const res = await serviceApi.getById(serviceId);
          setItem(res.data);
        }
      } catch (err) {
        console.error('Failed to load booking item', err);
        setErrorMsg('Service not found or unavailable for booking.');
      } finally {
        setLoadingItem(false);
      }
    };
    fetchTarget();
  }, [serviceId, isPackage]);

  // Sync user details when auth loaded
  useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.name || '');
      if (contactPhone === '+855 ' && user.phone) setContactPhone(user.phone);
      if (!contactEmail) setContactEmail(user.email || '');
    }
  }, [user]);

  // Recalculate price whenever guests or applied promo changes
  useEffect(() => {
    if (!serviceId) return;

    const calculate = async () => {
      setCalculating(true);
      setErrorMsg('');
      try {
        const res = await bookingApi.calculateQuote({
          service_id: Number(serviceId),
          guests: Number(guests),
          promo_code: appliedPromo || undefined,
          is_package: isPackage,
        });
        setQuote(res.data);
      } catch (err) {
        console.error('Quote calculation error', err);
        setErrorMsg('Failed to calculate pricing quote.');
      } finally {
        setCalculating(false);
      }
    };

    calculate();
  }, [serviceId, guests, appliedPromo, isPackage]);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    setAppliedPromo(promoCodeInput.trim());
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setPromoCodeInput('');
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      setErrorMsg('Please complete all contact information fields.');
      return;
    }

    setErrorMsg('');

    // If user chose Bakong KHQR, trigger the interactive KHQR payment modal first
    if (paymentMethod === 'khqr' || paymentMethod === 'bakong') {
      const generatedRef = 'TC-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setKhqrReference(generatedRef);
      setShowKhqrModal(true);
      return;
    }

    // Otherwise process standard card or direct checkout
    await processCheckoutSubmission();
  };

  const processCheckoutSubmission = async () => {
    setProcessing(true);
    setErrorMsg('');

    try {
      const payload = {
        service_id: Number(serviceId),
        booking_date: bookingDate,
        booking_time: bookingTime,
        guests: Number(guests),
        contact_name: contactName.trim(),
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
        pickup_location: pickupLocation.trim(),
        special_requests: specialRequests.trim(),
        promo_code: appliedPromo || null,
        payment_method: paymentMethod,
        is_package: isPackage,
      };

      const res = await bookingApi.checkout(payload);
      const booking = res.data.booking;
      
      // Navigate to confirmation receipt screen
      navigate(`/booking/confirmation/${booking.id}`);
    } catch (err) {
      console.error('Booking checkout error', err);
      setErrorMsg(err.response?.data?.message || 'Payment or checkout failed. Please check your information and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleKhqrSuccess = async (verifiedData) => {
    setShowKhqrModal(false);
    await processCheckoutSubmission();
  };

  if (loadingItem) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center pt-28 pb-20 space-y-3">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Preparing secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="pt-20 sm:pt-28 pb-36 sm:pb-24 bg-slate-50/60 min-h-screen">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Title */}
        <div className="mb-6 sm:mb-8">
          <Link
            to={isPackage ? "/packages" : (item?.business ? `/businesses/${item.business.slug}` : "/destinations")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-2.5 sm:mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>ត្រឡប់ក្រោយ ({isPackage ? "Travel Packages" : (item?.business?.name || "Services")})</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-600">
                Guaranteed Direct Reservation
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                ទូទាត់ប្រាក់ និងកក់សេវាកម្ម (Checkout)
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] sm:text-xs font-bold shadow-2xs self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span>ធានាសុវត្ថិភាពផ្លូវការ (Official Protected)</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          {/* LEFT COLUMN: Booking Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Step 1: Selected Experience Summary */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3 sm:gap-4">
                {item?.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover shrink-0 shadow-2xs"
                  />
                )}
                <div className="space-y-1 min-w-0 flex-1">
                  <span className="inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-orange-100 text-orange-700 uppercase tracking-wide">
                    {isPackage ? 'Curated Package' : (item?.type || 'Local Experience')}
                  </span>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug line-clamp-2">
                    {item?.name}
                  </h3>
                  {item?.business && (
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.business.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Schedule & Guests */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-3 sm:space-y-4">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>១. កាលបរិច្ឆេទ និងចំនួនភ្ញៀវ (Schedule & Guests)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Date */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    កាលបរិច្ឆេទ (Date)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50/50"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ពេលវេលា (Time)
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="05:00 AM">05:00 AM (Angkor Sunrise)</option>
                    <option value="08:00 AM">08:00 AM (Morning Tour)</option>
                    <option value="11:30 AM">11:30 AM (Lunch / Noon)</option>
                    <option value="02:00 PM">02:00 PM (Afternoon)</option>
                    <option value="04:30 PM">04:30 PM (Sunset Experience)</option>
                    <option value="06:30 PM">06:30 PM (Dinner & Nightlife)</option>
                  </select>
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    ចំនួនភ្ញៀវ (Guests)
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-xs font-extrabold text-slate-800">
                      {guests} {guests > 1 ? 'នាក់' : 'នាក់'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.min(20, g + 1))}
                      className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Contact & Pickup Details */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-3 sm:space-y-4">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                <span>២. ព័ត៌មានទំនាក់ទំនង (Contact Details)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    ឈ្មោះពេញ (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sok Dara / John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    លេខទូរស័ព្ទ / Telegram / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    អ៊ីមែលទទួលសំបុត្រ (Email for E-Ticket) *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50/50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    ទីតាំងទទួល (Hotel Pickup Location - Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="ឈ្មោះសណ្ឋាគារ លេខបន្ទប់ ឬអាសយដ្ឋាននៅសៀមរាប"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    សំណើពិសេស (Special Requests)
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="ម្ហូបបួស, កៅអីក្មេង, មគ្គុទ្ទេសក៍និយាយខ្មែរ/អង់គ្លេស..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:border-orange-500 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Payment Method Selection */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs space-y-3 sm:space-y-4">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-500" />
                <span>៣. ជ្រើសរើសវិធីសាស្ត្រទូទាត់ (Payment Method)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                
                {/* KHQR (Recommended in Cambodia) */}
                <div
                  onClick={() => setPaymentMethod('khqr')}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'khqr'
                      ? 'border-orange-500 bg-orange-50/40 shadow-xs ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                    KHQR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900">Bakong KHQR</h4>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        ពេញនិយម
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      ស្កេនជាមួយ ABA, ACLEDA, Wing ឬគ្រប់ App ធនាគារក្នុងស្រុក។
                    </p>
                  </div>
                </div>

                {/* Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50/40 shadow-xs ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Visa / Mastercard</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      កាតអន្តរជាតិមានប្រព័ន្ធការពារសុវត្ថិភាព 3D Secure។
                    </p>
                  </div>
                </div>

                {/* Bakong Direct */}
                <div
                  onClick={() => setPaymentMethod('bakong')}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'bakong'
                      ? 'border-orange-500 bg-orange-50/40 shadow-xs ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Bakong Wallet</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      កាត់ប្រាក់ដោយផ្ទាល់ មិនគិតថ្លៃសេវាបន្ថែម។
                    </p>
                  </div>
                </div>

                {/* Cash on Arrival */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'cash'
                      ? 'border-orange-500 bg-orange-50/40 shadow-xs ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    💵
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">ទូទាត់ផ្ទាល់ពេលទៅដល់</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      ទូទាត់ប្រាក់សុទ្ធ (USD/KHR) ជូនមគ្គុទ្ទេសក៍ ឬសណ្ឋាគារ។
                    </p>
                  </div>
                </div>

              </div>

              {/* KHQR Live Mockup Preview */}
              {paymentMethod === 'khqr' && quote && (
                <div className="mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-950 via-slate-900 to-slate-950 text-white flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  <div className="p-2 bg-white rounded-xl shrink-0 shadow-lg text-slate-900 flex flex-col items-center">
                    <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-slate-900" />
                    <span className="text-[9px] font-extrabold text-red-600 mt-1">KHQR PAY</span>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                      Instant Confirmation
                    </span>
                    <h5 className="font-bold text-xs sm:text-sm text-white">ស្កេនទូទាត់ជាមួយ Bakong ឬ App ធនាគារ</h5>
                    <p className="text-xs text-slate-300">
                      ចំនួនទឹកប្រាក់៖ <strong className="text-amber-300">${quote.total_amount.toFixed(2)} USD</strong> (៛{quote.total_amount_khr.toLocaleString()} KHR)
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Merchant: SR Tes Chor Tourism Platform • Ref: TC-{new Date().getFullYear()}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Price Breakdown (5 Cols Sticky) */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6 lg:sticky lg:top-28">
            
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4.5 sm:p-6 border border-slate-100 shadow-xl space-y-4 sm:space-y-5">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>សេចក្តីសង្ខេបនៃការកក់ (Summary)</span>
                <span className="text-xs font-semibold text-slate-400">
                  {guests} {guests > 1 ? 'សំបុត្រ' : 'សំបុត្រ'}
                </span>
              </h3>

              {/* Price Breakdown from Server */}
              {calculating ? (
                <div className="py-6 sm:py-8 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 text-orange-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">កំពុងគណនាតម្លៃ...</p>
                </div>
              ) : quote ? (
                <div className="space-y-2.5 sm:space-y-3 text-xs">
                  
                  <div className="flex items-center justify-between text-slate-600">
                    <span>
                      ${quote.unit_price.toFixed(2)} × {quote.quantity} {quote.quantity > 1 ? 'នាក់' : 'នាក់'}
                    </span>
                    <span className="font-bold text-slate-800">${quote.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>សេវាប្រព័ន្ធ (Platform Fee)</span>
                      <Info className="w-3 h-3 text-slate-400" title="Includes 24/7 travel support and platform protection" />
                    </span>
                    <span className="font-bold text-slate-800">${quote.service_fee.toFixed(2)}</span>
                  </div>

                  {quote.discount_amount > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>កូដបញ្ចុះតម្លៃ ({quote.promo_code})</span>
                      </span>
                      <span>-${quote.discount_amount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">តម្លៃសរុប (Total)</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400">
                        អត្រាប្តូរប្រាក់៖ $1 = ៛{quote.exchange_rate} KHR
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-extrabold text-orange-600 block">
                        ${quote.total_amount.toFixed(2)}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                        ៛{quote.total_amount_khr.toLocaleString()} KHR
                      </span>
                    </div>
                  </div>

                </div>
              ) : null}

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-slate-100">
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs">
                    <div className="flex items-center gap-1.5 text-orange-800 font-bold">
                      <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>បានប្រើកូដ "{appliedPromo}"</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[11px] font-extrabold text-red-600 hover:underline cursor-pointer"
                    >
                      លុបចេញ
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="កូដបញ្ចុះតម្លៃ (Promo Code)"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      ប្រើ
                    </button>
                  </form>
                )}
              </div>

              {/* Security & Guarantees Badge */}
              <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 text-[10px] sm:text-[11px] text-slate-500 space-y-1 border border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ប្រព័ន្ធសុវត្ថិភាព 256-bit SSL Encrypted</span>
                </div>
                <p className="leading-tight">
                  អាចលុបចោលឥតគិតថ្លៃរហូតដល់ ៤៨ ម៉ោងមុនកាលបរិច្ឆេទ។ គ្មានកម្រៃសេវាលាក់កំបាំង។
                </p>
              </div>

              {/* Main Pay / Book CTA Button */}
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={processing || calculating || !quote}
                className="w-full py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>កំពុងដំណើរការទូទាត់ប្រាក់...</span>
                  </>
                ) : (
                  <>
                    <span>យល់ព្រម និងទូទាត់ប្រាក់ ${quote ? quote.total_amount.toFixed(2) : '...'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Bakong KHQR Modal */}
      {showKhqrModal && quote && (
        <KhqrPaymentModal
          isOpen={showKhqrModal}
          onClose={() => setShowKhqrModal(false)}
          amount={quote.total_amount}
          itemTitle={quote.service_name || 'SR TesChor Experience'}
          type={isPackage ? 'package' : 'booking'}
          reference={khqrReference}
          onSuccess={handleKhqrSuccess}
        />
      )}

    </div>
  );
}
