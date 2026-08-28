import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, User, Phone, Building2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
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
      <div className="bg-white rounded-xl p-8 sm:p-10 border border-slate-100 shadow-md w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sm font-black text-xl mb-3">
            <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
              <path d="M12 2L9 7H15L12 2ZM7 9L4 14H20L17 9H7ZM2 16L3.5 22H20.5L22 16H2ZM11 18H13V21H11V18Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-heading">
            Join Tes Chor
          </h2>
          <p className="text-xs text-slate-500">
            Create an account as a Traveler or a Local Business Owner
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'customer'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" /> Tourist / Traveler
          </button>
          <button
            type="button"
            onClick={() => setRole('business')}
            className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              role === 'business'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" /> Business Owner
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold border border-red-200">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-xl text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer ${
              role === 'business'
                ? 'bg-emerald-600 hover:from-emerald-700 shadow-sm'
                : 'bg-orange-600 hover:from-orange-600 shadow-sm'
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
