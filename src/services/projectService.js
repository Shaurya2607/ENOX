import { api } from './api';

class ProjectService {
  async getProjects() {
    return api.get('/projects');
  }
  async getProject(id) {
    return api.get(`/projects/${id}`);
  }
  async createProject(data) {
    return api.post('/projects', data);
  }
  async updateProject(id, updates) {
    return api.patch(`/projects/${id}`, updates);
  }
  async importRepository(repoUrl) {
    return api.post('/projects/import', { repoUrl });
  }
  async connectGitHub() {
    return api.post('/projects/connect-github');
  }
}

export const projectService = new ProjectService();
