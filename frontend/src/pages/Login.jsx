import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck, Building2, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { systemApi } from '../api/endpoints';
import { getFullImageUrl } from '../utils/imageUrl';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const { data: settings = {} } = useQuery({
    queryKey: ['settings'],
    queryFn: () => systemApi.getSettings().then(r => r.data),
    staleTime: 1000 * 60 * 10,
    placeholderData: prev => prev,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      if (res.user?.role === 'admin') navigate('/admin/dashboard');
      else if (res.user?.role === 'business') navigate('/business/dashboard');
      else navigate(from, { replace: true });
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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
            {settings.site_name ? `Welcome to ${settings.site_name}` : 'Welcome to Tes Chor'}
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your saved places, bookings & itineraries
          </p>
        </div>

        {/* Demo Fast Login Buttons for Evaluation */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            🚀 Quick Demo Login Accounts
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@teschor.com', 'password')}
              className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3" /> Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('owner@angkorresort.com', 'password')}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <Building2 className="w-3 h-3" /> Business
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('emma.travels@gmail.com', 'password')}
              className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl border border-orange-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <User className="w-3 h-3" /> Tourist
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:border-orange-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Google OAuth Section */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">Or continue with</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <GoogleAuthButton text="Sign In with Google" />

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
}
