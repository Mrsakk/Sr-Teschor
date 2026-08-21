import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
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
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState('');
  const toast = useToastStore();

  useEffect(() => {
    fetchPayments(1);
  }, [typeFilter]);

  const fetchPayments = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await adminApi.getPayments({
        page,
        type: typeFilter || undefined,
      });
      setPayments(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      toast.error('Failed to load payments.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Payment Transactions Ledger</h2>
          <p className="text-xs text-slate-400">
            Audit log of all platform financial movements, subscriptions, and commissions.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
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
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
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
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-white">
                      {p.transaction_id}
                    </td>

                    <td className="px-5 py-3.5 font-medium text-slate-200">
                      {p.user?.name || 'Customer'}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-emerald-400">
                      {p.business?.name || 'Tes Chor Platform'}
                    </td>

                    <td className="px-5 py-3.5 capitalize text-slate-300 font-medium">
                      {p.type.replace('_', ' ')}
                    </td>

                    <td className="px-5 py-3.5 font-bold text-white">
                      ${Number(p.amount).toFixed(2)}
                    </td>

                    <td className="px-5 py-3.5 text-slate-300">
                      {p.payment_method || 'ABA Payway'}
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(p.created_at).toLocaleString()}
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
