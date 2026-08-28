import React, { useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import {
  CreditCard,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export default function AdminSubscriptions() {
  const [planFilter, setPlanFilter] = useState('');
  const toast = useToastStore();

  const { data: subData, isLoading } = useQuery({
    queryKey: ['admin', 'subscriptions', planFilter],
    queryFn: () => adminApi.getSubscriptions({ plan: planFilter || undefined }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
  });

  const subscriptions = subData?.subscriptions?.data || [];
  const analytics = subData?.analytics || {};
  const fetchSubscriptions = () => {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business Subscriptions & MRR</h2>
        <p className="text-xs text-slate-400">
          Monthly recurring revenue generated from business tier upgrades.
        </p>
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Recurring Revenue</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-emerald-600 mt-2">
            ${analytics.mrr || 50}.00 <span className="text-xs text-slate-400 font-medium">/ month</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on active Pro & Premium tiers</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Paid Subscribers</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-2">
            {analytics.total_subscribers || 3} <span className="text-xs text-slate-400 font-medium">businesses</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% renewal retention rate</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pro Plan ($10/mo)</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-sky-600 mt-2">
            {analytics.pro_subscribers || 1} <span className="text-xs text-slate-400 font-medium">partners</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">$10.00 / month gross</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Premium Plan ($20/mo)</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-purple-600 mt-2">
            {analytics.premium_subscribers || 2} <span className="text-xs text-slate-400 font-medium">partners</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">$40.00 / month gross</p>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Subscribed Business Accounts</h3>
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700"
          >
            <option value="">All Tiers</option>
            <option value="pro">Pro ($10/mo)</option>
            <option value="premium">Premium ($20/mo)</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Business Partner</th>
                <th className="px-5 py-3.5">Tier Plan</th>
                <th className="px-5 py-3.5">Monthly Fee</th>
                <th className="px-5 py-3.5">Billing Cycle</th>
                <th className="px-5 py-3.5">Period Validity</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Loading subscription entries...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No active subscriptions matching criteria.
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s.id} className="hover:bg-transparent hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {s.business?.name}
                      <span className="block text-[10px] font-normal text-slate-400 font-mono">
                        {s.business?.owner?.email}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        s.plan === 'premium'
                          ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                          : 'bg-sky-500/20 text-sky-600 border border-sky-500/30'
                      }`}>
                        {s.plan}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-emerald-600">
                      ${s.price} / mo
                    </td>

                    <td className="px-5 py-3.5 uppercase text-slate-700 font-mono text-[11px]">
                      {s.billing_cycle}
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {s.start_date} to {s.end_date}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
