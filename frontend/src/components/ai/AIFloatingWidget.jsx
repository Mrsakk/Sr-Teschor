import React, { useState } from 'react';
import { Sparkles, Bot, MessageSquare } from 'lucide-react';
import AITravelConciergeModal from './AITravelConciergeModal';
import AITripPlannerModal from '../common/AITripPlannerModal';

export default function AIFloatingWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
        {/* Tooltip Pill */}
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md border border-orange-200/80 shadow-lg text-xs font-bold text-slate-800 hover:text-orange-600 hover:border-orange-400 transition-all hover:scale-105 cursor-pointer group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Ask AI Concierge 🤖</span>
        </button>

        {/* Floating Glowing Button */}
        <button
          type="button"
          id="ai-floating-btn"
          onClick={() => setIsChatOpen(true)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white/80 group"
          title="SR TesChor AI Concierge"
        >
          {/* Subtle Glow Ring */}
          <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-400 to-amber-300 opacity-40 blur-xs group-hover:opacity-75 animate-pulse -z-10"></span>

          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />

          {/* Badge */}
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-purple-600 text-[9px] font-black uppercase text-white rounded-full border-2 border-white shadow-xs">
            AI
          </span>
        </button>
      </div>

      {/* Interactive AI Concierge Chat Modal */}
      <AITravelConciergeModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpenPlanner={() => setIsPlannerOpen(true)}
      />

      {/* AI Multi-Day Itinerary Planner Modal */}
      <AITripPlannerModal
        isOpen={isPlannerOpen}
        onClose={() => setIsPlannerOpen(false)}
      />
    </>
  );
}
