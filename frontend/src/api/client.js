
import axios from 'axios';

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

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teschor_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiry
api.interceptors.response.use(
  (response) => response,
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
