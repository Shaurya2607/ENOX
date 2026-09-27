import { api } from './api';

class SecurityService {
  async getSecurityReport(projectId = 'proj-sentinel-iq') {
    return api.get(`/security/report?projectId=${projectId}`);
  }
  async runSecurityScan(projectId = 'proj-sentinel-iq') {
    return api.post('/security/scan', { projectId });
  }
  async fixFinding(findingId) {
    return api.post(`/security/fix/${findingId}`);
  }
  async ignoreFinding(findingId) {
    return api.post(`/security/ignore/${findingId}`);
  }
  async explainFinding(finding) {
    const res = await api.post('/security/explain', { finding });
    return res.explanation;
  }
}

export const securityService = new SecurityService();
