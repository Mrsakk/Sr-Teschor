import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BottomNav from '../components/common/BottomNav';
import SearchModal from '../components/common/SearchModal';
import AITravelConciergeWidget from '../components/tourist/AITravelConciergeWidget';

export default function PublicLayout() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 antialiased selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar onOpenSearch={() => setSearchOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet context={{ onOpenSearch: () => setSearchOpen(true) }} />
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Floating Bottom Bar */}
      <BottomNav onOpenSearch={() => setSearchOpen(true)} />

      {/* 24/7 AI Travel Assistant Floating Concierge */}
      <AITravelConciergeWidget />

      {/* Global Cmd+K Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
