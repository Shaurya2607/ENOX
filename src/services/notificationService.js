import { api } from './api';

class NotificationService {
  async getNotifications(category) {
    return api.get(`/notifications${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`);
  }
  async markAsRead(id) {
    return api.post(`/notifications/${id}/read`);
  }
  async markAllAsRead() {
    return api.post('/notifications/read-all');
  }
  async addNotification(item) {
    return api.post('/notifications', item);
  }
  async getActivities(category) {
    return api.get(`/activities${category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : ''}`);
  }
  async recordActivity(activity) {
    return api.post('/activities', activity);
  }
}

export const notificationService = new NotificationService();
