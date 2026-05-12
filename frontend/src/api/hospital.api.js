import api from './axios.js';

export const hospitalApi = {
  create: (data) => api.post('/hospitals', data).then((r) => r.data),
  me: () => api.get('/hospitals/me').then((r) => r.data),
  update: (data) => api.put('/hospitals/me', data).then((r) => r.data),
  byId: (id) => api.get(`/hospitals/${id}`).then((r) => r.data),
  inventory: () => api.get('/inventory/me').then((r) => r.data),
  upsertInventory: (data) => api.post('/inventory', data).then((r) => r.data),
  addUnits: (id, units) =>
    api.patch(`/inventory/${id}/add`, { units }).then((r) => r.data),
  useUnits: (id, units) =>
    api.patch(`/inventory/${id}/use`, { units }).then((r) => r.data),
};
