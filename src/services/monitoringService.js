import { api } from './api';

class MonitoringService {
  async getMonitoringMetrics(range = '1H') {
    return api.get(`/monitoring/metrics?range=${range}`);
  }
  async getLiveStats() {
    return api.get('/monitoring/live');
  }
}

export const monitoringService = new MonitoringService();
