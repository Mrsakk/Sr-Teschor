import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getFullImageUrl } from '../../utils/imageUrl';
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  Check,
  X,
} from 'lucide-react';

export default function AdminMedia() {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    file_path: '',
    category: 'destinations',
    alt_text: '',
  });

  const toast = useToastStore();

  useEffect(() => {
    fetchMedia();
  }, [categoryFilter]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getMedia({
        category: categoryFilter || undefined,
        search,
      });
      setMediaItems(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load media assets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Image URL copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminApi.createMedia(formData);
      toast.success('Media asset added to library.');
      setIsUploadOpen(false);
      setFormData({
        title: '',
        file_path: '',
        category: 'destinations',
        alt_text: '',
      });
      fetchMedia();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add media.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading(true);
      await adminApi.deleteMedia(itemToDelete.id);
      toast.success('Media asset removed.');
      setItemToDelete(null);
      fetchMedia();
    } catch (err) {
      toast.error('Failed to delete media asset.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Media & Asset Library</h2>
          <p className="text-xs text-slate-400">
            Organize and manage image assets used across tourist destinations, promotions, and partner profiles.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Media Asset</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { label: 'All Media', value: '' },
            { label: 'Destinations', value: 'destinations' },
            { label: 'Businesses', value: 'businesses' },
            { label: 'Promotions', value: 'promotions' },
            { label: 'Website Assets', value: 'website' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setCategoryFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === tab.value
                  ? 'bg-emerald-600 text-white font-semibold shadow-md'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? (
          [...Array(12)].map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />
          ))
        ) : mediaItems.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            No media assets found in this folder.
          </div>
        ) : (
          mediaItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group relative flex flex-col justify-between"
            >
              <div className="h-28 relative overflow-hidden bg-slate-50">
                <img
                  src={getFullImageUrl(item.file_path, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400')}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400';
                  }}
                />
                <div className="absolute inset-0 bg-slate-50/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopyUrl(item.file_path, item.id)}
                    className="p-1.5 bg-slate-100/90 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    title="Copy URL"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => setItemToDelete(item)}
                    className="p-1.5 bg-slate-100/90 text-white rounded-lg hover:bg-rose-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5">
                <p className="text-[11px] font-bold text-slate-900 truncate" title={item.title}>
                  {item.title}
                </p>
                <span className="text-[9px] text-slate-400 uppercase font-semibold block mt-0.5">
                  {item.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Asset Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-md relative text-left">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">Add Media Asset</h3>

            <form onSubmit={handleUpload} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Asset Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bayon Sunset View"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.file_path}
                  onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Folder Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option value="destinations">Destinations</option>
                  <option value="businesses">Businesses</option>
                  <option value="promotions">Promotions</option>
                  <option value="website">Website Brand Assets</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Alt Text Description</label>
                <input
                  type="text"
                  placeholder="Descriptive caption for accessibility..."
                  value={formData.alt_text}
                  onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  {actionLoading ? 'Saving...' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Media Asset?"
        message="This image will be deleted from the media repository."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
