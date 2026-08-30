import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock, Mail, User, Phone, Building2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { systemApi } from '../api/endpoints';
import { getFullImageUrl } from '../utils/imageUrl';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'business' ? 'business' : 'customer';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState(initialRole);

  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: () => systemApi.getSettings().then(r => r.data),
    staleTime: 1000 * 60 * 10,
    placeholderData: prev => prev,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register({
      name,
      email,
      phone,
      password,
      password_confirmation: passwordConfirmation,
      role,
    });

    if (res.success) {
      if (role === 'business') {
        navigate('/business/dashboard');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4">
      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-xs w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="flex justify-center mb-3">
            <img
              src={settings.site_logo ? getFullImageUrl(settings.site_logo) : '/logo.png'}
              alt={settings.site_name || "SR TesChor Logo"}
              className="h-16 sm:h-20 w-auto max-w-[220px] object-contain drop-shadow-md rounded-2xl transition-transform hover:scale-105"
              onError={(e) => {
                if (!e.target.src.endsWith('/logo.png')) {
                  e.target.src = '/logo.png';
                }
              }}
            />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            {settings.site_name ? `Join ${settings.site_name}` : 'Join Tes Chor'}
          </h2>
          <p className="text-xs text-slate-500">
            Create an account as a Traveler or a Local Business Owner
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold border border-slate-200/80">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'customer'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Tourist / Traveler
          </button>
          <button
            type="button"
            onClick={() => setRole('business')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              role === 'business'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Business Owner
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Smith"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-orange-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-orange-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone / WhatsApp Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+855 12 345 678"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-orange-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-orange-600 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-orange-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer ${
              role === 'business'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {isLoading ? 'Creating Account...' : (role === 'business' ? 'Register Business Owner' : 'Create Traveler Account')}
          </button>
        </form>

        {/* Google OAuth Section */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">Or sign up with</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <GoogleAuthButton role={role} text={`Sign Up with Google (${role === 'business' ? 'Business' : 'Traveler'})`} />

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-orange-600 hover:underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
