import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, MapPin, Heart, User, Calendar, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useFavoriteStore } from '../../store/useFavoriteStore';

export default function BottomNav() {
  const { isAuthenticated, user } = useAuthStore();
  const { destinationIds, businessIds } = useFavoriteStore();
  const totalFavorites = destinationIds.size + businessIds.size;

  const dashboardPath = isAuthenticated 
    ? (user?.role === 'admin' ? '/admin/dashboard' : (user?.role === 'business' ? '/business/dashboard' : '/dashboard'))
    : '/login';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around lg:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.08)] select-none">
      
      {/* 1. Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            isActive 
              ? 'text-orange-600 font-black scale-105' 
              : 'text-slate-500 hover:text-slate-800 font-bold'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Home</span>
          </>
        )}
      </NavLink>

      {/* 2. Explore / Destinations */}
      <NavLink
        to="/destinations"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            isActive 
              ? 'text-orange-600 font-black scale-105' 
              : 'text-slate-500 hover:text-slate-800 font-bold'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : ''}`}>
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Explore</span>
          </>
        )}
      </NavLink>

      {/* 3. Trips Planner */}
      <NavLink
        to="/my-trips"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            isActive 
              ? 'text-orange-600 font-black scale-105' 
              : 'text-slate-500 hover:text-slate-800 font-bold'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : ''}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Trips</span>
          </>
        )}
      </NavLink>

      {/* 4. Saved Favorites */}
      <NavLink
        to="/favorites"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 relative ${
            isActive 
              ? 'text-rose-600 font-black scale-105' 
              : 'text-slate-500 hover:text-slate-800 font-bold'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1 rounded-xl relative transition-colors ${isActive ? 'bg-rose-50' : ''}`}>
              <Heart className={`w-5 h-5 ${totalFavorites > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {totalFavorites > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-rose-600 text-white text-[9px] font-black min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-xs ring-2 ring-white animate-pulse">
                  {totalFavorites > 99 ? '99+' : totalFavorites}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Saved</span>
          </>
        )}
      </NavLink>

      {/* 5. Account / Dashboard */}
      <NavLink
        to={dashboardPath}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
            isActive 
              ? 'text-orange-600 font-black scale-105' 
              : 'text-slate-500 hover:text-slate-800 font-bold'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-orange-50' : ''}`}>
              {isAuthenticated ? (
                <LayoutDashboard className="w-5 h-5" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {isAuthenticated ? 'Portal' : 'Log In'}
            </span>
          </>
        )}
      </NavLink>

    </nav>
  );
}
