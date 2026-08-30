import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { systemApi } from '../../api/endpoints';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function Footer() {
  const [settings, setSettings] = useState(() => {
    const cached = localStorage.getItem('site_settings');
    return cached ? JSON.parse(cached) : {};
  });
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    systemApi.getSettings().then((res) => {
      if (res.data) {
        setSettings(res.data);
        localStorage.setItem('site_settings', JSON.stringify(res.data));
      }
    }).catch(() => {});
  }, []);
  return (
    <footer className="bg-slate-50 text-slate-600 pt-12 sm:pt-16 pb-32 sm:pb-20 lg:pb-12 border-t border-slate-200/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Highlight Banner */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 sm:p-8 mb-10 sm:mb-16 text-white shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm inline-block">
              Are you a business owner in Siem Reap?
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold font-heading leading-tight">
              Register your business on Tes Chor today
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl leading-relaxed">
              Connect directly with thousands of domestic and international tourists looking for accommodation, food, and travel experiences.
            </p>
          </div>
          <Link
            to="/pricing"
            className="w-full md:w-auto inline-flex items-center justify-center whitespace-nowrap gap-2 px-4 py-2.5 bg-white text-orange-700 hover:bg-orange-50 font-bold rounded-xl shadow-xs transition-colors text-xs cursor-pointer active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-orange-600" />
            <span>Register Your Business</span>
          </Link>
        </div>
 
        {/* Footer Main Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-200/80">
          
          {/* Col 1: Brand & Tagline */}
          <div className="col-span-1 sm:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2.5">
              {settings.site_logo && !logoError ? (
                <div className="relative h-9 flex items-center justify-center shrink-0">
                  <img 
                    src={getFullImageUrl(settings.site_logo)} 
                    alt="Logo" 
                    className="h-full w-auto object-contain" 
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-xs overflow-hidden shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L9 7H15L12 2ZM7 9L4 14H20L17 9H7ZM2 16L3.5 22H20.5L22 16H2ZM11 18H13V21H11V18Z" />
                  </svg>
                </div>
              )}
              <span translate="no" className="notranslate font-extrabold text-2xl text-slate-900 tracking-tight font-heading">
                {settings.site_name || 'Tes Chor'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed">
              Tourism and business discovery platform in Siem Reap. Find ancient temples, nature stays, Khmer cuisine, and amazing experiences.
            </p>
            <p className="text-xs font-khmer text-orange-700 font-semibold">
              “Find new places and great experiences in Siem Reap”
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" /> Siem Reap, Cambodia
              </span>
            </div>
          </div>

          {/* Col 2: Discover Destinations */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 sm:mb-4 font-heading">
              DESTINATIONS
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/destinations/angkor-wat" className="text-slate-600 hover:text-orange-600 transition-colors">Angkor Wat temple</Link>
              </li>
              <li>
                <Link to="/destinations/bayon-temple" className="text-slate-600 hover:text-orange-600 transition-colors">Bayon temple</Link>
              </li>
              <li>
                <Link to="/destinations/ta-prohm" className="text-slate-600 hover:text-orange-600 transition-colors">Ta Prohm Ruins</Link>
              </li>
              <li>
                <Link to="/destinations/kampong-phluk" className="text-slate-600 hover:text-orange-600 transition-colors">Kampong Phluk Village</Link>
              </li>
              <li>
                <Link to="/destinations/phnom-kulen" className="text-slate-600 hover:text-orange-600 transition-colors">Phnom Kulen Waterfall</Link>
              </li>
              <li>
                <Link to="/destinations?hidden_gems=true" className="text-slate-600 hover:text-orange-600 transition-colors">Jungle Gems</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Local Businesses */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 sm:mb-4 font-heading">
              LOCAL BUSINESSES
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/businesses?category=hotels-resorts" className="text-slate-600 hover:text-orange-600 transition-colors">Hotels & Resorts</Link>
              </li>
              <li>
                <Link to="/businesses?category=restaurants-dining" className="text-slate-600 hover:text-orange-600 transition-colors">Khmer Dining & Food</Link>
              </li>
              <li>
                <Link to="/businesses?category=cafes-bakeries" className="text-slate-600 hover:text-orange-600 transition-colors">Artisan Cafés</Link>
              </li>
              <li>
                <Link to="/businesses?category=tours-transportation" className="text-slate-600 hover:text-orange-600 transition-colors">Tuk Tuk & Tour Guides</Link>
              </li>
              <li>
                <Link to="/promotions" className="text-slate-600 hover:text-orange-600 transition-colors">Discounts & Offers</Link>
              </li>
              <li>
                <Link to="/map" className="text-slate-600 hover:text-orange-600 transition-colors">Interactive Map</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 sm:mb-4 font-heading">
              PLATFORM
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link to="/my-trips" className="text-slate-600 hover:text-orange-600 transition-colors">Trip Planner Tool</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-slate-600 hover:text-orange-600 transition-colors">Business Pricing Plans</Link>
              </li>
              <li>
                <Link to="/register?role=business" className="text-slate-600 hover:text-orange-600 transition-colors">Register Business</Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 hover:text-orange-600 transition-colors">User Portal Login</Link>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block pt-2">
                  Siem Reap Tourism Discovery Platform
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} SR Tes Chor. All rights reserved. Crafted for Siem Reap Tourism.</p>
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-slate-500">
            <span>Discover More. Travel Better.</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold">B2B2C Tourism Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
