import api from './axios.js';

export const donorApi = {
  create: (data) => api.post('/donors', data).then((r) => r.data),
  me: () => api.get('/donors/me').then((r) => r.data),
  update: (data) => api.put('/donors/me', data).then((r) => r.data),
  setAvailability: (available) =>
    api.patch('/donors/me/availability', { available }).then((r) => r.data),
  myDonations: () => api.get('/donors/me/donations').then((r) => r.data),
  byId: (id) => api.get(`/donors/${id}`).then((r) => r.data),
};
