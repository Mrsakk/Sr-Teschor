import React, { useState } from 'react';
import { User, Phone, Lock, CheckCircle2, AlertCircle, Shield, Camera, Sparkles } from 'lucide-react';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../store/useAuthStore';
import UserAvatar from '../components/common/UserAvatar';

export default function Profile() {
  const { user, updateUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    try {
      const res = await authApi.updateProfile({ name, phone, avatar });
      updateUser(res.data.user);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  ];

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordError(null);
    try {
      await authApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirm,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="pt-20 sm:pt-28 pb-28 sm:pb-24 max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 space-y-5 sm:space-y-8">
      
      {/* Header */}
      <div className="pb-4 sm:pb-6 border-b border-slate-200">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-orange-600">
          ការកំណត់គណនី (Account Settings)
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
          ព័ត៌មានផ្ទាល់ខ្លួន និងសុវត្ថិភាព
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          គ្រប់គ្រងឈ្មោះ លេខទូរស័ព្ទ រូបតំណាង និងពាក្យសម្ងាត់គណនីរបស់អ្នក
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl sm:rounded-xl p-4.5 sm:p-8 border border-slate-100 shadow-xs space-y-4 sm:space-y-6">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2 font-heading">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <span>ព័ត៌មានផ្ទាល់ខ្លួន (Personal Info)</span>
          </h3>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> បានកែប្រែព័ត៌មានដោយជោគជ័យ!
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {profileError}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1">ឈ្មោះពេញ (Full Name)</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1">អ៊ីមែល (Email Account)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1">លេខទូរស័ព្ទ / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="012 345 678"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Avatar Selector & Preview */}
            <div className="space-y-2.5 sm:space-y-3 pt-1">
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase">រូបតំណាង (Profile Photo)</label>
              
              <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-3.5 rounded-xl sm:rounded-xl border border-slate-200">
                <UserAvatar user={{ ...user, avatar, name }} size="lg" />
                <div className="space-y-1 flex-1 min-w-0">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-400 text-slate-700 text-xs font-bold rounded-xl cursor-pointer shadow-2xs transition-colors">
                    <Camera className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 truncate">PNG, JPG, WebP (Max 5MB)</p>
                </div>
              </div>

              {/* Sample Presets */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">ឬជ្រើសរើសរូបគំរូ (Preset):</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {sampleAvatars.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105 cursor-pointer ${
                        avatar === url ? 'border-orange-500 ring-2 ring-orange-200' : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  {avatar && (
                    <button
                      type="button"
                      onClick={() => setAvatar('')}
                      className="px-2 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {savingProfile ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកព័ត៌មាន (Save Changes)'}
              </button>
            </div>
          </form>
        </div>

        {/* Password Security Card */}
        <div className="bg-white rounded-xl sm:rounded-xl p-4.5 sm:p-8 border border-slate-100 shadow-xs space-y-4 sm:space-y-6">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2 font-heading">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            <span>ប្តូរពាក្យសម្ងាត់ (Change Password)</span>
          </h3>

          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> បានប្តូរពាក្យសម្ងាត់ដោយជោគជ័យ!
            </div>
          )}

          {passwordError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" /> {passwordError}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-3.5 sm:space-y-4">
            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1">ពាក្យសម្ងាត់បច្ចុប្បន្ន (Current)</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1">ពាក្យសម្ងាត់ថ្មី (New Password)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="យ៉ាងតិច ៨ តួអក្សរ"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase mb-1">ផ្ទៀងផ្ទាត់ពាក្យសម្ងាត់ថ្មី (Confirm)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {savingPassword ? 'កំពុងផ្លាស់ប្តូរ...' : 'ប្តូរពាក្យសម្ងាត់ (Update Password)'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
