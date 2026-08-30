import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Building2, 
  Eye, 
  Calendar, 
  Star, 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Tag, 
  Clock, 
  Check, 
  X,
  Layers,
  Trash2,
  Edit3,
  Zap,
  Megaphone,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Flame,
  ShieldCheck,
  MousePointer,
  Upload,
  Link2,
  Image as ImageIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { businessApi, bookingApi, categoryApi, promotionApi, serviceApi, subscriptionApi, advertisementApi } from '../../api/endpoints';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import KhqrPaymentModal from '../../components/common/KhqrPaymentModal';

export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);

  // Modals state
  const [addBusinessModal, setAddBusinessModal] = useState(false);
  const [addServiceModal, setAddServiceModal] = useState(false);
  const [addPromoModal, setAddPromoModal] = useState(false);
  const [khqrBoostModal, setKhqrBoostModal] = useState(false);
  const [selectedBizForBoost, setSelectedBizForBoost] = useState(null);
  const [selectedBizForAction, setSelectedBizForAction] = useState(null);

  // Self-Service Advertisements State
  const [adsData, setAdsData] = useState({ summary: {}, data: [] });
  const [loadingAds, setLoadingAds] = useState(false);
  const [addAdModal, setAddAdModal] = useState(false);
  const [renewAdModal, setRenewAdModal] = useState(false);
  const [selectedAdForRenew, setSelectedAdForRenew] = useState(null);
  const [khqrAdModal, setKhqrAdModal] = useState(false);
  const [adPaymentPayload, setAdPaymentPayload] = useState(null);
  const [renewDuration, setRenewDuration] = useState(15);

  const PLACEMENT_PRICING = {
    hero_banner: { name: 'Homepage Hero Spotlight Banner (Wide)', desc: 'Top of homepage banner with highest visibility', 7: 15, 15: 25, 30: 45, 60: 80 },
    search_top: { name: 'Top Search Results Banner', desc: 'Prominent display when tourists search for places in Siem Reap', 7: 10, 15: 18, 30: 32, 60: 55 },
    destination_sidebar: { name: 'Destination Pages Sidebar', desc: 'Appears beside top tourist attractions & temple guides', 7: 7, 15: 12, 30: 22, 60: 40 },
    business_sidebar: { name: 'Business Directory Sidebar', desc: 'Appears beside related business profile pages', 7: 7, 15: 12, 30: 22, 60: 40 },
  };

  const [newAd, setNewAd] = useState({
    business_id: '',
    title: '',
    image: '',
    image_preview: '',
    image_file_name: '',
    image_file_size: '',
    link_url: '',
    placement: 'hero_banner',
    duration_days: 15,
    price: 25,
  });

  const [imageUploadMode, setImageUploadMode] = useState('upload'); // 'upload', 'url', 'cover'

  // Component to handle map clicks
  function LocationPicker({ newBiz, setNewBiz }) {
    const map = useMapEvents({
      async click(e) {
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        setNewBiz(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));

        try {
          const res = await businessApi.reverseGeocode(lat, lng);
          if (res.data) {
            setNewBiz(prev => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              name: prev.name || res.data.name || '',
              khmer_name: prev.khmer_name || res.data.khmer_name || '',
              address: res.data.address || prev.address,
              description: prev.description || (res.data.name ? `${res.data.name} is located in ${res.data.city || 'Siem Reap'}, Cambodia.` : prev.description),
            }));
          }
        } catch (err) {
          console.log('Reverse geocode error', err);
        }
      },
    });

    // Re-center map if latitude/longitude change from outside (like pasting a link)
    useEffect(() => {
      if (newBiz.latitude && newBiz.longitude) {
        map.flyTo([newBiz.latitude, newBiz.longitude], 15);
      }
    }, [newBiz.latitude, newBiz.longitude, map]);

    return (
      newBiz.latitude && newBiz.longitude ? (
        <Marker position={[newBiz.latitude, newBiz.longitude]}>
          <Popup>
            <div className="text-center font-sans">
              <span className="font-bold text-slate-800 text-xs block">{newBiz.name || 'New Business Location'}</span>
              <p className="text-[10px] text-slate-500 mt-0.5 font-khmer">{newBiz.khmer_name || newBiz.address || 'Selected Location'}</p>
            </div>
          </Popup>
        </Marker>
      ) : null
    );
  }

  // New Business Form State
  const initialBizState = {
    category_id: '',
    name: '',
    khmer_name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    price_range: '$$',
    opening_hours: '08:00 AM - 10:00 PM',
    location_code: '',
    map_link: '',
    latitude: 13.3615,
    longitude: 103.8596,
    gallery_images: [],
    gallery_files: [],
  };

  const [newBiz, setNewBiz] = useState(initialBizState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [resolvingLink, setResolvingLink] = useState(false);

  const handleMapLinkBlur = async () => {
    if (!newBiz.map_link || !newBiz.map_link.startsWith('http')) return;
    
    try {
      setResolvingLink(true);
      const res = await businessApi.resolveMapLink(newBiz.map_link);
      if (res.data && res.data.latitude && res.data.longitude) {
        setNewBiz(prev => ({
          ...prev,
          latitude: res.data.latitude,
          longitude: res.data.longitude,
          name: res.data.name || prev.name,
          khmer_name: res.data.khmer_name || prev.khmer_name,
          address: res.data.address || prev.address,
          description: prev.description || (res.data.name ? `${res.data.name} is a premier business establishment in ${res.data.city || 'Siem Reap'}, Cambodia.` : prev.description),
        }));
      }
    } catch (error) {
      console.log('Could not resolve map link coordinates');
    } finally {
      setResolvingLink(false);
    }
  };

  // New Service Form State
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration: '2 Hours',
  });

  // New Promotion Form State
  const [newPromo, setNewPromo] = useState({
    title: '',
    description: '',
    discount: '20% OFF',
    promo_code: 'SPECIAL20',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const { data: catData } = useQuery({
    queryKey: ['categories', { type: 'business' }],
    queryFn: () => categoryApi.getAll({ type: 'business' }).then(r => r.data),
    staleTime: 1000 * 60 * 10,
    placeholderData: prev => prev,
    refetchOnMount: true,
  });

  const { data: dashboardData } = useQuery({
    queryKey: ['businessDashboardStats'],
    queryFn: async () => {
      const [statsRes, allBizRes] = await Promise.all([
        businessApi.getDashboardStats(),
        businessApi.getAll({ per_page: 50 }),
      ]);
      const myBizList = statsRes.data?.businesses || [];
      const globalBizList = allBizRes.data?.data || allBizRes.data || [];
      const combinedBiz = myBizList.length > 0 ? myBizList : globalBizList;
      return { ...statsRes.data, businesses: combinedBiz };
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: prev => prev,
    refetchOnMount: true,
  });

  const { data: fetchedAdsData } = useQuery({
    queryKey: ['myAdvertisements'],
    queryFn: () => advertisementApi.getMyAdvertisements().then(r => r.data),
    staleTime: 1000 * 60 * 5,
    placeholderData: prev => prev,
    refetchOnMount: true,
  });

  const fetchAds = async () => {
    // Kept for backward compatibility in case other functions call it
    try {
      setLoadingAds(true);
      const res = await advertisementApi.getMyAdvertisements();
      if (res.data) setAdsData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAds(false);
    }
  };

  const fetchData = async () => {
    // Kept for manual refresh button if needed
    try {
      const [statsRes, catRes, allBizRes] = await Promise.all([
        businessApi.getDashboardStats(),
        categoryApi.getAll({ type: 'business' }),
        businessApi.getAll({ per_page: 50 }),
      ]);
      const myBizList = statsRes.data?.businesses || [];
      const globalBizList = allBizRes.data?.data || allBizRes.data || [];
      const combinedBiz = myBizList.length > 0 ? myBizList : globalBizList;
      setData({ ...statsRes.data, businesses: combinedBiz });
      setCategories(catRes.data || []);
      if (combinedBiz.length > 0) {
        setSelectedBizForAction(combinedBiz[0]);
        setNewBiz((prev) => ({ ...prev, category_id: catRes.data?.[0]?.id || '' }));
        setNewAd((prev) => ({ ...prev, business_id: combinedBiz[0].id }));
      }
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (dashboardData) {
      setData(dashboardData);
      const combinedBiz = dashboardData.businesses || [];
      if (combinedBiz.length > 0 && !selectedBizForAction) {
        setSelectedBizForAction(combinedBiz[0]);
        setNewAd(prev => ({ ...prev, business_id: combinedBiz[0].id }));
      }
    }
  }, [dashboardData, selectedBizForAction]);

  useEffect(() => {
    if (catData) {
      setCategories(catData);
      if (!newBiz.category_id && catData.length > 0) {
        setNewBiz(prev => ({ ...prev, category_id: catData[0].id }));
      }
    }
  }, [catData, newBiz.category_id]);

  useEffect(() => {
    if (fetchedAdsData) {
      setAdsData(fetchedAdsData);
      setLoadingAds(false);
    }
  }, [fetchedAdsData]);

  const handlePlacementOrDurationChange = (field, value) => {
    setNewAd((prev) => {
      const updated = { ...prev, [field]: value };
      const placementConfig = PLACEMENT_PRICING[updated.placement] || PLACEMENT_PRICING.hero_banner;
      const calculatedPrice = placementConfig[updated.duration_days] || 25;
      return { ...updated, price: calculatedPrice };
    });
  };

  const handleAdImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target.result;
      setNewAd(prev => ({
        ...prev,
        image: base64Data,
        image_preview: base64Data,
        image_file_name: file.name,
        image_file_size: `${(file.size / 1024).toFixed(1)} KB`,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdPayment = (e) => {
    e.preventDefault();
    const bizId = newAd.business_id || businesses[0]?.id;
    const biz = businesses.find((b) => b.id === Number(bizId)) || businesses[0];
    
    setAdPaymentPayload({
      type: 'purchase',
      data: {
        ...newAd,
        business_id: bizId,
        image: newAd.image || biz?.cover_image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80',
        title: newAd.title || `Special Offer from ${biz?.name || 'Partner'}`,
        link_url: newAd.link_url || `/businesses/${biz?.slug || ''}`,
      },
      amount: newAd.price,
      planName: `Ad Banner: ${PLACEMENT_PRICING[newAd.placement]?.name} (${newAd.duration_days} ថ្ងៃ)`,
      businessName: biz?.name || 'My Business',
    });
    setAddAdModal(false);
    setKhqrAdModal(true);
  };

  const handleOpenRenewPayment = (ad) => {
    const placementConfig = PLACEMENT_PRICING[ad.placement] || PLACEMENT_PRICING.hero_banner;
    const price = placementConfig[renewDuration] || 25;
    setSelectedAdForRenew(ad);
    setAdPaymentPayload({
      type: 'renew',
      adId: ad.id,
      data: {
        duration_days: renewDuration,
        price: price,
      },
      amount: price,
      planName: `Renew Ad: ${ad.title} (+${renewDuration} ថ្ងៃ)`,
      businessName: ad.business?.name || 'My Business',
    });
    setRenewAdModal(false);
    setKhqrAdModal(true);
  };

  const handleExecuteAdPayment = async () => {
    if (!adPaymentPayload) return;
    try {
      if (adPaymentPayload.type === 'purchase') {
        const res = await advertisementApi.purchase(adPaymentPayload.data);
        toast.success(res.data?.message || 'Ad campaign has been successfully displayed on the website!');
      } else if (adPaymentPayload.type === 'renew') {
        const res = await advertisementApi.renew(adPaymentPayload.adId, adPaymentPayload.data);
        toast.success(res.data?.message || 'Successfully renewed advertisement contract!');
      }
      setNewAd({
        business_id: businesses[0]?.id || '',
        title: '',
        image: '',
        image_preview: '',
        image_file_name: '',
        image_file_size: '',
        link_url: '',
        placement: 'hero_banner',
        duration_days: 15,
        price: 25,
      });
      await fetchAds();
      await fetchData();
    } catch (err) {
      console.error('Ad payment execution failed', err);
      toast.error(err.response?.data?.message || 'Failed to process Ad payment');
    } finally {
      setKhqrAdModal(false);
      setAdPaymentPayload(null);
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      await bookingApi.updateStatus(bookingId, {
        status,
        business_response_notes: status === 'confirmed' ? 'Your booking has been accepted! Looking forward to welcoming you.' : 'Sorry, we are fully booked for this slot.',
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBusiness = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      // Append standard string fields
      Object.keys(newBiz).forEach(key => {
        if (key !== 'gallery_images' && key !== 'gallery_files' && newBiz[key] !== null) {
          formData.append(key, newBiz[key]);
        }
      });
      
      // Append existing URLs that are kept
      if (newBiz.gallery_images) {
        newBiz.gallery_images.forEach((url, idx) => {
          if (url && url.trim() !== '') {
            formData.append(`gallery_images[${idx}]`, url);
          }
        });
      }

      // Append new files
      if (newBiz.gallery_files) {
        newBiz.gallery_files.forEach((file, idx) => {
          formData.append(`gallery_files[${idx}]`, file);
        });
      }

      if (isEditing) {
        await businessApi.updateWithForm(editingId, formData);
      } else {
        await businessApi.createWithForm(formData);
      }
      
      setAddBusinessModal(false);
      setNewBiz(initialBizState);
      setIsEditing(false);
      setEditingId(null);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteBusiness = async (id) => {
    if (window.confirm('Are you sure you want to delete this business? (All its services and bookings will be deleted too)')) {
      try {
        await businessApi.delete(id);
        fetchData();
      } catch (e) {
        console.error('Failed to delete business', e);
      }
    }
  };

  const handleEditBusiness = (biz) => {
    setIsEditing(true);
    setEditingId(biz.id);
    setNewBiz({
      ...biz,
      gallery_images: biz.gallery_images || [],
      gallery_files: []
    });
    setAddBusinessModal(true);
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!selectedBizForAction) return;
    try {
      await serviceApi.create({
        ...newService,
        business_id: selectedBizForAction.id,
      });
      setAddServiceModal(false);
      setNewService({ name: '', description: '', price: '', duration: '2 Hours' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!selectedBizForAction) return;
    try {
      await promotionApi.create({
        ...newPromo,
        business_id: selectedBizForAction.id,
      });
      setAddPromoModal(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const activeData = data || dashboardData;
  const loading = !activeData;

  if (loading) {
    return (
      <div className="pt-28 pb-20 max-w-7xl mx-auto px-4 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-semibold mt-3">Loading business performance analytics...</p>
      </div>
    );
  }

  const summary = activeData?.summary || {};
  const businesses = activeData?.businesses || [];
  const recentBookings = activeData?.recent_bookings || [];
  const chartData = activeData?.monthly_trends || [];

  return (
    <div className="pt-20 sm:pt-28 pb-36 sm:pb-24 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-200">
        <div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Business Partner Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-0.5 sm:mt-1">
            Business Partner Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
            Manage business information, services, customer bookings, and advertisements
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <Link
            to="/pricing"
            className="px-3.5 sm:px-4 py-2.5 rounded-xl sm:rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-extrabold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Upgrade Plan</span>
          </Link>

          <button
            onClick={() => setAddBusinessModal(true)}
            className="px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-transform hover:scale-102 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Add Business</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        
        <div className="bg-white rounded-xl sm:rounded-xl p-3.5 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block pt-0.5">Total Views</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{summary.total_views || 0}</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-xl p-3.5 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block pt-0.5">Bookings</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{summary.total_bookings || 0}</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-xl p-3.5 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block pt-0.5">Pending</span>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600">{summary.pending_bookings || 0}</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-xl p-3.5 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block pt-0.5">Revenue</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">${summary.total_revenue || 0}</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-xl p-3.5 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block pt-0.5">Avg Rating</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{summary.average_rating || 5.0}</p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-xl p-3.5 sm:p-5 border border-slate-100 shadow-xs space-y-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-red-500 text-red-500" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block pt-0.5">Saved</span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900">{summary.total_favorites || 0}</p>
        </div>

      </div>

      {/* Analytics Chart & Business Listings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
        
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-xl p-4.5 sm:p-8 border border-slate-100 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 font-heading">
                Monthly Profile Traffic & Inquiries
              </h3>
              <p className="text-xs text-slate-400">Visitor interactions over the last 6 months</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full self-start sm:self-center">
              +{summary.conversion_rate || 2.5}% Conversion
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2 sm:pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Area type="monotone" dataKey="views" name="Profile Views" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* My Businesses Quick List */}
        <div className="bg-white rounded-xl sm:rounded-xl p-4.5 sm:p-6 border border-slate-100 shadow-xs space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 font-heading">
              My Places ({businesses.length})
            </h3>
            <button
              onClick={() => setAddBusinessModal(true)}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              + Add New
            </button>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {businesses.map((b) => (
              <div
                key={b.id}
                className="p-3 sm:p-3.5 rounded-xl sm:rounded-xl bg-slate-50 border border-slate-100 space-y-2 hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[170px]">{b.name}</span>
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    b.verification_status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {b.verification_status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Plan: <strong className="uppercase text-slate-700">{b.subscription_plan}</strong></span>
                  <Link to={`/businesses/${b.slug}`} className="text-emerald-700 font-bold hover:underline">
                    View Page →
                  </Link>
                </div>
                <div className="pt-2 border-t border-slate-200/50 flex flex-wrap gap-1">
                  <button
                    onClick={() => { setSelectedBizForBoost(b); setKhqrBoostModal(true); }}
                    className="flex-1 min-w-[70px] py-1.5 px-2 bg-orange-600 hover:from-orange-600 text-white rounded-lg text-[10px] font-extrabold shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    title="Boost to #1 Top Search"
                  >
                    <Zap className="w-3 h-3 fill-current" />
                    <span>Boost ($5)</span>
                  </button>
                  <button
                    onClick={() => { setSelectedBizForAction(b); setAddServiceModal(true); }}
                    className="flex-1 min-w-[55px] py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    + Service
                  </button>
                  <button
                    onClick={() => { setSelectedBizForAction(b); setAddPromoModal(true); }}
                    className="flex-1 min-w-[55px] py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    + Coupon
                  </button>
                  <button
                    onClick={() => handleEditBusiness(b)}
                    className="px-2 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-[10px] font-bold text-blue-700 hover:bg-blue-100 cursor-pointer"
                    title="Edit Business"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteBusiness(b.id)}
                    className="px-2 py-1.5 bg-red-50 border border-red-200 rounded-lg text-[10px] font-bold text-red-700 hover:bg-red-100 cursor-pointer"
                    title="Delete Business"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Booking Requests Manager */}
      <div className="bg-white rounded-xl sm:rounded-xl p-4.5 sm:p-8 border border-slate-100 shadow-xs space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg sm:text-xl text-slate-900 font-heading">
              Customer Booking Requests ({recentBookings.length})
            </h3>
            <p className="text-xs text-slate-400">Accept or reject pending customer reservations</p>
          </div>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No booking requests received yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => (
              <div key={b.id} className="py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{b.booking_reference}</span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : (b.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    {b.contact_name} — {b.guests} Guests ({b.service?.name || 'General Inquiry'})
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    {b.booking_date} at {b.booking_time || 'Flexible'} {b.contact_phone}  {b.contact_email}
                  </p>
                  {b.notes && (
                    <p className="text-xs text-slate-600 italic">"{b.notes}"</p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {b.total_amount > 0 && (
                    <span className="font-extrabold text-sm sm:text-base text-slate-900">
                      ${Number(b.total_amount).toFixed(2)}
                    </span>
                  )}
                  {b.status === 'pending' && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleBookingStatus(b.id, 'confirmed')}
                        className="px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        onClick={() => handleBookingStatus(b.id, 'rejected')}
                        className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Self-Service Ads & Marketing Campaigns Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-xl sm:rounded-xl p-4.5 sm:p-8 border border-amber-500/30 text-white shadow-sm space-y-4 sm:space-y-6 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 pb-3.5 sm:pb-4 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-1.5 sm:mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Self-Service Ads Platform</span>
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight font-heading">
              Manage Banner Ad Campaigns ({adsData.summary?.active_ads || 0} Active)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">
              Purchase promotional banners, pay instantly via Bakong KHQR, and enjoy automated campaign lifecycle management.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAds}
              disabled={loadingAds}
              className="p-2.5 rounded-xl sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Refresh Ads Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAds ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                if (businesses.length > 0) {
                  const defaultBiz = businesses[0];
                  setNewAd(prev => ({
                    ...prev,
                    business_id: defaultBiz.id,
                    image: defaultBiz.cover_image || prev.image,
                    image_preview: defaultBiz.cover_image || prev.image_preview,
                  }));
                }
                setAddAdModal(true);
              }}
              className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-xl bg-amber-600 bg-[length:200%_auto] hover:bg-right text-slate-950 font-black text-xs shadow-lg shadow-sm hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Buy Ads</span>
            </button>
          </div>
        </div>

        {/* Ad Metrics Summary Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Active Ads
            </span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">
              {adsData.summary?.active_ads || 0} <span className="text-xs font-normal text-slate-400">/ {adsData.summary?.total_ads || 0}</span>
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" /> Ad Views
            </span>
            <p className="text-xl sm:text-2xl font-black text-sky-400 mt-1">
              {Number(adsData.summary?.total_impressions || 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Ad Clicks
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
              {Number(adsData.summary?.total_clicks || 0).toLocaleString()}
            </p>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-md">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" /> CTR
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
              {adsData.summary?.avg_ctr || 0}%
            </p>
          </div>
        </div>

        {/* Ads Cards List */}
        <div className="relative z-10 space-y-3">
          {(!adsData.data || adsData.data.length === 0) ? (
            <div className="py-12 px-4 rounded-xl bg-slate-800/30 border border-dashed border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Megaphone className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h4 className="text-sm font-bold text-white font-heading">No Active Campaigns</h4>
                <p className="text-xs text-slate-400">
                  Start running banner ads to reach thousands of tourists in Siem Reap.
                </p>
              </div>
              <button
                onClick={() => {
                  if (businesses.length > 0) {
                    setNewAd(prev => ({ ...prev, business_id: businesses[0].id }));
                  }
                  setAddAdModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Start Your First Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {adsData.data.map((ad) => (
                <div
                  key={ad.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between gap-3 ${
                    ad.status === 'active'
                      ? 'bg-slate-800/70 border-amber-500/30 hover:border-amber-400/60 shadow-md'
                      : 'bg-slate-900/50 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-slate-950">
                      <img
                        src={ad.image}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-300">
                          {PLACEMENT_PRICING[ad.placement]?.name?.split(' ')[0] || ad.placement}
                        </span>
                        {ad.status === 'active' ? (
                          ad.is_expiring_soon ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                              Expiring in {ad.days_remaining} days
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Active ({ad.days_remaining} days left)
                            </span>
                          )
                        ) : (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Expired
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                        {ad.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {ad.business?.name} • ${Number(ad.price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* 3-Column Metrics Bar */}
                  <div className="grid grid-cols-3 gap-1 py-1.5 px-2 rounded-xl bg-slate-950/50 border border-slate-800 text-center">
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">Views</span>
                      <span className="font-extrabold text-xs text-white">
                        {Number(ad.impressions || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="border-x border-slate-800">
                      <span className="text-[9px] text-slate-400 block font-semibold">Clicks</span>
                      <span className="font-extrabold text-xs text-emerald-400">
                        {Number(ad.clicks || 0).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-semibold">CTR</span>
                      <span className="font-extrabold text-xs text-amber-400">
                        {ad.ctr || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Renewal Button */}
                  <button
                    onClick={() => {
                      setSelectedAdForRenew(ad);
                      setRenewAdModal(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3 shrink-0" />
                    <span>Renew Ad</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Modal: Add Business */}
      {addBusinessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-md">
            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-4 sm:p-6 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                {isEditing ? 'Edit Business Details' : 'Register New Business'}
              </h3>
              <button onClick={() => {
                setAddBusinessModal(false);
                setIsEditing(false);
                setEditingId(null);
                setNewBiz(initialBizState);
              }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleAddBusiness} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category *</label>
                <select
                  required
                  value={newBiz.category_id}
                  onChange={(e) => setNewBiz({ ...newBiz, category_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Angkor Garden Café"
                  value={newBiz.name}
                  onChange={(e) => setNewBiz({ ...newBiz, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe your hospitality, cuisine, ambiance, services..."
                  value={newBiz.description}
                  onChange={(e) => setNewBiz({ ...newBiz, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Physical Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wat Bo Village, Siem Reap"
                  value={newBiz.address}
                  onChange={(e) => setNewBiz({ ...newBiz, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 170505"
                  value={newBiz.location_code}
                  onChange={(e) => setNewBiz({ ...newBiz, location_code: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Google Maps Link (Optional)
                  {resolvingLink && <span className="ml-2 text-cyan-600 normal-case animate-pulse text-[10px]">Resolving location...</span>}
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://maps.app.goo.gl/..."
                  value={newBiz.map_link}
                  onChange={(e) => setNewBiz({ ...newBiz, map_link: e.target.value })}
                  onBlur={handleMapLinkBlur}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Gallery Images</label>
                <div className="space-y-2">
                  {/* Existing Images (URLs) */}
                  {newBiz.gallery_images && newBiz.gallery_images.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Existing Images</p>
                      {newBiz.gallery_images.map((url, index) => (
                        <div key={`existing-${index}`} className="flex items-center justify-between gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                          <span className="text-xs text-slate-600 truncate flex-1 pl-2">
                            {url.split('/').pop() || url}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = newBiz.gallery_images.filter((_, i) => i !== index);
                              setNewBiz({ ...newBiz, gallery_images: newImages });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Files */}
                  {newBiz.gallery_files && newBiz.gallery_files.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">New Uploads</p>
                      {newBiz.gallery_files.map((file, index) => (
                        <div key={`new-${index}`} className="flex items-center justify-between gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="text-xs text-emerald-800 truncate flex-1 pl-2 font-medium">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newFiles = newBiz.gallery_files.filter((_, i) => i !== index);
                              setNewBiz({ ...newBiz, gallery_files: newFiles });
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3">
                    <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-emerald-300 rounded-xl hover:bg-emerald-50 hover:border-emerald-500 transition-colors">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">Browse Images to Upload</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) {
                            setNewBiz({
                              ...newBiz,
                              gallery_files: [...(newBiz.gallery_files || []), ...files]
                            });
                          }
                          // Reset input so the same files can be selected again if removed
                          e.target.value = null;
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Pinpoint Location on Map (Required for Map Display)</label>
                <p className="text-[10px] text-slate-500 mb-2">Click on the map to set your location (Latitude / Longitude) automatically. This location is required for your business to appear on the Map Page.</p>
                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 mb-3 z-0 relative">
                  <MapContainer 
                    center={[13.3615, 103.8596]} // Default Siem Reap
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker newBiz={newBiz} setNewBiz={setNewBiz} />
                  </MapContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newBiz.latitude}
                    onChange={(e) => setNewBiz({ ...newBiz, latitude: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newBiz.longitude}
                    onChange={(e) => setNewBiz({ ...newBiz, longitude: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  required
                  placeholder="Phone / WhatsApp *"
                  value={newBiz.phone}
                  onChange={(e) => setNewBiz({ ...newBiz, phone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newBiz.email}
                  onChange={(e) => setNewBiz({ ...newBiz, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setAddBusinessModal(false);
                    setIsEditing(false);
                    setEditingId(null);
                    setNewBiz(initialBizState);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-md transition-colors"
                >
                  {isEditing ? 'Save Changes' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Service */}
      {addServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-md animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-900">Add Service / Menu Item</h3>
            <form onSubmit={handleCreateService} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Khmer Tasting Dinner"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder="25.00"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="2 Hours"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Course details, inclusions, dietary info..."
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddServiceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 shadow-md"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Promotion */}
      {addPromoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 shadow-md animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-900">Create Promotion Offer</h3>
            <form onSubmit={handleCreatePromo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Promo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Weekend Angkor Special 20% OFF"
                  value={newPromo.title}
                  onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Discount Tag *</label>
                  <input
                    type="text"
                    required
                    placeholder="20% OFF"
                    value={newPromo.discount}
                    onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Promo Code</label>
                  <input
                    type="text"
                    placeholder="ANGKOR20"
                    value={newPromo.promo_code}
                    onChange={(e) => setNewPromo({ ...newPromo, promo_code: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Valid Until *</label>
                <input
                  type="date"
                  required
                  value={newPromo.end_date}
                  onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddPromoModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 shadow-md"
                >
                  Publish Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bakong KHQR Quick Boost Modal */}
      <KhqrPaymentModal
        isOpen={khqrBoostModal}
        onClose={() => { setKhqrBoostModal(false); setSelectedBizForBoost(null); }}
        planName={`Featured Boost Placement (7 Days)`}
        amount={5.00}
        businessName={selectedBizForBoost?.name || 'My Place'}
        onSuccess={async () => {
          if (selectedBizForBoost) {
            try {
              await subscriptionApi.upgrade({
                business_id: selectedBizForBoost.id,
                plan: 'pro',
                payment_method: 'Bakong KHQR (Boost)',
              });
              fetchData();
            } catch (err) {
              console.error(err);
            }
          }
          setKhqrBoostModal(false);
          setSelectedBizForBoost(null);
        }}
      />

      {/* Modal: New Self-Service Ad Campaign */}
      {addAdModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-md animate-in zoom-in-95">
            <div className="sticky top-0 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 p-5 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white font-heading">
                    Create New Ad Campaign
                  </h3>
                  <p className="text-[11px] text-slate-400">Instant placement activation with Bakong KHQR payment</p>
                </div>
              </div>
              <button
                onClick={() => setAddAdModal(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOpenAdPayment} className="p-5 space-y-4">
              {/* Business Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Select Business Place *
                </label>
                <select
                  required
                  value={newAd.business_id}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    handlePlacementOrDurationChange('business_id', selectedId);
                    const selectedBiz = businesses.find(b => b.id === Number(selectedId));
                    if (selectedBiz && imageUploadMode === 'cover' && selectedBiz.cover_image) {
                      setNewAd(prev => ({ ...prev, image: selectedBiz.cover_image, image_preview: selectedBiz.cover_image }));
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose Business Place --</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.address ? `• ${b.address}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Placement Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Ad Placement on Website *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(PLACEMENT_PRICING).map(([key, config]) => (
                    <div
                      key={key}
                      onClick={() => handlePlacementOrDurationChange('placement', key)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        newAd.placement === key
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="font-bold text-xs block">{config.name}</span>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{config.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration Options */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Campaign Duration *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 15, 30, 60].map((days) => {
                    const price = PLACEMENT_PRICING[newAd.placement]?.[days] || 20;
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() => handlePlacementOrDurationChange('duration_days', days)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          newAd.duration_days === days
                            ? 'bg-amber-600 text-slate-950 font-black border-amber-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="text-xs font-bold block">{days} Days</span>
                        <span className="text-[11px] font-extrabold mt-0.5 block">${price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Ad Headline / Catchphrase *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special 20% OFF and authentic dining experience in Siem Reap"
                  value={newAd.title}
                  onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Image Selection Section with Upload & URL tabs */}
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase">
                    Ad Banner Image *
                  </label>
                  <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('upload')}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        imageUploadMode === 'upload' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode('url')}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        imageUploadMode === 'url' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Link2 className="w-3 h-3" />
                      <span>Web URL</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUploadMode('cover');
                        const biz = businesses.find(b => b.id === Number(newAd.business_id)) || businesses[0];
                        if (biz?.cover_image) {
                          setNewAd(prev => ({ ...prev, image: biz.cover_image, image_preview: biz.cover_image }));
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        imageUploadMode === 'cover' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Building2 className="w-3 h-3" />
                      <span>Use Cover</span>
                    </button>
                  </div>
                </div>

                {imageUploadMode === 'upload' && (
                  <div>
                    {!newAd.image_preview ? (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-2 w-full py-6 px-4 border-2 border-dashed border-slate-700 rounded-xl hover:border-amber-400 hover:bg-slate-800/60 transition-all text-center group">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-amber-300 block">Click to upload image from device</span>
                          <span className="text-[10px] text-slate-400">PNG, JPG, WebP (Recommended 1200x600px, max 5MB)</span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAdImageUpload}
                        />
                      </label>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-slate-950 group">
                        <img
                          src={newAd.image_preview}
                          alt="Ad Preview"
                          className="w-full h-36 object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1 hover:bg-amber-400 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Change Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAdImageUpload}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setNewAd(prev => ({ ...prev, image: '', image_preview: '', image_file_name: '' }))}
                            className="px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold flex items-center gap-1 hover:bg-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                        {newAd.image_file_name && (
                          <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] text-slate-300 flex items-center justify-between">
                            <span className="truncate max-w-[200px]">{newAd.image_file_name}</span>
                            <span className="text-amber-400 font-semibold">{newAd.image_file_size}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {imageUploadMode === 'url' && (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={newAd.image}
                      onChange={(e) => setNewAd({ ...newAd, image: e.target.value, image_preview: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                    {newAd.image && (
                      <div className="h-28 rounded-xl overflow-hidden border border-slate-700">
                        <img src={newAd.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                )}

                {imageUploadMode === 'cover' && (
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                    {(() => {
                      const biz = businesses.find(b => b.id === Number(newAd.business_id)) || businesses[0];
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                            {biz?.cover_image ? (
                              <img src={biz.cover_image} alt={biz.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">No Cover</div>
                            )}
                          </div>
                          <div className="text-xs space-y-1">
                            <span className="font-bold text-white block">{biz?.name}</span>
                            <p className="text-[10px] text-slate-400">Use existing business cover photo as banner ad</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Total Price Summary Box */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-300 uppercase">Total Amount</span>
                  <p className="text-xs text-slate-300">Scan instantly with Bakong KHQR</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 font-heading">
                    ${Number(newAd.price).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">≈ {(newAd.price * 4100).toLocaleString()} KHR</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAddAdModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 text-slate-950 font-black text-xs hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Proceed to KHQR Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Renew Ad */}
      {renewAdModal && selectedAdForRenew && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-xl w-full max-w-md p-6 space-y-4 shadow-md animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-base text-white">Renew Ad Campaign</h3>
              </div>
              <button onClick={() => setRenewAdModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 space-y-1">
              <h4 className="text-xs font-bold text-white truncate">{selectedAdForRenew.title}</h4>
              <p className="text-[11px] text-slate-400">{selectedAdForRenew.business?.name} • {selectedAdForRenew.placement}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-2">Choose Extension Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 15, 30, 60].map((days) => {
                  const config = PLACEMENT_PRICING[selectedAdForRenew.placement] || PLACEMENT_PRICING.hero_banner;
                  const price = config[days] || 20;
                  return (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setRenewDuration(days)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        renewDuration === days
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <span className="text-xs font-bold block">+{days} Days</span>
                      <span className="text-[11px] font-extrabold mt-0.5 block">${price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRenewAdModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleOpenRenewPayment(selectedAdForRenew)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Proceed to KHQR Renewal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bakong KHQR Self-Service Ad Payment Modal */}
      {adPaymentPayload && (
        <KhqrPaymentModal
          isOpen={khqrAdModal}
          onClose={() => { setKhqrAdModal(false); setAdPaymentPayload(null); }}
          planName={adPaymentPayload.planName}
          amount={adPaymentPayload.amount}
          businessName={adPaymentPayload.businessName}
          onSuccess={handleExecuteAdPayment}
        />
      )}

    </div>
  );
}
