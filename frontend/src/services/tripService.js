import api from '../api/client';

export const tripService = {
  getAll: async () => {
    const response = await api.get('/trips');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  create: async (tripData) => {
    const response = await api.post('/trips', tripData);
    return response.data;
  },

  update: async (id, tripData) => {
    const response = await api.put(`/trips/${id}`, tripData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/trips/${id}`);
    return response.data;
  },

  addItem: async (tripId, itemData) => {
    const response = await api.post(`/trips/${tripId}/items`, itemData);
    return response.data;
  },

  removeItem: async (tripId, itemId) => {
    const response = await api.delete(`/trips/${tripId}/items/${itemId}`);
    return response.data;
  },
};

export default tripService;
