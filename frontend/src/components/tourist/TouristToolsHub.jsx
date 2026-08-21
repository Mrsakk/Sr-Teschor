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
    <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden space-y-8">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 text-xs font-extrabold border border-orange-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Siem Reap Tourist Travel Companion</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            Essential Travel Tools & Daily Helper
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time sunrise countdown, fair tuk-tuk fares, KHQR payment guide, and temple etiquette.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveTab('sunrise')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'sunrise'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Sunrise & Sunset</span>
          </button>

          <button
            onClick={() => setActiveTab('tuktuk')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tuktuk'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Tuk-Tuk Fares</span>
          </button>

          <button
            onClick={() => setActiveTab('currency')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'currency'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Bakong & Currency</span>
          </button>

          <button
            onClick={() => setActiveTab('etiquette')}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'etiquette'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dress Code & Tips</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: SUNRISE & SUNSET TRACKER ── */}
      {activeTab === 'sunrise' && (
        <div key="tab-sunrise" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-300">
          {/* Location Select Buttons */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Choose Iconic Viewpoint:
            </label>
            {Object.entries(spots).map(([key, spot]) => {
              const Icon = spot.icon;
              const isSelected = selectedSpot === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSpot(key)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-orange-500/60 shadow-lg text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      spot.type === 'sunrise' ? 'bg-amber-500/20 text-amber-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{spot.name}</h4>
                      <span className="text-[10px] text-slate-400 capitalize">{spot.type} • {spot.time}</span>
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                </button>
              );
            })}
          </div>

          {/* Featured Spot Detail Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 relative flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 block">
                    {spots[selectedSpot].type === 'sunrise' ? '☀️ Golden Dawn Forecast' : '🌅 Twilight Glow Forecast'}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white font-heading mt-0.5">
                    {spots[selectedSpot].name}
                  </h3>
                </div>

                <div className="text-right bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold block">Exact Timing</span>
                  <span className="text-2xl font-black text-amber-400">{spots[selectedSpot].time}</span>
                </div>
              </div>

              {/* Recommendation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span>Leave Hotel By</span>
                  </span>
                  <span className="text-sm font-extrabold text-white mt-1 block">
                    {spots[selectedSpot].leaveHotelTime}
                  </span>
                  <span className="text-[10px] text-slate-500">Allow time for entry gate</span>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-sky-400" />
                    <span>Best Lighting Window</span>
                  </span>
                  <span className="text-sm font-extrabold text-sky-300 mt-1 block">
                    {spots[selectedSpot].bestLight}
                  </span>
                  <span className="text-[10px] text-slate-500">Prime photography time</span>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" />
                    <span>Crowd Expectation</span>
                  </span>
                  <span className="text-sm font-extrabold text-amber-300 mt-1 block">
                    {spots[selectedSpot].crowdLevel}
                  </span>
                  <span className="text-[10px] text-slate-500">Based on historical data</span>
                </div>
              </div>

              {/* Insider Tip Alert */}
              <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex items-start gap-3">
                <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-200/90 leading-relaxed">
                  <strong className="text-white">Local Guide Tip: </strong>
                  {spots[selectedSpot].tips}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>🎟️ Requires active Angkor Archaeological Park Pass</span>
              <span className="text-amber-400 font-bold">Dress code strictly enforced</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TUK-TUK & TRANSPORT FARE ESTIMATOR ── */}
      {activeTab === 'tuktuk' && (
        <div key="tab-tuktuk" className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-in fade-in duration-300">
          
          {/* Pick-up / Drop-off Selectors */}
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-3xl border border-slate-800">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>Pickup Location</span>
              </label>
              <select
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="pub_street">Pub Street / Old Market (Downtown)</option>
                <option value="wat_bo">Wat Bo / Riverside Area</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Destination / Attraction</span>
              </label>
              <select
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="angkor_wat">Angkor Wat (Small Circuit)</option>
                <option value="banteay_srei">Banteay Srei Temple (~36km)</option>
                <option value="beng_mealea">Beng Mealea Jungle Temple (~55km)</option>
                <option value="tonle_sap">Tonle Sap (Floating Village ~16km)</option>
                <option value="sai_airport">Siem Reap Angkor Int'l Airport (SAI ~48km)</option>
                <option value="old_market">Old Market / Night Market (City Trip)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between font-semibold">
                <span>Estimated Distance:</span>
                <span className="text-white font-bold">{currentFare.distance}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Estimated Travel Time:</span>
                <span className="text-white font-bold">{currentFare.time}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic">
              * Fares represent fair standard rates for Grab/PassApp metered rides or driver negotiations.
            </p>
          </div>

          {/* Fare Results Comparison */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
            
            {/* Tuk-Tuk Card */}
            <div className="bg-gradient-to-b from-orange-600/20 via-slate-900 to-slate-950 p-5 rounded-3xl border border-orange-500/40 flex flex-col justify-between space-y-4 relative shadow-lg">
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Most Popular
              </div>

              <div>
                <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-2">
                  <span className="text-lg">🛺</span>
                </div>
                <h4 className="text-sm font-extrabold text-white">Classic Tuk-Tuk / Remorque</h4>
                <p className="text-[11px] text-slate-400 mt-1">Open-air breezy ride, fits up to 4 passengers.</p>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Fair Estimate</span>
                <span className="text-2xl font-black text-orange-400">${currentFare.tuktuk}</span>
                <span className="text-[10px] text-slate-500 block">USD per trip</span>
              </div>
            </div>

            {/* Private Car Card */}
            <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2">
                  <Car className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-extrabold text-white">Private Taxi / AC Car</h4>
                <p className="text-[11px] text-slate-400 mt-1">Air-conditioned comfort, ideal for distant temples.</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Fair Estimate</span>
                <span className="text-2xl font-black text-sky-400">${currentFare.car}</span>
                <span className="text-[10px] text-slate-500 block">USD per trip</span>
              </div>
            </div>

            {/* Motorbike Card */}
            <div className="bg-slate-950/80 p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                  <span className="text-lg">🛵</span>
                </div>
                <h4 className="text-sm font-extrabold text-white">Moto Driver (Single)</h4>
                <p className="text-[11px] text-slate-400 mt-1">Quick solo ride for short urban hops.</p>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Fair Estimate</span>
                <span className="text-2xl font-black text-emerald-400">${currentFare.moto}</span>
                <span className="text-[10px] text-slate-500 block">USD per trip</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 3: BAKONG KHQR GUIDE & CURRENCY CONVERTER ── */}
      {activeTab === 'currency' && (
        <div key="tab-currency" className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center animate-in fade-in duration-300">
          
          {/* Currency Converter */}
          <div className="bg-slate-950/60 p-6 rounded-3xl border border-slate-800 space-y-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-400 block">
                Travel Currency Tool
              </span>
              <h3 className="text-lg font-bold text-white">Instant Rate Calculator</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Amount in US Dollars (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                  <input
                    type="number"
                    min="1"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-extrabold text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                  Convert To Currency
                </label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="KHR">KHR - Cambodian Riel (៛ 4,100 / $1)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="CNY">CNY - Chinese Yuan (¥)</option>
                  <option value="THB">THB - Thai Baht (฿)</option>
                  <option value="JPY">JPY - Japanese Yen (¥)</option>
                </select>
              </div>

              {/* Conversion Result Banner */}
              <div className="bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-transparent p-4 rounded-2xl border border-emerald-500/30 text-center">
                <span className="text-[10px] text-emerald-300 uppercase font-extrabold tracking-wider block">
                  Converted Equivalent
                </span >
                <div className="text-3xl font-black text-white font-heading mt-0.5">
                  {rates[targetCurrency]?.symbol} {convertedValue}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  1 USD ≈ {rates[targetCurrency]?.rate} {targetCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Bakong Tourists App Interactive Feature */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/40">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
                  National Bank of Cambodia (NBC)
                </span>
                <h4 className="text-base font-extrabold text-white">Bakong Tourists App Guide</h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Foreign visitors can now link their international <strong>Visa, Mastercard, or UnionPay</strong> to the official <strong>Bakong Tourists App</strong> to scan KHQR payments nationwide with zero currency friction!
            </p>

            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Accepted by over 3.3 million merchants & street stalls in Cambodia</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No need to carry large wads of cash or worry about torn dollar bills</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Easy refund of remaining balance when departing Cambodia</span>
              </li>
            </ul>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setBakongModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-transform hover:scale-102 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>How to Setup Bakong Tourists</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href="https://bakong.nbc.gov.kh/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 4: TEMPLE ETIQUETTE & CODE OF CONDUCT ── */}
      {activeTab === 'etiquette' && (
        <div key="tab-etiquette" className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-300">
          
          <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-white">Temple Dress Code</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Shoulders Covered:</strong> Wear shirts with sleeves. Scarves or shawls draped over tank tops are often rejected by guards.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Knees Covered:</strong> Shorts, skirts, and dresses must reach below the knee.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-white">Sacred Respect & Monks</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Respect Monks:</strong> Women must never touch or hand items directly to Buddhist monks (place item on a cloth instead).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Ask Before Photos:</strong> Always request permission before taking close-up portraits of monks or local children.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold text-white">Monument Preservation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Do Not Touch Carvings:</strong> Natural finger oils damage centuries-old Apsara bas-reliefs over time.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span><strong>Stay on Wooden Paths:</strong> Never climb over restricted fragile lintels or fallen temple stones.</span>
              </li>
            </ul>
          </div>

        </div>
      )}

      {/* ── BAKONG TOURISTS STEP-BY-STEP MODAL ── */}
      {bakongModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 relative text-left">
            
            <button
              onClick={() => setBakongModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-400 tracking-wider block">
                  National Bank of Cambodia
                </span>
                <h3 className="text-lg font-black text-white font-heading">
                  How to Use Bakong Tourists KHQR
                </h3>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Step 1 */}
              <div className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white">Download the Official Bakong App</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Available for iOS and Android. Search for "Bakong" on your app store.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href="https://apps.apple.com/app/bakong/id1440829141"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold border border-slate-700 inline-flex items-center gap-1"
                    >
                      <span>🍎 App Store</span>
                    </a>
                    <a
                      href="https://play.google.com/store/apps/details?id=kh.gov.nbc.bakong"
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold border border-slate-700 inline-flex items-center gap-1"
                    >
                      <span>🤖 Google Play</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white">Register with Passport</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Open the app, select "Tourist", and register using your international phone number or email and passport photo.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white">Top Up with Visa / Mastercard</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Link your international credit or debit card to add funds ($10, $50, $100) instantly without exchange fees.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0 text-xs">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-white">Scan & Pay KHQR Anywhere</h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Point your phone camera to scan any red KHQR standee at restaurants, tuk-tuks, cafes, and Angkor souvenir shops.
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setBakongModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer"
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
