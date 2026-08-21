import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, MapPin, Heart, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';

export default function BottomNav() {
  const { isAuthenticated, user } = useAuthStore();
  const { destinationIds, businessIds } = useFavoriteStore();
  const totalFavorites = destinationIds.size + businessIds.size;

  const profilePath = isAuthenticated 
    ? (user?.role === 'admin' ? '/admin/dashboard' : (user?.role === 'business' ? '/business/dashboard' : '/profile'))
    : '/login';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-6 py-2 flex items-center justify-around lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/destinations"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <Compass className="w-5 h-5" />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <MapPin className="w-5 h-5" />
        <span>Map</span>
      </NavLink>

      <NavLink
        to="/favorites"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium relative transition-colors ${
            isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <div className="relative">
          <Heart className="w-5 h-5" />
          {totalFavorites > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalFavorites}
            </span>
          )}
        </div>
        <span>Saved</span>
      </NavLink>

      <NavLink
        to={profilePath}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-orange-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`
        }
      >
        <User className="w-5 h-5" />
        <span>{isAuthenticated ? 'Account' : 'Log In'}</span>
      </NavLink>
    </nav>
  );
}
