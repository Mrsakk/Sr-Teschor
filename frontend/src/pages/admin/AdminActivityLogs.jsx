import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
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
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [moduleFilter, setModuleFilter] = useState('');
  const [search, setSearch] = useState('');

  const toast = useToastStore();

  useEffect(() => {
    fetchLogs(1);
  }, [moduleFilter]);

  const fetchLogs = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await adminApi.getActivityLogs({
        page,
        module: moduleFilter || undefined,
        search,
      });
      setLogs(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      toast.error('Failed to load activity logs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Security & Audit Activity Logs</h2>
        <p className="text-xs text-slate-400">
          Immutable audit trail of all staff and system actions, verifications, and permission updates.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3">
        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
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
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </form>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
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
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-500">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5 font-semibold text-white">
                      {log.user?.name || 'System Operator'}
                    </td>

                    <td className="px-5 py-3.5 font-bold text-emerald-400">
                      {log.action}
                    </td>

                    <td className="px-5 py-3.5 text-slate-200 max-w-xs truncate">
                      {log.target || 'N/A'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {log.module}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-slate-500 text-[10px]">
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
