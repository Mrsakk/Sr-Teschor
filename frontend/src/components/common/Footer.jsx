import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { systemApi } from '../../api/endpoints';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function Footer() {
  const [settings, setSettings] = useState({});
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    systemApi.getSettings().then((res) => {
      setSettings(res.data || {});
    }).catch(() => {});
  }, []);
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 sm:pt-16 pb-32 sm:pb-20 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Highlight Banner */}
        <div className="bg-orange-600 rounded-xl sm:rounded-xl p-6 sm:p-8 mb-10 sm:mb-16 text-white shadow-sm shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm inline-block">
              តើអ្នកជាម្ចាស់អាជីវកម្មនៅសៀមរាបមែនទេ?
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold font-heading leading-tight">
              ចុះឈ្មោះអាជីវកម្មរបស់អ្នកនៅលើ Tes Chor ថ្ងៃនេះ
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl leading-relaxed">
              ភ្ជាប់ទំនាក់ទំនងដោយផ្ទាល់ជាមួយភ្ញៀវទេសចរជាតិ និងអន្តរជាតិរាប់ពាន់នាក់ ដែលកំពុងស្វែងរកកន្លែងស្នាក់នៅ ម្ហូបអាហារ និងដំណើរកម្សាន្ត។
            </p>
          </div>
          <Link
            to="/pricing"
            className="w-full md:w-auto justify-center whitespace-nowrap px-6 py-3.5 bg-white text-orange-600 hover:bg-orange-50 font-extrabold rounded-xl sm:rounded-xl shadow-lg hover:scale-102 transition-all text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>ចុះឈ្មោះចូលរួម (Partner With Us)</span>
          </Link>
        </div>

        {/* Footer Main Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800">
          
          {/* Col 1: Brand & Tagline */}
          <div className="col-span-1 sm:col-span-2 space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3">
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
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-black text-xl shadow-md overflow-hidden shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2L9 7H15L12 2ZM7 9L4 14H20L17 9H7ZM2 16L3.5 22H20.5L22 16H2ZM11 18H13V21H11V18Z" />
                  </svg>
                </div>
              )}
              <span translate="no" className="notranslate font-extrabold text-2xl text-white tracking-tight">
                {settings.site_name || 'Tes Chor'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              វេទិកាស្វែងរកទេសចរណ៍ និងអាជីវកម្មក្នុងស្រុកនៅខេត្តសៀមរាប។ ស្វែងរកប្រាសាទបុរាណ កន្លែងស្នាក់នៅបែបធម្មជាតិ រសជាតិម្ហូបខ្មែរ និងបទពិសោធន៍ដ៏អស្ចារ្យ។
            </p>
            <p className="text-xs font-khmer text-orange-400 font-medium">
              “ស្វែងរកកន្លែងថ្មីៗ និងបទពិសោធន៍ល្អៗនៅសៀមរាប”
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" /> ខេត្តសៀមរាប, ប្រទេសកម្ពុជា
              </span>
            </div>
          </div>

          {/* Col 2: Discover Destinations */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
              រមណីយដ្ឋាន (Destinations)
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
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
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
              អាជីវកម្ម (Local Places)
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
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
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
              សេវាកម្ម (Platform)
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
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
                <span className="text-slate-500 text-[11px] block pt-2">
                  Siem Reap Tourism Discovery Platform
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Tes Chor. All rights reserved. Crafted for Siem Reap Tourism.</p>
          <div className="flex items-center gap-4 sm:gap-6 text-[11px] sm:text-xs">
            <span>Discover More. Travel Better.</span>
            <span className="text-slate-700">•</span>
            <span>B2B2C Tourism Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
