
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL.trim();
    if (!url.endsWith('/api') && !url.includes('/api/')) {
      url = `${url.replace(/\/+$/, '')}/api`;
    }
    return url;
  }
  
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8000/api';
  }
  
  return '/api';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

const api = setupCache(axiosInstance, {
  ttl: 1000 * 60 * 2, // Cache public GET requests for 2 minutes
  interpretHeader: false,
  cachePredicate: {
    statusCheck: (status) => status >= 200 && status < 300,
    responseMatch: (res) => {
      const url = res.config?.url || '';
      // NEVER cache admin, dashboard, user private, or transaction endpoints
      if (
        url.includes('/admin') ||
        url.includes('/user') ||
        url.includes('/my-') ||
        url.includes('/bookings') ||
        url.includes('/notifications') ||
        url.includes('/favorites') ||
        url.includes('/business') ||
        url.includes('/auth') ||
        url.includes('/payments')
      ) {
        return false;
      }
      return true;
    },
  },
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teschor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Automatically bypass cache for any admin or authenticated mutation requests
  const url = config.url || '';
  if (
    url.includes('/admin') ||
    url.includes('/user') ||
    url.includes('/my-') ||
    url.includes('/bookings') ||
    url.includes('/business')
  ) {
    config.cache = false;
  }

  return config;
});

// Response interceptor for cache invalidation & session expiry
api.interceptors.response.use(
  (response) => {
    // When any mutation (POST, PUT, DELETE, PATCH) happens, purge cache storage
    const method = response.config?.method?.toLowerCase();
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      if (api.storage && typeof api.storage.clear === 'function') {
        try {
          api.storage.clear();
        } catch (e) {}
      }
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and has token, clear token
      if (localStorage.getItem('teschor_token')) {
        localStorage.removeItem('teschor_token');
        localStorage.removeItem('teschor_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
