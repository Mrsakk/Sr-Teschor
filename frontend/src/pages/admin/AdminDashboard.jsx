import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import StatCard from '../../components/admin/StatCard';
import {
  Users,
  Building2,
  MapPin,
  CalendarCheck,
  DollarSign,
  AlertCircle,
  Star,
  Percent,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-900 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-900 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-900 rounded-2xl" />
          <div className="h-80 bg-slate-900 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentActivities = data?.recent_activities || [];
  const quickCounts = data?.quick_counts || {};

  const PIE_COLORS = ['#10B981', '#06B6D4', '#6366F1', '#EC4899', '#F59E0B', '#8B5CF6', '#14B8A6'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[170px]">
          <p className="font-bold text-white mb-1.5 border-b border-slate-700/60 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-slate-400 font-normal">Analytics</span>
          </p>
          {payload.map((entry, index) => {
            const isCurrency = ['revenue', 'subscriptions', 'ads', 'commission'].includes(entry.dataKey) || 
              entry.name?.includes('$') || 
              entry.name?.includes('Commission') || 
              entry.name?.includes('Subscription') || 
              entry.name?.includes('Advertisements');
            
            const formattedVal = typeof entry.value === 'number'
              ? (isCurrency ? `$${entry.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : entry.value.toLocaleString())
              : entry.value;

            return (
              <div key={index} className="flex items-center justify-between gap-3 text-[11px]">
                <span style={{ color: entry.color }} className="font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-bold text-white">{formattedVal}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 p-5 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Monitoring
            </span>
            <span className="text-xs text-slate-400">Siem Reap, Cambodia</span>
          </div>
          <h2 className="text-xl font-bold text-white">Platform Health & Growth Overview</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time analytics across tourist engagement, business verifications, and financial streams.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/admin/businesses/pending"
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Verify Businesses ({quickCounts.businesses || 0})</span>
          </Link>
          <Link
            to="/admin/destinations"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </Link>
        </div>
      </div>

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Platform Users"
          value={stats.total_users?.value || 0}
          change={stats.total_users?.change}
          trend={stats.total_users?.trend}
          icon={Users}
          color="emerald"
          link="/admin/users"
        />
        <StatCard
          title="Registered Businesses"
          value={stats.total_businesses?.value || 0}
          change={stats.total_businesses?.change}
          trend={stats.total_businesses?.trend}
          icon={Building2}
          color="sky"
          link="/admin/businesses"
        />
        <StatCard
          title="Tourist Attractions"
          value={stats.total_destinations?.value || 0}
          change={stats.total_destinations?.change}
          trend={stats.total_destinations?.trend}
          icon={MapPin}
          color="purple"
          link="/admin/destinations"
        />
        <StatCard
          title="Booking Reservations"
          value={stats.total_bookings?.value || 0}
          change={stats.total_bookings?.change}
          trend={stats.total_bookings?.trend}
          icon={CalendarCheck}
          color="amber"
          link="/admin/bookings"
        />
        <StatCard
          title="Gross Platform Revenue"
          value={stats.total_revenue?.value || '$0.00'}
          change={stats.total_revenue?.change}
          trend={stats.total_revenue?.trend}
          icon={DollarSign}
          color="emerald"
          link="/admin/revenue"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pending_approvals?.value || 0}
          change={stats.pending_approvals?.change}
          trend={stats.pending_approvals?.trend}
          description="requires review"
          icon={AlertCircle}
          color="amber"
          link="/admin/businesses/pending"
        />
        <StatCard
          title="Customer Reviews"
          value={stats.reviews_count?.value || 0}
          change={stats.reviews_count?.change}
          trend={stats.reviews_count?.trend}
          icon={Star}
          color="sky"
          link="/admin/reviews"
        />
        <StatCard
          title="Active Promotions"
          value={stats.active_promotions?.value || 0}
          change={stats.active_promotions?.change}
          trend={stats.active_promotions?.trend}
          icon={Percent}
          color="rose"
          link="/admin/promotions"
        />
      </div>

      {/* Recharts Data Visualizations Grid (Row 1: Revenue Trends & User Growth) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown Trend (AreaChart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Revenue Inflow by Streams ($ USD)</h3>
              <p className="text-xs text-slate-400">Monthly subscription, ad, and commission breakdown</p>
            </div>
            <Link to="/admin/revenue" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              Financials <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.revenue_trend || []}>
                <defs>
                  <linearGradient id="subColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="adColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stroke="#10B981" fillOpacity={1} fill="url(#subColor)" />
                <Area type="monotone" dataKey="ads" name="Advertisements" stroke="#06B6D4" fillOpacity={1} fill="url(#adColor)" />
                <Area type="monotone" dataKey="commission" name="10% Commission" stroke="#F59E0B" fillOpacity={0.2} fill="#F59E0B" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Community Growth (LineChart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Tourist & User Acquisition</h3>
              <p className="text-xs text-slate-400">Total active registered users vs new signups</p>
            </div>
            <Link to="/admin/users" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              All Users <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.user_growth || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="users" name="Total Users" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="new_users" name="New Signups" stroke="#A855F7" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Bookings Volume & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Volume (BarChart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Monthly Reservations & Completion</h3>
              <p className="text-xs text-slate-400">Completed tours vs cancelled/rejected reservations</p>
            </div>
            <Link to="/admin/bookings" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              Bookings <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.bookings_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="completed" name="Completed" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#F43F5E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution (PieChart) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white">Place Categories</h3>
            <Link to="/admin/categories" className="text-xs text-emerald-400 hover:underline">
              Manage
            </Link>
          </div>
          <p className="text-xs text-slate-400 mb-4">Distribution of attractions & businesses</p>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categories_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(charts.categories_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 mt-2 text-[11px]">
            {(charts.categories_distribution || []).slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate text-slate-300">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Popular Destinations & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Destinations Ranking (Horizontal Bars) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Most Visited Tourist Attractions</h3>
              <p className="text-xs text-slate-400">Top ranked destinations by platform views & engagement</p>
            </div>
            <Link to="/admin/destinations" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
              Catalog <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={charts.popular_destinations || []}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={110} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="views" name="Page Views" fill="#10B981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Stream */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm font-bold text-white">Live Activity Stream</h3>
            </div>
            <Link to="/admin/activity-logs" className="text-xs text-emerald-400 hover:underline">
              Audit Logs
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{act.title}</p>
                  <p className="text-slate-400 text-[11px] leading-snug line-clamp-2 mt-0.5">
                    {act.description}
                  </p>
                  <span className="text-[10px] text-slate-500 mt-1 block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
