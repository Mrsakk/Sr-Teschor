import React, { useState } from 'react';
import { 
  Sun, 
  CloudSun, 
  Sunset, 
  PhoneCall, 
  ShieldAlert, 
  HeartHandshake, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  MapPin,
  Sparkles
} from 'lucide-react';

export default function EmergencyWeatherWidget() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-[1.5rem] p-5 sm:p-6 lg:p-7 shadow-xs">
      
      {/* Top Row: Weather & Sunrise Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Side: Weather & Sunrise info */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {/* Weather Info */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-sm shrink-0">
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 animate-spin duration-10000" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-800">
                <MapPin className="w-3 h-3" />
                <span>Siem Reap Today</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-extrabold text-slate-900">31°C</span>
                <span className="text-[11px] sm:text-xs font-semibold text-slate-600">Sunny & Breezy</span>
              </div>
            </div>
          </div>

          {/* Sunrise & Sunset Times */}
          <div className="flex items-center gap-2 text-[11px] sm:text-xs bg-white/90 px-3 py-1.5 rounded-xl border border-orange-100 shadow-2xs">
            <div className="flex items-center gap-1 text-orange-700 font-bold">
              <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Sunrise: 05:45 AM</span>
            </div>
            <div className="w-px h-3.5 bg-slate-200" />
            <div className="flex items-center gap-1 text-slate-700 font-semibold">
              <Sunset className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span>Sunset: 06:18 PM</span>
            </div>
          </div>
        </div>

        {/* Toggle Emergency Contacts */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Emergency</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

      </div>

      {/* Expandable Emergency Contacts Panel */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-orange-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
          
          {/* Tourist Police */}
          <a
            href="tel:+85563963440"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-orange-300 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                Tourist Police
              </div>
              <div className="text-xs font-black text-blue-600">063 963 440</div>
            </div>
          </a>

          {/* Hospital */}
          <a
            href="tel:+85563963409"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-orange-300 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                AHC Hospital
              </div>
              <div className="text-xs font-black text-red-600">063 963 409</div>
            </div>
          </a>

          {/* Emergency Ambulance */}
          <a
            href="tel:119"
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-orange-300 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                National
              </div>
              <div className="text-xs font-black text-amber-600">119 / 117</div>
            </div>
          </a>

        </div>
      )}

    </div>
  );
}
