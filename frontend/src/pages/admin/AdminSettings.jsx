import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/endpoints';
import { useToastStore } from '../../store/useToastStore';
import { getFullImageUrl } from '../../utils/imageUrl';
import {
  Sliders,
  Save,
  Globe,
  Share2,
  Mail,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react';

export default function AdminSettings() {
  const [settingsGrouped, setSettingsGrouped] = useState({});
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const toast = useToastStore();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await adminApi.getSettings();
      setSettingsGrouped(res.data || {});

      // Flatten settings into simple key-value state
      const flat = {};
      Object.values(res.data || {}).forEach((group) => {
        group.forEach((item) => {
          flat[item.key] = item.value;
        });
      });
      setFormData(flat);
    } catch (err) {
      toast.error('Failed to load system settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = (key, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange(key, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await adminApi.updateSettings({ settings: formData });
      toast.success('System settings saved successfully.');
    } catch (err) {
      toast.error('Failed to update system settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-slate-900 rounded-xl w-64" />
        <div className="h-96 bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">System Settings & Configurations</h2>
          <p className="text-xs text-slate-400">
            Global platform parameters, social profiles, email SMTP, and maintenance mode controls.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Configurations'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'general', label: 'General & Localization', icon: Globe },
          { id: 'social', label: 'Social Community Links', icon: Share2 },
          { id: 'email', label: 'Email SMTP Dispatcher', icon: Mail },
          { id: 'maintenance', label: 'Maintenance Mode', icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        {/* 1. General */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-3">General Platform Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 border-b border-slate-800">
              {/* Site Logo */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Website Logo</label>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.site_logo ? (
                      <img 
                        src={getFullImageUrl(formData.site_logo)} 
                        alt="Logo" 
                        className="w-full h-full object-contain" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=100';
                        }}
                      />
                    ) : (
                      <Globe className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('site_logo', e)}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={formData.site_logo || ''}
                      onChange={(e) => handleChange('site_logo', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Site Banner */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Website Banner</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.site_banner ? (
                      <img 
                        src={getFullImageUrl(formData.site_banner)} 
                        alt="Banner" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600';
                        }}
                      />
                    ) : (
                      <Globe className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('site_banner', e)}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-500 hover:file:bg-emerald-500/20 transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Or paste image URL"
                      value={formData.site_banner || ''}
                      onChange={(e) => handleChange('site_banner', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Platform Brand Name</label>
                <input
                  type="text"
                  value={formData.site_name || 'Tes Chor'}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">English Headline</label>
                <input
                  type="text"
                  value={formData.site_tagline || 'Discover More. Travel Better.'}
                  onChange={(e) => handleChange('site_tagline', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Support Email</label>
                <input
                  type="email"
                  value={formData.contact_email || 'contact@teschor.com'}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Support Phone</label>
                <input
                  type="text"
                  value={formData.contact_phone || '+855 63 969 888'}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Default Display Currency</label>
                <select
                  value={formData.default_currency || 'USD'}
                  onChange={(e) => handleChange('default_currency', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Exchange Rate (1 USD to KHR)</label>
                <input
                  type="number"
                  value={formData.khr_exchange_rate || '4100'}
                  onChange={(e) => handleChange('khr_exchange_rate', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. Social Links */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-3">Official Social Media & Community Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Facebook Page</label>
                <input
                  type="url"
                  value={formData.facebook_url || ''}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Instagram URL</label>
                <input
                  type="url"
                  value={formData.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Telegram Community</label>
                <input
                  type="url"
                  value={formData.telegram_channel || ''}
                  onChange={(e) => handleChange('telegram_channel', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">TikTok Account</label>
                <input
                  type="url"
                  value={formData.tiktok_url || ''}
                  onChange={(e) => handleChange('tiktok_url', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. SMTP */}
        {activeTab === 'email' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-3">SMTP Mail Server Configuration</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={formData.smtp_host || 'smtp.mailtrap.io'}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">SMTP Port</label>
                <input
                  type="text"
                  value={formData.smtp_port || '2525'}
                  onChange={(e) => handleChange('smtp_port', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">From Address</label>
              <input
                type="email"
                value={formData.smtp_from_address || 'noreply@teschor.com'}
                onChange={(e) => handleChange('smtp_from_address', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>
        )}

        {/* 4. Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white mb-3">Platform Maintenance Safeguard</h3>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Enabling maintenance mode will temporarily lock out public tourists and display an upgrade notice. Admin panel remains accessible.
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                <input
                  type="checkbox"
                  checked={formData.maintenance_mode === '1'}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked ? '1' : '0')}
                  className="w-5 h-5 rounded border-slate-700 text-emerald-600 bg-slate-800"
                />
                <span>Enable Public Maintenance Mode</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Maintenance Banner Message</label>
              <textarea
                rows={3}
                value={formData.maintenance_message || 'Tes Chor is currently undergoing scheduled platform upgrades.'}
                onChange={(e) => handleChange('maintenance_message', e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
