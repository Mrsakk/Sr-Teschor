import api from '../api/client';

export const bookingService = {
  getAll: async (params = {}) => {
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  create: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  updateStatus: async (id, statusData) => {
    const response = await api.put(`/bookings/${id}/status`, statusData);
    return response.data;
  },

  cancelBooking: async (id, reason = 'Cancelled by customer') => {
    const response = await api.put(`/bookings/${id}/status`, {
      status: 'cancelled',
      business_response_notes: reason,
    });
    return response.data;
  },
};

export default bookingService;
