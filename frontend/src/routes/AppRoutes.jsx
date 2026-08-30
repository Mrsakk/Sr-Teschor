import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import PageSkeletonLoader from '../components/common/PageSkeletonLoader';

// Public Pages (Lazy Loaded on Demand)
const Home = lazy(() => import('../pages/Home'));
const Destinations = lazy(() => import('../pages/Destinations'));
const DestinationDetail = lazy(() => import('../pages/DestinationDetail'));
const Businesses = lazy(() => import('../pages/Businesses'));
const BusinessDetail = lazy(() => import('../pages/BusinessDetail'));
const MapExplorer = lazy(() => import('../pages/MapExplorer'));
const Favorites = lazy(() => import('../pages/Favorites'));
const TripPlanner = lazy(() => import('../pages/TripPlanner'));
const Bookings = lazy(() => import('../pages/Bookings'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Confirmation = lazy(() => import('../pages/Confirmation'));
const TravelPackages = lazy(() => import('../pages/TravelPackages'));
const Promotions = lazy(() => import('../pages/Promotions'));
const Pricing = lazy(() => import('../pages/Pricing'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Profile = lazy(() => import('../pages/Profile'));
const CustomerDashboard = lazy(() => import('../pages/CustomerDashboard'));

// Business Portal
const BusinessDashboard = lazy(() => import('../pages/business/BusinessDashboard'));

// Admin Portal Pages
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminBusinesses = lazy(() => import('../pages/admin/AdminBusinesses'));
const AdminDestinations = lazy(() => import('../pages/admin/AdminDestinations'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminPackages = lazy(() => import('../pages/admin/AdminPackages'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));
const AdminBookings = lazy(() => import('../pages/admin/AdminBookings'));
const AdminPromotions = lazy(() => import('../pages/admin/AdminPromotions'));
const AdminAdvertisements = lazy(() => import('../pages/admin/AdminAdvertisements'));
const AdminSubscriptions = lazy(() => import('../pages/admin/AdminSubscriptions'));
const AdminRevenue = lazy(() => import('../pages/admin/AdminRevenue'));
const AdminPayments = lazy(() => import('../pages/admin/AdminPayments'));
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminNotifications = lazy(() => import('../pages/admin/AdminNotifications'));
const AdminMedia = lazy(() => import('../pages/admin/AdminMedia'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminAdmins = lazy(() => import('../pages/admin/AdminAdmins'));
const AdminActivityLogs = lazy(() => import('../pages/admin/AdminActivityLogs'));

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
