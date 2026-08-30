import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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

const fallbackPlans = [
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
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionApi.getPlans().then(res => res.data.plans).catch(() => fallbackPlans),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
  const plans = plansData || fallbackPlans;

  const { data: myBusinessesData } = useQuery({
    queryKey: ['myBusinesses'],
    queryFn: () => businessApi.getMyBusinesses().then(res => res.data),
    enabled: isAuthenticated && (user?.role === 'business' || user?.role === 'admin'),
    staleTime: 1000 * 60 * 5,
  });
  const myBusinesses = myBusinessesData || [];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [khqrModalOpen, setKhqrModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    if (myBusinesses.length > 0 && !selectedBusinessId) {
      setSelectedBusinessId(myBusinesses[0].id);
    }
  }, [myBusinesses, selectedBusinessId]);

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
    <div className="pt-20 sm:pt-28 pb-28 sm:pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-8 sm:space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-orange-100 text-orange-700 inline-flex items-center gap-1.5 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{t('pricing.partner_growth', 'Partner Growth')}</span>
        </span>
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 font-heading leading-tight">
          {t('pricing.title', 'Increase Customers & Business Revenue')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {t('pricing.subtitle', 'Connect with thousands of domestic and international tourists in Siem Reap. Choose the perfect plan for your business.')}
        </p>

        {/* Billing Cycle Switch */}
        <div className="inline-flex items-center bg-slate-100 p-1 sm:p-1.5 rounded-xl sm:rounded-xl border border-slate-200 shadow-inner mt-1 sm:mt-2">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('pricing.monthly', 'Monthly')}
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
            <span>{t('pricing.annual', 'Annual')}</span>
            <span className="text-[9px] sm:text-[10px] bg-amber-300 text-amber-900 font-black px-1.5 py-0.2 rounded-md">
              -20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch pt-2 sm:pt-0">
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
              className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                isPro
                  ? 'bg-slate-900 text-white shadow-md ring-2 ring-orange-600 sm:scale-102'
                  : isPremium
                  ? 'bg-slate-950 text-white border border-slate-800 shadow-xs'
                  : 'bg-white text-slate-900 border border-slate-200 shadow-xs'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1 whitespace-nowrap">
                  <Zap className="w-3 h-3" /> {t('pricing.most_popular', 'Most Popular')}
                </div>
              )}

              {isPremium && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1 whitespace-nowrap">
                  <Crown className="w-3.5 h-3.5" /> {t('pricing.vip_partner', 'VIP Partner')}
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className={`text-lg sm:text-xl font-black ${isPro || isPremium ? 'text-white' : 'text-slate-900'} font-heading`}>
                    {t(`pricing.plans.${plan.id}.name`, plan.name)}
                  </h3>
                  <p className={`text-xs mt-1 ${isPro || isPremium ? 'text-slate-300' : 'text-slate-500'} leading-relaxed`}>
                    {t(`pricing.plans.${plan.id}.description`, plan.description)}
                  </p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl sm:text-4xl font-extrabold ${isPro || isPremium ? 'text-white' : 'text-slate-900'}`}>
                    ${displayPrice}
                  </span>
                  <span className={`text-xs ${isPro || isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
                    /{billingCycle === 'annual' && plan.price > 0 ? t('pricing.year', 'year') : t(`pricing.period.${plan.period.replace(' ', '_')}`, plan.period)}
                  </span>
                </div>

                {/* Features list */}
                <ul className="space-y-2.5 sm:space-y-3 pt-3.5 sm:pt-4 border-t border-slate-100/10 text-xs">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isPremium 
                          ? 'bg-emerald-600 text-white font-bold' 
                          : isPro 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-emerald-100 text-emerald-800 font-bold'
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={isPro || isPremium ? 'text-slate-200' : 'text-slate-700'}>
                        {t(`pricing.plans.${plan.id}.features.${idx}`, feat)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 sm:pt-8">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer ${
                    isPremium
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : isPro
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isAuthenticated 
                    ? (user?.role === 'business' || user?.role === 'admin' 
                        ? t('pricing.select_plan', { planName: t(`pricing.plans.${plan.id}.name`, plan.name) })
                        : t('pricing.dashboard', ' Dashboard')) 
                    : t('pricing.register_business', 'Register Business')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 2. INTERACTIVE ROI REVENUE CALCULATOR FOR BUSINESSES ── */}
      <div className="bg-slate-50 rounded-2xl p-6 sm:p-10 text-slate-900 border border-slate-200/90 shadow-xs space-y-6 sm:space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4 sm:pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] sm:text-xs font-extrabold border border-orange-200/80 mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t('pricing.calc_badge', 'Revenue Calculator')}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              {t('pricing.calc_title', 'How much profit will your business make with SR TesChor?')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('pricing.calc_desc', 'Estimate monthly revenue and profit from the number of tourists on our platform.')}
            </p>
          </div>
          <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-500 block font-semibold">{t('pricing.calc_pro_price_label', 'Pro Partner Package Price:')}</span>
            <span className="text-lg sm:text-xl font-black text-orange-600">${billingCycle === 'annual' ? '8.00' : '10.00'} / {t('pricing.calc_month', 'Month')}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          
          {/* Sliders Input */}
          <div className="space-y-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
            
            {/* Slider 1: Average Spend per Guest */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">{t('pricing.calc_avg_spend', 'Average Spend per Guest')}</span>
                <span key={`spend-${calcSpend}`} className="text-orange-700 font-extrabold text-base px-2.5 py-0.5 rounded-lg bg-orange-50 border border-orange-200">
                  ${calcSpend} / {t('pricing.calc_guest', 'Guest')}
                </span>
              </div>
              <input
                id="spend-slider"
                type="range"
                min="5"
                max="150"
                step="5"
                value={calcSpend}
                className="w-full accent-orange-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg touch-none"
                onChange={(e) => setCalcSpend(Number(e.target.value))}
                onInput={(e) => setCalcSpend(Number(e.target.value))}
              />
              
              {/* Quick Presets for Spend */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 shrink-0">{t('pricing.calc_quick_select', 'Quick Select:')}</span>
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={`btn-spend-${val}`}
                    id={`btn-spend-${val}`}
                    type="button"
                    onClick={() => setCalcSpend(val)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      calcSpend === val
                        ? 'bg-orange-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 2: Additional Guests per Month */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">{t('pricing.calc_add_guests', 'Additional Guests')}</span>
                <span key={`guests-${calcGuests}`} className="text-emerald-700 font-extrabold text-base px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
                  {calcGuests} {t('pricing.calc_guests_per_month', 'Guests / Month')}
                </span>
              </div>
              <input
                id="guests-slider"
                type="range"
                min="5"
                max="200"
                step="5"
                value={calcGuests}
                className="w-full accent-emerald-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg touch-none"
                onChange={(e) => setCalcGuests(Number(e.target.value))}
                onInput={(e) => setCalcGuests(Number(e.target.value))}
              />

              {/* Quick Presets for Guests */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 shrink-0">{t('pricing.calc_quick_select', 'Quick Select:')}</span>
                {[20, 40, 80, 150].map((val) => (
                  <button
                    key={`btn-guests-${val}`}
                    id={`btn-guests-${val}`}
                    type="button"
                    onClick={() => setCalcGuests(val)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      calcGuests === val
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {val} {t('pricing.calc_guests', 'Guests')}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Calculator Output Display Card */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 text-center space-y-4 shadow-sm">
            
            <div className="space-y-1">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-orange-400">
                {t('pricing.calc_est_rev', 'Estimated Monthly Revenue')}
              </span>
              <div key={`rev-${totalRev}`} className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight">
                +${totalRev.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-left">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">{t('pricing.calc_net_profit', 'Net Profit')}</span>
                <span key={`profit-${netProfit}`} className="text-base sm:text-xl font-extrabold text-emerald-400 mt-0.5 block truncate">
                  +${netProfit.toLocaleString()}
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block">{t('pricing.calc_after_fee', { fee: billingCycle === 'annual' ? 8 : 10 }, 'After ${{fee}} Package Fee')}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold block">{t('pricing.calc_roi', 'Return on Investment (ROI)')}</span>
                <span key={`roi-${roiPct}`} className="text-base sm:text-xl font-extrabold text-amber-400 mt-0.5 block truncate">
                  +{roiPct.toLocaleString()}%
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 truncate block">{t('pricing.calc_high_roi', 'High Return on Investment')}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Plan Selection Confirmation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 w-full max-w-md space-y-5 shadow-md animate-in zoom-in-95">
            <h3 className="font-extrabold text-xl text-slate-900">
              {t('pricing.modal.title', { plan: t(`pricing.plans.${selectedPlan.id}.name`, selectedPlan.name) }, 'Upgrade to {{plan}} Plan')}
            </h3>

            {successMessage ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-bold">
                ✓ {successMessage}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {t('pricing.modal.select_business', 'Select Your Business Listing')}
                  </label>
                  {myBusinesses.length === 0 ? (
                    <p className="text-xs text-red-600">{t('pricing.modal.no_business_error', 'Please register a business first before subscribing.')}</p>
                  ) : (
                    <select
                      value={selectedBusinessId}
                      onChange={(e) => setSelectedBusinessId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      {myBusinesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({t('pricing.modal.current', 'Current:')} {t(`pricing.plans.${b.subscription_plan || 'free'}.name`, b.subscription_plan || 'FREE')})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-xs space-y-1">
                  <p className="font-bold text-slate-900">{t('pricing.modal.summary', 'Subscription Summary:')}</p>
                  <p className="text-slate-600">{t('pricing.modal.plan', 'Plan:')} <strong>{t(`pricing.plans.${selectedPlan.id}.name`, selectedPlan.name)}</strong></p>
                  <p className="text-slate-600">{t('pricing.modal.price', 'Price:')} <strong>${selectedPlan.price} / {t('pricing.calc_month', 'month')}</strong></p>
                  <p className="text-slate-500 text-[11px] pt-1">
                    {t('pricing.modal.payment_gateway', 'Payment Gateway:')} <strong>{t('pricing.modal.khqr', 'Bakong Universal KHQR (Scan & Pay)')}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {t('pricing.modal.cancel', 'Cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={myBusinesses.length === 0}
                    onClick={handleOpenKhqr}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:from-orange-600 text-white font-bold text-xs shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>{t('pricing.modal.proceed', 'Proceed to KHQR Pay')}</span>
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
          itemTitle={t('pricing.modal.khqr_title', { 
            plan: t(`pricing.plans.${selectedPlan.id}.name`, selectedPlan.name),
            business: currentBusinessObj?.name || t('pricing.modal.business', 'Business')
          }, '{{plan}} Plan Subscription ({{business}})')}
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
