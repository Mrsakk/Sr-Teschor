import React, { useEffect, useState, useRef } from 'react';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getFullImageUrl } from '../../utils/imageUrl';
import {
  Package,
  Plus,
  Trash2,
  Edit,
  Clock,
  Star,
  DollarSign,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  X,
  Search,
  Check,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [stats, setStats] = useState({
    total_packages: 0,
    active_packages: 0,
    avg_price: 0,
    avg_rating: 5.0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selling_price: '55.00',
    provider_cost: '45.00',
    duration: 'Full Day (8-9 hours)',
    rating: '4.9',
    reviews_count: '24',
    is_active: true,
    image: '',
    includes: [
      'Hotel Pickup & Drop-off in private Air-Con Tuk Tuk',
      'Official Licensed Temple Tour Guide',
      'Chilled drinking water & cold refresher towels',
      'Authentic Khmer Set Lunch'
    ],
  });

  const [newIncludeInput, setNewIncludeInput] = useState('');
  const [imageUploadType, setImageUploadType] = useState('upload'); // 'upload' | 'url' | 'preset'
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  const toast = useToastStore();

  useEffect(() => {
    fetchPackages();
  }, [searchQuery, statusFilter]);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await adminApi.getPackages(params);
      const rawPackages = res.data?.packages?.data || res.data?.packages || (Array.isArray(res.data) ? res.data : []);
      setPackages(rawPackages);
      if (res.data?.stats) {
        setStats(res.data.stats);
      } else {
        setStats({
          total_packages: rawPackages.length,
          active_packages: rawPackages.filter(p => p.is_active).length,
          avg_price: rawPackages.length > 0 ? (rawPackages.reduce((acc, p) => acc + Number(p.selling_price || 0), 0) / rawPackages.length).toFixed(2) : 0,
          avg_rating: 4.9,
        });
      }
    } catch (err) {
      toast.error('Failed to load travel packages.');
      setPackages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPackage(null);
    setFormData({
      name: '',
      description: '',
      selling_price: '55.00',
      provider_cost: '45.00',
      duration: 'Full Day (8-9 hours)',
      rating: '4.9',
      reviews_count: '15',
      is_active: true,
      image: '',
      includes: [
        'Hotel Pickup & Drop-off in private Air-Con Tuk Tuk',
        'Official Licensed Temple Tour Guide',
        'Chilled drinking water & cold refresher towels',
        'Authentic Khmer Set Lunch'
      ],
    });
    setImagePreview('');
    setImageUploadType('upload');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPackage(pkg);
    const inc = Array.isArray(pkg.includes) ? pkg.includes : (typeof pkg.includes === 'string' ? JSON.parse(pkg.includes || '[]') : []);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      selling_price: String(pkg.selling_price || '50.00'),
      provider_cost: String(pkg.provider_cost || '40.00'),
      duration: pkg.duration || 'Full Day (8 hours)',
      rating: String(pkg.rating || '4.9'),
      reviews_count: String(pkg.reviews_count || '10'),
      is_active: !!pkg.is_active,
      image: pkg.image || '',
      includes: inc.length > 0 ? inc : ['Official Licensed Temple Tour Guide', 'Chilled drinking water'],
    });
    setImagePreview(pkg.image || '');
    setImageUploadType(pkg.image?.startsWith('data:') ? 'upload' : 'url');
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result;
      setImagePreview(base64);
      setFormData(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddInclude = () => {
    if (!newIncludeInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      includes: [...prev.includes, newIncludeInput.trim()]
    }));
    setNewIncludeInput('');
  };

  const handleRemoveInclude = (index) => {
    setFormData(prev => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Please fill in package name and description.');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        ...formData,
        selling_price: Number(formData.selling_price),
        provider_cost: Number(formData.provider_cost),
        platform_profit: Number(formData.selling_price) - Number(formData.provider_cost),
        rating: Number(formData.rating),
        reviews_count: Number(formData.reviews_count),
        image: formData.image || imagePreview,
      };

      if (editingPackage) {
        await adminApi.updatePackage(editingPackage.id, payload);
        toast.success('Travel package updated successfully.');
      } else {
        await adminApi.createPackage(payload);
        toast.success('New travel package published.');
      }

      setIsModalOpen(false);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save package.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    try {
      setActionLoading(true);
      await adminApi.deletePackage(packageToDelete.id);
      toast.success('Travel package deleted successfully.');
      setPackageToDelete(null);
      fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete package.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (pkg) => {
    try {
      await adminApi.togglePackageStatus(pkg.id);
      toast.success(`Package ${pkg.is_active ? 'deactivated' : 'activated'}.`);
      fetchPackages();
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  const presetImages = [
    { label: 'Angkor Wat Sunrise', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80' },
    { label: 'Tonle Sap Sunset Cruise', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&auto=format&fit=crop&q=80' },
    { label: 'Kulen Sacred Waterfall', url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&auto=format&fit=crop&q=80' },
    { label: 'Bayon Temple Faces', url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-400" />
            <span>Travel Packages & Guided Tours</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Create, edit, manage pricing, upload photos, and publish curated tourist journeys.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Travel Package</span>
        </button>
      </div>

      {/* 2. Stats Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-bold block">Total Packages</span>
          <span className="text-xl font-black text-white mt-1 block">{stats.total_packages}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-bold block">Active Online</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">{stats.active_packages}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-bold block">Average Price</span>
          <span className="text-xl font-black text-amber-400 mt-1 block">${stats.avg_price}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-bold block">Customer Rating</span>
          <span className="text-xl font-black text-sky-400 mt-1 flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
            <span>{stats.avg_rating}</span>
          </span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search package name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'all' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              statusFilter === 'inactive' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* 4. Packages Grid Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-slate-900 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 space-y-3">
          <Package className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold">No travel packages found.</p>
          <p className="text-xs text-slate-500">Click "New Travel Package" to create your first tour package.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const incList = Array.isArray(pkg.includes) ? pkg.includes : (typeof pkg.includes === 'string' ? JSON.parse(pkg.includes || '[]') : []);
            const margin = Number(pkg.selling_price || 0) - Number(pkg.provider_cost || 0);

            return (
              <div
                key={pkg.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition-colors"
              >
                <div>
                  {/* Image Banner */}
                  <div className="h-44 relative overflow-hidden bg-slate-950">
                    <img
                      src={getFullImageUrl(pkg.image, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800')}
                      alt={pkg.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span>{pkg.duration || 'Full Day'}</span>
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleStatus(pkg)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase transition-colors cursor-pointer ${
                          pkg.is_active
                            ? 'bg-emerald-500/80 hover:bg-emerald-500 text-white'
                            : 'bg-rose-500/80 hover:bg-rose-500 text-white'
                        }`}
                      >
                        {pkg.is_active ? 'Active' : 'Hidden'}
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] text-slate-300 block font-semibold">Selling Price</span>
                        <span className="text-xl font-black text-amber-300">${Number(pkg.selling_price).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-lg border border-slate-700 text-xs font-bold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pkg.rating || 5.0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-sm text-white leading-snug">{pkg.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{pkg.description}</p>

                    {/* Cost & Profit Margin Pills */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Provider Cost:</span>
                        <span className="font-bold text-slate-200">${Number(pkg.provider_cost || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Platform Profit:</span>
                        <span className="font-bold text-emerald-400">+${margin.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Includes Preview */}
                    {incList.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Includes:</span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {incList.slice(0, 3).map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-1 text-[11px]">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">ID #{pkg.id}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(pkg)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5 text-sky-400" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setPackageToDelete(pkg)}
                      className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 5. Create / Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 relative text-left my-8">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  {editingPackage ? 'Edit Travel Package' : 'Create New Travel Package'}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in the travel details, pricing margins, and upload a high-resolution cover.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Package Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Package Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Angkor Wat 1-Day Heritage & Sunrise VIP Experience"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Package Overview & Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the full day highlights, temples visited, transport comfort, and food experience..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Pricing & Duration Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Selling Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Provider Cost ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.provider_cost}
                    onChange={(e) => setFormData({ ...formData, provider_cost: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Full Day (8 hours)"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Real-time Profit Margin Indicator */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Net Platform Profit per Booking:</span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  +${(Number(formData.selling_price || 0) - Number(formData.provider_cost || 0)).toFixed(2)} USD
                </span>
              </div>

              {/* ── IMAGE UPLOAD & SOURCE PICKER ── */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase">
                    Package Cover Image *
                  </label>
                  
                  {/* Source Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('upload')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        imageUploadType === 'upload' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('url')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        imageUploadType === 'url' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline mr-1" />
                      Web URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('preset')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        imageUploadType === 'preset' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3 inline mr-1" />
                      Presets
                    </button>
                  </div>
                </div>

                {/* Option 1: File Upload */}
                {imageUploadType === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-orange-500/60 bg-slate-950/60 rounded-2xl p-4 text-center cursor-pointer transition-colors space-y-1"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-orange-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-200">
                      Click to choose image from your computer
                    </p>
                    <p className="text-[10px] text-slate-500">Supports JPG, PNG, WEBP up to 5MB</p>
                  </div>
                )}

                {/* Option 2: Web URL */}
                {imageUploadType === 'url' && (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                )}

                {/* Option 3: Presets */}
                {imageUploadType === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {presetImages.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: preset.url });
                          setImagePreview(preset.url);
                        }}
                        className={`p-1.5 rounded-xl border text-left text-[10px] transition-all cursor-pointer ${
                          formData.image === preset.url
                            ? 'border-orange-500 bg-orange-500/10 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-12 object-cover rounded-lg mb-1" />
                        <span className="truncate block font-bold">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Image Preview Card */}
                {imagePreview && (
                  <div className="relative h-32 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-400">
                      ✓ Image Ready
                    </div>
                  </div>
                )}
              </div>

              {/* ── INCLUDES LIST BUILDER ── */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 uppercase block">
                  Package Inclusions / Highlights
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Official Licensed Temple Tour Guide..."
                    value={newIncludeInput}
                    onChange={(e) => setNewIncludeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInclude();
                      }
                    }}
                    className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInclude}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                  {formData.includes.map((item, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInclude(index)}
                        className="text-slate-500 hover:text-rose-400 ml-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="packageActiveCheckbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                />
                <label htmlFor="packageActiveCheckbox" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Publish package immediately on public marketplace
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? 'Saving...' : editingPackage ? 'Update Package' : 'Publish Package'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!packageToDelete}
        title="Delete Travel Package?"
        message={`Are you sure you want to remove "${packageToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setPackageToDelete(null)}
      />

    </div>
  );
}
