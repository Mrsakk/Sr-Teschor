import api from './client';

// Auth
export const authApi = {
  login: (credentials) => api.post('/login', credentials),
  register: (data) => api.post('/register', data),
  googleLogin: (data) => api.post('/auth/google', data),
  logout: () => api.post('/logout'),
  getCurrentUser: () => api.get('/user'),
  updateProfile: (data) => api.put('/user/profile', data),
  updatePassword: (data) => api.put('/user/password', data),
};

// Categories
export const categoryApi = {
  getAll: (params) => api.get('/categories', { params }),
  getBySlug: (slug) => api.get(`/categories/${slug}`),
};

// Destinations
export const destinationApi = {
  getAll: (params) => api.get('/destinations', { params }),
  getBySlug: (slug) => api.get(`/destinations/${slug}`),
  create: (data) => api.post('/admin/destinations', data),
  update: (id, data) => api.put(`/admin/destinations/${id}`, data),
  delete: (id) => api.delete(`/admin/destinations/${id}`),
};

// Businesses
export const businessApi = {
  getAll: (params) => api.get('/businesses', { params }),
  getBySlug: (slug) => api.get(`/businesses/${slug}`),
  create: (data) => api.post('/businesses', data),
  createWithForm: (formData) => api.post('/businesses', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  updateWithForm: (id, formData) => {
    formData.append('_method', 'PUT'); // Laravel requires this for multipart/form-data PUT requests
    return api.post(`/businesses/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  delete: (id) => api.delete(`/businesses/${id}`),
  getMyBusinesses: () => api.get('/my-businesses'),
  getDashboardStats: () => api.get('/business/dashboard'),
  resolveMapLink: (url) => api.get(`/businesses/resolve-map-link?url=${encodeURIComponent(url)}`),
  reverseGeocode: (lat, lng) => api.get(`/businesses/reverse-geocode?lat=${lat}&lng=${lng}`),
};

// Services
export const serviceApi = {
  getById: (id) => api.get(`/services/${id}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// Reviews
export const reviewApi = {
  getAll: (params) => api.get('/reviews', { params }),
  submitReview: (data) => api.post('/reviews', data),
  replyReview: (id, data) => api.post(`/reviews/${id}/reply`, data),
};

// Favorites
export const favoriteApi = {
  getAll: () => api.get('/favorites'),
  toggle: (type, id) => api.post('/favorites/toggle', { type, id }),
};

// Travel Packages
export const packageApi = {
  getAll: () => api.get('/packages'),
  getById: (id) => api.get(`/packages/${id}`),
};

// Bookings & Revenue Checkout
export const bookingApi = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  calculateQuote: (data) => api.post('/bookings/calculate', data),
  checkout: (data) => api.post('/bookings/checkout', data),
  getReceipt: (id) => api.get(`/bookings/${id}/receipt`),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  getMyTransactions: () => api.get('/my-transactions'),
};

// Bakong KHQR Payments & Digital Invoices
export const paymentApi = {
  generateKhqr: (data) => api.post('/payments/khqr/generate', data),
  verifyKhqr: (data) => api.post('/payments/khqr/verify', data),
  getInvoice: (reference) => api.get(`/invoices/${reference}`),
};

// System Settings (Public)
export const systemApi = {
  getSettings: () => api.get('/settings'),
};

// Promotions
export const promotionApi = {
  getAll: () => api.get('/promotions'),
  create: (data) => api.post('/promotions', data),
  update: (id, data) => api.put(`/promotions/${id}`, data),
  delete: (id) => api.delete(`/promotions/${id}`),
};

// Advertisements / Promoted Partner Highlights (Renamed to avoid AdBlockers)
export const advertisementApi = {
  getAll: (params) => api.get('/featured-placements', { params }),
  trackClick: (id) => api.post(`/featured-placements/${id}/click`),
  getMyAdvertisements: () => api.get('/my-advertisements'),
  purchase: (data) => api.post('/my-advertisements/purchase', data),
  renew: (id, data) => api.post(`/my-advertisements/${id}/renew`, data),
  checkExpiry: () => api.post('/my-advertisements/check-expiry'),
};

// Trips
export const tripApi = {
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  create: (data) => api.post('/trips', data),
  delete: (id) => api.delete(`/trips/${id}`),
  addItem: (id, data) => api.post(`/trips/${id}/items`, data),
  removeItem: (id, itemId) => api.delete(`/trips/${id}/items/${itemId}`),
};

// Subscriptions
export const subscriptionApi = {
  getPlans: () => api.get('/subscriptions/plans'),
  upgrade: (data) => api.post('/subscriptions/upgrade', data),
};

// Search & Map
export const searchApi = {
  getSuggestions: (q) => api.get('/search', { params: { q } }),
  getMapLocations: () => api.get('/map/locations'),
};

// Notifications
export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// Admin Complete API Service
export const adminApi = {
  // 1. Dashboard
  getDashboard: (params) => api.get('/admin/dashboard', { params }),

  // 2. Users
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // 3. Businesses & Verification
  getBusinesses: (params) => api.get('/admin/businesses', { params }),
  getPendingBusinesses: () => api.get('/admin/businesses/pending'),
  approveBusiness: (id, data) => api.put(`/admin/businesses/${id}/approve`, data),
  rejectBusiness: (id, data) => api.put(`/admin/businesses/${id}/reject`, data),
  suspendBusiness: (id) => api.put(`/admin/businesses/${id}/suspend`),
  deleteBusiness: (id) => api.delete(`/admin/businesses/${id}`),

  // 4. Destinations
  getDestinations: (params) => api.get('/admin/destinations', { params }),
  createDestination: (data) => api.post('/admin/destinations', data),
  updateDestination: (id, data) => api.put(`/admin/destinations/${id}`, data),
  deleteDestination: (id) => api.delete(`/admin/destinations/${id}`),

  // 5. Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // 6. Reviews Moderation
  getReviews: (params) => api.get('/admin/reviews', { params }),
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`),
  hideReview: (id) => api.put(`/admin/reviews/${id}/hide`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  // 7. Bookings
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getBookingDetails: (id) => api.get(`/admin/bookings/${id}`),
  updateBookingStatus: (id, data) => api.put(`/admin/bookings/${id}/status`, data),

  // 8. Promotions
  getPromotions: (params) => api.get('/admin/promotions', { params }),
  togglePromotion: (id) => api.put(`/admin/promotions/${id}/toggle`),
  deletePromotion: (id) => api.delete(`/admin/promotions/${id}`),

  // 9. Advertisements
  getAdvertisements: (params) => api.get('/admin/advertisements', { params }),
  createAdvertisement: (data) => api.post('/admin/advertisements', data),
  deleteAdvertisement: (id) => api.delete(`/admin/advertisements/${id}`),

  // 9.1 Travel Packages
  getPackages: (params) => api.get('/admin/packages', { params }),
  createPackage: (data) => api.post('/admin/packages', data),
  updatePackage: (id, data) => api.put(`/admin/packages/${id}`, data),
  deletePackage: (id) => api.delete(`/admin/packages/${id}`),
  togglePackageStatus: (id) => api.patch(`/admin/packages/${id}/toggle-status`),

  // 10. Subscriptions
  getSubscriptions: (params) => api.get('/admin/subscriptions', { params }),

  // 11. Revenue & Payments
  getRevenue: () => api.get('/admin/revenue'),
  getPayments: (params) => api.get('/admin/payments', { params }),

  // 12. Analytics
  getAnalytics: (params) => api.get('/admin/analytics', { params }),

  // 13. Reports
  getReports: (params) => api.get('/admin/reports', { params }),
  updateReportStatus: (id, data) => api.put(`/admin/reports/${id}/status`, data),

  // 14. Notifications Broadcast
  getNotifications: () => api.get('/admin/notifications'),
  broadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),

  // 15. Media Asset Library
  getMedia: (params) => api.get('/admin/media', { params }),
  createMedia: (data) => api.post('/admin/media', data),
  deleteMedia: (id) => api.delete(`/admin/media/${id}`),

  // 16. System Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),

  // 17. Admins & Roles
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/admins', data),

  // 18. Audit Activity Logs
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
};

// AI Concierge & Planning Engine
export const aiApi = {
  chat: (data) => api.post('/ai/chat', data),
  generateItinerary: (data) => api.post('/ai/generate-itinerary', data),
  getRecommendations: (params) => api.get('/ai/recommendations', { params }),
};

