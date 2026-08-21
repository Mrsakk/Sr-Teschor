import api from '../api/client';

export const destinationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/destinations', { params });
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(`/destinations/${slug}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

export default destinationService;
