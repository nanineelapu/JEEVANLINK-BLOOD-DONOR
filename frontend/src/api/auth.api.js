import api from './axios.js';

export const authApi = {
  login: (data) => api.post('/auth/login', data).then((r) => r.data),
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  me: () => api.get('/users/me').then((r) => r.data),
};
