import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import PageSkeletonLoader from '../components/common/PageSkeletonLoader';

// Smart Lazy with auto-recovery on new version deployments
function lazyRetry(factory) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      const msg = error?.message || '';
      if (
        msg.includes('dynamically imported module') ||
        msg.includes('Loading chunk') ||
        error.name === 'ChunkLoadError'
      ) {
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    }
  });
}

// Public Pages (Lazy Loaded on Demand)
const Home = lazyRetry(() => import('../pages/Home'));
const Destinations = lazyRetry(() => import('../pages/Destinations'));
const DestinationDetail = lazyRetry(() => import('../pages/DestinationDetail'));
const Businesses = lazyRetry(() => import('../pages/Businesses'));
const BusinessDetail = lazyRetry(() => import('../pages/BusinessDetail'));
const MapExplorer = lazyRetry(() => import('../pages/MapExplorer'));
const Favorites = lazyRetry(() => import('../pages/Favorites'));
const TripPlanner = lazyRetry(() => import('../pages/TripPlanner'));
const Bookings = lazyRetry(() => import('../pages/Bookings'));
const Checkout = lazyRetry(() => import('../pages/Checkout'));
const Confirmation = lazyRetry(() => import('../pages/Confirmation'));
const TravelPackages = lazyRetry(() => import('../pages/TravelPackages'));
const Promotions = lazyRetry(() => import('../pages/Promotions'));
const Pricing = lazyRetry(() => import('../pages/Pricing'));
const Login = lazyRetry(() => import('../pages/Login'));
const Register = lazyRetry(() => import('../pages/Register'));
const Profile = lazyRetry(() => import('../pages/Profile'));
const CustomerDashboard = lazyRetry(() => import('../pages/CustomerDashboard'));

// Business Portal
const BusinessDashboard = lazyRetry(() => import('../pages/business/BusinessDashboard'));

// Admin Portal Pages
const AdminLogin = lazyRetry(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazyRetry(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazyRetry(() => import('../pages/admin/AdminUsers'));
const AdminBusinesses = lazyRetry(() => import('../pages/admin/AdminBusinesses'));
const AdminDestinations = lazyRetry(() => import('../pages/admin/AdminDestinations'));
const AdminCategories = lazyRetry(() => import('../pages/admin/AdminCategories'));
const AdminPackages = lazyRetry(() => import('../pages/admin/AdminPackages'));
const AdminReviews = lazyRetry(() => import('../pages/admin/AdminReviews'));
const AdminBookings = lazyRetry(() => import('../pages/admin/AdminBookings'));
const AdminPromotions = lazyRetry(() => import('../pages/admin/AdminPromotions'));
const AdminAdvertisements = lazyRetry(() => import('../pages/admin/AdminAdvertisements'));
const AdminSubscriptions = lazyRetry(() => import('../pages/admin/AdminSubscriptions'));
const AdminRevenue = lazyRetry(() => import('../pages/admin/AdminRevenue'));
const AdminPayments = lazyRetry(() => import('../pages/admin/AdminPayments'));
const AdminAnalytics = lazyRetry(() => import('../pages/admin/AdminAnalytics'));
const AdminReports = lazyRetry(() => import('../pages/admin/AdminReports'));
const AdminNotifications = lazyRetry(() => import('../pages/admin/AdminNotifications'));
const AdminMedia = lazyRetry(() => import('../pages/admin/AdminMedia'));
const AdminSettings = lazyRetry(() => import('../pages/admin/AdminSettings'));
const AdminAdmins = lazyRetry(() => import('../pages/admin/AdminAdmins'));
const AdminActivityLogs = lazyRetry(() => import('../pages/admin/AdminActivityLogs'));

import { useAuthStore } from '../store/useAuthStore';

// Protected Route Wrapper for Business Owner & Admin
function ProtectedBusinessRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'business' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Protected Route Wrapper for Admin Only
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Smart Role-Based Dashboard Dispatcher
function DashboardRouter() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'business') return <Navigate to="/business/dashboard" replace />;
  return <CustomerDashboard />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageSkeletonLoader />}>
      <Routes>
        {/* Public Pages Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/destinations/:slug" element={<DestinationDetail />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/businesses/:slug" element={<BusinessDetail />} />
          <Route path="/packages" element={<TravelPackages />} />
          <Route path="/checkout/:serviceId" element={<Checkout />} />
          <Route path="/booking/confirmation/:id" element={<Confirmation />} />
          <Route path="/map" element={<MapExplorer />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/my-trips" element={<TripPlanner />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Navigate to="/profile" replace />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />

          {/* Business Owner Portal */}
          <Route
            path="/business/dashboard"
            element={
              <ProtectedBusinessRoute>
                <BusinessDashboard />
              </ProtectedBusinessRoute>
            }
          />
        </Route>

        {/* Admin Authentication Screen - Redirects to unified Login */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* Admin SaaS Control Center */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="businesses" element={<AdminBusinesses />} />
          <Route path="businesses/pending" element={<AdminBusinesses />} />
          <Route path="destinations" element={<AdminDestinations />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="advertisements" element={<AdminAdvertisements />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="revenue" element={<AdminRevenue />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="activity-logs" element={<AdminActivityLogs />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
