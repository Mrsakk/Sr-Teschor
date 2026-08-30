import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Plus,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function AdminHeader({ setIsMobileOpen, isCollapsed }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Language Dropdown State
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState({ code: 'km', name: 'ខ្មែរ', short: 'KM' });
  const langRef = useRef(null);

  const languages = [
    { code: 'km', name: 'ខ្មែរ', short: 'KM' },
    { code: 'en', name: 'English', short: 'EN' },
    { code: 'zh-CN', name: '中文', short: 'ZH' },
    { code: 'fr', name: 'Français', short: 'FR' },
    { code: 'ko', name: '한국어', short: 'KO' },
    { code: 'ja', name: '日本語', short: 'JA' },
    { code: 'vi', name: 'Tiếng Việt', short: 'VI' },
  ];

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync initial language from Google Translate cookie (Default: Khmer)
  useEffect(() => {
    const match = document.cookie.match(/googtrans=\/[a-z]{2}\/([^;]+)/);
    if (match && match[1]) {
      const code = match[1];
      const found = languages.find(l => l.code === code);
      if (found) setCurrentLang(found);
    } else {
      setCurrentLang({ code: 'km', name: 'ខ្មែរ', short: 'KM' });
    }
  }, []);

  const handleTranslate = (lang) => {
    setCurrentLang(lang);
    setLangDropdownOpen(false);
    
    // Clear old cookies first
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
    
    // Set Google Translate cookies directly
    document.cookie = `googtrans=/en/${lang.code}; path=/`;
    document.cookie = `googtrans=/en/${lang.code}; domain=${window.location.hostname}; path=/`;
    
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = lang.code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/users?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Generate breadcrumb title based on path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'Users & Customers';
    if (path.includes('/admin/businesses')) return 'Businesses & Partners';
    if (path.includes('/admin/destinations')) return 'Tourist Destinations';
    if (path.includes('/admin/categories')) return 'Categories';
    if (path.includes('/admin/reviews')) return 'Review Moderation';
    if (path.includes('/admin/bookings')) return 'Booking Reservations';
    if (path.includes('/admin/promotions')) return 'Promotions & Discounts';
    if (path.includes('/admin/advertisements')) return 'Ad Placements';
    if (path.includes('/admin/subscriptions')) return 'Subscription Plans & MRR';
    if (path.includes('/admin/revenue')) return 'Revenue Overview';
    if (path.includes('/admin/payments')) return 'Financial Transactions';
    if (path.includes('/admin/analytics')) return 'Analytics & Insights';
    if (path.includes('/admin/reports')) return 'User Reports & Moderation';
    if (path.includes('/admin/notifications')) return 'Broadcast Alerts';
    if (path.includes('/admin/media')) return 'Media Library';
    if (path.includes('/admin/admins')) return 'Admin Team & Roles';
    if (path.includes('/admin/activity-logs')) return 'Security Audit Trail';
    if (path.includes('/admin/settings')) return 'System Settings';
    if (path.includes('/admin/profile')) return 'Admin Profile';
    return 'Dashboard Overview';
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Left section: mobile hamburger & breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex flex-col">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
            Admin <span className="text-slate-600">/</span> {getBreadcrumb()}
          </span>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mt-0.5">
            {getBreadcrumb()}
          </h1>
        </div>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users, businesses, destinations... (Enter)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-12 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-200 text-slate-400 font-mono px-1.5 py-0.5 rounded border border-slate-600">
            ⌘K
          </span>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button */}
        <Link
          to="/admin/destinations"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Attraction</span>
        </Link>

        {/* Custom Language Dropdown */}
        <div className="relative notranslate" translate="no" ref={langRef}>
          <button
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all duration-200"
          >
            <span className="text-[13px] font-bold">{currentLang.short}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${langDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {langDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-36 bg-slate-100 rounded-xl shadow-md border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right py-1.5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleTranslate(lang)}
                  className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                    currentLang.code === lang.code ? 'text-emerald-600 bg-slate-200' : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-md p-4 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  System Alerts & Activity
                </h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              <div className="py-2 space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-100/60 hover:bg-slate-100 text-xs transition-colors">
                  <p className="font-semibold text-slate-900">New Business Registered</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Heritage Suites Resort & Spa pending review
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100/60 hover:bg-slate-100 text-xs transition-colors">
                  <p className="font-semibold text-slate-900">Platform Commission Paid</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    $7.00 collected from Tour Booking #TC-1
                  </p>
                </div>
              </div>
              <Link
                to="/admin/activity-logs"
                onClick={() => setIsNotificationOpen(false)}
                className="block text-center text-xs text-emerald-600 font-semibold pt-2 border-t border-slate-200 hover:underline"
              >
                View all activity logs →
              </Link>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0 shadow-md">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                }
                alt={user?.name || 'Admin'}
                className="w-full h-full rounded-[10px] object-cover"
              />
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium capitalize">
                {user?.admin_role ? user.admin_role.replace('_', ' ') : 'Super Admin'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-md p-2 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-200 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/admin/settings"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>System Settings</span>
              </Link>

              <Link
                to="/admin/admins"
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span>Team & Permissions</span>
              </Link>

              <div className="my-1 border-t border-slate-200" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
