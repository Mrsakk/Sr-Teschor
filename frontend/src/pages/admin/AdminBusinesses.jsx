import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getFullImageUrl } from '../../utils/imageUrl';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  Ban,
  Trash2,
  Eye,
  ExternalLink,
  Download,
  AlertCircle,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  X,
  Sparkles,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export default function AdminBusinesses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [verificationFilter, setVerificationFilter] = useState(searchParams.get('verification') || '');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modals & Action States
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [bizToDelete, setBizToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToastStore();

  // 1. Fetch categories instantly with TanStack Query (0ms)
  const { data: categories = [] } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.getCategories().then(r => r.data || []),
    staleTime: 1000 * 60 * 5,
  });

  // 2. Fetch businesses instantly with TanStack Query (0ms from cache on page open)
  const {
    data: bizResponse,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [
      'admin',
      'businesses',
      {
        page,
        search: submittedSearch,
        status: statusFilter,
        verification_status: verificationFilter,
        category_id: categoryFilter,
      },
    ],
    queryFn: () =>
      adminApi
        .getBusinesses({
          page,
          search: submittedSearch || undefined,
          status: statusFilter || undefined,
          verification_status: verificationFilter || undefined,
          category_id: categoryFilter || undefined,
        })
        .then(r => r.data),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
  });

  const businesses = bizResponse?.data || [];
  const pagination = {
    current_page: bizResponse?.current_page || page,
    last_page: bizResponse?.last_page || 1,
    total: bizResponse?.total || 0,
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSubmittedSearch(search);
  };

  const handleApprove = async (biz) => {
    try {
      setActionLoading(true);
      await adminApi.approveBusiness(biz.id, { admin_notes: adminNotes || 'Verified by Admin' });
      toast.success(`Business '${biz.name}' approved & published.`);
      setIsReviewOpen(false);
      refetch();
    } catch (err) {
      toast.error('Failed to approve business.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (biz) => {
    try {
      setActionLoading(true);
      await adminApi.rejectBusiness(biz.id, { admin_notes: adminNotes || 'Information requires updates' });
      toast.warning(`Business '${biz.name}' rejected with notes.`);
      setIsReviewOpen(false);
      refetch();
    } catch (err) {
      toast.error('Failed to reject business.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspend = async (biz) => {
    try {
      setActionLoading(true);
      await adminApi.suspendBusiness(biz.id);
      toast.success(`Business status toggled.`);
      refetch();
    } catch (err) {
      toast.error('Failed to update business status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBusiness = async () => {
    if (!bizToDelete) return;
    try {
      setActionLoading(true);
      await adminApi.deleteBusiness(bizToDelete.id);
      toast.success(`Business '${bizToDelete.name}' removed.`);
      setBizToDelete(null);
      refetch();
    } catch (err) {
      toast.error('Failed to delete business.');
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID,Business Name,Category,Owner,Verification,Plan,Rating,Views,Created At'];
    const rows = businesses.map(b => `"${b.id}","${b.name}","${b.category?.name || ''}","${b.owner?.name || ''}","${b.verification_status}","${b.subscription_plan}","${b.rating}","${b.views_count}","${b.created_at}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tes_chor_businesses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Business listings exported to CSV');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Business & Partner Management</h2>
          <p className="text-xs text-slate-400">
            Total {pagination.total || 0} registered hospitality, dining, transport, and cultural partners.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Verification Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { label: 'All Listings', value: '' },
            { label: 'Pending Verification', value: 'pending' },
            { label: 'Approved & Verified', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setVerificationFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                verificationFilter === tab.value
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Categories & Search */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-500 max-w-[140px]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <form onSubmit={handleSearch} className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search business name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </form>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Business</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Owner</th>
                <th className="px-5 py-3.5">Verification</th>
                <th className="px-5 py-3.5">Plan Tier</th>
                <th className="px-5 py-3.5">Rating & Views</th>
                <th className="px-5 py-3.5 text-right">Review / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading business listings...
                  </td>
                </tr>
              ) : businesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No business partners matching filters.
                  </td>
                </tr>
              ) : (
                businesses.map((biz) => {
                  const isApproved = biz.verification_status === 'approved';
                  const isPending = biz.verification_status === 'pending';
                  const isRejected = biz.verification_status === 'rejected';
                  const isSuspended = biz.status === 'suspended';

                  return (
                    <tr key={biz.id} className="hover:bg-transparent hover:bg-slate-50 transition-colors">
                      {/* Name & Logo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getFullImageUrl(biz.logo || biz.cover_image || (biz.gallery_images && biz.gallery_images[0]), 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=80')}
                            alt={biz.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{biz.name}</span>
                            <span className="text-[11px] text-slate-400 line-clamp-1">{biz.address}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                          {biz.category?.name || 'General'}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-semibold text-slate-700">{biz.owner?.name || 'N/A'}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{biz.owner?.email}</p>
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="px-5 py-3.5">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                            Pending Review
                          </span>
                        ) : isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-500/20">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Subscription Plan Tier */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          biz.subscription_plan === 'premium'
                            ? 'bg-purple-500/20 text-purple-600 border border-purple-500/30'
                            : biz.subscription_plan === 'pro'
                            ? 'bg-sky-500/20 text-sky-600 border border-sky-500/30'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                          {biz.subscription_plan || 'free'}
                        </span>
                      </td>

                      {/* Rating & Views */}
                      <td className="px-5 py-3.5 text-slate-700">
                        <div className="flex items-center gap-1 font-semibold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{biz.rating || '5.0'}</span>
                          <span className="text-slate-400 text-[10px]">({biz.review_count || 0})</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{biz.views_count || 0} page views</p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedBiz(biz);
                              setAdminNotes(biz.admin_notes || '');
                              setIsReviewOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium text-xs flex items-center gap-1"
                            title="Review partner application"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                          <button
                            onClick={() => handleToggleSuspend(biz)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSuspended ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-500/10'
                            }`}
                            title={isSuspended ? 'Reactivate' : 'Suspend listing'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBizToDelete(biz)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete business listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => setPage(pagination.current_page - 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-900"
              >
                Previous
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => setPage(pagination.current_page + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-100 text-slate-900"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review / Verification Modal */}
      {isReviewOpen && selectedBiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-md relative text-left">
            <button
              onClick={() => setIsReviewOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
              <img
                src={getFullImageUrl(selectedBiz.logo || selectedBiz.cover_image || (selectedBiz.gallery_images && selectedBiz.gallery_images[0]), 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=80')}
                alt={selectedBiz.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=80';
                }}
              />
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedBiz.name}</h3>
                <p className="text-xs text-slate-400">{selectedBiz.category?.name} • {selectedBiz.address}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                    Owner: {selectedBiz.owner?.name} ({selectedBiz.owner?.email})
                  </span>
                </div>
              </div>
            </div>

            {/* Business Details Preview */}
            <div className="py-4 space-y-4 text-xs text-slate-700">
              <div>
                <p className="font-bold text-slate-900 uppercase text-[11px] mb-1">Description</p>
                <p className="text-slate-700 leading-relaxed">{selectedBiz.description || selectedBiz.short_description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-transparent hover:bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                  <span className="font-semibold text-slate-900">{selectedBiz.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Website</span>
                  <span className="font-semibold text-emerald-600">{selectedBiz.website || 'N/A'}</span>
                </div>
              </div>

              {/* Admin Feedback / Approval Notes */}
              <div>
                <label className="block font-bold text-slate-900 uppercase text-[11px] mb-1.5">
                  Admin Verification Notes & Feedback to Business Owner
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter reason for approval or specific updates needed if requesting changes..."
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReject(selectedBiz)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-rose-600/20"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject / Request Changes</span>
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleApprove(selectedBiz)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Verify & Approve Partner</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!bizToDelete}
        title={`Delete Listing: ${bizToDelete?.name}?`}
        message="This will permanently delete this business profile, its services, promotions, and associated customer booking links."
        confirmText="Yes, Delete Business"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDeleteBusiness}
        onCancel={() => setBizToDelete(null)}
      />
    </div>
  );
}
