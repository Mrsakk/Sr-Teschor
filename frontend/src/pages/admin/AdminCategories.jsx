import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getFullImageUrl } from '../../utils/imageUrl';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Layers,
  ArrowUpDown,
  X,
  Sparkles,
  Upload,
  Edit3,
  FolderTree
} from 'lucide-react';

export default function AdminCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catToDelete, setCatToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    icon: 'Landmark',
    type: 'all',
    display_order: 1,
    status: 'active',
  });

  const toast = useToastStore();
  const queryClient = useQueryClient();

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminApi.getCategories().then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
  });

  const categories = categoriesData || [];
  const fetchCategories = () => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      icon: 'Sparkles',
      type: 'all',
      display_order: (categories.length + 1),
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      icon: cat.icon || 'Tag',
      type: cat.type || 'all',
      display_order: cat.display_order || 1,
      status: cat.status || 'active',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, formData);
        toast.success(`Category '${formData.name}' updated.`);
      } else {
        await adminApi.createCategory(formData);
        toast.success(`Category '${formData.name}' created.`);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!catToDelete) return;
    try {
      setActionLoading(true);
      await adminApi.deleteCategory(catToDelete.id);
      toast.success(`Category '${catToDelete.name}' removed.`);
      setCatToDelete(null);
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete category.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(`File '${file.name}' is not an image.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target.result;
      setFormData({ ...formData, image: base64Url });
      toast.success(`Uploaded '${file.name}' successfully.`);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Category Classification</h2>
          <p className="text-xs text-slate-400">
            Organize tourist destinations, hospitality, and dining services across Siem Reap.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-xl animate-pulse" />
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-400">
            No categories defined yet.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-slate-200 transition-all group flex flex-col justify-between relative"
            >
              <div className="h-28 relative overflow-hidden">
                <img
                  src={getFullImageUrl(cat.image, 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80')}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-50/80 backdrop-blur-sm text-emerald-600 border border-emerald-500/30">
                    {cat.type}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{cat.name}</h3>
                    <span className="text-xs font-mono text-slate-400">Order #{cat.display_order}</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {cat.description || 'No detailed description provided.'}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-semibold text-emerald-600">{cat.destinations_count || 0}</span> Attractions •{' '}
                    <span className="font-semibold text-sky-600">{cat.businesses_count || 0}</span> Businesses
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                      title="Edit category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCatToDelete(cat)}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-md relative text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editingCategory ? `Edit: ${editingCategory.name}` : 'Create Place Category'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Khmer Spas"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief overview of places in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">Cover Image</label>
                  <label className="text-[10px] text-emerald-600 hover:text-emerald-300 cursor-pointer flex items-center gap-1 font-bold">
                    <Upload className="w-3 h-3" />
                    Upload Image
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Applicable Scope</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900"
                  >
                    <option value="all">All (Destinations & Businesses)</option>
                    <option value="destination">Destinations Only</option>
                    <option value="business">Businesses Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  {actionLoading ? 'Saving...' : editingCategory ? 'Update' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!catToDelete}
        title={`Delete Category: ${catToDelete?.name}?`}
        message="This category will be deleted. Any attached destinations or businesses will be unassigned."
        confirmText="Yes, Delete"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setCatToDelete(null)}
      />
    </div>
  );
}
