import { api } from './api';

class RepositoryService {
  async getRepository(projectId) {
    return api.get(`/repository/${projectId}`);
  }
  async getFile(projectId, filePath) {
    return api.get(`/repository/${projectId}/file?path=${encodeURIComponent(filePath)}`);
  }
  async explainFile(filePath, content) {
    return api.post('/repository/explain', { filePath, content });
  }
  async reviewFile(filePath, content) {
    return api.post('/repository/review', { filePath, content });
  }
  async modifyFileWithAI(filePath, instruction) {
    return api.post('/repository/modify', { filePath, instruction });
  }
}

export const repositoryService = new RepositoryService();
