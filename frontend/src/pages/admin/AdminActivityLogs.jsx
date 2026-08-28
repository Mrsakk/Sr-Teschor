import React, { useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useToastStore } from '../../store/useToastStore';
import {
  ScrollText,
  Search,
  Shield,
  Clock,
  User,
  Filter,
} from 'lucide-react';

export default function AdminActivityLogs() {
  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const toast = useToastStore();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'activity-logs', moduleFilter, page],
    queryFn: () => adminApi.getActivityLogs({
      page,
      module: moduleFilter || undefined,
      search,
    }).then(r => r.data),
    staleTime: 1000 * 60 * 1, // logs refresh every 1 min
    refetchOnMount: true,
  });

  const logs = data?.data || [];
  const pagination = { current_page: data?.current_page || 1, last_page: data?.last_page || 1, total: data?.total || 0 };

  const fetchLogs = (p = 1) => setPage(p);
  const handleSearch = (e) => { e.preventDefault(); fetchLogs(1); };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Security & Audit Activity Logs</h2>
        <p className="text-xs text-slate-400">
          Immutable audit trail of all staff and system actions, verifications, and permission updates.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
        >
          <option value="">All Modules</option>
          <option value="businesses">Businesses</option>
          <option value="destinations">Destinations</option>
          <option value="users">Users</option>
          <option value="reviews">Reviews</option>
          <option value="reports">Reports</option>
          <option value="settings">Settings</option>
          <option value="admins">Admin Team</option>
        </select>

        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Admin Staff</th>
                <th className="px-5 py-3.5">Action Performed</th>
                <th className="px-5 py-3.5">Target Record</th>
                <th className="px-5 py-3.5">Module</th>
                <th className="px-5 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-transparent hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {log.user?.name || 'System Operator'}
                    </td>

                    <td className="px-5 py-3.5 font-bold text-emerald-600">
                      {log.action}
                    </td>

                    <td className="px-5 py-3.5 text-slate-700 max-w-xs truncate">
                      {log.target || 'N/A'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {log.module}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-400 text-[10px]">
                      {log.ip_address || '127.0.0.1'}
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
