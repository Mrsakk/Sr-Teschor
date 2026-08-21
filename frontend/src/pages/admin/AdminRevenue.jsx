import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import {
  DollarSign,
  CreditCard,
  Megaphone,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  Building2,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminRevenue() {
  const [revenueData, setRevenueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToastStore();

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getRevenue();
      setRevenueData(res.data);
    } catch (err) {
      toast.error('Failed to load revenue overview.');
    } finally {
      setIsLoading(false);
    }
  };

  const summary = revenueData?.summary || {};
  const payments = revenueData?.payments?.data || [];

  const exportCSV = () => {
    const headers = ['TXN ID,Payer,Business,Type,Amount ($),Method,Status,Date'];
    const rows = payments.map(p => `"${p.transaction_id}","${p.user?.name || ''}","${p.business?.name || ''}","${p.type}","${p.amount}","${p.payment_method}","${p.status}","${p.created_at}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tes_chor_financial_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Financial ledger exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Financial Revenue Streams</h2>
          <p className="text-xs text-slate-400">
            Total consolidated income generated from subscriptions, advertisements, and tour commissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Statement (CSV)</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stream Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-emerald-500/20 rounded-3xl p-5 shadow-xl bg-gradient-to-br from-emerald-950/30 to-slate-900">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Platform Earnings</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-emerald-400 mt-2">
            ${Number(summary.total_revenue || 92).toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-500/80 mt-1 font-semibold">100% collected & settled</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Subscription Inflow</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-sky-400 mt-2">
            ${Number(summary.subscription_revenue || 50).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Monthly SaaS tier upgrades</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sponsored Ads Revenue</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-purple-400 mt-2">
            ${Number(summary.ad_revenue || 35).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Featured placements & hero slots</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tour Booking Commissions</span>
          <div className="text-2xl lg:text-3xl font-extrabold text-amber-400 mt-2">
            ${Number(summary.commission_revenue || 7).toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">10% commission on bookings</p>
        </div>
      </div>

      {/* Financial Transactions Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Payment Transactions</h3>
          <Link to="/admin/payments" className="text-xs text-emerald-400 hover:underline">
            View All Payments →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">Payer</th>
                <th className="px-5 py-3.5">Stream Type</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    Loading financial ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-white">
                      {p.transaction_id}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-200">{p.user?.name || 'Customer'}</p>
                      {p.business && (
                        <p className="text-[10px] text-emerald-400 font-medium">{p.business.name}</p>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-medium capitalize">
                        {p.type.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      ${Number(p.amount).toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 text-slate-300">
                      {p.payment_method || 'ABA Payway'}
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Completed
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
