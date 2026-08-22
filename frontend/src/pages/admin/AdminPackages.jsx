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
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      includes: [
        'Hotel Pickup & Drop-off in private Air-Con Tuk Tuk',
        'Official Licensed Temple Tour Guide',
        'Chilled drinking water & cold refresher towels',
        'Authentic Khmer Set Lunch'
      ],
    });
    setImagePreview('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80');
    setImageUploadType('preset');
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
    if (!formData.name?.trim() || !formData.description?.trim()) {
      toast.error('Please fill in package title and description.');
      return;
    }

    try {
      setActionLoading(true);
      const sellPrice = parseFloat(formData.selling_price) || 0;
      const provCost = parseFloat(formData.provider_cost) || 0;

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        selling_price: sellPrice,
        provider_cost: provCost,
        platform_profit: Math.max(0, sellPrice - provCost),
        duration: formData.duration?.trim() || 'Full Day (8-9 hours)',
        rating: parseFloat(formData.rating) || 5.0,
        reviews_count: parseInt(formData.reviews_count, 10) || 0,
        is_active: formData.is_active !== undefined ? !!formData.is_active : true,
        image: formData.image || imagePreview || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        includes: Array.isArray(formData.includes) ? formData.includes : [],
      };

      if (editingPackage) {
        const res = await adminApi.updatePackage(editingPackage.id, payload);
        toast.success('Travel package updated successfully.');
        // Optimistic update
        if (res.data?.package) {
          setPackages(prev => prev.map(p => p.id === editingPackage.id ? { ...p, ...res.data.package } : p));
        }
      } else {
        const res = await adminApi.createPackage(payload);
        toast.success('New travel package published.');
        // Optimistic insert
        if (res.data?.package) {
          setPackages(prev => [res.data.package, ...prev]);
        }
      }

      setIsModalOpen(false);
      await fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save package.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!packageToDelete) return;
    const targetId = packageToDelete.id;
    try {
      setActionLoading(true);
      // Optimistic delete
      setPackages(prev => prev.filter(p => p.id !== targetId));
      await adminApi.deletePackage(targetId);
      toast.success('Travel package deleted successfully.');
      setPackageToDelete(null);
      await fetchPackages();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete package.');
      await fetchPackages();
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (pkg) => {
    try {
      // Optimistic toggle
      setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, is_active: !p.is_active } : p));
      await adminApi.togglePackageStatus(pkg.id);
      toast.success(`Package ${pkg.is_active ? 'hidden' : 'activated'}.`);
      await fetchPackages();
    } catch (err) {
      toast.error('Failed to update status.');
      await fetchPackages();
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto notranslate" translate="no">
          <div className="bg-slate-900 border border-slate-700/80 max-w-3xl w-full rounded-3xl p-5 sm:p-8 text-white shadow-2xl space-y-6 relative text-left my-6 max-h-[92vh] overflow-y-auto custom-scrollbar notranslate" translate="no">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                    {editingPackage ? 'កែសម្រួលកញ្ចប់ដំណើរកម្សាន្ត (Edit Package)' : 'បង្កើតកញ្ចប់ដំណើរកម្សាន្តថ្មី (New Package)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    បញ្ចូលព័ត៌មានលម្អិត តម្លៃ រយៈពេល និងរូបភាពតំណាងកញ្ចប់ទេសចរណ៍
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: GENERAL INFO */}
              <div className="space-y-4 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-400 block">
                  ១. ព័ត៌មានទូទៅនៃកញ្ចប់
                </span>

                {/* Package Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ចំណងជើងកញ្ចប់ដំណើរកម្សាន្ត (Package Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ឧទាហរណ៍៖ បទពិសោធន៍ទស្សនាប្រាសាទអង្គរវត្ត ពេញមួយថ្ងៃ VIP Sunrise Tour"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ទិដ្ឋភាពទូទៅ និងការពិពណ៌នាកញ្ចប់ (Overview & Description) *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="រៀបរាប់ពីចំណុចសំខាន់ៗ ប្រាសាទដែលត្រូវទស្សនា ការធ្វើដំណើរ អាហារ និងបទពិសោធន៍ពិសេស..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 leading-relaxed transition-colors"
                  />
                </div>
              </div>

              {/* SECTION 2: PRICING & DURATION */}
              <div className="space-y-4 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 block">
                  ២. តម្លៃ និងរយៈពេលដំណើរ
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      តម្លៃលក់ (USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="55.00"
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                        className="w-full pl-7 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      ថ្លៃដើមអ្នកផ្តល់សេវា (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="45.00"
                        value={formData.provider_cost}
                        onChange={(e) => setFormData({ ...formData, provider_cost: e.target.value })}
                        className="w-full pl-7 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      រយៈពេលដំណើរ (Duration)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ពេញមួយថ្ងៃ (8-9 ម៉ោង)"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Real-time Profit Margin Indicator */}
                <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">ប្រាក់ចំណេញសុទ្ធពីកញ្ចប់ក្នុងមួយនាក់ (Net Margin):</span>
                  <span className="font-extrabold text-emerald-400 text-sm px-2.5 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    +${(Number(formData.selling_price || 0) - Number(formData.provider_cost || 0)).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* SECTION 3: COVER IMAGE */}
              <div className="space-y-4 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-400">
                    ៣. រូបភាពតំណាងកញ្ចប់ (Cover Image) *
                  </span>
                  
                  {/* Source Switcher */}
                  <div className="inline-flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setImageUploadType('upload')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        imageUploadType === 'upload' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      ផ្ទុកឡើងឯកសារ
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('url')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        imageUploadType === 'url' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline mr-1" />
                      អាសយដ្ឋានគេហទំព័រ
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadType('preset')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        imageUploadType === 'preset' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3 inline mr-1" />
                      រូបភាពគំរូ
                    </button>
                  </div>
                </div>

                {/* Option 1: File Upload */}
                {imageUploadType === 'upload' && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-700 hover:border-orange-500/60 bg-slate-900/60 rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-1.5"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-orange-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-200">
                      ចុចទីនេះដើម្បីជ្រើសរើសរូបភាពពីកុំព្យូទ័ររបស់អ្នក
                    </p>
                    <p className="text-[10px] text-slate-500">គាំទ្រប្រភេទ JPG, PNG, WEBP ទំហំមិនលើស 5MB</p>
                  </div>
                )}

                {/* Option 2: Web URL */}
                {imageUploadType === 'url' && (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                )}

                {/* Option 3: Presets */}
                {imageUploadType === 'preset' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {presetImages.map((preset, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, image: preset.url });
                          setImagePreview(preset.url);
                        }}
                        className={`p-2 rounded-2xl border text-left transition-all cursor-pointer ${
                          formData.image === preset.url
                            ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/40 text-white'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <img src={preset.url} alt={preset.label} className="w-full h-16 object-cover rounded-xl mb-1.5 shadow-sm" />
                        <span className="text-[10px] font-bold truncate block">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Image Preview Banner */}
                {imagePreview && (
                  <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
                    <img 
                      src={getFullImageUrl(imagePreview)} 
                      alt="Preview" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800';
                      }}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>រូបភាពបានជ្រើសរើស</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 4: INCLUSIONS BUILDER */}
              <div className="space-y-3 bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block">
                  ៤. សេវារួមបញ្ចូល និងចំណុចសំខាន់ៗ (Inclusions)
                </span>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="ឧទាហរណ៍៖ មគ្គុទ្ទេសក៍ទេសចរណ៍ប្រកបដោយវិជ្ជាជីវៈ, រថយន្តម៉ាស៊ីនត្រជាក់..."
                    value={newIncludeInput}
                    onChange={(e) => setNewIncludeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddInclude();
                      }
                    }}
                    className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddInclude}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    បន្ថែម
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.includes.map((item, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-medium">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInclude(index)}
                        className="text-slate-500 hover:text-rose-400 ml-0.5 cursor-pointer p-0.5 rounded-md"
                        title="Remove"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 5: PUBLISH STATUS */}
              <div className="flex items-center gap-3 p-3.5 bg-slate-950/40 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  id="packageActiveCheckbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                />
                <label htmlFor="packageActiveCheckbox" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  ផ្សព្វផ្សាយកញ្ចប់នេះជាសាធារណៈភ្លាមៗ (Publish immediately)
                </label>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 sticky bottom-0 bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold shadow-lg shadow-orange-500/25 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {actionLoading ? 'កំពុងរក្សាទុក...' : editingPackage ? 'រក្សាទុកការកែប្រែ (Update)' : 'ផ្សព្វផ្សាយកញ្ចប់ថ្មី (Publish)'}
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
