import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Sparkles, ShieldCheck, Building2, User } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import GoogleAuthButton from '../components/auth/GoogleAuthButton';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

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
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-2xl w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20 font-black text-xl mb-3">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L9 7H15L12 2ZM7 9L4 14H20L17 9H7ZM2 16L3.5 22H20.5L22 16H2ZM11 18H13V21H11V18Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Welcome to Tes Chor
          </h2>
          <p className="text-xs text-slate-500">
            Sign in to access your saved places, bookings & itineraries
          </p>
        </div>

        {/* Demo Fast Login Buttons for Evaluation */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center">
            🚀 Quick Demo Login Accounts
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@teschor.com', 'password')}
              className="py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl border border-purple-200 transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3" /> Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('owner@angkorresort.com', 'password')}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition-colors flex items-center justify-center gap-1"
            >
              <Building2 className="w-3 h-3" /> Business
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('emma.travels@gmail.com', 'password')}
              className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl border border-orange-200 transition-colors flex items-center justify-center gap-1"
            >
              <User className="w-3 h-3" /> Tourist
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-extrabold text-sm shadow-md shadow-orange-500/25 transition-all disabled:opacity-50 cursor-pointer"
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
