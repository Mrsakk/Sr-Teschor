import React, { useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import {
  CreditCard,
  Search,
  CheckCircle,
  Download,
  DollarSign,
  Calendar,
} from 'lucide-react';

export default function AdminPayments() {
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const toast = useToastStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'payments', typeFilter, page],
    queryFn: () => adminApi.getPayments({ page, type: typeFilter || undefined }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
  });

  const payments = data?.data || [];
  const pagination = { current_page: data?.current_page || 1, last_page: data?.last_page || 1, total: data?.total || 0 };
  const fetchPayments = (p = 1) => setPage(p);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Payment Transactions Ledger</h2>
          <p className="text-xs text-slate-400">
            Audit log of all platform financial movements, subscriptions, and commissions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All Payments', value: '' },
            { label: 'Subscriptions', value: 'subscription' },
            { label: 'Booking Commissions', value: 'booking_commission' },
            { label: 'Advertisements', value: 'advertisement' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setTypeFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                typeFilter === tab.value
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Transaction ID</th>
                <th className="px-5 py-3.5">Payer / User</th>
                <th className="px-5 py-3.5">Business</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Gateway Method</th>
                <th className="px-5 py-3.5">Date & Time</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-transparent hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                      {p.transaction_id}
                    </td>

                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      {p.user?.name || 'Customer'}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-emerald-600">
                      {p.business?.name || 'Tes Chor Platform'}
                    </td>

                    <td className="px-5 py-3.5 capitalize text-slate-700 font-medium">
                      {p.type.replace('_', ' ')}
                    </td>

                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      ${Number(p.amount).toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 text-slate-700">
                      {p.payment_method || 'ABA Payway'}
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(p.created_at).toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20">
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
