import api from '../api/client';

export const businessService = {
  getAll: async (params = {}) => {
    const response = await api.get('/businesses', { params });
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(`/businesses/${slug}`);
    return response.data;
  },

  getMyBusinesses: async () => {
    const response = await api.get('/my-businesses');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/business/dashboard');
    return response.data;
  },
};

export default businessService;
