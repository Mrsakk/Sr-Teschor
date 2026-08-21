import api from '../api/client';

export const reviewService = {
  getAll: async (params = {}) => {
    const response = await api.get('/reviews', { params });
    return response.data;
  },

  getMyReviews: async () => {
    const response = await api.get('/my-reviews');
    return response.data;
  },

  submitReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  updateReview: async (id, data) => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  deleteReview: async (id) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  replyReview: async (id, data) => {
    const response = await api.post(`/reviews/${id}/reply`, data);
    return response.data;
  },
};

export default reviewService;
