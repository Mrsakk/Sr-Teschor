import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  Zap,
  QrCode,
  TrendingUp,
  Award,
  Crown
} from 'lucide-react';
import { subscriptionApi, businessApi } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import KhqrPaymentModal from '../components/payment/KhqrPaymentModal';

export default function Pricing() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [khqrModalOpen, setKhqrModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    subscriptionApi.getPlans().then((res) => {
      setPlans(res.data.plans || []);
    }).catch(err => {
      console.warn('Using fallback plans', err);
      setPlans([
        {
          id: 'free',
          name: 'FREE',
          price: 0,
          period: 'Forever',
          description: 'Essential presence for local businesses and emerging artisans in Siem Reap.',
          features: [
            'Basic Business Profile',
            'Up to 5 Photos in Gallery',
            'Listed in Business Directory',
            'Customer Reviews & Ratings',
            'Direct Customer Messaging',
          ],
          popular: false,
        },
        {
          id: 'pro',
          name: 'PRO PARTNER',
          price: 10,
          period: 'per month',
          description: 'Boost bookings, create special discounts, and rank higher in search results.',
          features: [
            'Featured In Category Listings (#1 spot)',
            'Unlimited Photo & Video Uploads',
            'Promotions & Coupon Code Creation',
            'Business Performance & View Analytics',
            'Priority Customer Support',
            'Direct Telegram Booking Channel',
          ],
          popular: true,
        },
        {
          id: 'premium',
          name: 'PREMIUM VIP',
          price: 20,
          period: 'per month',
          description: 'Maximum exposure with Homepage Spotlight, Top Search badge, and VIP analytics.',
          features: [
            'Homepage Hero Feature Spotlight',
            '#1 Placement in Top Search Results',
            'Gold "Verified Partner" Badge',
            'Custom QR Code Standee Print Asset',
            'Advanced Customer Insights & Reports',
            'Zero Booking Commission Fee',
          ],
          popular: false,
        },
      ]);
    });

    if (isAuthenticated && (user?.role === 'business' || user?.role === 'admin')) {
      businessApi.getMyBusinesses().then((res) => {
        setMyBusinesses(res.data || []);
        if (res.data.length > 0) setSelectedBusinessId(res.data[0].id);
      }).catch(console.error);
    }
  }, [isAuthenticated, user]);

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/register?role=business');
      return;
    }
    if (user?.role !== 'business' && user?.role !== 'admin') {
      navigate('/business/dashboard');
      return;
    }
    setSelectedPlan(plan);
  };

  const handleOpenKhqr = () => {
    if (!selectedBusinessId || !selectedPlan) return;
    if (selectedPlan.price === 0) {
      // Free plan instant activation
      handleConfirmUpgrade('Free Activation');
      return;
    }
    setKhqrModalOpen(true);
  };

  const handleConfirmUpgrade = async (paymentMethod = 'Bakong KHQR') => {
    if (!selectedBusinessId || !selectedPlan) return;
    setUpgrading(true);
    try {
      const res = await subscriptionApi.upgrade({
        business_id: Number(selectedBusinessId),
        plan: selectedPlan.id,
        payment_method: paymentMethod,
      });
      setSuccessMessage(res.data.message);
      setTimeout(() => {
        setKhqrModalOpen(false);
        setSelectedPlan(null);
        setSuccessMessage(null);
        navigate('/business/dashboard');
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setUpgrading(false);
    }
  };

  const currentBusinessObj = myBusinesses.find(b => b.id === Number(selectedBusinessId)) || myBusinesses[0];

  const [calcSpend, setCalcSpend] = useState(25);
  const [calcGuests, setCalcGuests] = useState(40);

  const totalRev = calcSpend * calcGuests;
  const netProfit = totalRev - (billingCycle === 'annual' ? 8 : 10);
  const roiPct = Math.round((netProfit / (billingCycle === 'annual' ? 8 : 10)) * 100);

  return (
    <div className="pt-20 sm:pt-28 pb-28 sm:pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-16 notranslate" translate="no">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>កញ្ចប់សមាជិកភាព និងផ្សព្វផ្សាយ (Partner Growth)</span>
        </span>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading leading-tight">
          បង្កើនអតិថិជន និងប្រាក់ចំណូលអាជីវកម្មរបស់អ្នក
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          ភ្ជាប់ទំនាក់ទំនងជាមួយភ្ញៀវទេសចរជាតិ និងអន្តរជាតិរាប់ពាន់នាក់នៅសៀមរាប។ ជ្រើសរើសកញ្ចប់ដែលស័ក្តិសមបំផុតសម្រាប់អាជីវកម្មរបស់អ្នក។
        </p>

        {/* Billing Cycle Switch */}
        <div className="inline-flex items-center bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-inner mt-1 sm:mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            បង់ប្រចាំខែ (Monthly)
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'annual'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>ប្រចាំឆ្នាំ (Annual)</span>
            <span className="text-[9px] sm:text-[10px] bg-amber-300 text-amber-900 font-black px-1.5 py-0.2 rounded-md">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 items-stretch pt-2 sm:pt-0">
        {plans.map((plan) => {
          const isPro = plan.id === 'pro';
          const isPremium = plan.id === 'premium';
          
          let displayPrice = plan.price;
          if (billingCycle === 'annual' && plan.price > 0) {
            displayPrice = (plan.price * 12 * 0.8).toFixed(0);
          }

          return (
            <div
              key={plan.id}
              className={`rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'bg-slate-900 text-white shadow-2xl ring-2 ring-orange-500 sm:scale-102'
                  : isPremium
                  ? 'bg-gradient-to-b from-amber-950 via-slate-900 to-slate-950 text-white border border-amber-500/40 shadow-xl'
                  : 'bg-white text-slate-900 border border-slate-100 shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-3 h-3" /> ពេញនិយមបំផុត (Most Popular)
                </div>
              )}

              {isPremium && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full shadow-md flex items-center gap-1 whitespace-nowrap">
                  <Crown className="w-3.5 h-3.5" /> VIP បង្ហាញមុខមុនគេ (Highest Exposure)
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className={`text-lg sm:text-xl font-black ${isPro || isPremium ? 'text-white' : 'text-slate-900'} font-heading`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mt-1 ${isPro || isPremium ? 'text-slate-300' : 'text-slate-500'} leading-relaxed`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl sm:text-4xl font-extrabold ${isPro || isPremium ? 'text-white' : 'text-slate-900'}`}>
                    ${displayPrice}
                  </span>
                  <span className={`text-xs ${isPro || isPremium ? 'text-slate-400' : 'text-slate-400'}`}>
                    /{billingCycle === 'annual' && plan.price > 0 ? 'year' : plan.period}
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 sm:space-y-3 pt-3.5 sm:pt-4 border-t border-slate-100/10 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isPremium 
                          ? 'bg-amber-400 text-slate-950 font-bold' 
                          : isPro 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={isPro || isPremium ? 'text-slate-200' : 'text-slate-700'}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 sm:pt-8">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer ${
                    isPremium
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 shadow-amber-500/25'
                      : isPro
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white shadow-orange-500/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isAuthenticated 
                    ? (user?.role === 'business' || user?.role === 'admin' 
                        ? `ជ្រើសរើស ${plan.name}` 
                        : 'ចូលផ្ទាំងគ្រប់គ្រង (Dashboard)') 
                    : 'ចុះឈ្មោះអាជីវកម្ម (Register Business)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2. INTERACTIVE ROI REVENUE CALCULATOR FOR BUSINESSES ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-10 text-white border border-slate-700/60 shadow-2xl space-y-6 sm:space-y-8 notranslate" translate="no">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-slate-700/60 pb-4 sm:pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-[11px] sm:text-xs font-extrabold border border-orange-500/30 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>ម៉ាស៊ីនគណនាប្រាក់ចំណេញ (ROI Calculator)</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white font-heading">
              តើអាជីវកម្មរបស់អ្នកនឹងចំណេញប៉ុន្មានជាមួយ SR TesChor?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              ប៉ាន់ស្មានប្រាក់ចំណូល និងផលចំណេញប្រចាំខែពីចំនួនភ្ញៀវទេសចរនៅលើប្រព័ន្ធរបស់យើង។
            </p>
          </div>
          <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-400 block font-semibold">តម្លៃកញ្ចប់ Pro Partner:</span>
            <span className="text-lg sm:text-xl font-black text-orange-400">$10.00 / ខែ</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center notranslate" translate="no">
          
          {/* Sliders Input */}
          <div className="space-y-6 bg-slate-950/50 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-inner notranslate" translate="no">
            
            {/* Slider 1: Average Spend per Guest */}
            <div className="space-y-2.5 notranslate" translate="no">
              <div className="flex justify-between items-center text-xs font-bold notranslate" translate="no">
                <span className="text-slate-300 notranslate" translate="no">ការចំណាយជាមធ្យម / ភ្ញៀវម្នាក់</span>
                <span key={`spend-${calcSpend}`} className="text-orange-400 font-extrabold text-base px-2.5 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 notranslate" translate="no">
                  ${calcSpend} / ភ្ញៀវ
                </span>
              </div>
              <input
                id="spend-slider"
                type="range"
                min="5"
                max="150"
                step="5"
                value={calcSpend}
                className="w-full accent-orange-500 cursor-pointer h-2.5 bg-slate-800 rounded-lg touch-none"
                onChange={(e) => setCalcSpend(Number(e.target.value))}
                onInput={(e) => setCalcSpend(Number(e.target.value))}
              />
              
              {/* Quick Presets for Spend */}
              <div className="flex items-center gap-1.5 pt-1 notranslate" translate="no">
                <span className="text-[10px] text-slate-400 shrink-0 notranslate" translate="no">រើសរហ័ស:</span>
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={`btn-spend-${val}`}
                    id={`btn-spend-${val}`}
                    type="button"
                    onClick={() => setCalcSpend(val)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer notranslate ${
                      calcSpend === val
                        ? 'bg-orange-500 text-white ring-2 ring-orange-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    translate="no"
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 2: Additional Guests per Month */}
            <div className="space-y-2.5 notranslate" translate="no">
              <div className="flex justify-between items-center text-xs font-bold notranslate" translate="no">
                <span className="text-slate-300 notranslate" translate="no">ចំនួនភ្ញៀវប៉ាន់ស្មានបន្ថែម / ខែ</span>
                <span key={`guests-${calcGuests}`} className="text-emerald-400 font-extrabold text-base px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 notranslate" translate="no">
                  {calcGuests} នាក់ / ខែ
                </span>
              </div>
              <input
                id="guests-slider"
                type="range"
                min="5"
                max="200"
                step="5"
                value={calcGuests}
                className="w-full accent-emerald-500 cursor-pointer h-2.5 bg-slate-800 rounded-lg touch-none"
                onChange={(e) => setCalcGuests(Number(e.target.value))}
                onInput={(e) => setCalcGuests(Number(e.target.value))}
              />

              {/* Quick Presets for Guests */}
              <div className="flex items-center gap-1.5 pt-1 notranslate" translate="no">
                <span className="text-[10px] text-slate-400 shrink-0 notranslate" translate="no">រើសរហ័ស:</span>
                {[20, 40, 80, 150].map((val) => (
                  <button
                    key={`btn-guests-${val}`}
                    id={`btn-guests-${val}`}
                    type="button"
                    onClick={() => setCalcGuests(val)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer notranslate ${
                      calcGuests === val
                        ? 'bg-emerald-500 text-white ring-2 ring-emerald-400'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    translate="no"
                  >
                    {val} នាក់
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Calculator Output Display Card */}
          <div className="bg-gradient-to-br from-orange-600/20 via-amber-600/10 to-transparent p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-orange-500/30 text-center space-y-4 notranslate" translate="no">
            
            <div className="space-y-1 notranslate" translate="no">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-300 notranslate" translate="no">
                ប្រាក់ចំណូលប៉ាន់ស្មានប្រចាំខែ
              </span>
              <div key={`rev-${totalRev}`} className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight notranslate" translate="no">
                +${totalRev.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-3 border-t border-slate-700/60 text-left notranslate" translate="no">
              <div className="bg-slate-900/80 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 notranslate" translate="no">
                <span className="text-[10px] text-slate-400 font-bold block notranslate" translate="no">ប្រាក់ចំណេញសុទ្ធ</span>
                <span key={`profit-${netProfit}`} className="text-base sm:text-xl font-extrabold text-emerald-400 mt-0.5 block truncate notranslate" translate="no">
                  +${netProfit.toLocaleString()}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block notranslate" translate="no">ដកថ្លៃកញ្ចប់ $10</span>
              </div>

              <div className="bg-slate-900/80 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 notranslate" translate="no">
                <span className="text-[10px] text-slate-400 font-bold block notranslate" translate="no">ផលចំណេញ (ROI)</span>
                <span key={`roi-${roiPct}`} className="text-base sm:text-xl font-extrabold text-amber-400 mt-0.5 block truncate notranslate" translate="no">
                  +{roiPct.toLocaleString()}%
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block notranslate" translate="no">ទទួលបានផលចំណេញខ្ពស់</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Plan Selection Confirmation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-2xl animate-in zoom-in-95">
            <h3 className="font-extrabold text-xl text-slate-900">
              Upgrade to {selectedPlan.name} Plan
            </h3>

            {successMessage ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-bold">
                ✓ {successMessage}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Select Your Business Listing
                  </label>
                  {myBusinesses.length === 0 ? (
                    <p className="text-xs text-red-600">Please register a business first before subscribing.</p>
                  ) : (
                    <select
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      {myBusinesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} (Current: {b.subscription_plan || 'free'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-xs space-y-1">
                  <p className="font-bold text-slate-900">Subscription Summary:</p>
                  <p className="text-slate-600">Plan: <strong>{selectedPlan.name}</strong></p>
                  <p className="text-slate-600">Price: <strong>${selectedPlan.price} / month</strong></p>
                  <p className="text-slate-500 text-[11px] pt-1">
                    Payment Gateway: <strong>Bakong Universal KHQR (Scan & Pay)</strong>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={myBusinesses.length === 0}
                    onClick={handleOpenKhqr}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Proceed to KHQR Pay</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bakong KHQR Payment Modal */}
      {selectedPlan && selectedPlan.price > 0 && (
        <KhqrPaymentModal
          isOpen={khqrModalOpen}
          onClose={() => setKhqrModalOpen(false)}
          itemTitle={`${selectedPlan.name} Plan Subscription (${currentBusinessObj?.name || 'Business'})`}
          amount={selectedPlan.price}
          type="subscription"
          businessId={selectedBusinessId ? Number(selectedBusinessId) : null}
          plan={selectedPlan.id}
          onSuccess={() => handleConfirmUpgrade('Bakong KHQR (Verified)')}
        />
      )}

    </div>
  );
}
