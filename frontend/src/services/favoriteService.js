import api from '../api/client';

export const favoriteService = {
  getAll: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  toggle: async (type, id) => {
    const response = await api.post('/favorites/toggle', { type, id });
    return response.data;
  },
};

export default favoriteService;
