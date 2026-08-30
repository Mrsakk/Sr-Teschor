import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BottomNav from '../components/common/BottomNav';
import SearchModal from '../components/common/SearchModal';
import AITravelConciergeWidget from '../components/tourist/AITravelConciergeWidget';
import SponsoredAdPopup from '../components/ads/SponsoredAdPopup';

export default function PublicLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white print:bg-white print:p-0">
      {/* Top Navigation */}
      <div className="print:hidden">
        <Navbar onOpenSearch={() => setSearchOpen(true)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 print:p-0">
        <Outlet context={{ onOpenSearch: () => setSearchOpen(true) }} />
      </main>

      {/* Global Footer */}
      <div className="print:hidden">
        <Footer />
      </div>

      {/* Mobile Floating Bottom Bar */}
      <div className="print:hidden">
        <BottomNav onOpenSearch={() => setSearchOpen(true)} />
      </div>

      {/* 24/7 AI Travel Assistant Floating Concierge */}
      <div className="print:hidden">
        <AITravelConciergeWidget />
      </div>

      {/* Entry Promotional Sponsored Ad Popup */}
      <div className="print:hidden">
        <SponsoredAdPopup />
      </div>

      {/* Global Cmd+K Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
