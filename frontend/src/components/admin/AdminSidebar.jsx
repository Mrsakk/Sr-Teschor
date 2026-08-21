import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { systemApi } from '../../api/endpoints';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Tag,
  Star,
  CalendarCheck,
  Percent,
  Megaphone,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  BellRing,
  Image as ImageIcon,
  Sliders,
  ShieldCheck,
  ScrollText,
  Compass,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Package,
} from 'lucide-react';

export default function AdminSidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    systemApi.getSettings().then((res) => {
      setSettings(res.data || {});
    }).catch(() => {});
  }, []);

  const navigationGroups = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Directory & Catalog',
      items: [
        { name: 'User Directory', path: '/admin/users', icon: Users },
        { name: 'Businesses & Partners', path: '/admin/businesses', icon: Building2 },
        { name: 'Tourist Destinations', path: '/admin/destinations', icon: MapPin },
        { name: 'Categories', path: '/admin/categories', icon: Tag },
        { name: 'Travel Packages', path: '/admin/packages', icon: Package },
      ],
    },
    {
      group: 'Operations & Commerce',
      items: [
        { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
        { name: 'Bookings & Orders', path: '/admin/bookings', icon: CalendarCheck },
        { name: 'Promotions', path: '/admin/promotions', icon: Percent },
        { name: 'Advertisements', path: '/admin/advertisements', icon: Megaphone },
        { name: 'Subscriptions & MRR', path: '/admin/subscriptions', icon: CreditCard },
      ],
    },
    {
      group: 'Financials & Intelligence',
      items: [
        { name: 'Revenue Overview', path: '/admin/revenue', icon: DollarSign },
        { name: 'Payment Transactions', path: '/admin/payments', icon: CreditCard },
        { name: 'Analytics & Insights', path: '/admin/analytics', icon: TrendingUp },
      ],
    },
    {
      group: 'Safety & System',
      items: [
        { name: 'Reports & Flagged', path: '/admin/reports', icon: AlertOctagon },
        { name: 'Broadcast Alerts', path: '/admin/notifications', icon: BellRing },
        { name: 'Media Asset Library', path: '/admin/media', icon: ImageIcon },
        { name: 'Admin Team & Roles', path: '/admin/admins', icon: ShieldCheck },
        { name: 'Audit Activity Logs', path: '/admin/activity-logs', icon: ScrollText },
        { name: 'System Settings', path: '/admin/settings', icon: Sliders },
      ],
    },
  ];

  const handleLinkClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 overflow-hidden text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0 overflow-hidden">
              {settings.site_logo ? (
                <img src={settings.site_logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Compass className="w-6 h-6 animate-spin-slow" />
              )}
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span 
                  translate="no" 
                  className="notranslate font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5 whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {settings.site_name || 'Tes Chor'}
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono shrink-0">ADMIN</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Siem Reap Platform</p>
              </div>
            )}
          </Link>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {navigationGroups.map((grp) => (
            <div key={grp.group}>
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {grp.group}
                </p>
              )}
              <div className="space-y-1">
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                          isActive
                            ? 'bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/20'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                        } ${isCollapsed ? 'justify-center' : ''}`
                      }
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}

                      {/* Tooltip for collapsed mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                          {item.name}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* View Public Platform Footer */}
        <div className="p-3 border-t border-slate-800 shrink-0 bg-slate-900/50">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors border border-slate-800 hover:border-slate-700 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Live Public Site</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
