import { api, apiStream } from './api';

class DeploymentService {
  async getDeployments() {
    return api.get('/deployments');
  }
  async getLatestDeployment(projectId = 'SentinelIQ') {
    return api.get(`/deployments/latest?projectId=${encodeURIComponent(projectId)}`);
  }
  async triggerDeployment(project = 'SentinelIQ', onStageUpdate) {
    return apiStream(`/deployments/trigger?project=${encodeURIComponent(project)}`, (evt) => {
      if (evt.type === 'stage' && onStageUpdate) onStageUpdate(evt.index, evt.name, evt.status);
    });
  }
  async rollbackDeployment(id) {
    return api.post(`/deployments/${id}/rollback`);
  }
}

export const deploymentService = new DeploymentService();
