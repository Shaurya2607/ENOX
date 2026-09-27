import { api, apiStream } from './api';

class AIService {
  async getAITasks() {
    return api.get('/ai/tasks');
  }
  async getAITask(id) {
    return api.get(`/ai/tasks/${id}`);
  }
  async getDocuments() {
    return api.get('/ai/documents');
  }
  async indexDocument(name, type, content) {
    return api.post('/ai/documents', { name, type, content });
  }
  async getPullRequest(id = 'PR-428') {
    return api.get(`/ai/pull-request?id=${id}`);
  }
  async createPullRequest(context) {
    return api.post('/ai/pull-request', context);
  }
  async acceptSuggestion(findingId) {
    return api.post('/ai/accept-suggestion', { findingId });
  }
  async queryProjectWithDocs(question, activeDocIds) {
    const res = await api.post('/ai/query', { question, activeDocIds });
    return res.answer;
  }
  async runParallelAgents(onUpdate) {
    await apiStream('/ai/run-parallel-agents', (evt) => {
      if (evt.type === 'update' && onUpdate) {
        const { type, ...update } = evt;
        onUpdate(update);
      }
    });
  }
}

export const aiService = new AIService();
