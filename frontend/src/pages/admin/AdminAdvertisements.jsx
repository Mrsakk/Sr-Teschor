import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getFullImageUrl } from '../../utils/imageUrl';
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
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function AdminAdvertisements() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    business_id: '',
    title: '',
    image: '',
    link_url: '',
    placement: 'hero_banner',
    price: '35.00',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: 'active',
  });

  const toast = useToastStore();

  // 1. Fetch businesses instantly (0ms)
  const { data: bizData } = useQuery({
    queryKey: ['admin', 'businesses', 'lookup'],
    queryFn: () => adminApi.getBusinesses({ per_page: 100 }).then(r => r.data?.data || (Array.isArray(r.data) ? r.data : [])),
    staleTime: 1000 * 60 * 5,
  });
  const businesses = bizData || [];

  // 2. Fetch advertisements instantly (0ms)
  const {
    data: adsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'advertisements'],
    queryFn: () => adminApi.getAdvertisements().then(r => r.data?.data || (Array.isArray(r.data) ? r.data : [])),
    placeholderData: prev => prev,
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true,
  });
  const ads = adsData || [];

  const handleBusinessChange = (bizId) => {
    const selectedBiz = businesses.find(b => String(b.id) === String(bizId));
    setFormData(prev => ({
      ...prev,
      business_id: bizId,
      link_url: selectedBiz ? `/businesses/${selectedBiz.slug || selectedBiz.id}` : prev.link_url || '/businesses'
    }));
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter campaign title');
      return;
    }
    if (!formData.image.trim()) {
      toast.error('Please upload or enter a banner image');
      return;
    }

    try {
      setActionLoading(true);
      await adminApi.createAdvertisement(formData);
      toast.success('Ad campaign activated successfully.');
      setIsModalOpen(false);
      setImagePreview('');
      setFormData({
        business_id: businesses[0]?.id || '',
        title: '',
        image: '',
        link_url: '',
        placement: 'hero_banner',
        price: '35.00',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status: 'active',
      });
      refetch();
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
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete ad.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Advertisement Placements & Sponsorships</h2>
          <p className="text-xs text-slate-500">
            Manage sponsored hero banners, search top listings, popup highlights, and impressions.
          </p>
        </div>

        <button
          onClick={() => {
            if (businesses.length > 0 && !formData.business_id) {
              handleBusinessChange(businesses[0].id);
            }
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Ad Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))
        ) : ads.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 space-y-3 shadow-xs">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No active advertisement campaigns in database.</p>
            <p className="text-xs text-slate-400">Click "New Ad Campaign" to create a new sponsored placement.</p>
          </div>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="h-40 relative overflow-hidden bg-slate-100">
                <img
                  src={getFullImageUrl(ad.image, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200')}
                  alt={ad.title || 'Ad'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900/80 backdrop-blur-sm text-amber-300 border border-amber-500/30">
                    {String(ad.placement || 'hero_banner').replace('_', ' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    ad.status === 'active' 
                      ? 'bg-emerald-500/90 text-white' 
                      : 'bg-slate-500/90 text-white'
                  }`}>
                    {ad.status}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                  <span className="font-bold truncate max-w-[200px]">
                    {ad.business?.name || 'General Sponsor'}
                  </span>
                  <span className="font-mono font-bold text-amber-300">
                    ${Number(ad.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 font-heading">
                  {ad.title}
                </h4>

                <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Impressions</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      {ad.impressions || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Clicks</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                      <MousePointer className="w-3 h-3 text-orange-500" />
                      {ad.clicks || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">CTR</span>
                    <span className="text-xs font-bold text-emerald-600">
                      {ad.ctr || '0%'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {ad.start_date?.slice(0, 10)} → {ad.end_date?.slice(0, 10)}
                  </span>

                  <button
                    onClick={() => setAdToDelete(ad)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Ad"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Ad Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-left max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Sponsored Ad Campaign</h3>
                <p className="text-xs text-slate-500">Add a verified sponsor to display on hero banner or popups.</p>
              </div>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Partner Business (Optional)
                </label>
                <select
                  value={formData.business_id}
                  onChange={(e) => handleBusinessChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-medium"
                >
                  <option value="">General Platform Sponsor (No specific business)</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.address || 'Siem Reap'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Campaign Title / Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exclusive 20% OFF Sunset Tour & Pool Villas"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>

              {/* Banner Image Upload & URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Banner Image <span className="text-rose-500">*</span>
                </label>
                
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 text-orange-600" />
                      <span>Upload Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />

                  {(imagePreview || formData.image) && (
                    <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={getFullImageUrl(imagePreview || formData.image)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800';
                        }}
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                        Image Preview
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Destination Link URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Link / Action URL
                </label>
                <input
                  type="text"
                  placeholder="e.g. /businesses/slug or /packages or https://..."
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>

              {/* Placement & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Placement</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="hero_banner">Homepage & Hero Banner</option>
                    <option value="sidebar">Sidebar Placement</option>
                    <option value="search_top">Search Top Highlight</option>
                    <option value="destination_footer">Destination Footer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Fee ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? 'Activating...' : 'Activate Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!adToDelete}
        title="Remove Advertisement?"
        message="This sponsored placement will be removed permanently from the platform."
        confirmText="Remove"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setAdToDelete(null)}
      />
    </div>
  );
}
