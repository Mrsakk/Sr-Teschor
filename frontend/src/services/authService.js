import api from '../api/client';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await api.post('/reset-password', data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await api.put('/user/password', data);
    return response.data;
  },

  updateSettings: async (settings) => {
    const response = await api.put('/user/settings', settings);
    return response.data;
  },
};

export default authService;
