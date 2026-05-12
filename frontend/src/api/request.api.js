import api from './axios.js';

export const requestApi = {
  create: (data) => api.post('/requests', data).then((r) => r.data),
  list: (params) => api.get('/requests', { params }).then((r) => r.data),
  byId: (id) => api.get(`/requests/${id}`).then((r) => r.data),
  cancel: (id) => api.patch(`/requests/${id}/cancel`).then((r) => r.data),
  fulfill: (id) => api.patch(`/requests/${id}/fulfill`).then((r) => r.data),
  myMatches: () => api.get('/requests/donor/me').then((r) => r.data),
  accept: (matchId) =>
    api.patch(`/requests/match/${matchId}/accept`).then((r) => r.data),
  decline: (matchId) =>
    api.patch(`/requests/match/${matchId}/decline`).then((r) => r.data),
};
