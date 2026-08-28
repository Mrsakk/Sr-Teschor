import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import {
  Star,
  Search,
  CheckCircle,
  EyeOff,
  Trash2,
  AlertOctagon,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import UserAvatar from '../../components/common/UserAvatar';

export default function AdminReviews() {
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToastStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', statusFilter, ratingFilter, page],
    queryFn: () => adminApi.getReviews({ page, status: statusFilter || undefined, rating: ratingFilter || undefined }).then(r => r.data),
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
  });

  const reviews = data?.data || [];
  const pagination = { current_page: data?.current_page || 1, last_page: data?.last_page || 1, total: data?.total || 0 };
  const fetchReviews = (p = 1) => { setPage(p); queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }); };

  const handleApprove = async (review) => {
    try {
      setActionLoading(true);
      await adminApi.approveReview(review.id);
      toast.success('Review approved and published.');
      fetchReviews(pagination.current_page);
    } catch (err) {
      toast.error('Failed to approve review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHide = async (review) => {
    try {
      setActionLoading(true);
      await adminApi.hideReview(review.id);
      toast.warning('Review hidden from public page.');
      fetchReviews(pagination.current_page);
    } catch (err) {
      toast.error('Failed to hide review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reviewToDelete) return;
    try {
      setActionLoading(true);
      await adminApi.deleteReview(reviewToDelete.id);
      toast.success('Review permanently deleted.');
      setReviewToDelete(null);
      fetchReviews(pagination.current_page);
    } catch (err) {
      toast.error('Failed to delete review.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reviews Moderation Queue</h2>
          <p className="text-xs text-slate-400">
            Total {pagination.total || 0} user ratings and experiences across destinations and businesses.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All Reviews', value: '' },
            { label: 'Approved', value: 'approved' },
            { label: 'Hidden / Flagged', value: 'hidden' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Star Ratings</option>
          <option value="5">★ 5 Stars</option>
          <option value="4">★ 4 Stars</option>
          <option value="3">★ 3 Stars</option>
          <option value="2">★ 2 Stars</option>
          <option value="1">★ 1 Star</option>
        </select>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Reviewer</th>
                <th className="px-5 py-3.5">Target Place</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Comment / Feedback</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading review entries...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No reviews in this queue.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => {
                  const isApproved = rev.status === 'approved';

                  return (
                    <tr key={rev.id} className="hover:bg-transparent hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar user={rev.user} size="sm" />
                          <div>
                            <span className="font-bold text-slate-900 block">{rev.user?.name || 'Anonymous Tourist'}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{rev.user?.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-semibold text-slate-700">
                        {rev.reviewable?.name || 'Tourist Place'}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{rev.rating}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 max-w-xs">
                        <p className="text-slate-700 italic line-clamp-2 leading-relaxed">
                          "{rev.comment}"
                        </p>
                        {rev.reply && (
                          <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                            ↳ Owner Replied: "{rev.reply}"
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {rev.status}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isApproved ? (
                            <button
                              onClick={() => handleApprove(rev)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-600 hover:bg-emerald-600/30 text-xs font-semibold flex items-center gap-1"
                              title="Approve review"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleHide(rev)}
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-500/10"
                              title="Hide from public"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setReviewToDelete(rev)}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                            title="Delete review"
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
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!reviewToDelete}
        title="Delete Review Permanently?"
        message="This review will be permanently deleted from the database. Rating averages will be recalculated."
        confirmText="Delete Review"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  );
}
