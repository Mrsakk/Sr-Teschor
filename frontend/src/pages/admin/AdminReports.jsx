import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import {
  AlertOctagon,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
  User,
  X,
} from 'lucide-react';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const toast = useToastStore();

  useEffect(() => {
    fetchReports(1);
  }, [statusFilter]);

  const fetchReports = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await adminApi.getReports({
        page,
        status: statusFilter || undefined,
      });
      setReports(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      toast.error('Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      setActionLoading(true);
      await adminApi.updateReportStatus(reportId, {
        status: newStatus,
        admin_notes: adminNotes,
      });
      toast.success(`Report #${reportId} status marked as ${newStatus}.`);
      setSelectedReport(null);
      fetchReports(pagination.current_page);
    } catch (err) {
      toast.error('Failed to update report status.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">User Reports & Moderation Queue</h2>
        <p className="text-xs text-slate-400">
          Complaints submitted by tourists regarding incorrect info, suspicious reviews, or listings.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center gap-1.5 overflow-x-auto">
        {[
          { label: 'All Reports', value: '' },
          { label: 'Pending Review', value: 'pending' },
          { label: 'Investigating', value: 'investigating' },
          { label: 'Resolved', value: 'resolved' },
          { label: 'Rejected', value: 'rejected' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-emerald-600 text-white font-semibold shadow-md'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Report #</th>
                <th className="px-5 py-3.5">Reporter</th>
                <th className="px-5 py-3.5">Type & Target</th>
                <th className="px-5 py-3.5">Report Reason</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No reports in this queue.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-white">
                      #{r.id}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-200">{r.user?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.user?.email}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-amber-400 border border-slate-700">
                        {r.report_type.replace('_', ' ')}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1 capitalize">Target: {r.reportable_type} #{r.reportable_id}</p>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="text-slate-300 line-clamp-2 italic leading-relaxed">
                        "{r.reason}"
                      </p>
                      {r.admin_notes && (
                        <p className="text-[10px] text-emerald-400 mt-1">Notes: {r.admin_notes}</p>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        r.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : r.status === 'pending'
                          ? 'bg-rose-500/10 text-rose-400 animate-pulse'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedReport(r);
                          setAdminNotes(r.admin_notes || '');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Investigate Report #{selectedReport.id}
            </h3>
            <p className="text-xs text-amber-400 uppercase font-bold mb-4">
              Category: {selectedReport.report_type.replace('_', ' ')}
            </p>

            <div className="space-y-3 text-xs bg-slate-800/50 p-4 rounded-2xl border border-slate-800 mb-4">
              <div>
                <span className="text-slate-400 block mb-0.5">Report Reason from User:</span>
                <p className="text-slate-200 italic font-medium leading-relaxed">
                  "{selectedReport.reason}"
                </p>
              </div>
              <div className="pt-2 border-t border-slate-700/60">
                <span className="text-slate-400 block mb-0.5">Submitted By:</span>
                <p className="text-white font-semibold">
                  {selectedReport.user?.name} ({selectedReport.user?.email})
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-medium text-slate-300">
                Resolution Notes / Action Taken:
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Details of investigation or actions taken..."
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus(selectedReport.id, 'investigating')}
                className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
              >
                Investigate
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                Resolve
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateStatus(selectedReport.id, 'rejected')}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
