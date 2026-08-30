import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Compass, 
  Clock, 
  MapPin, 
  DollarSign, 
  Coins, 
  ShieldCheck, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Navigation, 
  Smartphone, 
  QrCode, 
  ArrowRight,
  Info,
  Car,
  TrendingUp
} from 'lucide-react';

export default function TouristToolsHub() {
  const [activeTab, setActiveTab] = useState('sunrise'); // 'sunrise' | 'tuktuk' | 'currency' | 'etiquette'
  const [bakongModalOpen, setBakongModalOpen] = useState(false);

  // 1. Sunrise / Sunset state
  const [selectedSpot, setSelectedSpot] = useState('angkor_wat');

  // 2. Tuk-Tuk Fare Estimator state
  const [pickup, setPickup] = useState('pub_street');
  const [dropoff, setDropoff] = useState('angkor_wat');

  // 3. Currency Converter state
  const [amountUSD, setAmountUSD] = useState(20);
  const [targetCurrency, setTargetCurrency] = useState('KHR');

  // Spot Data
  const spots = {
    angkor_wat: {
      name: 'Angkor Wat Main Reflection Pond',
      type: 'sunrise',
      time: '05:38 AM',
      leaveHotelTime: '04:45 AM',
      crowdLevel: 'High',
      crowdColor: 'text-rose-500 bg-rose-50 border-rose-200',
      bestLight: '05:45 AM – 06:30 AM',
      tips: 'Arrive early at the left reflection pond for iconic twin-tower reflections. Bring a flashlight and light jacket.',
      icon: Sun,
      bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent'
    },
    phnom_bakheng: {
      name: 'Phnom Bakheng Hilltop',
      type: 'sunset',
      time: '05:58 PM',
      leaveHotelTime: '03:45 PM',
      crowdLevel: 'Strict 300-person Limit',
      crowdColor: 'text-amber-600 bg-amber-50 border-amber-200',
      bestLight: '05:15 PM – 06:15 PM',
      tips: 'Access is limited to 300 visitors at a time on top. Reach the base before 4:00 PM to ensure entrance.',
      icon: Moon,
      bgGradient: 'from-purple-500/20 via-pink-500/10 to-transparent'
    },
    pre_rup: {
      name: 'Pre Rup Pyramid Temple',
      type: 'sunset',
      time: '06:02 PM',
      leaveHotelTime: '04:30 PM',
      crowdLevel: 'Moderate',
      crowdColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      bestLight: '05:20 PM – 06:10 PM',
      tips: 'Less crowded than Bakheng. The warm brick and laterite stones glow a rich fiery golden red in late afternoon.',
      icon: Moon,
      bgGradient: 'from-amber-600/20 via-red-500/10 to-transparent'
    },
    tonle_sap: {
      name: 'Tonle Sap Lake & Floating Village',
      type: 'sunset',
      time: '06:15 PM',
      leaveHotelTime: '03:30 PM',
      crowdLevel: 'Moderate',
      crowdColor: 'text-sky-600 bg-sky-50 border-sky-200',
      bestLight: '05:30 PM – 06:25 PM',
      tips: 'Watch the sunset over the vast freshwater horizon from a wooden boat at Chong Kneas or Kampong Phluk.',
      icon: Moon,
      bgGradient: 'from-sky-500/20 via-blue-500/10 to-transparent'
    }
  };

  // Fare Estimator Routes Data
  const routes = {
    'pub_street-angkor_wat': { distance: '7.5 km', time: '18 mins', tuktuk: '4 - 6', car: '10 - 15', moto: '2 - 3' },
    'pub_street-banteay_srei': { distance: '36 km', time: '50 mins', tuktuk: '20 - 25', car: '35 - 45', moto: '10 - 15' },
    'pub_street-beng_mealea': { distance: '55 km', time: '75 mins', tuktuk: '30 - 38', car: '50 - 65', moto: '18 - 25' },
    'pub_street-tonle_sap': { distance: '16 km', time: '30 mins', tuktuk: '10 - 14', car: '20 - 28', moto: '5 - 7' },
    'pub_street-sai_airport': { distance: '48 km', time: '55 mins', tuktuk: '25 - 32', car: '40 - 50', moto: '15 - 20' },
    'pub_street-old_market': { distance: '0.8 km', time: '3 mins', tuktuk: '1 - 2', car: '4 - 6', moto: '1' },
    'wat_bo-angkor_wat': { distance: '8.2 km', time: '20 mins', tuktuk: '5 - 7', car: '12 - 16', moto: '3 - 4' },
    'wat_bo-banteay_srei': { distance: '37 km', time: '52 mins', tuktuk: '20 - 25', car: '35 - 45', moto: '12 - 15' },
    'wat_bo-sai_airport': { distance: '46 km', time: '50 mins', tuktuk: '25 - 30', car: '38 - 48', moto: '15 - 18' },
  };

  const currentRouteKey = `${pickup}-${dropoff}`;
  const currentFare = routes[currentRouteKey] || {
    distance: '10 - 15 km',
    time: '25 - 35 mins',
    tuktuk: '6 - 10',
    car: '15 - 22',
    moto: '3 - 5'
  };

  // Currency Exchange Rates against USD
  const rates = {
    KHR: { rate: 4100, symbol: '៛', name: 'Cambodian Riel' },
    EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
    CNY: { rate: 7.23, symbol: '¥', name: 'Chinese Yuan' },
    THB: { rate: 36.5, symbol: '฿', name: 'Thai Baht' },
    JPY: { rate: 155.0, symbol: '¥', name: 'Japanese Yen' }
  };

  const safeAmount = isNaN(amountUSD) || amountUSD === '' ? 0 : Number(amountUSD);
  const currentRateObj = rates[targetCurrency] || rates.KHR;
  const convertedValue = (safeAmount * (currentRateObj?.rate || 1)).toLocaleString(undefined, {
    maximumFractionDigits: targetCurrency === 'KHR' || targetCurrency === 'JPY' ? 0 : 2
  });

  return (
    <section className="bg-white border border-slate-200 rounded-[1.5rem] p-6 sm:p-8 lg:p-10 text-slate-900 shadow-xs relative overflow-hidden space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5 sm:pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-[11px] font-bold border border-orange-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Siem Reap Tourist Travel Companion</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 font-heading leading-tight">
            Essential Travel Tools & Daily Helper
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Real-time sunrise countdown, fair tuk-tuk fares, KHQR payment guide, and temple etiquette.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 md:flex md:flex-row items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full md:w-auto gap-1.5 shrink-0">
          <button
            onClick={() => setActiveTab('sunrise')}
            className={`w-full justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border whitespace-nowrap ${
              activeTab === 'sunrise'
                ? 'bg-white text-slate-900 shadow-xs border-slate-200'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Sunrise & Sunset</span>
          </button>

          <button
            onClick={() => setActiveTab('tuktuk')}
            className={`w-full justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border whitespace-nowrap ${
              activeTab === 'tuktuk'
                ? 'bg-white text-slate-900 shadow-xs border-slate-200'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Car className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Tuk-Tuk Fares</span>
          </button>

          <button
            onClick={() => setActiveTab('currency')}
            className={`w-full justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border whitespace-nowrap ${
              activeTab === 'currency'
                ? 'bg-white text-slate-900 shadow-xs border-slate-200'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Bakong & Currency</span>
          </button>

          <button
            onClick={() => setActiveTab('etiquette')}
            className={`w-full justify-center px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border whitespace-nowrap ${
              activeTab === 'etiquette'
                ? 'bg-white text-slate-900 shadow-xs border-slate-200'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Dress Code & Tips</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: SUNRISE & SUNSET TRACKER ── */}
      {activeTab === 'sunrise' && (
        <div key="tab-sunrise" className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch animate-in fade-in duration-300">
          {/* Location Select Buttons */}
          <div className="space-y-3">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2 px-1">
              Choose Iconic Viewpoint:
            </label>
            {Object.entries(spots).map(([key, spot]) => {
              const Icon = spot.icon;
              const isSelected = selectedSpot === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSpot(key)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-orange-50/60 border-orange-400 text-slate-900 shadow-sm ring-1 ring-orange-400/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      spot.type === 'sunrise' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <h4 className={`text-xs sm:text-sm font-bold leading-snug break-words transition-colors ${isSelected ? 'text-orange-950' : 'text-slate-700'}`}>{spot.name}</h4>
                      <span className="text-[10px] sm:text-xs text-slate-500 capitalize block mt-0.5">{spot.type} • {spot.time}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Featured Spot Detail Card */}
          <div className="lg:col-span-2 bg-[#FDFBF7] p-6 sm:p-8 rounded-[1.5rem] border border-orange-900/10 shadow-sm relative flex flex-col justify-between space-y-6">
            <div className="space-y-3.5 sm:space-y-4">
              {/* Card Header & Compact Time Badge */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-orange-600">
                    {spots[selectedSpot].type === 'sunrise' ? '☀️ Golden Dawn Forecast' : '🌅 Twilight Glow Forecast'}
                  </span>
                  <h3 className="text-base sm:text-xl font-extrabold text-slate-900 font-heading mt-0.5 leading-snug">
                    {spots[selectedSpot].name}
                  </h3>
                </div>

                <div className="text-right px-3 py-1.5 rounded-xl bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
                  <span className="text-[9px] uppercase tracking-wider font-bold block text-orange-700">Exact Timing</span>
                  <span className="text-base sm:text-lg font-black leading-tight">{spots[selectedSpot].time}</span>
                </div>
              </div>

              {/* Recommendation Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center sm:text-left flex flex-col justify-between shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                    <Clock className="w-3 h-3 text-orange-500 shrink-0" />
                    <span className="truncate">Leave Hotel</span>
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1 block leading-tight">
                    {spots[selectedSpot].leaveHotelTime}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block mt-0.5">Entry gate buffer</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center sm:text-left flex flex-col justify-between shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                    <Camera className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">Best Light</span>
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-emerald-700 mt-1 block leading-tight">
                    {spots[selectedSpot].bestLight}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block mt-0.5">Prime photography</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center sm:text-left flex flex-col justify-between shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center justify-center sm:justify-start gap-1">
                    <TrendingUp className="w-3 h-3 text-orange-500 shrink-0" />
                    <span className="truncate">Crowd</span>
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-orange-700 mt-1 block leading-tight truncate">
                    {spots[selectedSpot].crowdLevel}
                  </span>
                  <span className="text-[9px] text-slate-400 hidden sm:block mt-0.5">Expected density</span>
                </div>
              </div>

              {/* Insider Tip Alert */}
              <div className="bg-orange-50 border border-orange-200 p-3.5 sm:p-4 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="text-[11px] sm:text-xs text-orange-950 leading-relaxed">
                  <strong className="text-orange-900 font-bold">Local Guide Tip: </strong>
                  {spots[selectedSpot].tips}
                </p>
              </div>
            </div>

            {/* Bottom Rules */}
            <div className="text-[10px] sm:text-[11px] text-slate-500 pt-3 border-t border-slate-200 flex flex-col sm:flex-row gap-1.5 sm:items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>🎟️</span>
                <span>Requires active Angkor Archaeological Park Pass</span>
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Dress code strictly enforced</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TUK-TUK & TRANSPORT FARE ESTIMATOR ── */}
      {activeTab === 'tuktuk' && (
        <div key="tab-tuktuk" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-300">
          
          {/* Pick-up / Drop-off Selectors */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span>Pickup Location</span>
              </label>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
              >
                <option value="pub_street">Pub Street / Old Market (Downtown)</option>
                <option value="wat_bo">Wat Bo / Riverside Area</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                <span>Destination / Attraction</span>
              </label>
              <select
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500 font-semibold"
              >
                <option value="angkor_wat">Angkor Wat (Small Circuit)</option>
                <option value="banteay_srei">Banteay Srei Temple (~36km)</option>
                <option value="beng_mealea">Beng Mealea Jungle Temple (~55km)</option>
                <option value="tonle_sap">Tonle Sap (Floating Village ~16km)</option>
                <option value="sai_airport">Siem Reap Angkor Int'l Airport (SAI ~48km)</option>
                <option value="old_market">Old Market / Night Market (City Trip)</option>
              </select>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-600 shadow-xs">
              <div className="flex justify-between font-semibold">
                <span>Estimated Distance:</span>
                <span className="text-slate-900 font-bold">{currentFare.distance}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Estimated Travel Time:</span>
                <span className="text-slate-900 font-bold">{currentFare.time}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * Fares represent fair standard rates for Grab/PassApp metered rides or driver negotiations.
            </p>
          </div>

          {/* Fare Results Comparison */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
            
            {/* Tuk-Tuk Card */}
            <div className="bg-white p-5 rounded-2xl border-2 border-orange-500 flex flex-col justify-between space-y-4 relative shadow-sm">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                Most Popular
              </div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
                  <span className="text-lg">🛺</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Classic Tuk-Tuk / Remorque</h4>
                <p className="text-[11px] text-slate-500 mt-1">Open-air breezy ride, fits up to 4 passengers.</p>
              </div>

              <div className="bg-orange-50/60 p-3.5 rounded-xl border border-orange-100 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Fair Estimate</span>
                <span className="text-2xl font-black text-orange-600">${currentFare.tuktuk}</span>
                <span className="text-[10px] text-slate-400 block">USD per trip</span>
              </div>
            </div>

            {/* Private Car Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
                  <Car className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Private Taxi / AC Car</h4>
                <p className="text-[11px] text-slate-500 mt-1">Air-conditioned comfort, ideal for distant temples.</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Fair Estimate</span>
                <span className="text-2xl font-black text-slate-900">${currentFare.car}</span>
                <span className="text-[10px] text-slate-400 block">USD per trip</span>
              </div>
            </div>

            {/* Motorbike Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <span className="text-lg">🛵</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">Moto Driver (Single)</h4>
                <p className="text-[11px] text-slate-500 mt-1">Quick solo ride for short urban hops.</p>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Fair Estimate</span>
                <span className="text-2xl font-black text-emerald-700">${currentFare.moto}</span>
                <span className="text-[10px] text-slate-400 block">USD per trip</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 3: BAKONG KHQR GUIDE & CURRENCY CONVERTER ── */}
      {activeTab === 'currency' && (
        <div key="tab-currency" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
          
          {/* Currency Converter */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-600 block">
                Travel Currency Tool
              </span>
              <h3 className="text-lg font-bold text-slate-900">Instant Rate Calculator</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Amount in US Dollars (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-extrabold text-slate-900 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Convert To Currency
                </label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-orange-500"
                >
                  <option value="KHR">KHR - Cambodian Riel (៛ 4,100 / $1)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="CNY">CNY - Chinese Yuan (¥)</option>
                  <option value="THB">THB - Thai Baht (฿)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                </select>
              </div>

              {/* Conversion Result Banner */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] text-emerald-800 uppercase font-extrabold tracking-wider block">
                  Converted Equivalent
                </span>
                <div className="text-3xl font-black text-slate-900 font-heading mt-0.5">
                  {rates[targetCurrency]?.symbol} {convertedValue}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  1 USD ≈ {rates[targetCurrency]?.rate} {targetCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Bakong Tourists App Interactive Feature */}
          <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  National Bank of Cambodia (NBC)
                </span>
                <h4 className="text-base font-extrabold text-slate-900">Bakong Tourists App Guide</h4>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Foreign visitors can now link their international <strong>Visa, Mastercard, or UnionPay</strong> to the official <strong>Bakong Tourists App</strong> to scan KHQR payments nationwide with zero currency friction!
            </p>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Accepted by over 3.3 million merchants & street stalls in Cambodia</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>No need to carry large wads of cash or worry about torn dollar bills</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Easy refund of remaining balance when departing Cambodia</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setBakongModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>How to Setup Bakong Tourists</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href="https://bakong.nbc.gov.kh/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
              >
                <span>Official Portal ↗</span>
              </a>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 4: TEMPLE ETIQUETTE & CODE OF CONDUCT ── */}
      {activeTab === 'etiquette' && (
        <div key="tab-etiquette" className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-300">
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Temple Dress Code</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Shoulders Covered:</strong> Wear shirts with sleeves. Scarves or shawls draped over tank tops are often rejected by guards.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Knees Covered:</strong> Shorts, skirts, and dresses must reach below the knee.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Sacred Respect & Monks</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Respect Monks:</strong> Women must never touch or hand items directly to Buddhist monks (place item on a cloth instead).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Ask Before Photos:</strong> Always request permission before taking close-up portraits of monks or local children.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">Monument Preservation</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Do Not Touch Carvings:</strong> Natural finger oils damage centuries-old Apsara bas-reliefs over time.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Stay on Wooden Paths:</strong> Never climb over restricted fragile lintels or fallen temple stones.</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* ── BAKONG TOURISTS STEP-BY-STEP MODAL ── */}
      {bakongModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-2xl p-6 sm:p-8 text-slate-900 shadow-xl space-y-6 relative text-left">
            
            <button
              onClick={() => setBakongModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  National Bank of Cambodia
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-heading">
                  How to Use Bakong Tourists KHQR
                </h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Download the Official Bakong App</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Available for iOS and Android. Search for "Bakong" on your app store.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href="https://apps.apple.com/app/bakong/id1440829141"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 inline-flex items-center gap-1"
                    >
                      <span>🍎 App Store</span>
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=kh.gov.nbc.bakong"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 inline-flex items-center gap-1"
                    >
                      <span>🤖 Google Play</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Register with Passport</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Open the app, select "Tourist", and register using your international phone number or email and passport photo.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Top Up with Visa / Mastercard</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Link your international credit or debit card to add funds ($10, $50, $100) instantly without exchange fees.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Scan & Pay KHQR Anywhere</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Point your phone camera to scan any red KHQR standee at restaurants, tuk-tuks, cafes, and Angkor souvenir shops.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setBakongModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
}
