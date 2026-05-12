import api from './axios.js';

export const notificationApi = {
  list: () => api.get('/notifications').then((r) => r.data),
  markRead: (id) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data),
};
