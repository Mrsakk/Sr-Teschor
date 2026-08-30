import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Building2,
  Heart,
  Calendar,
  Search,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Bell,
  Tag,
  ChevronDown,
  Globe,
  Award,
  Package,
  BookOpen,
  Map,
  Layers,
  Gift
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';
import { notificationApi, systemApi } from '../../api/endpoints';
import UserAvatar from './UserAvatar';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function Navbar({ onOpenSearch }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { destinationIds, businessIds } = useFavoriteStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [settings, setSettings] = useState(() => {
    const cached = localStorage.getItem('site_settings');
    return cached ? JSON.parse(cached) : {};
  });
  const [logoError, setLogoError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Custom Language Dropdown State
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState({ code: 'km', name: 'ខ្មែរ', short: 'KM' });
  const langRef = useRef(null);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const totalFavorites = destinationIds.size + businessIds.size;
  const isHome = location.pathname === '/';
  const transparent = !isScrolled && isHome;

  const languages = [
    { code: 'km', name: 'ខ្មែរ', short: 'KM', flag: '🇰🇭' },
    { code: 'en', name: 'English', short: 'EN', flag: '🇬🇧' },
    { code: 'zh-CN', name: '中文', short: 'ZH', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', short: 'FR', flag: '🇫🇷' },
    { code: 'ko', name: '한국어', short: 'KO', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', short: 'JA', flag: '🇯🇵' },
    { code: 'vi', name: 'Tiếng Việt', short: 'VI', flag: '🇻🇳' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch Settings
    systemApi.getSettings().then((res) => {
      if (res.data) {
        setSettings(res.data);
        localStorage.setItem('site_settings', JSON.stringify(res.data));
      }
    }).catch(() => {});

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
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
      setCurrentLang({ code: 'km', name: 'ខ្មែរ', short: 'KM', flag: '🇰🇭' });
    }
  }, []);

  const handleTranslate = (lang) => {
    setCurrentLang(lang);
    setLangDropdownOpen(false);
    
    // Set Google Translate cookies directly
    document.cookie = `googtrans=/en/${lang.code}; path=/`;
    document.cookie = `googtrans=/en/${lang.code}; domain=${window.location.hostname}; path=/`;
    
    const combo = document.querySelector('.goog-te-combo');
    if (combo) {
      combo.value = lang.code;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      notificationApi
        .getAll()
        .then((res) => {
          setNotifications(res.data.notifications?.data || []);
          setUnreadCount(res.data.unread_count || 0);
        })
        .catch(() => {});
    }
  }, [isAuthenticated, location.pathname]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Destinations', path: '/destinations', icon: Compass },
    { name: 'Businesses', path: '/businesses', icon: Building2 },
    { name: 'Packages', path: '/packages', icon: Package },
    { name: 'Map', path: '/map', icon: MapPin },
    { name: 'Trips', path: '/my-trips', icon: Calendar },
    { name: 'Promos', path: '/promotions', icon: Tag, badge: 'Hot' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          transparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/90'
        }`}
        style={{ minWidth: 0 }}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-15 sm:h-16 gap-2 sm:gap-4">

            {/* ── 1. BRAND LOGO ── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              {settings.site_logo && !logoError ? (
                <div className="relative h-8 sm:h-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <img 
                    src={getFullImageUrl(settings.site_logo)} 
                    alt="Logo" 
                    className="h-full w-auto object-contain" 
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0 overflow-hidden text-white font-black text-sm">
                  SR
                </div>
              )}

              <div className="flex flex-col leading-none">
                <span
                  translate="no"
                  className={`notranslate font-black text-sm sm:text-base tracking-tight transition-colors duration-200 font-heading ${
                    transparent ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {settings.site_name || 'SR TesChor'}
                </span>
                <span
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-colors duration-200 ${
                    transparent ? 'text-white/80' : 'text-orange-600'
                  }`}
                >
                  Siem Reap
                </span>
              </div>
            </Link>

            {/* ── 2. CENTER DESKTOP NAV LINKS ── */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path + '/'));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 group ${
                      isActive
                        ? transparent
                          ? 'text-white bg-white/20 backdrop-blur-md shadow-xs ring-1 ring-white/30'
                          : 'text-orange-600 bg-orange-50/90 border border-orange-200/80 shadow-xs'
                        : transparent
                        ? 'text-white/90 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? 'text-orange-600' : transparent ? 'text-white/70' : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-orange-600 text-white animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── 3. RIGHT SIDE CONTROLS & USER PORTAL ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              {/* Hidden Google Translate Target */}
              <div id="google_translate_element" style={{ display: 'none' }}></div>

              {/* Search Pill Button */}
              <button
                onClick={onOpenSearch}
                title="Search destinations & businesses"
                className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  transparent
                    ? 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20 backdrop-blur-md'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-900 shadow-xs'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="whitespace-nowrap hidden xl:inline">Search places...</span>
              </button>

              {/* Search Mobile Icon */}
              <button
                onClick={onOpenSearch}
                className={`md:hidden p-2 rounded-xl transition-colors cursor-pointer ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Language Switcher Dropdown */}
              <div className="relative notranslate" translate="no" ref={langRef}>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                    transparent
                      ? 'border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white'
                      : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs text-slate-700'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>{currentLang.short}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right p-1.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleTranslate(lang)}
                        className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-between ${
                          currentLang.code === lang.code ? 'text-orange-600 bg-orange-50 font-black' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                        {currentLang.code === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-orange-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Favorites Wishlist Icon */}
              <Link
                to="/favorites"
                title="Saved Favorites"
                className={`hidden sm:flex relative p-2 rounded-xl border transition-all ${
                  transparent
                    ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
                    : 'border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-500 hover:text-rose-600 shadow-xs'
                }`}
              >
                <Heart className={`w-4 h-4 transition-colors ${totalFavorites > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                {totalFavorites > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs ring-2 ring-white">
                    {totalFavorites > 99 ? '99+' : totalFavorites}
                  </span>
                )}
              </Link>

              {/* Notifications Bell */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                      transparent
                        ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-xs'
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs ring-2 ring-white animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Modal */}
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-orange-600" /> Notifications
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          {unreadCount} unread
                        </span>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                              <p className="text-xs font-bold text-slate-900">{n.title}</p>
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 4. USER PROFILE & AUTH CONTROLS ── */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-xl border transition-all cursor-pointer ${
                      transparent
                        ? 'border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white'
                        : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs text-slate-800'
                    }`}
                  >
                    <UserAvatar user={user} size="sm" />
                    <span translate="no" className="notranslate hidden md:block text-xs font-black max-w-[80px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`hidden sm:block w-3.5 h-3.5 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''} ${
                        transparent ? 'text-white/70' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* User Profile Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right p-2">

                      {/* User Header Identity */}
                      <div className="px-3.5 py-3 rounded-2xl bg-slate-50 border border-slate-200/80 mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar user={user} size="md" />
                          <div className="min-w-0">
                            <p translate="no" className="notranslate text-xs font-black text-slate-900 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-xs">
                          {user?.role === 'admin' ? '🛡️ Admin' : user?.role === 'business' ? '🏢 Business' : '🌍 Traveler'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="space-y-0.5">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-orange-600 shrink-0" />
                          <span>Traveler Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>My Profile & Settings</span>
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/my-trips"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>My Trips Planner</span>
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                        >
                          <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Saved Favorites</span>
                        </Link>
                      </div>

                      {/* Role Portals */}
                      {(user?.role === 'business' || user?.role === 'admin') && (
                        <div className="pt-1.5 mt-1 border-t border-slate-100 space-y-0.5">
                          {user?.role === 'business' && (
                            <Link
                              to="/business/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                            >
                              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Business Partner Portal</span>
                            </Link>
                          )}
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                              <span>Admin Control Panel</span>
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Sign Out */}
                      <div className="pt-1.5 mt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>Sign Out</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Link
                    to="/login"
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                      transparent
                        ? 'text-white hover:bg-white/10 border border-white/25'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex text-xs font-black px-3.5 py-1.5 rounded-xl bg-orange-600 text-white shadow-xs hover:bg-orange-700 transition-all whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-xl lg:hidden transition-colors cursor-pointer ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* ── 5. MOBILE DRAWER MENU ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white text-slate-900 border-b border-slate-200 shadow-xl rounded-b-3xl animate-in slide-in-from-top-2 duration-200 p-4 space-y-3">
            
            {/* Search Input for Mobile */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch?.();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Search destinations, hotels & restaurants...</span>
            </button>

            {/* Nav links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border border-orange-200/80 font-black'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                      <span>{link.name}</span>
                    </div>
                    {link.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-orange-600 text-white">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Business Partner Promotion */}
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-orange-700 bg-orange-50 border border-orange-200 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>List Your Business on Tes Chor</span>
              </Link>
            </div>

            {/* Auth Buttons or User Controls for Mobile */}
            {isAuthenticated ? (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <UserAvatar user={user} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-xs font-bold py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-xs font-black py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Sign Up Free
                </Link>
              </div>
            )}

          </div>
        )}
      </header>
    </>
  );
}
