import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import {
  BellRing,
  Send,
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from 'lucide-react';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const [formData, setFormData] = useState({
    target: 'all',
    title: '',
    message: '',
    type: 'information',
    link: '/',
  });

  const toast = useToastStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getNotifications();
      setNotifications(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load notifications history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    try {
      setIsSending(true);
      const res = await adminApi.broadcastNotification(formData);
      toast.success(res.data.message || 'Notification broadcasted successfully.');
      setFormData({
        target: 'all',
        title: '',
        message: '',
        type: 'information',
        link: '/',
      });
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch notification.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Broadcast Notifications & Announcements</h2>
        <p className="text-xs text-slate-400">
          Send platform announcements, maintenance notices, and promotion alerts directly to user trays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Dispatcher Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm lg:col-span-1">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>Send New Broadcast</span>
          </h3>

          <form onSubmit={handleBroadcast} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Target Audience</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="all">All Platform Users</option>
                <option value="customers">Tourists & Customers Only</option>
                <option value="business_owners">Business Owners Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Alert Category</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                <option value="information">Information / Update</option>
                <option value="promotion">Special Promotion</option>
                <option value="warning">System Advisory</option>
                <option value="system">Critical System Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notification Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Khmer New Year Festival Holiday Hours"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Message Content</label>
              <textarea
                rows={4}
                required
                placeholder="Write the announcement or alert details..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Destination URL / Route</label>
              <input
                type="text"
                placeholder="/promotions or /destinations"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-sm shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSending ? 'Sending Broadcast...' : 'Dispatch Broadcast Alert'}
            </button>
          </form>
        </div>

        {/* Broadcast History Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 lg:p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-4">Notification Feed History</h3>

            <div className="space-y-3">
              {isLoading ? (
                <p className="text-xs text-slate-400">Loading notification history...</p>
              ) : notifications.length === 0 ? (
                <p className="text-xs text-slate-400">No broadcast history recorded.</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl bg-slate-100/60 border border-slate-200 text-xs flex items-start gap-3"
                  >
                    <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-emerald-600 shrink-0 mt-0.5">
                      <BellRing className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-900 truncate">{n.title}</span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-400 leading-relaxed">{n.message}</p>
                      {n.user && (
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Sent to: {n.user.name} ({n.user.email})
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
