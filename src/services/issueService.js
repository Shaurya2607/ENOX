import { api } from './api';

class IssueService {
  async getIssues(projectId) {
    return api.get(`/issues${projectId ? `?project=${encodeURIComponent(projectId)}` : ''}`);
  }
  async getIssue(id) {
    return api.get(`/issues/${id}`);
  }
  async updateIssue(id, updates) {
    return api.patch(`/issues/${id}`, updates);
  }
  async addComment(issueId, text, author = 'Alex Vance') {
    return api.post(`/issues/${issueId}/comments`, { text, author });
  }
  async resolveIssue(id) {
    return api.post(`/issues/${id}/resolve`);
  }
}

export const issueService = new IssueService();
