import { api, apiStream } from './api';

class WorkflowService {
  async getWorkflows() {
    return api.get('/workflows');
  }
  async getWorkflow(id) {
    return api.get(`/workflows/${id}`);
  }
  async executeWorkflow(id, onStepChange) {
    await apiStream(`/workflows/${id}/execute`, (evt) => {
      if (evt.type === 'step' && onStepChange) onStepChange(evt.nodeId, evt.status);
    });
    return true;
  }
  async saveWorkflow(workflow) {
    return api.post('/workflows', workflow);
  }
}

export const workflowService = new WorkflowService();
