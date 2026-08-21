import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Calendar, 
  DollarSign, 
  Compass, 
  Clock, 
  MapPin, 
  Check, 
  ChevronRight, 
  RotateCcw, 
  Save, 
  ArrowRight,
  Sun,
  Camera,
  Coffee,
  Utensils,
  Share2,
  RefreshCw,
  Heart,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { aiApi, tripApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { useNavigate } from 'react-router-dom';

export default function AITripPlannerModal({ isOpen, onClose }) {
  const { isAuthenticated } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const [step, setStep] = useState('input'); // 'input', 'generating', 'result'
  const [duration, setDuration] = useState(3);
  const [style, setStyle] = useState('heritage'); // heritage, romantic, family, adventure, photography, foodie
  const [budget, setBudget] = useState('comfort'); // budget, comfort, luxury
  const [lang, setLang] = useState('km');
  const [activeDayTab, setActiveDayTab] = useState(1);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setStep('generating');
    try {
      const res = await aiApi.generateItinerary({
        days: duration,
        style,
        budget,
        lang,
      });
      setGeneratedPlan(res.data);
      setActiveDayTab(1);
      setStep('result');
    } catch (err) {
      toast.error('Failed to generate AI itinerary. Please try again.');
      setStep('input');
    }
  };

  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      onClose();
      navigate('/login?redirect=/my-trips');
      return;
    }

    if (!generatedPlan) return;

    try {
      setSaving(true);
      // 1. Create Trip Plan in backend DB
      const res = await tripApi.create({
        name: generatedPlan.plan_title,
        description: `AI Generated ${duration}-Day Itinerary (${style.toUpperCase()} style, ${budget.toUpperCase()} budget). Estimated total: $${generatedPlan.estimated_total_usd} USD.`,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + duration * 86400000).toISOString().split('T')[0],
        notes: (generatedPlan.travel_tips || []).join('\n'),
      });

      const tripId = res.data.id;

      // 2. Add Timeline Items to Trip Plan
      if (tripId && generatedPlan.days) {
        for (const day of generatedPlan.days) {
          if (day.activities) {
            for (const act of day.activities) {
              try {
                await tripApi.addItem(tripId, {
                  item_type: 'destination',
                  item_id: 1, // Fallback destination reference
                  day_number: day.day,
                  time_slot: act.time,
                  notes: `${act.place}: ${act.description}`,
                });
              } catch (e) {
                // Ignore individual item insert errors
              }
            }
          }
        }
      }

      setSavedSuccess(true);
      toast.success('🎉 Itinerary saved directly into My Trips!');
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
        navigate('/my-trips');
      }, 1200);
    } catch (e) {
      toast.error('Failed to save itinerary to database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white p-5 sm:p-6 relative overflow-hidden shrink-0 shadow-md">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-black px-2.5 py-0.5 rounded-full bg-white/25 border border-white/30 text-amber-100">
                    AI Travel Engine 2.0
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white font-heading">
                  SR TesChor Smart Trip Planner
                </h2>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer border border-white/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* STEP 1: INPUT PREFERENCES */}
          {step === 'input' && (
            <div className="space-y-6">
              
              {/* Language Selector */}
              <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs font-bold text-slate-700">🌐 ភាសាកាលវិភាគ (Itinerary Language):</span>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setLang('km')}
                    className={`px-3 py-1 rounded-lg transition-all ${lang === 'km' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🇰🇭 ខ្មែរ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 rounded-lg transition-all ${lang === 'en' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  🗓️ ១. តើអ្នកចង់ដើរលេងរយៈពេលប៉ុន្មានថ្ងៃ? (Trip Duration)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-3 rounded-2xl border text-center font-black text-xs transition-all cursor-pointer ${
                        duration === d
                          ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-orange-300 text-slate-700 shadow-xs'
                      }`}
                    >
                      <span className="block text-base">{d}</span>
                      <span className="text-[10px] font-bold opacity-90">{d === 1 ? 'Day' : 'Days'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  🎯 ២. រចនាប័ទ្មដំណើរកម្សាន្តដែលអ្នកចូលចិត្ត (Travel Style)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'heritage', label: 'ប្រាសាទបុរាណ & វប្បធម៌', labelEn: 'Heritage & Temples', icon: '🏛️' },
                    { id: 'romantic', label: 'គូស្នេហ៍ & ថ្ងៃលិច', labelEn: 'Romantic Couple', icon: '🌅' },
                    { id: 'family', label: 'ក្រុមគ្រួសារ & កូនតូច', labelEn: 'Family Vacation', icon: '👨‍👩‍👧‍👦' },
                    { id: 'adventure', label: 'ទឹកធ្លាក់ & ផ្សងព្រេង', labelEn: 'Nature & Waterfalls', icon: '🌿' },
                    { id: 'photography', label: 'ថតរូបស្អាតៗ & ពន្លឺថ្ងៃ', labelEn: 'Photo Highlights', icon: '📸' },
                    { id: 'foodie', label: 'ម្ហូបឆ្ងាញ់ & ហាងកាហ្វេ', labelEn: 'Foodie & Cafes', icon: '☕' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStyle(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        style === item.id
                          ? 'border-orange-500 bg-orange-50/80 text-orange-950 ring-2 ring-orange-400/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 shadow-xs'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-xs text-slate-900 truncate">
                          {lang === 'km' ? item.label : item.labelEn}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {item.id.toUpperCase()}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Category */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
                  💰 ៣. កម្រិតថវិកាដែលបានគ្រោងទុក (Budget Category)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'budget', label: 'សន្សំសំចៃ (Budget)', cost: '~$35/day', icon: '🎒' },
                    { id: 'comfort', label: 'ល្មមសមរម្យ (Comfort)', cost: '~$70/day', icon: '✨' },
                    { id: 'luxury', label: 'វីអាយភី (Luxury VIP)', cost: '~$160/day', icon: '👑' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                        budget === b.id
                          ? 'border-orange-500 bg-orange-500 text-white shadow-md shadow-orange-500/20'
                          : 'border-slate-200 bg-white hover:border-orange-300 text-slate-700 shadow-xs'
                      }`}
                    >
                      <span className="text-xl block mb-1">{b.icon}</span>
                      <p className="font-extrabold text-xs">{b.label}</p>
                      <p className="text-[10px] opacity-85 font-medium mt-0.5">{b.cost}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
                <span>បង្កើតកាលវិភាគឆ្លាតវៃជាមួយ AI (Generate Itinerary)</span>
              </button>
            </div>
          )}

          {/* STEP 2: GENERATING ANIMATION */}
          {step === 'generating' && (
            <div className="py-16 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-500/30 animate-bounce">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  SR TesChor AI កំពុងវិភាគ និងរៀបចំកាលវិភាគ...
                </h3>
                <p className="text-xs text-slate-500">
                  កំពុងគណនាផ្លូវធ្វើដំណើរ ម៉ោងថ្ងៃរះ និងទីតាំងប្រាសាទល្អបំផុតសម្រាប់អ្នក
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT ITINERARY DISPLAY */}
          {step === 'result' && generatedPlan && (
            <div className="space-y-5">
              
              {/* Plan Summary Card */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 font-extrabold text-[10px] uppercase">
                      {generatedPlan.days_count} Days Plan
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-[10px] uppercase">
                      {generatedPlan.budget_category} Budget
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1.5 font-heading">
                    {generatedPlan.plan_title}
                  </h3>
                </div>

                <div className="text-left sm:text-right bg-orange-50/80 p-3 rounded-2xl border border-orange-200/80 w-full sm:w-auto">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Estimated Total</p>
                  <p className="text-lg font-black text-orange-600">
                    ${generatedPlan.estimated_total_usd} <span className="text-xs font-normal text-slate-500">USD</span>
                  </p>
                </div>
              </div>

              {/* Day Switcher Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {generatedPlan.days.map((d) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDayTab(d.day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                      activeDayTab === d.day
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Day {d.day}
                  </button>
                ))}
              </div>

              {/* Day Timeline Activities */}
              {generatedPlan.days.filter((d) => d.day === activeDayTab).map((d) => (
                <div key={d.day} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>{d.title}</span>
                  </h4>

                  <div className="relative pl-6 border-l-2 border-orange-200 space-y-4 my-2">
                    {d.activities.map((act, idx) => (
                      <div key={idx} className="relative group">
                        <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-orange-100" />
                        <div className="space-y-0.5">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-extrabold">
                            {act.time}
                          </span>
                          <h5 className="font-extrabold text-xs text-slate-900">
                            {act.place}
                          </h5>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {act.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-4 py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500" />
                  <span>បង្កើតសារជាថ្មី (Re-generate)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveTrip}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>កំពុងរក្សាទុក...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>រក្សាទុកក្នុង My Trips របស់ខ្ញុំ (Save to My Trips)</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
