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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] my-auto notranslate" translate="no">
        
        {/* Header */}
        <div className="bg-white text-slate-900 p-4 border-b border-slate-100 relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shadow-xs shrink-0">
                <Sparkles className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                    AI Travel Engine 2.0
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  SR TesChor Smart Trip Planner
                </h2>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="បិទ (Close)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Canvas */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          
          {/* STEP 1: INPUT PREFERENCES */}
          {step === 'input' && (
            <div className="space-y-5">
              
              {/* Language Selector */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-400" />
                  <span>ភាសាកាលវិភាគ:</span>
                </span>
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLang('km')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      lang === 'km' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    KH ខ្មែរ
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      lang === 'en' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    GB English
                  </button>
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  1. Trip Duration
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      className={`py-2 rounded-xl border text-center transition-all cursor-pointer shadow-xs ${
                        duration === d
                          ? 'border-orange-500 bg-orange-50/50 text-orange-700 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-medium'
                      }`}
                    >
                      <span className="block text-sm">{d}</span>
                      <span className="text-[9px] font-semibold text-slate-400">{d === 1 ? 'ថ្ងៃ' : 'ថ្ងៃ'}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  2. Travel Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'heritage', label: 'ប្រាសាទបុរាណ', labelEn: 'Heritage', icon: '' },
                    { id: 'romantic', label: 'គូស្នេហ៍', labelEn: 'Romantic', icon: '' },
                    { id: 'family', label: 'គ្រួសារ', labelEn: 'Family', icon: '' },
                    { id: 'adventure', label: 'ធម្មជាតិ & ផ្សងព្រេង', labelEn: 'Adventure', icon: '' },
                    { id: 'photography', label: 'ថតរូបស្អាតៗ', labelEn: 'Photography', icon: '' },
                    { id: 'foodie', label: 'ម្ហូប & កាហ្វេ', labelEn: 'Foodie', icon: '' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setStyle(item.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 shadow-xs ${
                        style === item.id
                          ? 'border-orange-500 bg-orange-50/50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[11px] leading-tight truncate ${style === item.id ? 'font-bold text-orange-800' : 'font-semibold text-slate-700'}`}>
                          {lang === 'km' ? item.label : item.labelEn}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget Category */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  3. Budget Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'budget', label: 'សន្សំសំចៃ', sub: 'Budget', cost: '~$35/ថ្ងៃ', icon: '' },
                    { id: 'comfort', label: 'សមរម្យ', sub: 'Comfort', cost: '~$70/ថ្ងៃ', icon: '' },
                    { id: 'luxury', label: 'វីអាយភី', sub: 'Luxury', cost: '~$160/ថ្ងៃ', icon: '' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer shadow-xs flex flex-col items-center justify-center ${
                        budget === b.id
                          ? 'border-orange-500 bg-orange-50/50'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base mb-1 block">{b.icon}</span>
                      <p className={`text-[10px] leading-tight ${budget === b.id ? 'font-bold text-orange-800' : 'font-semibold text-slate-700'}`}>{lang === 'km' ? b.label : b.sub}</p>
                      <p className="text-[9px] text-orange-500 font-semibold mt-0.5">{b.cost}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>CREATE SMART AI ITINERARY</span>
              </button>
            </div>
          )}

          {/* STEP 2: GENERATING ANIMATION */}
          {step === 'generating' && (
            <div className="py-14 sm:py-16 text-center space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto shadow-xs animate-bounce">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-heading">
                  AI Is Analyzing And Planning...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Calculating travel routes, sunrise times, and the best temple locations for you
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: RESULT ITINERARY DISPLAY */}
          {step === 'result' && generatedPlan && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Plan Summary Card */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 font-extrabold text-[10px] uppercase border border-orange-200">
                      {generatedPlan.days_count} Days Plan
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase border border-emerald-200">
                      {generatedPlan.budget_category} Budget
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1.5 font-heading">
                    {generatedPlan.plan_title}
                  </h3>
                </div>

                <div className="text-left sm:text-right bg-orange-50 p-2.5 sm:p-3 rounded-xl border border-orange-100 w-full sm:w-auto">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Estimated Total</p>
                  <p className="text-base sm:text-lg font-black text-orange-600">
                    ${generatedPlan.estimated_total_usd} <span className="text-xs font-normal text-slate-500">USD</span>
                  </p>
                </div>
              </div>

              {/* Day Switcher Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {generatedPlan.days.map((d) => (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDayTab(d.day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                      activeDayTab === d.day
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Day {d.day}
                  </button>
                ))}
              </div>

              {/* Day Timeline Activities */}
              {generatedPlan.days.filter((d) => d.day === activeDayTab).map((d) => (
                <div key={d.day} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>{d.title}</span>
                  </h4>

                  <div className="relative pl-5 sm:pl-6 border-l-2 border-orange-200 space-y-3.5 my-2">
                    {d.activities.map((act, idx) => (
                      <div key={idx} className="relative group">
                        <span className="absolute -left-[27px] sm:-left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-orange-600 ring-4 ring-orange-100" />
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
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center shadow-xs"
                >
                  <RotateCcw className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>បង្កើតសារជាថ្មី (Re-generate)</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveTrip}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-center"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>កំពុងរក្សាទុក...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>រក្សាទុកក្នុង My Trips របស់ខ្ញុំ</span>
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
