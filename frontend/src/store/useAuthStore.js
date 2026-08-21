import { create } from 'zustand';
import { authApi } from '../api/endpoints';

let storedUser = null;
let storedToken = null;

try {
  const rawUser = localStorage.getItem('teschor_user');
  if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
    storedUser = JSON.parse(rawUser);
  }
} catch (e) {
  localStorage.removeItem('teschor_user');
}

try {
  const rawToken = localStorage.getItem('teschor_token');
  if (rawToken && rawToken !== 'undefined' && rawToken !== 'null') {
    storedToken = rawToken;
  }
} catch (e) {
  localStorage.removeItem('teschor_token');
}

export const useAuthStore = create((set, get) => ({
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const { user, token } = response.data;
      localStorage.setItem('teschor_token', token);
      localStorage.setItem('teschor_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.email?.[0] || 'Login failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  loginWithGoogle: async (googlePayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.googleLogin(googlePayload);
      const { user, token } = response.data;
      localStorage.setItem('teschor_token', token);
      localStorage.setItem('teschor_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Google login failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      const { user, token } = response.data;
      localStorage.setItem('teschor_token', token);
      localStorage.setItem('teschor_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return { success: false, error: message, errors: err.response?.data?.errors };
    }
  },

  logout: async () => {
    try {
      if (get().token) {
        await authApi.logout();
      }
    } catch (e) {
      // Token may already be expired/invalid on server, ignore
    } finally {
      localStorage.removeItem('teschor_token');
      localStorage.removeItem('teschor_user');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  fetchCurrentUser: async () => {
    if (!get().token) return;
    try {
      const res = await authApi.getCurrentUser();
      localStorage.setItem('teschor_user', JSON.stringify(res.data));
      set({ user: res.data, isAuthenticated: true });
    } catch (e) {
      if (e.response?.status === 401) {
        get().logout();
      }
    }
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('teschor_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));
