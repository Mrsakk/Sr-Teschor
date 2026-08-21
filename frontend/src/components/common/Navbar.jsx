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
  Settings,
  Star,
  BookOpen,
  CheckCircle,
  Globe,
  Award,
  Package,
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
  const [settings, setSettings] = useState({});
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
    { code: 'km', name: 'ខ្មែរ', short: 'KM' },
    { code: 'en', name: 'English', short: 'EN' },
    { code: 'zh-CN', name: '中文', short: 'ZH' },
    { code: 'fr', name: 'Français', short: 'FR' },
    { code: 'ko', name: '한국어', short: 'KO' },
    { code: 'ja', name: '日本語', short: 'JA' },
    { code: 'vi', name: 'Tiếng Việt', short: 'VI' },
  ];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    // Fetch Settings
    systemApi.getSettings().then((res) => {
      setSettings(res.data || {});
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
    
    setTimeout(() => {
      window.location.reload();
    }, 100);
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
    { name: 'Pricing', path: '/pricing', icon: Sparkles },
    { name: 'Packages', path: '/packages', icon: Award },
    { name: 'Map', path: '/map', icon: MapPin },
    { name: 'Promotions', path: '/promotions', icon: Tag },
    { name: 'Trips', path: '/my-trips', icon: Calendar },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          transparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-xl shadow-[0_1px_30px_rgba(0,0,0,0.08)] border-b border-slate-100'
        }`}
      style={{ minWidth: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-3">

            {/* ── BRAND LOGO ── */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              {settings.site_logo && !logoError ? (
                <div className="relative h-9 flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-300">
                  <img 
                    src={getFullImageUrl(settings.site_logo)} 
                    alt="Logo" 
                    className="h-full w-auto object-contain" 
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-400/30 group-hover:scale-105 transition-all duration-300 shrink-0 overflow-hidden">
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2L9.5 6.5H14.5L12 2ZM7 8.5L4 13.5H20L17 8.5H7ZM2 15.5L3.5 22H20.5L22 15.5H2ZM10.5 17.5H13.5V21H10.5V17.5Z" />
                  </svg>
                </div>
              )}

              <div className="hidden sm:flex flex-col leading-none">
                <div className="flex items-center gap-1">
                  <span
                    translate="no"
                    className={`notranslate font-black text-base tracking-tight transition-colors duration-300 ${
                      transparent ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {settings.site_name || 'Tes Chor'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors duration-300 ${
                    transparent ? 'text-white/55' : 'text-slate-400'
                  }`}
                >
                  Siem Reap
                </span>
              </div>
            </Link>

            {/* ── DESKTOP NAV LINKS (centered) ── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 group ${
                      isActive
                        ? transparent
                          ? 'text-white bg-white/15 backdrop-blur-sm'
                          : 'text-orange-600 bg-orange-50'
                        : transparent
                        ? 'text-white/85 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isActive ? 'text-orange-500' : 'opacity-60 group-hover:opacity-100'
                      }`}
                    />
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── RIGHT SIDE ACTIONS ── */}
            <div className="flex items-center gap-1 shrink-0">

              {/* Hidden Google Translate Target */}
              <div id="google_translate_element" className="hidden"></div>

              {/* Custom Language Dropdown */}
              <div className="relative notranslate" translate="no" ref={langRef}>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                    transparent
                      ? 'border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white'
                      : 'border-slate-200 bg-white hover:border-orange-300 shadow-sm text-slate-700'
                  }`}
                >
                  <span className="text-[13px] font-bold">{currentLang.short}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''} ${
                    transparent ? 'text-white/70' : 'text-slate-400'
                  }`} />
                </button>

                {langDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right py-1.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleTranslate(lang)}
                        className={`w-full text-left px-4 py-2 text-[13px] font-semibold transition-colors ${
                          currentLang.code === lang.code ? 'text-orange-600 bg-orange-50' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Pill */}
              <button
                onClick={onOpenSearch}
                title="Search (⌘K)"
                className={`hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  transparent
                    ? 'bg-white/10 border-white/20 text-white/90 hover:bg-white/20 backdrop-blur-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-orange-300 hover:bg-white hover:text-slate-700 shadow-sm'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="whitespace-nowrap">Search...</span>
              </button>

              {/* Search Icon (non-xl) */}
              <button
                onClick={onOpenSearch}
                className={`xl:hidden p-2 rounded-xl transition-colors ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Favorites Heart (Hidden on small mobile, present in BottomNav) */}
              <Link
                to="/favorites"
                title="Saved Favorites"
                className={`hidden sm:flex relative p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                  transparent
                    ? 'text-white hover:bg-white/10'
                    : 'text-slate-500 hover:text-rose-500 hover:bg-rose-50'
                }`}
              >
                <Heart className={`w-[18px] h-[18px] transition-all ${totalFavorites > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                {totalFavorites > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                    {totalFavorites > 99 ? '99+' : totalFavorites}
                  </span>
                )}
              </Link>

              {/* Notifications Bell */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className={`relative p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                      transparent
                        ? 'text-white hover:bg-white/10'
                        : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                    }`}
                  >
                    <Bell className="w-[18px] h-[18px]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-orange-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm ring-2 ring-white animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">Notifications</h4>
                          {unreadCount > 0 && (
                            <p className="text-[10px] text-orange-600 font-semibold">{unreadCount} unread messages</p>
                          )}
                        </div>
                        <Link
                          to="/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-xs font-bold text-orange-600 hover:underline"
                        >
                          View All
                        </Link>
                      </div>

                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                            <Bell className="w-6 h-6 opacity-30" />
                            <p className="text-xs">No notifications yet</p>
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n.id}
                              className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${
                                !n.is_read ? 'bg-orange-50/40' : ''
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-orange-500' : 'bg-slate-200'}`} />
                                <div>
                                  <p className="text-xs font-bold text-slate-900 leading-tight">{n.title}</p>
                                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── USER AVATAR / DROPDOWN ── */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      transparent
                        ? 'border-white/25 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white'
                        : 'border-slate-200 bg-white hover:border-orange-300 shadow-sm text-slate-800'
                    }`}
                  >
                    <UserAvatar user={user} size="sm" />
                    <span translate="no" className="notranslate hidden lg:block text-xs font-bold max-w-[64px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''} ${
                        transparent ? 'text-white/70' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* User Dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">

                      {/* User Identity */}
                      <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} size="lg" />
                          <div className="min-w-0">
                            <p translate="no" className="notranslate text-sm font-extrabold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                        <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-700 border border-orange-200">
                          {user?.role === 'admin' ? '🛡️ Admin' : user?.role === 'business' ? '🏢 Business' : '🌍 Traveler'}
                        </span>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1.5">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                        >
                          <User className="w-4 h-4 text-orange-500 shrink-0" />
                          <span>My Profile & Settings</span>
                        </Link>
                        <Link
                          to="/bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                        >
                          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/my-trips"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>My Trips Planner</span>
                        </Link>
                        <Link
                          to="/favorites"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>Saved Favorites</span>
                        </Link>
                      </div>

                      {/* Role-based Portals */}
                      {(user?.role === 'business' || user?.role === 'admin') && (
                        <div className="py-1.5 border-t border-slate-100">
                          {(user?.role === 'business' || user?.role === 'admin') && (
                            <Link
                              to="/business/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <Building2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              Business Portal
                            </Link>
                          )}
                          {user?.role === 'admin' && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                              Admin Control Panel
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Logout */}
                      <div className="py-1.5 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <Link
                    to="/login"
                    className={`text-xs font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-200 whitespace-nowrap ${
                      transparent
                        ? 'text-white hover:bg-white/10 border border-white/20'
                        : 'text-slate-700 hover:text-orange-600 hover:bg-slate-50 border border-slate-200 sm:border-transparent'
                    }`}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex text-xs font-extrabold px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-400/30 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-200 whitespace-nowrap"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2.5 rounded-xl lg:hidden ml-1 transition-all duration-200 ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                }`}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white text-slate-900 border-t border-slate-100 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            {/* Search */}
            <div className="px-4 pt-4 pb-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSearch?.();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-500 hover:border-orange-300 transition-colors"
              >
                <Search className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Search destinations, hotels...</span>
              </button>
            </div>

            {/* Nav links */}
            <div className="px-4 py-2 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {/* For Business CTA */}
            <div className="px-4 py-3 border-t border-slate-100">
              <Link
                to="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-extrabold text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
              >
                <Sparkles className="w-5 h-5 text-orange-500" />
                List Your Business on Tes Chor
              </Link>
            </div>

            {/* Auth buttons if not logged in */}
            {!isAuthenticated && (
              <div className="px-4 pb-4 pt-2 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-sm font-bold py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center text-sm font-extrabold py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-400/20"
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
