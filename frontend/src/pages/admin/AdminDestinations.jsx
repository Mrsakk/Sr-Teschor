import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { adminApi, businessApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getFullImageUrl } from '../../utils/imageUrl';
import {
  MapPin,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Star,
  Sparkles,
  Compass,
  CheckCircle,
  X,
  DollarSign,
  Clock,
  Layers,
  Image as ImageIcon,
  Upload,
  Link2,
  Navigation,
  Crosshair,
  Loader2,
  Globe,
} from 'lucide-react';

// Component to handle map clicks for destination coordinates
function LocationPicker({ formData, setFormData }) {
  const toast = useToastStore();
  const [loadingGeo, setLoadingGeo] = useState(false);

  const map = useMapEvents({
    async click(e) {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);

      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));

      // Auto reverse-geocode to get location name and address details
      try {
        setLoadingGeo(true);
        const res = await businessApi.reverseGeocode(lat, lng);
        if (res.data) {
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            name: prev.name || res.data.name || '',
            khmer_name: prev.khmer_name || res.data.khmer_name || '',
            address: res.data.address || prev.address,
            short_description: prev.short_description || (res.data.name ? `${res.data.name} is a notable destination in ${res.data.city || 'Siem Reap'}.` : prev.short_description),
          }));
          if (res.data.name || res.data.address) {
            toast.info(`📍 បានចាប់ទីតាំង៖ ${res.data.name || res.data.address}`);
          }
        }
      } catch (err) {
        console.log('Reverse geocode error', err);
      } finally {
        setLoadingGeo(false);
      }
    },
  });

  // Re-center map if latitude/longitude change from outside (like pasting a link or geolocation)
  useEffect(() => {
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 15);
    }
  }, [formData.latitude, formData.longitude, map]);

  const lat = parseFloat(formData.latitude);
  const lng = parseFloat(formData.longitude);

  return (!isNaN(lat) && !isNaN(lng)) ? (
    <Marker position={[lat, lng]}>
      <Popup>
        <div className="text-center font-sans">
          <span className="font-bold text-slate-800 text-xs block">{formData.name || 'ទីតាំងគោលដៅទេសចរណ៍'}</span>
          <p className="text-[10px] text-slate-500 mt-0.5 font-khmer">
            {formData.khmer_name || formData.address}
          </p>
          <p className="text-[10px] text-emerald-600 font-mono font-bold mt-1">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form & Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDest, setEditingDest] = useState(null);
  const [destToDelete, setDestToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolvingLink, setResolvingLink] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    khmer_name: '',
    category_id: '',
    short_description: '',
    description: '',
    address: '',
    map_link: '',
    latitude: '13.4125',
    longitude: '103.8670',
    entrance_fee: '0.00',
    fee_notes: 'Covered by Angkor Park Pass',
    opening_time: '07:30',
    closing_time: '17:30',
    best_time: 'Sunrise & Late Afternoon',
    facilities: ['Parking', 'Restrooms', 'Information Guides'],
    is_featured: true,
    is_hidden_gem: false,
    status: 'published',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'],
  });

  const [newFacility, setNewFacility] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const toast = useToastStore();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchDestinations(1);
  }, [categoryFilter, statusFilter]);

  const fetchCategories = async () => {
    try {
      const res = await adminApi.getCategories();
      setCategories(res.data || []);
      if (res.data?.length > 0 && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
      }
    } catch (err) {}
  };

  const fetchDestinations = async (page = 1) => {
    try {
      setIsLoading(true);
      const res = await adminApi.getDestinations({
        page,
        search,
        category_id: categoryFilter || undefined,
        status: statusFilter || undefined,
      });
      setDestinations(res.data.data || []);
      setPagination({
        current_page: res.data.current_page,
        last_page: res.data.last_page,
        total: res.data.total,
      });
    } catch (err) {
      toast.error('Failed to load destinations.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDestinations(1);
  };

  const handleMapLinkBlur = async (urlToResolve = null) => {
    const targetUrl = urlToResolve || formData.map_link;
    if (!targetUrl || !targetUrl.startsWith('http')) return;

    try {
      setResolvingLink(true);
      const res = await businessApi.resolveMapLink(targetUrl);
      if (res.data && res.data.latitude && res.data.longitude) {
        setFormData(prev => ({
          ...prev,
          map_link: targetUrl,
          latitude: String(res.data.latitude),
          longitude: String(res.data.longitude),
          name: res.data.name || prev.name,
          khmer_name: res.data.khmer_name || prev.khmer_name,
          address: res.data.address || prev.address,
          short_description: prev.short_description || (res.data.name ? `${res.data.name} is an ancient cultural and historical attraction in ${res.data.city || 'Siem Reap'}.` : prev.short_description),
          description: prev.description || res.data.description_hint || prev.description,
        }));
        toast.success(`✨ ចាប់បានឈ្មោះ និងទីតាំង៖ ${res.data.name || 'Coords'} (${res.data.latitude}, ${res.data.longitude})`);
      } else {
        toast.warning('No coordinates found in this Google Maps link.');
      }
    } catch (error) {
      console.log('Could not resolve map link coordinates', error);
      toast.error('Could not auto-extract coordinates from Google Maps link.');
    } finally {
      setResolvingLink(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.warning('Geolocation is not supported by your browser.');
      return;
    }
    toast.info('Detecting current GPS location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        try {
          const res = await businessApi.reverseGeocode(lat, lng);
          if (res.data) {
            setFormData(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              name: prev.name || res.data.name || '',
              khmer_name: prev.khmer_name || res.data.khmer_name || '',
              address: res.data.address || prev.address,
            }));
            toast.success(`📍 ចាប់បានទីតាំង GPS៖ ${res.data.name || res.data.address}`);
          }
        } catch (e) {}
      },
      (err) => {
        console.warn('Geolocation error', err);
        toast.error('Unable to retrieve current location. Please grant location permissions or click on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleOpenCreate = () => {
    setEditingDest(null);
    setFormData({
      name: '',
      khmer_name: '',
      category_id: categories[0]?.id || '',
      short_description: '',
      description: '',
      address: 'Angkor Archaeological Park, Siem Reap',
      map_link: '',
      latitude: '13.4125',
      longitude: '103.8670',
      entrance_fee: '0.00',
      fee_notes: 'Covered by Angkor Park Pass',
      opening_time: '07:30',
      closing_time: '17:30',
      best_time: 'Early morning sunrise',
      facilities: ['Parking', 'Restrooms', 'Information Center'],
      is_featured: false,
      is_hidden_gem: false,
      status: 'published',
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80'],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (dest) => {
    setEditingDest(dest);
    setFormData({
      name: dest.name,
      khmer_name: dest.khmer_name || '',
      category_id: dest.category_id,
      short_description: dest.short_description || '',
      description: dest.description || '',
      address: dest.address,
      map_link: dest.map_link || '',
      latitude: dest.latitude ? String(dest.latitude) : '13.4125',
      longitude: dest.longitude ? String(dest.longitude) : '103.8670',
      entrance_fee: dest.entrance_fee || '0.00',
      fee_notes: dest.fee_notes || '',
      opening_time: dest.opening_time ? dest.opening_time.slice(0, 5) : '07:30',
      closing_time: dest.closing_time ? dest.closing_time.slice(0, 5) : '17:30',
      best_time: dest.best_time || '',
      facilities: dest.facilities || ['Parking', 'Restrooms'],
      is_featured: !!dest.is_featured,
      is_hidden_gem: !!dest.is_hidden_gem,
      status: dest.status || 'published',
      images: dest.images?.map(i => i.image) || [],
    });
    setIsFormOpen(true);
  };

  const handleAddFacility = () => {
    if (newFacility.trim()) {
      setFormData(prev => ({ ...prev, facilities: [...prev.facilities, newFacility.trim()] }));
      setNewFacility('');
    }
  };

  const handleRemoveFacility = (index) => {
    setFormData(prev => ({ ...prev, facilities: prev.facilities.filter((_, i) => i !== index) }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      toast.warning('Please paste or type an image URL first.');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl.trim()] }));
    setNewImageUrl('');
    toast.success('Photo URL added to gallery.');
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`File '${file.name}' is not an image.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target.result;
        setFormData(prev => ({ ...prev, images: [...prev.images, base64Url] }));
        toast.success(`Uploaded '${file.name}' from your computer.`);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddPreset = (url, name) => {
    if (formData.images.includes(url)) {
      toast.info('This photo is already in the gallery.');
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    toast.success(`Added '${name}' photo to gallery.`);
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    toast.info('Photo removed from gallery.');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (editingDest) {
        await adminApi.updateDestination(editingDest.id, formData);
        toast.success(`Destination '${formData.name}' updated.`);
      } else {
        await adminApi.createDestination(formData);
        toast.success(`Destination '${formData.name}' published.`);
      }
      setIsFormOpen(false);
      fetchDestinations(pagination.current_page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save destination.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDestination = async () => {
    if (!destToDelete) return;
    try {
      setActionLoading(true);
      await adminApi.deleteDestination(destToDelete.id);
      toast.success(`Destination '${destToDelete.name}' deleted.`);
      setDestToDelete(null);
      fetchDestinations(pagination.current_page);
    } catch (err) {
      toast.error('Failed to delete destination.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Tourist Destinations Catalog</h2>
          <p className="text-xs text-slate-400">
            Total {pagination.total || 0} ancient temples, sacred parks, water bodies, and hidden gems in Siem Reap.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Attraction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search attraction name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </form>
      </div>

      {/* Destinations SaaS Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Attraction</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Admission Fee</th>
                <th className="px-5 py-3.5">Opening Hours</th>
                <th className="px-5 py-3.5">Tags</th>
                <th className="px-5 py-3.5">Rating & Views</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading tourist destinations...
                  </td>
                </tr>
              ) : destinations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    No destinations matching search.
                  </td>
                </tr>
              ) : (
                destinations.map((dest) => {
                  const rawImg = dest.images?.[0]?.image || dest.primary_image?.image;
                  const primaryImg = getFullImageUrl(rawImg, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&auto=format&fit=crop&q=80');

                  return (
                    <tr key={dest.id} className="hover:bg-slate-800/50 transition-colors">
                      {/* Name & Primary Photo */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={primaryImg}
                            alt={dest.name}
                            className="w-12 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <span className="font-bold text-white block text-sm">{dest.name}</span>
                            <span className="text-[11px] text-slate-400 font-khmer">{dest.khmer_name || dest.address}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium">
                          {dest.category?.name || 'Historical'}
                        </span>
                      </td>

                      {/* Fee */}
                      <td className="px-5 py-3.5 font-semibold text-white">
                        {parseFloat(dest.entrance_fee) > 0 ? `$${dest.entrance_fee}` : 'Pass Included'}
                      </td>

                      {/* Hours */}
                      <td className="px-5 py-3.5 text-slate-300">
                        {dest.opening_time ? `${dest.opening_time.slice(0, 5)} - ${dest.closing_time.slice(0, 5)}` : 'Sunrise to Sunset'}
                      </td>

                      {/* Badges */}
                      <td className="px-5 py-3.5 space-x-1">
                        {dest.is_featured && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Sparkles className="w-2.5 h-2.5" /> Featured
                          </span>
                        )}
                        {dest.is_hidden_gem && (
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Compass className="w-2.5 h-2.5" /> Hidden Gem
                          </span>
                        )}
                      </td>

                      {/* Rating & Views */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 font-semibold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{dest.rating || '4.9'}</span>
                          <span className="text-slate-500 text-[10px]">({dest.review_count || 0})</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">{dest.views_count || 0} views</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          dest.status === 'published' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {dest.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(dest)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                            title="Edit destination"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDestToDelete(dest)}
                            className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete destination"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.current_page <= 1}
                onClick={() => fetchDestinations(pagination.current_page - 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 disabled:opacity-40 hover:bg-slate-800 text-white"
              >
                Previous
              </button>
              <button
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => fetchDestinations(pagination.current_page + 1)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 disabled:opacity-40 hover:bg-slate-800 text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Destination Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingDest ? `Edit: ${editingDest.name}` : 'Add New Tourist Destination'}
            </h3>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Destination Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Banteay Kdei"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Khmer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ប្រាសាទបន្ទាយក្ដី"
                    value={formData.khmer_name}
                    onChange={(e) => setFormData({ ...formData, khmer_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-khmer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Address / Zone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. East Baray, Angkor Park, Siem Reap"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Location Detection & Interactive Map */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>Location & GPS Coordinates (ចាប់ទីតាំងដោយស្វ័យប្រវត្តិ)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>ប្រើទីតាំងបច្ចុប្បន្ន (GPS)</span>
                  </button>
                </div>

                {/* Google Maps Link Auto-Resolver */}
                <div className="space-y-1">
                  <label className="block text-[11px] text-slate-400">
                    បញ្ចូល Google Maps Link ឬ Share Link (ស្វ័យប្រវត្តទាញយក Latitude & Longitude)
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Link2 className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="url"
                        placeholder="e.g. https://maps.app.goo.gl/xyz or https://google.com/maps/place/..."
                        value={formData.map_link}
                        onChange={(e) => setFormData({ ...formData, map_link: e.target.value })}
                        onBlur={() => handleMapLinkBlur()}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={resolvingLink || !formData.map_link}
                      onClick={() => handleMapLinkBlur()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {resolvingLink ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>ទាញយក...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5" />
                          <span>ទាញយកទីតាំង</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Leaflet Interactive Map */}
                <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-inner h-48 relative z-0">
                  <MapContainer
                    center={[parseFloat(formData.latitude) || 13.4125, parseFloat(formData.longitude) || 103.8670]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker formData={formData} setFormData={setFormData} />
                  </MapContainer>
                  <div className="absolute top-2 left-2 z-[400] bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300 pointer-events-none">
                    💡 ចុចលើផែនទីដើម្បីកំណត់ទីតាំង (Click map to pin)
                  </div>
                </div>

                {/* Manual Coordinates Override */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Latitude (រយៈទទឹង)</label>
                    <input
                      type="text"
                      required
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Longitude (រយៈបណ្ដោយ)</label>
                    <input
                      type="text"
                      required
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Short & Full Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Short Summary (1-2 sentences)</label>
                <input
                  type="text"
                  placeholder="Summary for preview cards..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Complete Historical Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed architectural history, significance, and travel tips..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              {/* Facilities Chips */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Facilities & Amenities</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {formData.facilities.map((fac, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200">
                      {fac}
                      <button type="button" onClick={() => handleRemoveFacility(idx)} className="text-slate-400 hover:text-rose-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add facility (e.g. Electric Cart Shuttle, Shaded Walkways)"
                    value={newFacility}
                    onChange={(e) => setNewFacility(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFacility}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Photos & Gallery Management */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Destination Gallery Photos ({formData.images.length})</span>
                  </label>
                  <span className="text-[10px] text-slate-400">First photo is used as Primary Cover</span>
                </div>

                {/* Upload Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Upload from Computer */}
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-white cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Upload Image from Device</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* 2. Add via URL */}
                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="Paste image URL (https://...)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shrink-0"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* 3. Quick Siem Reap Presets */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5">Or choose high-res curated Siem Reap presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Kulen Waterfall', url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1200&auto=format&fit=crop&q=80' },
                      { name: 'Angkor Wat Sunrise', url: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&auto=format&fit=crop&q=80' },
                      { name: 'Bayon Stone Faces', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80' },
                      { name: 'Ta Prohm Jungle', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80' },
                      { name: 'Tonle Sap Floating', url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&auto=format&fit=crop&q=80' },
                      { name: 'Banteay Srei Pink Sandstone', url: 'https://images.unsplash.com/photo-1548013146-72479768bbaa?w=1200&auto=format&fit=crop&q=80' },
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPreset(preset.url, preset.name)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-medium text-slate-300 transition-colors"
                      >
                        + {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Active Gallery Grid */}
                {formData.images.length === 0 ? (
                  <div className="py-6 border-2 border-dashed border-slate-700/80 rounded-2xl text-center text-xs text-slate-500">
                    No images added yet. Click 'Upload Image from Device' or choose a preset above.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 h-24 bg-slate-950">
                        <img 
                          src={getFullImageUrl(img)} 
                          alt={`Destination ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80';
                          }}
                        />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-emerald-600 text-[9px] font-bold text-white shadow-md">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                  />
                  <span>Mark as Featured Attraction</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_hidden_gem}
                    onChange={(e) => setFormData({ ...formData, is_hidden_gem: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 bg-slate-800 border-slate-700"
                  />
                  <span>Mark as Hidden Gem</span>
                </label>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {actionLoading ? 'Saving...' : editingDest ? 'Update Destination' : 'Publish Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!destToDelete}
        title={`Delete Destination: ${destToDelete?.name}?`}
        message="This will remove this destination from public search and maps. Existing user favorites and itineraries will be unlinked."
        confirmText="Yes, Delete"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDeleteDestination}
        onCancel={() => setDestToDelete(null)}
      />
    </div>
  );
}
