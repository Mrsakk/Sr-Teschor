import api from '../api/client';

export const userService = {
  getDashboardSummary: async () => {
    const response = await api.get('/user/dashboard');
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

  updateSettings: async (settings) => {
    const response = await api.put('/user/settings', settings);
    return response.data;
  },

  updatePassword: async (data) => {
    const response = await api.put('/user/password', data);
    return response.data;
  },
};

export default userService;
