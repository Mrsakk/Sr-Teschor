import React, { useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import {
  TrendingUp,
  Users,
  Eye,
  Star,
  MapPin,
  Building2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const toast = useToastStore();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin', 'analytics', timeRange],
    queryFn: () => adminApi.getAnalytics({ range: timeRange }).then(r => r.data),
    staleTime: 1000 * 60 * 3,
    refetchOnMount: true,
  });

  const fetchAnalytics = () => {};

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tourism Analytics & Intelligence</h2>
          <p className="text-xs text-slate-400">
            Deep insights into tourist behavior, popular destinations, and conversion performance in Siem Reap.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl">
          {[
            { label: 'Today', value: 'today' },
            { label: '7 Days', value: '7d' },
            { label: '30 Days', value: '30d' },
            { label: '3 Months', value: '3m' },
            { label: '1 Year', value: '1y' },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTimeRange(t.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                timeRange === t.value
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Engagement Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Platform Tourists</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
            3,250 <span className="text-xs text-emerald-600 font-semibold">+18%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Unique tourists browsing this period</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attraction Page Views</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-sky-600 mt-2">
            86,400 <span className="text-xs text-emerald-600 font-semibold">+24%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total temple and attraction views</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Booking Inquiries</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-purple-600 mt-2">
            2,150 <span className="text-xs text-emerald-600 font-semibold">+12%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Generated for partner businesses</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Platform Rating</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-amber-600 mt-2">
            4.92 / 5.0
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 1,400+ verified customer reviews</p>
        </div>
      </div>

      {/* Top Rankings Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Destinations */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Top Visited Historical & Cultural Sites</h3>
          <p className="text-xs text-slate-400 mb-4">Ranked by tourist views in {timeRange}</p>

          <div className="space-y-3">
            {(analytics?.destination_analytics?.most_viewed || []).map((d, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 border border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-emerald-600 font-bold flex items-center justify-center font-mono">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900">{d.name}</span>
                </div>
                <span className="font-mono text-slate-700 font-semibold">{d.views_count?.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Most Viewed Businesses */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Top Engaged Hospitality & Experience Partners</h3>
          <p className="text-xs text-slate-400 mb-4">Ranked by user interactions in {timeRange}</p>

          <div className="space-y-3">
            {(analytics?.business_analytics?.most_viewed || []).map((b, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-100/60 border border-slate-200 text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-sky-600 font-bold flex items-center justify-center font-mono">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900">{b.name}</span>
                </div>
                <span className="font-mono text-slate-700 font-semibold">{b.views_count?.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
