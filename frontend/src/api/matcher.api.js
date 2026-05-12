import api from './axios.js';

export const matcherApi = {
  chat: (message) => api.post('/ai/chatbot', { message }).then((r) => r.data),
  eligibility: (donorId) =>
    api.post('/ai/eligibility-check', { donorId }).then((r) => r.data),
};
