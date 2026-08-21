import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import {
  Megaphone,
  Plus,
  Trash2,
  Eye,
  MousePointer,
  DollarSign,
  Calendar,
  ExternalLink,
  X,
} from 'lucide-react';

export default function AdminAdvertisements() {
  const [ads, setAds] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    business_id: '',
    title: '',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
    link_url: '/businesses/heritage-suites-resort',
    placement: 'hero_banner',
    price: '35.00',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: 'active',
  });

  const toast = useToastStore();

  useEffect(() => {
    fetchAds();
    fetchBusinesses();
  }, []);

  const fetchAds = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getAdvertisements();
      const rawData = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setAds(rawData);
    } catch (err) {
      toast.error('Failed to load advertisements.');
      setAds([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await adminApi.getBusinesses({ per_page: 50 });
      const rawData = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setBusinesses(rawData);
      if (rawData.length > 0 && !formData.business_id) {
        setFormData(prev => ({ ...prev, business_id: rawData[0].id }));
      }
    } catch (err) {
      setBusinesses([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminApi.createAdvertisement(formData);
      toast.success('Ad placement activated successfully.');
      setIsModalOpen(false);
      fetchAds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create advertisement.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!adToDelete) return;
    try {
      setActionLoading(true);
      await adminApi.deleteAdvertisement(adToDelete.id);
      toast.success('Advertisement removed successfully.');
      setAdToDelete(null);
      await fetchAds();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete ad.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Advertisement Placements & Sponsorships</h2>
          <p className="text-xs text-slate-400">
            Manage sponsored hero banners, search top listings, and impressions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Ad Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-900 rounded-3xl animate-pulse" />
          ))
        ) : ads.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 space-y-3">
            <Megaphone className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold">No active advertisement campaigns.</p>
            <p className="text-xs text-slate-500">Create a new ad placement or let businesses sponsor placements.</p>
          </div>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div className="h-32 relative overflow-hidden">
                <img
                  src={ad.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200'}
                  alt={ad.title || 'Ad'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950/80 text-amber-300 border border-amber-500/30">
                    {String(ad.placement || 'hero_banner').replace('_', ' ')}
                  </span>
                  {ad.status === 'active' ? (
                    ad.is_expiring_soon ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-orange-500/80 text-white animate-pulse">
                        Expiring Soon ({ad.days_remaining ?? 0}d)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/80 text-white">
                        Active ({ad.days_remaining ?? 0}d left)
                      </span>
                    )
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/80 text-white">
                      {ad.status || 'Expired'}
                    </span>
                  )}
                </div>
                <div className="absolute top-3 right-3 font-bold text-xs text-white bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-700">
                  ${ad.price || '0.00'}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{ad.title || 'Untitled Campaign'}</h3>
                  <p className="text-xs text-emerald-400 font-medium mb-3">{ad.business?.name || 'Partner Business'}</p>

                  <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      <span>{ad.impressions || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{ad.clicks || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <span className="text-amber-400 font-bold">CTR: {ad.ctr || 0}%</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    📅 {ad.start_date ? String(ad.start_date).slice(0, 10) : ''} → {ad.end_date ? String(ad.end_date).slice(0, 10) : ''}
                  </span>
                  <button
                    onClick={() => setAdToDelete(ad)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Advertisement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-4">Create Sponsored Placement</h3>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Partner Business</label>
                <select
                  value={formData.business_id}
                  onChange={(e) => setFormData({ ...formData, business_id: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Campaign Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exclusive 20% OFF Pool Villas"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Placement</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="hero_banner">Homepage Hero</option>
                    <option value="search_top">Search Top</option>
                    <option value="destination_sidebar">Destination Sidebar</option>
                    <option value="business_sidebar">Business Sidebar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Price ($ USD)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  {actionLoading ? 'Activating...' : 'Activate Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!adToDelete}
        title="Remove Advertisement?"
        message="This sponsored placement will be taken down immediately."
        confirmText="Remove"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setAdToDelete(null)}
      />
    </div>
  );
}
