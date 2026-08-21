import api from '../api/client';

export const promotionService = {
  getAll: async () => {
    const response = await api.get('/promotions');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/promotions', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/promotions/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/promotions/${id}`);
    return response.data;
  },
};

export default promotionService;
