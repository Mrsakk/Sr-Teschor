import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import {
  ShieldCheck,
  Plus,
  Lock,
  User,
  Check,
  Mail,
  Phone,
  X,
} from 'lucide-react';

export default function AdminAdmins() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    admin_role: 'content_admin',
  });

  const toast = useToastStore();

  const {
    data: adminData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'admins'],
    queryFn: () => adminApi.getAdmins().then(r => r.data),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 3,
    refetchOnMount: true,
  });

  const admins = adminData?.admins || [];
  const roles = adminData?.roles || [];
  const permissions = adminData?.permissions || {};

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminApi.createAdmin(formData);
      toast.success(`Administrator '${formData.name}' added.`);
      setIsCreateOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: 'password123',
        admin_role: 'content_admin',
      });
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add admin.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Team & Access Control (RBAC)</h2>
          <p className="text-xs text-slate-400">
            Manage administrative staff, assign departmental roles, and enforce granular security privileges.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Administrator</span>
        </button>
      </div>

      {/* Admin Staff Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Active Platform Administrators</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-5 py-3.5">Assigned Role</th>
                <th className="px-5 py-3.5">Contact Phone</th>
                <th className="px-5 py-3.5">Access Privileges</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    Loading admin team...
                  </td>
                </tr>
              ) : admins.map((adm) => (
                <tr key={adm.id} className="hover:bg-transparent hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white text-xs">
                        {adm.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{adm.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{adm.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 border border-purple-500/20">
                      {adm.admin_role ? adm.admin_role.replace('_', ' ') : 'Super Admin'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-slate-700">
                    {adm.phone || 'Internal Staff'}
                  </td>

                  <td className="px-5 py-3.5 text-slate-400">
                    {adm.admin_role === 'super_admin' || !adm.admin_role
                      ? 'Full Global System Access (All Modules)'
                      : adm.admin_role === 'content_admin'
                      ? 'Destinations, Categories, Reviews, Media'
                      : adm.admin_role === 'business_admin'
                      ? 'Partner Verifications, Promotions'
                      : adm.admin_role === 'finance_admin'
                      ? 'Revenue, Subscriptions, Payments'
                      : 'User Reports & Support'}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <Check className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Definitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { name: 'Super Administrator', desc: 'Full authority across financial ledgers, settings, staff creation, and all catalog items.' },
          { name: 'Content Administrator', desc: 'Authorized to create & edit temples, historical destinations, categories, and review moderation.' },
          { name: 'Finance Administrator', desc: 'Access to platform earnings, Stripe/ABA revenue, subscription MRR, and booking commissions.' },
        ].map((r, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-1">{r.name}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Add Admin Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-md relative text-left">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Add Administrator Account</h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sothea Chan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sothea@teschor.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+855 12 999 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={formData.admin_role}
                  onChange={(e) => setFormData({ ...formData, admin_role: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="content_admin">Content Admin (Destinations & Reviews)</option>
                  <option value="business_admin">Business Admin (Partner Verification)</option>
                  <option value="finance_admin">Finance Admin (Subscriptions & Revenue)</option>
                  <option value="support_admin">Support Admin (User Reports)</option>
                  <option value="super_admin">Super Administrator (Full System)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  {actionLoading ? 'Creating...' : 'Grant Admin Privileges'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
