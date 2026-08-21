import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { systemApi } from '../../api/endpoints';

export default function Footer() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    systemApi.getSettings().then((res) => {
      setSettings(res.data || {});
    }).catch(() => {});
  }, []);
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Highlight Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl p-8 mb-16 text-white shadow-xl shadow-orange-950/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              Are you a business in Siem Reap?
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-2 font-heading">
              List Your Business on Tes Chor Today
            </h3>
            <p className="text-sm text-orange-100 mt-1 max-w-xl">
              Connect directly with thousands of international and local travelers looking for authentic experiences, boutique hotels, and dining.
            </p>
          </div>
          <Link
            to="/pricing"
            className="whitespace-nowrap px-6 py-3.5 bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-2xl shadow-lg hover:scale-105 transition-all text-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Partner With Us
          </Link>
        </div>

        {/* Footer Main Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              {settings.site_logo ? (
                <div className="relative h-9 flex items-center justify-center shrink-0">
                  <img src={settings.site_logo} alt="Logo" className="h-full w-auto object-contain" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-md overflow-hidden shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L9 7H15L12 2ZM7 9L4 14H20L17 9H7ZM2 16L3.5 22H20.5L22 16H2ZM11 18H13V21H11V18Z" />
                  </svg>
                </div>
              )}
              <span translate="no" className="notranslate font-extrabold text-2xl text-white tracking-tight">
                {settings.site_name || 'Tes Chor'}
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Siem Reap’s dedicated B2B2C tourism discovery & local business platform. Discover ancient temples, boutique retreats, Khmer flavors, and memorable journeys.
            </p>
            <p className="text-xs font-khmer text-orange-400 font-medium">
              “ស្វែងរកកន្លែងថ្មីៗ និងបទពិសោធន៍ល្អៗនៅសៀមរាប”
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-orange-400" /> Siem Reap, Cambodia
              </span>
            </div>
          </div>

          {/* Col 2: Discover Destinations */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Destinations
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/destinations/angkor-wat" className="hover:text-orange-400 transition-colors">Angkor Wat Sunrise</Link>
              </li>
              <li>
                <Link to="/destinations/bayon-temple" className="hover:text-orange-400 transition-colors">Bayon Stone Faces</Link>
              </li>
              <li>
                <Link to="/destinations/ta-prohm" className="hover:text-orange-400 transition-colors">Ta Prohm Ruins</Link>
              </li>
              <li>
                <Link to="/destinations/kampong-phluk" className="hover:text-orange-400 transition-colors">Kampong Phluk Village</Link>
              </li>
              <li>
                <Link to="/destinations/phnom-kulen" className="hover:text-orange-400 transition-colors">Phnom Kulen Waterfall</Link>
              </li>
              <li>
                <Link to="/destinations?hidden_gems=true" className="hover:text-orange-400 transition-colors">Hidden Jungle Gems</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Local Businesses */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Local Directory
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/businesses?category=hotels-resorts" className="hover:text-orange-400 transition-colors">Hotels & Resorts</Link>
              </li>
              <li>
                <Link to="/businesses?category=restaurants-dining" className="hover:text-orange-400 transition-colors">Khmer Dining & Food</Link>
              </li>
              <li>
                <Link to="/businesses?category=cafes-bakeries" className="hover:text-orange-400 transition-colors">Artisan Cafés</Link>
              </li>
              <li>
                <Link to="/businesses?category=tours-transportation" className="hover:text-orange-400 transition-colors">Tuk Tuk & Tour Guides</Link>
              </li>
              <li>
                <Link to="/promotions" className="hover:text-orange-400 transition-colors">Discounts & Offers</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-orange-400 transition-colors">Interactive Map</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/my-trips" className="hover:text-orange-400 transition-colors">Trip Planner Tool</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-orange-400 transition-colors">Business Pricing Plans</Link>
              </li>
              <li>
                <Link to="/register?role=business" className="hover:text-orange-400 transition-colors">Register Business</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-orange-400 transition-colors">User Portal Login</Link>
              </li>
              <li>
                <span className="text-slate-500 text-xs block pt-2">
                  Built with Laravel Sanctum + React & Tailwind CSS
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Tes Chor. All rights reserved. Crafted for Siem Reap Tourism.</p>
          <div className="flex items-center gap-6">
            <span>Discover More. Travel Better.</span>
            <span className="text-slate-700">•</span>
            <span>B2B2C Tourism Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
