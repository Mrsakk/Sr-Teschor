
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { invalidateAllCaches } from './queryClient';

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

const api = axiosInstance;

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teschor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry and instant cache invalidation
api.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toUpperCase();
    // Whenever a mutation succeeds, automatically invalidate and update caches across all webpages
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      try {
        invalidateAllCaches(response.config?.url, method);
      } catch (err) {
        console.warn('Cache invalidation notice:', err);
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
