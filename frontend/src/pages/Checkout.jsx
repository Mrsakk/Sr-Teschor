import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { getFullImageUrl } from '../utils/imageUrl';
import KhqrPaymentModal from '../components/payment/KhqrPaymentModal';

export default function Checkout() {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const isPackage = searchParams.get('type') === 'package';
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  // Instant navigation state (if coming from BusinessDetail or TravelPackages)
  const navStateItem = location.state?.item || location.state?.service || location.state?.package || null;

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
  const [serverQuote, setServerQuote] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Instant Item Fetch via TanStack Query (Cached + Nav State) ──
  const { data: itemData, isLoading: loadingItem } = useQuery({
    queryKey: [isPackage ? 'package' : 'service', serviceId],
    queryFn: async () => {
      if (isPackage) {
        const res = await packageApi.getById(serviceId);
        return res.data;
      } else {
        const res = await serviceApi.getById(serviceId);
        return res.data;
      }
    },
    initialData: navStateItem || undefined,
    placeholderData: () => {
      if (navStateItem) return navStateItem;
      if (isPackage) {
        const packagesQueries = queryClient.getQueriesData({ queryKey: ['packages'] });
        for (const [, qData] of packagesQueries) {
          const list = Array.isArray(qData) ? qData : (qData?.data || []);
          const found = list.find(p => String(p.id) === String(serviceId));
          if (found) return found;
        }
      } else {
        const businessQueries = queryClient.getQueriesData({ queryKey: ['businesses'] });
        for (const [, qData] of businessQueries) {
          const list = Array.isArray(qData) ? qData : (qData?.data || []);
          for (const b of list) {
            const foundServ = b.services?.find(s => String(s.id) === String(serviceId));
            if (foundServ) return { ...foundServ, business: b };
          }
        }
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });

  const item = itemData || navStateItem;

  // Sync user details when auth loaded
  useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.name || '');
      if (contactPhone === '+855 ' && user.phone) setContactPhone(user.phone);
      if (!contactEmail) setContactEmail(user.email || '');
    }
  }, [user]);

  // ── Instant Client-Side Reactive Quote (0ms delay on entry) ──
  const effectiveQuote = useMemo(() => {
    const rawPrice = Number(item?.price || item?.sale_price || item?.package_price || 0);
    const qty = Number(guests) || 1;
    const subtotal = rawPrice * qty;
    const serviceFee = 0; // standard platform free
    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo === 'DISCOUNT10' || appliedPromo === 'WELCOME10') {
        discount = subtotal * 0.1;
      } else {
        discount = Math.min(subtotal, 5);
      }
    }
    const total = Math.max(0, subtotal + serviceFee - discount);
    const exchangeRate = 4100;

    // Use server quote if available and matched, otherwise use instant local quote
    if (serverQuote && serverQuote.quantity === qty && (!appliedPromo || serverQuote.promo_code === appliedPromo)) {
      return serverQuote;
    }

    if (rawPrice > 0) {
      return {
        unit_price: rawPrice,
        quantity: qty,
        subtotal: subtotal,
        service_fee: serviceFee,
        discount_amount: discount,
        promo_code: appliedPromo || null,
        total_amount: total,
        total_amount_khr: Math.round(total * exchangeRate),
        exchange_rate: exchangeRate,
        service_name: item?.name || 'SR TesChor Reservation',
      };
    }

    return serverQuote;
  }, [item, guests, appliedPromo, serverQuote]);

  // Server quote validation in background
  useEffect(() => {
    if (!serviceId) return;

    let isMounted = true;
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
        if (isMounted && res.data) {
          setServerQuote(res.data);
        }
      } catch (err) {
        console.error('Quote calculation background check', err);
      } finally {
        if (isMounted) setCalculating(false);
      }
    };

    calculate();
    return () => { isMounted = false; };
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
    if (e) e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    if (!contactName.trim() || !contactPhone.trim() || !contactEmail.trim()) {
      setErrorMsg('សូមបំពេញព័ត៌មានទំនាក់ទំនងឱ្យបានពេញលេញ (Please complete contact information).');
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
      setErrorMsg(err.response?.data?.message || 'Failed to complete payment. Please check your information again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleKhqrSuccess = async (verifiedData) => {
    setShowKhqrModal(false);
    await processCheckoutSubmission();
  };

  return (
    <div className="pt-20 sm:pt-28 pb-36 sm:pb-24 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Title */}
        <div className="mb-6 sm:mb-8">
          <Link
            to={isPackage ? "/packages" : (item?.business ? `/businesses/${item.business.slug}` : "/destinations")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors mb-2.5 sm:mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Back to ({isPackage ? "Travel Packages" : (item?.business?.name || "Services")})</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-600">
                Guaranteed Direct Reservation
              </span>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                Payment & Booking Confirmation (Checkout)
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] sm:text-xs font-bold shadow-2xs self-start sm:self-auto">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span>Official Protected</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 sm:mb-6 p-3.5 sm:p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          {/* LEFT COLUMN: Booking Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            
            {/* Step 1: Summary of Service Selected */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
              {item ? (
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={getFullImageUrl(item.image || item.cover_image)}
                    alt={item.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0 shadow-2xs border border-slate-100"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wide">
                      {isPackage ? 'Curated Package' : (item.type || 'Local Experience')}
                    </span>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug line-clamp-2 font-heading">
                      {item.name}
                    </h3>
                    {item.business && (
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{item.business.name}</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 sm:gap-4 animate-pulse">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="w-24 h-4 bg-slate-200 rounded-full" />
                    <div className="w-48 h-5 bg-slate-200 rounded-lg" />
                    <div className="w-32 h-3 bg-slate-200 rounded" />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Schedule & Guests */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Schedule & Guests</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Date */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-600 bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Time
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-600 bg-slate-50 focus:bg-white cursor-pointer"
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
                    Guests
                  </label>
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="px-3.5 py-2.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-xs font-extrabold text-slate-900">
                      {guests} guests
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
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-600" />
                <span>Contact Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Sok Dara / John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-600 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Phone Number / Telegram / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+855 12 345 678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-600 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Email for E-Ticket *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-600 bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Hotel Pickup Location (Optional)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder="ឈ្មោះសណ្ឋាគារ លេខបន្ទប់ ឬអាសយដ្ឋាននៅសៀមរាប"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-orange-600 bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Special Requests
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="ម្ហូបបួស, កៅអីក្មេង, មគ្គុទ្ទេសក៍និយាយខ្មែរ/អង់គ្លេស..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:border-orange-600 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Payment Method Selection */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-orange-600" />
                <span>Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* KHQR */}
                <div
                  onClick={() => setPaymentMethod('khqr')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'khqr'
                      ? 'border-orange-600 bg-orange-50/40 shadow-xs ring-2 ring-orange-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-2xs">
                    KHQR
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900">Bakong KHQR</h4>
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                        Popular
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Scan with ABA, ACLEDA, Wing or all local bank apps.
                    </p>
                  </div>
                </div>

                {/* Credit / Debit Card */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'card'
                      ? 'border-orange-600 bg-orange-50/40 shadow-xs ring-2 ring-orange-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Visa / Mastercard</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      International cards with 3D Secure protection.
                    </p>
                  </div>
                </div>

                {/* Bakong Direct */}
                <div
                  onClick={() => setPaymentMethod('bakong')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'bakong'
                      ? 'border-orange-600 bg-orange-50/40 shadow-xs ring-2 ring-orange-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Bakong Wallet</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Direct debit, no extra fees.
                    </p>
                  </div>
                </div>

                {/* Cash on Arrival */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    paymentMethod === 'cash'
                      ? 'border-orange-600 bg-orange-50/40 shadow-xs ring-2 ring-orange-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    💵
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Cash on Arrival</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Cash payment (USD/KHR) to guide or hotel.
                    </p>
                  </div>
                </div>

              </div>

              {/* KHQR Live Mockup Preview */}
              {paymentMethod === 'khqr' && effectiveQuote && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2 bg-white rounded-xl shrink-0 shadow-xs text-slate-900 flex flex-col items-center">
                    <QrCode className="w-20 h-20 sm:w-24 sm:h-24 text-slate-900" />
                    <span className="text-[9px] font-extrabold text-orange-600 mt-1">KHQR PAY</span>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                      Instant Confirmation
                    </span>
                    <h5 className="font-bold text-xs sm:text-sm text-white">Scan to pay with Bakong or bank app</h5>
                    <p className="text-xs text-slate-300">
                      Amount: <strong className="text-white">${effectiveQuote.total_amount.toFixed(2)} USD</strong> (៛{effectiveQuote.total_amount_khr.toLocaleString()} KHR)
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
            
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4 sm:space-y-5">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between font-heading">
                <span>Order Summary</span>
                <span className="text-xs font-semibold text-slate-400">
                  {guests} {guests > 1 ? 'សំបុត្រ' : 'សំបុត្រ'}
                </span>
              </h3>

              {/* Instant Price Breakdown */}
              {effectiveQuote ? (
                <div className="space-y-2.5 sm:space-y-3 text-xs">
                  
                  <div className="flex items-center justify-between text-slate-600">
                    <span>
                      ${effectiveQuote.unit_price.toFixed(2)} × {effectiveQuote.quantity} {effectiveQuote.quantity > 1 ? 'នាក់' : 'នាក់'}
                    </span>
                    <span className="font-bold text-slate-800">${effectiveQuote.subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span>Platform Fee</span>
                      <Info className="w-3 h-3 text-slate-400" title="Includes 24/7 travel support and platform protection" />
                    </span>
                    <span className="font-bold text-emerald-700">
                      {effectiveQuote.service_fee > 0 ? `$${effectiveQuote.service_fee.toFixed(2)}` : 'Free'}
                    </span>
                  </div>

                  {effectiveQuote.discount_amount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Discount Code ({effectiveQuote.promo_code})</span>
                      </span>
                      <span>-${effectiveQuote.discount_amount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900 block font-heading">Total</span>
                      <span className="text-[10px] sm:text-[11px] text-slate-400">
                        Exchange rate: $1 = ៛{effectiveQuote.exchange_rate} KHR
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-extrabold text-orange-600 block">
                        ${effectiveQuote.total_amount.toFixed(2)}
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-500">
                        ៛{effectiveQuote.total_amount_khr.toLocaleString()} KHR
                      </span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="py-6 sm:py-8 text-center space-y-2 animate-pulse">
                  <div className="w-32 h-4 bg-slate-200 rounded mx-auto" />
                  <div className="w-48 h-8 bg-slate-200 rounded-lg mx-auto" />
                </div>
              )}

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-slate-100">
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-xs">
                    <div className="flex items-center gap-1.5 text-orange-800 font-bold">
                      <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>Used code "{appliedPromo}"</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[11px] font-extrabold text-rose-600 hover:underline cursor-pointer"
                    >
                      Remove
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
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold uppercase placeholder:normal-case placeholder-slate-400 focus:outline-none focus:border-orange-600 bg-slate-50 focus:bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                    >
                      Use
                    </button>
                  </form>
                )}
              </div>

              {/* Security & Guarantees Badge */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-slate-50 text-[10px] sm:text-[11px] text-slate-500 space-y-1 border border-slate-200">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>256-bit SSL Encrypted Security System</span>
                </div>
                <p className="leading-tight">
                  Free cancellation up to 48 hours before the date. No hidden service fees.
                </p>
              </div>

              {/* Main Pay / Book CTA Button */}
              <button
                type="button"
                onClick={handleSubmitBooking}
                disabled={processing || !effectiveQuote}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing payment...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm and Pay ${effectiveQuote ? effectiveQuote.total_amount.toFixed(2) : '...'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Bakong KHQR Modal */}
      {showKhqrModal && effectiveQuote && (
        <KhqrPaymentModal
          isOpen={showKhqrModal}
          onClose={() => setShowKhqrModal(false)}
          amount={effectiveQuote.total_amount}
          itemTitle={effectiveQuote.service_name || 'SR TesChor Experience'}
          type={isPackage ? 'package' : 'booking'}
          reference={khqrReference}
          onSuccess={handleKhqrSuccess}
        />
      )}

    </div>
  );
}
